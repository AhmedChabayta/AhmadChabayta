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
      className="border-t border-border px-6 py-40 md:px-10 md:py-56"
    >
      <div className="mx-auto max-w-7xl">
        <div className="mb-24 flex flex-col gap-10 md:mb-36 md:flex-row md:items-end md:justify-between">
          <div className="flex flex-col gap-5">
            <span className="f-mono text-[0.6rem] text-orange">/ 02 — DISCIPLINES</span>
            <h2
              id="cap-heading"
              className="f-anton text-[clamp(3rem,8vw,7rem)]"
            >
              CAPABILITIES.
            </h2>
          </div>
          <p className="f-mono max-w-[28ch] text-[0.65rem] leading-[2] text-muted-foreground">
            SIX OVERLAPPING DOMAINS.
            <br />
            ONE PERSON. ONE STACK.
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
              className="group flex flex-col gap-7 bg-background p-12 transition-colors hover:bg-card md:p-16"
            >
              <div className="flex items-center justify-between gap-4">
                <Icon className="size-7 text-orange" strokeWidth={1.25} />
                <span className="f-mono text-[0.55rem] text-muted-foreground/60">
                  {String(i + 1).padStart(2, "0")}
                </span>
              </div>
              <h3 className="f-anton text-3xl leading-[1.05]">{title}</h3>
              <p className="text-[0.95rem] leading-[1.75] text-muted-foreground">
                {body}
              </p>
              <div className="mt-auto flex flex-wrap gap-2 pt-6">
                {stack.map((s) => (
                  <span
                    key={s}
                    className="f-mono border border-border px-2.5 py-1.5 text-[0.55rem] text-muted-foreground transition-colors group-hover:border-orange/40 group-hover:text-orange"
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
