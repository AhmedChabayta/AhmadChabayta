// Shared types, math and RNG for VOID INVADERS.
// Pure, framework-agnostic — no DOM, no React.

export type Difficulty = "NORMAL" | "HARD" | "INSANE";

export type GameState =
  | "MENU"
  | "STORE"
  | "BRIEF"
  | "PLAY"
  | "PAUSE"
  | "DEAD"
  | "GAMEOVER";

export type EnemyKind =
  | "grunt"
  | "shooter"
  | "weaver"
  | "diver"
  | "tank"
  | "splitter"
  | "mini";

export type PowerKind =
  | "rapid"
  | "spread"
  | "double"
  | "pierce"
  | "shield"
  | "slow"
  | "nuke"
  | "life"
  | "score"
  | "magnet";

export interface Vec2 {
  x: number;
  y: number;
}

export const TAU = Math.PI * 2;

export const clamp = (v: number, a: number, b: number): number =>
  v < a ? a : v > b ? b : v;

export const lerp = (a: number, b: number, t: number): number =>
  a + (b - a) * t;

/** Frame-rate independent exponential approach toward `target`. */
export const damp = (
  cur: number,
  target: number,
  rate: number,
  dt: number,
): number => lerp(cur, target, 1 - Math.exp(-rate * dt));

export const smoothstep = (e0: number, e1: number, x: number): number => {
  const t = clamp((x - e0) / (e1 - e0), 0, 1);
  return t * t * (3 - 2 * t);
};

export const dist = (ax: number, ay: number, bx: number, by: number): number =>
  Math.hypot(ax - bx, ay - by);

/** Mulberry32 — tiny, fast, seedable PRNG. */
export class RNG {
  private s: number;
  constructor(seed: number) {
    this.s = seed >>> 0 || 1;
  }
  next(): number {
    this.s = (this.s + 0x6d2b79f5) >>> 0;
    let t = this.s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  }
  range(a: number, b: number): number {
    return a + this.next() * (b - a);
  }
  int(a: number, b: number): number {
    return Math.floor(this.range(a, b + 1));
  }
  chance(p: number): boolean {
    return this.next() < p;
  }
  pick<T>(arr: readonly T[]): T {
    return arr[Math.floor(this.next() * arr.length)];
  }
}

export const hsla = (h: number, s: number, l: number, a = 1): string =>
  `hsla(${((h % 360) + 360) % 360},${s}%,${l}%,${a})`;
