"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";

type Variant = "primary" | "outline" | "ghost";
type Size = "sm" | "md" | "lg";

export function ComponentLab() {
  const [variant, setVariant] = useState<Variant>("primary");
  const [size, setSize] = useState<Size>("md");
  const [label, setLabel] = useState("Get in touch");
  const [iconRight, setIconRight] = useState(true);

  const jsx = `<Button variant="${variant}" size="${size}"${iconRight ? ' withIcon' : ''}>${label}</Button>`;

  return (
    <div className="grid gap-4 border border-border bg-card p-5 md:grid-cols-[1.5fr_1fr] md:p-8">
      <div className="flex flex-col gap-4">
        <p className="f-mono text-[0.6rem] tracking-[0.2em] text-orange">
          / LIVE PROP PLAYGROUND
        </p>
        <div className="flex min-h-[160px] items-center justify-center rounded-sm border border-dashed border-border bg-background p-6">
          <DemoButton variant={variant} size={size} withIcon={iconRight}>
            {label || "Button"}
          </DemoButton>
        </div>
        <pre className="overflow-x-auto rounded-sm border border-border bg-background p-4 font-mono text-[0.7rem] text-muted-foreground">
          <code>{jsx}</code>
        </pre>
      </div>

      <div className="flex flex-col gap-5">
        <PropGroup label="VARIANT">
          {(["primary", "outline", "ghost"] as Variant[]).map((v) => (
            <Pill
              key={v}
              active={variant === v}
              onClick={() => setVariant(v)}
            >
              {v}
            </Pill>
          ))}
        </PropGroup>
        <PropGroup label="SIZE">
          {(["sm", "md", "lg"] as Size[]).map((s) => (
            <Pill key={s} active={size === s} onClick={() => setSize(s)}>
              {s}
            </Pill>
          ))}
        </PropGroup>
        <PropGroup label="ICON">
          <Pill active={iconRight} onClick={() => setIconRight(true)}>
            with
          </Pill>
          <Pill active={!iconRight} onClick={() => setIconRight(false)}>
            without
          </Pill>
        </PropGroup>
        <PropGroup label="LABEL">
          <input
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            className="f-mono w-full border border-border bg-background px-3 py-2 text-[0.75rem] text-foreground outline-none focus:border-orange"
          />
        </PropGroup>
      </div>
    </div>
  );
}

function PropGroup({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-2">
      <p className="f-mono text-[0.55rem] tracking-[0.2em] text-muted-foreground">
        {label}
      </p>
      <div className="flex flex-wrap gap-2">{children}</div>
    </div>
  );
}

function Pill({
  children,
  active,
  onClick,
}: {
  children: React.ReactNode;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "f-mono border px-3 py-1.5 text-[0.6rem] tracking-[0.18em] transition-colors",
        active
          ? "border-orange bg-orange text-background"
          : "border-border text-muted-foreground hover:border-orange/60 hover:text-orange",
      )}
    >
      {children}
    </button>
  );
}

function DemoButton({
  variant,
  size,
  withIcon,
  children,
}: {
  variant: Variant;
  size: Size;
  withIcon: boolean;
  children: React.ReactNode;
}) {
  const variants: Record<Variant, string> = {
    primary: "bg-orange text-background hover:scale-105",
    outline:
      "border border-orange text-orange hover:bg-orange hover:text-background",
    ghost: "text-foreground hover:bg-muted",
  };
  const sizes: Record<Size, string> = {
    sm: "px-3 py-1.5 text-[0.65rem]",
    md: "px-5 py-2.5 text-[0.75rem]",
    lg: "px-7 py-3.5 text-[0.85rem]",
  };
  return (
    <button
      type="button"
      className={cn(
        "f-mono inline-flex items-center gap-2 font-bold uppercase tracking-[0.1em] transition-all",
        variants[variant],
        sizes[size],
      )}
    >
      {children}
      {withIcon && <span>→</span>}
    </button>
  );
}
