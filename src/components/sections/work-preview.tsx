"use client";

import Link from "next/link";
import Image from "next/image";
import { useInView, useReducedMotion } from "framer-motion";
import { useRef } from "react";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import { PROJECTS, type Project } from "@/data/projects";
import { SHOTS } from "@/data/shots.generated";
import { Tilt } from "@/components/motion/reveal";
import {
  Badge,
  Container,
  Eyebrow,
  Section,
  SectionHeader,
  Text,
  Title,
} from "@/components/ui";

function ProjectLinkProps(p: Project) {
  if (p.externalUrl) {
    return {
      href: p.externalUrl,
      target: "_blank" as const,
      rel: "noreferrer noopener",
    };
  }
  return { href: p.appHref ?? `/work/${p.slug}` };
}

function status(p: Project): { label: string; dot?: "pulse" | "solid" } {
  if (p.externalUrl) return { label: "LIVE", dot: "pulse" };
  if (p.appHref) return { label: "APP", dot: "solid" };
  return { label: "CASE STUDY" };
}

/**
 * The site's signal line, now structural: as a card scrolls in, one
 * continuous stroke draws itself around the real content — the line
 * forming into the card frame.
 */
function DrawnFrame({ delay }: { delay: number }) {
  const reduced = useReducedMotion();
  const ref = useRef<SVGSVGElement>(null);
  const inView = useInView(ref, { once: true, margin: "-8% 0px -8% 0px" });
  const on = reduced || inView;
  return (
    <svg
      ref={ref}
      aria-hidden
      className="pointer-events-none absolute inset-0 z-10 h-full w-full"
      viewBox="0 0 100 100"
      preserveAspectRatio="none"
      fill="none"
    >
      <rect
        x="1.1"
        y="1.1"
        width="97.8"
        height="97.8"
        rx="2.4"
        pathLength={1}
        stroke="rgb(var(--orange))"
        strokeWidth={2}
        strokeLinecap="round"
        vectorEffect="non-scaling-stroke"
        strokeDasharray={1}
        style={{
          strokeDashoffset: on ? 0 : 1,
          opacity: on ? 0.85 : 0,
          filter: "drop-shadow(0 0 6px rgb(var(--orange) / 0.5))",
          transition: reduced
            ? "none"
            : `stroke-dashoffset 1.15s cubic-bezier(.22,1,.36,1) ${delay}s, opacity .4s ease ${delay}s`,
        }}
      />
    </svg>
  );
}

export function WorkPreview() {
  return (
    <Section id="work" aria-labelledby="work-heading">
      <Container>
        <SectionHeader
          titleId="work-heading"
          eyebrow="/ 01 — SELECTED WORK"
          title="THE WORK."
          aside={
            <Text variant="mono" className="max-w-[28ch] md:text-right">
              {PROJECTS.length} PROJECTS.
              <br />
              LIVE APPS, DEMOS &amp; CASE STUDIES.
            </Text>
          }
        />

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {PROJECTS.map((p, i) => {
            const isExternal = Boolean(p.externalUrl);
            const s = status(p);
            return (
              <Tilt
                key={p.slug}
                className="group relative h-full overflow-hidden rounded-sm"
              >
                <DrawnFrame delay={(i % 3) * 0.12} />
                <Link
                  {...ProjectLinkProps(p)}
                  className="flex h-full flex-col gap-5 border border-border/40 bg-card/5 p-7 backdrop-blur-md transition-colors hover:border-orange/40 hover:bg-card/15 focus-visible:border-orange/40"
                >
                  {SHOTS[p.slug] && (
                    <div className="relative -mx-7 -mt-7 mb-1 aspect-[16/10] overflow-hidden border-b border-border">
                      <Image
                        src={SHOTS[p.slug]}
                        alt={`${p.title} — screenshot`}
                        fill
                        sizes="(min-width:1024px) 33vw, (min-width:640px) 50vw, 100vw"
                        className="object-cover object-top transition-transform duration-700 group-hover:scale-[1.04]"
                      />
                      <div
                        aria-hidden
                        className="absolute inset-0"
                        style={{
                          background:
                            "linear-gradient(180deg, transparent 55%, rgb(var(--card)) 100%)",
                        }}
                      />
                    </div>
                  )}

                  <div className="flex items-start justify-between gap-4">
                    <Eyebrow>
                      {p.index} / {p.year}
                    </Eyebrow>
                    {s.dot ? (
                      <Badge tone="accent" dot={s.dot}>
                        {s.label}
                      </Badge>
                    ) : (
                      <Badge tone="muted">{s.label}</Badge>
                    )}
                  </div>

                  <Title
                    as="h3"
                    size="card"
                    className="transition-colors group-hover:text-orange"
                  >
                    {p.title}
                  </Title>

                  <Text variant="body" className="line-clamp-3">
                    {p.tagline}
                  </Text>

                  <div className="mt-auto flex items-end justify-between gap-4 pt-2">
                    <div className="flex flex-wrap gap-1.5">
                      {p.stack.slice(0, 3).map((t) => (
                        <Badge key={t} className="group-hover:border-orange/30">
                          {t}
                        </Badge>
                      ))}
                    </div>
                    {isExternal ? (
                      <ArrowUpRight className="size-5 shrink-0 -translate-x-1 opacity-40 transition-all group-hover:translate-x-0 group-hover:text-orange group-hover:opacity-100" />
                    ) : (
                      <ArrowRight className="size-5 shrink-0 -translate-x-1 opacity-40 transition-all group-hover:translate-x-0 group-hover:text-orange group-hover:opacity-100" />
                    )}
                  </div>
                </Link>
              </Tilt>
            );
          })}
        </div>
      </Container>
    </Section>
  );
}
