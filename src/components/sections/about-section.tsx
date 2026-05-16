import type { ReactNode } from "react";
import { Container, Eyebrow, Section, Text, Title } from "@/components/ui";

const FACTS = [
  { label: "LOCATION", value: "Beirut, Lebanon" },
  { label: "ORIGIN", value: "Born in Riyadh, KSA" },
  { label: "LANGUAGES", value: "English · Arabic" },
  { label: "STATUS", value: "Available globally" },
  { label: "EXPERIENCE", value: "4 years professional" },
];

export function AboutSection() {
  return (
    <Section id="about" aria-labelledby="about-heading">
      <Container>
        <div className="mb-20 flex flex-col gap-5 md:mb-28">
          <Eyebrow>/ 03 — ABOUT</Eyebrow>
          <Title id="about-heading" size="section">
            FOUR YEARS,
            <br />
            NO DEGREE,
            <br />
            ONLY THE WORK.
          </Title>
        </div>

        <div className="grid gap-12 md:grid-cols-3">
          <div className="space-y-6 md:col-span-2">
            <Text variant="lead">
              I&apos;m Ahmad Chabayta — a self-taught frontend developer based
              in Beirut. I was born in Riyadh but my iqama expired long ago, so
              my work and my time zone now sit in Lebanon. The clients I ship
              for, though, are everywhere.
            </Text>
            <Text variant="lead">
              I started writing code the way most people start a band — by
              trying to copy something I liked until the copies became their
              own thing. Four years later that means React, Next.js,
              TypeScript, WebGL, and the kind of UI work that has to feel as
              good as it functions.
            </Text>
            <Text variant="lead">
              I treat design and engineering as one job. I build my own systems
              instead of bolting libraries together. I read shader papers
              because there&apos;s no faster way to learn linear algebra than
              to wonder why your raymarcher exploded.
            </Text>
            <Text variant="lead">
              If you need somebody who can take a Figma file and turn it into a
              real, typed, accessible, animated, fast website — or take nothing
              and turn it into the same thing — that&apos;s me.
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
