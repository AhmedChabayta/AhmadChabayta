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
      className="relative flex min-h-[100svh] flex-col border-t border-border bg-[radial-gradient(circle_at_52%_40%,rgba(255,69,0,0.12),#000_55%)]"
    >
      <div className="relative flex-1">
        <Mandelbulb className="absolute inset-0" />
        <div className="pointer-events-none relative z-10 flex h-full flex-col justify-between px-5 py-32 md:px-10 md:py-44">
          <div>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7 }}
              className="f-mono text-[0.65rem] text-orange"
            >
              / GLSL · RAYMARCHING · WEBGL · 4-PHASE
            </motion.p>
            <motion.h2
              id="visuals-heading"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.9, delay: 0.1 }}
              className="f-display mt-6 max-w-[28ch] text-[clamp(3rem,8.5vw,9rem)]"
            >
              COMPUTED
              <br />
              IN THE BROWSER.
            </motion.h2>
          </div>
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 1.2, delay: 0.4 }}
            className="mt-12 flex items-end justify-between gap-6 self-stretch"
          >
            <p className="f-mono max-w-[28ch] text-[0.6rem] leading-[2] text-white/40">
              Rendered live by your GPU. Every pixel solved by raymarching a
              distance field — no meshes, no textures, just math.
            </p>
            <span className="f-mono hidden text-[0.55rem] text-orange/70 md:inline">
              / 60FPS · WEBGL2
            </span>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
