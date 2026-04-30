// Heda — redesigned app screens. Uses brand tokens passed in as `b`.
// Built to live inside <AndroidDevice> frames (390×844-ish viewport).
// Quiet, meditative, low-stimulus. Generous white space. No emoji.

const SCREEN_W = 390;
const SCREEN_H = 780; // content area inside AndroidDevice (above nav)

// ── Shared bits ────────────────────────────────────────────────
function StatusRow({ b }) {
  return (
    <div style={{
      height: 32, padding: '0 22px',
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      fontFamily: b.sans, fontSize: 13, color: b.text, fontWeight: 500,
    }}>
      <span>9:30</span>
      <div style={{ display: 'flex', gap: 5, alignItems: 'center', opacity: 0.85 }}>
        <span style={{ fontSize: 11 }}>•••</span>
        <span style={{ fontSize: 11 }}>◢</span>
        <span style={{ fontSize: 11, fontFeatureSettings: '"tnum"' }}>62</span>
      </div>
    </div>
  );
}

function NavBar({ b, active }) {
  const items = [
    { id: 'cal',  label: 'Calendar' },
    { id: 'ana',  label: 'Analysis' },
    { id: 'rep',  label: 'Reports'  },
    { id: 'set',  label: 'Settings' },
  ];
  const Mark = window.MarkAura;
  return (
    <div style={{
      borderTop: `1px solid ${b.line}`,
      background: b.bg,
      padding: '10px 6px 14px',
      display: 'flex', justifyContent: 'space-around',
    }}>
      {items.map((it) => {
        const on = it.id === active;
        return (
          <div key={it.id} style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
            color: on ? b.accent : b.textMute,
            fontFamily: b.sans, fontSize: 10, letterSpacing: 0.3,
          }}>
            <NavIcon id={it.id} on={on} b={b}/>
            <span style={{ fontWeight: on ? 500 : 400 }}>{it.label}</span>
          </div>
        );
      })}
    </div>
  );
}

function NavIcon({ id, on, b }) {
  const c = on ? b.accent : b.textMute;
  const sw = 1.4;
  const common = { fill: 'none', stroke: c, strokeWidth: sw, strokeLinecap: 'round', strokeLinejoin: 'round' };
  if (id === 'cal') return (
    <svg width="22" height="22" viewBox="0 0 24 24"><rect x="3.5" y="5" width="17" height="15" rx="2" {...common}/><path d="M3.5 9h17M8 3v3M16 3v3" {...common}/></svg>
  );
  if (id === 'ana') return (
    <svg width="22" height="22" viewBox="0 0 24 24"><path d="M4 17l4-6 3 3 5-8 4 6" {...common}/></svg>
  );
  if (id === 'rep') return (
    <svg width="22" height="22" viewBox="0 0 24 24"><path d="M5 7h14M5 12h14M5 17h9" {...common}/></svg>
  );
  return (
    <svg width="22" height="22" viewBox="0 0 24 24"><circle cx="12" cy="12" r="3.2" {...common}/><path d="M12 3v2M12 19v2M3 12h2M19 12h2M5.5 5.5l1.5 1.5M17 17l1.5 1.5M5.5 18.5L7 17M17 7l1.5-1.5" {...common}/></svg>
  );
}

function ScreenShell({ b, children, nav = 'cal' }) {
  return (
    <div style={{
      width: SCREEN_W, height: SCREEN_H,
      background: b.bg, color: b.text, fontFamily: b.sans,
      display: 'flex', flexDirection: 'column', overflow: 'hidden',
    }}>
      <StatusRow b={b}/>
      <div style={{ flex: 1, overflow: 'hidden' }}>{children}</div>
      <NavBar b={b} active={nav}/>
    </div>
  );
}

// ── Screen: Calendar / Today ───────────────────────────────────
function ScreenToday({ b }) {
  return (
    <ScreenShell b={b} nav="cal">
      <div style={{ padding: '20px 22px 0' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
          <window.HedaLockup mark="aura" size={26} color={b.text} font={b.sans}/>
          <div style={{ width: 32, height: 32, borderRadius: 16, border: `1px solid ${b.line}`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: b.textMute, fontSize: 14 }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 21l-4.3-4.3M11 18a7 7 0 1 1 0-14 7 7 0 0 1 0 14z"/></svg>
          </div>
        </div>

        {/* Month strip */}
        <div style={{ fontFamily: b.mono, fontSize: 10, letterSpacing: 1.3, color: b.textDim, marginBottom: 8 }}>APRIL 2026</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 4, marginBottom: 24 }}>
          {['M','T','W','T','F','S','S'].map((d, i) => (
            <div key={i} style={{ fontSize: 10, color: b.textDim, textAlign: 'center', fontFamily: b.mono }}>{d}</div>
          ))}
          {Array.from({length: 21}).map((_, i) => {
            const day = 6 + i;
            const intensity = [0,2,0,0,1,0,3,0,0,2,0,0,0,4,0,0,1,0,2,5,2][i] || 0;
            const isToday = day === 26;
            const dot = intensity > 0;
            const dotColor = intensity >= 4 ? b.danger : b.accent;
            return (
              <div key={i} style={{
                aspectRatio: '1', display: 'flex', flexDirection: 'column',
                alignItems: 'center', justifyContent: 'center',
                fontSize: 12, color: isToday ? b.accentInk : (dot ? b.text : b.textDim),
                background: isToday ? b.accent : 'transparent',
                borderRadius: 6, position: 'relative',
                fontWeight: isToday ? 600 : 400,
              }}>
                {day}
                {dot && !isToday && (
                  <div style={{ width: 4, height: 4, borderRadius: 2, background: dotColor, marginTop: 2, opacity: 0.3 + intensity * 0.14 }}/>
                )}
              </div>
            );
          })}
        </div>

        {/* Today */}
        <div style={{ fontFamily: b.serif, fontSize: 26, lineHeight: 1.15, fontWeight: 400, marginBottom: 4 }}>Sunday, 26 April</div>
        <div style={{ fontFamily: b.mono, fontSize: 10, color: b.textDim, letterSpacing: 1, marginBottom: 18 }}>TODAY</div>

        {/* Event card */}
        <div style={{
          background: b.bgCard, borderRadius: 14, padding: 18,
          border: `1px solid ${b.line}`,
          display: 'flex', gap: 14, alignItems: 'flex-start',
        }}>
          <div style={{ width: 6, height: 6, borderRadius: 3, background: b.accent, marginTop: 8, flexShrink: 0 }}/>
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 4 }}>
              <span style={{ fontSize: 16, fontWeight: 500 }}>Headache</span>
              <span style={{ fontSize: 11, color: b.textDim, fontFamily: b.mono }}>4/10</span>
            </div>
            <div style={{ fontSize: 13, color: b.textMute, marginBottom: 10 }}>13:17 — 15:17 · 2h</div>
            <IntensityBar b={b} value={4} max={10}/>
          </div>
        </div>
        <div style={{ marginTop: 12, fontSize: 12, color: b.textDim, textAlign: 'center', fontFamily: b.serif, fontStyle: 'italic' }}>
          One event today.
        </div>
      </div>

      {/* Quick add — bottom */}
      <div style={{ position: 'absolute', left: 22, right: 22, bottom: 90, display: 'flex', gap: 10 }}>
        <button style={{
          flex: 1, height: 52, borderRadius: 26, border: 'none',
          background: b.accent, color: b.accentInk,
          fontFamily: b.sans, fontSize: 15, fontWeight: 500,
          letterSpacing: '-0.01em',
        }}>Quick add</button>
        <button style={{
          width: 52, height: 52, borderRadius: 26,
          background: 'transparent', color: b.text,
          border: `1px solid ${b.line}`, fontSize: 22, lineHeight: 1, fontWeight: 300,
        }}>+</button>
      </div>
    </ScreenShell>
  );
}

function IntensityBar({ b, value, max = 10 }) {
  return (
    <div style={{ display: 'flex', gap: 2 }}>
      {Array.from({length: max}).map((_, i) => (
        <div key={i} style={{
          flex: 1, height: 4, borderRadius: 2,
          background: i < value ? b.accent : b.line,
          opacity: i < value ? (0.4 + (i / max) * 0.6) : 1,
        }}/>
      ))}
    </div>
  );
}

// ── Screen: Log Event ──────────────────────────────────────────
function ScreenLogEvent({ b }) {
  const [type, setType] = React.useState('headache');
  const [intensity, setIntensity] = React.useState(4);
  return (
    <ScreenShell b={b} nav="cal">
      <div style={{ padding: '12px 22px 0', height: '100%', overflow: 'auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 22 }}>
          <button style={{ background: 'none', border: 'none', color: b.text, fontSize: 18, padding: 0, cursor: 'pointer' }}>←</button>
          <div style={{ fontFamily: b.serif, fontSize: 22, fontWeight: 400 }}>Log event</div>
        </div>

        {/* Type selector — segmented */}
        <div style={{ fontFamily: b.mono, fontSize: 10, letterSpacing: 1.2, color: b.textDim, marginBottom: 8 }}>TYPE</div>
        <div style={{
          display: 'grid', gridTemplateColumns: '1fr 1fr',
          background: b.bgCard, borderRadius: 12, padding: 4, marginBottom: 22,
          border: `1px solid ${b.line}`,
        }}>
          {['headache','migraine'].map((t) => {
            const on = type === t;
            return (
              <button key={t} onClick={() => setType(t)} style={{
                padding: '11px 0', borderRadius: 9, border: 'none',
                background: on ? b.accent : 'transparent',
                color: on ? b.accentInk : b.textMute,
                fontFamily: b.sans, fontSize: 14, fontWeight: on ? 500 : 400,
                cursor: 'pointer',
              }}>{t.charAt(0).toUpperCase() + t.slice(1)}</button>
            );
          })}
        </div>

        {/* Date / time row */}
        <div style={{ display: 'flex', gap: 10, marginBottom: 22 }}>
          <ChipBtn b={b} icon="cal">Sun · 26 Apr</ChipBtn>
          <ChipBtn b={b}>13:17</ChipBtn>
          <span style={{ alignSelf: 'center', color: b.textDim }}>—</span>
          <ChipBtn b={b}>15:17</ChipBtn>
        </div>

        {/* Pain area — head */}
        <div style={{ fontFamily: b.mono, fontSize: 10, letterSpacing: 1.2, color: b.textDim, marginBottom: 8 }}>PAIN AREA</div>
        <div style={{ fontSize: 12, color: b.textMute, marginBottom: 10 }}>
          Paint with finger. Two fingers to rotate.
        </div>
        <div style={{
          background: b.bgCard, borderRadius: 14, padding: 12,
          border: `1px solid ${b.line}`,
          display: 'flex', justifyContent: 'center', alignItems: 'center',
          marginBottom: 18, position: 'relative',
        }}>
          <window.HedaHead size={240} color={b.warm} pain={type === 'migraine' ? 'right' : 'temple'} painColor={b.danger} aura={false}/>
          {/* rotation hint */}
          <div style={{
            position: 'absolute', bottom: 12, right: 12,
            fontFamily: b.mono, fontSize: 9, color: b.textDim, letterSpacing: 0.6,
          }}>3D · CC BY 4.0</div>
        </div>

        {/* Intensity */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 10 }}>
          <div style={{ fontFamily: b.mono, fontSize: 10, letterSpacing: 1.2, color: b.textDim }}>INTENSITY</div>
          <div style={{ fontFamily: b.serif, fontSize: 20 }}>{intensity}<span style={{ color: b.textDim, fontSize: 13 }}>/10</span></div>
        </div>
        <IntensitySlider b={b} value={intensity} onChange={setIntensity}/>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: b.textDim, fontFamily: b.mono, marginTop: 6 }}>
          <span>BARELY</span><span>MILD</span><span>MODERATE</span><span>SEVERE</span>
        </div>

        <div style={{ height: 80 }}/>
      </div>
    </ScreenShell>
  );
}

function ChipBtn({ b, icon, children }) {
  return (
    <button style={{
      padding: '9px 14px', borderRadius: 999,
      background: 'transparent', border: `1px solid ${b.line}`,
      color: b.text, fontFamily: b.sans, fontSize: 13,
      display: 'inline-flex', alignItems: 'center', gap: 6,
      cursor: 'pointer',
    }}>
      {icon === 'cal' && (
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 9h18M8 3v4M16 3v4"/></svg>
      )}
      {children}
    </button>
  );
}

function IntensitySlider({ b, value, onChange }) {
  return (
    <div style={{ position: 'relative', height: 24, display: 'flex', alignItems: 'center' }}>
      <div style={{ position: 'absolute', left: 0, right: 0, height: 4, borderRadius: 2, background: b.line }}/>
      <div style={{ position: 'absolute', left: 0, width: `${(value/10)*100}%`, height: 4, borderRadius: 2, background: b.accent }}/>
      <div style={{ position: 'absolute', left: `calc(${(value/10)*100}% - 10px)`, width: 20, height: 20, borderRadius: 10, background: b.text, border: `2px solid ${b.accent}` }}/>
    </div>
  );
}

// ── Screen: Analysis ───────────────────────────────────────────
function ScreenAnalysis({ b }) {
  return (
    <ScreenShell b={b} nav="ana">
      <div style={{ padding: '20px 22px 0', height: '100%', overflow: 'auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 22 }}>
          <window.HedaLockup mark="aura" size={26} color={b.text} font={b.sans}/>
        </div>
        <div style={{ fontFamily: b.serif, fontSize: 28, fontWeight: 400, marginBottom: 4 }}>Analysis</div>
        <div style={{ fontSize: 13, color: b.textMute, marginBottom: 20 }}>The last seven days, in numbers.</div>

        {/* Tab strip */}
        <div style={{ display: 'flex', gap: 24, borderBottom: `1px solid ${b.line}`, marginBottom: 20 }}>
          <Tab b={b} active>Statistics</Tab>
          <Tab b={b}>Correlations</Tab>
        </div>

        <StatCard b={b} label="Average intensity" value="4.3" unit="/5" caption="Daily weighted · 7-day window">
          <Sparkline b={b} data={[0,0,3,0,4,0,0,0,3,4,0,4,5]} />
        </StatCard>

        <StatCard b={b} label="Time in pain" value="8.0" unit="h" caption="Rolling 7-day total">
          <Sparkline b={b} data={[0,0,1,1,2,2,2,3,3,3,4,4,5]} type="area"/>
        </StatCard>

        <StatCard b={b} label="Attacks" value="7" unit="" caption="Rolling 30-day total">
          <Sparkline b={b} data={[1,1,2,2,2,3,3,3,3,4,5,6,7]} type="area"/>
        </StatCard>
        <div style={{ height: 30 }}/>
      </div>
    </ScreenShell>
  );
}

function Tab({ b, active, children }) {
  return (
    <div style={{
      paddingBottom: 10, position: 'relative',
      color: active ? b.text : b.textMute,
      fontSize: 14, fontWeight: active ? 500 : 400, fontFamily: b.sans,
    }}>
      {children}
      {active && <div style={{ position: 'absolute', left: 0, right: 0, bottom: -1, height: 2, background: b.accent }}/>}
    </div>
  );
}

function StatCard({ b, label, value, unit, caption, children }) {
  return (
    <div style={{
      background: b.bgCard, borderRadius: 14, padding: 18, marginBottom: 14,
      border: `1px solid ${b.line}`,
    }}>
      <div style={{ fontFamily: b.mono, fontSize: 10, color: b.textDim, letterSpacing: 1, marginBottom: 8, textTransform: 'uppercase' }}>{label}</div>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, marginBottom: 4 }}>
        <span style={{ fontFamily: b.serif, fontSize: 36, fontWeight: 400, lineHeight: 1, letterSpacing: '-0.01em' }}>{value}</span>
        <span style={{ fontSize: 14, color: b.textMute }}>{unit}</span>
      </div>
      <div style={{ fontSize: 11, color: b.textDim, marginBottom: 14 }}>{caption}</div>
      {children}
    </div>
  );
}

function Sparkline({ b, data, type = 'line' }) {
  const W = 300, H = 56;
  const max = Math.max(...data);
  const pts = data.map((v, i) => [(i/(data.length-1)) * W, H - (v/max) * (H - 4) - 2]);
  const d = pts.map(([x,y], i) => `${i===0?'M':'L'} ${x} ${y}`).join(' ');
  return (
    <svg width="100%" viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none">
      {type === 'area' && (
        <path d={`${d} L ${W} ${H} L 0 ${H} Z`} fill={b.accent} opacity="0.12"/>
      )}
      <path d={d} fill="none" stroke={b.accent} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      <circle cx={pts[pts.length-1][0]} cy={pts[pts.length-1][1]} r="3" fill={b.accent}/>
    </svg>
  );
}

// ── Screen: Reports ────────────────────────────────────────────
function ScreenReports({ b }) {
  const slices = [
    { color: '#7faa6a', label: 'No events', value: 23 },
    { color: '#e0c574', label: 'Headache', value: 2 },
    { color: b.danger, label: 'Migraine', value: 5 },
  ];
  const total = slices.reduce((s, x) => s + x.value, 0);
  let cum = 0;
  const radius = 60, cx = 70, cy = 70;
  return (
    <ScreenShell b={b} nav="rep">
      <div style={{ padding: '20px 22px 0', height: '100%', overflow: 'auto' }}>
        <div style={{ marginBottom: 22 }}>
          <window.HedaLockup mark="aura" size={26} color={b.text} font={b.sans}/>
        </div>
        <div style={{ fontFamily: b.serif, fontSize: 28, fontWeight: 400, marginBottom: 4 }}>Reports</div>
        <div style={{ fontSize: 13, color: b.textMute, marginBottom: 20 }}>Share with your doctor.</div>

        <div style={{ display: 'flex', gap: 24, borderBottom: `1px solid ${b.line}`, marginBottom: 22 }}>
          <Tab b={b} active>Monthly</Tab>
          <Tab b={b}>Daily</Tab>
        </div>

        <div style={{ fontFamily: b.mono, fontSize: 10, letterSpacing: 1.2, color: b.textDim, marginBottom: 8 }}>PERIOD</div>
        <div style={{
          padding: '14px 16px', borderRadius: 12, border: `1px solid ${b.line}`,
          marginBottom: 20, fontSize: 14, color: b.text,
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        }}>
          <span>30 days · April 2026</span>
          <span style={{ color: b.textDim }}>▾</span>
        </div>

        <div style={{
          background: b.bgCard, borderRadius: 14, padding: 18, marginBottom: 22,
          border: `1px solid ${b.line}`,
          display: 'flex', gap: 18, alignItems: 'center',
        }}>
          <svg width="140" height="140" viewBox="0 0 140 140">
            {slices.map((s, i) => {
              const angle = (s.value / total) * 360;
              const startAngle = (cum / total) * 360 - 90;
              const endAngle = startAngle + angle;
              const start = polar(cx, cy, radius, startAngle);
              const end = polar(cx, cy, radius, endAngle);
              const large = angle > 180 ? 1 : 0;
              const path = `M ${cx} ${cy} L ${start.x} ${start.y} A ${radius} ${radius} 0 ${large} 1 ${end.x} ${end.y} Z`;
              cum += s.value;
              return <path key={i} d={path} fill={s.color} opacity="0.85"/>;
            })}
            <circle cx={cx} cy={cy} r="28" fill={b.bgCard}/>
            <text x={cx} y={cy + 5} textAnchor="middle" fontSize="14" fill={b.text} fontFamily={b.serif}>April</text>
          </svg>
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 10 }}>
            {slices.map((s, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12 }}>
                <div style={{ width: 8, height: 8, borderRadius: 4, background: s.color }}/>
                <span style={{ flex: 1, color: b.text }}>{s.label}</span>
                <span style={{ color: b.textMute, fontFamily: b.mono }}>{s.value}/30</span>
              </div>
            ))}
          </div>
        </div>

        <ExportRow b={b} primary>Export PDF</ExportRow>
        <ExportRow b={b}>Export CSV</ExportRow>
        <ExportRow b={b}>Export Health Connect data</ExportRow>
      </div>
    </ScreenShell>
  );
}

function polar(cx, cy, r, deg) {
  const a = (deg) * Math.PI / 180;
  return { x: cx + r * Math.cos(a), y: cy + r * Math.sin(a) };
}

function ExportRow({ b, primary, children }) {
  return (
    <div style={{
      padding: '14px 18px', borderRadius: 12,
      border: `1px solid ${primary ? b.accent : b.line}`,
      background: primary ? b.accent : 'transparent',
      color: primary ? b.accentInk : b.text,
      fontSize: 14, fontWeight: primary ? 500 : 400, marginBottom: 10,
      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    }}>
      <span>{children}</span>
      <span style={{ opacity: 0.6 }}>→</span>
    </div>
  );
}

// ── Screen: Correlations ───────────────────────────────────────
function ScreenCorrelations({ b }) {
  return (
    <ScreenShell b={b} nav="ana">
      <div style={{ padding: '20px 22px 0', height: '100%', overflow: 'auto' }}>
        <div style={{ marginBottom: 22 }}>
          <window.HedaLockup mark="aura" size={26} color={b.text} font={b.sans}/>
        </div>
        <div style={{ display: 'flex', gap: 24, borderBottom: `1px solid ${b.line}`, marginBottom: 22 }}>
          <Tab b={b}>Statistics</Tab>
          <Tab b={b} active>Correlations</Tab>
        </div>

        <div style={{ fontFamily: b.serif, fontSize: 26, fontWeight: 400, marginBottom: 6 }}>Patterns we noticed</div>
        <div style={{ fontSize: 13, color: b.textMute, marginBottom: 22, lineHeight: 1.5 }}>
          Possible patterns from the last 90 days. Not medical advice.
        </div>

        {/* Recommendation */}
        <div style={{
          background: b.bgCard, borderRadius: 14, padding: 18,
          border: `1px solid ${b.accentSoft}`,
          marginBottom: 18, position: 'relative', overflow: 'hidden',
        }}>
          <div style={{ position: 'absolute', top: -20, right: -20, opacity: 0.07 }}>
            <window.HedaHeadTopo size={140} color={b.accent}/>
          </div>
          <div style={{ fontFamily: b.mono, fontSize: 10, letterSpacing: 1, color: b.accent, marginBottom: 8 }}>MEDIUM PRIORITY</div>
          <div style={{ fontFamily: b.serif, fontSize: 18, marginBottom: 6 }}>Consider light daily activity</div>
          <div style={{ fontSize: 13, color: b.textMute, lineHeight: 1.55 }}>
            A 30-minute walk on low-step days may reduce migraine risk. Aim for 3,000 steps minimum.
          </div>
        </div>

        <div style={{ fontFamily: b.mono, fontSize: 10, letterSpacing: 1, color: b.textDim, marginBottom: 12 }}>DETECTED PATTERNS</div>

        {[
          { date: '23 Apr', label: 'Low activity', detail: '1,538 steps the day before · threshold 3,000' },
          { date: '26 Apr', label: 'Low activity', detail: '934 steps the day before · threshold 3,000' },
          { date: '27 Apr', label: 'Sleep < 6h',   detail: 'Two short nights in a row' },
        ].map((p, i) => (
          <div key={i} style={{
            background: b.bgCard, borderRadius: 12, padding: '14px 16px',
            border: `1px solid ${b.line}`, marginBottom: 10,
            display: 'flex', flexDirection: 'column', gap: 4,
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ fontWeight: 500, fontSize: 14 }}>{p.label}</span>
              <span style={{ fontSize: 11, color: b.textDim, fontFamily: b.mono }}>{p.date}</span>
            </div>
            <div style={{ fontSize: 12, color: b.textMute }}>{p.detail}</div>
          </div>
        ))}
      </div>
    </ScreenShell>
  );
}

// ── Screen: Settings ───────────────────────────────────────────
function ScreenSettings({ b }) {
  return (
    <ScreenShell b={b} nav="set">
      <div style={{ padding: '20px 22px 0', height: '100%', overflow: 'auto' }}>
        <div style={{ marginBottom: 22 }}>
          <window.HedaLockup mark="aura" size={26} color={b.text} font={b.sans}/>
        </div>
        <div style={{ fontFamily: b.serif, fontSize: 28, fontWeight: 400, marginBottom: 18 }}>Settings</div>

        <div style={{ fontFamily: b.mono, fontSize: 10, letterSpacing: 1.2, color: b.textDim, marginBottom: 10 }}>THEME</div>
        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)',
          background: b.bgCard, borderRadius: 12, padding: 4, marginBottom: 20,
          border: `1px solid ${b.line}`, gap: 4,
        }}>
          {['System','Dark','Light'].map((t, i) => (
            <button key={t} style={{
              padding: '11px 0', borderRadius: 9, border: 'none',
              background: i === 0 ? b.accent : 'transparent',
              color: i === 0 ? b.accentInk : b.textMute,
              fontFamily: b.sans, fontSize: 13, fontWeight: i === 0 ? 500 : 400,
            }}>{t}</button>
          ))}
        </div>

        <div style={{ fontFamily: b.mono, fontSize: 10, letterSpacing: 1.2, color: b.textDim, marginBottom: 10 }}>LANGUAGE</div>
        <div style={{
          padding: '14px 16px', borderRadius: 12, border: `1px solid ${b.line}`,
          marginBottom: 22, fontSize: 14, color: b.text,
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        }}>
          <span>English</span>
          <span style={{ color: b.textDim }}>▾</span>
        </div>

        {[
          { label: 'Health Connect', sub: null, arrow: true },
          { label: 'Privacy & data', sub: null, arrow: true },
          { label: 'Documentation', sub: 'Privacy policy, user guide', arrow: true },
        ].map((r, i) => (
          <div key={i} style={{
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            padding: '16px 0', borderBottom: `1px solid ${b.line}`,
          }}>
            <div>
              <div style={{ fontSize: 15 }}>{r.label}</div>
              {r.sub && <div style={{ fontSize: 12, color: b.textMute, marginTop: 2 }}>{r.sub}</div>}
            </div>
            <span style={{ color: b.textDim }}>›</span>
          </div>
        ))}

        {[
          { label: 'Biometric lock', sub: 'Require fingerprint or PIN', on: true },
          { label: 'Auto Health Connect sync', sub: 'Daily background fetch', on: true },
          { label: 'Daily recommendations', sub: 'Notify on detected patterns', on: false },
        ].map((r, i) => (
          <div key={i} style={{
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            padding: '16px 0', borderBottom: `1px solid ${b.line}`, gap: 14,
          }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 15 }}>{r.label}</div>
              <div style={{ fontSize: 12, color: b.textMute, marginTop: 2 }}>{r.sub}</div>
            </div>
            <Toggle b={b} on={r.on}/>
          </div>
        ))}
        <div style={{ height: 30 }}/>
      </div>
    </ScreenShell>
  );
}

function Toggle({ b, on }) {
  return (
    <div style={{
      width: 40, height: 22, borderRadius: 11,
      background: on ? b.accent : b.line,
      position: 'relative', transition: 'background .2s',
    }}>
      <div style={{
        position: 'absolute', top: 2, left: on ? 20 : 2,
        width: 18, height: 18, borderRadius: 9,
        background: on ? b.accentInk : b.textMute,
        transition: 'left .2s',
      }}/>
    </div>
  );
}

// ── Splash screen ──────────────────────────────────────────────
function ScreenSplash({ b }) {
  return (
    <div style={{
      width: SCREEN_W, height: SCREEN_H + 80,
      background: b.bg, color: b.text, fontFamily: b.sans,
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      position: 'relative', overflow: 'hidden',
    }}>
      <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: 0.08 }}>
        <window.HedaHeadTopo size={500} color={b.accent}/>
      </div>
      <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20 }}>
        <window.MarkAura size={88} color={b.accent}/>
        <window.HedaWordmark size={56} color={b.text} font={b.sans} weight={500} tracking={-0.04}/>
        <div style={{ fontFamily: b.serif, fontSize: 16, color: b.textMute, marginTop: 12, fontStyle: 'italic' }}>
          {b.tagline}
        </div>
      </div>
      <div style={{ position: 'absolute', bottom: 40, fontFamily: b.mono, fontSize: 10, color: b.textDim, letterSpacing: 1.5 }}>
        v 1.0
      </div>
    </div>
  );
}

Object.assign(window, {
  ScreenToday, ScreenLogEvent, ScreenAnalysis, ScreenReports,
  ScreenCorrelations, ScreenSettings, ScreenSplash,
});
