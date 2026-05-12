"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

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
      className="relative flex flex-col justify-end px-5 md:px-10 pt-32 pb-20 md:pt-40 md:pb-28 min-h-[88svh] md:min-h-[100svh]"
    >
      <div className="pointer-events-none absolute right-5 top-32 hidden flex-col items-end gap-3 md:right-10 md:top-40 md:flex">
        <span className="f-mono text-[0.55rem] text-orange/80">
          / 2026 — PORTFOLIO v04
        </span>
        <span className="f-mono text-[0.55rem] text-white/30">
          BEIRUT · 33.8938°N
        </span>
      </div>

      <div className="w-full max-w-[100rem]">
        <motion.div
          custom={0}
          initial="hidden"
          animate="show"
          variants={lineUp}
          className="f-mono mb-8 flex items-center gap-4 text-[0.65rem] text-orange"
        >
          <span className="inline-block h-px w-10 bg-orange" />
          BASED IN BEIRUT · BORN IN RIYADH
        </motion.div>

        <motion.h1
          id="hero-heading"
          custom={1}
          initial="hidden"
          animate="show"
          variants={lineUp}
          className="f-display text-[clamp(4rem,13.5vw,15rem)]"
        >
          FRONTEND
          <br />
          DEVELOPER.
        </motion.h1>

        <div className="mt-8 flex flex-wrap items-end justify-between gap-x-10 gap-y-8 md:mt-12">
          <motion.h2
            custom={2}
            initial="hidden"
            animate="show"
            variants={lineUp}
            className="f-display outline-text text-[clamp(4rem,13.5vw,15rem)]"
          >
            CREATIVE TECH.
          </motion.h2>

          <motion.p
            custom={3}
            initial="hidden"
            animate="show"
            variants={lineUp}
            className="f-mono max-w-[22rem] pb-2 text-[0.7rem] leading-[2.2] text-white/40"
          >
            SELF-TAUGHT ACROSS EVERY DISCIPLINE.
            <br />
            FOUR YEARS OF PROFESSIONAL WORK.
            <br />
            NO DEGREE. ONLY THE WORK.
          </motion.p>
        </div>

        <motion.div
          custom={4}
          initial="hidden"
          animate="show"
          variants={lineUp}
          className="mt-14 flex flex-wrap items-center gap-5 md:mt-20"
        >
          <Link
            href="/work"
            className="group f-mono inline-flex items-center gap-3 bg-orange px-7 py-4 text-[0.7rem] font-bold uppercase tracking-[0.15em] text-background transition-all hover:scale-[1.04] hover:shadow-[0_0_40px_rgba(255,69,0,0.45)] focus-visible:scale-[1.04] active:scale-[1.04]"
          >
            See the work
            <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-1" />
          </Link>
          <Link
            href="mailto:ahmadchabayta@proton.me"
            className="f-mono inline-flex items-center gap-2 border border-white/15 px-7 py-4 text-[0.7rem] font-bold uppercase tracking-[0.15em] transition-colors hover:border-orange hover:text-orange focus-visible:border-orange focus-visible:text-orange active:border-orange active:text-orange"
          >
            Hire me
          </Link>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.8, duration: 1.2 }}
        className="pointer-events-none absolute bottom-6 left-1/2 hidden -translate-x-1/2 flex-col items-center gap-2 md:flex"
      >
        <span className="f-mono text-[0.55rem] tracking-[0.3em] text-white/40">
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
