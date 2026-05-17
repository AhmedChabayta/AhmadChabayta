"use client";

import { useMotionValueEvent, useScroll } from "framer-motion";
import { useEffect, useRef } from "react";
import dynamic from "next/dynamic";

const Tree3D = dynamic(
  () => import("@/components/site/tree3d").then((m) => m.Tree3D),
  { ssr: false },
);

type RGB = [number, number, number];

// Daylight scene. The visible backdrop (sky + sun + tree) is bright; the
// design tokens below stay in a dark, readable band so the content
// sections render as dark translucent glass over the daylight — the
// "hybrid" look. Foreground is constant bone for guaranteed contrast.
const PANEL: { t: number; c: RGB }[] = [
  { t: 0.0, c: [16, 22, 20] },
  { t: 0.5, c: [18, 27, 24] },
  { t: 1.0, c: [20, 32, 28] },
];
const ACCENT: { t: number; c: RGB }[] = [
  { t: 0.0, c: [255, 122, 64] },
  { t: 1.0, c: [255, 150, 92] },
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
  const bg = sample(PANEL, t);
  const accent = sample(ACCENT, t);
  const fg = BONE;
  const mutedFg = mix(bg, BONE, 0.62);
  const border = mix(bg, BONE, 0.18);
  const card = mix(bg, BONE, 0.06);
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

export function Atmosphere() {
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
      {/* daylight sky — blue zenith → pale → warm horizon */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(180deg, #9cc1e8 0%, #bdd6ec 36%, #dee7df 66%, #f1e8d3 100%)",
        }}
      />

      {/* warm sun glow, upper-left (matches the scene sun direction) */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(58% 48% at 22% 12%, rgba(255,240,206,0.6), rgba(255,240,206,0) 62%)",
        }}
      />

      {/* soft static clouds */}
      <div
        className="absolute inset-0 opacity-70"
        style={{
          background:
            "radial-gradient(22% 12% at 70% 20%, rgba(255,255,255,0.55), transparent 60%), radial-gradient(28% 14% at 84% 30%, rgba(255,255,255,0.4), transparent 62%), radial-gradient(20% 10% at 38% 16%, rgba(255,255,255,0.34), transparent 60%)",
          filter: "blur(8px)",
        }}
      />

      {/* the living 3D fractal tree — full-bleed, the whole-page backdrop */}
      <div className="absolute inset-0">
        <Tree3D className="relative h-full w-full" />
      </div>

      {/* gentle ground haze + bottom anchor (also lifts bottom-aligned
          hero text without killing the daylight) */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(180deg, transparent 0%, transparent 58%, rgba(208,214,196,0.30) 78%, rgba(28,36,30,0.42) 100%)",
        }}
      />

      {/* faint analog grain — kills digital flatness */}
      <svg className="absolute inset-0 h-full w-full opacity-[0.035] mix-blend-soft-light">
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
    </div>
  );
}
