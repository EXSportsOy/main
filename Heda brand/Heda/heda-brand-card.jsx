// Heda — brand presentation cards. One <BrandCard> per direction.
// Shows: logo lockup, mark variations, palette, type pairing, app icon.

function Swatch({ color, label, hex, ink = '#000' }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      <div style={{
        width: '100%', aspectRatio: '1.4 / 1', borderRadius: 6,
        background: color, border: '1px solid rgba(255,255,255,0.04)',
      }}/>
      <div style={{ fontSize: 10, color: ink, opacity: 0.85, fontFamily: 'inherit', letterSpacing: 0.2 }}>{label}</div>
      <div style={{ fontSize: 9, color: ink, opacity: 0.5, fontFamily: 'JetBrains Mono, monospace' }}>{hex}</div>
    </div>
  );
}

function BrandCard({ brand, width = 760, height = 1080 }) {
  const b = brand;
  const Mark = window.MarkAura;

  return (
    <div style={{
      width, height,
      background: b.bg,
      color: b.text,
      fontFamily: b.sans,
      padding: 56,
      display: 'flex', flexDirection: 'column', gap: 36,
      overflow: 'hidden',
      position: 'relative',
    }}>
      {/* corner meta */}
      <div style={{
        position: 'absolute', top: 24, right: 28,
        fontFamily: b.mono, fontSize: 10,
        color: b.textDim, letterSpacing: 0.5,
      }}>HEDA · DIRECTION {b.short}</div>

      {/* identity row */}
      <div>
        <div style={{ fontFamily: b.mono, fontSize: 11, letterSpacing: 1.5, color: b.accent, marginBottom: 14 }}>
          {b.name.toUpperCase()}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 18, marginBottom: 22 }}>
          <Mark size={88} color={b.accent} />
          <window.HedaWordmark size={88} color={b.text} font={b.sans} weight={500} tracking={-0.04}/>
        </div>
        <div style={{
          fontFamily: b.serif, fontSize: 28, fontWeight: 400,
          color: b.text, lineHeight: 1.25, maxWidth: 560,
          fontStyle: 'normal',
        }}>{b.tagline}</div>
      </div>

      <div style={{ height: 1, background: b.line }}/>

      {/* mark variations */}
      <div>
        <SectionLabel brand={b}>Mark</SectionLabel>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginTop: 14 }}>
          <MarkTile brand={b} label="On surface"  bg={b.bg}        color={b.accent} mark={mark}/>
          <MarkTile brand={b} label="On raised"   bg={b.bgCard}    color={b.text}   mark={mark}/>
          <MarkTile brand={b} label="On accent"   bg={b.accent}    color={b.accentInk} mark={mark}/>
          <MarkTile brand={b} label="Reversed"    bg={b.text}      color={b.bg}     mark={mark}/>
        </div>
      </div>

      {/* palette */}
      <div>
        <SectionLabel brand={b}>Palette</SectionLabel>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 12, marginTop: 14 }}>
          <Swatch color={b.bg}     label="Surface"   hex={b.bg}     ink={b.text}/>
          <Swatch color={b.bgCard} label="Raised"    hex={b.bgCard} ink={b.text}/>
          <Swatch color={b.accent} label="Accent"    hex={b.accent} ink={b.text}/>
          <Swatch color={b.warm}   label="Warm"      hex={b.warm}   ink={b.text}/>
          <Swatch color={b.danger} label="Migraine"  hex={b.danger} ink={b.text}/>
          <Swatch color={b.text}   label="Ink"       hex={b.text}   ink={b.text}/>
        </div>
      </div>

      {/* type */}
      <div>
        <SectionLabel brand={b}>Type</SectionLabel>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 28, marginTop: 14, alignItems: 'flex-start' }}>
          <div>
            <div style={{ fontFamily: b.mono, fontSize: 9, color: b.textDim, marginBottom: 6, letterSpacing: 0.5 }}>
              DISPLAY · {b.serif.split(',')[0].replace(/"/g, '')}
            </div>
            <div style={{ fontFamily: b.serif, fontSize: 56, lineHeight: 1.05, color: b.text, fontWeight: 400 }}>
              Aa
            </div>
            <div style={{ fontFamily: b.serif, fontSize: 16, color: b.textMute, marginTop: 8, lineHeight: 1.4 }}>
              The quiet record of a long week.
            </div>
          </div>
          <div>
            <div style={{ fontFamily: b.mono, fontSize: 9, color: b.textDim, marginBottom: 6, letterSpacing: 0.5 }}>
              UI · {b.sans.split(',')[0].replace(/"/g, '')}
            </div>
            <div style={{ fontFamily: b.sans, fontSize: 56, lineHeight: 1.05, color: b.text, fontWeight: 500, letterSpacing: '-0.03em' }}>
              Aa
            </div>
            <div style={{ fontFamily: b.sans, fontSize: 14, color: b.textMute, marginTop: 8, lineHeight: 1.45 }}>
              Headache · 13:17–15:17 · intensity 4/10
            </div>
          </div>
        </div>
      </div>

      {/* app icon row */}
      <div>
        <SectionLabel brand={b}>App icon</SectionLabel>
        <div style={{ display: 'flex', gap: 16, marginTop: 14, alignItems: 'flex-end' }}>
          <AppIcon brand={b} size={120} mark={mark}/>
          <AppIcon brand={b} size={84} mark={mark} variant="warm"/>
          <AppIcon brand={b} size={56} mark={mark}/>
          <AppIcon brand={b} size={36} mark={mark} variant="warm"/>
          <div style={{ marginLeft: 'auto', fontFamily: b.mono, fontSize: 10, color: b.textDim, letterSpacing: 0.5, textAlign: 'right' }}>
            Adaptive · 108×108<br/>Foreground · 72×72
          </div>
        </div>
      </div>
    </div>
  );
}

function SectionLabel({ brand, children }) {
  return (
    <div style={{
      fontFamily: brand.mono, fontSize: 10, letterSpacing: 1.4,
      color: brand.textMute, textTransform: 'uppercase',
    }}>{children}</div>
  );
}

function MarkTile({ brand, bg, color, label }) {
  const Mark = window.MarkAura;
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      <div style={{
        aspectRatio: '1 / 1', background: bg, borderRadius: 8,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        border: `1px solid ${brand.line}`,
      }}>
        <Mark size={52} color={color}/>
      </div>
      <div style={{ fontSize: 10, color: brand.textMute, fontFamily: brand.sans }}>{label}</div>
    </div>
  );
}

// App icon — adaptive style. Background tile + foreground mark.
function AppIcon({ brand, size = 96, variant = 'dark' }) {
  const Mark = window.MarkAura;
  const palettes = {
    dark: { bg: brand.bgCard, fg: brand.accent },
    warm: { bg: brand.warm,   fg: brand.bg },
    accent: { bg: brand.accent, fg: brand.bg },
  };
  const p = palettes[variant] || palettes.dark;
  const radius = size * 0.22;

  return (
    <div style={{
      width: size, height: size, borderRadius: radius,
      background: p.bg,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      position: 'relative', overflow: 'hidden',
      boxShadow: `0 ${size*0.05}px ${size*0.18}px rgba(0,0,0,0.35)`,
    }}>
      {/* subtle topo background */}
      <div style={{
        position: 'absolute', inset: 0, opacity: 0.18,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <window.HedaHeadTopo size={size * 1.4} color={p.fg}/>
      </div>
      <Mark size={size * 0.55} color={p.fg}/>
    </div>
  );
}

Object.assign(window, { BrandCard, AppIcon, SectionLabel });
