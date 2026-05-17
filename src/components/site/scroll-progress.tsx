"use client";

import { motion, useScroll, useSpring } from "framer-motion";

export function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  const progress = useSpring(scrollYProgress, {
    stiffness: 120,
    damping: 30,
    mass: 0.4,
  });

  return (
    <motion.div
      style={{
        scaleX: progress,
        boxShadow:
          "0 0 14px 3px rgb(var(--orange) / 0.4), 0 0 4px 1px rgb(var(--orange) / 0.55)",
      }}
      className="fixed top-0 right-0 left-0 z-[60] h-[3px] origin-left bg-gradient-to-r from-orange/10 via-orange/45 to-orange/65 opacity-70 blur-[1.5px]"
      aria-hidden
    />
  );
}
