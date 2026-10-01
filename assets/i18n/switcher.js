// assets/i18n/switcher.js — requires languages.js loaded first.
// Two mounts (either may be absent on a given page):
//   <div data-i18n-picker data-base="."></div>   -> full grid (picker pages)
//   <div data-i18n-switcher data-current="en"></div> -> compact nav dropdown
(function () {
  var langs = window.EXS_LANGS || [];

  function remember(code) { try { localStorage.setItem('exs-lang', code); } catch (e) {} }

  // Preserve deep links when changing language. Some legacy English documents
  // live at the section root; data-base/data-file also support nested modules.
  function languageUrl(mount, code, defaultBase, defaultFile) {
    var base = mount.getAttribute('data-base') || defaultBase;
    var file = mount.getAttribute('data-file') || defaultFile;
    var rootLang = mount.getAttribute('data-root-lang');
    var target = new URL(base + '/' + (code === rootLang ? '' : code + '/') + file, window.location.href);
    target.search = window.location.search;
    target.searchParams.delete('pick');
    target.hash = window.location.hash;
    return target.href;
  }

  // The page each language links to within its <lang>/ folder.
  // Defaults to index.html (section landings); legal pickers set data-file.
  var grid = document.querySelector('[data-i18n-picker]');
  if (grid) {
    langs.forEach(function (l) {
      var a = document.createElement('a');
      a.className = 'lang-option';
      a.href = languageUrl(grid, l.code, '.', 'index.html');
      a.addEventListener('click', function () { remember(l.code); });
      a.innerHTML =
        '<span class="lang-name">' + l.en + '</span>' +
        '<span class="lang-native">' + l.native + '</span>';
      grid.appendChild(a);
    });
  }

  var sw = document.querySelector('[data-i18n-switcher]');
  if (sw) {
    var current = sw.getAttribute('data-current') || 'en';
    var sel = document.createElement('select');
    sel.className = 'lang-switch';
    var language = langs.find(function (l) { return l.code === current; });
    sel.setAttribute('aria-label', language ? language.label : 'Language');
    langs.forEach(function (l) {
      var o = document.createElement('option');
      o.value = l.code; o.textContent = l.native;
      o.setAttribute('lang', l.code);
      if (l.code === current) o.selected = true;
      sel.appendChild(o);
    });
    sel.addEventListener('change', function () {
      remember(sel.value);
      // Navigate to the sibling-language copy of the CURRENT page, keeping its
      // filename (index.html for landings, e.g. privacy_policy.html for legal).
      var here = window.location.pathname.split('/').pop() || 'index.html';
      window.location.href = languageUrl(sw, sel.value, '..', here);
    });
    sw.appendChild(sel);
  }
})();
