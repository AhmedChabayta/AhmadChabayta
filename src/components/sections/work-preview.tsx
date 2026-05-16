"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import { PROJECTS, type Project } from "@/data/projects";
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

export function WorkPreview() {
  const featured = PROJECTS.filter((p) => p.featured);
  const rest = PROJECTS.filter((p) => !p.featured);

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

        <div className="grid gap-10 md:grid-cols-2">
          {featured.map((p, i) => {
            const isExternal = Boolean(p.externalUrl);
            const isApp = Boolean(p.appHref);
            return (
              <motion.div
                key={p.slug}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-80px" }}
                transition={{ duration: 0.6, delay: i * 0.08 }}
              >
                <Link
                  {...ProjectLinkProps(p)}
                  className="group relative flex h-full min-h-[400px] flex-col justify-between overflow-hidden border border-border bg-card p-12 transition-all hover:border-orange/40 hover:bg-muted focus-visible:border-orange/40 focus-visible:bg-muted md:p-16"
                >
                  <div
                    aria-hidden
                    className="pointer-events-none absolute -top-20 -right-20 size-80 rounded-full bg-orange/0 blur-[80px] transition-colors duration-700 group-hover:bg-orange/10"
                  />
                  <div className="relative flex items-start justify-between gap-6">
                    <Eyebrow>
                      {p.index} / {p.year}
                    </Eyebrow>
                    <div className="flex items-center gap-3">
                      <span className="f-mono hidden text-[0.55rem] tracking-[0.25em] text-muted-foreground md:inline">
                        {p.role.toUpperCase()}
                      </span>
                      {isExternal ? (
                        <Badge tone="accent" dot="pulse">
                          LIVE
                        </Badge>
                      ) : isApp ? (
                        <Badge tone="accent" dot="solid">
                          APP
                        </Badge>
                      ) : null}
                    </div>
                  </div>
                  <div className="relative mt-16">
                    <Title
                      as="h3"
                      size="project"
                      className="transition-colors group-hover:text-orange"
                    >
                      {p.title}
                    </Title>
                    <Text variant="body" className="mt-7 max-w-[40ch]">
                      {p.tagline}
                    </Text>
                    <div className="mt-10 flex items-end justify-between gap-6">
                      <div className="flex flex-wrap gap-1.5">
                        {p.stack.slice(0, 4).map((s) => (
                          <Badge
                            key={s}
                            className="group-hover:border-orange/30"
                          >
                            {s}
                          </Badge>
                        ))}
                      </div>
                      {isExternal ? (
                        <ArrowUpRight className="size-6 shrink-0 -translate-x-2 translate-y-2 opacity-40 transition-all group-hover:translate-x-0 group-hover:translate-y-0 group-hover:text-orange group-hover:opacity-100" />
                      ) : (
                        <ArrowRight className="size-6 shrink-0 -translate-x-2 opacity-40 transition-all group-hover:translate-x-0 group-hover:text-orange group-hover:opacity-100" />
                      )}
                    </div>
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </div>

        <ul className="mt-20 divide-y divide-border border-y border-border md:mt-28">
          {rest.map((p, i) => {
            const isExternal = Boolean(p.externalUrl);
            return (
              <motion.li
                key={p.slug}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: "-30px" }}
                transition={{ duration: 0.5, delay: i * 0.05 }}
              >
                <Link
                  {...ProjectLinkProps(p)}
                  className="group flex items-center justify-between gap-6 px-5 py-10 transition-colors hover:bg-muted focus-visible:bg-muted md:px-7 md:py-14"
                >
                  <span className="f-mono text-[0.6rem] tracking-[0.25em] text-muted-foreground">
                    {p.index}
                  </span>
                  <Title
                    as="h3"
                    size="project"
                    className="flex-1 transition-colors group-hover:text-orange"
                  >
                    {p.title}
                  </Title>
                  <span className="f-mono hidden text-[0.6rem] tracking-[0.25em] text-muted-foreground md:inline">
                    {p.role.toUpperCase()}
                  </span>
                  {isExternal ? (
                    <ArrowUpRight className="size-5 -translate-x-2 opacity-0 transition-all group-hover:translate-x-0 group-hover:opacity-100" />
                  ) : (
                    <ArrowRight className="size-5 -translate-x-2 opacity-0 transition-all group-hover:translate-x-0 group-hover:opacity-100" />
                  )}
                </Link>
              </motion.li>
            );
          })}
        </ul>
      </Container>
    </Section>
  );
}
