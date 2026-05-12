export type ProjectStack = string;

export type ProjectDemo =
  | { kind: "fractal-playground" }
  | { kind: "git-pulse" }
  | { kind: "component-lab" }
  | { kind: "wave-synth" }
  | { kind: "color-extractor" }
  | { kind: "none" };

export interface CaseStudySection {
  heading: string;
  body: string;
}

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
   * If set, the project card opens this live URL in a new tab instead of
   * routing to the internal project page. Use for external/live deployments.
   */
  externalUrl?: string;
  demo: ProjectDemo;
  featured?: boolean;
  /** Long-form case study sections rendered on /work/[slug]. */
  caseStudy?: CaseStudySection[];
}

export const PROJECTS: Project[] = [
  {
    slug: "dashboard-template",
    index: "01",
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
    index: "02",
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
    slug: "mandelbulb-playground",
    index: "03",
    title: "Mandelbulb Playground",
    tagline: "Live GLSL raymarcher with parameter sliders & shareable URLs.",
    summary:
      "A WebGL Mandelbulb that renders in real time, with controls for power, phase, color and zoom. Every parameter encodes into the URL so any composition is one link away.",
    year: 2026,
    role: "Concept, GLSL, frontend",
    stack: ["Three.js", "GLSL", "TypeScript", "Next.js"],
    demo: { kind: "fractal-playground" },
    featured: true,
    caseStudy: [
      {
        heading: "WHAT IT IS",
        body: "A live, browser-rendered Mandelbulb — a 3D analogue of the Mandelbrot fractal. Every pixel you see is solved by raymarching: shooting a ray from the camera through that pixel, then stepping along it until it hits the fractal's distance field. No meshes. No textures. Just math.",
      },
      {
        heading: "THE SHADER",
        body: "The core is a fragment shader written in GLSL ES 1.0 — one screen-filling quad, no per-vertex work, every pixel solved independently on the GPU. The mandelbulb function iterates z = z^n + p in spherical coordinates up to 14 times per ray sample, with an early-exit when the orbit escapes. The escape time produces both the surface position and an 'orbit trap' value used for ambient-occlusion shading.",
      },
      {
        heading: "MAKING IT INTERACTIVE",
        body: "Every dial in the side panel maps to a single uniform in the shader. Sliding 'power' from 8 to 12 morphs the geometry from a smooth bulb into a writhing thorn-shape, in real time, because each frame re-evaluates the field at the new exponent. Iterations control fidelity vs. framerate. Color core and halo are two sampled RGBs the shader interpolates by orbit-trap depth.",
      },
      {
        heading: "SHAREABLE URLS",
        body: "Every parameter is serialized into the query string via window.history.replaceState — debounced so dragging a slider doesn't spam the history. Loading the page hydrates the panel from those params. Hit COPY SHARE URL and you get a link that reproduces the exact composition for anyone else, no account, no server.",
      },
      {
        heading: "PERFORMANCE",
        body: "60fps on most desktops, ~30fps on phones. Caps: device pixel ratio clamped to 1.5x to keep mobile GPUs honest, raymarch max-steps at 70, iter ceiling at 14, antialias off (raymarched edges fake it well enough). The whole thing weighs ~6kb of GLSL and ~140 lines of TypeScript glue.",
      },
    ],
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
];

export function getProject(slug: string): Project | undefined {
  return PROJECTS.find((p) => p.slug === slug);
}
