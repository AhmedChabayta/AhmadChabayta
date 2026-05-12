export function OrbitalMark({ size = 160, className }: { size?: number; className?: string }) {
  return (
    <svg
      viewBox="0 0 200 200"
      width={size}
      height={size}
      role="img"
      aria-label="Animated orbital mark"
      className={className}
      style={{ color: "rgb(var(--orange))" }}
    >
      <defs>
        {/* Circular path the orbital text rides along */}
        <path
          id="orbital-text-path"
          d="M 100,100 m -88,0 a 88,88 0 1,1 176,0 a 88,88 0 1,1 -176,0"
          fill="none"
        />
        {/* Soft radial glow under the center */}
        <radialGradient id="orbital-glow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="rgb(255 69 0)" stopOpacity="0.55" />
          <stop offset="60%" stopColor="rgb(255 69 0)" stopOpacity="0.08" />
          <stop offset="100%" stopColor="rgb(255 69 0)" stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* Center glow */}
      <circle cx="100" cy="100" r="44" fill="url(#orbital-glow)">
        <animate
          attributeName="r"
          values="36;52;36"
          dur="5s"
          repeatCount="indefinite"
        />
      </circle>

      {/* Crosshair ticks */}
      <g stroke="currentColor" strokeOpacity="0.5">
        <line x1="100" y1="2" x2="100" y2="14" />
        <line x1="100" y1="186" x2="100" y2="198" />
        <line x1="2" y1="100" x2="14" y2="100" />
        <line x1="186" y1="100" x2="198" y2="100" />
      </g>

      {/* Outer dashed ring rotating clockwise, with one bright dash */}
      <g
        className="orbital-spin-cw orbital-spin-slow"
        style={{ transformOrigin: "100px 100px" }}
      >
        <circle
          cx="100"
          cy="100"
          r="92"
          fill="none"
          stroke="currentColor"
          strokeOpacity="0.18"
          strokeDasharray="2 5"
        />
        <circle
          cx="100"
          cy="100"
          r="92"
          fill="none"
          stroke="currentColor"
          strokeOpacity="0.85"
          strokeWidth="1.25"
          strokeDasharray="48 530"
        />
        {/* Satellite at 12 o'clock */}
        <circle cx="100" cy="8" r="2.5" fill="currentColor" />
      </g>

      {/* Mid ring, counter-rotating */}
      <g
        className="orbital-spin-ccw orbital-spin-med"
        style={{ transformOrigin: "100px 100px" }}
      >
        <circle
          cx="100"
          cy="100"
          r="74"
          fill="none"
          stroke="currentColor"
          strokeOpacity="0.45"
          strokeWidth="0.75"
        />
        <circle cx="174" cy="100" r="3" fill="currentColor" />
        <circle cx="26" cy="100" r="1.5" fill="currentColor" />
      </g>

      {/* Inner ring, fast clockwise */}
      <g
        className="orbital-spin-cw orbital-spin-fast"
        style={{ transformOrigin: "100px 100px" }}
      >
        <circle
          cx="100"
          cy="100"
          r="54"
          fill="none"
          stroke="currentColor"
          strokeOpacity="0.25"
          strokeDasharray="1 3"
        />
        <circle cx="154" cy="100" r="2" fill="currentColor" />
        <circle cx="100" cy="46" r="1.5" fill="currentColor" opacity="0.7" />
      </g>

      {/* Curved orbital text */}
      <g
        className="orbital-spin-cw orbital-spin-text"
        style={{ transformOrigin: "100px 100px" }}
      >
        <text
          fill="currentColor"
          fillOpacity="0.7"
          style={{
            fontFamily: "var(--font-jetbrains), ui-monospace, monospace",
            fontSize: 6,
            letterSpacing: "0.32em",
            textTransform: "uppercase",
          }}
        >
          <textPath href="#orbital-text-path" startOffset="0">
            AHMAD CHABAYTA · PORTFOLIO 2026 · BEIRUT · LIVE ·
          </textPath>
        </text>
      </g>

      {/* Pulsing core */}
      <circle cx="100" cy="100" r="5" fill="currentColor">
        <animate
          attributeName="r"
          values="4.5;6.5;4.5"
          dur="2.4s"
          repeatCount="indefinite"
          calcMode="spline"
          keySplines="0.4 0 0.2 1; 0.4 0 0.2 1"
          keyTimes="0;0.5;1"
        />
        <animate
          attributeName="fill-opacity"
          values="1;0.6;1"
          dur="2.4s"
          repeatCount="indefinite"
        />
      </circle>
      <circle cx="100" cy="100" r="1.5" fill="rgb(255 245 230)" />

      {/* Tiny status text under center */}
      <text
        x="100"
        y="128"
        textAnchor="middle"
        fill="currentColor"
        fillOpacity="0.55"
        style={{
          fontFamily: "var(--font-jetbrains), ui-monospace, monospace",
          fontSize: 6,
          letterSpacing: "0.3em",
          textTransform: "uppercase",
        }}
      >
        ONLINE
      </text>
    </svg>
  );
}
