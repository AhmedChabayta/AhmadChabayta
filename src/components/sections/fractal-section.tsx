"use client";

import dynamic from "next/dynamic";
import { motion } from "framer-motion";

const Mandelbulb = dynamic(
  () => import("@/components/demos/mandelbulb").then((m) => m.Mandelbulb),
  { ssr: false, loading: () => <div className="absolute inset-0 bg-black" /> },
);

export function FractalSection() {
  return (
    <section
      id="visuals"
      aria-labelledby="visuals-heading"
      className="relative border-t border-border bg-[radial-gradient(circle_at_50%_45%,rgba(255,69,0,0.10),#000_62%)] px-6 py-40 md:px-10 md:py-56"
    >
      <div className="mx-auto grid max-w-7xl items-center gap-14 md:gap-20 lg:grid-cols-2">
        <motion.div
          initial={{ opacity: 0, y: 28 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.8 }}
          className="flex flex-col gap-9"
        >
          <p className="f-mono text-[0.65rem] text-orange">
            / GLSL · RAYMARCHING · WEBGL · 4-PHASE
          </p>
          <h2
            id="visuals-heading"
            className="f-display text-[clamp(2.75rem,6.5vw,6.5rem)]"
          >
            COMPUTED
            <br />
            IN THE BROWSER.
          </h2>
          <p className="f-mono max-w-[42ch] text-[0.65rem] leading-[2.4] text-white/45">
            Rendered live by your GPU. Every pixel solved by raymarching a
            distance field — no meshes, no textures, just math.
          </p>
          <span className="f-mono text-[0.55rem] tracking-[0.25em] text-orange/70">
            / 60FPS · WEBGL2
          </span>
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
      </div>
    </section>
  );
}
