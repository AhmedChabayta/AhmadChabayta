import type { Metadata } from "next";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { MandelbulbPlaygroundClient } from "./_client";
import { Eyebrow, Stat, StatGrid, Text, Title } from "@/components/ui";

export const metadata: Metadata = {
  title: "Mandelbulb Playground",
  description:
    "Live GLSL raymarcher with parameter sliders and shareable URLs. Every dial maps to a uniform on the GPU.",
};

export default function MandelbulbPage() {
  return (
    <div className="pt-[68px] md:pt-[88px]">
      <header className="flex items-center justify-between gap-6 border-b border-border bg-[#070707] px-5 py-4 md:px-8">
        <div className="flex flex-col gap-1">
          <Eyebrow className="text-[0.55rem] text-muted-foreground/70">
            WORKSPACE / SHADERS
          </Eyebrow>
          <Title as="h1" size="card">
            MANDELBULB PLAYGROUND.
          </Title>
        </div>
        <Link
          href="/#work"
          className="f-mono group inline-flex items-center gap-2 text-[0.55rem] tracking-[0.25em] text-muted-foreground transition-colors hover:text-orange focus-visible:text-orange"
        >
          <ChevronLeft className="size-3 transition-transform group-hover:-translate-x-0.5" />
          BACK TO WORK
        </Link>
      </header>

      <div className="bg-[#050505] p-5 md:p-8">
        <MandelbulbPlaygroundClient />
      </div>

      <section className="border-t border-border bg-[#070707] px-5 py-16 md:px-8 md:py-24">
        <div className="mx-auto grid max-w-6xl gap-12 md:grid-cols-[200px_1fr]">
          <Eyebrow>/ ABOUT</Eyebrow>
          <div className="flex flex-col gap-8">
            <Text variant="lead" className="max-w-prose">
              A live, browser-rendered Mandelbulb — the 3D analogue of the
              Mandelbrot fractal. Every pixel is solved by raymarching through
              a distance field, on the GPU, at 60fps. Every dial in the side
              panel maps to a uniform in the shader; nothing is faked.
            </Text>
            <Text variant="body" className="max-w-prose text-[1rem]">
              Every parameter is also serialized into the URL, debounced via{" "}
              <code className="f-mono text-orange">history.replaceState</code>.
              Hit COPY SHARE URL and you get a link that reproduces the exact
              composition for anyone else — no server, no account.
            </Text>
            <StatGrid>
              <Stat label="STACK" value="GLSL · Three.js" />
              <Stat label="LINES" value="≈ 420" />
              <Stat label="FPS DESKTOP" value="60" />
              <Stat label="FPS MOBILE" value="≈ 30" />
            </StatGrid>
          </div>
        </div>
      </section>
    </div>
  );
}
