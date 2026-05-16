"use client";

import Link from "next/link";
import Image from "next/image";
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
          {PROJECTS.map((p) => {
            const isExternal = Boolean(p.externalUrl);
            const s = status(p);
            return (
              <Tilt
                key={p.slug}
                className="group relative h-full overflow-hidden rounded-sm"
              >
                <Link
                  {...ProjectLinkProps(p)}
                  className="flex h-full flex-col gap-5 border border-border bg-card/10 p-7 backdrop-blur-md transition-colors hover:border-orange/40 hover:bg-card/20 focus-visible:border-orange/40"
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
