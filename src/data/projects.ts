export type ProjectStack = string;

export type ProjectDemo =
  | { kind: "fractal-playground" }
  | { kind: "git-pulse" }
  | { kind: "component-lab" }
  | { kind: "wave-synth" }
  | { kind: "color-extractor" }
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
  demo: ProjectDemo;
  featured?: boolean;
}

export const PROJECTS: Project[] = [
  {
    slug: "mandelbulb-playground",
    index: "01",
    title: "Mandelbulb Playground",
    tagline: "Live GLSL raymarcher with parameter sliders & shareable URLs.",
    summary:
      "A WebGL Mandelbulb that renders in real time, with controls for power, phase, color and zoom. Every parameter encodes into the URL so any composition is one link away.",
    year: 2026,
    role: "Concept, GLSL, frontend",
    stack: ["Three.js", "GLSL", "TypeScript", "Next.js"],
    demo: { kind: "fractal-playground" },
    featured: true,
  },
  {
    slug: "git-pulse",
    index: "02",
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
    slug: "component-lab",
    index: "03",
    title: "Component Lab",
    tagline: "A typed React component library with a live prop playground.",
    summary:
      "A small design system built on shadcn primitives, exposed through a playground where any consumer can tweak props and copy the resulting JSX.",
    year: 2026,
    role: "Design, components, docs",
    stack: ["React", "shadcn/ui", "Radix", "Tailwind"],
    demo: { kind: "component-lab" },
  },
  {
    slug: "wave-synth",
    index: "04",
    title: "Wave Synth",
    tagline: "Touch-driven multi-layer oscillator visualizer.",
    summary:
      "Three interfering waves whose frequency and amplitude track your finger or cursor in real time. Works the same on mouse and touch.",
    year: 2026,
    role: "Concept, canvas, audio",
    stack: ["Canvas2D", "Web Audio", "Pointer Events"],
    demo: { kind: "wave-synth" },
  },
  {
    slug: "color-extractor",
    index: "05",
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
    index: "06",
    title: "Fractal Poster Press",
    tagline: "Generative brutalist poster system, click to print.",
    summary:
      "Algorithmic poster generator inspired by Swiss/grunge type. Outputs to PNG and SVG with deterministic seeds for reproducible runs.",
    year: 2025,
    role: "Concept, generative",
    stack: ["Canvas2D", "TypeScript"],
    demo: { kind: "none" },
  },
];

export function getProject(slug: string): Project | undefined {
  return PROJECTS.find((p) => p.slug === slug);
}
