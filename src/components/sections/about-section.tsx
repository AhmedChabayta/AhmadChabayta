import type { ReactNode } from "react";
import { Container, Eyebrow, Section, Text, Title } from "@/components/ui";

const FACTS = [
  { label: "LOCATION", value: "Beirut, Lebanon" },
  { label: "DISCIPLINE", value: "Frontend · Interactive" },
  { label: "LANGUAGES", value: "English · Arabic" },
  { label: "AVAILABILITY", value: "Open to work — remote" },
];

export function AboutSection() {
  return (
    <Section id="about" aria-labelledby="about-heading">
      <Container>
        <div className="mb-20 flex flex-col gap-5 md:mb-28">
          <Eyebrow>/ 02 — ABOUT</Eyebrow>
          <Title id="about-heading" size="section">
            SELF-TAUGHT.
            <br />
            NO DEGREE.
            <br />
            ALL WORK.
          </Title>
        </div>

        <div className="grid gap-12 md:grid-cols-3">
          <div className="space-y-6 md:col-span-2">
            <Text variant="lead">
              I&apos;m Ahmad Chabayta, a frontend and interactive developer
              based in Beirut. No CS degree — I learned by building things that
              had to actually ship, then making the next one sharper.
            </Text>
            <Text variant="lead">
              Design and engineering are one job to me. I build my own systems
              instead of gluing libraries together, and I care as much about
              how an interface feels as whether it works: typed, accessible,
              fast, and animated only where motion earns its place.
            </Text>
            <Text variant="lead">
              The range runs from production dashboards like Project Atlas and
              Preview Links to real-time WebGL work and a fully offline arcade
              game synthesized on the Web Audio API.
              React, Next.js, TypeScript, WebGL — used where they pull weight,
              not for their own sake.
            </Text>
            <Text variant="lead">
              Hand me a Figma file or a blank page. Either way, what you get
              back is a real, shipped product.
            </Text>
          </div>
          <aside className="flex flex-col gap-6">
            {FACTS.map((f) => (
              <Fact key={f.label} label={f.label}>
                {f.value}
              </Fact>
            ))}
          </aside>
        </div>
      </Container>
    </Section>
  );
}

function Fact({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="border-l-2 border-orange pl-4">
      <p className="f-mono text-[0.55rem] tracking-[0.2em] text-muted-foreground">
        {label}
      </p>
      <p className="f-mono mt-1 text-[0.85rem] text-foreground">{children}</p>
    </div>
  );
}
