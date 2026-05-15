"use client";

import dynamic from "next/dynamic";

export const SpaceInvadersClient = dynamic(
  () => import("./_SpaceInvaders").then((m) => m.SpaceInvaders),
  {
    ssr: false,
    loading: () => (
      <div className="flex w-full flex-col items-center gap-4">
        <div
          className="w-full max-w-[680px] animate-pulse rounded-lg border border-border bg-black"
          style={{ height: "min(82vh, 920px)" }}
        />
      </div>
    ),
  },
);
