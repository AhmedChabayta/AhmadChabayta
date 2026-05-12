"use client";

import { Area, AreaChart, ResponsiveContainer } from "recharts";
import { ArrowUpRight, ArrowDownRight } from "lucide-react";
import { KPIS } from "./_data";
import { cn } from "@/lib/utils";

export function KpiStrip() {
  return (
    <div className="grid gap-px bg-border md:grid-cols-2 lg:grid-cols-4">
      {KPIS.map((k) => (
        <article
          key={k.label}
          className="group relative flex flex-col gap-4 bg-[#0a0a0a] p-6 transition-colors hover:bg-[#0f0f0f] md:p-7"
        >
          <div className="flex items-start justify-between gap-4">
            <span className="f-mono text-[0.55rem] tracking-[0.25em] text-muted-foreground">
              {k.label}
            </span>
            <span
              className={cn(
                "f-mono inline-flex items-center gap-1 text-[0.55rem] tracking-[0.2em]",
                k.positive ? "text-orange" : "text-destructive",
              )}
            >
              {k.positive ? (
                <ArrowUpRight className="size-3" />
              ) : (
                <ArrowDownRight className="size-3" />
              )}
              {k.delta}
            </span>
          </div>
          <span className="f-anton text-[clamp(2.25rem,4vw,3.5rem)] leading-none">
            {k.value}
          </span>
          <div className="h-10 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={k.spark} margin={{ top: 2, bottom: 2, left: 0, right: 0 }}>
                <defs>
                  <linearGradient id={`spark-${k.label}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="rgb(255 69 0)" stopOpacity={0.6} />
                    <stop offset="100%" stopColor="rgb(255 69 0)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <Area
                  type="monotone"
                  dataKey="v"
                  stroke="rgb(255 69 0)"
                  strokeWidth={1.25}
                  fill={`url(#spark-${k.label})`}
                  isAnimationActive={false}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </article>
      ))}
    </div>
  );
}
