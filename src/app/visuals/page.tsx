import type { Metadata } from "next";
import { FractalSection } from "@/components/sections/fractal-section";
import { ExperimentsSection } from "@/components/sections/experiments";

export const metadata: Metadata = {
  title: "Visuals",
  description: "Live GLSL, canvas, and motion experiments.",
};

export default function VisualsPage() {
  return (
    <>
      <FractalSection />
      <ExperimentsSection />
    </>
  );
}
