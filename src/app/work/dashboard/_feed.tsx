"use client";

import { CheckCircle2, XCircle, Loader2, MinusCircle } from "lucide-react";
import { EVENTS, type DeployStatus } from "./_data";
import { cn } from "@/lib/utils";

function StatusBadge({ status }: { status: DeployStatus }) {
  const map = {
    success: { label: "SUCCESS", color: "text-orange border-orange/40 bg-orange/5", Icon: CheckCircle2 },
    failed: { label: "FAILED", color: "text-destructive border-destructive/40 bg-destructive/5", Icon: XCircle },
    building: { label: "BUILDING", color: "text-orange border-orange/40 bg-orange/5 animate-pulse", Icon: Loader2 },
    canceled: { label: "CANCELED", color: "text-muted-foreground border-border bg-muted/40", Icon: MinusCircle },
  } as const;
  const { label, color, Icon } = map[status];
  return (
    <span
      className={cn(
        "f-mono inline-flex items-center gap-1.5 border px-2 py-1 text-[0.5rem] tracking-[0.25em]",
        color,
      )}
    >
      <Icon className={cn("size-3", status === "building" && "animate-spin")} strokeWidth={1.5} />
      {label}
    </span>
  );
}

export function EventFeed() {
  return (
    <article className="flex h-full min-w-0 flex-col border border-border bg-[#0a0a0a] p-4 sm:p-5 md:p-7">
      <header className="mb-4 flex items-end justify-between gap-4 md:mb-6">
        <div className="flex flex-col gap-1.5">
          <span className="f-mono text-[0.55rem] tracking-[0.25em] text-orange">
            / EVENTS · LIVE
          </span>
          <h3 className="f-anton text-xl leading-tight sm:text-2xl md:text-3xl">
            DEPLOY FEED.
          </h3>
        </div>
        <span className="f-mono shrink-0 text-[0.55rem] tracking-[0.25em] text-muted-foreground">
          {EVENTS.length} EVENTS
        </span>
      </header>
      <ul className="flex min-w-0 flex-1 flex-col divide-y divide-border overflow-hidden">
        {EVENTS.map((e) => (
          <li
            key={e.id}
            className="group flex items-start gap-3 py-3 transition-colors hover:bg-[#0f0f0f] md:gap-4 md:py-3.5"
          >
            <div className="shrink-0">
              <StatusBadge status={e.status} />
            </div>
            <div className="flex min-w-0 flex-1 flex-col gap-1">
              <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
                <span className="f-mono truncate text-[0.6rem] tracking-[0.2em] text-orange">
                  {e.project}
                </span>
                <span className="f-mono text-[0.5rem] tracking-[0.2em] text-muted-foreground">
                  · {e.commit}
                </span>
              </div>
              <p className="truncate text-[0.8rem] text-foreground/85 md:text-sm">
                {e.message}
              </p>
              <span className="f-mono text-[0.5rem] tracking-[0.25em] text-muted-foreground">
                {e.author} · {e.durationSec}s · {e.ago}
              </span>
            </div>
          </li>
        ))}
      </ul>
    </article>
  );
}
