// FACTORY — the eyebrow + big title (+ optional aside) header shared by
// every content section. Layout defined once.
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { Eyebrow, Title } from "./typography";

interface SectionHeaderProps {
  eyebrow: ReactNode;
  title: ReactNode;
  titleId?: string;
  /** Right-aligned content (a blurb or a link). */
  aside?: ReactNode;
  size?: "section" | "display";
  className?: string;
}

export function SectionHeader({
  eyebrow,
  title,
  titleId,
  aside,
  size = "section",
  className,
}: SectionHeaderProps) {
  return (
    <div
      className={cn(
        "mb-24 flex flex-col gap-10 md:mb-36 md:flex-row md:items-end md:justify-between",
        className,
      )}
    >
      <div className="flex flex-col gap-5">
        <Eyebrow>{eyebrow}</Eyebrow>
        <Title id={titleId} size={size}>
          {title}
        </Title>
      </div>
      {aside}
    </div>
  );
}
