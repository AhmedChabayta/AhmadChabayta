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

    const clamp01 = (x: number) => Math.max(0, Math.min(1, x));
    const ease = (x: number) => x * x * (3 - 2 * x);

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
      const hero = document.querySelector<HTMLElement>('[data-line="hero"]');
      const screen = document.querySelector<HTMLElement>(
        '[data-line="screen"]',
      );

      // underscore box, measured under the hero title
      let u: Box | null = null;
      let heroOn = false;
      if (hero) {
        const hr = hero.getBoundingClientRect();
        heroOn = hr.bottom > vh * 0.16 && hr.top < vh * 0.95;
        const gap = Math.max(12, hr.height * 0.18);
        const y = hr.bottom + gap;
        u = { l: hr.left, t: y, r: hr.right, b: y + 3, rad: 2, op: 0.8 };
      }

      if (screen) {
        const r = screen.getBoundingClientRect();
        const pad = 6;
        const S: Box = {
          l: r.left - pad,
          t: r.top - pad,
          r: r.right + pad,
          b: r.bottom + pad,
          rad: 14,
          op: 0.88,
        };
        const base =
          u ?? {
            l: r.left + r.width * 0.32,
            t: r.top - 44,
            r: r.right - r.width * 0.32,
            b: r.top - 41,
            rad: 2,
            op: 0.8,
          };
        // continuous blend underscore → screen as it rises into view
        const k = ease(clamp01((vh * 0.82 - r.top) / (vh * 0.5)));
        tgt.l = base.l + (S.l - base.l) * k;
        tgt.t = base.t + (S.t - base.t) * k;
        tgt.r = base.r + (S.r - base.r) * k;
        tgt.b = base.b + (S.b - base.b) * k;
        tgt.rad = base.rad + (S.rad - base.rad) * k;
        let op = 0.88;
        if (k < 0.02) op = base.op; // pure underscore
        if (r.bottom < vh * 0.16) op = 0.88 * clamp01(r.bottom / (vh * 0.16));
        if (r.top > vh * 1.45 && !heroOn) op = 0;
        tgt.op = op;
        return;
      }

      if (u) {
        tgt.l = u.l;
        tgt.t = u.t;
        tgt.r = u.r;
        tgt.b = u.b;
        tgt.rad = u.rad;
        tgt.op = heroOn ? 0.8 : 0;
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
    const settle = window.setTimeout(() => kick(), 500);

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
