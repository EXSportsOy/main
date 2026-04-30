// Heda — Sage palette, dark + light variants. The canonical brand.
// Every consumer reads `b.bg`, `b.text`, etc — same shape, different
// values per mode. `b.mode` is 'dark' | 'light'.

function makeSage(mode = 'dark') {
  if (mode === 'light') {
    return {
      id: 'sage', mode: 'light',
      name: 'Sage Calm', short: 'A',
      tagline: 'Quiet tracking. Honest patterns.',
      bg:        '#f3f1ea',           // warm paper
      bgRaised:  '#ebe9e1',
      bgCard:    '#ffffff',
      line:      'rgba(40,50,35,0.10)',
      text:      '#1c211e',           // near-black, warm
      textMute:  '#5e6559',
      textDim:   '#9aa097',
      accent:    '#5a6f4d',           // deeper sage for contrast on light
      accentSoft:'#cfd8c2',
      accentInk: '#f3f1ea',
      warm:      '#b08c4e',           // deeper sand
      danger:    '#a85a5a',           // deeper clay
      serif: '"Newsreader", Georgia, serif',
      sans: '"Inter Tight", "Inter", system-ui, sans-serif',
      mono: '"JetBrains Mono", ui-monospace, monospace',
    };
  }
  return {
    id: 'sage', mode: 'dark',
    name: 'Sage Calm', short: 'A',
    tagline: 'Quiet tracking. Honest patterns.',
    bg:        '#0f1311',
    bgRaised:  '#171c19',
    bgCard:    '#1c211e',
    line:      'rgba(220,225,210,0.08)',
    text:      '#e8eae3',
    textMute:  '#9aa097',
    textDim:   '#5e655d',
    accent:    '#a8b89a',
    accentSoft:'#3d4a36',
    accentInk: '#0f1311',
    warm:      '#d8c4a0',
    danger:    '#c89595',
    serif: '"Newsreader", Georgia, serif',
    sans: '"Inter Tight", "Inter", system-ui, sans-serif',
    mono: '"JetBrains Mono", ui-monospace, monospace',
  };
}

const HEDA_BRAND = makeSage('dark');
const HEDA_BRANDS = {
  sage: makeSage('dark'),
  sageLight: makeSage('light'),
};

window.HEDA_BRAND = HEDA_BRAND;
window.HEDA_BRANDS = HEDA_BRANDS;
window.makeSage = makeSage;
