"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Maximize2, Download, Share, X } from "lucide-react";
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
      /* 2D context unsupported — extremely rare */
    }
    return () => handle?.destroy();
  }, []);

  useEffect(() => {
    if (process.env.NODE_ENV === "production" && "serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js", { scope: "/" }).catch(() => {});
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

  const toggleFullscreen = () => {
    const el = wrapRef.current;
    if (!el) return;
    if (!document.fullscreenElement) void el.requestFullscreen?.();
    else void document.exitFullscreen?.();
  };

  const ctrl =
    "pointer-events-auto inline-flex items-center gap-2 rounded-md border border-white/15 bg-black/55 px-3 py-2 text-[0.6rem] font-mono uppercase tracking-[0.2em] text-white/70 backdrop-blur-sm transition-colors hover:border-white/40 hover:text-white";

  return (
    <div
      ref={wrapRef}
      className="fixed inset-0 z-[80] touch-none overscroll-none bg-black"
      style={{ height: "100dvh", width: "100vw" }}
    >
      <canvas
        ref={canvasRef}
        className="absolute inset-0 h-full w-full select-none"
        aria-label="Void Invaders — playable game canvas"
      />

      {/* Floating controls, bottom-right — clear of every in-game HUD zone */}
      <div
        className="pointer-events-none absolute right-0 bottom-0 z-10 flex flex-col items-end gap-2 p-3"
        style={{
          paddingBottom: "max(0.75rem, env(safe-area-inset-bottom))",
          paddingRight: "max(0.75rem, env(safe-area-inset-right))",
        }}
      >
        {!installed && deferred && (
          <button onClick={install} className={ctrl} aria-label="Install app">
            <Download className="size-3" /> Install
          </button>
        )}
        {!installed && isIOS && !deferred && (
          <span className={ctrl}>
            <Share className="size-3" /> Share → Add to Home Screen
          </span>
        )}
        <button
          onClick={toggleFullscreen}
          className={ctrl}
          aria-label="Toggle fullscreen"
        >
          <Maximize2 className="size-3" /> Fullscreen
        </button>
        <Link href="/#work" className={ctrl} aria-label="Exit to portfolio">
          <X className="size-3" /> Exit
        </Link>
      </div>
    </div>
  );
}
