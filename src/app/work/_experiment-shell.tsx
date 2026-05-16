"use client";

import Link from "next/link";
import { Maximize2, SlidersHorizontal, X } from "lucide-react";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";

const ctrl =
  "f-mono pointer-events-auto inline-flex items-center gap-2 rounded-sm border border-white/15 bg-black/60 px-3 py-2 text-[0.55rem] tracking-[0.22em] text-white/70 backdrop-blur transition-colors hover:border-orange hover:text-orange focus-visible:border-orange focus-visible:text-orange";

export function ExperimentShell({
  label,
  title,
  controls,
  children,
}: {
  label: string;
  title: string;
  controls?: ReactNode;
  children: ReactNode;
}) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const [panel, setPanel] = useState(false);
  const [isFs, setIsFs] = useState(false);

  useEffect(() => {
    const onChange = () => setIsFs(Boolean(document.fullscreenElement));
    document.addEventListener("fullscreenchange", onChange);
    return () => document.removeEventListener("fullscreenchange", onChange);
  }, []);

  const toggleFullscreen = () => {
    const el = wrapRef.current;
    if (!el) return;
    if (document.fullscreenElement) void document.exitFullscreen();
    else void el.requestFullscreen?.();
  };

  return (
    <div
      ref={wrapRef}
      className="fixed inset-0 z-[80] touch-none overflow-hidden overscroll-none bg-black"
    >
      <div className="absolute inset-0">{children}</div>

      <div
        className="pointer-events-none absolute top-0 left-0 z-10 flex flex-col gap-0.5 p-4"
        style={{ paddingTop: "max(1rem, env(safe-area-inset-top))" }}
      >
        <span className="f-mono text-[0.5rem] tracking-[0.25em] text-white/35">
          {label}
        </span>
        <span className="f-anton text-sm tracking-[0.18em] text-white/80">
          {title}
        </span>
      </div>

      {panel && controls && (
        <div
          className="absolute top-0 right-0 z-20 m-3 w-[min(19rem,82vw)] space-y-5 rounded-sm border border-white/15 bg-black/85 p-5 backdrop-blur"
          style={{ marginTop: "max(0.75rem, env(safe-area-inset-top))" }}
        >
          {controls}
        </div>
      )}

      <div
        className="pointer-events-none absolute right-0 bottom-0 z-20 flex flex-col items-end gap-2 p-3"
        style={{
          paddingBottom: "max(0.75rem, env(safe-area-inset-bottom))",
          paddingRight: "max(0.75rem, env(safe-area-inset-right))",
        }}
      >
        {controls && (
          <button
            onClick={() => setPanel((p) => !p)}
            className={ctrl}
            aria-label="Toggle controls"
            aria-pressed={panel}
          >
            <SlidersHorizontal className="size-3" />
            {panel ? "Hide" : "Controls"}
          </button>
        )}
        <button
          onClick={toggleFullscreen}
          className={ctrl}
          aria-label="Toggle fullscreen"
        >
          <Maximize2 className="size-3" />
          {isFs ? "Exit FS" : "Fullscreen"}
        </button>
        <Link href="/#work" className={ctrl} aria-label="Exit to portfolio">
          <X className="size-3" /> Exit
        </Link>
      </div>
    </div>
  );
}

export function Range({
  label,
  value,
  min,
  max,
  step = 1,
  onChange,
  fmt,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  onChange: (v: number) => void;
  fmt?: (v: number) => string;
}) {
  return (
    <label className="block select-none">
      <span className="f-mono flex items-center justify-between text-[0.55rem] tracking-[0.18em] text-white/50">
        <span>{label}</span>
        <span className="text-orange">{fmt ? fmt(value) : value}</span>
      </span>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="mt-2 w-full accent-orange"
      />
    </label>
  );
}

export function Toggle({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <button
      onClick={() => onChange(!checked)}
      aria-pressed={checked}
      className="f-mono flex w-full select-none items-center justify-between text-[0.55rem] tracking-[0.18em] text-white/50"
    >
      <span>{label}</span>
      <span
        className={cn(
          "relative inline-block h-3.5 w-7 rounded-full border transition-colors",
          checked ? "border-orange bg-orange/30" : "border-white/20",
        )}
      >
        <span
          className={cn(
            "absolute top-1/2 size-2 -translate-y-1/2 rounded-full bg-white transition-all",
            checked ? "left-[calc(100%-0.625rem)]" : "left-0.5",
          )}
        />
      </span>
    </button>
  );
}

export function ActionButton({
  label,
  onClick,
}: {
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="f-mono w-full rounded-sm border border-white/15 px-3 py-2 text-[0.55rem] tracking-[0.22em] text-white/70 transition-colors hover:border-orange hover:text-orange focus-visible:border-orange focus-visible:text-orange"
    >
      {label}
    </button>
  );
}
