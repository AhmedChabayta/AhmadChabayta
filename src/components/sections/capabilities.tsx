"use client";

import { motion } from "framer-motion";
import { Code2, Layers, Database, Palette, Sparkles, Terminal } from "lucide-react";

const CAPABILITIES = [
  {
    icon: Code2,
    title: "Frontend Engineering",
    body: "React, Next.js, TypeScript. Component systems, routing, server components, edge runtime.",
    stack: ["React 19", "Next.js", "TypeScript", "TanStack"],
  },
  {
    icon: Sparkles,
    title: "Creative Coding",
    body: "WebGL, GLSL shaders, raymarching, generative systems, canvas + audio.",
    stack: ["Three.js", "GLSL", "Web Audio", "Canvas2D"],
  },
  {
    icon: Database,
    title: "Data & Backend",
    body: "Postgres, REST, pipelines, scraping, ETL, dashboards.",
    stack: ["Postgres", "Python", "Supabase", "Node"],
  },
  {
    icon: Palette,
    title: "Design Systems",
    body: "Token systems, component libraries, accessibility, motion language.",
    stack: ["Figma", "shadcn/ui", "Tailwind", "Radix"],
  },
  {
    icon: Layers,
    title: "Motion & Animation",
    body: "GSAP, framer-motion, scroll-driven sequences, page transitions.",
    stack: ["framer-motion", "GSAP", "WAAPI", "Lottie"],
  },
  {
    icon: Terminal,
    title: "DX & Tooling",
    body: "CI, linters, type-safe code-gen, deployment automation.",
    stack: ["Vercel", "GitHub Actions", "ESLint", "Vitest"],
  },
];

export function CapabilitiesSection() {
  return (
    <section
      id="capabilities"
      aria-labelledby="cap-heading"
      className="border-t border-border px-5 py-24 md:px-10 md:py-32"
    >
      <div className="mx-auto max-w-7xl">
        <div className="mb-12 flex items-end justify-between gap-6">
          <h2
            id="cap-heading"
            className="f-anton text-[clamp(2.5rem,7vw,6rem)]"
          >
            CAPABILITIES.
          </h2>
          <p className="f-mono hidden text-[0.65rem] text-muted-foreground md:block">
            / WHAT I DO
          </p>
        </div>
        <div className="grid gap-px bg-border md:grid-cols-2 lg:grid-cols-3">
          {CAPABILITIES.map(({ icon: Icon, title, body, stack }, i) => (
            <motion.article
              key={title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.6, delay: i * 0.05 }}
              className="group flex flex-col gap-4 bg-background p-8 transition-colors hover:bg-card"
            >
              <Icon className="size-6 text-orange" strokeWidth={1.5} />
              <h3 className="f-anton text-2xl leading-tight">{title}</h3>
              <p className="text-sm leading-relaxed text-muted-foreground">{body}</p>
              <div className="mt-auto flex flex-wrap gap-1.5 pt-4">
                {stack.map((s) => (
                  <span
                    key={s}
                    className="f-mono border border-border px-2 py-1 text-[0.55rem] text-muted-foreground transition-colors group-hover:border-orange/30 group-hover:text-orange"
                  >
                    {s}
                  </span>
                ))}
              </div>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}
