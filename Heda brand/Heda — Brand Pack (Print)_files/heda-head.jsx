// Soft, abstracted head illustration. Used as marketing imagery and
// inside the redesigned Log Event screen. Drawn carefully (front-3/4)
// with soft gradient + optional pain region overlay + radiating aura.
//
// This is intentionally stylized — we're not trying to replicate a
// photoreal 3D head here. For the real app, the existing 3D model is
// kept; this is the marketing/icon abstraction.

function HedaHead({
  size = 280,
  color = '#cfd2c8',     // skin tone (will be tinted by brand)
  bg = 'transparent',
  pain = null,           // 'right' | 'left' | 'temple' | 'crown' | null
  painColor = '#c89595',
  aura = false,
  auraColor = '#a8b89a',
}) {
  const id = React.useId();
  return (
    <svg width={size} height={size} viewBox="0 0 280 280" style={{ background: bg }}>
      <defs>
        <radialGradient id={`${id}-skin`} cx="50%" cy="40%" r="55%">
          <stop offset="0%" stopColor={color} stopOpacity="1"/>
          <stop offset="70%" stopColor={color} stopOpacity="0.85"/>
          <stop offset="100%" stopColor={color} stopOpacity="0.4"/>
        </radialGradient>
        <radialGradient id={`${id}-pain`} cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor={painColor} stopOpacity="0.85"/>
          <stop offset="100%" stopColor={painColor} stopOpacity="0"/>
        </radialGradient>
        <radialGradient id={`${id}-aura`} cx="50%" cy="50%" r="50%">
          <stop offset="40%" stopColor={auraColor} stopOpacity="0"/>
          <stop offset="80%" stopColor={auraColor} stopOpacity="0.18"/>
          <stop offset="100%" stopColor={auraColor} stopOpacity="0"/>
        </radialGradient>
      </defs>

      {aura && (
        <>
          <circle cx="140" cy="130" r="135" fill={`url(#${id}-aura)`}/>
          <circle cx="140" cy="130" r="100" stroke={auraColor} strokeWidth="0.6" opacity="0.18" fill="none"/>
          <circle cx="140" cy="130" r="120" stroke={auraColor} strokeWidth="0.6" opacity="0.12" fill="none"/>
          <circle cx="140" cy="130" r="138" stroke={auraColor} strokeWidth="0.6" opacity="0.07" fill="none"/>
        </>
      )}

      {/* neck */}
      <path d="M108 200 Q108 230 100 250 L180 250 Q172 230 172 200 Z" fill={`url(#${id}-skin)`} opacity="0.85"/>

      {/* head — egg shape, 3/4 view leaning slightly */}
      <path
        d="M140 50
           C 175 50, 200 80, 200 125
           C 200 160, 188 195, 168 208
           C 158 215, 148 218, 140 218
           C 132 218, 122 215, 112 208
           C 92 195, 80 160, 80 125
           C 80 80, 105 50, 140 50 Z"
        fill={`url(#${id}-skin)`}
      />

      {/* nose ridge — soft */}
      <path d="M140 110 Q138 135 134 150 Q138 156 142 156" stroke={color} strokeOpacity="0.25" strokeWidth="1" fill="none"/>
      {/* eye sockets — barely there */}
      <ellipse cx="118" cy="120" rx="10" ry="3" fill={color} fillOpacity="0.18"/>
      <ellipse cx="158" cy="120" rx="10" ry="3" fill={color} fillOpacity="0.18"/>
      {/* lip */}
      <path d="M128 175 Q140 178 152 175" stroke={color} strokeOpacity="0.25" strokeWidth="1" fill="none"/>

      {/* pain regions */}
      {pain === 'temple' && (
        <ellipse cx="100" cy="110" rx="22" ry="28" fill={`url(#${id}-pain)`}/>
      )}
      {pain === 'right' && (
        <ellipse cx="180" cy="125" rx="30" ry="42" fill={`url(#${id}-pain)`}/>
      )}
      {pain === 'left' && (
        <ellipse cx="100" cy="125" rx="30" ry="42" fill={`url(#${id}-pain)`}/>
      )}
      {pain === 'crown' && (
        <ellipse cx="140" cy="80" rx="48" ry="22" fill={`url(#${id}-pain)`}/>
      )}
    </svg>
  );
}

// A more abstract topographic version — concentric contour lines forming
// a head. Useful for icons and tiny marks.
function HedaHeadTopo({ size = 280, color = '#a8b89a', bgColor = 'transparent' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 280 280" style={{ background: bgColor }}>
      {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => {
        const r = 30 + i * 13;
        const op = 0.9 - i * 0.1;
        return (
          <ellipse
            key={i}
            cx="140" cy="140"
            rx={r * 0.85} ry={r}
            stroke={color} strokeWidth="1" fill="none"
            opacity={op}
          />
        );
      })}
    </svg>
  );
}

Object.assign(window, { HedaHead, HedaHeadTopo });
