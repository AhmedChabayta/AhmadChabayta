"use client";

import { motion } from "framer-motion";
import { Code2, Layers, Database, Palette, Sparkles, Terminal } from "lucide-react";
import {
  Badge,
  Container,
  Section,
  SectionHeader,
  Text,
  Title,
} from "@/components/ui";

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
    <Section id="capabilities" aria-labelledby="cap-heading">
      <Container>
        <SectionHeader
          titleId="cap-heading"
          eyebrow="/ 03 — DISCIPLINES"
          title="CAPABILITIES."
          aside={
            <Text variant="mono" className="max-w-[28ch]">
              SIX OVERLAPPING DOMAINS.
              <br />
              ONE PERSON. ONE STACK.
            </Text>
          }
        />
        <div className="grid gap-px bg-border md:grid-cols-2 lg:grid-cols-3">
          {CAPABILITIES.map(({ icon: Icon, title, body, stack }, i) => (
            <motion.article
              key={title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.6, delay: i * 0.05 }}
              className="group flex flex-col gap-7 border border-border/30 bg-card/5 p-12 backdrop-blur-md transition-colors hover:border-orange/30 hover:bg-card/15 md:p-16"
            >
              <div className="flex items-center justify-between gap-4">
                <Icon className="size-7 text-orange" strokeWidth={1.25} />
                <span className="f-mono text-[0.55rem] text-muted-foreground/60">
                  {String(i + 1).padStart(2, "0")}
                </span>
              </div>
              <Title as="h3" size="card">
                {title}
              </Title>
              <Text variant="body">{body}</Text>
              <div className="mt-auto flex flex-wrap gap-2 pt-6">
                {stack.map((s) => (
                  <Badge
                    key={s}
                    className="group-hover:border-orange/40 group-hover:text-orange"
                  >
                    {s}
                  </Badge>
                ))}
              </div>
            </motion.article>
          ))}
        </div>
      </Container>
    </Section>
  );
}
