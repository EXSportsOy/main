// tools/generate-sitemap.mjs
import { existsSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const ROOT = dirname(fileURLToPath(import.meta.url)) + '/..';
const ORIGIN = 'https://www.exsports.fi';

// Sections whose pickers live at <section>/index.html ('' = site root).
const SECTIONS = ['', 'surveytools', 'shodia', 'heda'];
const CODES = ['en','fi','sv','no','da','de','nl','fr','es','it','pl','pt','et','lv','lt'];

// Legal docs live at legal/<lang>/<doc>.html (imprint.html is the inline exception).
const LEGAL_DIR = 'legal';
const LEGAL_DOCS = ['privacy_policy', 'disclaimer', 'delete', 'report-bug'];

export function buildUrlEntry(loc, alternates, xDefaultCode) {
  let links = '';
  for (const [code, href] of Object.entries(alternates)) {
    links += `\n    <xhtml:link rel="alternate" hreflang="${code}" href="${href}" />`;
  }
  if (alternates[xDefaultCode]) {
    links += `\n    <xhtml:link rel="alternate" hreflang="x-default" href="${alternates[xDefaultCode]}" />`;
  }
  return `  <url>\n    <loc>${loc}</loc>${links}\n  </url>`;
}

function sectionEntries(section) {
  const base = section ? `/${section}` : '';
  const dirAbs = section ? join(ROOT, section) : ROOT;
  const alternates = {};
  for (const code of CODES) {
    if (existsSync(join(dirAbs, code, 'index.html'))) {
      alternates[code] = `${ORIGIN}${base}/${code}/index.html`;
    }
  }
  if (Object.keys(alternates).length === 0) {
    return existsSync(join(dirAbs, 'index.html'))
      ? [buildUrlEntry(`${ORIGIN}${base}/`, {}, null)]
      : [];
  }
  const xDefault = alternates.en ? 'en' : Object.keys(alternates)[0];
  const entries = [buildUrlEntry(`${ORIGIN}${base}/`, alternates, xDefault)];
  for (const href of Object.values(alternates)) {
    entries.push(buildUrlEntry(href, alternates, xDefault));
  }
  return entries;
}

// One url entry per existing legal/<lang>/<doc>.html, with hreflang alternates
// across the languages that have that document.
function legalEntries() {
  const entries = [];
  for (const doc of LEGAL_DOCS) {
    const alternates = {};
    for (const code of CODES) {
      if (existsSync(join(ROOT, LEGAL_DIR, code, `${doc}.html`))) {
        alternates[code] = `${ORIGIN}/${LEGAL_DIR}/${code}/${doc}.html`;
      }
    }
    if (Object.keys(alternates).length === 0) continue;
    const xDefault = alternates.en ? 'en' : Object.keys(alternates)[0];
    for (const href of Object.values(alternates)) {
      entries.push(buildUrlEntry(href, alternates, xDefault));
    }
  }
  return entries;
}

function main() {
  const urls = [...SECTIONS.flatMap(sectionEntries), ...legalEntries()];
  const xml =
    `<?xml version="1.0" encoding="UTF-8"?>\n` +
    `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" ` +
    `xmlns:xhtml="http://www.w3.org/1999/xhtml">\n` +
    urls.join('\n') + `\n</urlset>\n`;
  writeFileSync(join(ROOT, 'sitemap.xml'), xml);
  console.log(`sitemap.xml written with ${urls.length} url entries`);
}

// Run only when invoked directly, not when imported by tests.
if (process.argv[1] && process.argv[1].endsWith('generate-sitemap.mjs')) main();
