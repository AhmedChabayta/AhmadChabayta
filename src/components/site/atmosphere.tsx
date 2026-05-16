"use client";

import {
  motion,
  useMotionValueEvent,
  useReducedMotion,
  useScroll,
  useTransform,
} from "framer-motion";
import { useEffect, useRef } from "react";
import { WindTree } from "@/components/site/wind-tree";

type RGB = [number, number, number];

// Warm temperature "breathing". It stays in a dark, readable band the
// whole way — espresso -> umber -> deep amber — so foreground contrast is
// never sacrificed. The drama is in the warmth + the moving light, not in
// flipping to a washed-out daylight that murders the type on a real phone.
const BG: { t: number; c: RGB }[] = [
  { t: 0.0, c: [13, 10, 8] }, // espresso
  { t: 0.4, c: [22, 16, 13] }, // smouldering
  { t: 0.7, c: [33, 23, 18] }, // warm umber
  { t: 1.0, c: [42, 29, 21] }, // deep amber ember
];
const ACCENT: { t: number; c: RGB }[] = [
  { t: 0.0, c: [255, 112, 58] },
  { t: 0.55, c: [255, 130, 70] },
  { t: 1.0, c: [255, 152, 86] },
];

// Foreground is constant and bone-warm — guaranteed high contrast on the
// dark band above, at every scroll position.
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
    if (t >= a.t && t <= b.t) {
      return mix(a.c, b.c, (t - a.t) / (b.t - a.t));
    }
  }
  return stops[stops.length - 1].c;
}
const v = ([r, g, b]: RGB) =>
  `${Math.round(r)} ${Math.round(g)} ${Math.round(b)}`;

function applyPalette(t: number) {
  const root = document.documentElement;
  const bg = sample(BG, t);
  const accent = sample(ACCENT, t);
  // Constant high-contrast bone foreground. No flip, no mush.
  const fg = BONE;
  const mutedFg = mix(bg, BONE, 0.62); // clearly readable secondary text
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

// Organic, non-geometric blobs — identical command structure so the path
// data interpolates cleanly while morphing.
const BLOB_A = [
  "M300 78 C 404 70 506 138 512 252 C 518 366 470 470 360 506 C 250 542 150 498 112 396 C 74 294 86 192 150 142 C 200 102 246 86 300 78 Z",
  "M312 96 C 412 86 470 168 502 270 C 534 372 478 462 366 500 C 254 538 156 504 120 402 C 84 300 104 184 168 150 C 214 116 262 106 312 96 Z",
  "M292 84 C 398 96 514 150 506 274 C 498 398 458 478 348 514 C 238 550 138 488 116 388 C 94 288 76 196 152 138 C 204 100 246 78 292 84 Z",
];
const BLOB_B = [
  "M300 110 C 392 96 486 170 500 268 C 514 366 466 452 372 492 C 278 532 168 506 130 410 C 92 314 110 206 170 162 C 220 124 262 120 300 110 Z",
  "M308 96 C 406 104 492 158 498 266 C 504 374 452 470 358 500 C 264 530 158 498 126 398 C 94 298 118 196 176 152 C 222 116 268 92 308 96 Z",
  "M296 116 C 388 100 498 162 504 276 C 510 390 460 458 364 496 C 268 534 162 510 128 408 C 94 306 106 200 172 158 C 220 124 260 126 296 116 Z",
];

export function Atmosphere() {
  const reduced = useReducedMotion();
  const { scrollYProgress } = useScroll();
  const queued = useRef(false);
  const latest = useRef(0);

  // Drift the palette along scroll (rAF-throttled).
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

  const yA = useTransform(scrollYProgress, [0, 1], ["-22%", "70%"]);
  const yB = useTransform(scrollYProgress, [0, 1], ["55%", "-55%"]);
  const rot = useTransform(scrollYProgress, [0, 1], [-12, 70]);
  const yLeaf = useTransform(scrollYProgress, [0, 1], ["22%", "-46%"]);

  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 -z-10 overflow-hidden"
    >
      {/* warm depth bloom — recolors with the drift */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(120% 90% at 78% 12%, rgb(var(--orange) / 0.16), transparent 55%), radial-gradient(120% 90% at 12% 88%, rgb(var(--orange-soft) / 0.10), transparent 52%), linear-gradient(180deg, rgb(var(--background)), rgb(var(--background)))",
        }}
      />

      {/* morphing organic field */}
      <motion.div
        className="absolute -top-[18vh] -right-[16vw] h-[78vh] w-[78vh]"
        style={{ y: reduced ? undefined : yA, rotate: reduced ? undefined : rot }}
      >
        <svg
          viewBox="0 0 600 600"
          className="h-full w-full"
          style={{ filter: "blur(44px)" }}
        >
          <motion.path
            d={BLOB_A[0]}
            fill="rgb(var(--orange) / 0.30)"
            animate={reduced ? undefined : { d: [...BLOB_A, BLOB_A[0]] }}
            transition={{
              duration: 28,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        </svg>
      </motion.div>

      <motion.div
        className="absolute -bottom-[22vh] -left-[18vw] h-[70vh] w-[70vh]"
        style={{ y: reduced ? undefined : yB }}
      >
        <svg
          viewBox="0 0 600 600"
          className="h-full w-full"
          style={{ filter: "blur(52px)" }}
        >
          <motion.path
            d={BLOB_B[0]}
            fill="rgb(var(--orange-soft) / 0.22)"
            animate={reduced ? undefined : { d: [...BLOB_B, BLOB_B[0]] }}
            transition={{
              duration: 34,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        </svg>
      </motion.div>

      {/* the living tree — grows with scroll, sways in the wind */}
      <motion.div
        className="absolute bottom-0 left-[-12vw] h-[86vh] w-[62vh] opacity-[0.32] sm:left-[-6vw] md:left-[1vw] md:opacity-[0.4]"
        style={{ y: reduced ? undefined : yLeaf }}
      >
        <WindTree className="h-full w-full" />
      </motion.div>

      {/* analog film grain — kills the sterile digital flatness */}
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

      {/* soft top/bottom vignette for cinematic depth */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(180deg, rgb(0 0 0 / 0.28) 0%, transparent 14%, transparent 86%, rgb(0 0 0 / 0.22) 100%)",
        }}
      />
    </div>
  );
}
