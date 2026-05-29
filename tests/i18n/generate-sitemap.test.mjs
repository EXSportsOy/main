// tests/i18n/generate-sitemap.test.mjs
import test from 'node:test';
import assert from 'node:assert';
import { buildUrlEntry } from '../../tools/generate-sitemap.mjs';

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
