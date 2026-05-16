// FACTORY — layout shells. Every section's outer rhythm lives here, so
// the whole site's spacing changes from one place.
import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

interface SectionProps extends HTMLAttributes<HTMLElement> {
  /** Top hairline divider (default on). */
  divider?: boolean;
  /** Vertical padding scale. */
  pad?: "default" | "tight" | "none";
}

const PAD: Record<NonNullable<SectionProps["pad"]>, string> = {
  default: "px-6 py-40 md:px-10 md:py-56",
  tight: "px-6 py-20 md:px-10 md:py-28",
  none: "",
};

export function Section({
  className,
  divider = true,
  pad = "default",
  ...props
}: SectionProps) {
  return (
    <section
      className={cn(
        divider && "border-t border-border",
        PAD[pad],
        className,
      )}
      {...props}
    />
  );
}

export function Container({
  className,
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("mx-auto max-w-7xl", className)} {...props} />;
}
