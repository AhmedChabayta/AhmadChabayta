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
 * A bluish-green tree that *grows* with scroll — a bare sprig at the top
 * of the page, a full leafed canopy by the time you've read it — and
 * sways in the wind the whole time. Ambient, behind content.
 *
 * Growth = SVG pathLength driven by scroll (branches draw on, base ->
 * tips, staggered) + leaf clusters scaling/fading in after their branch.
 * Wind = layered CSS sway (whole canopy, per-cluster, per-leaf) at
 * different periods/phases so it never looks like one rigid object.
 */

type Branch = { d: string; w: number; from: number };
type Leaf = { x: number; y: number; r: number; s: number; d: number };
type Cluster = { rx: number; ry: number; from: number; leaves: Leaf[] };

const BRANCHES: Branch[] = [
  { d: "M232 632 C 226 560 220 496 226 436 C 230 396 228 360 236 314", w: 14, from: 0 },
  { d: "M228 470 C 188 452 158 430 126 390 C 108 368 99 348 95 322", w: 8, from: 0.06 },
  { d: "M231 440 C 270 426 304 408 334 368 C 350 348 358 330 363 306", w: 8, from: 0.1 },
  { d: "M227 404 C 205 382 188 360 178 326 C 171 302 169 284 168 262", w: 6, from: 0.16 },
  { d: "M235 384 C 266 364 290 342 305 308 C 316 284 320 266 322 242", w: 6, from: 0.2 },
  { d: "M236 320 C 219 300 208 280 203 252 C 199 230 200 214 203 196", w: 4, from: 0.28 },
  { d: "M238 314 C 262 296 278 276 287 248 C 294 226 296 210 296 190", w: 4, from: 0.32 },
  { d: "M237 312 C 233 284 233 260 238 234 C 243 210 247 192 249 170", w: 4, from: 0.36 },
];

const leaf = (x: number, y: number, r: number, s: number, d: number): Leaf => ({
  x,
  y,
  r,
  s,
  d,
});

const CLUSTERS: Cluster[] = [
  {
    rx: 95,
    ry: 318,
    from: 0.34,
    leaves: [
      leaf(0, -2, -38, 1, 0),
      leaf(-16, 10, -64, 0.85, 0.7),
      leaf(14, 8, -8, 0.95, 1.3),
      leaf(-6, -20, -44, 0.8, 2),
      leaf(20, -8, -18, 0.78, 0.4),
    ],
  },
  {
    rx: 363,
    ry: 304,
    from: 0.4,
    leaves: [
      leaf(0, -2, 36, 1, 0.5),
      leaf(16, 10, 62, 0.85, 1.4),
      leaf(-14, 8, 8, 0.95, 0.9),
      leaf(6, -20, 42, 0.8, 2.1),
      leaf(-20, -8, 18, 0.78, 0.2),
    ],
  },
  {
    rx: 168,
    ry: 256,
    from: 0.5,
    leaves: [
      leaf(0, -4, -30, 0.95, 0.3),
      leaf(-15, 8, -58, 0.8, 1.1),
      leaf(13, 6, -6, 0.88, 1.8),
      leaf(-4, -18, -40, 0.74, 0.8),
    ],
  },
  {
    rx: 322,
    ry: 238,
    from: 0.56,
    leaves: [
      leaf(0, -4, 30, 0.95, 0.6),
      leaf(15, 8, 56, 0.8, 1.5),
      leaf(-13, 6, 6, 0.88, 1),
      leaf(4, -18, 40, 0.74, 2.2),
    ],
  },
  {
    rx: 245,
    ry: 176,
    from: 0.64,
    leaves: [
      leaf(0, -6, 0, 1, 0),
      leaf(-18, 6, -40, 0.85, 1.2),
      leaf(18, 6, 40, 0.85, 0.6),
      leaf(-8, -16, -20, 0.78, 1.9),
      leaf(10, -14, 22, 0.78, 0.9),
      leaf(0, 14, 4, 0.7, 1.5),
    ],
  },
];

const LEAF_PATH =
  "M0 -15 C 8 -11 11 -3 7 7 C 5 12 0 16 0 16 C 0 16 -5 12 -7 7 C -11 -3 -8 -11 0 -15 Z";

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
    [branch.from, Math.min(1, branch.from + 0.4)],
    [0, 1],
  );
  const pathLength = useSpring(raw, {
    stiffness: 70,
    damping: 26,
    mass: 0.4,
  });
  return (
    <motion.path
      d={branch.d}
      fill="none"
      stroke="url(#wt-bark)"
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
    [cluster.from, Math.min(1, cluster.from + 0.3)],
    [0, 1],
  );
  const opacity = useSpring(reveal, { stiffness: 60, damping: 24 });
  const scale = useTransform(opacity, [0, 1], [0.4, 1]);

  return (
    <g transform={`translate(${cluster.rx} ${cluster.ry})`}>
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
            animationDelay: `${index * -1.7}s`,
          }}
        >
          {cluster.leaves.map((lf, i) => (
            <g
              key={i}
              transform={`translate(${lf.x} ${lf.y}) rotate(${lf.r}) scale(${lf.s})`}
            >
              <g
                className={reduced ? undefined : "wt-leaf"}
                style={{
                  transformBox: "fill-box",
                  transformOrigin: "center bottom",
                  animationDelay: `${lf.d * -1}s`,
                }}
              >
                <path d={LEAF_PATH} fill="url(#wt-leaf)" />
                <path
                  d="M0 14 L0 -12"
                  stroke="rgb(11 60 52 / 0.5)"
                  strokeWidth={0.8}
                />
              </g>
            </g>
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
          0%,100% { transform: rotate(-1.1deg); }
          50%     { transform: rotate(1.3deg); }
        }
        @keyframes wt-cluster {
          0%,100% { transform: rotate(-2.4deg) translateX(-1px); }
          50%     { transform: rotate(2.8deg) translateX(1px); }
        }
        @keyframes wt-leaf {
          0%,100% { transform: rotate(-7deg); }
          50%     { transform: rotate(8deg); }
        }
        .wt-canopy  { animation: wt-canopy 7.5s ease-in-out infinite; }
        .wt-cluster { animation: wt-cluster 4.3s ease-in-out infinite; }
        .wt-leaf    { animation: wt-leaf 2.7s ease-in-out infinite; }
        @media (prefers-reduced-motion: reduce) {
          .wt-canopy,.wt-cluster,.wt-leaf { animation: none; }
        }
      `}</style>
      <svg
        viewBox="0 0 460 640"
        className="h-full w-full"
        preserveAspectRatio="xMidYMax meet"
        aria-hidden
      >
        <defs>
          <linearGradient id="wt-bark" x1="0" y1="1" x2="0" y2="0">
            <stop offset="0%" stopColor="#114c44" />
            <stop offset="55%" stopColor="#1f7a68" />
            <stop offset="100%" stopColor="#5fb38f" />
          </linearGradient>
          <linearGradient id="wt-leaf" x1="0" y1="1" x2="0.4" y2="0">
            <stop offset="0%" stopColor="#2f8f73" />
            <stop offset="100%" stopColor="#79c8a2" />
          </linearGradient>
        </defs>

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
