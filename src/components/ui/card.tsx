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
        "border border-border bg-card text-card-foreground",
        PAD[pad],
        interactive &&
          "transition-colors hover:border-orange/40 hover:bg-muted",
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
      className={cn("border border-border bg-card", className)}
      {...props}
    />
  );
}
