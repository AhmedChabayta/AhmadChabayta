// FACTORY — status pills (LIVE / APP) and tech-stack tags.
import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

type Tone = "accent" | "muted";

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  tone?: Tone;
  /** Leading status dot: "pulse" (live) | "solid" | none. */
  dot?: "pulse" | "solid";
}

const TONE: Record<Tone, string> = {
  accent: "border-orange/40 text-orange",
  muted: "border-border text-muted-foreground",
};

export function Badge({
  className,
  tone = "muted",
  dot,
  children,
  ...props
}: BadgeProps) {
  return (
    <span
      className={cn(
        "f-mono inline-flex items-center gap-1.5 border px-2.5 py-1 text-[0.55rem] tracking-[0.25em]",
        TONE[tone],
        className,
      )}
      {...props}
    >
      {dot && (
        <span
          className={cn(
            "inline-block size-1.5 rounded-full bg-orange",
            dot === "pulse" && "animate-pulse",
          )}
        />
      )}
      {children}
    </span>
  );
}
