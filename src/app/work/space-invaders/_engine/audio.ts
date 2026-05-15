// Fully procedural audio — every sound and the music are synthesized at
// runtime with the Web Audio API. No asset files, so it works offline.
import type { PowerKind } from "./types";

type Ctor = typeof AudioContext;

function getCtor(): Ctor | null {
  if (typeof window === "undefined") return null;
  const w = window as unknown as {
    AudioContext?: Ctor;
    webkitAudioContext?: Ctor;
  };
  return w.AudioContext ?? w.webkitAudioContext ?? null;
}

// Minor-pentatonic scale degrees (semitones) for that retro-arcade vibe.
const PENTA = [0, 3, 5, 7, 10];
const midi = (n: number): number => 440 * Math.pow(2, (n - 69) / 12);

export class Audio {
  private ctx: AudioContext | null = null;
  private master: GainNode | null = null;
  private musicGain: GainNode | null = null;
  private noise: AudioBuffer | null = null;
  private muted = false;

  private timer: number | null = null;
  private step = 0;
  private nextTime = 0;
  private bpm = 104;
  private root = 33; // MIDI A1-ish
  private boss = false;
  private playing = false;

  init(): void {
    if (this.ctx) {
      void this.ctx.resume();
      return;
    }
    const C = getCtor();
    if (!C) return;
    const ctx = new C();
    this.ctx = ctx;
    const master = ctx.createGain();
    master.gain.value = this.muted ? 0 : 0.9;
    master.connect(ctx.destination);
    this.master = master;
    const mg = ctx.createGain();
    mg.gain.value = 0.55;
    mg.connect(master);
    this.musicGain = mg;

    const len = Math.floor(ctx.sampleRate * 0.5);
    const buf = ctx.createBuffer(1, len, ctx.sampleRate);
    const d = buf.getChannelData(0);
    for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
    this.noise = buf;
    void ctx.resume();
  }

  setMuted(m: boolean): void {
    this.muted = m;
    if (this.master && this.ctx) {
      this.master.gain.setTargetAtTime(
        m ? 0 : 0.9,
        this.ctx.currentTime,
        0.02,
      );
    }
  }

  private env(
    node: AudioNode,
    t: number,
    a: number,
    d: number,
    peak: number,
    sustain = 0,
    rel = 0.02,
  ): GainNode {
    const ctx = this.ctx!;
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(peak, t + a);
    g.gain.exponentialRampToValueAtTime(
      Math.max(sustain, 0.0001),
      t + a + d,
    );
    if (sustain <= 0)
      g.gain.exponentialRampToValueAtTime(0.0001, t + a + d + rel);
    node.connect(g);
    return g;
  }

  private tone(
    freq: number,
    type: OscillatorType,
    dur: number,
    vol: number,
    glide = 0,
    dest?: AudioNode,
  ): void {
    const ctx = this.ctx;
    if (!ctx || !this.master) return;
    const t = ctx.currentTime;
    const o = ctx.createOscillator();
    o.type = type;
    o.frequency.setValueAtTime(freq, t);
    if (glide)
      o.frequency.exponentialRampToValueAtTime(
        Math.max(40, freq * glide),
        t + dur,
      );
    const g = this.env(o, t, Math.min(0.012, dur * 0.3), dur, vol);
    g.connect(dest ?? this.master);
    o.start(t);
    o.stop(t + dur + 0.08);
  }

  private burst(dur: number, vol: number, cutoff: number, sweep = 0.2): void {
    const ctx = this.ctx;
    if (!ctx || !this.noise || !this.master) return;
    const t = ctx.currentTime;
    const src = ctx.createBufferSource();
    src.buffer = this.noise;
    const f = ctx.createBiquadFilter();
    f.type = "lowpass";
    f.frequency.setValueAtTime(cutoff, t);
    f.frequency.exponentialRampToValueAtTime(
      Math.max(120, cutoff * sweep),
      t + dur,
    );
    src.connect(f);
    const g = this.env(f, t, 0.005, dur, vol);
    g.connect(this.master);
    src.start(t);
    src.stop(t + dur + 0.05);
  }

  // ---- one-shot SFX -------------------------------------------------------
  shoot(): void {
    this.tone(880, "square", 0.09, 0.16, 0.45);
    this.tone(1760, "triangle", 0.05, 0.06);
  }
  enemyShoot(): void {
    this.tone(220, "sawtooth", 0.16, 0.1, 0.55);
  }
  explode(scale = 1): void {
    this.burst(0.32 * scale, 0.5, 1600, 0.12);
    this.tone(150, "sawtooth", 0.22 * scale, 0.18, 0.4);
  }
  bossDie(): void {
    this.burst(1.1, 0.6, 2400, 0.05);
    this.tone(90, "sawtooth", 1.0, 0.28, 0.3);
    for (let i = 0; i < 5; i++)
      window.setTimeout(() => this.explode(1.1), i * 130);
  }
  playerHit(): void {
    this.burst(0.5, 0.5, 900, 0.1);
    this.tone(330, "sawtooth", 0.5, 0.22, 0.15);
  }
  shieldHit(): void {
    this.tone(1200, "sine", 0.16, 0.16, 0.5);
    this.tone(720, "triangle", 0.12, 0.1);
  }
  power(kind: PowerKind): void {
    const base = kind === "nuke" || kind === "life" ? 520 : 660;
    for (let i = 0; i < 4; i++)
      window.setTimeout(
        () => this.tone(base * Math.pow(1.26, i), "triangle", 0.1, 0.16),
        i * 45,
      );
  }
  nuke(): void {
    this.burst(0.9, 0.7, 3200, 0.04);
    this.tone(70, "sine", 0.9, 0.3, 0.5);
  }
  extraLife(): void {
    [0, 4, 7, 12].forEach((s, i) =>
      window.setTimeout(
        () => this.tone(midi(72 + s), "triangle", 0.16, 0.18),
        i * 70,
      ),
    );
  }
  combo(n: number): void {
    this.tone(440 + n * 28, "square", 0.06, 0.1, 1.4);
  }
  levelUp(): void {
    [0, 4, 7].forEach((s, i) =>
      window.setTimeout(
        () => this.tone(midi(64 + s), "sawtooth", 0.22, 0.16),
        i * 80,
      ),
    );
  }
  bossWarn(): void {
    this.tone(110, "sawtooth", 0.6, 0.22, 1.0);
    this.tone(112, "sawtooth", 0.6, 0.18, 1.0);
  }
  gameOver(): void {
    [0, -2, -4, -7, -12].forEach((s, i) =>
      window.setTimeout(
        () => this.tone(midi(60 + s), "sawtooth", 0.4, 0.2, 0.6),
        i * 160,
      ),
    );
  }
  ui(): void {
    this.tone(560, "square", 0.04, 0.07);
  }
  uiSelect(): void {
    this.tone(720, "square", 0.06, 0.1, 1.5);
  }

  // ---- adaptive music -----------------------------------------------------
  setIntensity(wave: number, boss: boolean): void {
    this.bpm = Math.min(168, 100 + wave * 3 + (boss ? 22 : 0));
    this.root = 31 + ((wave * 5) % 12); // shift key each wave
    this.boss = boss;
  }

  startMusic(): void {
    if (this.playing || !this.ctx) return;
    this.playing = true;
    this.nextTime = this.ctx.currentTime + 0.1;
    this.step = 0;
    const tick = (): void => {
      if (!this.playing || !this.ctx) return;
      const spb = 60 / this.bpm / 4; // 16th notes
      while (this.nextTime < this.ctx.currentTime + 0.12) {
        this.schedule(this.step, this.nextTime);
        this.nextTime += spb;
        this.step = (this.step + 1) % 32;
      }
      this.timer = window.setTimeout(tick, 25);
    };
    tick();
  }

  stopMusic(): void {
    this.playing = false;
    if (this.timer !== null) {
      window.clearTimeout(this.timer);
      this.timer = null;
    }
  }

  private schedule(step: number, t: number): void {
    const ctx = this.ctx;
    const mg = this.musicGain;
    if (!ctx || !mg) return;
    const beat = step % 4 === 0;

    if (beat) {
      // bass — walking root/fifth
      const deg = step % 8 === 0 ? 0 : step % 8 === 4 ? 7 : 5;
      const o = ctx.createOscillator();
      o.type = "sawtooth";
      o.frequency.value = midi(this.root + deg);
      const g = this.env(o, t, 0.01, 0.22, 0.5);
      g.connect(mg);
      o.start(t);
      o.stop(t + 0.34);
    }
    // arp — pentatonic sparkle
    if (step % 2 === 0) {
      const note =
        this.root + 24 + PENTA[(step >> 1) % PENTA.length] + (step % 8 === 6 ? 12 : 0);
      const o = ctx.createOscillator();
      o.type = "triangle";
      o.frequency.value = midi(note);
      const g = this.env(o, t, 0.005, 0.12, 0.13);
      g.connect(mg);
      o.start(t);
      o.stop(t + 0.2);
    }
    // kick on the beat
    if (beat && this.noise) {
      const o = ctx.createOscillator();
      o.type = "sine";
      o.frequency.setValueAtTime(140, t);
      o.frequency.exponentialRampToValueAtTime(45, t + 0.12);
      const g = this.env(o, t, 0.004, 0.14, 0.5);
      g.connect(mg);
      o.start(t);
      o.stop(t + 0.2);
    }
    // hats
    if (step % 2 === 1 && this.noise) {
      const s = ctx.createBufferSource();
      s.buffer = this.noise;
      const f = ctx.createBiquadFilter();
      f.type = "highpass";
      f.frequency.value = 7000;
      s.connect(f);
      const g = this.env(f, t, 0.002, 0.03, 0.06);
      g.connect(mg);
      s.start(t);
      s.stop(t + 0.06);
    }
    // boss pad
    if (this.boss && step % 8 === 0) {
      const o = ctx.createOscillator();
      o.type = "sawtooth";
      o.frequency.value = midi(this.root + 12);
      const g = this.env(o, t, 0.08, 0.9, 0.07, 0.05, 0.3);
      g.connect(mg);
      o.start(t);
      o.stop(t + 1.2);
    }
  }

  dispose(): void {
    this.stopMusic();
    if (this.ctx) {
      void this.ctx.close();
      this.ctx = null;
    }
  }
}
