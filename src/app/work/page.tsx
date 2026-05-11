import type { Metadata } from "next";
import Link from "next/link";
import { PROJECTS } from "@/data/projects";
import { ArrowUpRight } from "lucide-react";

export const metadata: Metadata = {
  title: "Work",
  description: "Selected projects — interactive demos, GLSL experiments, data dashboards.",
};

export default function WorkIndexPage() {
  return (
    <div className="px-5 pt-24 pb-32 md:px-10 md:pt-32 md:pb-40">
      <div className="mx-auto max-w-7xl">
        <header className="mb-16 flex flex-col gap-4">
          <p className="f-mono text-[0.65rem] text-orange">/ INDEX · {PROJECTS.length}</p>
          <h1 className="f-anton text-[clamp(3rem,10vw,9rem)] leading-[0.85]">
            WORK.
          </h1>
          <p className="max-w-prose text-muted-foreground">
            Each project below is its own interactive page. Open one to see the
            live demo, the stack, what was hard, and what was learned.
          </p>
        </header>

        <ul className="divide-y divide-border border-y border-border">
          {PROJECTS.map((p) => (
            <li key={p.slug}>
              <Link
                href={`/work/${p.slug}`}
                className="group grid grid-cols-12 items-center gap-4 py-8 transition-colors hover:bg-muted focus-visible:bg-muted px-2"
              >
                <span className="f-mono col-span-2 text-[0.6rem] tracking-[0.2em] text-muted-foreground md:col-span-1">
                  {p.index}
                </span>
                <span className="f-anton col-span-8 text-3xl leading-tight transition-colors group-hover:text-orange md:col-span-5 md:text-5xl">
                  {p.title}
                </span>
                <span className="f-mono col-span-12 text-[0.6rem] tracking-[0.2em] text-muted-foreground md:col-span-4 md:order-none order-3">
                  {p.role.toUpperCase()}
                </span>
                <span className="f-mono col-span-2 hidden text-right text-[0.6rem] tracking-[0.2em] text-muted-foreground md:inline">
                  {p.year}
                </span>
                <ArrowUpRight className="col-span-2 ml-auto size-4 -translate-x-2 opacity-0 transition-all group-hover:translate-x-0 group-hover:opacity-100 md:hidden" />
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
