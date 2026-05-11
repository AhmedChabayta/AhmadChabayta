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
      className="relative flex flex-col justify-end md:justify-end px-5 md:px-10 pt-16 pb-12 md:pb-20 min-h-[80svh] md:min-h-[100svh]"
    >
      <div className="w-full max-w-[100rem]">
        <motion.div
          custom={0}
          initial="hidden"
          animate="show"
          variants={lineUp}
          className="f-mono mb-6 flex items-center gap-4 text-[0.65rem] text-orange"
        >
          <span className="inline-block h-px w-8 bg-orange" />
          BASED IN BEIRUT · BORN IN RIYADH
        </motion.div>

        <motion.h1
          id="hero-heading"
          custom={1}
          initial="hidden"
          animate="show"
          variants={lineUp}
          className="f-anton text-[clamp(3.5rem,14vw,14rem)] leading-[0.85]"
        >
          FRONTEND
          <br />
          DEVELOPER.
        </motion.h1>

        <div className="mt-2 flex flex-wrap items-end justify-between gap-6">
          <motion.h2
            custom={2}
            initial="hidden"
            animate="show"
            variants={lineUp}
            className="f-anton outline-text text-[clamp(3.5rem,14vw,14rem)] leading-[0.85]"
          >
            CREATIVE TECH.
          </motion.h2>

          <motion.p
            custom={3}
            initial="hidden"
            animate="show"
            variants={lineUp}
            className="f-mono max-w-[20rem] pb-1 text-[0.7rem] leading-[2] text-white/35"
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
          className="mt-10 flex flex-wrap items-center gap-5"
        >
          <Link
            href="/work"
            className="group f-mono inline-flex items-center gap-3 bg-orange px-6 py-3 text-[0.7rem] font-bold uppercase tracking-[0.1em] text-background transition-all hover:scale-[1.04] hover:shadow-[0_0_30px_rgba(255,69,0,0.4)] focus-visible:scale-[1.04] active:scale-[1.04]"
          >
            See the work
            <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-1" />
          </Link>
          <Link
            href="mailto:ahmadchabayta@proton.me"
            className="f-mono inline-flex items-center gap-2 border border-white/15 px-6 py-3 text-[0.7rem] font-bold uppercase tracking-[0.1em] transition-colors hover:border-orange hover:text-orange focus-visible:border-orange focus-visible:text-orange active:border-orange active:text-orange"
          >
            Hire me
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
