import type { Metadata } from "next";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { ParticleField } from "@/components/demos/particle-field";
import { Eyebrow, Stat, StatGrid, Text, Title } from "@/components/ui";

export const metadata: Metadata = {
  title: "Particle Gravity",
  description:
    "120 bodies orbiting your cursor via inverse-square attraction. Tap to detonate an outward burst.",
};

export default function ParticleGravityPage() {
  return (
    <div className="pt-[68px] md:pt-[88px]">
      <header className="flex items-center justify-between gap-6 border-b border-border bg-[#070707] px-5 py-4 md:px-8">
        <div className="flex flex-col gap-1">
          <Eyebrow className="text-[0.55rem] text-muted-foreground/70">
            WORKSPACE / CANVAS
          </Eyebrow>
          <Title as="h1" size="card">
            PARTICLE GRAVITY.
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
        <ParticleField className="h-[68vh] min-h-[420px] w-full" />
      </div>

      <section className="border-t border-border bg-[#070707] px-5 py-16 md:px-8 md:py-24">
        <div className="mx-auto grid max-w-6xl gap-12 md:grid-cols-[200px_1fr]">
          <Eyebrow>/ ABOUT</Eyebrow>
          <div className="flex flex-col gap-8">
            <Text variant="lead" className="max-w-prose">
              120 weightless bodies fall toward your cursor under an
              inverse-square attraction — the same law that holds planets in
              orbit. Move slowly and they settle into rings; flick the pointer
              and they slingshot. Tap to inject an outward impulse and watch
              the system re-form.
            </Text>
            <Text variant="body" className="max-w-prose text-[1rem]">
              Pure Canvas 2D, one animation loop, zero libraries. Every frame
              integrates velocity and acceleration for each body and redraws —
              no physics engine, just the math.
            </Text>
            <StatGrid>
              <Stat label="STACK" value="Canvas 2D" />
              <Stat label="BODIES" value="120" />
              <Stat label="INPUT" value="Pointer" />
              <Stat label="DEPS" value="0" />
            </StatGrid>
          </div>
        </div>
      </section>
    </div>
  );
}
