"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Self-contained signal piece — no DOM measuring, no snapping.
 *
 * One responsive SVG (viewBox + meet, so it scales to any screen):
 *  • "CREATIVE TECH." animates in above a thin underscore line.
 *  • As the page scrolls, the underscore smoothly morphs into a
 *    rounded frame (continuous eased function of scroll — never snaps),
 *    and the wordmark fades so the frame reads clean.
 * Sits behind content, aria-hidden, pointer-events-none.
 */

const lerp = (a: number, b: number, f: number) => a + (b - a) * f;
const sstep = (x: number) => x * x * (3 - 2 * x);
const clamp01 = (x: number) => Math.max(0, Math.min(1, x));

// underscore (p=0) and frame (p=1) rectangles, in 0..100 viewBox units
const LINE = { l: 17, t: 57.4, r: 83, b: 58.6, rad: 0.7 };
const FRAME = { l: 13, t: 19, r: 87, b: 85, rad: 4 };

function rrPath(l: number, t: number, r: number, b: number, rad: number) {
  const R = Math.max(0, Math.min(rad, (r - l) / 2, (b - t) / 2));
  return (
    `M ${(l + R).toFixed(2)} ${t.toFixed(2)} ` +
    `H ${(r - R).toFixed(2)} A ${R} ${R} 0 0 1 ${r.toFixed(2)} ${(t + R).toFixed(2)} ` +
    `V ${(b - R).toFixed(2)} A ${R} ${R} 0 0 1 ${(r - R).toFixed(2)} ${b.toFixed(2)} ` +
    `H ${(l + R).toFixed(2)} A ${R} ${R} 0 0 1 ${l.toFixed(2)} ${(b - R).toFixed(2)} ` +
    `V ${(t + R).toFixed(2)} A ${R} ${R} 0 0 1 ${(l + R).toFixed(2)} ${t.toFixed(2)} Z`
  );
}

export function LineRig() {
  const lineRef = useRef<SVGPathElement>(null);
  const glowRef = useRef<SVGPathElement>(null);
  const textRef = useRef<SVGGElement>(null);
  const [entered, setEntered] = useState(false);

  useEffect(() => {
    const id = window.setTimeout(() => setEntered(true), 120);
    return () => window.clearTimeout(id);
  }, []);

  useEffect(() => {
    const reduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    let cur = 0;
    let target = 0;
    let raf = 0;
    let running = false;

    const apply = (p: number) => {
      const e = sstep(p);
      const l = lerp(LINE.l, FRAME.l, e);
      const t = lerp(LINE.t, FRAME.t, e);
      const r = lerp(LINE.r, FRAME.r, e);
      const b = lerp(LINE.b, FRAME.b, e);
      const rad = lerp(LINE.rad, FRAME.rad, e);
      const d = rrPath(l, t, r, b, rad);
      lineRef.current?.setAttribute("d", d);
      glowRef.current?.setAttribute("d", d);
      // wordmark fades + lifts as the frame forms
      const tg = textRef.current;
      if (tg) {
        const fade = 1 - sstep(clamp01(p / 0.55));
        tg.setAttribute("opacity", (fade * 0.9).toFixed(3));
        tg.setAttribute("transform", `translate(0 ${(-e * 6).toFixed(2)})`);
      }
    };

    const measure = () => {
      const max = window.innerHeight * 0.85;
      target = clamp01(window.scrollY / (max || 1));
    };

    const tick = () => {
      cur += (target - cur) * (reduced ? 1 : 0.16);
      apply(cur);
      if (Math.abs(target - cur) < 0.0008) {
        cur = target;
        apply(cur);
        running = false;
        return;
      }
      raf = requestAnimationFrame(tick);
    };
    const kick = () => {
      if (running) return;
      running = true;
      raf = requestAnimationFrame(tick);
    };

    measure();
    cur = target;
    apply(cur);

    const onScroll = () => {
      measure();
      kick();
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    const onVis = () => {
      if (document.hidden) {
        cancelAnimationFrame(raf);
        running = false;
      } else kick();
    };
    document.addEventListener("visibilitychange", onVis);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      document.removeEventListener("visibilitychange", onVis);
    };
  }, []);

  return (
    <svg
      aria-hidden
      className="pointer-events-none fixed inset-0 -z-[5] h-full w-full"
      viewBox="0 0 100 100"
      preserveAspectRatio="xMidYMid meet"
      fill="none"
    >
      <g
        ref={textRef}
        style={{
          opacity: entered ? 0.9 : 0,
          transform: entered ? "translateY(0)" : "translateY(6px)",
          transition:
            "opacity 1.1s cubic-bezier(.22,1,.36,1), transform 1.1s cubic-bezier(.22,1,.36,1)",
        }}
      >
        <text
          x="50"
          y="52.5"
          textAnchor="middle"
          fill="none"
          stroke="rgb(var(--orange))"
          strokeWidth={0.34}
          style={{
            fontFamily: "var(--font-anton), Impact, sans-serif",
            fontSize: "11px",
            letterSpacing: "0.5px",
            textTransform: "uppercase",
          }}
        >
          CREATIVE TECH.
        </text>
      </g>

      <path
        ref={glowRef}
        stroke="rgb(var(--orange))"
        strokeWidth={1.6}
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity={0.22}
        style={{ filter: "blur(1.4px)" }}
      />
      <path
        ref={lineRef}
        stroke="rgb(var(--orange))"
        strokeWidth={0.5}
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity={0.7}
      />
    </svg>
  );
}
