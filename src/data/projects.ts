export type ProjectStack = string;

export type ProjectDemo =
  | { kind: "git-pulse" }
  | { kind: "component-lab" }
  | { kind: "wave-synth" }
  | { kind: "color-extractor" }
  | { kind: "dashboard" }
  | { kind: "none" };

export interface Project {
  slug: string;
  index: string;
  title: string;
  tagline: string;
  summary: string;
  year: number;
  role: string;
  stack: ProjectStack[];
  links?: { label: string; href: string }[];
  /**
   * If set, the project card opens this URL in a new tab (external live
   * deployment outside the portfolio repo).
   */
  externalUrl?: string;
  /**
   * If set, the work card routes to this internal full-page app instead of
   * the legacy /work/[slug] case-study template.
   */
  appHref?: string;
  demo: ProjectDemo;
  featured?: boolean;
}

export const PROJECTS: Project[] = [
  {
    slug: "dashboard",
    index: "01",
    title: "Project Atlas",
    tagline: "A full operations dashboard — KPIs, charts, heatmap, event feed.",
    summary:
      "A real, full-page dashboard application built into the portfolio. Mock telemetry stands in for a deploy/build pipeline: KPI cards with live sparklines, 30-day deploys area chart, status donut, a year-of-contributions heatmap, an event feed, and a filterable projects table.",
    year: 2026,
    role: "Design, frontend, data",
    stack: ["Next.js", "TypeScript", "Recharts", "Tailwind"],
    appHref: "/work/dashboard",
    demo: { kind: "dashboard" },
    featured: true,
  },
  {
    slug: "preview-links",
    index: "02",
    title: "Preview Links",
    tagline: "A multi-tenant dashboard for managing preview deployments at scale.",
    summary:
      "Real-time dashboard that aggregates deployment status, contributor activity and live previews across an org. Built on Next.js App Router + server components, shipping live at previewlinks.xyz.",
    year: 2026,
    role: "Design, frontend, data",
    stack: ["Next.js", "TypeScript", "TanStack Query", "Tailwind"],
    externalUrl: "https://previewlinks.xyz",
    demo: { kind: "none" },
    featured: true,
  },
  {
    slug: "rich-media-builder",
    index: "03",
    title: "Rich Media Builder",
    tagline: "A drag-and-drop composer for editorial-grade rich media units.",
    summary:
      "A visual editor that lets non-developers assemble layered hero modules with motion, custom typography and responsive breakpoints — and exports clean HTML/CSS the engineering team can ship.",
    year: 2026,
    role: "Design, frontend, motion",
    stack: ["Next.js", "framer-motion", "TypeScript", "Tailwind"],
    externalUrl: "https://rich-media-builder-one.vercel.app",
    demo: { kind: "none" },
    featured: true,
  },
  {
    slug: "git-pulse",
    index: "04",
    title: "Git Pulse",
    tagline: "Live GitHub activity dashboard built on Recharts + the GitHub API.",
    summary:
      "A real-time dashboard reading a public GitHub feed and visualizing commits, languages and contribution cadence with animated charts.",
    year: 2026,
    role: "Design, data, frontend",
    stack: ["Next.js", "Recharts", "TanStack Query", "TypeScript"],
    demo: { kind: "git-pulse" },
    featured: true,
  },
  {
    slug: "pottyfolly",
    index: "05",
    title: "Pottyfolly",
    tagline: "An earlier portfolio experiment — typography-led, image-driven.",
    summary:
      "An earlier-generation personal site exploring expressive typographic layouts and image-led storytelling. Still live, kept around as a snapshot.",
    year: 2024,
    role: "Design, frontend",
    stack: ["Next.js", "Tailwind"],
    externalUrl: "https://pottyfolly-chabays-projects.vercel.app",
    demo: { kind: "none" },
  },
  {
    slug: "component-lab",
    index: "06",
    title: "Component Lab",
    tagline: "A typed React component library with a live prop playground.",
    summary:
      "A small design system built on shadcn primitives, exposed through a playground where any consumer can tweak props and copy the resulting JSX.",
    year: 2026,
    role: "Design, components, docs",
    stack: ["React", "shadcn/ui", "Radix", "Tailwind"],
    appHref: "/work/component-lab",
    demo: { kind: "component-lab" },
  },
  {
    slug: "wave-synth",
    index: "07",
    title: "Wave Synth",
    tagline: "Touch-driven multi-layer oscillator visualizer.",
    summary:
      "Three interfering waves whose frequency and amplitude track your finger or cursor in real time. Works the same on mouse and touch.",
    year: 2026,
    role: "Concept, canvas, audio",
    stack: ["Canvas2D", "Web Audio", "Pointer Events"],
    appHref: "/work/wave-synth",
    demo: { kind: "wave-synth" },
  },
  {
    slug: "color-extractor",
    index: "08",
    title: "Color Token Extractor",
    tagline: "Drop in an image, get a typed design-token palette.",
    summary:
      "Client-only utility that uses k-means clustering on a sampled image to derive a tonal palette, then exports it as CSS variables, Tailwind tokens or Figma styles.",
    year: 2026,
    role: "Utility, algorithm, UX",
    stack: ["TypeScript", "Canvas2D", "shadcn"],
    demo: { kind: "color-extractor" },
  },
  {
    slug: "fractal-poster-press",
    index: "09",
    title: "Fractal Poster Press",
    tagline: "Generative brutalist poster system, click to print.",
    summary:
      "Algorithmic poster generator inspired by Swiss/grunge type. Outputs to PNG and SVG with deterministic seeds for reproducible runs.",
    year: 2025,
    role: "Concept, generative",
    stack: ["Canvas2D", "TypeScript"],
    demo: { kind: "none" },
  },
  {
    slug: "space-invaders",
    index: "10",
    title: "Void Invaders",
    tagline:
      "Endless evolving arcade shooter — installable PWA, fully offline.",
    summary:
      "A classic ship-versus-aliens arcade game rebuilt as an infinite gauntlet: endlessly escalating waves, multi-phase bosses, ten stacking power-ups, combo scoring and destructible bunkers. Every sound and the adaptive soundtrack are synthesized live with the Web Audio API, so it ships as an installable PWA that plays 100% offline with auto-saved progress.",
    year: 2026,
    role: "Concept, engine, audio, PWA",
    stack: ["Canvas2D", "Web Audio", "TypeScript", "PWA"],
    appHref: "/work/space-invaders",
    demo: { kind: "none" },
    featured: true,
  },
];

export function getProject(slug: string): Project | undefined {
  return PROJECTS.find((p) => p.slug === slug);
}
