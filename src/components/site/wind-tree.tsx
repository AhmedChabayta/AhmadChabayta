"use client";

import {
  motion,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
  type MotionValue,
} from "framer-motion";

/**
 * A full, leafy tree in the site's own foreground (bone) colour. It is
 * ROOTED to the ground — it grows as you scroll (branches draw on, leaves
 * sprout) but it never translates up the page. It sways in the wind.
 *
 * The canopy is a few hundred leaves generated from a *seeded* RNG so the
 * server and client render byte-identical (no hydration drift).
 */

type Branch = { d: string; w: number; from: number };
type Leaf = { x: number; y: number; r: number; s: number; o: number };
type Cluster = { cx: number; cy: number; from: number; leaves: Leaf[] };

const BRANCHES: Branch[] = [
  { d: "M232 632 C 226 560 220 496 226 436 C 230 396 228 360 236 312", w: 15, from: 0 },
  { d: "M228 470 C 188 452 158 430 126 388 C 108 366 99 346 95 318", w: 9, from: 0.05 },
  { d: "M231 440 C 270 426 304 408 334 366 C 350 346 358 328 363 302", w: 9, from: 0.08 },
  { d: "M227 404 C 205 382 188 360 178 324 C 171 300 169 282 168 258", w: 6, from: 0.13 },
  { d: "M235 384 C 266 364 290 342 305 306 C 316 282 320 264 322 238", w: 6, from: 0.16 },
  { d: "M236 320 C 219 300 208 280 203 250 C 199 228 200 212 203 192", w: 4, from: 0.22 },
  { d: "M238 314 C 262 296 278 276 287 246 C 294 224 296 208 296 186", w: 4, from: 0.25 },
  { d: "M237 312 C 233 284 233 260 238 232 C 243 208 247 190 249 166", w: 4, from: 0.28 },
];

// Crown silhouette — nodes the foliage gathers around.
const NODES: { x: number; y: number; r: number }[] = [
  { x: 232, y: 300, r: 74 },
  { x: 150, y: 332, r: 62 },
  { x: 322, y: 320, r: 64 },
  { x: 108, y: 272, r: 52 },
  { x: 362, y: 260, r: 54 },
  { x: 200, y: 228, r: 58 },
  { x: 282, y: 223, r: 56 },
  { x: 168, y: 178, r: 48 },
  { x: 302, y: 172, r: 48 },
  { x: 236, y: 148, r: 46 },
  { x: 92, y: 332, r: 42 },
  { x: 382, y: 322, r: 42 },
  { x: 140, y: 402, r: 50 },
  { x: 330, y: 394, r: 50 },
  { x: 236, y: 382, r: 64 },
  { x: 236, y: 112, r: 36 },
];

const LEAVES_PER_NODE = 26;

const LEAF_PATH =
  "M0 -13 C 7 -10 9 -3 6 6 C 4 10 0 14 0 14 C 0 14 -4 10 -6 6 C -9 -3 -7 -10 0 -13 Z";

// deterministic PRNG (mulberry32) — stable across SSR/CSR.
function mulberry32(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const CLUSTERS: Cluster[] = (() => {
  const rnd = mulberry32(20260516);
  const ys = NODES.map((n) => n.y);
  const yMin = Math.min(...ys);
  const yMax = Math.max(...ys);
  return NODES.map((n) => {
    const leaves: Leaf[] = [];
    for (let i = 0; i < LEAVES_PER_NODE; i++) {
      // gaussian-ish offset (sum of uniforms) for a natural clump
      const gx = (rnd() + rnd() + rnd() - 1.5) / 1.5;
      const gy = (rnd() + rnd() + rnd() - 1.5) / 1.5;
      leaves.push({
        x: gx * n.r,
        y: gy * n.r * 0.86,
        r: rnd() * 360,
        s: 0.48 + rnd() * 0.62,
        o: 0.32 + rnd() * 0.42,
      });
    }
    // lower foliage fills in earlier as you scroll, crown last
    const from = 0.6 - ((n.y - yMin) / (yMax - yMin)) * 0.3;
    return { cx: n.x, cy: n.y, from, leaves };
  });
})();

function GrowBranch({
  branch,
  progress,
  reduced,
}: {
  branch: Branch;
  progress: MotionValue<number>;
  reduced: boolean | null;
}) {
  const raw = useTransform(
    progress,
    [branch.from, Math.min(1, branch.from + 0.36)],
    [0, 1],
  );
  const pathLength = useSpring(raw, { stiffness: 70, damping: 26, mass: 0.4 });
  return (
    <motion.path
      d={branch.d}
      fill="none"
      stroke="rgb(var(--foreground))"
      strokeOpacity={0.55}
      strokeWidth={branch.w}
      strokeLinecap="round"
      style={{ pathLength: reduced ? 1 : pathLength }}
    />
  );
}

function LeafCluster({
  cluster,
  index,
  progress,
  reduced,
}: {
  cluster: Cluster;
  index: number;
  progress: MotionValue<number>;
  reduced: boolean | null;
}) {
  const reveal = useTransform(
    progress,
    [cluster.from, Math.min(1, cluster.from + 0.28)],
    [0, 1],
  );
  const opacity = useSpring(reveal, { stiffness: 60, damping: 24 });
  const scale = useTransform(opacity, [0, 1], [0.55, 1]);

  return (
    <g transform={`translate(${cluster.cx} ${cluster.cy})`}>
      <motion.g
        style={{
          opacity: reduced ? 1 : opacity,
          scale: reduced ? 1 : scale,
        }}
      >
        <g
          className={reduced ? undefined : "wt-cluster"}
          style={{
            transformBox: "fill-box",
            transformOrigin: "center bottom",
            animationDelay: `${(index % 6) * -0.9 - index * 0.13}s`,
            animationDuration: `${4 + (index % 5) * 0.5}s`,
          }}
        >
          {cluster.leaves.map((lf, i) => (
            <path
              key={i}
              d={LEAF_PATH}
              fill="rgb(var(--foreground))"
              fillOpacity={lf.o}
              transform={`translate(${lf.x} ${lf.y}) rotate(${lf.r}) scale(${lf.s})`}
            />
          ))}
        </g>
      </motion.g>
    </g>
  );
}

export function WindTree({ className }: { className?: string }) {
  const reduced = useReducedMotion();
  const { scrollYProgress } = useScroll();

  return (
    <div className={className}>
      <style>{`
        @keyframes wt-canopy {
          0%,100% { transform: rotate(-1deg); }
          50%     { transform: rotate(1.2deg); }
        }
        @keyframes wt-cluster {
          0%,100% { transform: rotate(-2.6deg) translateX(-1px); }
          50%     { transform: rotate(3deg) translateX(1px); }
        }
        .wt-canopy  { animation: wt-canopy 8s ease-in-out infinite; }
        .wt-cluster { animation: wt-cluster 4.4s ease-in-out infinite; }
        @media (prefers-reduced-motion: reduce) {
          .wt-canopy,.wt-cluster { animation: none; }
        }
      `}</style>
      <svg
        viewBox="0 0 460 640"
        className="h-full w-full"
        preserveAspectRatio="xMidYMax meet"
        aria-hidden
      >
        <g
          className={reduced ? undefined : "wt-canopy"}
          style={{
            transformBox: "fill-box",
            transformOrigin: "center bottom",
          }}
        >
          {BRANCHES.map((b, i) => (
            <GrowBranch
              key={i}
              branch={b}
              progress={scrollYProgress}
              reduced={reduced}
            />
          ))}
          {CLUSTERS.map((c, i) => (
            <LeafCluster
              key={i}
              cluster={c}
              index={i}
              progress={scrollYProgress}
              reduced={reduced}
            />
          ))}
        </g>
      </svg>
    </div>
  );
}
