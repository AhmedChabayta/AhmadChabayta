"use client";

import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

export function WaveSynth({ className }: { className?: string }) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

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

    let mx = 0.5;
    let my = 0.5;
    let waveTime = 0;

    const update = (e: PointerEvent) => {
      const r = wrap.getBoundingClientRect();
      mx = (e.clientX - r.left) / r.width;
      my = (e.clientY - r.top) / r.height;
    };
    wrap.addEventListener("pointermove", update);
    wrap.addEventListener("pointerdown", update);

    const drawLayer = (
      freqMult: number,
      ampMult: number,
      phase: number,
      alpha: number,
      lw: number,
    ) => {
      const amp = 12 + ampMult * 58;
      const freq = 1 + freqMult * 4.5;
      ctx.beginPath();
      for (let x = 0; x <= W; x += 2) {
        const t = (x / W) * Math.PI * 2 * freq + waveTime + phase;
        const y =
          H / 2 + Math.sin(t) * amp * Math.sin(t * 0.5 + waveTime * 0.28);
        if (x === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.strokeStyle = `rgba(255,${Math.round(69 + alpha * 60)},0,${alpha})`;
      ctx.lineWidth = lw;
      ctx.stroke();
    };

    let raf = 0;
    const loop = () => {
      ctx.fillStyle = "rgba(5,5,5,0.30)";
      ctx.fillRect(0, 0, W, H);
      ctx.shadowBlur = 10;
      ctx.shadowColor = "rgba(255,69,0,0.35)";
      drawLayer(mx, 1 - my, 0, 0.9, 1.8);
      drawLayer(mx, 1 - my, Math.PI * 0.65, 0.55, 1.1);
      drawLayer(mx, 1 - my, Math.PI * 1.3, 0.28, 0.7);
      ctx.shadowBlur = 0;
      waveTime += 0.022 + mx * 0.04;
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
      wrap.removeEventListener("pointermove", update);
      wrap.removeEventListener("pointerdown", update);
    };
  }, []);

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
        DRAG · X=FREQ · Y=AMP
      </div>
    </div>
  );
}
