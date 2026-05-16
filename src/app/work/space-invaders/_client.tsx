"use client";

import dynamic from "next/dynamic";

export const SpaceInvadersClient = dynamic(
  () => import("./_SpaceInvaders").then((m) => m.SpaceInvaders),
  {
    ssr: false,
    loading: () => (
      <div
        className="fixed inset-0 z-[80] grid place-items-center bg-black"
        style={{ height: "100dvh", width: "100vw" }}
      >
        <span className="animate-pulse font-mono text-xs uppercase tracking-[0.3em] text-white/40">
          Loading…
        </span>
      </div>
    ),
  },
);
