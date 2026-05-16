"use client";

import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  sz: number;
}

export function ParticleField({
  className,
  count = 120,
  gravity = 1,
  trail = 0.2,
  paused = false,
}: {
  className?: string;
  count?: number;
  gravity?: number;
  trail?: number;
  paused?: boolean;
}) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const live = useRef({ gravity, trail, paused });

  useEffect(() => {
    live.current = { gravity, trail, paused };
  }, [gravity, trail, paused]);

  useEffect(() => {
    const wrap = wrapRef.current;
    const canvas = canvasRef.current;
    if (!wrap || !canvas) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    let W = wrap.offsetWidth;
    let H = wrap.offsetHeight;
    canvas.width = W * dpr;
    canvas.height = H * dpr;
    canvas.style.width = W + "px";
    canvas.style.height = H + "px";
    const ctx = canvas.getContext("2d")!;
    ctx.scale(dpr, dpr);

    let mx = W / 2;
    let my = H / 2;
    let bursting = false;
    let burstTimer = 0;

    const particles: Particle[] = Array.from({ length: count }, () => ({
      x: Math.random() * W,
      y: Math.random() * H,
      vx: (Math.random() - 0.5) * 1.5,
      vy: (Math.random() - 0.5) * 1.5,
      sz: Math.random() * 1.4 + 0.4,
    }));

    const setAttractor = (clientX: number, clientY: number) => {
      const r = wrap.getBoundingClientRect();
      mx = clientX - r.left;
      my = clientY - r.top;
    };

    const triggerBurst = () => {
      bursting = true;
      burstTimer = 0;
      particles.forEach((p) => {
        const dx = p.x - mx;
        const dy = p.y - my;
        const dist = Math.sqrt(dx * dx + dy * dy) || 1;
        const f = 300 / dist;
        p.vx += (dx / dist) * f * 0.08;
        p.vy += (dy / dist) * f * 0.08;
      });
    };

    const onMove = (e: PointerEvent) => setAttractor(e.clientX, e.clientY);
    const onDown = (e: PointerEvent) => {
      setAttractor(e.clientX, e.clientY);
      triggerBurst();
    };
    const onLeave = (e: PointerEvent) => {
      if (e.pointerType !== "touch") {
        mx = W / 2;
        my = H / 2;
      }
    };

    wrap.addEventListener("pointermove", onMove);
    wrap.addEventListener("pointerdown", onDown);
    wrap.addEventListener("pointerleave", onLeave);

    let raf = 0;
    const loop = () => {
      const { gravity: g, trail: tr, paused: pz } = live.current;
      ctx.fillStyle = `rgba(5,5,5,${tr})`;
      ctx.fillRect(0, 0, W, H);

      burstTimer++;
      if (burstTimer > 80) bursting = false;

      particles.forEach((p) => {
        if (!pz) {
          if (!bursting) {
            const dx = mx - p.x;
            const dy = my - p.y;
            const dist = Math.sqrt(dx * dx + dy * dy) + 0.001;
            const f = Math.min(1800 / (dist * dist), 0.9);
            p.vx += dx * f * 0.001 * g;
            p.vy += dy * f * 0.001 * g;
          }
          p.vx *= 0.97;
          p.vy *= 0.97;
          p.x += p.vx;
          p.y += p.vy;
          if (p.x < 0) p.x = W;
          if (p.x > W) p.x = 0;
          if (p.y < 0) p.y = H;
          if (p.y > H) p.y = 0;
        }

        const dx = mx - p.x;
        const dy = my - p.y;
        const d = Math.sqrt(dx * dx + dy * dy);
        const a = Math.min(0.95, 80 / d + 0.08);
        const gg = Math.min(255, 50 + d * 0.4) | 0;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.sz, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255,${gg},0,${a})`;
        ctx.fill();
      });

      ctx.beginPath();
      ctx.arc(mx, my, 5, 0, Math.PI * 2);
      ctx.strokeStyle = "rgba(255,69,0,0.7)";
      ctx.lineWidth = 1;
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(mx, my, 22, 0, Math.PI * 2);
      ctx.strokeStyle = "rgba(255,69,0,0.15)";
      ctx.stroke();

      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);

    const ro = new ResizeObserver(() => {
      W = wrap.offsetWidth;
      H = wrap.offsetHeight;
      canvas.width = W * dpr;
      canvas.height = H * dpr;
      canvas.style.width = W + "px";
      canvas.style.height = H + "px";
      ctx.scale(dpr, dpr);
    });
    ro.observe(wrap);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      wrap.removeEventListener("pointermove", onMove);
      wrap.removeEventListener("pointerdown", onDown);
      wrap.removeEventListener("pointerleave", onLeave);
    };
  }, [count]);

  return (
    <div
      ref={wrapRef}
      className={cn(
        "relative overflow-hidden rounded-sm bg-[#050505] touch-none select-none",
        className,
      )}
    >
      <canvas ref={canvasRef} className="absolute inset-0" />
      <div className="f-mono pointer-events-none absolute bottom-2 left-1/2 -translate-x-1/2 text-[0.45rem] tracking-[0.22em] text-white/30 whitespace-nowrap">
        DRAG · TAP TO BURST
      </div>
    </div>
  );
}
