import type { Metadata } from "next";
import Link from "next/link";
import { PROJECTS } from "@/data/projects";
import { ArrowUpRight, ArrowRight } from "lucide-react";

export const metadata: Metadata = {
  title: "Work",
  description:
    "Selected projects — live apps, interactive demos, GLSL experiments, data dashboards.",
};

export default function WorkIndexPage() {
  return (
    <div className="px-5 pt-32 pb-32 md:px-10 md:pt-44 md:pb-44">
      <div className="mx-auto max-w-7xl">
        <header className="mb-20 flex flex-col gap-6 md:mb-28">
          <p className="f-mono text-[0.65rem] text-orange">
            / INDEX · {PROJECTS.length} PROJECTS
          </p>
          <h1 className="f-anton text-[clamp(3.5rem,12vw,11rem)] leading-[0.92]">
            WORK.
          </h1>
          <p className="mt-4 max-w-prose text-[1.05rem] leading-[1.7] text-muted-foreground md:text-lg">
            Live deployments, interactive demos, and case studies. External
            projects open in a new tab — internal ones unfold into their own
            page.
          </p>
        </header>

        <ul className="divide-y divide-border border-y border-border">
          {PROJECTS.map((p) => {
            const isExternal = Boolean(p.externalUrl);
            const linkProps = isExternal
              ? {
                  href: p.externalUrl!,
                  target: "_blank" as const,
                  rel: "noreferrer noopener",
                }
              : { href: p.appHref ?? `/work/${p.slug}` };
            const isApp = Boolean(p.appHref);
            return (
              <li key={p.slug}>
                <Link
                  {...linkProps}
                  className="group grid grid-cols-12 items-center gap-4 px-2 py-10 transition-colors hover:bg-muted focus-visible:bg-muted md:py-12"
                >
                  <span className="f-mono col-span-2 text-[0.6rem] tracking-[0.25em] text-muted-foreground md:col-span-1">
                    {p.index}
                  </span>
                  <span className="f-anton col-span-8 text-[clamp(1.75rem,5vw,3.5rem)] leading-[1.05] transition-colors group-hover:text-orange md:col-span-5">
                    {p.title}
                  </span>
                  <span className="f-mono col-span-12 order-3 text-[0.6rem] tracking-[0.25em] text-muted-foreground md:order-none md:col-span-3">
                    {p.role.toUpperCase()}
                  </span>
                  <span className="f-mono col-span-2 hidden text-[0.55rem] tracking-[0.25em] md:inline">
                    {isExternal ? (
                      <span className="inline-flex items-center gap-1.5 border border-orange/40 px-2 py-1 text-orange">
                        <span className="inline-block size-1.5 animate-pulse rounded-full bg-orange" />
                        LIVE
                      </span>
                    ) : isApp ? (
                      <span className="inline-flex items-center gap-1.5 border border-orange/40 px-2 py-1 text-orange">
                        <span className="inline-block size-1.5 rounded-full bg-orange" />
                        APP
                      </span>
                    ) : (
                      <span className="text-muted-foreground">CASE STUDY</span>
                    )}
                  </span>
                  <span className="col-span-2 flex items-center justify-end gap-3 md:col-span-1">
                    <span className="f-mono hidden text-[0.55rem] tracking-[0.25em] text-muted-foreground md:inline">
                      {p.year}
                    </span>
                    {isExternal ? (
                      <ArrowUpRight className="size-4 -translate-x-2 opacity-0 transition-all group-hover:translate-x-0 group-hover:opacity-100 group-hover:text-orange" />
                    ) : (
                      <ArrowRight className="size-4 -translate-x-2 opacity-0 transition-all group-hover:translate-x-0 group-hover:opacity-100 group-hover:text-orange" />
                    )}
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
