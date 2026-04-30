// Heda — final logo system. V1 Topo Aura is canonical.
// Front-facing head + 3 concentric rings.

function MarkAura({ size = 64, color = 'currentColor' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none">
      <circle cx="32" cy="32" r="29" stroke={color} strokeWidth="1" opacity="0.18" fill="none"/>
      <circle cx="32" cy="32" r="23" stroke={color} strokeWidth="1" opacity="0.30" fill="none"/>
      <circle cx="32" cy="32" r="17.5" stroke={color} strokeWidth="1" opacity="0.50" fill="none"/>
      <ellipse cx="32" cy="30" rx="9" ry="11" fill={color}/>
      <path d="M27 41 Q32 44 37 41 L39 47 Q32 49 25 47 Z" fill={color}/>
    </svg>
  );
}

// Larger viewBox version for app icons / launcher — same shape, scaled
// so the head fills more of the canvas and rings push to the edge.
function MarkAuraTight({ size = 64, color = 'currentColor' }) {
  return (
    <svg width={size} height={size} viewBox="6 6 52 52" fill="none">
      <circle cx="32" cy="32" r="29" stroke={color} strokeWidth="1" opacity="0.18" fill="none"/>
      <circle cx="32" cy="32" r="23" stroke={color} strokeWidth="1" opacity="0.30" fill="none"/>
      <circle cx="32" cy="32" r="17.5" stroke={color} strokeWidth="1" opacity="0.50" fill="none"/>
      <ellipse cx="32" cy="30" rx="9" ry="11" fill={color}/>
      <path d="M27 41 Q32 44 37 41 L39 47 Q32 49 25 47 Z" fill={color}/>
    </svg>
  );
}

function HedaWordmark({ size = 40, color = 'currentColor', tracking = -0.02, weight = 500, font }) {
  return (
    <span style={{
      fontFamily: font || '"Inter Tight", "Inter", system-ui, sans-serif',
      fontSize: size,
      fontWeight: weight,
      letterSpacing: `${tracking}em`,
      color,
      lineHeight: 1,
      display: 'inline-block',
    }}>heda</span>
  );
}

function HedaLockup({ size = 36, color = 'currentColor', font, gap = 10 }) {
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap, color }}>
      <MarkAura size={size} color={color}/>
      <HedaWordmark size={size * 0.78} color={color} font={font}/>
    </span>
  );
}

Object.assign(window, { MarkAura, MarkAuraTight, HedaWordmark, HedaLockup });
