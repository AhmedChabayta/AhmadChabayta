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
        <div className="pointer-events-none relative z-10 flex h-full flex-col justify-between px-5 py-24 md:px-10 md:py-32">
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
              className="f-anton mt-4 max-w-[28ch] text-[clamp(3rem,7.5vw,8rem)] leading-[0.85]"
            >
              COMPUTED
              <br />
              IN THE BROWSER.
            </motion.h2>
          </div>
        </div>
      </div>
    </section>
  );
}
