"use client";

import { HEATMAP_DAYS } from "./_data";

const LEVELS = [
  "rgb(20 20 20)",
  "rgba(255, 69, 0, 0.18)",
  "rgba(255, 69, 0, 0.38)",
  "rgba(255, 69, 0, 0.62)",
  "rgba(255, 69, 0, 0.95)",
];

const MONTHS = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];

export function Heatmap() {
  // Build weeks of 7 days
  const weeks: number[][] = [];
  for (let w = 0; w < 53; w++) {
    weeks.push(HEATMAP_DAYS.slice(w * 7, w * 7 + 7));
  }
  const total = HEATMAP_DAYS.reduce((sum, v) => sum + v, 0);
  return (
    <article className="border border-border bg-[#0a0a0a] p-6 md:p-7">
      <header className="mb-6 flex items-end justify-between gap-4">
        <div className="flex flex-col gap-1.5">
          <span className="f-mono text-[0.55rem] tracking-[0.25em] text-orange">
            / ACTIVITY · 365D
          </span>
          <h3 className="f-anton text-2xl leading-tight md:text-3xl">
            CONTRIBUTION FIELD.
          </h3>
        </div>
        <div className="f-mono text-right text-[0.55rem] tracking-[0.2em] text-muted-foreground">
          <div>
            <span className="text-foreground">{total}</span> EVENTS
          </div>
          <div>53 WEEKS</div>
        </div>
      </header>

      <div className="overflow-x-auto">
        <div className="inline-flex flex-col gap-1.5">
          <div className="f-mono flex gap-[3px] pl-7 text-[0.5rem] tracking-[0.2em] text-muted-foreground/70">
            {MONTHS.map((m) => (
              <span key={m} style={{ width: 4 * 4 + 8 }}>
                {m}
              </span>
            ))}
          </div>
          <div className="flex gap-1">
            <div className="f-mono flex flex-col gap-[3px] pr-2 text-[0.45rem] tracking-[0.2em] text-muted-foreground/60">
              <span style={{ height: 11 }}>MON</span>
              <span style={{ height: 11 }} />
              <span style={{ height: 11 }}>WED</span>
              <span style={{ height: 11 }} />
              <span style={{ height: 11 }}>FRI</span>
              <span style={{ height: 11 }} />
              <span style={{ height: 11 }} />
            </div>
            <div className="flex gap-[3px]">
              {weeks.map((week, wi) => (
                <div key={wi} className="flex flex-col gap-[3px]">
                  {week.map((v, di) => (
                    <span
                      key={di}
                      title={`Week ${wi + 1} · day ${di + 1}: ${v} events`}
                      className="block size-[11px] transition-transform hover:scale-150"
                      style={{ background: LEVELS[v] }}
                    />
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="mt-6 flex items-center justify-end gap-2">
        <span className="f-mono text-[0.5rem] tracking-[0.25em] text-muted-foreground/70">
          LESS
        </span>
        <div className="flex gap-[3px]">
          {LEVELS.map((c, i) => (
            <span key={i} className="block size-[11px]" style={{ background: c }} />
          ))}
        </div>
        <span className="f-mono text-[0.5rem] tracking-[0.25em] text-muted-foreground/70">
          MORE
        </span>
      </div>
    </article>
  );
}
