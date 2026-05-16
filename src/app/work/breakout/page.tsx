import type { Metadata } from "next";
import { BreakoutClient } from "./_client";

export const metadata: Metadata = {
  title: "Breakout",
  description:
    "Full-screen Breakout playground — tune the brick grid, lives, ball speed and paddle width, then clear the wall.",
};

export default function BreakoutPage() {
  return <BreakoutClient />;
}
