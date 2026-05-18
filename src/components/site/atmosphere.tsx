"use client";

import {
  motion,
  useMotionValueEvent,
  useReducedMotion,
  useScroll,
  useTransform,
  type MotionValue,
} from "framer-motion";
import { useEffect, useRef, type ReactNode } from "react";

type RGB = [number, number, number];

const BG: { t: number; c: RGB }[] = [
  { t: 0.0, c: [7, 16, 15] },
  { t: 0.4, c: [9, 23, 22] },
  { t: 0.7, c: [11, 31, 30] },
  { t: 1.0, c: [14, 40, 38] },
];
const ACCENT: { t: number; c: RGB }[] = [
  { t: 0.0, c: [255, 122, 64] },
  { t: 0.55, c: [255, 138, 78] },
  { t: 1.0, c: [255, 158, 96] },
];
const BONE: RGB = [243, 236, 227];

const lerp = (a: number, b: number, f: number) => a + (b - a) * f;
const mix = (a: RGB, b: RGB, f: number): RGB => [
  lerp(a[0], b[0], f),
  lerp(a[1], b[1], f),
  lerp(a[2], b[2], f),
];
function sample(stops: { t: number; c: RGB }[], t: number): RGB {
  if (t <= stops[0].t) return stops[0].c;
  if (t >= stops[stops.length - 1].t) return stops[stops.length - 1].c;
  for (let i = 0; i < stops.length - 1; i++) {
    const a = stops[i];
    const b = stops[i + 1];
    if (t >= a.t && t <= b.t) return mix(a.c, b.c, (t - a.t) / (b.t - a.t));
  }
  return stops[stops.length - 1].c;
}
const v = ([r, g, b]: RGB) =>
  `${Math.round(r)} ${Math.round(g)} ${Math.round(b)}`;

function applyPalette(t: number) {
  const root = document.documentElement;
  const bg = sample(BG, t);
  const accent = sample(ACCENT, t);
  const fg = BONE;
  root.style.setProperty("--background", v(bg));
  root.style.setProperty("--foreground", v(fg));
  root.style.setProperty("--card", v(mix(bg, BONE, 0.05)));
  root.style.setProperty("--card-foreground", v(fg));
  root.style.setProperty("--muted", v(mix(bg, BONE, 0.1)));
  root.style.setProperty("--muted-foreground", v(mix(bg, BONE, 0.62)));
  root.style.setProperty("--border", v(mix(bg, BONE, 0.16)));
  root.style.setProperty("--input", v(mix(bg, BONE, 0.16)));
  root.style.setProperty("--orange", v(accent));
  root.style.setProperty("--orange-soft", v(mix(accent, [255, 214, 178], 0.4)));
  root.style.setProperty("--ring", v(accent));
}

// easing used by the graffiti scene windows
const sstep = (x: number) => x * x * (3 - 2 * x);

// ── Jinx / Arcane punk-cyberpunk doodle kit ─────────────────────────
const PINK = "#ff2e88";
const CYAN = "#1ce6ff";
const BONEC = "#efe7da";
const ORG = "rgb(var(--orange))";

const DOODLES: Record<string, ReactNode> = {
  x: (
    <svg viewBox="0 0 40 40" fill="none">
      <path d="M5 6 L34 33 M7 4 L36 31" stroke="currentColor" strokeWidth="3.4" strokeLinecap="round" />
      <path d="M35 6 L6 33 M37 4 L8 31" stroke="currentColor" strokeWidth="3.4" strokeLinecap="round" />
    </svg>
  ),
  o: (
    <svg viewBox="0 0 46 46" fill="none">
      <path d="M24 4 C36 3 43 14 41 24 C39 36 25 43 14 39 C3 35 2 18 11 9 C15 5 19 5 25 5" stroke="currentColor" strokeWidth="3.2" strokeLinecap="round" />
    </svg>
  ),
  bomb: (
    <svg viewBox="0 0 56 56" fill="none">
      <circle cx="26" cy="36" r="15" stroke="currentColor" strokeWidth="3" />
      <path d="M26 21 C27 14 33 12 36 7" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
      <path d="M36 7 l3 -5 M36 7 l6 1 M36 7 l-2 -6 M36 7 l6 -4" stroke={PINK} strokeWidth="2.4" strokeLinecap="round" />
      <circle cx="37" cy="6" r="3" fill={PINK} />
      <path d="M19 31 q4 -5 9 -2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  ),
  monkey: (
    <svg viewBox="0 0 60 64" fill="none" stroke="currentColor" strokeWidth="2.8">
      <circle cx="30" cy="20" r="14" />
      <circle cx="13" cy="16" r="6" />
      <circle cx="47" cy="16" r="6" />
      <circle cx="25" cy="18" r="1.6" fill="currentColor" />
      <circle cx="35" cy="18" r="1.6" fill="currentColor" />
      <path d="M24 26 q6 6 12 0" strokeLinecap="round" />
      <rect x="18" y="35" width="24" height="20" rx="4" />
      <path d="M30 35 v-3 M42 45 h7 M49 41 l4 4 -4 4" strokeLinecap="round" />
    </svg>
  ),
  skull: (
    <svg viewBox="0 0 52 56" fill="none" stroke="currentColor" strokeWidth="2.8">
      <path d="M26 6 C40 6 45 18 43 28 C42 33 38 35 38 40 L14 40 C14 35 10 33 9 28 C7 18 12 6 26 6Z" />
      <circle cx="19" cy="26" r="4.5" fill="currentColor" />
      <circle cx="33" cy="26" r="4.5" fill="currentColor" />
      <path d="M26 31 l-2 6 h4 Z M19 42 v6 M26 42 v7 M33 42 v6" strokeLinecap="round" />
      <path d="M6 50 L46 12 M6 12 L46 50" strokeWidth="2.2" opacity="0.7" />
    </svg>
  ),
  bolt: (
    <svg viewBox="0 0 34 56" fill="none">
      <path d="M20 2 L5 32 L16 32 L12 54 L30 22 L18 22 Z" fill="currentColor" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
    </svg>
  ),
  heart: (
    <svg viewBox="0 0 44 40" fill="none">
      <path d="M22 37 C6 26 3 15 9 8 C14 2 21 5 22 12 C23 5 30 2 35 8 C41 15 38 26 22 37 Z" stroke="currentColor" strokeWidth="3" strokeLinejoin="round" />
    </svg>
  ),
  spark: (
    <svg viewBox="0 0 40 40" fill="none">
      <path d="M20 2 C21 14 26 19 38 20 C26 21 21 26 20 38 C19 26 14 21 2 20 C14 19 19 14 20 2 Z" fill="currentColor" />
    </svg>
  ),
  ammo: (
    <svg viewBox="0 0 56 28" fill="none" stroke="currentColor" strokeWidth="2.4">
      <path d="M4 6 h10 a8 8 0 0 1 0 16 h-10 Z" />
      <path d="M22 6 h10 a8 8 0 0 1 0 16 h-10 Z" />
      <path d="M40 6 h8 a8 8 0 0 1 0 16 h-8 Z" />
    </svg>
  ),
  crosshair: (
    <svg viewBox="0 0 56 56" fill="none" stroke="currentColor" strokeWidth="2.2">
      <circle cx="28" cy="28" r="20" />
      <circle cx="28" cy="28" r="3" fill="currentColor" />
      <path d="M28 2 v12 M28 42 v12 M2 28 h12 M42 28 h12" strokeLinecap="round" />
    </svg>
  ),
  scribble: (
    <svg viewBox="0 0 80 40" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeDasharray="1 6">
      <path d="M4 28 C14 6 22 6 26 22 C30 36 38 36 44 20 C49 6 58 8 62 24 C65 34 72 32 76 22" />
    </svg>
  ),
  pin: (
    <svg viewBox="0 0 44 56" fill="none" stroke="currentColor" strokeWidth="3">
      <path d="M22 53 C10 38 6 28 6 20 A16 16 0 0 1 38 20 C38 28 34 38 22 53 Z" strokeLinejoin="round" />
      <circle cx="22" cy="20" r="6" fill="currentColor" />
    </svg>
  ),
  plane: (
    <svg viewBox="0 0 56 56" fill="none" stroke="currentColor" strokeWidth="2.8" strokeLinejoin="round">
      <path d="M52 4 L6 24 L24 30 L30 50 L38 28 Z" />
      <path d="M24 30 L52 4" />
    </svg>
  ),
  code: (
    <svg viewBox="0 0 64 44" fill="none" stroke="currentColor" strokeWidth="3.4" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 8 L6 22 L18 36" />
      <path d="M46 8 L58 22 L46 36" />
      <path d="M37 6 L27 38" />
    </svg>
  ),
  arrow: (
    <svg viewBox="0 0 40 56" fill="none" stroke="currentColor" strokeWidth="3.4" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 30 L20 14 L34 30 M6 48 L20 32 L34 48" />
    </svg>
  ),
};

type Def = {
  k: keyof typeof DOODLES | "text";
  txt?: string;
  top: string;
  left: string;
  size: number;
  rot: number;
  op: number;
  color: string;
  dx?: number;
  dy?: number;
};

// One curated, themed kit PER section — composed to echo that
// section's line shape, not scattered at random.
const SCENES: Def[][] = [
  // 0 ASCENT — launch / self-taught rise
  [
    { k: "bolt", top: "70%", left: "20%", size: 56, rot: -12, op: 0.55, color: CYAN, dx: -30, dy: 70 },
    { k: "spark", top: "47%", left: "62%", size: 28, rot: 0, op: 0.5, color: CYAN, dy: 50 },
    { k: "code", top: "28%", left: "80%", size: 56, rot: 10, op: 0.5, color: PINK, dx: 30, dy: 60 },
    { k: "x", top: "82%", left: "40%", size: 30, rot: 18, op: 0.4, color: PINK, dy: 40 },
  ],
  // 1 SCREEN — the interfaces he ships
  [
    { k: "code", top: "34%", left: "30%", size: 58, rot: -6, op: 0.5, color: CYAN, dx: -40 },
    { k: "crosshair", top: "52%", left: "56%", size: 56, rot: 0, op: 0.45, color: PINK, dy: 30 },
    { k: "o", top: "70%", left: "70%", size: 40, rot: 8, op: 0.4, color: CYAN, dy: 40 },
    { k: "scribble", top: "78%", left: "34%", size: 84, rot: -4, op: 0.3, color: BONEC, dy: 30 },
  ],
  // 2 ROUTE — born Riyadh → based Beirut
  [
    { k: "pin", top: "76%", left: "22%", size: 54, rot: -8, op: 0.55, color: PINK, dx: -40, dy: 40 },
    { k: "spark", top: "68%", left: "32%", size: 22, rot: 0, op: 0.45, color: CYAN, dy: 30 },
    { k: "plane", top: "24%", left: "76%", size: 60, rot: 6, op: 0.5, color: CYAN, dx: 40, dy: 50 },
    { k: "scribble", top: "50%", left: "50%", size: 96, rot: -10, op: 0.26, color: BONEC },
  ],
  // 3 NETWORK — connected skill graph
  [
    { k: "spark", top: "34%", left: "30%", size: 24, rot: 0, op: 0.5, color: CYAN, dx: -30 },
    { k: "crosshair", top: "46%", left: "50%", size: 52, rot: 0, op: 0.45, color: PINK },
    { k: "spark", top: "62%", left: "66%", size: 24, rot: 0, op: 0.5, color: PINK, dx: 30 },
    { k: "bolt", top: "70%", left: "26%", size: 44, rot: -14, op: 0.45, color: CYAN, dy: 40 },
    { k: "scribble", top: "52%", left: "46%", size: 100, rot: 6, op: 0.3, color: BONEC },
  ],
  // 4 TREND — numbers climbing
  [
    { k: "ammo", top: "70%", left: "30%", size: 56, rot: 16, op: 0.4, color: ORG, dy: 40 },
    { k: "arrow", top: "42%", left: "56%", size: 50, rot: 0, op: 0.5, color: CYAN, dy: 50 },
    { k: "text", txt: "BOOM", top: "26%", left: "74%", size: 46, rot: -6, op: 0.5, color: PINK, dx: 30 },
    { k: "x", top: "82%", left: "50%", size: 28, rot: 20, op: 0.35, color: CYAN, dy: 30 },
  ],
  // 5 WAVE — live, playful chaos
  [
    { k: "text", txt: "PEW PEW", top: "46%", left: "84%", size: 24, rot: 90, op: 0.4, color: CYAN, dx: 40 },
    { k: "monkey", top: "70%", left: "16%", size: 74, rot: -8, op: 0.45, color: PINK, dx: -40, dy: 40 },
    { k: "bomb", top: "40%", left: "70%", size: 64, rot: 10, op: 0.5, color: ORG },
    { k: "spark", top: "24%", left: "48%", size: 26, rot: 0, op: 0.4, color: CYAN, dy: 50 },
  ],
  // 6 SEND — reach out / sign-off
  [
    { k: "plane", top: "34%", left: "60%", size: 64, rot: 8, op: 0.55, color: CYAN, dx: 40, dy: 40 },
    { k: "heart", top: "60%", left: "36%", size: 40, rot: -10, op: 0.45, color: PINK, dy: 40 },
    { k: "skull", top: "44%", left: "22%", size: 54, rot: -6, op: 0.4, color: BONEC, dx: -30 },
    { k: "text", txt: "BOOM", top: "76%", left: "64%", size: 44, rot: -8, op: 0.5, color: PINK, dy: 30 },
  ],
];

function Doodle({
  d,
  center,
  sp,
  reduced,
}: {
  d: Def;
  center: number;
  sp: MotionValue<number>;
  reduced: boolean;
}) {
  const win = (p: number) => {
    const x = Math.max(0, Math.min(1, 1 - Math.abs(p - center) / 0.16));
    return sstep(x);
  };
  const opacity = useTransform(sp, (p) => d.op * win(p));
  const scale = useTransform(sp, (p) => 0.6 + 0.4 * win(p));
  const x = useTransform(sp, (p) => (1 - win(p)) * (d.dx ?? 0));
  const y = useTransform(sp, (p) => (1 - win(p)) * (d.dy ?? 26));

  return (
    <motion.div
      className="absolute"
      style={{
        top: d.top,
        left: d.left,
        width: d.size,
        height: d.size,
        marginLeft: -d.size / 2,
        marginTop: -d.size / 2,
        color: d.color,
        rotate: d.rot,
        opacity: reduced ? d.op : opacity,
        scale: reduced ? 1 : scale,
        x: reduced ? 0 : x,
        y: reduced ? 0 : y,
        filter: `drop-shadow(0 0 7px ${d.color})`,
      }}
    >
      {d.k === "text" ? (
        <span
          className="f-anton block whitespace-nowrap"
          style={{
            fontSize: d.size,
            color: d.color,
            WebkitTextStroke: `1px ${d.color}`,
            textShadow: `0 0 12px ${d.color}`,
            lineHeight: 1,
          }}
        >
          {d.txt}
        </span>
      ) : (
        <div className="h-full w-full">{DOODLES[d.k]}</div>
      )}
    </motion.div>
  );
}

export function Atmosphere() {
  const reduced = useReducedMotion() ?? false;
  const { scrollYProgress } = useScroll();
  const queued = useRef(false);
  const latest = useRef(0);

  useEffect(() => {
    applyPalette(scrollYProgress.get());
  }, [scrollYProgress]);

  useMotionValueEvent(scrollYProgress, "change", (val) => {
    latest.current = val;
    if (queued.current) return;
    queued.current = true;
    requestAnimationFrame(() => {
      queued.current = false;
      applyPalette(latest.current);
    });
  });

  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 -z-10 overflow-hidden"
    >
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(120% 90% at 80% 10%, rgb(var(--orange) / 0.12), transparent 55%), radial-gradient(110% 90% at 12% 90%, rgb(var(--orange-soft) / 0.07), transparent 52%), rgb(var(--background))",
        }}
      />

      {/* per-section graffiti scenes — bloom in/out along scroll */}
      {SCENES.map((scene, si) =>
        scene.map((d, di) => (
          <Doodle
            key={`${si}-${di}`}
            d={d}
            center={si / (SCENES.length - 1)}
            sp={scrollYProgress}
            reduced={reduced}
          />
        )),
      )}

      <svg className="absolute inset-0 h-full w-full opacity-[0.05] mix-blend-soft-light">
        <filter id="atmo-grain">
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.82"
            numOctaves="2"
            stitchTiles="stitch"
          />
          <feColorMatrix type="saturate" values="0" />
        </filter>
        <rect width="100%" height="100%" filter="url(#atmo-grain)" />
      </svg>

      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(180deg, rgb(0 0 0 / 0.34) 0%, transparent 16%, transparent 82%, rgb(0 0 0 / 0.30) 100%)",
        }}
      />
    </div>
  );
}
