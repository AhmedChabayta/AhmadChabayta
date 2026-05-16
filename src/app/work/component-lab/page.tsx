import type { Metadata } from "next";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { ComponentLabApp } from "./_lab";
import { Eyebrow, Stat, StatGrid, Text, Title } from "@/components/ui";

export const metadata: Metadata = {
  title: "Component Lab",
  description:
    "A typed React component library with a live prop playground. Pick a component, tweak its props, copy the JSX.",
};

export default function ComponentLabPage() {
  return (
    <div className="pt-[68px] md:pt-[88px]">
      <header className="flex items-center justify-between gap-6 border-b border-border bg-[#070707] px-5 py-4 md:px-8">
        <div className="flex flex-col gap-1">
          <Eyebrow className="text-[0.55rem] text-muted-foreground/70">
            WORKSPACE / DESIGN SYSTEM
          </Eyebrow>
          <Title as="h1" size="card">
            COMPONENT LAB.
          </Title>
        </div>
        <Link
          href="/work"
          className="f-mono group inline-flex items-center gap-2 text-[0.55rem] tracking-[0.25em] text-muted-foreground transition-colors hover:text-orange focus-visible:text-orange"
        >
          <ChevronLeft className="size-3 transition-transform group-hover:-translate-x-0.5" />
          BACK TO WORK
        </Link>
      </header>

      <div className="bg-[#050505]">
        <ComponentLabApp />
      </div>

      <section className="border-t border-border bg-[#070707] px-5 py-16 md:px-8 md:py-24">
        <div className="mx-auto grid max-w-6xl gap-12 md:grid-cols-[200px_1fr]">
          <Eyebrow>/ ABOUT</Eyebrow>
          <div className="flex flex-col gap-8">
            <Text variant="lead" className="max-w-prose">
              A working design-system playground in the spirit of Storybook,
              built from scratch. Nine components, four categories, every prop
              wired to a live control and a generated JSX snippet you can
              copy.
            </Text>
            <Text variant="body" className="max-w-prose text-[1rem]">
              Each component is defined as a record with a typed prop schema,
              a renderer, and a code template. The lab reads the schema and
              generates the controls automatically — adding a tenth component
              is just one entry in the registry.
            </Text>
            <StatGrid>
              <Stat label="COMPONENTS" value="9" />
              <Stat label="CATEGORIES" value="4" />
              <Stat label="TYPED" value="100%" />
              <Stat label="DEPS" value="0" />
            </StatGrid>
          </div>
        </div>
      </section>
    </div>
  );
}
