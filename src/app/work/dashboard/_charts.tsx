"use client";

import {
  Area,
  AreaChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { DEPLOYS_30D, STATUS_DONUT } from "./_data";

const tickStyle = {
  fontFamily: "var(--font-jetbrains), monospace",
  fontSize: 10,
  fill: "rgb(115 115 115)",
  letterSpacing: "0.15em",
};

const tooltipStyle = {
  background: "rgb(10 10 10)",
  border: "1px solid rgb(38 38 38)",
  fontFamily: "var(--font-jetbrains), monospace",
  fontSize: 10,
  textTransform: "uppercase" as const,
  letterSpacing: "0.2em",
  padding: "8px 10px",
};

export function DeploysChart() {
  return (
    <article className="flex h-full flex-col border border-border bg-[#0a0a0a] p-6 md:p-7">
      <header className="mb-6 flex items-end justify-between gap-4">
        <div className="flex flex-col gap-1.5">
          <span className="f-mono text-[0.55rem] tracking-[0.25em] text-orange">
            / DEPLOYS · 30D
          </span>
          <h3 className="f-anton text-2xl leading-tight md:text-3xl">
            BUILD CADENCE.
          </h3>
        </div>
        <div className="flex gap-4">
          <Legend
            content={
              <ul className="f-mono flex gap-4 text-[0.55rem] tracking-[0.2em] text-muted-foreground">
                <li className="flex items-center gap-2">
                  <span className="inline-block size-2 bg-orange" />
                  SUCCESS
                </li>
                <li className="flex items-center gap-2">
                  <span className="inline-block size-2 bg-destructive" />
                  FAILED
                </li>
              </ul>
            }
          />
        </div>
      </header>
      <div className="flex-1 min-h-[260px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={DEPLOYS_30D} margin={{ top: 4, right: 8, bottom: 0, left: -20 }}>
            <defs>
              <linearGradient id="success-grad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="rgb(255 69 0)" stopOpacity={0.55} />
                <stop offset="100%" stopColor="rgb(255 69 0)" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="failed-grad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="rgb(220 50 50)" stopOpacity={0.45} />
                <stop offset="100%" stopColor="rgb(220 50 50)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid stroke="rgb(38 38 38)" strokeDasharray="2 2" vertical={false} />
            <XAxis
              dataKey="day"
              tick={tickStyle}
              tickLine={false}
              axisLine={false}
              interval={4}
            />
            <YAxis tick={tickStyle} tickLine={false} axisLine={false} width={32} />
            <Tooltip contentStyle={tooltipStyle} cursor={{ stroke: "rgb(255 69 0)", strokeDasharray: "3 3" }} />
            <Area
              type="monotone"
              dataKey="success"
              stroke="rgb(255 69 0)"
              strokeWidth={1.5}
              fill="url(#success-grad)"
            />
            <Area
              type="monotone"
              dataKey="failed"
              stroke="rgb(220 50 50)"
              strokeWidth={1.25}
              fill="url(#failed-grad)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </article>
  );
}

export function StatusDonut() {
  const total = STATUS_DONUT.reduce((sum, s) => sum + s.value, 0);
  return (
    <article className="flex h-full flex-col border border-border bg-[#0a0a0a] p-6 md:p-7">
      <header className="mb-6 flex flex-col gap-1.5">
        <span className="f-mono text-[0.55rem] tracking-[0.25em] text-orange">
          / STATUS · 30D
        </span>
        <h3 className="f-anton text-2xl leading-tight md:text-3xl">
          OUTCOMES.
        </h3>
      </header>
      <div className="relative flex-1 min-h-[260px]">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={STATUS_DONUT}
              dataKey="value"
              innerRadius="60%"
              outerRadius="85%"
              paddingAngle={3}
              stroke="rgb(7 7 7)"
              strokeWidth={3}
            >
              {STATUS_DONUT.map((s) => (
                <Cell key={s.name} fill={s.fill} />
              ))}
            </Pie>
            <Tooltip contentStyle={tooltipStyle} />
          </PieChart>
        </ResponsiveContainer>
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
          <span className="f-anton text-3xl leading-none">{total.toLocaleString()}</span>
          <span className="f-mono mt-1 text-[0.5rem] tracking-[0.25em] text-muted-foreground">
            TOTAL EVENTS
          </span>
        </div>
      </div>
      <ul className="mt-4 flex flex-col gap-2">
        {STATUS_DONUT.map((s) => {
          const pct = ((s.value / total) * 100).toFixed(1);
          return (
            <li
              key={s.name}
              className="f-mono flex items-center justify-between gap-2 text-[0.55rem] tracking-[0.25em]"
            >
              <span className="flex items-center gap-2 text-muted-foreground">
                <span className="inline-block size-2" style={{ background: s.fill }} />
                {s.name}
              </span>
              <span className="text-foreground">{pct}%</span>
            </li>
          );
        })}
      </ul>
    </article>
  );
}
