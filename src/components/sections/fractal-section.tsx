"use client";

import dynamic from "next/dynamic";
import { motion } from "framer-motion";
import { Container, Eyebrow, Section, Text, Title } from "@/components/ui";

const Mandelbulb = dynamic(
  () => import("@/components/demos/mandelbulb").then((m) => m.Mandelbulb),
  { ssr: false, loading: () => <div className="absolute inset-0 bg-black" /> },
);

export function FractalSection() {
  return (
    <Section
      id="visuals"
      aria-labelledby="visuals-heading"
      className="relative bg-[radial-gradient(circle_at_50%_45%,rgba(255,69,0,0.10),#000_62%)]"
    >
      <Container className="grid items-center gap-14 md:gap-20 lg:grid-cols-2">
        <motion.div
          initial={{ opacity: 0, y: 28 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.8 }}
          className="flex flex-col gap-9"
        >
          <Eyebrow>/ GLSL · RAYMARCHING · WEBGL · 4-PHASE</Eyebrow>
          <Title id="visuals-heading" size="feature">
            COMPUTED
            <br />
            IN THE BROWSER.
          </Title>
          <Text variant="mono" className="max-w-[42ch] leading-[2.4]">
            Rendered live by your GPU. Every pixel solved by raymarching a
            distance field — no meshes, no textures, just math.
          </Text>
          <Eyebrow className="text-orange/70">/ 60FPS · WEBGL2</Eyebrow>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.94 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
          className="relative aspect-square w-full overflow-hidden rounded-lg border border-border bg-black shadow-[0_0_80px_-20px_rgba(255,69,0,0.45)] md:aspect-[4/5] lg:aspect-square"
        >
          <Mandelbulb className="absolute inset-0" />
        </motion.div>
      </Container>
    </Section>
  );
}
