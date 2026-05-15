import type { Metadata, Viewport } from "next";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { SpaceInvadersClient } from "./_client";

export const metadata: Metadata = {
  title: "Void Invaders",
  description:
    "An endless, evolving arcade space-shooter. Infinite waves, bosses, power-ups, synthesized sound — an installable PWA that plays fully offline.",
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    title: "Void Invaders",
    statusBarStyle: "black-translucent",
  },
  icons: {
    icon: [
      { url: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [{ url: "/icons/apple-touch-icon.png", sizes: "180x180" }],
  },
};

export const viewport: Viewport = {
  themeColor: "#05010a",
  colorScheme: "dark",
};

export default function SpaceInvadersPage() {
  return (
    <div className="pt-[68px] md:pt-[88px]">
      <header className="flex items-center justify-between gap-6 border-b border-border bg-[#070707] px-5 py-4 md:px-8">
        <div className="flex flex-col gap-1">
          <span className="f-mono text-[0.55rem] tracking-[0.25em] text-muted-foreground/70">
            WORKSPACE / ARCADE
          </span>
          <h1 className="f-anton text-2xl leading-none md:text-3xl">
            VOID INVADERS.
          </h1>
        </div>
        <Link
          href="/work"
          className="f-mono group inline-flex items-center gap-2 text-[0.55rem] tracking-[0.25em] text-muted-foreground transition-colors hover:text-orange focus-visible:text-orange"
        >
          <ChevronLeft className="size-3 transition-transform group-hover:-translate-x-0.5" />
          BACK TO WORK
        </Link>
      </header>

      <div className="bg-[#040208] p-4 md:p-8">
        <SpaceInvadersClient />
      </div>

      <section className="border-t border-border bg-[#070707] px-5 py-16 md:px-8 md:py-24">
        <div className="mx-auto grid max-w-6xl gap-12 md:grid-cols-[200px_1fr]">
          <span className="f-mono text-[0.6rem] tracking-[0.25em] text-orange">
            / ABOUT
          </span>
          <div className="flex flex-col gap-8">
            <p className="max-w-prose text-[1.05rem] leading-[1.8] text-muted-foreground md:text-lg">
              A classic ship-versus-aliens arcade shooter, rebuilt as an
              endless gauntlet. Every fifth wave is a multi-phase boss; in
              between, the formation generator keeps escalating — bigger
              grids, faster strafing, denser fire, and modifiers like{" "}
              <span className="text-orange">WEAVE</span>,{" "}
              <span className="text-orange">DIVE BOMBERS</span> and{" "}
              <span className="text-orange">SNIPERS</span> that unlock the
              deeper you go.
            </p>
            <p className="max-w-prose text-[1rem] leading-[1.8] text-muted-foreground">
              Ten stacking power-ups, a combo multiplier, smart bombs and
              destructible bunkers. Every sound and the adaptive music are
              synthesized live with the Web Audio API — no audio files — so
              the whole thing is an installable PWA that runs{" "}
              <span className="text-orange">fully offline</span>. Your high
              score, lifetime stats and current run auto-save to the device.
            </p>
            <dl className="grid grid-cols-2 gap-x-8 gap-y-4 border-t border-border pt-6 md:grid-cols-4">
              <Stat label="ENGINE" value="Canvas2D · TS" />
              <Stat label="AUDIO" value="Web Audio" />
              <Stat label="WAVES" value="∞ endless" />
              <Stat label="OFFLINE" value="PWA · 100%" />
            </dl>
          </div>
        </div>
      </section>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-2">
      <dt className="f-mono text-[0.55rem] tracking-[0.25em] text-muted-foreground">
        {label}
      </dt>
      <dd className="f-anton text-2xl leading-none">{value}</dd>
    </div>
  );
}
