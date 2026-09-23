// Game logo — a gold 4-spike star (same shape as the in-game sprite) with a
// cyan→violet comet trail sweeping in from the top-left. Pure SVG, no emoji.
export default function GameLogo({ className = "" }) {
  return (
    <svg
      className={"game-logo " + className}
      viewBox="0 0 120 120"
      role="img"
      aria-label="Shooting Star Burst logo"
    >
      <defs>
        <linearGradient id="logo-trail" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#6bf3ff" stopOpacity="0" />
          <stop offset="0.55" stopColor="#b98bff" stopOpacity="0.75" />
          <stop offset="1" stopColor="#ffd76b" />
        </linearGradient>
        <radialGradient id="logo-star" cx="0.5" cy="0.45" r="0.65">
          <stop offset="0" stopColor="#fff7e8" />
          <stop offset="0.55" stopColor="#ffd76b" />
          <stop offset="1" stopColor="#c99a2e" />
        </radialGradient>
        <filter id="logo-glow" x="-40%" y="-40%" width="180%" height="180%">
          <feGaussianBlur stdDeviation="3.5" result="b" />
          <feMerge>
            <feMergeNode in="b" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* Comet trail */}
      <path
        d="M14 12 L74 62 L58 70 Z"
        fill="url(#logo-trail)"
        opacity="0.9"
      />

      {/* Tiny background sparkles */}
      <circle cx="24" cy="52" r="2.4" fill="#6bf3ff" opacity="0.8" />
      <circle cx="44" cy="20" r="1.8" fill="#ff6bcf" opacity="0.7" />
      <circle cx="88" cy="98" r="2" fill="#6bffb0" opacity="0.6" />

      {/* 4-spike star (same geometry as the canvas sprite) */}
      <g filter="url(#logo-glow)">
        <path
          d="M60 30 L67.2 52.8 L90 60 L67.2 67.2 L60 90 L52.8 67.2 L30 60 L52.8 52.8 Z"
          fill="url(#logo-star)"
        />
      </g>
    </svg>
  );
}
