const { test, expect } = require('@playwright/test');

// Explicit opt-in; never run live probes on pull requests. No privileged key.
test.skip(process.env.FEEDBACK_LIVE_API !== '1', 'Set FEEDBACK_LIVE_API=1 to check production');

test('published configuration, SDK files and Firestore access rules agree', async ({ request, baseURL }) => {
  test.setTimeout(90000);
  expect(baseURL).toBe('https://www.exsports.fi');
  const configResponse = await request.get('/feedback/feedback-config.js', { timeout: 20000 });
  expect(configResponse.status()).toBe(200);
  const config = await configResponse.text();
  const projectId = config.match(/projectId:\s*"([^"]+)"/)?.[1];
  const apiKey = config.match(/apiKey:\s*"([^"]+)"/)?.[1];
  // Refuse to probe any other project if published configuration changes unexpectedly.
  expect(projectId).toBe('exsports-verkkosivut');
  expect(apiKey).toMatch(/^AIza[\w-]{35}$/);

  // The pinned SDK files must still be served by the CDN.
  const script = await request.get('/feedback/feedback.js', { timeout: 20000 });
  expect(script.status()).toBe(200);
  const sdkUrls = [...new Set((await script.text()).match(/https:\/\/www\.gstatic\.com\/firebasejs\/[^"]+\.js/g))];
  expect(sdkUrls.length).toBeGreaterThan(0);
  for (const url of sdkUrls) {
    expect((await request.get(url, { timeout: 20000 })).status(), url).toBe(200);
  }

  const database = `projects/${projectId}/databases/(default)`;
  const collection = `https://firestore.googleapis.com/v1/${database}/documents/feedback`;
  const params = { key: apiKey };
  const headers = { Referer: 'https://www.exsports.fi/feedback/en/' };

  // Reading feedback from the browser must be denied. pageSize=1 never returns more than one row
  // even if the rules regressed, and the assertion fails before anything is logged.
  const list = await request.get(collection, { params: { ...params, pageSize: '1' }, headers, timeout: 20000 });
  expect(list.status(), 'Listing feedback must be denied').toBe(403);

  // Each probe violates one invariant. Stop on the first failure, without retries.
  // If production rules regress, a probe could be stored and trigger an email.
  // The CI marker identifies it for manual removal; no real personal data.
  const marker = `[CI validation probe ${new Date().toISOString()}]`;
  const str = (stringValue) => ({ stringValue });
  const cases = [
    { name: 'empty message', fields: { category: str('website'), app: str('website'), message: str(''), page_url: str(marker), status: str('new') } },
    { name: 'invalid category', fields: { category: str('ci_invalid_category'), app: str('website'), message: str(marker), status: str('new') } },
  ];
  for (const probe of cases) {
    // Same request shape as the browser SDK: a new document with a server timestamp.
    const name = `${database}/documents/feedback/ci-probe-${Date.now()}`;
    const response = await request.post(`https://firestore.googleapis.com/v1/${database}/documents:commit`, {
      params, headers, timeout: 20000,
      data: { writes: [{
        update: { name, fields: probe.fields },
        updateTransforms: [{ fieldPath: 'created_at', setToServerValue: 'REQUEST_TIME' }],
        currentDocument: { exists: false },
      }] },
    });
    expect(response.status(), `${probe.name} was unexpectedly accepted; inspect CI validation probe documents`).toBe(403);
    expect((await response.json()).error?.status).toBe('PERMISSION_DENIED');
  }
});
