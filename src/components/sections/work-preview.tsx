"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import { PROJECTS, type Project } from "@/data/projects";

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
  const featured = PROJECTS.filter((p) => p.featured).slice(0, 4);
  const rest = PROJECTS.filter((p) => !p.featured).slice(0, 4);

  return (
    <section
      id="work-preview"
      aria-labelledby="work-preview-heading"
      className="border-t border-border px-6 py-40 md:px-10 md:py-56"
    >
      <div className="mx-auto max-w-7xl">
        <div className="mb-24 flex flex-col gap-10 md:mb-36 md:flex-row md:items-end md:justify-between">
          <div className="flex flex-col gap-5">
            <span className="f-mono text-[0.6rem] text-orange">/ 05 — SELECTED WORK</span>
            <h2
              id="work-preview-heading"
              className="f-anton text-[clamp(3rem,8vw,7rem)]"
            >
              THE WORK.
            </h2>
          </div>
          <Link
            href="/work"
            className="f-mono group inline-flex items-center gap-2 self-start text-[0.65rem] text-orange transition-opacity hover:opacity-70 focus-visible:opacity-70 active:opacity-70 md:self-end"
          >
            ALL PROJECTS
            <ArrowRight className="size-3 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>

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
                    className="pointer-events-none absolute -right-20 -top-20 size-80 rounded-full bg-orange/0 blur-[80px] transition-colors duration-700 group-hover:bg-orange/10"
                  />
                  <div className="relative flex items-start justify-between gap-6">
                    <span className="f-mono text-[0.6rem] tracking-[0.25em] text-orange">
                      {p.index} / {p.year}
                    </span>
                    <div className="flex items-center gap-3">
                      <span className="f-mono hidden text-[0.55rem] tracking-[0.25em] text-muted-foreground md:inline">
                        {p.role.toUpperCase()}
                      </span>
                      {isExternal ? (
                        <span className="f-mono inline-flex items-center gap-1.5 border border-orange/40 px-2 py-1 text-[0.5rem] tracking-[0.25em] text-orange">
                          <span className="inline-block size-1.5 animate-pulse rounded-full bg-orange" />
                          LIVE
                        </span>
                      ) : isApp ? (
                        <span className="f-mono inline-flex items-center gap-1.5 border border-orange/40 px-2 py-1 text-[0.5rem] tracking-[0.25em] text-orange">
                          <span className="inline-block size-1.5 rounded-full bg-orange" />
                          APP
                        </span>
                      ) : null}
                    </div>
                  </div>
                  <div className="relative mt-16">
                    <h3 className="f-anton text-[clamp(2rem,4.5vw,3.5rem)] leading-[1.05] transition-colors group-hover:text-orange">
                      {p.title}
                    </h3>
                    <p className="mt-7 max-w-[40ch] text-[0.95rem] leading-[1.8] text-muted-foreground">
                      {p.tagline}
                    </p>
                    <div className="mt-10 flex items-end justify-between gap-6">
                      <div className="flex flex-wrap gap-1.5">
                        {p.stack.slice(0, 4).map((s) => (
                          <span
                            key={s}
                            className="f-mono border border-border px-2.5 py-1.5 text-[0.55rem] tracking-[0.2em] text-muted-foreground transition-colors group-hover:border-orange/30"
                          >
                            {s}
                          </span>
                        ))}
                      </div>
                      {isExternal ? (
                        <ArrowUpRight className="size-6 shrink-0 -translate-x-2 translate-y-2 opacity-40 transition-all group-hover:translate-x-0 group-hover:translate-y-0 group-hover:opacity-100 group-hover:text-orange" />
                      ) : (
                        <ArrowRight className="size-6 shrink-0 -translate-x-2 opacity-40 transition-all group-hover:translate-x-0 group-hover:opacity-100 group-hover:text-orange" />
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
                  <span className="f-anton flex-1 text-[clamp(1.5rem,4vw,3rem)] leading-[1.05] transition-colors group-hover:text-orange">
                    {p.title}
                  </span>
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
      </div>
    </section>
  );
}

