"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { PROJECTS } from "@/data/projects";

export function WorkPreview() {
  const featured = PROJECTS.filter((p) => p.featured).slice(0, 4);
  const rest = PROJECTS.filter((p) => !p.featured).slice(0, 3);

  return (
    <section
      id="work-preview"
      aria-labelledby="work-preview-heading"
      className="border-t border-border px-5 py-24 md:px-10 md:py-32"
    >
      <div className="mx-auto max-w-7xl">
        <div className="mb-12 flex items-end justify-between gap-6">
          <h2
            id="work-preview-heading"
            className="f-anton text-[clamp(2.5rem,7vw,6rem)]"
          >
            SELECTED WORK.
          </h2>
          <Link
            href="/work"
            className="f-mono group inline-flex items-center gap-2 text-[0.65rem] text-orange transition-opacity hover:opacity-70 focus-visible:opacity-70 active:opacity-70"
          >
            ALL PROJECTS
            <ArrowRight className="size-3 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {featured.map((p, i) => (
            <motion.div
              key={p.slug}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.6, delay: i * 0.08 }}
            >
              <Link
                href={`/work/${p.slug}`}
                className="group relative flex h-full min-h-[280px] flex-col justify-between overflow-hidden border border-border bg-card p-8 transition-colors hover:bg-muted focus-visible:bg-muted"
              >
                <div className="flex items-start justify-between gap-4">
                  <span className="f-mono text-[0.6rem] tracking-[0.2em] text-orange">
                    {p.index} / {p.year}
                  </span>
                  <span className="f-mono text-[0.55rem] tracking-[0.2em] text-muted-foreground">
                    {p.role.toUpperCase()}
                  </span>
                </div>
                <div>
                  <h3 className="f-anton text-3xl md:text-5xl leading-none transition-colors group-hover:text-orange">
                    {p.title}
                  </h3>
                  <p className="mt-4 max-w-[36ch] text-sm leading-relaxed text-muted-foreground">
                    {p.tagline}
                  </p>
                  <div className="mt-6 flex flex-wrap gap-1.5">
                    {p.stack.map((s) => (
                      <span
                        key={s}
                        className="f-mono border border-border px-2 py-1 text-[0.55rem] text-muted-foreground"
                      >
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>

        <ul className="mt-10 divide-y divide-border border-y border-border">
          {rest.map((p, i) => (
            <motion.li
              key={p.slug}
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-30px" }}
              transition={{ duration: 0.5, delay: i * 0.05 }}
            >
              <Link
                href={`/work/${p.slug}`}
                className="group flex items-center justify-between gap-6 py-6 transition-colors hover:bg-muted focus-visible:bg-muted px-2"
              >
                <span className="f-mono text-[0.6rem] tracking-[0.2em] text-muted-foreground">
                  {p.index}
                </span>
                <span className="f-anton flex-1 text-2xl md:text-4xl transition-colors group-hover:text-orange">
                  {p.title}
                </span>
                <span className="f-mono hidden text-[0.6rem] tracking-[0.2em] text-muted-foreground md:inline">
                  {p.role.toUpperCase()}
                </span>
                <ArrowRight className="size-4 -translate-x-2 opacity-0 transition-all group-hover:translate-x-0 group-hover:opacity-100" />
              </Link>
            </motion.li>
          ))}
        </ul>
      </div>
    </section>
  );
}
