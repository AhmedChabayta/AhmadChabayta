// Game entities: player, bullets, the alien formation + enemy archetypes,
// multi-phase bosses, drifting power-ups and destructible bunkers.
// Entities never import the Game (no cycles); they talk back through Hooks.
import { TAU, clamp, damp, hsla, type EnemyKind, type PowerKind } from "./types";
import type { FX } from "./fx";
import type { Audio } from "./audio";

export interface View {
  w: number;
  h: number;
  s: number; // global sprite/speed scale
}

export interface Hooks {
  fx: FX;
  audio: Audio;
  view: View;
  player: Player;
  hue: number;
  slowFactor: number; // <1 when bullet-time is active
  enemyBullet(x: number, y: number, vx: number, vy: number): void;
}

let UID = 1;

export class Bullet {
  dead = false;
  hits = new Set<number>();
  constructor(
    public x: number,
    public y: number,
    public vx: number,
    public vy: number,
    public friendly: boolean,
    public hue: number,
    public pierce = false,
    public r = 4,
  ) {}
  update(dt: number): void {
    this.x += this.vx * dt;
    this.y += this.vy * dt;
  }
  draw(ctx: CanvasRenderingContext2D): void {
    ctx.globalCompositeOperation = "lighter";
    ctx.strokeStyle = hsla(this.hue, 100, 70, 0.9);
    ctx.lineWidth = this.r;
    ctx.shadowColor = hsla(this.hue, 100, 60, 1);
    ctx.shadowBlur = 14;
    ctx.beginPath();
    ctx.moveTo(this.x, this.y);
    ctx.lineTo(this.x - this.vx * 0.018, this.y - this.vy * 0.018);
    ctx.stroke();
    ctx.shadowBlur = 0;
    ctx.globalCompositeOperation = "source-over";
  }
}

export interface Buffs {
  rapid: number;
  spread: number;
  double: number;
  pierce: number;
  score: number;
  magnet: number;
}

export class Player {
  x = 0;
  y = 0;
  tx = 0;
  vx = 0;
  lives = 3;
  bombs = 1;
  shield = 0;
  invuln = 1.2;
  fireCd = 0;
  alive = true;
  buffs: Buffs = { rapid: 0, spread: 0, double: 0, pierce: 0, score: 0, magnet: 0 };

  size(v: View): number {
    return 17 * v.s;
  }

  reset(v: View, keepLoadout = false): void {
    this.x = this.tx = v.w / 2;
    this.y = v.h - 56 * v.s;
    this.vx = 0;
    this.invuln = 1.4;
    this.alive = true;
    if (!keepLoadout) {
      this.shield = 0;
      this.buffs = { rapid: 0, spread: 0, double: 0, pierce: 0, score: 0, magnet: 0 };
    }
  }

  update(
    dt: number,
    v: View,
    axis: number,
    ptr: { active: boolean; down: boolean; x: number },
    fx: FX,
    hue: number,
  ): void {
    const sz = this.size(v);
    if (ptr.active) {
      this.tx = clamp(ptr.x, sz, v.w - sz);
    } else {
      this.tx = clamp(this.tx + axis * 620 * v.s * dt, sz, v.w - sz);
    }
    const nx = damp(this.x, this.tx, 18, dt);
    this.vx = (nx - this.x) / Math.max(dt, 1e-4);
    this.x = nx;
    this.y = v.h - 56 * v.s;
    this.invuln = Math.max(0, this.invuln - dt);
    const b = this.buffs;
    b.rapid = Math.max(0, b.rapid - dt);
    b.spread = Math.max(0, b.spread - dt);
    b.double = Math.max(0, b.double - dt);
    b.pierce = Math.max(0, b.pierce - dt);
    b.score = Math.max(0, b.score - dt);
    b.magnet = Math.max(0, b.magnet - dt);
    this.fireCd = Math.max(0, this.fireCd - dt);
    if (Math.random() < 0.9) fx.trail(this.x, this.y + sz * 0.9, hue + 30);
  }

  tryShoot(v: View, hue: number): Bullet[] | null {
    if (this.fireCd > 0) return null;
    const b = this.buffs;
    this.fireCd = b.rapid > 0 ? 0.11 : 0.24;
    const sp = 660 * v.s;
    const out: Bullet[] = [];
    const angles = b.spread > 0 ? [-0.16, 0, 0.16] : [0];
    const lanes = b.double > 0 ? [-13 * v.s, 13 * v.s] : [0];
    for (const lx of lanes)
      for (const a of angles) {
        out.push(
          new Bullet(
            this.x + lx,
            this.y - this.size(v),
            Math.sin(a) * sp,
            -Math.cos(a) * sp,
            true,
            hue,
            b.pierce > 0,
            b.pierce > 0 ? 5 : 4,
          ),
        );
      }
    return out;
  }

  /** @returns true if the player actually took a life-costing hit. */
  damage(fx: FX, audio: Audio): boolean {
    if (this.invuln > 0) return false;
    if (this.shield > 0) {
      this.shield--;
      this.invuln = 0.6;
      audio.shieldHit();
      fx.ring(this.x, this.y, 190, 60);
      fx.shake(0.25);
      return false;
    }
    return true;
  }

  draw(ctx: CanvasRenderingContext2D, v: View, hue: number, t: number): void {
    const s = this.size(v);
    if (this.invuln > 0 && Math.floor(t * 18) % 2 === 0 && this.invuln < 1.2)
      return;
    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.globalCompositeOperation = "lighter";
    // engine flare
    const fg = ctx.createRadialGradient(0, s, 0, 0, s, s * 1.6);
    fg.addColorStop(0, hsla(hue + 40, 100, 70, 0.8));
    fg.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = fg;
    ctx.fillRect(-s, s * 0.4, s * 2, s * 1.8);
    ctx.globalCompositeOperation = "source-over";
    ctx.shadowColor = hsla(hue, 100, 60, 1);
    ctx.shadowBlur = 16;
    ctx.fillStyle = hsla(hue, 90, 65, 1);
    ctx.beginPath();
    ctx.moveTo(0, -s);
    ctx.lineTo(s * 0.92, s * 0.78);
    ctx.lineTo(s * 0.32, s * 0.42);
    ctx.lineTo(-s * 0.32, s * 0.42);
    ctx.lineTo(-s * 0.92, s * 0.78);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = "#fff";
    ctx.shadowBlur = 8;
    ctx.beginPath();
    ctx.arc(0, -s * 0.05, s * 0.22, 0, TAU);
    ctx.fill();
    ctx.restore();

    if (this.shield > 0) {
      ctx.save();
      ctx.globalCompositeOperation = "lighter";
      ctx.strokeStyle = hsla(190, 100, 70, 0.5 + 0.3 * Math.sin(t * 8));
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(this.x, this.y, s * 2.1, 0, TAU);
      ctx.stroke();
      ctx.restore();
    }
  }
}

interface Kind {
  hp: number;
  score: number;
  hue: number;
  r: number;
}
const KINDS: Record<EnemyKind, Kind> = {
  grunt: { hp: 1, score: 100, hue: 320, r: 14 },
  shooter: { hp: 1, score: 150, hue: 30, r: 14 },
  weaver: { hp: 1, score: 175, hue: 160, r: 13 },
  diver: { hp: 2, score: 260, hue: 0, r: 15 },
  tank: { hp: 4, score: 420, hue: 270, r: 18 },
  splitter: { hp: 2, score: 200, hue: 95, r: 16 },
  mini: { hp: 1, score: 70, hue: 95, r: 9 },
};

export class Enemy {
  id = UID++;
  hp: number;
  maxHp: number;
  score: number;
  hue: number;
  rad: number;
  x = 0;
  y = 0;
  bx = 0; // formation slot (relative to group origin)
  by = 0;
  state: "form" | "dive" = "form";
  diveT = 0;
  divePhase = 0;
  weaveAmp: number;
  weavePh: number;
  constructor(
    public kind: EnemyKind,
    public row: number,
    public col: number,
    armored: boolean,
  ) {
    const k = KINDS[kind];
    this.hp = this.maxHp = k.hp + (armored ? 2 : 0);
    this.score = k.score;
    this.hue = k.hue;
    this.rad = k.r;
    this.weaveAmp = 8 + Math.random() * 10;
    this.weavePh = Math.random() * TAU;
  }

  draw(ctx: CanvasRenderingContext2D, v: View, t: number): void {
    const r = this.rad * v.s;
    const dmg = 1 - this.hp / this.maxHp;
    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.globalCompositeOperation = "lighter";
    ctx.shadowColor = hsla(this.hue, 100, 55, 1);
    ctx.shadowBlur = 12;
    ctx.strokeStyle = hsla(this.hue, 100, 70, 1);
    ctx.fillStyle = hsla(this.hue, 90, 30 + dmg * 30, 0.9);
    ctx.lineWidth = 2;
    ctx.beginPath();
    switch (this.kind) {
      case "tank": {
        ctx.rect(-r, -r * 0.8, r * 2, r * 1.6);
        ctx.fill();
        ctx.stroke();
        ctx.strokeRect(-r * 0.5, -r * 0.4, r, r * 0.8);
        break;
      }
      case "diver": {
        ctx.moveTo(0, r);
        ctx.lineTo(r, -r * 0.6);
        ctx.lineTo(0, -r * 0.2);
        ctx.lineTo(-r, -r * 0.6);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        break;
      }
      case "weaver": {
        for (let i = 0; i < 6; i++) {
          const a = (i / 6) * TAU + t;
          const rr = i % 2 ? r : r * 0.55;
          ctx[i ? "lineTo" : "moveTo"](Math.cos(a) * rr, Math.sin(a) * rr);
        }
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        break;
      }
      case "splitter":
      case "mini": {
        ctx.arc(0, 0, r, 0, TAU);
        ctx.fill();
        ctx.stroke();
        ctx.moveTo(-r * 0.5, 0);
        ctx.lineTo(r * 0.5, 0);
        ctx.stroke();
        break;
      }
      default: {
        // grunt / shooter — classic crab silhouette
        ctx.moveTo(-r, -r * 0.4);
        ctx.lineTo(-r * 0.4, -r);
        ctx.lineTo(r * 0.4, -r);
        ctx.lineTo(r, -r * 0.4);
        ctx.lineTo(r * 0.6, r * 0.6);
        ctx.lineTo(r, r);
        ctx.lineTo(r * 0.3, r * 0.55);
        ctx.lineTo(-r * 0.3, r * 0.55);
        ctx.lineTo(-r, r);
        ctx.lineTo(-r * 0.6, r * 0.6);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        ctx.fillStyle = "#fff";
        ctx.fillRect(-r * 0.45, -r * 0.35, r * 0.3, r * 0.3);
        ctx.fillRect(r * 0.15, -r * 0.35, r * 0.3, r * 0.3);
      }
    }
    ctx.restore();
  }
}

export class Formation {
  enemies: Enemy[] = [];
  gx = 0;
  gy = 0;
  dir = 1;
  fireAcc = 0;
  colW: number;
  rowH: number;
  originX: number;
  originY: number;
  weave = false;
  divers = false;
  snipers = false;
  fastDrop = false;
  reached = false;
  enter = 1; // 1 → 0 : the formation warps in from above

  constructor(
    spec: {
      rows: number;
      cols: number;
      grid: EnemyKind[][];
      modifiers: string[];
    },
    v: View,
  ) {
    this.weave = spec.modifiers.includes("WEAVE");
    this.divers = spec.modifiers.includes("DIVE BOMBERS");
    this.snipers = spec.modifiers.includes("SNIPERS");
    this.fastDrop = spec.modifiers.includes("FAST DESCENT");
    const armored = spec.modifiers.includes("ARMORED");
    this.colW = Math.min(64 * v.s, (v.w * 0.86) / spec.cols);
    this.rowH = 46 * v.s;
    const gridW = this.colW * (spec.cols - 1);
    this.originX = (v.w - gridW) / 2;
    this.originY = 96 * v.s;
    for (let r = 0; r < spec.rows; r++)
      for (let c = 0; c < spec.cols; c++) {
        const e = new Enemy(
          spec.grid[r][c],
          r,
          c,
          armored && Math.random() < 0.5,
        );
        e.bx = c * this.colW;
        e.by = r * this.rowH;
        e.x = this.originX + e.bx;
        e.y = this.originY + e.by;
        this.enemies.push(e);
      }
  }

  get aliveFrac(): number {
    const total = this.enemies.length || 1;
    return this.enemies.filter((e) => e.hp > 0).length / total;
  }

  update(
    dt: number,
    spec: { speed: number; fireRate: number; bulletSpeed: number },
    h: Hooks,
  ): void {
    const v = h.view;
    const live = this.enemies.filter((e) => e.hp > 0);
    if (!live.length) return;
    this.enter = Math.max(0, this.enter - dt / 0.8);
    const entering = this.enter > 0.04;
    const slide = entering ? this.enter * this.enter * v.h * 0.82 : 0;

    if (!entering) {
      const speedMul =
        (1 + (1 - this.aliveFrac) * 1.7) *
        (h.slowFactor < 1 ? h.slowFactor : 1);
      this.gx += this.dir * spec.speed * v.s * speedMul * dt;

      let minX = Infinity;
      let maxX = -Infinity;
      for (const e of live) {
        if (e.state === "form") {
          const sx = this.originX + e.bx + this.gx;
          minX = Math.min(minX, sx);
          maxX = Math.max(maxX, sx);
        }
      }
      const margin = 22 * v.s;
      if (minX < margin || maxX > v.w - margin) {
        this.dir *= -1;
        this.gx += this.dir * 6;
        this.gy += (this.fastDrop ? 30 : 18) * v.s;
        h.audio.ui();
      }
    }

    const t = performance.now() / 1000;
    let lowest = 0;
    for (const e of this.enemies) {
      if (e.hp <= 0) continue;
      if (e.state === "form") {
        const wob =
          this.weave || e.kind === "weaver"
            ? Math.sin(t * 2 + e.weavePh) * e.weaveAmp * v.s
            : 0;
        e.x = this.originX + e.bx + this.gx + wob;
        e.y = this.originY + e.by + this.gy - slide;
      } else {
        e.diveT += dt;
        const tgtX = h.player.x;
        e.x = damp(e.x, tgtX, 1.4, dt);
        e.y += (210 + e.divePhase * 60) * v.s * dt * (h.slowFactor < 1 ? 0.6 : 1);
        if (Math.random() < 0.014 && e.y < v.h * 0.8)
          h.enemyBullet(
            e.x,
            e.y,
            0,
            spec.bulletSpeed * v.s * 0.9,
          );
        if (e.y > v.h + 50) {
          if (e.kind === "mini") {
            e.hp = 0; // split-children that slip past simply escape
          } else {
            e.state = "form";
            e.diveT = 0;
            e.y = this.originY + e.by + this.gy - 40;
          }
        }
      }
      lowest = Math.max(lowest, e.y + e.rad * v.s);
    }

    // promote divers
    if (!entering && this.divers && Math.random() < 0.5 * dt) {
      const cand = live.filter((e) => e.state === "form");
      if (cand.length) {
        const e = cand[(Math.random() * cand.length) | 0];
        e.state = "dive";
        e.diveT = 0;
        e.divePhase = Math.random();
      }
    }

    // formation fire — front-most enemy per random column
    if (!entering) this.fireAcc += spec.fireRate * dt;
    while (this.fireAcc >= 1) {
      this.fireAcc -= 1;
      const shooters = live.filter((e) => e.state === "form");
      if (!shooters.length) break;
      const e = shooters[(Math.random() * shooters.length) | 0];
      const bs = spec.bulletSpeed * v.s;
      if (this.snipers || e.kind === "shooter") {
        const dx = h.player.x - e.x;
        const dy = h.player.y - e.y;
        const d = Math.hypot(dx, dy) || 1;
        h.enemyBullet(e.x, e.y, (dx / d) * bs, (dy / d) * bs);
      } else {
        h.enemyBullet(e.x, e.y, 0, bs);
      }
    }

    if (!entering && lowest >= h.player.y - 6 * v.s) this.reached = true;
  }

  draw(ctx: CanvasRenderingContext2D, v: View, t: number): void {
    for (const e of this.enemies) if (e.hp > 0) e.draw(ctx, v, t);
  }
}

const ATTACKS = ["aim", "fan", "spiral", "rain"] as const;
type Atk = (typeof ATTACKS)[number];

export class Boss {
  x = 0;
  y = 0;
  hp: number;
  maxHp: number;
  t = 0;
  atkT = 0;
  atk: Atk = "aim";
  spin = 0;
  dead = false;
  introduced = false;
  constructor(
    public tier: number,
    v: View,
  ) {
    this.maxHp = this.hp = 80 + tier * 55;
    this.x = v.w / 2;
    this.y = -80 * v.s;
  }
  get phase(): number {
    const f = this.hp / this.maxHp;
    return f > 0.66 ? 0 : f > 0.33 ? 1 : 2;
  }
  rad(v: View): number {
    return 46 * v.s;
  }

  update(dt: number, h: Hooks): void {
    const v = h.view;
    this.t += dt;
    this.spin += dt * (0.6 + this.phase * 0.5);
    const targetY = 110 * v.s;
    this.y = damp(this.y, targetY, 1.4, dt);
    this.x =
      v.w / 2 +
      Math.sin(this.t * (0.6 + this.phase * 0.35)) * (v.w * 0.32);
    if (this.y < targetY - 4) return; // entering

    this.atkT -= dt * (h.slowFactor < 1 ? h.slowFactor : 1);
    if (this.atkT <= 0) {
      this.atk = ATTACKS[(Math.random() * (2 + this.phase)) | 0] ?? "aim";
      this.atkT = Math.max(0.55, 1.5 - this.phase * 0.35 - this.tier * 0.04);
      this.fire(h);
    }
  }

  private fire(h: Hooks): void {
    const v = h.view;
    const bs = (170 + this.tier * 14) * v.s;
    h.audio.enemyShoot();
    if (this.atk === "aim") {
      const dx = h.player.x - this.x;
      const dy = h.player.y - this.y;
      for (let i = -2; i <= 2; i++) {
        const a = Math.atan2(dy, dx) + i * 0.12;
        h.enemyBullet(this.x, this.y, Math.cos(a) * bs, Math.sin(a) * bs);
      }
    } else if (this.atk === "fan") {
      const n = 10 + this.phase * 4;
      for (let i = 0; i < n; i++) {
        const a = (i / (n - 1)) * Math.PI * 0.8 + Math.PI * 0.1;
        h.enemyBullet(this.x, this.y, Math.cos(a) * bs, Math.sin(a) * bs);
      }
    } else if (this.atk === "spiral") {
      for (let i = 0; i < 6; i++) {
        const a = this.spin * 2 + (i / 6) * TAU;
        h.enemyBullet(this.x, this.y, Math.cos(a) * bs, Math.sin(a) * bs);
      }
      this.atkT = 0.12;
    } else {
      for (let i = 0; i < 7; i++)
        h.enemyBullet(
          this.x - 120 * v.s + i * 40 * v.s,
          this.y,
          0,
          bs,
        );
    }
  }

  draw(ctx: CanvasRenderingContext2D, v: View, hue: number): void {
    const r = this.rad(v);
    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.globalCompositeOperation = "lighter";
    ctx.shadowColor = hsla(hue, 100, 55, 1);
    ctx.shadowBlur = 26;
    for (let ring = 0; ring < 3; ring++) {
      ctx.strokeStyle = hsla(hue + ring * 40, 100, 65, 0.7);
      ctx.lineWidth = 3;
      ctx.beginPath();
      const rr = r * (0.5 + ring * 0.3);
      for (let i = 0; i <= 6; i++) {
        const a = this.spin * (ring % 2 ? -1 : 1) + (i / 6) * TAU;
        ctx[i ? "lineTo" : "moveTo"](Math.cos(a) * rr, Math.sin(a) * rr);
      }
      ctx.closePath();
      ctx.stroke();
    }
    const core = 0.6 + 0.4 * Math.sin(this.t * 10);
    ctx.fillStyle = hsla((hue + 180) % 360, 100, 60 + core * 20, 1);
    ctx.beginPath();
    ctx.arc(0, 0, r * 0.32 * (0.9 + core * 0.2), 0, TAU);
    ctx.fill();
    ctx.restore();
  }
}

const POWER_META: Record<PowerKind, { hue: number; glyph: string }> = {
  rapid: { hue: 50, glyph: "R" },
  spread: { hue: 200, glyph: "W" },
  double: { hue: 280, glyph: "II" },
  pierce: { hue: 330, glyph: "P" },
  shield: { hue: 190, glyph: "S" },
  slow: { hue: 160, glyph: "T" },
  nuke: { hue: 20, glyph: "✦" },
  life: { hue: 0, glyph: "+" },
  score: { hue: 95, glyph: "x2" },
  magnet: { hue: 60, glyph: "M" },
};

export class PowerUp {
  dead = false;
  ph = Math.random() * TAU;
  hue: number;
  glyph: string;
  constructor(
    public kind: PowerKind,
    public x: number,
    public y: number,
  ) {
    this.hue = POWER_META[kind].hue;
    this.glyph = POWER_META[kind].glyph;
  }
  update(dt: number, v: View, player: Player): void {
    this.ph += dt * 5;
    const dx = player.x - this.x;
    const dy = player.y - this.y;
    const d = Math.hypot(dx, dy) || 1;
    const mag = player.buffs.magnet > 0;
    // Drift gently down; always ease toward the ship a little so they're
    // easy to grab, and home hard once the magnet is up.
    if (mag) {
      this.x += (dx / d) * 360 * v.s * dt;
      this.y += (dy / d) * 360 * v.s * dt;
    } else {
      this.y += 60 * v.s * dt;
      this.x += Math.sin(this.ph) * 14 * v.s * dt;
      if (d < 170 * v.s) {
        this.x += (dx / d) * 90 * v.s * dt;
        this.y += (dy / d) * 60 * v.s * dt;
      }
    }
    if (this.y > v.h + 30) this.dead = true;
  }
  draw(ctx: CanvasRenderingContext2D, v: View): void {
    const r = 15 * v.s;
    const pul = 0.7 + 0.3 * Math.sin(this.ph * 2);
    // soft halo so power-ups are unmissable
    const halo = ctx.createRadialGradient(0, 0, 0, 0, 0, r * 2.6);
    halo.addColorStop(0, hsla(this.hue, 100, 60, 0.35));
    halo.addColorStop(1, "rgba(0,0,0,0)");
    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.globalCompositeOperation = "lighter";
    ctx.fillStyle = halo;
    ctx.beginPath();
    ctx.arc(0, 0, r * 2.6, 0, TAU);
    ctx.fill();
    ctx.shadowColor = hsla(this.hue, 100, 60, 1);
    ctx.shadowBlur = 18 * pul;
    ctx.strokeStyle = hsla(this.hue, 100, 70, 1);
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(0, 0, r, 0, TAU);
    ctx.stroke();
    ctx.fillStyle = hsla(this.hue, 100, 60, 0.18);
    ctx.fill();
    ctx.globalCompositeOperation = "source-over";
    ctx.fillStyle = "#fff";
    ctx.font = `700 ${11 * v.s}px ui-monospace,monospace`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(this.glyph, 0, 1);
    ctx.restore();
  }
}

export class Barrier {
  cells: boolean[];
  cols = 11;
  rows = 7;
  cw: number;
  ch: number;
  constructor(
    public x: number,
    public y: number,
    v: View,
    seed = 0.5,
  ) {
    this.cw = 7 * v.s;
    this.ch = 7 * v.s;
    this.cells = new Array(this.cols * this.rows).fill(true);
    // Seeded so every bunker looks different — never "always the same".
    let s = ((seed * 1e6) | 0) || 1;
    const rnd = (): number => {
      s = (s * 1103515245 + 12345) & 0x7fffffff;
      return s / 0x7fffffff;
    };
    const archC = 3.5 + rnd() * 4; // arch centre column
    const archW = 1.6 + rnd() * 1.8; // arch half-width
    for (let c = 0; c < this.cols; c++)
      for (let r = 4; r < this.rows; r++)
        if (Math.abs(c - archC) < archW - (this.rows - 1 - r))
          this.cells[r * this.cols + c] = false;
    // knock the top corners off at random + a few stray pits
    const corner = Math.floor(rnd() * 3);
    for (let c = 0; c < this.cols; c++)
      for (let r = 0; r < 2; r++)
        if (
          c < corner - r ||
          c > this.cols - 1 - (corner - r) ||
          rnd() < 0.06
        )
          this.cells[r * this.cols + c] = false;
  }
  private idx(c: number, r: number): number {
    return r * this.cols + c;
  }
  /** Erodes cells near a point; returns true if it blocked something. */
  hit(px: number, py: number, rad: number): boolean {
    let blocked = false;
    for (let r = 0; r < this.rows; r++)
      for (let c = 0; c < this.cols; c++) {
        if (!this.cells[this.idx(c, r)]) continue;
        const cx = this.x + c * this.cw + this.cw / 2;
        const cy = this.y + r * this.ch + this.ch / 2;
        if (Math.hypot(cx - px, cy - py) < rad + this.cw) {
          this.cells[this.idx(c, r)] = false;
          blocked = true;
        }
      }
    return blocked;
  }
  get dead(): boolean {
    return !this.cells.some(Boolean);
  }
  draw(ctx: CanvasRenderingContext2D, hue: number): void {
    ctx.save();
    ctx.fillStyle = hsla(hue, 80, 55, 0.9);
    ctx.shadowColor = hsla(hue, 100, 50, 1);
    ctx.shadowBlur = 6;
    for (let r = 0; r < this.rows; r++)
      for (let c = 0; c < this.cols; c++)
        if (this.cells[this.idx(c, r)])
          ctx.fillRect(
            this.x + c * this.cw,
            this.y + r * this.ch,
            this.cw - 0.5,
            this.ch - 0.5,
          );
    ctx.restore();
  }
}
