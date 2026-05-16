import type { Metadata } from "next";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { BreakoutMicro } from "@/components/demos/breakout-micro";
import { Eyebrow, Stat, StatGrid, Text, Title } from "@/components/ui";

export const metadata: Metadata = {
  title: "Breakout",
  description: "A complete breakout game in ~80 lines of vanilla canvas.",
};

export default function BreakoutPage() {
  return (
    <div className="pt-[68px] md:pt-[88px]">
      <header className="flex items-center justify-between gap-6 border-b border-border bg-[#070707] px-5 py-4 md:px-8">
        <div className="flex flex-col gap-1">
          <Eyebrow className="text-[0.55rem] text-muted-foreground/70">
            WORKSPACE / CANVAS
          </Eyebrow>
          <Title as="h1" size="card">
            BREAKOUT.
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
        <BreakoutMicro className="h-[68vh] min-h-[420px] w-full" />
      </div>

      <section className="border-t border-border bg-[#070707] px-5 py-16 md:px-8 md:py-24">
        <div className="mx-auto grid max-w-6xl gap-12 md:grid-cols-[200px_1fr]">
          <Eyebrow>/ ABOUT</Eyebrow>
          <div className="flex flex-col gap-8">
            <Text variant="lead" className="max-w-prose">
              A complete game of Breakout — paddle, ball, destructible bricks,
              win and lose states — written in roughly eighty lines of vanilla
              Canvas 2D. Drag to move the paddle; clear the wall.
            </Text>
            <Text variant="body" className="max-w-prose text-[1rem]">
              No framework, no game engine, no sprite sheet. Collision is plain
              AABB math against the ball, and the whole thing runs from one
              requestAnimationFrame loop.
            </Text>
            <StatGrid>
              <Stat label="STACK" value="Canvas 2D" />
              <Stat label="LINES" value="≈ 80" />
              <Stat label="INPUT" value="Drag" />
              <Stat label="DEPS" value="0" />
            </StatGrid>
          </div>
        </div>
      </section>
    </div>
  );
}
