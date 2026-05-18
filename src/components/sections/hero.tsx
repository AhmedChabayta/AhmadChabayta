"use client";

import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { OrbitalMark } from "@/components/site/orbital-mark";
import { Button, Text, Title } from "@/components/ui";

const lineUp = {
  hidden: { opacity: 0, y: 48 },
  show: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.9, delay: 0.15 * i, ease: [0.22, 1, 0.36, 1] },
  }),
};

export function Hero() {
  return (
    <section
      id="hero"
      aria-labelledby="hero-heading"
      className="relative flex min-h-[92svh] flex-col justify-end px-6 pt-40 pb-28 md:min-h-[100svh] md:px-10 md:pt-52 md:pb-36"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.8, rotate: -10 }}
        animate={{ opacity: 1, scale: 1, rotate: 0 }}
        transition={{ duration: 1.4, delay: 0.4, ease: [0.22, 1, 0.36, 1] }}
        className="pointer-events-none absolute top-28 right-5 hidden md:top-32 md:right-10 md:block lg:right-16"
      >
        <OrbitalMark size={180} />
      </motion.div>

      <div className="w-full max-w-[100rem]">
        <motion.div
          custom={0}
          initial="hidden"
          animate="show"
          variants={lineUp}
          className="f-mono mb-10 flex items-center gap-4 text-[0.65rem] text-orange md:mb-14"
        >
          <span className="inline-block h-px w-10 bg-orange" />
          BASED IN BEIRUT — AVAILABLE WORLDWIDE
        </motion.div>

        <motion.div custom={1} initial="hidden" animate="show" variants={lineUp}>
          <Title as="h1" id="hero-heading" size="hero">
            FRONTEND
            <br />
            DEVELOPER.
          </Title>
        </motion.div>

        <div className="mt-12 flex flex-wrap items-end justify-between gap-x-12 gap-y-10 md:mt-20">
          <motion.div
            data-line="hero"
            custom={2}
            initial="hidden"
            animate="show"
            variants={lineUp}
          >
            <Title size="hero" outline>
              CREATIVE TECH.
            </Title>
          </motion.div>

          <motion.div
            custom={3}
            initial="hidden"
            animate="show"
            variants={lineUp}
          >
            <Text variant="mono" className="max-w-[22rem] pb-2">
              Design and engineering as one craft.
              <br />
              Interfaces that feel as good as they work.
              <br />
              Self-taught — the work speaks.
            </Text>
          </motion.div>
        </div>

        <motion.div
          custom={4}
          initial="hidden"
          animate="show"
          variants={lineUp}
          className="mt-16 flex flex-wrap items-center gap-5 md:mt-28 md:gap-6"
        >
          <Button href="/#work" variant="primary" size="lg">
            See the work
            <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-1" />
          </Button>
          <Button
            href="mailto:ahmadchabayta@proton.me"
            variant="outline"
            size="lg"
          >
            Hire me
          </Button>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.8, duration: 1.2 }}
        className="pointer-events-none absolute bottom-6 left-1/2 hidden -translate-x-1/2 flex-col items-center gap-2 md:flex"
      >
        <span className="f-mono text-[0.55rem] tracking-[0.3em] text-foreground/40">
          SCROLL
        </span>
        <span className="block h-10 w-px origin-top animate-[scroll-cue_2.4s_ease-in-out_infinite] bg-orange/60" />
      </motion.div>

      <style jsx>{`
        @keyframes scroll-cue {
          0% {
            transform: scaleY(0);
            transform-origin: top;
          }
          45% {
            transform: scaleY(1);
            transform-origin: top;
          }
          55% {
            transform: scaleY(1);
            transform-origin: bottom;
          }
          100% {
            transform: scaleY(0);
            transform-origin: bottom;
          }
        }
      `}</style>
    </section>
  );
}
