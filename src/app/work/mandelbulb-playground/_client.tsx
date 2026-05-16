"use client";

import dynamic from "next/dynamic";

export const MandelbulbPlaygroundClient = dynamic(
  () =>
    import("@/components/demos/mandelbulb-playground").then(
      (m) => m.MandelbulbPlayground,
    ),
  {
    ssr: false,
    loading: () => (
      <div className="fixed inset-0 z-[80] bg-black" />
    ),
  },
);
