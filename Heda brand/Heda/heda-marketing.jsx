// Heda — marketing assets. Play Store feature graphic, Play Store
// screenshots with restrained marketing copy, website hero, social posts,
// brand guidelines page.

// ── Play Store feature graphic 1024×500 ─────────────────────────
function FeatureGraphic({ brand, width = 1024, height = 500 }) {
  const b = brand;
  const Mark = window.MarkAura;
  return (
    <div style={{
      width, height, background: b.bg, color: b.text, fontFamily: b.sans,
      display: 'flex', alignItems: 'center', position: 'relative', overflow: 'hidden',
      padding: '0 80px', gap: 60,
    }}>
      {/* topo bg */}
      <div style={{ position: 'absolute', right: -100, top: -50, opacity: 0.1 }}>
        <window.HedaHeadTopo size={680} color={b.accent}/>
      </div>
      <div style={{ position: 'relative', zIndex: 1, flex: 1, maxWidth: 540 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 28 }}>
          <Mark size={56} color={b.accent}/>
          <window.HedaWordmark size={56} color={b.text} font={b.sans} tracking={-0.04} weight={500}/>
        </div>
        <div style={{ fontFamily: b.serif, fontSize: 56, lineHeight: 1.05, letterSpacing: '-0.02em', marginBottom: 20, fontWeight: 400 }}>
          A quiet diary for headache and migraine.
        </div>
        <div style={{ fontSize: 17, color: b.textMute, lineHeight: 1.5, maxWidth: 460 }}>
          Map your pain on a 3D head. See patterns across sleep, steps, and stress. Yours alone.
        </div>
      </div>
      <div style={{ position: 'relative', zIndex: 1, flexShrink: 0 }}>
        <window.HedaHead size={360} color={b.warm} pain="right" painColor={b.danger} aura/>
      </div>
    </div>
  );
}

// ── Play Store screenshot ─────────────────────────────────────
function PlayShot({ brand, headline, sub, children, width = 360, height = 720 }) {
  const b = brand;
  return (
    <div style={{
      width, height, background: b.bgRaised, color: b.text, fontFamily: b.sans,
      display: 'flex', flexDirection: 'column', overflow: 'hidden',
      borderRadius: 0,
    }}>
      <div style={{ padding: '36px 28px 22px' }}>
        <div style={{ fontFamily: b.serif, fontSize: 28, lineHeight: 1.1, letterSpacing: '-0.01em', marginBottom: 8, fontWeight: 400 }}>
          {headline}
        </div>
        <div style={{ fontSize: 13, color: b.textMute, lineHeight: 1.45 }}>{sub}</div>
      </div>
      <div style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'flex-start', position: 'relative' }}>
        <div style={{
          transform: 'scale(0.78)', transformOrigin: 'top center',
          marginTop: 0,
        }}>{children}</div>
      </div>
    </div>
  );
}

// ── Website hero ───────────────────────────────────────────────
function WebsiteHero({ brand, width = 1280, height = 800 }) {
  const b = brand;
  const Mark = window.MarkAura;
  return (
    <div style={{
      width, height, background: b.bg, color: b.text, fontFamily: b.sans,
      display: 'flex', flexDirection: 'column', position: 'relative', overflow: 'hidden',
    }}>
      {/* nav */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '28px 60px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <Mark size={28} color={b.text}/>
          <window.HedaWordmark size={22} color={b.text} font={b.sans} tracking={-0.03} weight={500}/>
        </div>
        <div style={{ display: 'flex', gap: 32, fontSize: 14, color: b.textMute }}>
          <span>Privacy</span><span>Doctors</span><span>Support</span>
        </div>
        <div style={{ padding: '10px 18px', borderRadius: 999, background: b.accent, color: b.accentInk, fontSize: 13, fontWeight: 500 }}>
          Get Heda
        </div>
      </div>

      {/* hero */}
      <div style={{ flex: 1, display: 'grid', gridTemplateColumns: '1.1fr 1fr', gap: 60, padding: '20px 80px', alignItems: 'center', position: 'relative' }}>
        <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, right: 0, display: 'flex', alignItems: 'center', justifyContent: 'flex-end', opacity: 0.08, pointerEvents: 'none' }}>
          <window.HedaHeadTopo size={760} color={b.accent}/>
        </div>
        <div style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ fontFamily: b.mono, fontSize: 11, letterSpacing: 2, color: b.accent, marginBottom: 24 }}>
            HEADACHE & MIGRAINE DIARY
          </div>
          <div style={{ fontFamily: b.serif, fontSize: 76, lineHeight: 1, letterSpacing: '-0.025em', marginBottom: 28, fontWeight: 400 }}>
            A quiet record of a long week.
          </div>
          <div style={{ fontSize: 18, color: b.textMute, lineHeight: 1.55, maxWidth: 520, marginBottom: 36 }}>
            Map pain on a 3D head. Find patterns in sleep, steps, and stress. Your data stays on your device.
          </div>
          <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
            <div style={{ padding: '14px 22px', borderRadius: 999, background: b.accent, color: b.accentInk, fontSize: 15, fontWeight: 500 }}>
              Get Heda on Google Play
            </div>
            <div style={{ padding: '14px 22px', borderRadius: 999, border: `1px solid ${b.line}`, color: b.text, fontSize: 15 }}>
              How it works
            </div>
          </div>
          <div style={{ marginTop: 36, display: 'flex', gap: 28, fontFamily: b.mono, fontSize: 11, color: b.textDim, letterSpacing: 1 }}>
            <span>· OFFLINE BY DEFAULT</span>
            <span>· OPEN SOURCE</span>
            <span>· NO ACCOUNT</span>
          </div>
        </div>

        <div style={{ position: 'relative', zIndex: 1, display: 'flex', justifyContent: 'center' }}>
          <window.HedaHead size={460} color={b.warm} pain="right" painColor={b.danger} aura/>
        </div>
      </div>
    </div>
  );
}

// ── Social square 1080×1080 ────────────────────────────────────
function SocialSquare({ brand, kind = 'quote', size = 600 }) {
  const b = brand;
  const Mark = window.MarkAura;
  if (kind === 'quote') {
    return (
      <div style={{
        width: size, height: size, background: b.bg, color: b.text,
        fontFamily: b.serif, padding: 56, position: 'relative', overflow: 'hidden',
        display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
      }}>
        <div style={{ position: 'absolute', right: -80, top: -80, opacity: 0.1 }}>
          <window.HedaHeadTopo size={520} color={b.accent}/>
        </div>
        <div style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: 10 }}>
          <Mark size={26} color={b.accent}/>
          <window.HedaWordmark size={20} color={b.text} font={b.sans} tracking={-0.03} weight={500}/>
        </div>
        <div style={{ position: 'relative', fontSize: 44, lineHeight: 1.15, fontWeight: 400, letterSpacing: '-0.02em' }}>
          Track quietly.<br/>Notice patterns.
        </div>
        <div style={{ position: 'relative', fontFamily: b.mono, fontSize: 11, color: b.textDim, letterSpacing: 1.5 }}>
          HEDA · ON GOOGLE PLAY
        </div>
      </div>
    );
  }
  // mark variant — big aura
  return (
    <div style={{
      width: size, height: size, background: b.accent, color: b.accentInk,
      fontFamily: b.sans, padding: 56, position: 'relative', overflow: 'hidden',
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 24,
    }}>
      <Mark size={180} color={b.accentInk}/>
      <window.HedaWordmark size={68} color={b.accentInk} font={b.sans} tracking={-0.04} weight={500}/>
      <div style={{ fontFamily: b.serif, fontSize: 22, fontStyle: 'italic' }}>{b.tagline}</div>
    </div>
  );
}

// ── Brand guidelines page ──────────────────────────────────────
function BrandGuidelines({ brand, width = 900, height = 1280 }) {
  const b = brand;
  const Mark = window.MarkAura;
  return (
    <div style={{
      width, height, background: b.bg, color: b.text, fontFamily: b.sans,
      padding: 60, overflow: 'hidden',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 36 }}>
        <window.HedaLockup size={32} color={b.text} font={b.sans}/>
        <div style={{ fontFamily: b.mono, fontSize: 10, letterSpacing: 1.4, color: b.textDim }}>
          BRAND GUIDELINES · v1
        </div>
      </div>

      <div style={{ fontFamily: b.serif, fontSize: 56, lineHeight: 1.05, letterSpacing: '-0.02em', marginBottom: 18, fontWeight: 400, maxWidth: 700 }}>
        How to use the Heda mark.
      </div>
      <div style={{ fontSize: 14, color: b.textMute, lineHeight: 1.55, maxWidth: 620, marginBottom: 36 }}>
        Heda is a quiet brand. Treat it gently — generous space around the mark, restrained colour, and only small bursts of accent.
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 28, marginBottom: 36 }}>
        <Rule b={b} num="01" title="Clear space">
          <div style={{ background: b.bgCard, borderRadius: 10, padding: 20, display: 'flex', justifyContent: 'center', alignItems: 'center', height: 130, position: 'relative', border: `1px dashed ${b.line}` }}>
            <Mark size={52} color={b.accent}/>
            <div style={{ position: 'absolute', top: 10, left: 10, fontFamily: b.mono, fontSize: 9, color: b.textDim }}>≥ 1× mark height</div>
          </div>
        </Rule>
        <Rule b={b} num="02" title="Minimum size">
          <div style={{ background: b.bgCard, borderRadius: 10, padding: 20, display: 'flex', gap: 20, alignItems: 'center', justifyContent: 'center', height: 130 }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
              <Mark size={24} color={b.text}/>
              <span style={{ fontFamily: b.mono, fontSize: 9, color: b.textDim }}>24px UI</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
              <Mark size={36} color={b.text}/>
              <span style={{ fontFamily: b.mono, fontSize: 9, color: b.textDim }}>36px favicon</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
              <Mark size={64} color={b.text}/>
              <span style={{ fontFamily: b.mono, fontSize: 9, color: b.textDim }}>64px print</span>
            </div>
          </div>
        </Rule>
      </div>

      <div style={{ marginBottom: 30 }}>
        <window.SectionLabel brand={b}>Voice</window.SectionLabel>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 28, marginTop: 14 }}>
          <div style={{ background: b.bgCard, borderRadius: 10, padding: 20, border: `1px solid ${b.line}` }}>
            <div style={{ fontFamily: b.mono, fontSize: 9, color: '#9aac90', letterSpacing: 1, marginBottom: 8 }}>WE SAY</div>
            <ul style={{ margin: 0, paddingLeft: 18, fontSize: 13, color: b.text, lineHeight: 1.7 }}>
              <li>Track quietly.</li>
              <li>One event today.</li>
              <li>A pattern from the last 90 days.</li>
              <li>Yours alone.</li>
            </ul>
          </div>
          <div style={{ background: b.bgCard, borderRadius: 10, padding: 20, border: `1px solid ${b.line}` }}>
            <div style={{ fontFamily: b.mono, fontSize: 9, color: '#bd9c9c', letterSpacing: 1, marginBottom: 8 }}>WE DON'T</div>
            <ul style={{ margin: 0, paddingLeft: 18, fontSize: 13, color: b.textMute, lineHeight: 1.7 }}>
              <li>Take control of your migraines!</li>
              <li>Your AI-powered headache coach</li>
              <li>Unlock pain-free days</li>
              <li>Exclamation marks</li>
            </ul>
          </div>
        </div>
      </div>

      <div style={{ marginBottom: 24 }}>
        <window.SectionLabel brand={b}>Don'ts</window.SectionLabel>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14, marginTop: 14 }}>
          {[
            { label: 'No gradients on the mark', render: () => (
              <div style={{ width: 60, height: 60, borderRadius: 30, background: `linear-gradient(135deg, ${b.accent}, ${b.danger})`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Mark size={36} color="#fff"/>
              </div>
            )},
            { label: 'No rotation', render: () => (<div style={{ transform: 'rotate(20deg)' }}><Mark size={56} color={b.accent}/></div>)},
            { label: 'No outline-only', render: () => (
              <svg width="60" height="60" viewBox="0 0 64 64" fill="none"><circle cx="32" cy="32" r="28" stroke={b.text} strokeWidth="1"/><Mark size={40} color="transparent"/></svg>
            )},
            { label: 'No stretching', render: () => (<div style={{ transform: 'scale(1.6, 0.8)' }}><Mark size={56} color={b.accent}/></div>)},
          ].map((d, i) => (
            <div key={i} style={{ background: b.bgCard, borderRadius: 10, padding: 14, border: `1px solid ${b.line}`, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10, height: 130, justifyContent: 'center' }}>
              <div style={{ height: 60, display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
                {d.render()}
                <div style={{ position: 'absolute', top: -2, right: -2, width: 18, height: 18, borderRadius: 9, background: b.danger, color: b.bg, fontSize: 12, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>×</div>
              </div>
              <div style={{ fontSize: 11, color: b.textMute, textAlign: 'center', lineHeight: 1.3 }}>{d.label}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function Rule({ b, num, title, children }) {
  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 10 }}>
        <span style={{ fontFamily: b.mono, fontSize: 10, color: b.textDim, letterSpacing: 1 }}>{num}</span>
        <span style={{ fontFamily: b.serif, fontSize: 18 }}>{title}</span>
      </div>
      {children}
    </div>
  );
}

Object.assign(window, { FeatureGraphic, PlayShot, WebsiteHero, SocialSquare, BrandGuidelines });
