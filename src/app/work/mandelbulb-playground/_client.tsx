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
      <div className="grid w-full gap-4 md:grid-cols-[1fr_320px]">
        <div className="aspect-[16/10] w-full bg-black md:aspect-auto md:min-h-[560px]" />
        <div className="hidden border border-border bg-card md:block md:min-h-[560px]" />
      </div>
    ),
  },
);
