// tests/i18n/lang-pick.test.js
const test = require('node:test');
const assert = require('node:assert');
const { pickLanguage } = require('../../assets/i18n/lang-pick.js');

const CODES = ['en','fi','sv','no','da','de','nl','fr','es','it','pl','pt','et','lv','lt'];
const ALIASES = { nb: 'no', nn: 'no' };

test('matches primary subtag, case-insensitive', () => {
  assert.strictEqual(pickLanguage(['de-AT','en'], CODES, ALIASES, null), 'de');
  assert.strictEqual(pickLanguage(['FI'], CODES, ALIASES, null), 'fi');
});

test('applies aliases (nb/nn -> no)', () => {
  assert.strictEqual(pickLanguage(['nb-NO'], CODES, ALIASES, null), 'no');
  assert.strictEqual(pickLanguage(['nn'], CODES, ALIASES, null), 'no');
});

test('remembered choice wins over browser languages', () => {
  assert.strictEqual(pickLanguage(['de'], CODES, ALIASES, 'fi'), 'fi');
});

test('ignores remembered choice that is not in registry', () => {
  assert.strictEqual(pickLanguage(['de'], CODES, ALIASES, 'zz'), 'de');
});

test('falls back to en when nothing matches or list empty', () => {
  assert.strictEqual(pickLanguage(['zz-ZZ'], CODES, ALIASES, null), 'en');
  assert.strictEqual(pickLanguage([], CODES, ALIASES, null), 'en');
  assert.strictEqual(pickLanguage(undefined, CODES, ALIASES, null), 'en');
});

test('picks first matching language in priority order', () => {
  assert.strictEqual(pickLanguage(['zz','lv','de'], CODES, ALIASES, null), 'lv');
});
