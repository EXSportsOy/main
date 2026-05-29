# Site internationalization (i18n) — design

**Date:** 2026-05-29
**Site:** exsports.fi (static, GitHub Pages, no build step)
**Goal:** Add Nordic + the most common European languages alongside English, with a
convention that lets us add **one language at a time** with minimal, purely-additive
changes. Unify the whole site on the pattern `heda/` already uses.

---

## 1. Decision summary

- **Method:** real per-language HTML pages (the `heda` pattern), **not** runtime
  JSON string-loading. Chosen for a static marketing site because it is
  crawlable/SEO-friendly, works without JS, has no flash of untranslated content,
  needs no build step, and is already proven in the repo.
- **Scope:** whole site — root landing, `surveytools/`, `shodia/`, `legal/` — all
  adopt one convention. `heda/` already conforms and only swaps in shared scripts.
- **Translations:** machine translations drafted into each page (owner reviews
  before/after publish).
- **Language set (initial registry, 15):** EN, FI, SV, NO, DA, DE, NL, FR, ES, IT,
  PL, PT + Baltics ET, LV, LT — heda's 12 plus the three Baltic languages (Shodia is
  marketed in Estonia, Latvia, and Lithuania). Covers Nordics, Baltics, and the most
  common European languages. More (e.g. Icelandic, Czech) are a one-line registry add
  later.

---

## 2. Convention (site-wide)

Each section's `index.html` is a **branded language picker** that auto-redirects by
browser language. Each language is a **subfolder containing a complete HTML page**.

```
/index.html              picker (auto-redirect)            /styles.css (shared)
/en/index.html           English landing (canonical default)
/fi/  /sv/  /no/  /da/  /de/  /nl/  /fr/  /es/  /it/  /pl/  /pt/   (index.html each)

/surveytools/index.html  picker
/surveytools/en/index.html  /surveytools/<lang>/ …

/shodia/index.html       picker
/shodia/en/index.html  /shodia/<lang>/ …

/legal/                  privacy_policy / disclaimer / delete / report-bug
/legal/en/<page>.html  /legal/<lang>/<page>.html …
/legal/imprint.html      EXCEPTION — stays inline DE/EN/FI tab page (legal need)

/heda/                   already conforms; retrofit to shared scripts (optional)
```

**Rationale:** adding a language is additive — a new subfolder + one registry line,
never editing existing pages. Redirect logic lives only on picker `index.html`
files, so content pages can never enter a redirect loop; a visitor who lands
directly on `/de/` simply stays there.

### Picker behavior
- On a picker page, `redirect.js` reads `navigator.languages`, maps the primary
  subtag (`de-AT` → `de`; `nb`/`nn` → `no`) to a registry code, and
  `location.replace()`s to that subfolder. Unknown → English.
- A remembered manual choice (`localStorage`) takes precedence over browser language.
- `?pick=1` (or arriving via the in-page switcher) suppresses auto-redirect so the
  picker is viewable.
- `<noscript>` block lists every language as plain links, so no-JS users and
  crawlers always see real, followable content.

---

## 3. Shared components (`/assets/i18n/`)

The DRY core — built once, consumed everywhere.

### `languages.js` — single source of truth
```js
window.EXS_LANGS = [
  { code: 'en', en: 'English',    native: 'English' },
  { code: 'fi', en: 'Finnish',    native: 'Suomi' },
  { code: 'sv', en: 'Swedish',    native: 'Svenska' },
  { code: 'no', en: 'Norwegian',  native: 'Norsk (bokmål)' },
  { code: 'da', en: 'Danish',     native: 'Dansk' },
  { code: 'de', en: 'German',     native: 'Deutsch' },
  { code: 'nl', en: 'Dutch',      native: 'Nederlands' },
  { code: 'fr', en: 'French',     native: 'Français' },
  { code: 'es', en: 'Spanish',    native: 'Español' },
  { code: 'it', en: 'Italian',    native: 'Italiano' },
  { code: 'pl', en: 'Polish',     native: 'Polski' },
  { code: 'pt', en: 'Portuguese', native: 'Português' },
  { code: 'et', en: 'Estonian',   native: 'Eesti' },
  { code: 'lv', en: 'Latvian',    native: 'Latviešu' },
  { code: 'lt', en: 'Lithuanian', native: 'Lietuvių' },
];
// alias map for browser subtags that fold into a registry code
window.EXS_LANG_ALIASES = { nb: 'no', nn: 'no' };
```
Adding a language = add one entry here (plus the translated subfolder).

### `redirect.js`
Factors out the `navigator.languages` detection currently inlined/duplicated in
heda. Included on **picker pages only**. Honors `localStorage` choice and `?pick=1`;
falls back to English.

### `switcher.js`
Renders, from the registry:
- the **picker grid** on `index.html` pages, and
- a compact **language switcher** in each content page's nav (sets the
  `localStorage` choice and navigates to the sibling `<lang>/` page).

Each language is `available` only if its subfolder exists for that section; the
switcher/picker marks the rest accordingly (or omits them) so the same registry can
serve sections that are at different translation stages.

### SEO glue (per page)
- Correct `<html lang="xx">`.
- `<link rel="alternate" hreflang="xx" href="…">` for every available sibling,
  plus `hreflang="x-default"` → English.
- Generated `sitemap.xml` listing all language URLs.

---

## 4. "Add a new language" workflow (the minimal-change goal)

To add language `xx` to a section:
1. Copy `en/` → `xx/`; machine-translate the visible strings in the HTML; set
   `<html lang="xx">` and the page's hreflang alternates.
2. If `xx` is new to the whole site, add one line to `languages.js`.
3. Done — pickers, switchers, hreflang, and sitemap pick it up automatically.

No framework, no build step; deploys as static files on GitHub Pages.

---

## 5. Rollout (default order — each increment ships independently)

- **Increment 0 — Foundation + pilot:** build `languages.js`, `redirect.js`,
  `switcher.js`; convert the **root landing** to picker + `en/` + **`fi/`** only,
  end-to-end (hreflang, noscript, switcher, sitemap). Validates the approach on two
  languages before scaling.
- **Increment 1:** root landing → remaining 13 languages.
- **Increment 2:** `surveytools/` landing → full pattern.
- **Increment 3:** `shodia/` landing → full pattern.
- **Increment 4:** `legal/` pages (privacy_policy, disclaimer, delete, report-bug)
  → `<lang>/` subfolders. `imprint.html` stays the inline DE/EN/FI exception.
- **Increment 5 (optional):** retrofit `heda/` to consume the shared scripts and
  registry, removing its duplicated inline redirect JS.

Within every increment, each language is a self-contained
copy → translate → (register) unit.

---

## 6. Risks / notes

- **Root SEO:** the bare domain `/` becomes a picker rather than English content.
  Mitigated by the `<noscript>` link list, `hreflang` (incl. `x-default`), and
  `sitemap.xml`. The picker is branded real content, not an empty shell.
- **Machine-translation quality:** drafts are owner-reviewed; legal text
  (privacy/disclaimer) deserves extra scrutiny — `imprint.html` is intentionally
  left as the hand-maintained inline exception.
- **URL change for existing links:** previously English-only pages move from
  `/index.html`-as-content to `/en/index.html`. The picker at `/` redirects, so old
  bookmarks to `/` keep working; deep links to specific pages should be checked.
- **Translation duplication:** layout changes touch N language files. Acceptable for
  these low-churn pages; shared CSS (`/styles.css`) already centralizes styling.
