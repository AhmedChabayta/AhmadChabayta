"use client";

import {
  motion,
  useMotionTemplate,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
  type MotionStyle,
} from "framer-motion";
import { useRef, type ReactNode } from "react";

/**
 * Soft, harmonious entrance — fade + rise + de-blur. One easing across the
 * whole site so every section "breathes" in the same language.
 */
export function Reveal({
  children,
  className,
  delay = 0,
  y = 26,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
  y?: number;
}) {
  const reduced = useReducedMotion();

  if (reduced) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y, filter: "blur(10px)" }}
      whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      viewport={{ once: true, margin: "-12% 0px -12% 0px" }}
      transition={{
        duration: 1.05,
        delay,
        ease: [0.22, 1, 0.36, 1],
      }}
    >
      {children}
    </motion.div>
  );
}

/**
 * Scroll parallax. `speed` > 0 drifts slower than scroll (depth back),
 * < 0 moves against scroll (depth front). Honors reduced motion.
 */
export function Parallax({
  children,
  className,
  speed = 0.2,
}: {
  children: ReactNode;
  className?: string;
  speed?: number;
}) {
  const reduced = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  const raw = useTransform(
    scrollYProgress,
    [0, 1],
    [`${speed * 90}px`, `${speed * -90}px`],
  );
  const y = useSpring(raw, { stiffness: 90, damping: 28, mass: 0.5 });

  return (
    <div ref={ref} className={className}>
      <motion.div style={reduced ? undefined : { y }}>{children}</motion.div>
    </div>
  );
}

/**
 * Premium pointer tilt — restrained 3D, spring-damped. Disabled for
 * reduced motion and on coarse pointers (touch) to avoid cheap jank.
 */
export function Tilt({
  children,
  className,
  max = 7,
}: {
  children: ReactNode;
  className?: string;
  max?: number;
}) {
  const reduced = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const rx = useSpring(0, { stiffness: 220, damping: 18, mass: 0.4 });
  const ry = useSpring(0, { stiffness: 220, damping: 18, mass: 0.4 });
  const glowX = useSpring(50, { stiffness: 180, damping: 22 });
  const glowY = useSpring(50, { stiffness: 180, damping: 22 });

  const onMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (reduced || e.pointerType === "touch" || !ref.current) return;
    const r = ref.current.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width;
    const py = (e.clientY - r.top) / r.height;
    ry.set((px - 0.5) * 2 * max);
    rx.set((0.5 - py) * 2 * max);
    glowX.set(px * 100);
    glowY.set(py * 100);
  };
  const reset = () => {
    rx.set(0);
    ry.set(0);
    glowX.set(50);
    glowY.set(50);
  };

  const glow = useMotionTemplate`radial-gradient(420px circle at ${glowX}% ${glowY}%, rgb(var(--orange) / 0.10), transparent 60%)`;

  const style: MotionStyle = reduced
    ? {}
    : {
        rotateX: rx,
        rotateY: ry,
        transformStyle: "preserve-3d",
        transformPerspective: 900,
      };

  return (
    <motion.div
      ref={ref}
      onPointerMove={onMove}
      onPointerLeave={reset}
      style={style}
      className={className}
    >
      {children}
      {!reduced && (
        <motion.span
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 [.group:hover_&]:opacity-100"
          style={{ background: glow }}
        />
      )}
    </motion.div>
  );
}
