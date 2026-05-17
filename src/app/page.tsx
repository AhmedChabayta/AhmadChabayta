import { Hero } from "@/components/sections/hero";
import { MarqueeStrip } from "@/components/sections/marquee-strip";
import { WorkPreview } from "@/components/sections/work-preview";
import { AboutSection } from "@/components/sections/about-section";
import { CapabilitiesSection } from "@/components/sections/capabilities";
import { StatsStrip } from "@/components/sections/stats-strip";
import { ExperimentsSection } from "@/components/sections/experiments";
import { ContactSection } from "@/components/sections/contact-section";
import { Reveal } from "@/components/motion/reveal";

export default function HomePage() {
  return (
    <>
      <Hero />
      <MarqueeStrip />
      <Reveal>
        <WorkPreview />
      </Reveal>
      <Reveal>
        <AboutSection />
      </Reveal>
      <Reveal>
        <CapabilitiesSection />
      </Reveal>
      <Reveal>
        <StatsStrip />
      </Reveal>
      <Reveal>
        <ExperimentsSection />
      </Reveal>
      <Reveal>
        <ContactSection />
      </Reveal>
    </>
  );
}
