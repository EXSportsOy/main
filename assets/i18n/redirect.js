// assets/i18n/redirect.js — include ONLY on picker index.html pages.
// Requires languages.js + lang-pick.js loaded first.
(function () {
  var params = new URLSearchParams(window.location.search);
  if (params.get('pick') === '1') return;            // user asked to see the picker
  var codes = (window.EXS_LANGS || []).map(function (l) { return l.code; });
  var aliases = window.EXS_LANG_ALIASES || {};
  var remembered = null;
  try { remembered = localStorage.getItem('exs-lang'); } catch (e) {}
  var langs = navigator.languages || [navigator.language || 'en'];
  var pick = window.EXS_pickLanguage(langs, codes, aliases, remembered);
  window.location.replace(pick + '/index.html');     // relative to the picker folder
})();
