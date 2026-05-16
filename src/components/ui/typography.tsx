// FACTORY — every label, title and block of copy. One definition each.
import { createElement, type HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

type Heading = "h1" | "h2" | "h3" | "h4";

export function Eyebrow({
  className,
  ...props
}: HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p
      className={cn(
        "f-mono text-[0.62rem] tracking-[0.25em] text-orange",
        className,
      )}
      {...props}
    />
  );
}

type TitleSize = "hero" | "display" | "section" | "feature" | "project" | "card";

const TITLE: Record<TitleSize, string> = {
  hero: "f-display text-[clamp(4rem,13.5vw,15rem)]",
  display: "f-display text-[clamp(3.5rem,12vw,11rem)]",
  section: "f-anton text-[clamp(3rem,8vw,7rem)]",
  feature: "f-display text-[clamp(2.75rem,6.5vw,6.5rem)]",
  project: "f-anton text-[clamp(1.75rem,5vw,3.5rem)] leading-[1.05]",
  card: "f-anton text-3xl leading-[1.05]",
};

interface TitleProps extends HTMLAttributes<HTMLHeadingElement> {
  as?: Heading;
  size?: TitleSize;
  /** Stroked / hollow variant. */
  outline?: boolean;
}

export function Title({
  className,
  as = "h2",
  size = "section",
  outline = false,
  ...props
}: TitleProps) {
  return createElement(as, {
    className: cn(TITLE[size], outline && "outline-text", className),
    ...props,
  });
}

type TextVariant = "mono" | "body" | "lead";

const TEXT: Record<TextVariant, string> = {
  mono: "f-mono text-[0.68rem] leading-[2.2] text-muted-foreground",
  body: "text-[0.95rem] leading-[1.8] text-muted-foreground",
  lead: "text-[1.05rem] leading-[1.8] text-muted-foreground md:text-lg",
};

interface TextProps extends HTMLAttributes<HTMLParagraphElement> {
  variant?: TextVariant;
}

export function Text({ className, variant = "body", ...props }: TextProps) {
  return <p className={cn(TEXT[variant], className)} {...props} />;
}
