// Endless, evolving wave generator. Difficulty climbs forever: bigger
// formations, faster strafing, denser fire, new enemy types and modifiers
// unlock with depth, and every 5th wave is a boss.
import type { Difficulty, EnemyKind } from "./types";
import { RNG } from "./types";

export interface WaveSpec {
  index: number;
  isBoss: boolean;
  bossTier: number;
  rows: number;
  cols: number;
  grid: EnemyKind[][];
  speed: number;
  fireRate: number;
  bulletSpeed: number;
  modifiers: string[];
  hue: number;
  name: string;
}

const NAMES = [
  "DRIFT", "NEBULA RUN", "SILENT GRID", "ION STORM", "HEX SWARM",
  "NULL SECTOR", "PULSAR", "EVENT HORIZON", "QUASAR", "DARK MATTER",
  "SUPERNOVA", "VOID TIDE", "GAMMA BLOOM", "COLLAPSE", "REDSHIFT",
];

const BOSS_NAMES = [
  "THE HOLLOW", "OMEGA NODE", "DREADLOOM", "STAREATER",
  "THE WARDEN", "NULLPRIME", "ANNIHILATOR",
];

const DIFF: Record<Difficulty, number> = {
  NORMAL: 1,
  HARD: 1.32,
  INSANE: 1.7,
};

function composition(n: number): EnemyKind[] {
  const pool: EnemyKind[] = ["grunt", "grunt"];
  if (n >= 2) pool.push("shooter");
  if (n >= 3) pool.push("weaver");
  if (n >= 4) pool.push("tank");
  if (n >= 5) pool.push("diver");
  if (n >= 7) pool.push("splitter");
  if (n >= 9) pool.push("shooter", "tank");
  return pool;
}

export function makeWave(
  n: number,
  difficulty: Difficulty,
  rng: RNG,
): WaveSpec {
  const dm = DIFF[difficulty];
  const isBoss = n % 5 === 0;
  const bossTier = isBoss ? n / 5 : 0;
  const hue = (n * 41 + 200) % 360;

  if (isBoss) {
    return {
      index: n,
      isBoss: true,
      bossTier,
      rows: 1,
      cols: 5,
      grid: [Array.from({ length: 5 }, () => "grunt" as EnemyKind)],
      speed: (40 + bossTier * 6) * dm,
      fireRate: (1.4 + bossTier * 0.5) * dm,
      bulletSpeed: (190 + bossTier * 16) * dm,
      modifiers: [`TIER ${bossTier}`],
      hue,
      name: `BOSS // ${BOSS_NAMES[(bossTier - 1) % BOSS_NAMES.length]}`,
    };
  }

  const cols = Math.min(11, 6 + Math.floor(n / 2));
  const rows = Math.min(6, 3 + Math.floor(n / 3));
  const pool = composition(n);

  const mods: string[] = [];
  const unlocked: [number, string][] = [
    [3, "WEAVE"],
    [4, "ARMORED"],
    [5, "DIVE BOMBERS"],
    [6, "SWARM"],
    [8, "SNIPERS"],
    [11, "FAST DESCENT"],
    [13, "RAGE"],
  ];
  const avail = unlocked.filter(([w]) => n >= w).map(([, m]) => m);
  const want = n < 4 ? 0 : Math.min(2, 1 + Math.floor(n / 9));
  while (mods.length < want && avail.length) {
    const m = rng.pick(avail);
    if (!mods.includes(m)) mods.push(m);
    else break;
  }

  const swarm = mods.includes("SWARM");
  const rage = mods.includes("RAGE");
  const grid: EnemyKind[][] = [];
  for (let r = 0; r < rows; r++) {
    const row: EnemyKind[] = [];
    for (let c = 0; c < cols; c++) {
      // tougher enemies sit toward the back rows
      let k = rng.pick(pool);
      if (r === 0 && n >= 4 && rng.chance(0.35)) k = "tank";
      if (swarm) k = rng.chance(0.85) ? "grunt" : k;
      row.push(k);
    }
    grid.push(row);
  }

  let speed = 24 + n * 3.1;
  if (swarm) speed *= 1.28;
  if (rage) speed *= 1.2;
  speed = Math.min(150, speed) * dm;

  let fireRate = 0.5 + n * 0.13;
  if (rage) fireRate *= 1.35;
  fireRate = Math.min(4.5, fireRate) * dm;

  return {
    index: n,
    isBoss: false,
    bossTier: 0,
    rows,
    cols,
    grid,
    speed,
    fireRate,
    bulletSpeed: Math.min(360, 150 + n * 6) * dm,
    modifiers: mods,
    hue,
    name: rng.pick(NAMES),
  };
}
