import { Hero } from "@/components/sections/hero";
import { MarqueeStrip } from "@/components/sections/marquee-strip";
import { CapabilitiesSection } from "@/components/sections/capabilities";
import { WorkPreview } from "@/components/sections/work-preview";
import { ExperimentsSection } from "@/components/sections/experiments";
import { FractalSection } from "@/components/sections/fractal-section";
import { StatsStrip } from "@/components/sections/stats-strip";

export default function HomePage() {
  return (
    <>
      <Hero />
      <MarqueeStrip />
      <FractalSection />
      <CapabilitiesSection />
      <StatsStrip />
      <ExperimentsSection />
      <WorkPreview />
    </>
  );
}
