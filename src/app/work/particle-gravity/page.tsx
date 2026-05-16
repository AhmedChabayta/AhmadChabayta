import type { Metadata } from "next";
import { ParticleGravityClient } from "./_client";

export const metadata: Metadata = {
  title: "Particle Gravity",
  description:
    "Full-screen Canvas physics playground — tune body count, gravity and trails; up to 600 bodies orbiting your cursor under inverse-square attraction.",
};

export default function ParticleGravityPage() {
  return <ParticleGravityClient />;
}
