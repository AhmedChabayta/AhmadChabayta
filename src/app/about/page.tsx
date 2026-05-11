import type { Metadata } from "next";
import { CapabilitiesSection } from "@/components/sections/capabilities";
import { StatsStrip } from "@/components/sections/stats-strip";

export const metadata: Metadata = {
  title: "About",
  description: "Self-taught frontend developer based in Beirut, born in Riyadh.",
};

export default function AboutPage() {
  return (
    <div className="px-5 pt-24 pb-24 md:px-10 md:pt-32 md:pb-32">
      <div className="mx-auto flex max-w-5xl flex-col gap-12">
        <header className="flex flex-col gap-4">
          <p className="f-mono text-[0.65rem] text-orange">/ABOUT</p>
          <h1 className="f-anton text-[clamp(2.75rem,8vw,7rem)] leading-[0.85]">
            FOUR YEARS,
            <br />
            NO DEGREE,
            <br />
            ONLY THE WORK.
          </h1>
        </header>

        <div className="grid gap-12 md:grid-cols-3">
          <div className="md:col-span-2">
            <div className="space-y-6 text-base leading-relaxed text-muted-foreground md:text-lg">
              <p>
                I&apos;m Ahmad Chabayta — a self-taught frontend developer based
                in Beirut. I was born in Riyadh but my iqama expired long ago,
                so my work and my time zone now sit in Lebanon. The clients I
                ship for, though, are everywhere.
              </p>
              <p>
                I started writing code the way most people start a band — by
                trying to copy something I liked until the copies became their
                own thing. Four years later that means React, Next.js,
                TypeScript, WebGL, and the kind of UI work that has to feel as
                good as it functions.
              </p>
              <p>
                I treat design and engineering as one job. I build my own
                systems instead of bolting libraries together. I read shader
                papers because there&apos;s no faster way to learn linear
                algebra than to wonder why your raymarcher exploded.
              </p>
              <p>
                If you need somebody who can take a Figma file and turn it into
                a real, typed, accessible, animated, fast website — or take
                nothing and turn it into the same thing — that&apos;s me.
              </p>
            </div>
          </div>
          <aside className="flex flex-col gap-6">
            <Fact label="LOCATION">Beirut, Lebanon</Fact>
            <Fact label="ORIGIN">Born in Riyadh, KSA</Fact>
            <Fact label="LANGUAGES">English · Arabic</Fact>
            <Fact label="STATUS">Available globally</Fact>
            <Fact label="EXPERIENCE">4 years professional</Fact>
          </aside>
        </div>
      </div>

      <div className="mt-16">
        <StatsStrip />
      </div>
      <div>
        <CapabilitiesSection />
      </div>
    </div>
  );
}

function Fact({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="border-l-2 border-orange pl-4">
      <p className="f-mono text-[0.55rem] tracking-[0.2em] text-muted-foreground">
        {label}
      </p>
      <p className="f-mono mt-1 text-[0.85rem] text-foreground">{children}</p>
    </div>
  );
}
