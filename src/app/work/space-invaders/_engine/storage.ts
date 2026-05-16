// localStorage persistence — high score, lifetime stats, settings, and an
// auto-saved run so a game survives closing the tab. SSR/private-mode safe.
import type { Difficulty } from "./types";

const KEY = "void-invaders:v1";

export interface SavedRun {
  wave: number;
  score: number;
  lives: number;
  bombs: number;
  difficulty: Difficulty;
}

export interface Settings {
  muted: boolean;
  lowFlash: boolean;
  difficulty: Difficulty;
}

export interface Store {
  highScore: number;
  bestWave: number;
  totalKills: number;
  gamesPlayed: number;
  coins: number;
  upgrades: Record<string, number>;
  settings: Settings;
  run: SavedRun | null;
}

const DEFAULT: Store = {
  highScore: 0,
  bestWave: 0,
  totalKills: 0,
  gamesPlayed: 0,
  coins: 0,
  upgrades: {},
  settings: { muted: false, lowFlash: false, difficulty: "NORMAL" },
  run: null,
};

function safeParse(raw: string | null): Store {
  if (!raw) return { ...DEFAULT, settings: { ...DEFAULT.settings } };
  try {
    const p = JSON.parse(raw) as Partial<Store>;
    return {
      ...DEFAULT,
      ...p,
      coins: Math.max(0, Math.floor(p.coins ?? 0)),
      upgrades: { ...(p.upgrades ?? {}) },
      settings: { ...DEFAULT.settings, ...(p.settings ?? {}) },
      run: p.run ?? null,
    };
  } catch {
    return { ...DEFAULT, settings: { ...DEFAULT.settings } };
  }
}

export function loadStore(): Store {
  if (typeof window === "undefined") {
    return { ...DEFAULT, settings: { ...DEFAULT.settings } };
  }
  try {
    return safeParse(window.localStorage.getItem(KEY));
  } catch {
    return { ...DEFAULT, settings: { ...DEFAULT.settings } };
  }
}

export function saveStore(s: Store): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(KEY, JSON.stringify(s));
  } catch {
    /* quota / private mode — ignore, game still runs */
  }
}
