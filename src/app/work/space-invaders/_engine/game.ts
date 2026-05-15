// The orchestrator: state machine, collisions, scoring/combo, power-ups,
// bombs, the canvas HUD/menus and localStorage persistence (so a run
// survives closing the tab). Rendering is 100% canvas; the surrounding
// React page only mounts this and wires the service worker.
import {
  RNG,
  clamp,
  hsla,
  type Difficulty,
  type GameState,
  type PowerKind,
} from "./types";
import { Audio } from "./audio";
import { FX } from "./fx";
import { Input } from "./input";
import { loadStore, saveStore, type Store } from "./storage";
import { makeWave, type WaveSpec } from "./levels";
import {
  Barrier,
  Boss,
  Bullet,
  Enemy,
  Formation,
  Player,
  PowerUp,
  type Hooks,
  type View,
} from "./entities";

const DIFFS: Difficulty[] = ["NORMAL", "HARD", "INSANE"];
const POWERS: PowerKind[] = [
  "rapid", "spread", "double", "pierce", "shield",
  "slow", "nuke", "life", "score", "magnet",
];
const LIFE_STEPS = [15000, 40000, 80000];

interface Btn {
  id: string;
  x: number;
  y: number;
  w: number;
  h: number;
  label: string;
  sub?: string;
}

export class Game {
  private ctx: CanvasRenderingContext2D;
  private view: View = { w: 0, h: 0, s: 1 };
  private input: Input;
  private audio = new Audio();
  private fx = new FX();
  private store: Store;

  state: GameState = "MENU";
  private rng = new RNG(Date.now());
  private player = new Player();
  private formation: Formation | null = null;
  private boss: Boss | null = null;
  private bullets: Bullet[] = [];
  private powerups: PowerUp[] = [];
  private barriers: Barrier[] = [];
  private spec!: WaveSpec;

  private wave = 1;
  private score = 0;
  private combo = 0;
  private comboT = 0;
  private kills = 0;
  private lifeIdx = 0;
  private slowT = 0;
  private t = 0;
  private briefT = 0;
  private deadT = 0;
  private flashHi = 0;
  private newHigh = false;

  private ui: Btn[] = [];

  constructor(canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D) {
    this.ctx = ctx;
    this.input = new Input(canvas);
    this.store = loadStore();
    this.audio.setMuted(this.store.settings.muted);
    this.fx.lowFlash = this.store.settings.lowFlash;
  }

  setSize(w: number, h: number): void {
    this.view.w = w;
    this.view.h = h;
    this.view.s = clamp(Math.min(w / 520, h / 760), 0.55, 1.55);
    this.fx.resize(w, h);
    this.fx.invalidate();
  }

  // ---- lifecycle ----------------------------------------------------------
  private get diff(): Difficulty {
    return this.store.settings.difficulty;
  }

  private newRun(resume: boolean): void {
    this.audio.init();
    const r = resume ? this.store.run : null;
    this.rng = new RNG(Date.now() >>> 0);
    this.wave = r ? r.wave : 1;
    this.score = r ? r.score : 0;
    this.kills = 0;
    this.combo = 0;
    this.comboT = 0;
    this.lifeIdx = 0;
    this.newHigh = false;
    this.player = new Player();
    this.player.reset(this.view);
    this.player.lives = r ? r.lives : 3;
    this.player.bombs = r ? r.bombs : 2;
    this.bullets = [];
    this.powerups = [];
    this.fx.reset();
    this.audio.startMusic();
    this.startWave();
  }

  private startWave(): void {
    this.spec = makeWave(this.wave, this.diff, this.rng);
    this.player.reset(this.view, true); // re-center + brief i-frames, keep loadout
    this.fx.setHue(this.spec.hue);
    this.formation = new Formation(this.spec, this.view);
    this.boss = this.spec.isBoss ? new Boss(this.spec.bossTier, this.view) : null;
    this.bullets = this.bullets.filter((b) => b.friendly);
    this.buildBarriers();
    this.audio.setIntensity(this.wave, this.spec.isBoss);
    this.fx.warp(this.spec.isBoss ? 1.4 : 1);
    if (this.spec.isBoss) this.audio.bossWarn();
    this.briefT = 2.1;
    this.state = "BRIEF";
    this.store.run = {
      wave: this.wave,
      score: this.score,
      lives: this.player.lives,
      bombs: this.player.bombs,
      difficulty: this.diff,
    };
    this.store.bestWave = Math.max(this.store.bestWave, this.wave);
    saveStore(this.store);
  }

  private buildBarriers(): void {
    this.barriers = [];
    if (this.spec.isBoss) return;
    const n = 4;
    const bw = 11 * 7 * this.view.s;
    for (let i = 0; i < n; i++) {
      const x = ((i + 0.5) / n) * this.view.w - bw / 2;
      this.barriers.push(new Barrier(x, this.view.h - 150 * this.view.s, this.view));
    }
  }

  private gameOver(): void {
    this.state = "GAMEOVER";
    this.audio.gameOver();
    this.audio.stopMusic();
    this.fx.flash("#ff2266", 0.5);
    this.fx.shake(0.9);
    this.newHigh = this.score > this.store.highScore;
    this.store.highScore = Math.max(this.store.highScore, this.score);
    this.store.bestWave = Math.max(this.store.bestWave, this.wave);
    this.store.totalKills += this.kills;
    this.store.gamesPlayed += 1;
    this.store.run = null;
    saveStore(this.store);
  }

  /** Persist an in-progress run (called on pagehide). */
  persist(): void {
    if (["PLAY", "PAUSE", "BRIEF", "DEAD"].includes(this.state)) {
      this.store.run = {
        wave: this.wave,
        score: this.score,
        lives: this.player.lives,
        bombs: this.player.bombs,
        difficulty: this.diff,
      };
      saveStore(this.store);
    }
  }

  // ---- hooks for entities -------------------------------------------------
  private hooks(): Hooks {
    return {
      fx: this.fx,
      audio: this.audio,
      view: this.view,
      player: this.player,
      hue: this.spec?.hue ?? 280,
      slowFactor: this.slowT > 0 ? 0.42 : 1,
      enemyBullet: (x, y, vx, vy) => {
        const b = new Bullet(x, y, vx, vy, false, (this.spec?.hue ?? 0) + 180, false, 5);
        this.bullets.push(b);
      },
    };
  }

  // ---- main step ----------------------------------------------------------
  frame(dt: number): void {
    this.t += dt;
    this.flashHi = Math.max(0, this.flashHi - dt);
    this.handleInput();
    if (this.state === "PLAY") this.updatePlay(dt);
    else if (this.state === "BRIEF") {
      this.briefT -= dt;
      this.updateAmbient(dt);
      if (this.briefT <= 0) this.state = "PLAY";
    } else if (this.state === "DEAD") {
      this.deadT -= dt;
      this.updatePlay(dt, true);
      if (this.deadT <= 0) {
        this.player.reset(this.view);
        this.state = "PLAY";
      }
    } else {
      this.updateAmbient(dt);
    }
    this.render();
  }

  private updateAmbient(dt: number): void {
    this.fx.update(dt, this.view.w, this.view.h);
  }

  private updatePlay(dt: number, frozen = false): void {
    const v = this.view;
    const h = this.hooks();
    this.slowT = Math.max(0, this.slowT - dt);

    if (!frozen) {
      this.player.update(
        dt,
        v,
        this.input.moveAxis(),
        this.input.pointer,
        this.fx,
        this.spec.hue,
      );
      if (this.player.invuln <= 0 || this.player.invuln < 1.3) {
        const shots = this.player.tryShoot(v, this.spec.hue + 60);
        if (shots) {
          this.bullets.push(...shots);
          this.audio.shoot();
        }
      }
    }

    const sf = this.slowT > 0 ? 0.42 : 1;
    for (const b of this.bullets) b.update(dt * (b.friendly ? 1 : sf));
    this.bullets = this.bullets.filter(
      (b) =>
        !b.dead &&
        b.y > -40 &&
        b.y < v.h + 40 &&
        b.x > -40 &&
        b.x < v.w + 40,
    );

    if (this.formation) {
      this.formation.update(dt, this.spec, h);
      if (this.formation.reached) return this.gameOver();
    }
    if (this.boss) this.boss.update(dt, h);

    for (const p of this.powerups) p.update(dt, v, this.player);
    this.powerups = this.powerups.filter((p) => !p.dead);

    this.collide();

    if (this.comboT > 0) {
      this.comboT -= dt;
      if (this.comboT <= 0) this.combo = 0;
    }
    if (
      this.lifeIdx < LIFE_STEPS.length
        ? this.score >= LIFE_STEPS[this.lifeIdx]
        : this.score >= LIFE_STEPS[LIFE_STEPS.length - 1] +
            (this.lifeIdx - LIFE_STEPS.length + 1) * 60000
    ) {
      this.lifeIdx++;
      this.player.lives++;
      this.audio.extraLife();
      this.fx.text(this.player.x, this.player.y - 40, "1UP", "#4dff91", 22 * v.s);
    }

    const formClear = !this.formation || this.formation.enemies.every((e) => e.hp <= 0);
    const bossClear = !this.boss || this.boss.dead;
    if (formClear && bossClear) this.winWave();

    this.fx.update(dt, v.w, v.h);
  }

  private winWave(): void {
    this.wave++;
    this.audio.levelUp();
    this.fx.flash("#ffffff", 0.45);
    this.fx.shake(0.4);
    this.startWave();
  }

  private mult(): number {
    return this.combo >= 50 ? 5
      : this.combo >= 35 ? 4
      : this.combo >= 20 ? 3
      : this.combo >= 10 ? 2
      : this.combo >= 5 ? 1.5
      : 1;
  }

  private addScore(base: number, x: number, y: number): void {
    const m = this.mult() * (this.player.buffs.score > 0 ? 2 : 1);
    const gained = Math.round(base * m);
    this.score += gained;
    this.fx.text(x, y, `${gained}`, hsla(this.spec.hue + 60, 100, 70), 15 * this.view.s);
  }

  private onKill(e: Enemy): void {
    this.kills++;
    this.combo++;
    this.comboT = 2.6;
    this.addScore(e.score, e.x, e.y);
    this.audio.explode(e.kind === "tank" ? 1.3 : 0.9);
    this.audio.combo(Math.min(this.combo, 24));
    this.fx.burst(e.x, e.y, {
      n: e.kind === "tank" ? 34 : 20,
      hue: e.hue,
      spd: 320,
      life: 0.7,
      size: 3,
      kind: 1,
    });
    this.fx.ring(e.x, e.y, e.hue, e.rad * this.view.s * 2.4);
    this.fx.shake(0.12);
    if (this.combo > 0 && this.combo % 10 === 0)
      this.fx.text(
        this.player.x,
        this.player.y - 56,
        `COMBO x${this.mult()}`,
        hsla(this.spec.hue, 100, 70),
        20 * this.view.s,
      );
    if (e.kind === "splitter") {
      for (let i = 0; i < 2; i++) {
        const m = new Enemy("mini", e.row, e.col, false);
        m.x = e.x + (i ? 14 : -14);
        m.y = e.y;
        m.state = "dive";
        m.divePhase = 0.4;
        this.formation?.enemies.push(m);
      }
    }
    const dropP = e.kind === "tank" ? 0.22 : 0.085;
    if (Math.random() < dropP) this.dropPower(e.x, e.y);
  }

  private dropPower(x: number, y: number): void {
    const k = POWERS[(Math.random() * POWERS.length) | 0];
    this.powerups.push(new PowerUp(k, x, y));
  }

  private applyPower(k: PowerKind): void {
    const p = this.player;
    this.audio.power(k);
    this.fx.flash(hsla(180, 100, 70), 0.18);
    const label: Record<PowerKind, string> = {
      rapid: "RAPID FIRE", spread: "SPREAD", double: "TWIN GUNS",
      pierce: "PIERCE", shield: "SHIELD +", slow: "BULLET TIME",
      nuke: "SMART BOMB", life: "EXTRA LIFE", score: "SCORE x2",
      magnet: "MAGNET",
    };
    this.fx.text(p.x, p.y - 44, label[k], hsla(200, 100, 75), 18 * this.view.s);
    switch (k) {
      case "rapid": p.buffs.rapid = 11; break;
      case "spread": p.buffs.spread = 13; break;
      case "double": p.buffs.double = 13; break;
      case "pierce": p.buffs.pierce = 10; break;
      case "score": p.buffs.score = 11; break;
      case "magnet": p.buffs.magnet = 13; break;
      case "shield": p.shield = Math.min(4, p.shield + 2); break;
      case "slow": this.slowT = 6.5; break;
      case "life": p.lives++; break;
      case "nuke": p.bombs++; break;
    }
  }

  private bomb(): void {
    if (this.player.bombs <= 0 || this.state !== "PLAY") return;
    this.player.bombs--;
    this.audio.nuke();
    this.fx.flash("#fff", 0.7);
    this.fx.shake(0.8);
    this.bullets = this.bullets.filter((b) => b.friendly);
    if (this.formation)
      for (const e of this.formation.enemies)
        if (e.hp > 0) {
          e.hp = 0;
          this.onKill(e);
        }
    if (this.boss) this.damageBoss(40);
  }

  private damageBoss(n: number): void {
    if (!this.boss) return;
    this.boss.hp -= n;
    this.fx.burst(this.boss.x, this.boss.y, {
      n: 10, hue: this.spec.hue, spd: 240, life: 0.4, kind: 1,
    });
    if (this.boss.hp <= 0 && !this.boss.dead) {
      this.boss.dead = true;
      this.audio.bossDie();
      this.fx.flash("#fff", 0.7);
      this.fx.shake(1);
      this.fx.burst(this.boss.x, this.boss.y, {
        n: 90, hue: this.spec.hue, spd: 460, life: 1.1, size: 4, kind: 1,
      });
      this.addScore(4000 + this.spec.bossTier * 1500, this.boss.x, this.boss.y);
      for (let i = 0; i < 3; i++) this.dropPower(this.boss.x + (i - 1) * 30, this.boss.y);
    }
  }

  private collide(): void {
    const v = this.view;
    const sf = v.s;
    for (const b of this.bullets) {
      if (b.dead) continue;
      if (b.friendly) {
        if (this.formation)
          for (const e of this.formation.enemies) {
            if (e.hp <= 0 || b.hits.has(e.id)) continue;
            if (Math.hypot(b.x - e.x, b.y - e.y) < e.rad * sf + b.r) {
              e.hp -= 1;
              this.fx.burst(b.x, b.y, { n: 5, hue: e.hue, spd: 140, life: 0.25 });
              if (e.hp <= 0) this.onKill(e);
              if (b.pierce) b.hits.add(e.id);
              else {
                b.dead = true;
                break;
              }
            }
          }
        if (!b.dead && this.boss && !this.boss.dead) {
          if (Math.hypot(b.x - this.boss.x, b.y - this.boss.y) < this.boss.rad(v)) {
            this.damageBoss(1);
            if (!b.pierce) b.dead = true;
          }
        }
      } else {
        const ps = this.player.size(v);
        if (
          this.player.alive &&
          this.state === "PLAY" &&
          Math.hypot(b.x - this.player.x, b.y - this.player.y) < ps * 0.9 + b.r
        ) {
          b.dead = true;
          if (this.player.damage(this.fx, this.audio)) this.playerDie();
        }
      }
      if (b.dead) continue;
      for (const bar of this.barriers)
        if (bar.hit(b.x, b.y, b.r)) {
          b.dead = true;
          break;
        }
    }
    this.bullets = this.bullets.filter((b) => !b.dead);

    // body collisions + barrier erosion by descending aliens
    if (this.formation && this.state === "PLAY") {
      for (const e of this.formation.enemies) {
        if (e.hp <= 0) continue;
        for (const bar of this.barriers) bar.hit(e.x, e.y, e.rad * sf * 0.6);
        if (
          Math.hypot(e.x - this.player.x, e.y - this.player.y) <
          e.rad * sf + this.player.size(v) * 0.7
        ) {
          e.hp = 0;
          this.onKill(e);
          if (this.player.damage(this.fx, this.audio)) this.playerDie();
        }
      }
    }
    this.barriers = this.barriers.filter((b) => !b.dead);

    for (const p of this.powerups) {
      if (Math.hypot(p.x - this.player.x, p.y - this.player.y) < 26 * sf) {
        p.dead = true;
        this.applyPower(p.kind);
      }
    }
    this.powerups = this.powerups.filter((p) => !p.dead);
  }

  private playerDie(): void {
    this.combo = 0;
    this.player.lives--;
    this.player.alive = false;
    this.audio.playerHit();
    this.fx.flash("#ff3355", 0.55);
    this.fx.shake(0.8);
    this.fx.burst(this.player.x, this.player.y, {
      n: 60, hue: this.spec.hue + 60, spd: 380, life: 1, size: 4, kind: 1,
    });
    if (this.player.lives <= 0) {
      this.gameOver();
    } else {
      this.deadT = 1.3;
      this.state = "DEAD";
      this.bullets = this.bullets.filter((b) => b.friendly);
    }
  }

  // ---- input / menus ------------------------------------------------------
  private handleInput(): void {
    let a = this.input.poll();
    while (a) {
      if (a === "mute") this.toggleMute();
      else if (a === "flash") this.toggleFlash();
      else if (a === "fullscreen") this.toggleFullscreen();
      else if (this.state === "PLAY") {
        if (a === "pause") this.setState("PAUSE");
        else if (a === "bomb") this.bomb();
      } else if (this.state === "PAUSE") {
        if (a === "pause" || a === "confirm") this.setState("PLAY");
        else if (a === "restart") this.newRun(false);
      } else if (this.state === "MENU") {
        if (a === "confirm") this.newRun(Boolean(this.store.run));
        else if (a === "navLeft") this.cycleDiff(-1);
        else if (a === "navRight") this.cycleDiff(1);
      } else if (this.state === "GAMEOVER") {
        if (a === "confirm" || a === "restart") this.newRun(false);
        else if (a === "pause") this.setState("MENU");
      }
      a = this.input.poll();
    }
    let tap = this.input.takeTap();
    while (tap) {
      this.onTap(tap.x, tap.y);
      tap = this.input.takeTap();
    }
  }

  private setState(s: GameState): void {
    this.state = s;
    if (s === "PAUSE") this.audio.stopMusic();
    if (s === "PLAY") this.audio.startMusic();
    if (s === "MENU") {
      this.audio.stopMusic();
      this.store = loadStore();
    }
    this.audio.uiSelect();
  }

  private toggleMute(): void {
    this.store.settings.muted = !this.store.settings.muted;
    this.audio.setMuted(this.store.settings.muted);
    saveStore(this.store);
  }
  private toggleFlash(): void {
    this.store.settings.lowFlash = !this.store.settings.lowFlash;
    this.fx.lowFlash = this.store.settings.lowFlash;
    saveStore(this.store);
  }
  private cycleDiff(d: number): void {
    const i = (DIFFS.indexOf(this.diff) + d + DIFFS.length) % DIFFS.length;
    this.store.settings.difficulty = DIFFS[i];
    saveStore(this.store);
    this.audio.ui();
  }
  private toggleFullscreen(): void {
    const el = this.ctx.canvas;
    if (!document.fullscreenElement) void el.requestFullscreen?.().catch(() => {});
    else void document.exitFullscreen?.();
  }

  private onTap(x: number, y: number): void {
    const hit = this.ui.find(
      (b) => x >= b.x && x <= b.x + b.w && y >= b.y && y <= b.y + b.h,
    );
    if (!hit) return;
    this.audio.uiSelect();
    switch (hit.id) {
      case "play": this.newRun(false); break;
      case "resume-run": this.newRun(true); break;
      case "diff": this.cycleDiff(1); break;
      case "mute": this.toggleMute(); break;
      case "flash": this.toggleFlash(); break;
      case "full": this.toggleFullscreen(); break;
      case "pause": this.setState("PAUSE"); break;
      case "resume": this.setState("PLAY"); break;
      case "restart": this.newRun(false); break;
      case "menu": this.setState("MENU"); break;
      case "retry": this.newRun(false); break;
      case "bomb": this.bomb(); break;
    }
  }

  // ---- rendering ----------------------------------------------------------
  private render(): void {
    const ctx = this.ctx;
    const v = this.view;
    this.ui = [];
    ctx.save();
    const sh = this.fx.shakeOffset();
    ctx.translate(sh.x, sh.y);
    this.fx.drawBack(ctx, v.w, v.h);

    if (this.state !== "MENU") {
      for (const bar of this.barriers) bar.draw(ctx, this.spec.hue + 40);
      for (const p of this.powerups) p.draw(ctx, v);
      if (this.formation) this.formation.draw(ctx, v, this.t);
      if (this.boss && !this.boss.dead) this.boss.draw(ctx, v, this.spec.hue);
      for (const b of this.bullets) b.draw(ctx);
      if (this.player.alive && this.state !== "GAMEOVER")
        this.player.draw(ctx, v, this.spec.hue + 60, this.t);
      this.fx.drawFore(ctx);
    } else {
      this.fx.drawFore(ctx);
    }
    ctx.restore();

    if (this.state === "PLAY" || this.state === "DEAD" || this.state === "BRIEF")
      this.drawHUD();
    if (this.state === "BRIEF") this.drawBrief();
    if (this.state === "MENU") this.drawMenu();
    if (this.state === "PAUSE") this.drawPause();
    if (this.state === "GAMEOVER") this.drawGameOver();

    this.fx.drawOverlay(ctx, v.w, v.h);
  }

  private text(
    s: string,
    x: number,
    y: number,
    size: number,
    color: string,
    align: CanvasTextAlign = "left",
    glow = 0,
  ): void {
    const ctx = this.ctx;
    ctx.font = `${size}px ui-monospace, "JetBrains Mono", monospace`;
    ctx.textAlign = align;
    ctx.textBaseline = "alphabetic";
    if (glow) {
      ctx.shadowColor = color;
      ctx.shadowBlur = glow;
    }
    ctx.fillStyle = color;
    ctx.fillText(s, x, y);
    ctx.shadowBlur = 0;
  }

  private button(
    id: string,
    label: string,
    cx: number,
    y: number,
    w: number,
    h: number,
    accent = 280,
    sub?: string,
  ): void {
    const ctx = this.ctx;
    const x = cx - w / 2;
    this.ui.push({ id, x, y, w, h, label, sub });
    ctx.save();
    ctx.globalCompositeOperation = "lighter";
    ctx.fillStyle = hsla(accent, 90, 55, 0.12);
    ctx.strokeStyle = hsla(accent, 100, 65, 0.9);
    ctx.lineWidth = 2;
    ctx.shadowColor = hsla(accent, 100, 55, 1);
    ctx.shadowBlur = 14;
    ctx.beginPath();
    ctx.roundRect(x, y, w, h, 8);
    ctx.fill();
    ctx.stroke();
    ctx.restore();
    this.text(label, cx, y + h / 2 + 5, Math.min(20, h * 0.42), "#fff", "center");
    if (sub)
      this.text(sub, cx, y + h - 7, 10, hsla(accent, 80, 75), "center");
  }

  private panel(w: number, h: number): { x: number; y: number } {
    const ctx = this.ctx;
    const x = (this.view.w - w) / 2;
    const y = (this.view.h - h) / 2;
    ctx.fillStyle = "rgba(2,0,10,0.72)";
    ctx.fillRect(0, 0, this.view.w, this.view.h);
    return { x, y };
  }

  private drawHUD(): void {
    const v = this.view;
    const hue = this.spec.hue;
    this.text(`SCORE ${this.score}`, 16, 30, 16, "#fff", "left", 6);
    this.text(
      `HI ${Math.max(this.store.highScore, this.score)}`,
      16, 50, 11, hsla(hue + 60, 90, 70), "left",
    );
    this.text(`WAVE ${this.wave}`, v.w / 2, 30, 16, hsla(hue, 100, 75), "center", 8);
    if (this.mult() > 1)
      this.text(
        `x${this.mult()}  COMBO ${this.combo}`,
        v.w / 2, 50, 12, hsla(hue + 60, 100, 70), "center",
      );

    // lives + bombs
    for (let i = 0; i < this.player.lives && i < 8; i++) {
      const ctx = this.ctx;
      ctx.save();
      ctx.translate(v.w - 20 - i * 20, 26);
      ctx.fillStyle = hsla(hue + 60, 90, 65, 1);
      ctx.beginPath();
      ctx.moveTo(0, -7);
      ctx.lineTo(7, 7);
      ctx.lineTo(-7, 7);
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    }
    this.text(`◈ ${this.player.bombs}`, v.w - 16, 52, 12, "#ffd24d", "right");

    // buff timer chips
    const buffs = (
      [
        ["RPD", this.player.buffs.rapid, 50],
        ["SPR", this.player.buffs.spread, 200],
        ["TWN", this.player.buffs.double, 280],
        ["PRC", this.player.buffs.pierce, 330],
        ["x2", this.player.buffs.score, 95],
        ["MAG", this.player.buffs.magnet, 60],
        ["SLO", this.slowT, 160],
      ] as [string, number, number][]
    ).filter(([, t]) => t > 0);
    buffs.forEach(([lab, tleft, hh], i) => {
      const bx = 16 + i * 60;
      const by = v.h - 22;
      this.ctx.fillStyle = hsla(hh, 90, 55, 0.25);
      this.ctx.fillRect(bx, by, 52, 12);
      this.ctx.fillStyle = hsla(hh, 100, 65, 1);
      this.ctx.fillRect(bx, by, 52 * clamp(tleft / 13, 0, 1), 12);
      this.text(lab, bx + 26, by + 10, 9, "#fff", "center");
    });

    if (this.boss && !this.boss.dead) {
      const bw = v.w * 0.6;
      const bx = (v.w - bw) / 2;
      this.ctx.fillStyle = "rgba(255,255,255,0.12)";
      this.ctx.fillRect(bx, 64, bw, 8);
      this.ctx.fillStyle = hsla(hue, 100, 60, 1);
      this.ctx.fillRect(bx, 64, bw * clamp(this.boss.hp / this.boss.maxHp, 0, 1), 8);
      this.text(this.spec.name, v.w / 2, 86, 11, hsla(hue, 100, 75), "center");
    }

    // top-right tap controls
    const s = v.s;
    this.button("pause", "II", v.w - 40 * s, 70, 30 * s, 26 * s, hue);
    this.button("bomb", "◈", v.w - 76 * s, 70, 30 * s, 26 * s, 40);
  }

  private drawBrief(): void {
    const v = this.view;
    const hue = this.spec.hue;
    this.text(
      this.spec.isBoss ? "WARNING" : `WAVE ${this.wave}`,
      v.w / 2, v.h / 2 - 30, 22, hsla(hue, 100, 75), "center", 14,
    );
    this.text(
      this.spec.name,
      v.w / 2, v.h / 2 + 10, Math.min(46, v.w * 0.1),
      "#fff", "center", 18,
    );
    if (this.spec.modifiers.length)
      this.text(
        this.spec.modifiers.join("  ·  "),
        v.w / 2, v.h / 2 + 42, 13, hsla(hue + 60, 100, 70), "center",
      );
  }

  private drawMenu(): void {
    const v = this.view;
    const cx = v.w / 2;
    const hue = (this.t * 30) % 360;
    this.text("VOID", cx, v.h * 0.26, Math.min(86, v.w * 0.2), "#fff", "center", 24);
    this.text(
      "INVADERS",
      cx, v.h * 0.26 + Math.min(70, v.w * 0.15),
      Math.min(64, v.w * 0.15), hsla(hue, 100, 70), "center", 22,
    );
    this.text(
      `HI ${this.store.highScore}   ·   BEST WAVE ${this.store.bestWave}   ·   KILLS ${this.store.totalKills}`,
      cx, v.h * 0.46, 12, hsla(hue + 60, 80, 75), "center",
    );

    const bw = Math.min(300, v.w * 0.7);
    let y = v.h * 0.54;
    const run = this.store.run;
    if (run) {
      this.button(
        "resume-run", `RESUME · WAVE ${run.wave}`, cx, y, bw, 52,
        hue, `SCORE ${run.score} · ${run.lives} LIVES`,
      );
      y += 66;
      this.button("play", "NEW GAME", cx, y, bw, 46, hue + 40);
      y += 60;
    } else {
      this.button("play", "▶  PLAY", cx, y, bw, 56, hue);
      y += 72;
    }
    this.button(
      "diff", `DIFFICULTY · ${this.diff}`, cx, y, bw, 40,
      this.diff === "INSANE" ? 0 : this.diff === "HARD" ? 35 : 160,
    );
    y += 52;
    const half = bw / 2 - 4;
    this.button(
      "mute", this.store.settings.muted ? "SOUND OFF" : "SOUND ON",
      cx - half / 2 - 2, y, half, 38, 200,
    );
    this.button(
      "flash", this.store.settings.lowFlash ? "LOW FX" : "FULL FX",
      cx + half / 2 + 2, y, half, 38, 280,
    );
    y += 52;
    this.text(
      "MOVE: drag / ← → / A D    ·    FIRE: auto    ·    BOMB: B    ·    PAUSE: P",
      cx, y + 14, 11, "rgba(255,255,255,0.55)", "center",
    );
    this.text(
      "Installable · plays fully offline · progress auto-saves",
      cx, y + 32, 10, hsla(hue + 60, 70, 70), "center",
    );
  }

  private drawPause(): void {
    const v = this.view;
    this.panel(v.w, v.h);
    const cx = v.w / 2;
    this.text("PAUSED", cx, v.h * 0.32, 40, "#fff", "center", 16);
    const bw = Math.min(280, v.w * 0.7);
    let y = v.h * 0.42;
    this.button("resume", "RESUME", cx, y, bw, 50, 160);
    y += 62;
    this.button("restart", "RESTART RUN", cx, y, bw, 44, 35);
    y += 56;
    const half = bw / 2 - 4;
    this.button(
      "mute", this.store.settings.muted ? "SOUND OFF" : "SOUND ON",
      cx - half / 2 - 2, y, half, 40, 200,
    );
    this.button(
      "flash", this.store.settings.lowFlash ? "LOW FX" : "FULL FX",
      cx + half / 2 + 2, y, half, 40, 280,
    );
    y += 54;
    this.button("menu", "QUIT TO MENU", cx, y, bw, 42, 0);
  }

  private drawGameOver(): void {
    const v = this.view;
    this.panel(v.w, v.h);
    const cx = v.w / 2;
    const hue = (this.t * 60) % 360;
    this.text("GAME OVER", cx, v.h * 0.26, Math.min(56, v.w * 0.13), "#ff4466", "center", 20);
    if (this.newHigh && Math.floor(this.t * 4) % 2 === 0)
      this.text("◆ NEW HIGH SCORE ◆", cx, v.h * 0.34, 18, hsla(hue, 100, 70), "center", 14);
    this.text(`SCORE  ${this.score}`, cx, v.h * 0.43, 26, "#fff", "center", 8);
    this.text(
      `WAVE ${this.wave}   ·   KILLS ${this.kills}   ·   HI ${this.store.highScore}`,
      cx, v.h * 0.49, 13, "rgba(255,255,255,0.7)", "center",
    );
    const bw = Math.min(280, v.w * 0.7);
    this.button("retry", "▶  RETRY", cx, v.h * 0.56, bw, 52, 160);
    this.button("menu", "MENU", cx, v.h * 0.56 + 64, bw, 42, 280);
  }

  destroy(): void {
    this.input.destroy();
    this.audio.dispose();
  }
}
