import type { Metadata } from "next";
import { WaveSynthClient } from "./_client";

export const metadata: Metadata = {
  title: "Wave Synth",
  description:
    "Full-screen generative waveform playground — drag to shape frequency and amplitude; tune layer count, speed and glow live.",
};

export default function WaveSynthPage() {
  return <WaveSynthClient />;
}
