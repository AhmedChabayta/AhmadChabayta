// FACTORY — the only place a clickable call-to-action is styled.
// Renders <Link>, <a> or <button> depending on href, but the look is
// defined once here.
import Link from "next/link";
import type { MouseEventHandler, ReactNode } from "react";
import { cn } from "@/lib/utils";

type Variant = "primary" | "outline" | "link";
type Size = "sm" | "md" | "lg";

const BASE =
  "group f-mono inline-flex items-center gap-2 font-bold uppercase tracking-[0.15em] transition-all outline-none focus-visible:ring-2 focus-visible:ring-orange/60";

const VARIANT: Record<Variant, string> = {
  primary:
    "bg-orange text-background hover:scale-[1.04] hover:shadow-[0_0_40px_rgba(255,69,0,0.45)] focus-visible:scale-[1.04]",
  outline:
    "border border-white/15 text-foreground hover:border-orange hover:text-orange focus-visible:border-orange",
  link: "gap-2 tracking-[0.25em] text-orange hover:gap-3 focus-visible:gap-3",
};

const SIZE: Record<Size, string> = {
  sm: "px-6 py-3 text-[0.6rem]",
  md: "px-8 py-4 text-[0.7rem]",
  lg: "px-9 py-5 text-[0.7rem]",
};

export interface ButtonProps {
  href?: string;
  external?: boolean;
  variant?: Variant;
  size?: Size;
  className?: string;
  children?: ReactNode;
  type?: "button" | "submit";
  target?: string;
  rel?: string;
  onClick?: MouseEventHandler<HTMLElement>;
  "aria-label"?: string;
}

export function Button({
  href,
  external,
  variant = "primary",
  size = "md",
  className,
  children,
  type = "button",
  target,
  rel,
  onClick,
  ...aria
}: ButtonProps) {
  const cls = cn(
    BASE,
    VARIANT[variant],
    variant !== "link" && SIZE[size],
    className,
  );
  if (href) {
    const isExternal = external ?? /^https?:\/\//.test(href);
    if (isExternal) {
      return (
        <a
          href={href}
          target={target ?? "_blank"}
          rel={rel ?? "noreferrer noopener"}
          className={cls}
          onClick={onClick}
          {...aria}
        >
          {children}
        </a>
      );
    }
    return (
      <Link href={href} className={cls} onClick={onClick} {...aria}>
        {children}
      </Link>
    );
  }
  return (
    <button type={type} className={cls} onClick={onClick} {...aria}>
      {children}
    </button>
  );
}
