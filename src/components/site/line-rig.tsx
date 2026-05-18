"use client";

import { useEffect, useRef } from "react";

/**
 * The signal line, measured — not guessed.
 *
 * A fixed full-viewport overlay that reads the REAL bounding boxes of
 * anchored DOM elements ([data-line="hero"] and every
 * [data-line="card"]) and eases a single rounded-rect stroke between
 * them: a thin underscore exactly under the hero title, morphing into
 * the actual project-card frame, tracking whichever card is nearest
 * the viewport centre as you scroll. Recomputed from getBoundingClientRect
 * every frame while moving, so it always lines up. aria-hidden +
 * pointer-events-none → zero a11y/interaction impact.
 */

type Box = { l: number; t: number; r: number; b: number; rad: number; op: number };

function rrPath({ l, t, r, b, rad }: Box): string {
  const w = r - l;
  const h = b - t;
  const R = Math.max(0, Math.min(rad, Math.abs(w) / 2, Math.abs(h) / 2));
  return (
    `M ${(l + R).toFixed(1)} ${t.toFixed(1)} ` +
    `H ${(r - R).toFixed(1)} ` +
    `A ${R.toFixed(1)} ${R.toFixed(1)} 0 0 1 ${r.toFixed(1)} ${(t + R).toFixed(1)} ` +
    `V ${(b - R).toFixed(1)} ` +
    `A ${R.toFixed(1)} ${R.toFixed(1)} 0 0 1 ${(r - R).toFixed(1)} ${b.toFixed(1)} ` +
    `H ${(l + R).toFixed(1)} ` +
    `A ${R.toFixed(1)} ${R.toFixed(1)} 0 0 1 ${l.toFixed(1)} ${(b - R).toFixed(1)} ` +
    `V ${(t + R).toFixed(1)} ` +
    `A ${R.toFixed(1)} ${R.toFixed(1)} 0 0 1 ${(l + R).toFixed(1)} ${t.toFixed(1)} Z`
  );
}

export function LineRig() {
  const svgRef = useRef<SVGSVGElement>(null);
  const lineRef = useRef<SVGPathElement>(null);
  const glowRef = useRef<SVGPathElement>(null);

  useEffect(() => {
    const svg = svgRef.current;
    if (!svg) return;
    const reduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    let W = window.innerWidth;
    let H = window.innerHeight;
    const setVB = () => {
      W = window.innerWidth;
      H = window.innerHeight;
      svg.setAttribute("viewBox", `0 0 ${W} ${H}`);
    };
    setVB();

    let hero: HTMLElement | null = null;
    let cards: HTMLElement[] = [];
    const collect = () => {
      hero = document.querySelector('[data-line="hero"]');
      cards = Array.from(
        document.querySelectorAll<HTMLElement>('[data-line="card"]'),
      );
    };
    collect();

    const cur: Box = {
      l: W * 0.28,
      t: H * 0.52,
      r: W * 0.72,
      b: H * 0.52 + 3,
      rad: 2,
      op: 0,
    };
    const tgt: Box = { ...cur };

    const computeTarget = () => {
      const vh = H;
      const cy = vh * 0.5;
      if (hero) {
        const hr = hero.getBoundingClientRect();
        if (hr.bottom > vh * 0.16 && hr.top < vh * 0.92) {
          const gap = Math.max(12, hr.height * 0.18);
          const y = hr.bottom + gap;
          tgt.l = hr.left;
          tgt.t = y;
          tgt.r = hr.right;
          tgt.b = y + 3;
          tgt.rad = 2;
          tgt.op = 0.8;
          return;
        }
      }
      let best: HTMLElement | null = null;
      let bestD = Infinity;
      for (const c of cards) {
        const r = c.getBoundingClientRect();
        const d = Math.abs((r.top + r.bottom) / 2 - cy);
        if (d < bestD) {
          bestD = d;
          best = c;
        }
      }
      if (best && bestD < vh * 1.5) {
        const r = best.getBoundingClientRect();
        const pad = 7;
        tgt.l = r.left - pad;
        tgt.t = r.top - pad;
        tgt.r = r.right + pad;
        tgt.b = r.bottom + pad;
        tgt.rad = 12;
        tgt.op = 0.85;
        return;
      }
      tgt.op = 0;
    };

    const draw = () => {
      const d = rrPath(cur);
      lineRef.current?.setAttribute("d", d);
      glowRef.current?.setAttribute("d", d);
      lineRef.current?.setAttribute("opacity", cur.op.toFixed(3));
      glowRef.current?.setAttribute("opacity", (cur.op * 0.34).toFixed(3));
    };

    const F = reduced ? 1 : 0.18;
    const lerp = (a: number, b: number) => a + (b - a) * F;
    let raf = 0;
    let running = false;
    const tick = () => {
      computeTarget();
      cur.l = lerp(cur.l, tgt.l);
      cur.t = lerp(cur.t, tgt.t);
      cur.r = lerp(cur.r, tgt.r);
      cur.b = lerp(cur.b, tgt.b);
      cur.rad = lerp(cur.rad, tgt.rad);
      cur.op = lerp(cur.op, tgt.op);
      draw();
      const dist =
        Math.abs(cur.l - tgt.l) +
        Math.abs(cur.t - tgt.t) +
        Math.abs(cur.r - tgt.r) +
        Math.abs(cur.b - tgt.b) +
        Math.abs(cur.op - tgt.op) * 100;
      if (dist < 0.6) {
        cur.l = tgt.l;
        cur.t = tgt.t;
        cur.r = tgt.r;
        cur.b = tgt.b;
        cur.rad = tgt.rad;
        cur.op = tgt.op;
        draw();
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

    computeTarget();
    cur.l = tgt.l;
    cur.t = tgt.t;
    cur.r = tgt.r;
    cur.b = tgt.b;
    cur.rad = tgt.rad;
    cur.op = 0;
    draw();
    kick();

    const onScroll = () => kick();
    const onResize = () => {
      setVB();
      collect();
      kick();
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onResize);
    const onVis = () => {
      if (document.hidden) {
        cancelAnimationFrame(raf);
        running = false;
      } else kick();
    };
    document.addEventListener("visibilitychange", onVis);
    const settle = window.setTimeout(() => {
      collect();
      kick();
    }, 500);

    return () => {
      cancelAnimationFrame(raf);
      clearTimeout(settle);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
      document.removeEventListener("visibilitychange", onVis);
    };
  }, []);

  return (
    <svg
      ref={svgRef}
      aria-hidden
      className="pointer-events-none fixed inset-0 z-30 h-full w-full"
      fill="none"
    >
      <path
        ref={glowRef}
        stroke="rgb(var(--orange))"
        strokeWidth={7}
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity={0}
        style={{ filter: "blur(6px)" }}
      />
      <path
        ref={lineRef}
        stroke="rgb(var(--orange))"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity={0}
      />
    </svg>
  );
}
