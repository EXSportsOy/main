// Keep the static page copy in its own language before the feedback SDK loads.
import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { runInNewContext } from 'node:vm';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const context = { window: {} };
runInNewContext(readFileSync(join(root, 'feedback/feedback-i18n.js'), 'utf8'), context);
const escape = value => value.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;');

for (const [language, dictionary] of Object.entries(context.window.FEEDBACK_I18N)) {
  const file = join(root, 'feedback', language, 'index.html');
  let html = readFileSync(file, 'utf8');
  // Translate text-only elements. Attribute targets keep their child content.
  html = html.replace(/<([a-z][\w-]*)\b(?![^>]*data-i18n-attr=)([^>]*\sdata-i18n="([^"]+)"[^>]*)>([\s\S]*?)<\/\1>/gi,
    (match, tag, attrs, key) => {
      if (/data-i18n-attr=/.test(attrs)) return match;
      if (!(key in dictionary)) throw new Error(`${language}: missing ${key}`);
      return `<${tag}${attrs}>${escape(dictionary[key])}</${tag}>`;
    });
  html = html.replace(/<([a-z][\w-]*)\b([^<>]*)>/gi, (match, tag, attrs) => {
    const values = Object.fromEntries([...attrs.matchAll(/([\w-]+)="([^"]*)"/g)].map(m => [m[1], m[2]]));
    const key = values['data-i18n-ph'] || (values['data-i18n-attr'] && values['data-i18n']);
    const attr = values['data-i18n-ph'] ? 'placeholder' : values['data-i18n-attr'];
    if (!key) return match;
    if (!(key in dictionary)) throw new Error(`${language}: missing ${key}`);
    const replacement = `${attr}="${escape(dictionary[key])}"`;
    const pattern = new RegExp(`\\s${attr}="[^"]*"`);
    attrs = pattern.test(attrs) ? attrs.replace(pattern, ' ' + replacement) : attrs.replace(/\/?$/, ' ' + replacement + (attrs.endsWith('/') ? '/' : ''));
    return `<${tag}${attrs}>`;
  });
  html = html.replace(/(<span\b[^>]*data-i18n-html="mt_notice"[^>]*>)[\s\S]*?(<\/span>)/,
    (_, start, end) => start + dictionary.mt_notice + end);
  if (language !== 'en') html = html.replace('data-mt-notice hidden', 'data-mt-notice');
  writeFileSync(file, html);
}
