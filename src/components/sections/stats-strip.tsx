"use client";

import { motion, useInView, useMotionValue, animate } from "framer-motion";
import { useEffect, useRef } from "react";

const STATS = [
  { value: 4, suffix: "+", label: "YEARS PROFESSIONAL" },
  { value: 50, suffix: "k+", label: "LINES SHIPPED" },
  { value: 30, suffix: "+", label: "PROJECTS" },
  { value: 2, suffix: "", label: "LANGUAGES" },
];

function Counter({ to, suffix }: { to: number; suffix: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const motionValue = useMotionValue(0);
  const inView = useInView(ref, { once: true, margin: "-50px" });

  useEffect(() => {
    if (!inView) return;
    if (ref.current) ref.current.textContent = "0" + suffix;
    const controls = animate(motionValue, to, {
      duration: 2,
      ease: "easeOut",
      onUpdate: (latest) => {
        if (ref.current) {
          ref.current.textContent = Math.round(latest).toString() + suffix;
        }
      },
    });
    return () => controls.stop();
  }, [inView, motionValue, to, suffix]);

  return (
    <span ref={ref}>
      {to}
      {suffix}
    </span>
  );
}

export function StatsStrip() {
  return (
    <section
      aria-labelledby="stats-heading"
      className="border-t border-border bg-orange text-background"
    >
      <h2 id="stats-heading" className="sr-only">
        Stats
      </h2>
      <div className="mx-auto grid max-w-7xl grid-cols-2 md:grid-cols-4">
        {STATS.map(({ value, suffix, label }, i) => (
          <motion.div
            key={label}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.5, delay: i * 0.05 }}
            className="flex flex-col gap-6 border-b border-r border-background/10 px-10 py-20 last:border-r-0 md:border-b-0 md:px-16 md:py-28"
          >
            <span className="f-mono text-[0.55rem] text-background/60">
              / {String(i + 1).padStart(2, "0")}
            </span>
            <span className="f-display text-[clamp(3.5rem,8vw,7rem)] leading-none">
              <Counter to={value} suffix={suffix} />
            </span>
            <span className="f-mono text-[0.6rem] tracking-[0.25em] text-background/70">
              {label}
            </span>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
