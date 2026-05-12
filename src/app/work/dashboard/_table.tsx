"use client";

import { useMemo, useState } from "react";
import { ArrowDown, ArrowUp, ArrowUpDown, Search } from "lucide-react";
import { APP_PROJECTS, type AppProject, type DeployStatus } from "./_data";
import { cn } from "@/lib/utils";

type SortKey = "name" | "deploys30d" | "errorRate";

const STATUS_PILL: Record<DeployStatus, string> = {
  success: "text-orange border-orange/40 bg-orange/5",
  failed: "text-destructive border-destructive/40 bg-destructive/5",
  building: "text-orange border-orange/40 bg-orange/5 animate-pulse",
  canceled: "text-muted-foreground border-border bg-muted/40",
};

export function ProjectsTable() {
  const [query, setQuery] = useState("");
  const [sortBy, setSortBy] = useState<SortKey>("deploys30d");
  const [dir, setDir] = useState<"asc" | "desc">("desc");

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    let list: AppProject[] = APP_PROJECTS.filter(
      (p) =>
        !q ||
        p.name.toLowerCase().includes(q) ||
        p.framework.toLowerCase().includes(q) ||
        p.region.toLowerCase().includes(q),
    );
    list = list.slice().sort((a, b) => {
      const av = a[sortBy];
      const bv = b[sortBy];
      if (typeof av === "string" && typeof bv === "string") {
        return dir === "asc" ? av.localeCompare(bv) : bv.localeCompare(av);
      }
      return dir === "asc" ? (av as number) - (bv as number) : (bv as number) - (av as number);
    });
    return list;
  }, [query, sortBy, dir]);

  const toggleSort = (k: SortKey) => {
    if (sortBy === k) setDir((d) => (d === "asc" ? "desc" : "asc"));
    else {
      setSortBy(k);
      setDir(k === "name" ? "asc" : "desc");
    }
  };
  const sortIcon = (k: SortKey) =>
    sortBy === k ? (
      dir === "asc" ? (
        <ArrowUp className="size-3" />
      ) : (
        <ArrowDown className="size-3" />
      )
    ) : (
      <ArrowUpDown className="size-3 opacity-40" />
    );

  return (
    <article className="border border-border bg-[#0a0a0a] p-6 md:p-7">
      <header className="mb-6 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div className="flex flex-col gap-1.5">
          <span className="f-mono text-[0.55rem] tracking-[0.25em] text-orange">
            / PROJECTS · {APP_PROJECTS.length}
          </span>
          <h3 className="f-anton text-2xl leading-tight md:text-3xl">
            ALL PROJECTS.
          </h3>
        </div>
        <div className="flex items-center gap-2 border border-border bg-background/40 px-3 py-2 md:w-72">
          <Search className="size-3.5 text-muted-foreground" strokeWidth={1.5} />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Filter…"
            className="f-mono w-full bg-transparent text-[0.65rem] tracking-[0.1em] placeholder:text-muted-foreground/60 focus:outline-none"
          />
        </div>
      </header>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[640px] border-collapse">
          <thead>
            <tr className="f-mono border-b border-border text-left text-[0.55rem] tracking-[0.25em] text-muted-foreground">
              <th className="py-3 pr-4">
                <button
                  type="button"
                  onClick={() => toggleSort("name")}
                  className="inline-flex items-center gap-1.5 transition-colors hover:text-orange"
                >
                  PROJECT {sortIcon("name")}
                </button>
              </th>
              <th className="py-3 pr-4">FRAMEWORK</th>
              <th className="py-3 pr-4">REGION</th>
              <th className="py-3 pr-4">STATUS</th>
              <th className="py-3 pr-4">
                <button
                  type="button"
                  onClick={() => toggleSort("deploys30d")}
                  className="inline-flex items-center gap-1.5 transition-colors hover:text-orange"
                >
                  DEPLOYS / 30D {sortIcon("deploys30d")}
                </button>
              </th>
              <th className="py-3 pr-4">
                <button
                  type="button"
                  onClick={() => toggleSort("errorRate")}
                  className="inline-flex items-center gap-1.5 transition-colors hover:text-orange"
                >
                  ERROR % {sortIcon("errorRate")}
                </button>
              </th>
              <th className="py-3">LAST DEPLOY</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((p) => (
              <tr
                key={p.slug}
                className="group border-b border-border/60 transition-colors hover:bg-[#0f0f0f]"
              >
                <td className="py-3.5 pr-4">
                  <div className="flex items-center gap-2.5">
                    <span className="inline-block size-1.5 rounded-full bg-orange" />
                    <span className="text-sm">{p.name}</span>
                  </div>
                </td>
                <td className="f-mono py-3.5 pr-4 text-[0.6rem] tracking-[0.2em] text-muted-foreground">
                  {p.framework.toUpperCase()}
                </td>
                <td className="f-mono py-3.5 pr-4 text-[0.6rem] tracking-[0.2em] text-muted-foreground">
                  {p.region}
                </td>
                <td className="py-3.5 pr-4">
                  <span
                    className={cn(
                      "f-mono inline-flex items-center gap-1.5 border px-2 py-1 text-[0.5rem] tracking-[0.25em]",
                      STATUS_PILL[p.status],
                    )}
                  >
                    <span className="inline-block size-1.5 rounded-full bg-current" />
                    {p.status.toUpperCase()}
                  </span>
                </td>
                <td className="f-mono py-3.5 pr-4 text-[0.7rem] tracking-[0.15em] text-foreground">
                  {p.deploys30d}
                </td>
                <td className="f-mono py-3.5 pr-4 text-[0.7rem] tracking-[0.15em]">
                  <span
                    className={cn(
                      p.errorRate > 1 ? "text-destructive" : p.errorRate > 0 ? "text-orange" : "text-muted-foreground",
                    )}
                  >
                    {p.errorRate.toFixed(1)}%
                  </span>
                </td>
                <td className="f-mono py-3.5 text-[0.6rem] tracking-[0.2em] text-muted-foreground">
                  {p.lastDeploy.toUpperCase()}
                </td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr>
                <td colSpan={7} className="f-mono py-10 text-center text-[0.65rem] tracking-[0.25em] text-muted-foreground">
                  NO PROJECTS MATCH “{query}”.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </article>
  );
}
