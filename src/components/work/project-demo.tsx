"use client";

import dynamic from "next/dynamic";
import type { ProjectDemo as Demo } from "@/data/projects";
import { WaveSynth } from "@/components/demos/wave-synth";

const MandelbulbPlayground = dynamic(
  () =>
    import("@/components/demos/mandelbulb-playground").then(
      (m) => m.MandelbulbPlayground,
    ),
  {
    ssr: false,
    loading: () => (
      <div className="grid w-full gap-4 md:grid-cols-[1fr_320px]">
        <div className="aspect-[16/10] w-full bg-black md:aspect-auto md:min-h-[560px]" />
        <div className="hidden border border-border bg-card md:block md:min-h-[560px]" />
      </div>
    ),
  },
);

const GitPulse = dynamic(
  () => import("@/components/demos/git-pulse").then((m) => m.GitPulse),
  { ssr: false, loading: () => <div className="aspect-[16/10] w-full bg-card" /> },
);

const ComponentLab = dynamic(
  () => import("@/components/demos/component-lab").then((m) => m.ComponentLab),
  { ssr: false, loading: () => <div className="aspect-[16/10] w-full bg-card" /> },
);

const ColorExtractor = dynamic(
  () => import("@/components/demos/color-extractor").then((m) => m.ColorExtractor),
  { ssr: false, loading: () => <div className="aspect-[16/10] w-full bg-card" /> },
);

export function ProjectDemo({ demo }: { demo: Demo }) {
  switch (demo.kind) {
    case "fractal-playground":
      return <MandelbulbPlayground />;
    case "git-pulse":
      return <GitPulse />;
    case "component-lab":
      return <ComponentLab />;
    case "color-extractor":
      return <ColorExtractor />;
    case "wave-synth":
      return <WaveSynth className="aspect-[16/10] w-full" />;
    case "none":
    default:
      return (
        <div className="flex aspect-[16/10] w-full items-center justify-center border border-dashed border-border bg-card text-muted-foreground">
          <p className="f-mono text-[0.65rem] tracking-[0.2em]">
            DEMO COMING SOON
          </p>
        </div>
      );
  }
}

