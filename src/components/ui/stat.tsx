// FACTORY — the label/value stat used across the work case-study pages.
import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils";

export function Stat({
  label,
  value,
}: {
  label: ReactNode;
  value: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-2">
      <dt className="f-mono text-[0.55rem] tracking-[0.25em] text-muted-foreground">
        {label}
      </dt>
      <dd className="f-anton text-2xl leading-none">{value}</dd>
    </div>
  );
}

export function StatGrid({
  className,
  ...props
}: HTMLAttributes<HTMLDListElement>) {
  return (
    <dl
      className={cn(
        "grid grid-cols-2 gap-x-8 gap-y-4 border-t border-border pt-6 md:grid-cols-4",
        className,
      )}
      {...props}
    />
  );
}
