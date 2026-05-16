"use client";

import { motion } from "framer-motion";
import { ParticleField } from "@/components/demos/particle-field";
import { WaveSynth } from "@/components/demos/wave-synth";
import { BreakoutMicro } from "@/components/demos/breakout-micro";
import {
  Button,
  Card,
  Container,
  Eyebrow,
  Section,
  SectionHeader,
  Text,
  Title,
} from "@/components/ui";

const CARDS = [
  {
    eyebrow: "CANVAS PHYSICS",
    title: "Particle Gravity",
    body: "120 bodies orbiting your cursor via inverse-square attraction. Tap to detonate an outward burst.",
    Demo: ParticleField,
    href: "/work/particle-gravity",
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
    href: "/work/breakout",
  },
];

export function ExperimentsSection() {
  return (
    <Section id="experiments" aria-labelledby="experiments-heading">
      <Container>
        <SectionHeader
          titleId="experiments-heading"
          eyebrow="/ 04 — LIVE / INTERACTIVE"
          title="EXPERIMENTS."
          aside={
            <Text variant="mono" className="max-w-[28ch]">
              DRAG. TAP. PLAY.
              <br />
              EVERY DEMO RUNS LIVE IN YOUR BROWSER.
            </Text>
          }
        />
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-3">
          {CARDS.map(({ eyebrow, title, body, Demo, href }, i) => (
            <motion.div
              key={title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.6, delay: i * 0.08 }}
            >
              <Card interactive className="flex h-full flex-col gap-6">
                <Demo className="aspect-[16/11] w-full" />
                <Eyebrow>{eyebrow}</Eyebrow>
                <Title as="h3" size="card">
                  {title}
                </Title>
                <Text variant="body">{body}</Text>
                <Button
                  href={href}
                  variant="link"
                  className="mt-auto self-start"
                >
                  OPEN
                  <span aria-hidden>→</span>
                </Button>
              </Card>
            </motion.div>
          ))}
        </div>
      </Container>
    </Section>
  );
}
