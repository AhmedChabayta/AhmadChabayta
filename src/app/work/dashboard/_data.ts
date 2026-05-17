export type DeployStatus = "success" | "failed" | "canceled" | "building";

export interface DeployEvent {
  id: string;
  project: string;
  commit: string;
  message: string;
  status: DeployStatus;
  durationSec: number;
  ago: string;
  author: string;
}

export interface AppProject {
  name: string;
  slug: string;
  framework: string;
  region: string;
  status: DeployStatus;
  lastDeploy: string;
  deploys30d: number;
  errorRate: number;
}

export interface KpiPoint {
  t: number;
  v: number;
}

export interface KpiCard {
  label: string;
  value: string;
  delta: string;
  positive: boolean;
  spark: KpiPoint[];
}

// Deterministic pseudo-random so SSR + client match.
function mulberry32(seed: number) {
  return function () {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const rand = mulberry32(42);
const randB = mulberry32(1337);

export const KPIS: KpiCard[] = [
  {
    label: "TOTAL DEPLOYS",
    value: "1,247",
    delta: "+12.4%",
    positive: true,
    spark: Array.from({ length: 24 }, (_, i) => ({
      t: i,
      v: 18 + Math.floor(rand() * 22) + i * 0.5,
    })),
  },
  {
    label: "ACTIVE PROJECTS",
    value: "06",
    delta: "+2",
    positive: true,
    spark: Array.from({ length: 24 }, (_, i) => ({
      t: i,
      v: 2 + Math.floor(rand() * 4) + (i > 18 ? 2 : 0),
    })),
  },
  {
    label: "BUILDS / 24H",
    value: "47",
    delta: "−3.1%",
    positive: false,
    spark: Array.from({ length: 24 }, (_, i) => ({
      t: i,
      v: 8 + Math.floor(rand() * 14) - (i > 18 ? 4 : 0),
    })),
  },
  {
    label: "AVG BUILD",
    value: "42s",
    delta: "−8.7%",
    positive: true,
    spark: Array.from({ length: 24 }, (_, i) => ({
      t: i,
      v: 60 - i * 0.7 + Math.floor(rand() * 10),
    })),
  },
];

export const DEPLOYS_30D = (() => {
  const days = 30;
  const out: { day: string; success: number; failed: number }[] = [];
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    out.push({
      day: `${d.getMonth() + 1}/${d.getDate()}`,
      success: 4 + Math.floor(randB() * 18),
      failed: Math.floor(randB() * 4),
    });
  }
  return out;
})();

export const STATUS_DONUT = [
  { name: "SUCCESS", value: 1102, fill: "rgb(255 122 64)" },
  { name: "FAILED", value: 84, fill: "rgb(220 50 50)" },
  { name: "CANCELED", value: 61, fill: "rgb(115 115 115)" },
];

export const HEATMAP_DAYS: number[] = (() => {
  const r = mulberry32(7);
  const out: number[] = [];
  for (let i = 0; i < 53 * 7; i++) {
    const w = Math.floor(i / 7);
    // Slight uptick over time + weekday bias
    const base = w < 12 ? 0.3 : w < 30 ? 0.5 : 0.75;
    const day = i % 7;
    const dayBias = day === 0 || day === 6 ? 0.55 : 1.0;
    const x = r();
    const v =
      x < 0.18 * dayBias * base
        ? 0
        : x < 0.45 * base
        ? 1
        : x < 0.72 * base
        ? 2
        : x < 0.92 * base
        ? 3
        : 4;
    out.push(v);
  }
  return out;
})();

export const EVENTS: DeployEvent[] = [
  {
    id: "dpl_a9c",
    project: "ahmad-chabayta",
    commit: "4b0eb9e",
    message: "Procedural tree: scroll-grown canopy",
    status: "success",
    durationSec: 47,
    ago: "12m",
    author: "AhmedChabayta",
  },
  {
    id: "dpl_71f",
    project: "preview-links",
    commit: "a47e3b1",
    message: "Add team filter to deploy list",
    status: "success",
    durationSec: 38,
    ago: "1h",
    author: "AhmedChabayta",
  },
  {
    id: "dpl_e02",
    project: "rich-media-builder",
    commit: "1c9d22f",
    message: "Persist canvas state to URL hash",
    status: "building",
    durationSec: 22,
    ago: "now",
    author: "AhmedChabayta",
  },
  {
    id: "dpl_55d",
    project: "preview-links",
    commit: "fe9a401",
    message: "Tighten loading state for deploy table",
    status: "failed",
    durationSec: 12,
    ago: "3h",
    author: "AhmedChabayta",
  },
  {
    id: "dpl_330",
    project: "ahmad-chabayta",
    commit: "b0f987e",
    message: "Add breathing room + real project showcases",
    status: "success",
    durationSec: 51,
    ago: "5h",
    author: "AhmedChabayta",
  },
  {
    id: "dpl_19a",
    project: "pottyfolly",
    commit: "208c114",
    message: "Bump next to 16.2",
    status: "canceled",
    durationSec: 4,
    ago: "1d",
    author: "AhmedChabayta",
  },
  {
    id: "dpl_2b1",
    project: "rich-media-builder",
    commit: "77a09e3",
    message: "Drag-drop snap to 8px grid",
    status: "success",
    durationSec: 43,
    ago: "1d",
    author: "AhmedChabayta",
  },
  {
    id: "dpl_88c",
    project: "ahmad-chabayta",
    commit: "af90b87",
    message: "Fix stats counter SSR rendering as zeros",
    status: "success",
    durationSec: 39,
    ago: "1d",
    author: "AhmedChabayta",
  },
];

export const APP_PROJECTS: AppProject[] = [
  {
    name: "ahmad-chabayta",
    slug: "ahmad-chabayta",
    framework: "Next.js",
    region: "iad1",
    status: "success",
    lastDeploy: "12m ago",
    deploys30d: 47,
    errorRate: 0.0,
  },
  {
    name: "preview-links",
    slug: "preview-links",
    framework: "Next.js",
    region: "fra1",
    status: "success",
    lastDeploy: "1h ago",
    deploys30d: 38,
    errorRate: 0.4,
  },
  {
    name: "rich-media-builder",
    slug: "rich-media-builder",
    framework: "Next.js",
    region: "iad1",
    status: "building",
    lastDeploy: "now",
    deploys30d: 22,
    errorRate: 1.1,
  },
  {
    name: "dashboard-template",
    slug: "dashboard-template",
    framework: "Next.js",
    region: "iad1",
    status: "success",
    lastDeploy: "5d ago",
    deploys30d: 9,
    errorRate: 0.0,
  },
  {
    name: "pottyfolly",
    slug: "pottyfolly",
    framework: "Next.js",
    region: "cdg1",
    status: "canceled",
    lastDeploy: "1d ago",
    deploys30d: 4,
    errorRate: 0.2,
  },
  {
    name: "tailshop",
    slug: "tailshop",
    framework: "Next.js",
    region: "sfo1",
    status: "success",
    lastDeploy: "8d ago",
    deploys30d: 3,
    errorRate: 0.0,
  },
];
