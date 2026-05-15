"use client";

import { useEffect, useRef, useState } from "react";
import { Maximize2, Download, Share } from "lucide-react";
import { createGame, type GameHandle } from "./_engine";

interface BIPEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export function SpaceInvaders() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const [deferred, setDeferred] = useState<BIPEvent | null>(null);
  const [installed, setInstalled] = useState<boolean>(
    () =>
      typeof window !== "undefined" &&
      (window.matchMedia("(display-mode: standalone)").matches ||
        ("standalone" in navigator &&
          (navigator as { standalone?: boolean }).standalone === true)),
  );
  const isIOS = useState<boolean>(
    () =>
      typeof navigator !== "undefined" &&
      /iPad|iPhone|iPod/.test(navigator.userAgent) &&
      !("MSStream" in window),
  )[0];

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    let handle: GameHandle | null = null;
    try {
      handle = createGame(canvas);
    } catch {
      /* WebGL/2D unsupported — extremely rare */
    }
    return () => handle?.destroy();
  }, []);

  useEffect(() => {
    if (
      process.env.NODE_ENV === "production" &&
      "serviceWorker" in navigator
    ) {
      navigator.serviceWorker
        .register("/sw.js", { scope: "/" })
        .catch(() => {});
    }
    const onBIP = (e: Event) => {
      e.preventDefault();
      setDeferred(e as BIPEvent);
    };
    const onInstalled = () => {
      setInstalled(true);
      setDeferred(null);
    };
    window.addEventListener("beforeinstallprompt", onBIP);
    window.addEventListener("appinstalled", onInstalled);
    return () => {
      window.removeEventListener("beforeinstallprompt", onBIP);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);

  const install = async () => {
    if (!deferred) return;
    await deferred.prompt();
    await deferred.userChoice;
    setDeferred(null);
  };

  const goFullscreen = () => {
    const el = wrapRef.current;
    if (!el) return;
    if (!document.fullscreenElement) void el.requestFullscreen?.();
    else void document.exitFullscreen?.();
  };

  return (
    <div className="flex w-full flex-col items-center gap-4">
      <div
        ref={wrapRef}
        className="relative w-full max-w-[680px] overflow-hidden rounded-lg border border-border bg-black shadow-[0_0_60px_-12px_rgba(140,80,255,0.5)]"
        style={{ height: "min(82vh, 920px)" }}
      >
        <canvas
          ref={canvasRef}
          className="h-full w-full select-none"
          aria-label="Void Invaders game canvas"
        />
      </div>

      <div className="flex flex-wrap items-center justify-center gap-3">
        <button
          onClick={goFullscreen}
          className="f-mono inline-flex items-center gap-2 border border-border px-3 py-2 text-[0.6rem] tracking-[0.2em] text-muted-foreground transition-colors hover:border-orange hover:text-orange"
        >
          <Maximize2 className="size-3" /> FULLSCREEN
        </button>

        {!installed && deferred && (
          <button
            onClick={install}
            className="f-mono inline-flex items-center gap-2 border border-orange/50 bg-orange/10 px-3 py-2 text-[0.6rem] tracking-[0.2em] text-orange transition-colors hover:bg-orange/20"
          >
            <Download className="size-3" /> INSTALL APP
          </button>
        )}

        {!installed && isIOS && !deferred && (
          <span className="f-mono inline-flex items-center gap-2 border border-border px-3 py-2 text-[0.55rem] tracking-[0.15em] text-muted-foreground">
            <Share className="size-3" /> SHARE → ADD TO HOME SCREEN
          </span>
        )}

        {installed && (
          <span className="f-mono inline-flex items-center gap-2 border border-border px-3 py-2 text-[0.55rem] tracking-[0.2em] text-muted-foreground">
            INSTALLED · OFFLINE READY
          </span>
        )}
      </div>
    </div>
  );
}
