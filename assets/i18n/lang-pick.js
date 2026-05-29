// assets/i18n/lang-pick.js
(function (root) {
  function pickLanguage(browserLangs, codes, aliases, remembered) {
    if (remembered && codes.indexOf(remembered) !== -1) return remembered;
    var list = browserLangs || [];
    for (var i = 0; i < list.length; i++) {
      var code = String(list[i]).split('-')[0].toLowerCase();
      if (aliases && aliases[code]) code = aliases[code];
      if (codes.indexOf(code) !== -1) return code;
    }
    return 'en';
  }
  root.EXS_pickLanguage = pickLanguage;
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = { pickLanguage: pickLanguage };
  }
})(typeof window !== 'undefined' ? window : globalThis);
