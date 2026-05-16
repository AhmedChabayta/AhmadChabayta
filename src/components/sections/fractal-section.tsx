"use client";

import dynamic from "next/dynamic";
import { motion } from "framer-motion";
import { Container, Eyebrow, Section, Text, Title } from "@/components/ui";
import { Parallax } from "@/components/motion/reveal";

const Mandelbulb = dynamic(
  () => import("@/components/demos/mandelbulb").then((m) => m.Mandelbulb),
  { ssr: false, loading: () => <div className="absolute inset-0" /> },
);

export function FractalSection() {
  return (
    <Section
      id="visuals"
      aria-labelledby="visuals-heading"
      className="relative overflow-hidden"
    >
      <Container className="grid items-center gap-12 md:gap-20 lg:grid-cols-2">
        <Parallax speed={0.18}>
          <div className="flex flex-col gap-9">
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
          </div>
        </Parallax>

        <Parallax speed={-0.16}>
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
            className="relative aspect-[4/5] w-full md:aspect-square"
          >
            {/* the render bleeds into the warm atmosphere instead of
                sitting in a hard black rounded box */}
            <div
              className="absolute inset-0 [mask-image:radial-gradient(115%_115%_at_50%_45%,#000_55%,transparent_100%)]"
              style={{
                WebkitMaskImage:
                  "radial-gradient(115% 115% at 50% 45%, #000 55%, transparent 100%)",
              }}
            >
              <Mandelbulb className="absolute inset-0" />
            </div>
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0"
              style={{
                background:
                  "radial-gradient(60% 60% at 50% 45%, transparent 55%, rgb(var(--orange) / 0.10) 100%)",
              }}
            />
          </motion.div>
        </Parallax>
      </Container>
    </Section>
  );
}
