// FACTORY — surfaces. Card = padded container; Surface = bare panel.
import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  interactive?: boolean;
  pad?: "default" | "lg" | "none";
}

const PAD: Record<NonNullable<CardProps["pad"]>, string> = {
  default: "p-8 md:p-10",
  lg: "p-12 md:p-16",
  none: "",
};

export function Card({
  className,
  interactive = false,
  pad = "default",
  ...props
}: CardProps) {
  return (
    <div
      className={cn(
        "border border-border/40 bg-card/5 text-card-foreground backdrop-blur-md",
        PAD[pad],
        interactive &&
          "transition-colors hover:border-orange/40 hover:bg-card/15",
        className,
      )}
      {...props}
    />
  );
}

export function Surface({
  className,
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "border border-border/40 bg-card/5 backdrop-blur-md",
        className,
      )}
      {...props}
    />
  );
}
