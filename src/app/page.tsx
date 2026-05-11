import { Hero } from "@/components/sections/hero";
import { CapabilitiesSection } from "@/components/sections/capabilities";
import { WorkPreview } from "@/components/sections/work-preview";
import { ExperimentsSection } from "@/components/sections/experiments";
import { FractalSection } from "@/components/sections/fractal-section";
import { StatsStrip } from "@/components/sections/stats-strip";

export default function HomePage() {
  return (
    <>
      <Hero />
      <FractalSection />
      <CapabilitiesSection />
      <StatsStrip />
      <ExperimentsSection />
      <WorkPreview />
    </>
  );
}
