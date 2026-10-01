import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { dirname, join } from 'node:path';
import { runInNewContext } from 'node:vm';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const ORIGIN = 'https://www.exsports.fi';
const registry = { window: {} };
runInNewContext(readFileSync(join(ROOT, 'assets/i18n/languages.js'), 'utf8'), registry);
const CODES = registry.window.EXS_LANGS.map(language => language.code);
const escapeXml = value => value.replaceAll('&', '&amp;').replaceAll('"', '&quot;').replaceAll('<', '&lt;');

export function buildUrlEntry(loc, alternates, xDefaultCode) {
  let links = '';
  for (const [code, href] of Object.entries(alternates)) {
    links += `\n    <xhtml:link rel="alternate" hreflang="${code}" href="${escapeXml(href)}" />`;
  }
  if (alternates[xDefaultCode]) {
    links += `\n    <xhtml:link rel="alternate" hreflang="x-default" href="${escapeXml(alternates[xDefaultCode])}" />`;
  }
  return `  <url>\n    <loc>${escapeXml(loc)}</loc>${links}\n  </url>`;
}

function indexable(file) {
  const path = join(ROOT, file);
  if (!existsSync(path)) return false;
  const html = readFileSync(path, 'utf8');
  return !/<meta\b[^>]*(?:http-equiv\s*=\s*["']refresh["']|content\s*=\s*["'][^"']*noindex)/i.test(html);
}

function groupEntries(section, file = 'index.html', rootLanguage = null, picker = false) {
  const prefix = section ? section + '/' : '';
  const alternates = {};
  for (const code of CODES) {
    const path = prefix + (code === rootLanguage ? '' : code + '/') + file;
    if (indexable(path)) alternates[code] = `${ORIGIN}/${path}`;
  }
  const entries = Object.values(alternates).map(href => buildUrlEntry(href, alternates, 'en'));
  if (picker && indexable(prefix + 'index.html')) {
    entries.unshift(buildUrlEntry(`${ORIGIN}/${prefix}`, alternates, 'en'));
  }
  return entries;
}

export function buildSitemap() {
  const entries = [];
  for (const section of ['', 'surveytools', 'shodia', 'heda', 'feedback', 'heda/user-guide', 'heda/release-notes']) {
    entries.push(...groupEntries(section, 'index.html', null, true));
  }
  for (const section of ['surveytools/user-guide', 'shodia/user-guide']) {
    entries.push(...groupEntries(section, 'index.html', 'en'));
  }
  for (const module of ['ctl-vcf', 'interpolation', 'shore-tank', 'unit-conversions', 'wedge']) {
    entries.push(...groupEntries('surveytools/user-guide', `modules/${module}.html`, 'en'));
  }
  for (const section of ['legal', 'heda/legal', 'shodia/legal']) {
    for (const doc of ['privacy_policy', 'disclaimer', 'delete']) {
      entries.push(...groupEntries(section, `${doc}.html`, section === 'legal' ? null : 'en'));
    }
  }
  for (const file of ['legal/imprint.html', 'legal/index.html', 'heda/legal/privacy_policy_index.html']) {
    if (indexable(file)) entries.push(buildUrlEntry(`${ORIGIN}/${file}`, {}, null));
  }
  return `<?xml version="1.0" encoding="UTF-8"?>\n` +
    `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">\n` +
    entries.join('\n') + '\n</urlset>\n';
}

if (process.argv[1] && pathToFileURL(process.argv[1]).href === import.meta.url) {
  const xml = buildSitemap();
  writeFileSync(join(ROOT, 'sitemap.xml'), xml);
  console.log(`sitemap.xml written with ${(xml.match(/<loc>/g) || []).length} URL entries`);
}
