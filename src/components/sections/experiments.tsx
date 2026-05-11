"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ParticleField } from "@/components/demos/particle-field";
import { WaveSynth } from "@/components/demos/wave-synth";
import { BreakoutMicro } from "@/components/demos/breakout-micro";

const CARDS = [
  {
    eyebrow: "CANVAS PHYSICS",
    title: "Particle Gravity",
    body: "120 bodies orbiting your cursor via inverse-square attraction. Tap to detonate an outward burst.",
    Demo: ParticleField,
    href: "/visuals",
  },
  {
    eyebrow: "GENERATIVE VISUAL",
    title: "Wave Synth",
    body: "Three interfering waves shaped by drag. X controls frequency, Y controls amplitude.",
    Demo: WaveSynth,
    href: "/work/wave-synth",
  },
  {
    eyebrow: "MICRO GAME",
    title: "Breakout, 80 lines.",
    body: "A complete breakout game written in vanilla canvas. Drag to play.",
    Demo: BreakoutMicro,
    href: "/visuals",
  },
];

export function ExperimentsSection() {
  return (
    <section
      id="experiments"
      aria-labelledby="experiments-heading"
      className="border-t border-border px-5 py-24 md:px-10 md:py-32"
    >
      <div className="mx-auto max-w-7xl">
        <div className="mb-12 flex items-end justify-between gap-6">
          <h2
            id="experiments-heading"
            className="f-anton text-[clamp(2.5rem,7vw,6rem)]"
          >
            EXPERIMENTS.
          </h2>
          <p className="f-mono hidden text-[0.65rem] text-muted-foreground md:block">
            / LIVE / INTERACTIVE
          </p>
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {CARDS.map(({ eyebrow, title, body, Demo, href }, i) => (
            <motion.article
              key={title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.6, delay: i * 0.08 }}
              className="flex flex-col gap-4 border border-border bg-card p-5"
            >
              <Demo className="aspect-[16/11] w-full" />
              <p className="f-mono text-[0.6rem] tracking-[0.2em] text-orange">
                {eyebrow}
              </p>
              <h3 className="f-anton text-2xl">{title}</h3>
              <p className="text-sm leading-relaxed text-muted-foreground">{body}</p>
              <Link
                href={href}
                className="f-mono mt-auto inline-flex items-center gap-2 self-start text-[0.6rem] tracking-[0.2em] text-orange transition-opacity hover:opacity-70 focus-visible:opacity-70 active:opacity-70"
              >
                OPEN →
              </Link>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}
