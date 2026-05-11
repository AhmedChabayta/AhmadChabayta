# Ahmad Chabayta — Portfolio

Personal site & portfolio. Migrated from vanilla HTML (see [`/legacy`](./legacy)) to **Next.js 16 + TypeScript + Tailwind v4 + shadcn-style primitives + Recharts + framer-motion + three.js**.

## Stack

- **Next.js 16** (App Router, Turbopack, RSC)
- **TypeScript** (strict)
- **Tailwind CSS v4** (with `@theme` design tokens)
- **shadcn/ui** conventions (`components.json`, `cn()` utility, CSS variables)
- **framer-motion** for entrance + scroll-driven motion
- **Recharts** for the live data dashboard demo
- **three.js** for the GLSL Mandelbulb raymarcher
- **lucide-react** for icons

## Pages

- `/` — landing (hero, fractal, capabilities, stats, experiments, work preview)
- `/work` — index of all projects
- `/work/[slug]` — per-project page with live demo, summary, prev/next nav
- `/visuals` — fractal + interactive experiments
- `/about` — bio + capabilities + stats
- `/contact` — direct contact links

Project list lives in [`src/data/projects.ts`](./src/data/projects.ts). Add a new entry there and (optionally) wire a custom demo in [`src/components/work/project-demo.tsx`](./src/components/work/project-demo.tsx).

## Local development

```bash
npm install
npm run dev       # http://localhost:3000
npm run typecheck # tsc --noEmit
npm run lint
npm run build     # production build
```

## Deploy

Deployed on **Vercel**. The `main` branch builds automatically. `vercel.json` adds standard security headers and pins the build command.

The previous static site (vanilla HTML + GLSL) is preserved in [`/legacy`](./legacy) for reference.

## Repository structure

```
src/
├── app/                 # App Router pages (RSC by default)
│   ├── page.tsx         # landing
│   ├── layout.tsx       # nav, footer, scroll progress
│   ├── about/
│   ├── contact/
│   ├── visuals/
│   └── work/
│       ├── page.tsx     # project index
│       └── [slug]/      # dynamic project pages
├── components/
│   ├── site/            # nav, footer, scroll progress
│   ├── sections/        # hero, capabilities, etc.
│   ├── demos/           # interactive canvas / WebGL / chart demos
│   └── work/            # project-page-specific components
├── data/
│   └── projects.ts      # single source of truth for the work list
└── lib/
    └── utils.ts         # cn() helper
```
