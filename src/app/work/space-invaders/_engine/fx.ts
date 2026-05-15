// Visual juice: pooled additive particles, a parallax starfield with drifting
// nebulae and a hyperspace warp, screen-shake / flash, floating text, and a
// cached CRT scanline + vignette overlay. All tuned to read as "trippy".
import { TAU, clamp, hsla } from "./types";

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  max: number;
  size: number;
  hue: number;
  sat: number;
  lum: number;
  grav: number;
  drag: number;
  kind: 0 | 1 | 2; // dot | spark-line | ring
  alive: boolean;
}

interface FloatText {
  x: number;
  y: number;
  vy: number;
  life: number;
  max: number;
  text: string;
  color: string;
  size: number;
}

interface Star {
  x: number;
  y: number;
  z: number;
  s: number;
  tw: number;
}

export class FX {
  private parts: Particle[] = [];
  private texts: FloatText[] = [];
  private layers: Star[][] = [[], [], []];
  private nebula: { x: number; y: number; r: number; h: number; vx: number }[] =
    [];
  hue = 280;
  lowFlash = false;

  private trauma = 0;
  private flashCol = "#fff";
  private flashA = 0;
  private warpT = 0;
  private warpDur = 0;
  private W = 0;
  private H = 0;
  private vignette: CanvasGradient | null = null;

  resize(w: number, h: number): void {
    this.W = w;
    this.H = h;
    const dens = (w * h) / 9000;
    this.layers = [0.18, 0.42, 0.85].map((z) =>
      Array.from({ length: Math.floor(dens * (z < 0.5 ? 1.4 : 0.7)) }, () => ({
        x: Math.random() * w,
        y: Math.random() * h,
        z,
        s: z * 1.8 + Math.random() * 0.8,
        tw: Math.random() * TAU,
      })),
    );
    this.nebula = Array.from({ length: 5 }, (_, i) => ({
      x: Math.random() * w,
      y: Math.random() * h,
      r: Math.min(w, h) * (0.4 + Math.random() * 0.5),
      h: i * 60,
      vx: (Math.random() - 0.5) * 6,
    }));
  }

  setHue(h: number): void {
    this.hue = h;
  }

  private take(): Particle {
    for (const p of this.parts) if (!p.alive) return p;
    const p: Particle = {
      x: 0, y: 0, vx: 0, vy: 0, life: 0, max: 1, size: 1,
      hue: 0, sat: 100, lum: 60, grav: 0, drag: 0, kind: 0, alive: false,
    };
    if (this.parts.length < 1600) this.parts.push(p);
    return p;
  }

  burst(
    x: number,
    y: number,
    o: {
      n: number;
      hue: number;
      spd: number;
      life: number;
      size?: number;
      sat?: number;
      lum?: number;
      grav?: number;
      kind?: 0 | 1 | 2;
      spread?: number;
    },
  ): void {
    for (let i = 0; i < o.n; i++) {
      const p = this.take();
      const a = Math.random() * TAU;
      const sp = o.spd * (0.3 + Math.random() * 0.9);
      p.x = x;
      p.y = y;
      p.vx = Math.cos(a) * sp;
      p.vy = Math.sin(a) * sp;
      p.max = p.life = o.life * (0.6 + Math.random() * 0.7);
      p.size = (o.size ?? 3) * (0.6 + Math.random());
      p.hue = o.hue + (Math.random() - 0.5) * (o.spread ?? 50);
      p.sat = o.sat ?? 100;
      p.lum = o.lum ?? 62;
      p.grav = o.grav ?? 0;
      p.drag = 1.8;
      p.kind = o.kind ?? 0;
      p.alive = true;
    }
  }

  ring(x: number, y: number, hue: number, size = 60): void {
    const p = this.take();
    p.x = x;
    p.y = y;
    p.vx = 0;
    p.vy = 0;
    p.max = p.life = 0.45;
    p.size = size;
    p.hue = hue;
    p.sat = 100;
    p.lum = 70;
    p.grav = 0;
    p.drag = 0;
    p.kind = 2;
    p.alive = true;
  }

  trail(x: number, y: number, hue: number): void {
    const p = this.take();
    p.x = x + (Math.random() - 0.5) * 4;
    p.y = y;
    p.vx = (Math.random() - 0.5) * 30;
    p.vy = 120 + Math.random() * 90;
    p.max = p.life = 0.32;
    p.size = 3 + Math.random() * 2;
    p.hue = hue;
    p.sat = 100;
    p.lum = 65;
    p.grav = 0;
    p.drag = 1;
    p.kind = 0;
    p.alive = true;
  }

  text(x: number, y: number, t: string, color: string, size = 18): void {
    this.texts.push({ x, y, vy: -42, life: 0.9, max: 0.9, text: t, color, size });
  }

  shake(a: number): void {
    this.trauma = clamp(this.trauma + a, 0, 1);
  }
  flash(color: string, a: number): void {
    if (this.lowFlash) a *= 0.35;
    this.flashCol = color;
    this.flashA = Math.max(this.flashA, a);
  }
  warp(strength = 1): void {
    this.warpDur = 0.7 * strength;
    this.warpT = this.warpDur;
  }

  shakeOffset(): { x: number; y: number; r: number } {
    const t = this.trauma * this.trauma;
    const m = (this.lowFlash ? 7 : 16) * t;
    return {
      x: (Math.random() * 2 - 1) * m,
      y: (Math.random() * 2 - 1) * m,
      r: (Math.random() * 2 - 1) * 0.03 * t,
    };
  }

  update(dt: number, w: number, h: number): void {
    if (w !== this.W || h !== this.H) this.resize(w, h);
    this.trauma = Math.max(0, this.trauma - dt * 1.6);
    this.flashA = Math.max(0, this.flashA - dt * 3.4);
    this.warpT = Math.max(0, this.warpT - dt);
    const warp = this.warpDur > 0 ? this.warpT / this.warpDur : 0;

    for (const layer of this.layers)
      for (const st of layer) {
        st.y += (12 + st.z * 70 + warp * 1600 * st.z) * dt;
        st.tw += dt * 4;
        if (st.y > h + 4) {
          st.y = -4;
          st.x = Math.random() * w;
        }
      }
    for (const n of this.nebula) {
      n.x += n.vx * dt;
      if (n.x < -n.r) n.x = w + n.r;
      if (n.x > w + n.r) n.x = -n.r;
    }

    for (const p of this.parts) {
      if (!p.alive) continue;
      p.life -= dt;
      if (p.life <= 0) {
        p.alive = false;
        continue;
      }
      p.vy += p.grav * dt;
      p.vx -= p.vx * p.drag * dt;
      p.vy -= p.vy * p.drag * dt;
      p.x += p.vx * dt;
      p.y += p.vy * dt;
    }
    for (let i = this.texts.length - 1; i >= 0; i--) {
      const t = this.texts[i];
      t.life -= dt;
      t.y += t.vy * dt;
      t.vy *= 1 - 1.2 * dt;
      if (t.life <= 0) this.texts.splice(i, 1);
    }
  }

  drawBack(ctx: CanvasRenderingContext2D, w: number, h: number): void {
    const g = ctx.createLinearGradient(0, 0, 0, h);
    g.addColorStop(0, hsla(this.hue + 20, 70, 7, 1));
    g.addColorStop(0.5, hsla(this.hue - 30, 75, 4, 1));
    g.addColorStop(1, "#020008");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, w, h);

    ctx.globalCompositeOperation = "lighter";
    for (const n of this.nebula) {
      const rg = ctx.createRadialGradient(n.x, n.y, 0, n.x, n.y, n.r);
      rg.addColorStop(0, hsla(this.hue + n.h, 90, 50, 0.1));
      rg.addColorStop(0.6, hsla(this.hue + n.h, 90, 40, 0.04));
      rg.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = rg;
      ctx.fillRect(n.x - n.r, n.y - n.r, n.r * 2, n.r * 2);
    }
    const warping = this.warpT > 0;
    for (const layer of this.layers)
      for (const st of layer) {
        const tw = 0.55 + 0.45 * Math.sin(st.tw);
        ctx.fillStyle = hsla(this.hue + st.z * 80, 30, 92, tw);
        if (warping) {
          ctx.fillRect(st.x, st.y, st.s * 0.8, st.s * (6 + st.z * 30));
        } else {
          ctx.fillRect(st.x, st.y, st.s, st.s);
        }
      }
    ctx.globalCompositeOperation = "source-over";
  }

  drawFore(ctx: CanvasRenderingContext2D): void {
    ctx.globalCompositeOperation = "lighter";
    for (const p of this.parts) {
      if (!p.alive) continue;
      const a = clamp(p.life / p.max, 0, 1);
      const col = hsla(p.hue, p.sat, p.lum, a);
      if (p.kind === 2) {
        const r = p.size * (1 - a) + p.size * 0.2;
        ctx.strokeStyle = col;
        ctx.lineWidth = 2 + a * 3;
        ctx.beginPath();
        ctx.arc(p.x, p.y, r, 0, TAU);
        ctx.stroke();
      } else if (p.kind === 1) {
        ctx.strokeStyle = col;
        ctx.lineWidth = p.size;
        ctx.beginPath();
        ctx.moveTo(p.x, p.y);
        ctx.lineTo(p.x - p.vx * 0.04, p.y - p.vy * 0.04);
        ctx.stroke();
      } else {
        ctx.fillStyle = col;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * (0.4 + a), 0, TAU);
        ctx.fill();
      }
    }
    ctx.globalCompositeOperation = "source-over";

    for (const t of this.texts) {
      const a = clamp(t.life / t.max, 0, 1);
      const pop = 1 + (1 - a) * 0.4;
      ctx.save();
      ctx.globalAlpha = a;
      ctx.translate(t.x, t.y);
      ctx.scale(pop, pop);
      ctx.font = `700 ${t.size}px ui-monospace,monospace`;
      ctx.textAlign = "center";
      ctx.shadowColor = t.color;
      ctx.shadowBlur = 12;
      ctx.fillStyle = t.color;
      ctx.fillText(t.text, 0, 0);
      ctx.restore();
    }
  }

  drawOverlay(ctx: CanvasRenderingContext2D, w: number, h: number): void {
    if (this.flashA > 0.001) {
      ctx.fillStyle = this.flashCol;
      ctx.globalAlpha = clamp(this.flashA, 0, 0.8);
      ctx.fillRect(0, 0, w, h);
      ctx.globalAlpha = 1;
    }
    if (!this.lowFlash) {
      ctx.globalAlpha = 0.05;
      ctx.fillStyle = "#000";
      for (let y = 0; y < h; y += 3) ctx.fillRect(0, y, w, 1);
      ctx.globalAlpha = 1;
    }
    if (!this.vignette) {
      this.vignette = ctx.createRadialGradient(
        w / 2, h / 2, Math.min(w, h) * 0.35,
        w / 2, h / 2, Math.max(w, h) * 0.75,
      );
      this.vignette.addColorStop(0, "rgba(0,0,0,0)");
      this.vignette.addColorStop(1, "rgba(0,0,0,0.6)");
    }
    ctx.fillStyle = this.vignette;
    ctx.fillRect(0, 0, w, h);
  }

  reset(): void {
    for (const p of this.parts) p.alive = false;
    this.texts.length = 0;
    this.trauma = 0;
    this.flashA = 0;
    this.warpT = 0;
  }

  invalidate(): void {
    this.vignette = null;
  }
}
