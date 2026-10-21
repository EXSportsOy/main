const { test: base, expect } = require('@playwright/test');
const { readFileSync } = require('node:fs');
const path = require('node:path');

// Exercise the real browser code and the pinned Firebase SDK, but never send a form
// to a server. The SDK files are served from the npm package of the same version,
// so the tests do not depend on the CDN being reachable.
const sdkDir = path.dirname(require.resolve('firebase/package.json'));
const sdkVersion = require('firebase/package.json').version;
const feedbackSource = readFileSync(path.join(__dirname, '../../feedback/feedback.js'), 'utf8');

// Firestore REST values → plain JavaScript values.
function decodeValue(value) {
  if ('stringValue' in value) return value.stringValue;
  if ('integerValue' in value) return Number(value.integerValue);
  if ('doubleValue' in value) return value.doubleValue;
  if ('booleanValue' in value) return value.booleanValue;
  if ('nullValue' in value) return null;
  if ('mapValue' in value) return decodeFields(value.mapValue.fields || {});
  throw new Error(`Unexpected Firestore value ${JSON.stringify(value)}`);
}
function decodeFields(fields) {
  return Object.fromEntries(Object.entries(fields).map(([key, value]) => [key, decodeValue(value)]));
}

const test = base.extend({
  backend: async ({ context }, use) => {
    const backend = { requests: [], status: 200, unexpected: [] };
    await context.route('**/*', async (route) => {
      const request = route.request();
      const url = new URL(request.url());
      const sdkFile = url.pathname.match(/^\/firebasejs\/([^/]+)\/(firebase-[\w-]+\.js)$/);
      if (url.hostname === 'www.gstatic.com' && sdkFile && sdkFile[1] === sdkVersion) {
        await route.fulfill({ contentType: 'text/javascript', body: readFileSync(path.join(sdkDir, sdkFile[2])) });
      } else if (url.pathname === '/feedback/feedback-config.js') {
        // App Check talks to Google services; it is disabled for browser tests.
        const response = await route.fetch();
        const body = (await response.text()).replace(/APP_CHECK_SITE_KEY:\s*"[^"]*"/, 'APP_CHECK_SITE_KEY: ""');
        await route.fulfill({ response, body });
      } else if (request.method() === 'POST' && url.hostname === 'firestore.googleapis.com' && url.pathname.endsWith('/documents:commit')) {
        backend.requests.push({ url: request.url(), headers: request.headers(), body: request.postDataJSON() });
        await route.fulfill({
          status: backend.status,
          contentType: 'application/json',
          body: JSON.stringify(backend.status === 200
            ? { writeResults: [{ updateTime: new Date().toISOString() }], commitTime: new Date().toISOString() }
            : { error: { code: backend.status, message: 'Test service unavailable', status: 'UNAVAILABLE' } }),
        });
      } else if (!['GET', 'HEAD'].includes(request.method()) || /^(firestore|firebase[\w-]*)\.googleapis\.com$/.test(url.hostname) || url.hostname === 'www.gstatic.com') {
        backend.unexpected.push(`${request.method()} ${url.origin}${url.pathname}`);
        await route.abort();
      } else {
        await route.continue();
      }
    });
    await use(backend);
    expect(backend.unexpected, 'Unexpected network calls were blocked').toEqual([]);
  },
});

test.beforeEach(async ({ page, backend, baseURL }) => {
  const errors = [];
  page.on('pageerror', (error) => errors.push(error.message));
  page.on('response', (response) => {
    const url = new URL(response.url());
    if (url.origin === new URL(baseURL).origin && /\.(js|css)$/.test(url.pathname) && !response.ok()) {
      errors.push(`Asset ${response.status()}: ${url.pathname}`);
    }
  });
  page.on('requestfailed', (request) => {
    if (['script', 'stylesheet'].includes(request.resourceType())) {
      errors.push(`Failed ${request.resourceType()}: ${new URL(request.url()).pathname}`);
    }
  });
  // Keep resource checks attached to each page, including submission error tests.
  page.testErrors = errors;
});

test.afterEach(async ({ page }) => {
  expect(page.testErrors, 'Page JavaScript and styles must load without errors').toEqual([]);
});

async function open(page, language = 'en', suffix = '') {
  const response = await page.goto(`/feedback/${language}/${suffix}`);
  expect(response.status()).toBe(200);
  // Stars are created by feedback.js only after the external SDK has loaded.
  await expect(page.locator('#view-website [data-rating] button')).toHaveCount(5);
}

async function expectSubmission(page, backend, expected, absent = []) {
  await expect(page.locator('#view-done')).toBeVisible();
  expect(backend.requests).toHaveLength(1);
  const sent = backend.requests[0];
  const config = await page.evaluate(() => window.FEEDBACK_CONFIG.FIREBASE);
  const database = `projects/${config.projectId}/databases/(default)`;
  expect(sent.url.split('?')[0]).toBe(`https://firestore.googleapis.com/v1/${database}/documents:commit`);
  expect(sent.body.writes).toHaveLength(1);
  const write = sent.body.writes[0];
  // A new document with a server-generated id; it must not overwrite an existing one.
  expect(write.update.name).toMatch(new RegExp(`^${database.replace(/[()]/g, '\\$&')}/documents/feedback/[A-Za-z0-9]{20}$`));
  expect(write.currentDocument).toEqual({ exists: false });
  expect(write.updateTransforms).toEqual([{ fieldPath: 'created_at', setToServerValue: 'REQUEST_TIME' }]);
  const row = decodeFields(write.update.fields);
  expect(row).toMatchObject({ ...expected, status: 'new' });
  expect(row.page_url).toBe(page.url());
  expect(row.user_agent).toBeTruthy();
  for (const key of ['company', 'created_at', ...absent]) expect(row).not.toHaveProperty(key);
}

test('feedback.js loads the Firebase SDK version the tests use', () => {
  const versions = [...feedbackSource.matchAll(/gstatic\.com\/firebasejs\/([^/]+)\//g)].map((m) => m[1]);
  expect(versions.length).toBeGreaterThan(0);
  expect(new Set(versions)).toEqual(new Set([sdkVersion]));
});

test('feedback configuration is filled in', async ({ page, backend }) => {
  await open(page);
  const config = await page.evaluate(() => window.FEEDBACK_CONFIG.FIREBASE);
  expect(config.projectId).toBe('exsports-verkkosivut');
  for (const key of ['apiKey', 'authDomain', 'projectId', 'appId']) {
    expect(config[key], key).toBeTruthy();
    expect(config[key], key).not.toMatch(/^YOUR-/);
  }
  expect(backend.requests).toHaveLength(0);
});

for (const language of ['en', 'fi']) {
  test(`${language}: website navigation, validation and submission`, async ({ page, backend }) => {
    await open(page, language);
    await page.locator('[data-goto="view-website"]').click();
    const form = page.locator('form[data-category="website"]');
    await form.locator('[type="submit"]').click();
    await expect(form.locator('[name="message"]')).toHaveAttribute('aria-invalid', 'true');
    expect(backend.requests).toHaveLength(0);
    await form.locator('[name="message"]').fill('  CI browser test: clear navigation.  ');
    await form.locator('[name="email"]').fill('invalid-address');
    await form.locator('[type="submit"]').click();
    await expect(form.locator('[name="email"]')).toHaveAttribute('aria-invalid', 'true');
    expect(backend.requests).toHaveLength(0);
    await form.locator('[name="email"]').fill('');
    await form.locator('[data-rating] button').nth(3).click();
    await form.locator('[type="submit"]').click();
    await expectSubmission(page, backend, {
      category: 'website', app: 'website', lang: language,
      message: 'CI browser test: clear navigation.', rating: 4,
    }, ['email']);
  });
}

test('app selection is carried into quick feedback', async ({ page, backend }) => {
  await open(page);
  await page.locator('[data-goto="view-app"]').click();
  await page.locator('[data-app="shodia"][data-goto]').click();
  await page.locator('[data-goto="view-app-general"]').click();
  const form = page.locator('form[data-category="program_general"]');
  await form.locator('[name="message"]').fill('CI browser test: app selection.');
  await form.locator('[type="submit"]').click();
  await expectSubmission(page, backend, {
    category: 'program_general', app: 'shodia', lang: 'en',
    message: 'CI browser test: app selection.',
  }, ['rating', 'email', 'bug_title', 'severity', 'steps']);
});

test('bug deep link preserves app and structured details', async ({ page, backend }) => {
  await open(page, 'en', '?app=heda#bug');
  const form = page.locator('form[data-category="program_bug"]');
  await expect(form).toBeVisible();
  await form.locator('[name="bug_title"]').fill('CI browser test');
  await form.locator('[name="steps"]').fill('Open the report');
  await form.locator('[name="expected"]').fill('Report appears');
  await form.locator('[name="actual"]').fill('Blank screen');
  await form.locator('[name="environment"]').fill('Chromium test');
  await form.locator('[name="severity"]').selectOption('high');
  await form.locator('[type="submit"]').click();
  await expectSubmission(page, backend, {
    category: 'program_bug', app: 'heda', lang: 'en',
    bug_title: 'CI browser test', steps: 'Open the report', severity: 'high',
    expected: 'Report appears', actual: 'Blank screen', environment: 'Chromium test',
    message: 'CI browser test\nSteps: Open the report\nExpected: Report appears\nActual: Blank screen',
  }, ['rating', 'email']);
});

test('failed submission retains the message and allows retry', async ({ page, backend }) => {
  await open(page, 'en', '?app=website');
  const form = page.locator('form[data-category="website"]');
  backend.status = 503;
  await form.locator('[name="message"]').fill('CI browser test: retry.');
  await form.locator('[type="submit"]').click();
  await expect(form.locator('[data-form-error]')).toBeVisible();
  await expect(page.locator('#view-done')).not.toBeVisible();
  await expect(form.locator('[name="message"]')).toHaveValue('CI browser test: retry.');
  await expect(form.locator('[type="submit"]')).toBeEnabled();
  expect(backend.requests).toHaveLength(1);
  backend.status = 200;
  await form.locator('[type="submit"]').click();
  await expect(page.locator('#view-done')).toBeVisible();
  expect(backend.requests).toHaveLength(2);
});

test('honeypot blocks automated submissions', async ({ page, backend }) => {
  await open(page, 'en', '?app=website');
  const form = page.locator('form[data-category="website"]');
  await form.locator('[name="company"]').evaluate((input) => { input.value = 'Test bot'; });
  await form.locator('[name="message"]').fill('CI browser test: honeypot.');
  await form.locator('[type="submit"]').click();
  await expect(page.locator('#view-done')).toBeVisible();
  expect(backend.requests).toHaveLength(0);
});

test('changing language keeps the selected app and bug-report view', async ({ page, backend }) => {
  await open(page, 'fi', '?app=heda#bug');
  await expect(page.locator('#view-app-bug')).toBeVisible();
  await expect(page.locator('#view-app-bug')).toHaveAttribute('aria-label', 'Bugiraportti');
  await page.getByRole('combobox', { name: 'Kieli', exact: true }).selectOption('de');
  await expect(page).toHaveURL(/\/feedback\/de\/index\.html\?app=heda#bug$/);
  await expect(page.locator('#view-app-bug')).toBeVisible();
  await expect(page.locator('#view-app-bug [data-app-label]')).toHaveText('Heda');
  await expect(page.locator('#view-app-bug')).toHaveAttribute('aria-label', 'Fehlerbericht');
  expect(backend.requests).toHaveLength(0);
});

test('changing language also preserves an app selected through the form', async ({ page, backend }) => {
  await open(page);
  await page.locator('[data-goto="view-app"]').click();
  await page.locator('[data-app="shodia"][data-goto]').click();
  await page.locator('[data-goto="view-app-general"]').click();
  await page.getByRole('combobox', { name: 'Language', exact: true }).selectOption('fi');
  await expect(page).toHaveURL(/\/feedback\/fi\/index\.html\?app=shodia#general$/);
  await expect(page.locator('#view-app-general')).toBeVisible();
  await expect(page.locator('#view-app-general [data-app-label]')).toHaveText('Shodia');
  expect(backend.requests).toHaveLength(0);
});

test('direct Finnish homepage links stay Finnish despite a remembered English choice', async ({ page, backend }) => {
  await page.addInitScript(() => localStorage.setItem('exs-lang', 'en'));
  await page.goto('/fi/index.html');
  await page.locator('a.app--survey').click();
  await expect(page).toHaveURL(/\/surveytools\/fi\/index\.html$/);
  await page.locator('a[href="/legal/fi/privacy_policy.html"]').click();
  await expect(page).toHaveURL(/\/legal\/fi\/privacy_policy\.html$/);
  expect(backend.requests).toHaveLength(0);
});

test('a translated calculation guide switches language without losing the module', async ({ page }) => {
  await page.goto('/surveytools/user-guide/fi/modules/wedge.html');
  await page.getByRole('combobox', { name: 'Kieli', exact: true }).selectOption('de');
  await expect(page).toHaveURL(/\/surveytools\/user-guide\/de\/modules\/wedge\.html$/);
  await expect(page.locator('html')).toHaveAttribute('lang', 'de');
  await page.getByRole('combobox', { name: 'Sprache', exact: true }).selectOption('en');
  await expect(page).toHaveURL(/\/surveytools\/user-guide\/modules\/wedge\.html$/);
  await expect(page.locator('html')).toHaveAttribute('lang', /^en(?:-GB)?$/);
});

test('Shodia privacy switches between a translated page and the original English URL', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/shodia/legal/fi/privacy_policy.html');
  await page.getByRole('combobox', { name: 'Kieli', exact: true }).selectOption('en');
  await expect(page).toHaveURL(/\/shodia\/legal\/privacy_policy\.html$/);
  await page.getByRole('combobox', { name: 'Language', exact: true }).selectOption('pt');
  await expect(page).toHaveURL(/\/shodia\/legal\/pt\/privacy_policy\.html$/);
  await expect(page.locator('html')).toHaveAttribute('lang', 'pt');
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});
