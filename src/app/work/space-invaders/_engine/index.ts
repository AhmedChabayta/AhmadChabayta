// Boots the engine against a canvas: DPR-aware sizing, a clamped rAF loop,
// and run persistence when the tab is hidden/closed. Returns a disposer.
import { Game } from "./game";

export interface GameHandle {
  destroy(): void;
}

export function createGame(canvas: HTMLCanvasElement): GameHandle {
  const ctx = canvas.getContext("2d", { alpha: false });
  if (!ctx) throw new Error("Canvas 2D unavailable");

  canvas.style.touchAction = "none";
  canvas.style.display = "block";

  const game = new Game(canvas, ctx);

  let dpr = 1;
  const resize = (): void => {
    const r = canvas.getBoundingClientRect();
    const w = Math.max(1, Math.round(r.width));
    const h = Math.max(1, Math.round(r.height));
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.round(w * dpr);
    canvas.height = Math.round(h * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    game.setSize(w, h);
  };
  resize();

  const ro = new ResizeObserver(resize);
  ro.observe(canvas);

  let raf = 0;
  let last = performance.now();
  const loop = (now: number): void => {
    const dt = Math.min(0.05, Math.max(0, (now - last) / 1000));
    last = now;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    game.frame(dt);
    raf = requestAnimationFrame(loop);
  };
  raf = requestAnimationFrame(loop);

  const onHide = (): void => game.persist();
  document.addEventListener("visibilitychange", onHide);
  window.addEventListener("pagehide", onHide);

  return {
    destroy(): void {
      cancelAnimationFrame(raf);
      ro.disconnect();
      document.removeEventListener("visibilitychange", onHide);
      window.removeEventListener("pagehide", onHide);
      game.destroy();
    },
  };
}
