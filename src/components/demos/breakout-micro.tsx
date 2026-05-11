"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

type GameState = "idle" | "playing" | "won" | "dead";

interface Brick {
  x: number;
  y: number;
  r: number;
  alive: boolean;
}

export function BreakoutMicro({ className }: { className?: string }) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [hint, setHint] = useState("DRAG TO PLAY");
  const [state, setState] = useState<GameState>("idle");

  useEffect(() => {
    const wrap = wrapRef.current;
    const canvas = canvasRef.current;
    if (!wrap || !canvas) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const W = wrap.offsetWidth;
    const H = wrap.offsetHeight;
    canvas.width = W * dpr;
    canvas.height = H * dpr;
    canvas.style.width = W + "px";
    canvas.style.height = H + "px";
    const ctx = canvas.getContext("2d")!;
    ctx.scale(dpr, dpr);

    const COLS = 7;
    const ROWS = 4;
    const BRICKH = 14;
    const BRICKGAP = 3;
    const MARGX = 8;
    const MARGT = 22;
    const BRICKW = (W - MARGX * 2 - (COLS - 1) * BRICKGAP) / COLS;
    const PADDLE_W = 64;
    const PADDLE_H = 7;
    const PADDLE_Y = H - 22;
    const BALL_R = 5;
    const ROW_COLORS = ["#ff4500", "#ff5820", "#ff6e40", "#ff8460"];

    let st: GameState = "idle";
    let score = 0;
    let lives = 3;
    let paddleX = W / 2;
    let ball = {
      x: W / 2,
      y: H * 0.58,
      vx: (Math.random() > 0.5 ? 1 : -1) * 2.8,
      vy: -3.8,
    };
    let bricks: Brick[] = [];

    const resetGame = () => {
      score = 0;
      lives = 3;
      paddleX = W / 2;
      ball = {
        x: W / 2,
        y: H * 0.58,
        vx: (Math.random() > 0.5 ? 1 : -1) * 2.8,
        vy: -3.8,
      };
      bricks = [];
      for (let r = 0; r < ROWS; r++) {
        for (let c = 0; c < COLS; c++) {
          bricks.push({
            x: MARGX + c * (BRICKW + BRICKGAP),
            y: MARGT + r * (BRICKH + BRICKGAP),
            r,
            alive: true,
          });
        }
      }
    };

    const movePaddle = (clientX: number) => {
      const rect = wrap.getBoundingClientRect();
      paddleX = Math.max(
        PADDLE_W / 2,
        Math.min(W - PADDLE_W / 2, clientX - rect.left),
      );
    };

    const onMove = (e: PointerEvent) => movePaddle(e.clientX);
    const onDown = (e: PointerEvent) => {
      movePaddle(e.clientX);
      if (st !== "playing") {
        resetGame();
        st = "playing";
        setState("playing");
        setHint("");
      }
    };

    wrap.addEventListener("pointermove", onMove);
    wrap.addEventListener("pointerdown", onDown);

    resetGame();

    let raf = 0;
    const loop = () => {
      ctx.fillStyle = "#050505";
      ctx.fillRect(0, 0, W, H);

      bricks.forEach((b) => {
        if (!b.alive) return;
        ctx.fillStyle = ROW_COLORS[b.r];
        ctx.fillRect(b.x, b.y, BRICKW, BRICKH);
        ctx.fillStyle = "rgba(255,255,255,0.14)";
        ctx.fillRect(b.x, b.y, BRICKW, 2);
      });

      const px = paddleX - PADDLE_W / 2;
      ctx.fillStyle = "rgba(255,255,255,0.92)";
      ctx.fillRect(px, PADDLE_Y, PADDLE_W, PADDLE_H);

      if (st === "playing") {
        ball.x += ball.vx;
        ball.y += ball.vy;

        if (ball.x - BALL_R < 0) {
          ball.x = BALL_R;
          ball.vx = Math.abs(ball.vx);
        }
        if (ball.x + BALL_R > W) {
          ball.x = W - BALL_R;
          ball.vx = -Math.abs(ball.vx);
        }
        if (ball.y - BALL_R < 0) {
          ball.y = BALL_R;
          ball.vy = Math.abs(ball.vy);
        }

        if (
          ball.y + BALL_R >= PADDLE_Y &&
          ball.y - BALL_R <= PADDLE_Y + PADDLE_H &&
          ball.x >= px &&
          ball.x <= px + PADDLE_W
        ) {
          ball.vy = -Math.abs(ball.vy);
          ball.vx = ((ball.x - paddleX) / (PADDLE_W / 2)) * 4;
        }

        bricks.forEach((b) => {
          if (!b.alive) return;
          const bx2 = b.x + BRICKW;
          const by2 = b.y + BRICKH;
          if (
            ball.x + BALL_R > b.x &&
            ball.x - BALL_R < bx2 &&
            ball.y + BALL_R > b.y &&
            ball.y - BALL_R < by2
          ) {
            b.alive = false;
            score++;
            const ox = Math.min(
              Math.abs(ball.x - b.x),
              Math.abs(ball.x - bx2),
            );
            const oy = Math.min(
              Math.abs(ball.y - b.y),
              Math.abs(ball.y - by2),
            );
            if (oy < ox) ball.vy *= -1;
            else ball.vx *= -1;
          }
        });

        if (bricks.every((b) => !b.alive)) {
          st = "won";
          setState("won");
          setHint("YOU WIN — TAP TO RETRY");
        }
        if (ball.y - BALL_R > H) {
          lives--;
          if (lives <= 0) {
            st = "dead";
            setState("dead");
            setHint("GAME OVER — TAP TO RETRY");
          } else {
            ball.x = W / 2;
            ball.y = H * 0.58;
            ball.vx = (Math.random() > 0.5 ? 1 : -1) * 2.8;
            ball.vy = -3.8;
          }
        }
      }

      ctx.beginPath();
      ctx.arc(ball.x, ball.y, BALL_R + 4, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(255,100,40,0.25)";
      ctx.fill();
      ctx.beginPath();
      ctx.arc(ball.x, ball.y, BALL_R, 0, Math.PI * 2);
      ctx.fillStyle = "#fff";
      ctx.fill();

      ctx.fillStyle = "rgba(255,255,255,0.4)";
      ctx.font = '9px "JetBrains Mono"';
      ctx.textAlign = "left";
      ctx.fillText("SCORE " + score, 6, H - 6);
      ctx.textAlign = "right";
      ctx.fillText("♥ ".repeat(lives).trim(), W - 6, H - 6);

      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(raf);
      wrap.removeEventListener("pointermove", onMove);
      wrap.removeEventListener("pointerdown", onDown);
    };
  }, []);

  return (
    <div
      ref={wrapRef}
      className={cn(
        "relative overflow-hidden rounded-sm bg-[#050505] touch-none select-none cursor-none",
        className,
      )}
    >
      <canvas ref={canvasRef} className="absolute inset-0" />
      {hint && (
        <div className="f-mono pointer-events-none absolute inset-0 flex flex-col items-center justify-center gap-2 bg-black/70 text-center">
          <span className="f-anton text-lg tracking-[0.2em] text-orange">
            {state === "won" ? "YOU WIN" : state === "dead" ? "GAME OVER" : "BREAKOUT"}
          </span>
          <span className="text-[0.5rem] tracking-[0.2em] text-white/50">
            {hint}
          </span>
        </div>
      )}
    </div>
  );
}
