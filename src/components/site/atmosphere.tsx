"use client";

import {
  motion,
  useMotionValueEvent,
  useReducedMotion,
  useScroll,
  useTransform,
} from "framer-motion";
import { useEffect, useRef, type ReactNode } from "react";

type RGB = [number, number, number];

// Original "espresso night" drift — dark, readable band the whole way.
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
  const mutedFg = mix(bg, BONE, 0.62);
  const border = mix(bg, BONE, 0.16);
  const card = mix(bg, BONE, 0.05);
  const muted = mix(bg, BONE, 0.1);
  const accentSoft = mix(accent, [255, 214, 178], 0.4);
  root.style.setProperty("--background", v(bg));
  root.style.setProperty("--foreground", v(fg));
  root.style.setProperty("--card", v(card));
  root.style.setProperty("--card-foreground", v(fg));
  root.style.setProperty("--muted", v(muted));
  root.style.setProperty("--muted-foreground", v(mutedFg));
  root.style.setProperty("--border", v(border));
  root.style.setProperty("--input", v(border));
  root.style.setProperty("--orange", v(accent));
  root.style.setProperty("--orange-soft", v(accentSoft));
  root.style.setProperty("--ring", v(accent));
}

// ── The signal ──────────────────────────────────────────────────────
// ONE continuous line. Each scroll section morphs it into a shape that
// MEANS that section.
const PTS = 10;
const SHAPES: number[][] = [
  [8, 84, 18, 82, 28, 77, 38, 72, 48, 64, 57, 55, 66, 45, 75, 34, 84, 24, 93, 13],
  [24, 40, 24, 27, 50, 25, 76, 27, 79, 50, 76, 73, 50, 75, 24, 73, 23, 56, 24, 42],
  [88, 82, 77, 73, 70, 64, 60, 62, 52, 53, 46, 44, 40, 41, 30, 33, 21, 24, 11, 15],
  [13, 38, 28, 21, 40, 47, 54, 25, 50, 53, 67, 40, 60, 67, 79, 54, 72, 29, 89, 44],
  [9, 79, 20, 72, 28, 74, 38, 59, 46, 62, 56, 45, 64, 48, 74, 31, 82, 34, 93, 17],
  [7, 50, 17, 31, 28, 50, 39, 69, 50, 50, 61, 31, 72, 50, 83, 69, 92, 50, 97, 41],
  [18, 88, 30, 80, 40, 64, 28, 56, 48, 50, 44, 38, 64, 40, 60, 26, 84, 32, 90, 14],
];
const sstep = (x: number) => x * x * (3 - 2 * x);
function toPath(p: number[]): string {
  const x = (i: number) => p[Math.max(0, Math.min(PTS - 1, i)) * 2];
  const y = (i: number) => p[Math.max(0, Math.min(PTS - 1, i)) * 2 + 1];
  let d = `M ${x(0).toFixed(2)} ${y(0).toFixed(2)}`;
  for (let i = 0; i < PTS - 1; i++) {
    const c1x = x(i) + (x(i + 1) - x(i - 1)) / 6;
    const c1y = y(i) + (y(i + 1) - y(i - 1)) / 6;
    const c2x = x(i + 1) - (x(i + 2) - x(i)) / 6;
    const c2y = y(i + 1) - (y(i + 2) - y(i)) / 6;
    d += ` C ${c1x.toFixed(2)} ${c1y.toFixed(2)} ${c2x.toFixed(2)} ${c2y.toFixed(2)} ${x(i + 1).toFixed(2)} ${y(i + 1).toFixed(2)}`;
  }
  return d;
}

// ── Jinx / Arcane punk-cyberpunk graffiti kit ───────────────────────
const PINK = "#ff2e88";
const CYAN = "#1ce6ff";
const BONEC = "#efe7da";

const DOODLES: Record<string, ReactNode> = {
  x: (
    <svg viewBox="0 0 40 40" fill="none">
      <path d="M5 6 L34 33 M7 4 L36 31" stroke={PINK} strokeWidth="3.4" strokeLinecap="round" />
      <path d="M35 6 L6 33 M37 4 L8 31" stroke={PINK} strokeWidth="3.4" strokeLinecap="round" />
    </svg>
  ),
  o: (
    <svg viewBox="0 0 46 46" fill="none">
      <path
        d="M24 4 C36 3 43 14 41 24 C39 36 25 43 14 39 C3 35 2 18 11 9 C15 5 19 5 25 5"
        stroke={CYAN}
        strokeWidth="3.2"
        strokeLinecap="round"
      />
    </svg>
  ),
  bomb: (
    <svg viewBox="0 0 56 56" fill="none">
      <circle cx="26" cy="36" r="15" stroke="rgb(var(--orange))" strokeWidth="3" />
      <path d="M26 21 C27 14 33 12 36 7" stroke="rgb(var(--orange))" strokeWidth="3" strokeLinecap="round" />
      <g className="atmo-spark">
        <path d="M36 7 l3 -5 M36 7 l6 1 M36 7 l-2 -6 M36 7 l6 -4" stroke={PINK} strokeWidth="2.4" strokeLinecap="round" />
        <circle cx="37" cy="6" r="3" fill={PINK} />
      </g>
      <path d="M19 31 q4 -5 9 -2" stroke="rgb(var(--orange))" strokeWidth="2" strokeLinecap="round" />
    </svg>
  ),
  monkey: (
    <svg viewBox="0 0 60 64" fill="none" stroke={PINK} strokeWidth="2.8">
      <circle cx="30" cy="20" r="14" />
      <circle cx="13" cy="16" r="6" />
      <circle cx="47" cy="16" r="6" />
      <circle cx="25" cy="18" r="1.6" fill={PINK} />
      <circle cx="35" cy="18" r="1.6" fill={PINK} />
      <path d="M24 26 q6 6 12 0" strokeLinecap="round" />
      <rect x="18" y="35" width="24" height="20" rx="4" />
      <path d="M30 35 v-3 M42 45 h7 M49 41 l4 4 -4 4" strokeLinecap="round" />
    </svg>
  ),
  skull: (
    <svg viewBox="0 0 52 56" fill="none" stroke={BONEC} strokeWidth="2.8">
      <path d="M26 6 C40 6 45 18 43 28 C42 33 38 35 38 40 L14 40 C14 35 10 33 9 28 C7 18 12 6 26 6Z" />
      <circle cx="19" cy="26" r="4.5" fill={BONEC} />
      <circle cx="33" cy="26" r="4.5" fill={BONEC} />
      <path d="M26 31 l-2 6 h4 Z M19 42 v6 M26 42 v7 M33 42 v6" strokeLinecap="round" />
      <path d="M6 50 L46 12 M6 12 L46 50" stroke={BONEC} strokeWidth="2.2" opacity="0.7" />
    </svg>
  ),
  bolt: (
    <svg viewBox="0 0 34 56" fill="none">
      <path d="M20 2 L5 32 L16 32 L12 54 L30 22 L18 22 Z" fill={CYAN} stroke={CYAN} strokeWidth="1.5" strokeLinejoin="round" />
    </svg>
  ),
  heart: (
    <svg viewBox="0 0 44 40" fill="none">
      <path
        d="M22 37 C6 26 3 15 9 8 C14 2 21 5 22 12 C23 5 30 2 35 8 C41 15 38 26 22 37 Z"
        stroke={PINK}
        strokeWidth="3"
        strokeLinejoin="round"
      />
    </svg>
  ),
  spark: (
    <svg viewBox="0 0 40 40" fill="none">
      <path d="M20 2 C21 14 26 19 38 20 C26 21 21 26 20 38 C19 26 14 21 2 20 C14 19 19 14 20 2 Z" fill={CYAN} />
    </svg>
  ),
  ammo: (
    <svg viewBox="0 0 56 28" fill="none" stroke="rgb(var(--orange))" strokeWidth="2.4">
      <path d="M4 6 h10 a8 8 0 0 1 0 16 h-10 Z" />
      <path d="M22 6 h10 a8 8 0 0 1 0 16 h-10 Z" />
      <path d="M40 6 h8 a8 8 0 0 1 0 16 h-8 Z" />
    </svg>
  ),
  crosshair: (
    <svg viewBox="0 0 56 56" fill="none" stroke={CYAN} strokeWidth="2.2">
      <circle cx="28" cy="28" r="20" />
      <circle cx="28" cy="28" r="3" fill={CYAN} />
      <path d="M28 2 v12 M28 42 v12 M2 28 h12 M42 28 h12" strokeLinecap="round" />
    </svg>
  ),
  scribble: (
    <svg viewBox="0 0 80 40" fill="none" stroke={BONEC} strokeWidth="2.4" strokeLinecap="round">
      <path d="M4 28 C14 6 22 6 26 22 C30 36 38 36 44 20 C49 6 58 8 62 24 C65 34 72 32 76 22" />
    </svg>
  ),
};

type Item = {
  k: keyof typeof DOODLES | "text";
  txt?: string;
  top: string;
  left: string;
  size: number;
  rot: number;
  op: number;
  depth: 0 | 1 | 2 | 3; // scroll-parallax band
  flick?: boolean;
  color?: string;
};

const ITEMS: Item[] = [
  { k: "x", top: "16%", left: "84%", size: 52, rot: -12, op: 0.5, depth: 2, flick: true },
  { k: "o", top: "27%", left: "5%", size: 58, rot: 8, op: 0.42, depth: 1 },
  { k: "bomb", top: "68%", left: "83%", size: 72, rot: 10, op: 0.5, depth: 3 },
  { k: "monkey", top: "76%", left: "7%", size: 78, rot: -8, op: 0.42, depth: 2 },
  { k: "skull", top: "40%", left: "90%", size: 64, rot: 14, op: 0.34, depth: 1 },
  { k: "bolt", top: "52%", left: "3%", size: 56, rot: -10, op: 0.5, depth: 3, flick: true },
  {
    k: "text",
    txt: "BOOM",
    top: "86%",
    left: "58%",
    size: 60,
    rot: -6,
    op: 0.5,
    depth: 2,
    flick: true,
    color: PINK,
  },
  { k: "heart", top: "31%", left: "73%", size: 40, rot: -14, op: 0.36, depth: 1 },
  { k: "spark", top: "20%", left: "46%", size: 30, rot: 0, op: 0.22, depth: 0, flick: true },
  { k: "ammo", top: "62%", left: "90%", size: 56, rot: 18, op: 0.36, depth: 2 },
  { k: "crosshair", top: "10%", left: "30%", size: 50, rot: 0, op: 0.2, depth: 0 },
  { k: "scribble", top: "90%", left: "16%", size: 90, rot: -4, op: 0.28, depth: 1 },
  {
    k: "text",
    txt: "PEW PEW",
    top: "47%",
    left: "84%",
    size: 26,
    rot: 90,
    op: 0.34,
    depth: 1,
    color: CYAN,
  },
  { k: "x", top: "82%", left: "44%", size: 34, rot: 20, op: 0.26, depth: 0 },
];

export function Atmosphere() {
  const reduced = useReducedMotion();
  const { scrollYProgress } = useScroll();
  const queued = useRef(false);
  const latest = useRef(0);
  const lineRef = useRef<SVGPathElement>(null);
  const glowRef = useRef<SVGPathElement>(null);

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

  useEffect(() => {
    const buf = new Array(PTS * 2).fill(0);
    const draw = (prog: number) => {
      const s = prog * (SHAPES.length - 1);
      const i = Math.max(0, Math.min(SHAPES.length - 2, Math.floor(s)));
      const f = sstep(Math.max(0, Math.min(1, s - i)));
      const a = SHAPES[i];
      const b = SHAPES[i + 1];
      for (let k = 0; k < PTS * 2; k++) buf[k] = a[k] + (b[k] - a[k]) * f;
      const d = toPath(buf);
      lineRef.current?.setAttribute("d", d);
      glowRef.current?.setAttribute("d", d);
    };
    draw(scrollYProgress.get());
    let qd = false;
    const unsub = scrollYProgress.on("change", (val) => {
      if (qd) return;
      qd = true;
      requestAnimationFrame(() => {
        qd = false;
        draw(val);
      });
    });
    return unsub;
  }, [scrollYProgress]);

  // four parallax bands (transform-only → compositor cheap)
  const d0 = useTransform(scrollYProgress, [0, 1], [0, -40]);
  const d1 = useTransform(scrollYProgress, [0, 1], [0, -130]);
  const d2 = useTransform(scrollYProgress, [0, 1], [0, -240]);
  const d3 = useTransform(scrollYProgress, [0, 1], [0, -380]);
  const rotS = useTransform(scrollYProgress, [0, 1], [0, 36]);
  const bands = [d0, d1, d2, d3];

  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 -z-10 overflow-hidden"
    >
      {/* base wash */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(120% 90% at 80% 10%, rgb(var(--orange) / 0.12), transparent 55%), radial-gradient(110% 90% at 12% 90%, rgb(var(--orange-soft) / 0.07), transparent 52%), rgb(var(--background))",
        }}
      />

      {/* the morphing signal line */}
      <svg
        className="absolute inset-0 h-full w-full"
        viewBox="0 0 100 100"
        preserveAspectRatio="xMidYMid meet"
        fill="none"
      >
        <path
          ref={glowRef}
          stroke="rgb(var(--orange))"
          strokeWidth={2.6}
          strokeLinecap="round"
          strokeLinejoin="round"
          opacity={0.2}
          style={{ filter: "blur(3px)" }}
        />
        <path
          ref={lineRef}
          stroke="rgb(var(--orange))"
          strokeWidth={0.55}
          strokeLinecap="round"
          strokeLinejoin="round"
          opacity={0.72}
          strokeDasharray={reduced ? undefined : "0.6 2.4"}
        >
          {!reduced && (
            <animate
              attributeName="stroke-dashoffset"
              from="0"
              to="-30"
              dur="6s"
              repeatCount="indefinite"
            />
          )}
        </path>
      </svg>

      {/* graffiti kit */}
      {ITEMS.map((it, idx) => {
        const flick =
          !reduced && it.flick
            ? {
                opacity: [it.op, it.op * 0.35, it.op, it.op * 0.7, it.op],
                filter: [
                  "drop-shadow(0 0 0px currentColor)",
                  "drop-shadow(0 0 6px currentColor)",
                  "drop-shadow(0 0 1px currentColor)",
                ],
              }
            : undefined;
        return (
          <motion.div
            key={idx}
            className="absolute"
            style={{
              top: it.top,
              left: it.left,
              width: it.size,
              height: it.size,
              color: it.color ?? "#fff",
              opacity: it.op,
              rotate: reduced ? 0 : rotS,
              y: reduced ? 0 : bands[it.depth],
              translateX: "-50%",
              translateY: "-50%",
            }}
            animate={flick}
            transition={
              flick
                ? {
                    duration: 3.4 + (idx % 4),
                    repeat: Infinity,
                    ease: "easeInOut",
                  }
                : undefined
            }
          >
            <div style={{ transform: `rotate(${it.rot}deg)` }}>
              {it.k === "text" ? (
                <span
                  className="f-anton block whitespace-nowrap"
                  style={{
                    fontSize: it.size,
                    color: it.color ?? PINK,
                    WebkitTextStroke: `1px ${it.color ?? PINK}`,
                    textShadow: `0 0 10px ${it.color ?? PINK}`,
                    lineHeight: 1,
                  }}
                >
                  {it.txt}
                </span>
              ) : (
                <div className="h-full w-full">{DOODLES[it.k]}</div>
              )}
            </div>
          </motion.div>
        );
      })}

      {/* analog grain */}
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

      {/* soft cinematic vignette */}
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
