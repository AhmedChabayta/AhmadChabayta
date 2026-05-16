import type { Metadata } from "next";
import { MandelbulbPlaygroundClient } from "./_client";

export const metadata: Metadata = {
  title: "Mandelbulb Playground",
  description:
    "Full-screen GLSL raymarcher — tune power, iterations, color and camera live; every parameter encodes into a shareable URL.",
};

export default function MandelbulbPage() {
  return <MandelbulbPlaygroundClient />;
}
