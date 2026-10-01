// tests/i18n/generate-sitemap.test.mjs
import test from 'node:test';
import assert from 'node:assert';
import { buildUrlEntry, buildSitemap } from '../../tools/generate-sitemap.mjs';

test('builds a url entry with hreflang alternates + x-default', () => {
  const xml = buildUrlEntry(
    'https://www.exsports.fi/',
    { en: 'https://www.exsports.fi/en/index.html',
      fi: 'https://www.exsports.fi/fi/index.html' },
    'en'
  );
  assert.match(xml, /<loc>https:\/\/www\.exsports\.fi\/<\/loc>/);
  assert.match(xml, /hreflang="fi" href="https:\/\/www\.exsports\.fi\/fi\/index\.html"/);
  assert.match(xml, /hreflang="x-default" href="https:\/\/www\.exsports\.fi\/en\/index\.html"/);
});

test('includes translated guides, legal documents and feedback without obsolete report redirects', () => {
  const xml = buildSitemap();
  for (const path of [
    'heda/user-guide/fi/index.html', 'heda/legal/fi/privacy_policy.html',
    'heda/legal/privacy_policy.html', 'feedback/fi/index.html',
    'shodia/user-guide/lt/index.html', 'shodia/legal/lt/disclaimer.html',
    'surveytools/user-guide/lt/modules/shore-tank.html',
    'surveytools/user-guide/modules/shore-tank.html',
  ]) {
    assert.ok(xml.includes(`<loc>https://www.exsports.fi/${path}</loc>`), path);
  }
  assert.ok(!xml.includes('report-bug.html'));
  assert.match(xml, /hreflang="en" href="https:\/\/www\.exsports\.fi\/heda\/legal\/privacy_policy.html"/);
});
