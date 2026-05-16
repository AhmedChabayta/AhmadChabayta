import { Hero } from "@/components/sections/hero";
import { MarqueeStrip } from "@/components/sections/marquee-strip";
import { WorkPreview } from "@/components/sections/work-preview";
import { FractalSection } from "@/components/sections/fractal-section";
import { AboutSection } from "@/components/sections/about-section";
import { CapabilitiesSection } from "@/components/sections/capabilities";
import { StatsStrip } from "@/components/sections/stats-strip";
import { ExperimentsSection } from "@/components/sections/experiments";
import { ContactSection } from "@/components/sections/contact-section";

export default function HomePage() {
  return (
    <>
      <Hero />
      <MarqueeStrip />
      <WorkPreview />
      <FractalSection />
      <AboutSection />
      <CapabilitiesSection />
      <StatsStrip />
      <ExperimentsSection />
      <ContactSection />
    </>
  );
}
