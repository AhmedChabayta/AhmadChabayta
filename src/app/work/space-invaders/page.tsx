import type { Metadata, Viewport } from "next";
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
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  userScalable: false,
};

export default function SpaceInvadersPage() {
  return (
    <>
      <h1 className="sr-only">
        Void Invaders — endless arcade space shooter
      </h1>
      <SpaceInvadersClient />
    </>
  );
}
