"use client";

import {
  useMotionValueEvent,
  useReducedMotion,
  useScroll,
} from "framer-motion";
import { useEffect, useRef } from "react";

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
// MEANS that section — nothing arbitrary:
//   0 ASCENT   — hero: a self-taught upward trajectory (identity)
//   1 SCREEN   — work: the interfaces / screens he ships
//   2 ROUTE    — about: the journey (born Riyadh → based Beirut)
//   3 NETWORK  — capabilities: a connected skill graph
//   4 TREND    — stats: numbers climbing
//   5 WAVE     — experiments: a live oscilloscope signal
//   6 SEND     — contact: a paper-plane reaching out
const PTS = 10;
const SHAPES: number[][] = [
  // ASCENT
  [8, 84, 18, 82, 28, 77, 38, 72, 48, 64, 57, 55, 66, 45, 75, 34, 84, 24, 93, 13],
  // SCREEN (window outline traced as one stroke)
  [24, 40, 24, 27, 50, 25, 76, 27, 79, 50, 76, 73, 50, 75, 24, 73, 23, 56, 24, 42],
  // ROUTE (a meandering path between two places)
  [88, 82, 77, 73, 70, 64, 60, 62, 52, 53, 46, 44, 40, 41, 30, 33, 21, 24, 11, 15],
  // NETWORK (skills constellation, jagged interconnect)
  [13, 38, 28, 21, 40, 47, 54, 25, 50, 53, 67, 40, 60, 67, 79, 54, 72, 29, 89, 44],
  // TREND (stepped climb)
  [9, 79, 20, 72, 28, 74, 38, 59, 46, 62, 56, 45, 64, 48, 74, 31, 82, 34, 93, 17],
  // WAVE (oscilloscope)
  [7, 50, 17, 31, 28, 50, 39, 69, 50, 50, 61, 31, 72, 50, 83, 69, 92, 50, 97, 41],
  // SEND (paper plane reaching up-right)
  [18, 88, 30, 80, 40, 64, 28, 56, 48, 50, 44, 38, 64, 40, 60, 26, 84, 32, 90, 14],
];

const sstep = (x: number) => x * x * (3 - 2 * x);

// open Catmull-Rom spline → cubic-bezier path
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

  // morph the line along scroll
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
            "radial-gradient(120% 90% at 80% 10%, rgb(var(--orange) / 0.10), transparent 55%), radial-gradient(110% 90% at 12% 90%, rgb(var(--orange-soft) / 0.07), transparent 52%), rgb(var(--background))",
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
          strokeWidth={2.4}
          strokeLinecap="round"
          strokeLinejoin="round"
          opacity={0.16}
          style={{ filter: "blur(3px)" }}
        />
        <path
          ref={lineRef}
          stroke="rgb(var(--orange))"
          strokeWidth={0.5}
          strokeLinecap="round"
          strokeLinejoin="round"
          opacity={0.62}
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
            "linear-gradient(180deg, rgb(0 0 0 / 0.30) 0%, transparent 16%, transparent 84%, rgb(0 0 0 / 0.26) 100%)",
        }}
      />
    </div>
  );
}
