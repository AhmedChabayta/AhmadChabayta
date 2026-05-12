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
      className="border-t border-border px-5 py-32 md:px-10 md:py-44"
    >
      <div className="mx-auto max-w-7xl">
        <div className="mb-20 flex flex-col gap-8 md:mb-28 md:flex-row md:items-end md:justify-between">
          <div className="flex flex-col gap-4">
            <span className="f-mono text-[0.6rem] text-orange">/ 04 — LIVE / INTERACTIVE</span>
            <h2
              id="experiments-heading"
              className="f-anton text-[clamp(3rem,8vw,7rem)]"
            >
              EXPERIMENTS.
            </h2>
          </div>
          <p className="f-mono max-w-[28ch] text-[0.65rem] leading-[2] text-muted-foreground">
            DRAG. TAP. PLAY.
            <br />
            EVERY DEMO RUNS LIVE IN YOUR BROWSER.
          </p>
        </div>
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {CARDS.map(({ eyebrow, title, body, Demo, href }, i) => (
            <motion.article
              key={title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.6, delay: i * 0.08 }}
              className="group flex flex-col gap-5 border border-border bg-card p-7 transition-colors hover:border-orange/30"
            >
              <Demo className="aspect-[16/11] w-full" />
              <p className="f-mono text-[0.6rem] tracking-[0.25em] text-orange">
                {eyebrow}
              </p>
              <h3 className="f-anton text-3xl leading-[1.05]">{title}</h3>
              <p className="text-[0.9rem] leading-[1.75] text-muted-foreground">
                {body}
              </p>
              <Link
                href={href}
                className="f-mono mt-auto inline-flex items-center gap-2 self-start text-[0.6rem] tracking-[0.25em] text-orange transition-all hover:gap-3 focus-visible:gap-3 active:gap-3"
              >
                OPEN
                <span aria-hidden>→</span>
              </Link>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}
