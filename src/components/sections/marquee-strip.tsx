const PHRASES = [
  "AVAILABLE FOR WORK",
  "FRONTEND",
  "CREATIVE TECH",
  "GLSL · SHADERS",
  "REACT · NEXT.JS",
  "DATA · DASHBOARDS",
  "DESIGN SYSTEMS",
  "MOTION",
  "BEIRUT",
];

export function MarqueeStrip() {
  const loop = [...PHRASES, ...PHRASES];
  return (
    <section
      aria-hidden="true"
      className="relative overflow-hidden border-y border-border bg-background py-10 mask-fade-x md:py-14"
    >
      <div className="marquee-track flex w-max items-center gap-12 whitespace-nowrap will-change-transform md:gap-20">
        {loop.map((p, i) => (
          <span
            key={`${p}-${i}`}
            className="f-anton flex items-center gap-12 text-[clamp(2rem,4.5vw,4rem)] text-foreground md:gap-20"
          >
            {p}
            <span aria-hidden className="inline-block size-2 rotate-45 bg-orange" />
          </span>
        ))}
      </div>
    </section>
  );
}
