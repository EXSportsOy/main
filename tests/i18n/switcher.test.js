const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const path = require('node:path');

function render(url, attrs, picker = false) {
  function element(attributes = {}) {
    return {
      attributes, children: [], events: {},
      getAttribute(name) { return this.attributes[name] || null; },
      setAttribute(name, value) { this.attributes[name] = value; },
      appendChild(child) { this.children.push(child); },
      addEventListener(name, action) { this.events[name] = action; },
    };
  }
  const mount = element(attrs);
  let location = new URL(url);
  const context = {
    window: { location: {
      get href() { return location.href; },
      set href(value) { location = new URL(value, location); },
      get pathname() { return location.pathname; },
      get search() { return location.search; },
      get hash() { return location.hash; },
    } }, URL,
    document: {
      documentElement: { lang: attrs['data-current'] || 'en' },
      querySelector: selector => selector === (picker ? '[data-i18n-picker]' : '[data-i18n-switcher]') ? mount : null,
      createElement: () => element(),
    },
    localStorage: { setItem() {} },
  };
  for (const name of ['languages.js', 'switcher.js']) {
    vm.runInNewContext(fs.readFileSync(path.join(__dirname, '../../assets/i18n', name), 'utf8'), context);
  }
  return { mount, context };
}

test('language change keeps feedback app and bug view', () => {
  const { mount, context } = render('https://www.exsports.fi/feedback/fi/?app=heda#bug', { 'data-current': 'fi' });
  const select = mount.children[0];
  select.value = 'de'; select.events.change();
  assert.equal(context.window.location.href, 'https://www.exsports.fi/feedback/de/index.html?app=heda#bug');
  assert.equal(select.attributes['aria-label'], 'Kieli');
});

test('nested guide module switches to the equivalent English root document', () => {
  const { mount, context } = render('https://www.exsports.fi/surveytools/user-guide/fi/modules/wedge.html#example', {
    'data-current': 'fi', 'data-base': '/surveytools/user-guide',
    'data-root-lang': 'en', 'data-file': 'modules/wedge.html',
  });
  const select = mount.children[0];
  select.value = 'en'; select.events.change();
  assert.equal(context.window.location.href, 'https://www.exsports.fi/surveytools/user-guide/modules/wedge.html#example');
});

test('picker keeps deep-link context but removes the picker-only flag', () => {
  const { mount } = render('https://www.exsports.fi/feedback/?pick=1&app=shodia#bug', { 'data-base': '.' }, true);
  assert.equal(mount.children[1].href, 'https://www.exsports.fi/feedback/fi/index.html?app=shodia#bug');
});

test('each registered language has a translated switcher label', () => {
  const { context } = render('https://www.exsports.fi/en/', { 'data-current': 'en' });
  for (const lang of context.window.EXS_LANGS) assert.ok(lang.label, lang.code);
});
