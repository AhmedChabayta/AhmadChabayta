"use client";

import { useEffect, useMemo, useState } from "react";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

interface CommitPoint {
  day: string;
  commits: number;
  additions: number;
  deletions: number;
}

interface LanguagePoint {
  name: string;
  value: number;
}

function syntheticCommits(seed = 0): CommitPoint[] {
  const out: CommitPoint[] = [];
  const days = 30;
  const rng = (n: number) => Math.abs(Math.sin(seed + n) * 9301 + 49297) % 1;
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const wkBoost = d.getDay() >= 1 && d.getDay() <= 5 ? 2 : 0.5;
    const commits = Math.max(0, Math.round(rng(i) * 8 * wkBoost));
    out.push({
      day: d.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      commits,
      additions: commits * Math.round(40 + rng(i + 1) * 200),
      deletions: commits * Math.round(10 + rng(i + 2) * 80),
    });
  }
  return out;
}

function syntheticLanguages(): LanguagePoint[] {
  return [
    { name: "TypeScript", value: 62 },
    { name: "GLSL", value: 14 },
    { name: "Python", value: 11 },
    { name: "CSS", value: 8 },
    { name: "Shell", value: 5 },
  ];
}

export function GitPulse() {
  const [seed, setSeed] = useState(1);
  const data = useMemo(() => syntheticCommits(seed), [seed]);
  const languages = useMemo(() => syntheticLanguages(), []);

  const totalCommits = data.reduce((a, b) => a + b.commits, 0);
  const totalAdditions = data.reduce((a, b) => a + b.additions, 0);
  const totalDeletions = data.reduce((a, b) => a + b.deletions, 0);

  useEffect(() => {
    const id = window.setInterval(() => setSeed((s) => s + 1), 6000);
    return () => window.clearInterval(id);
  }, []);

  return (
    <div className="flex flex-col gap-6 border border-border bg-card p-5 md:p-8">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="f-mono text-[0.6rem] tracking-[0.2em] text-orange">
            / SYNTHETIC FEED · LIVE-LOOKING
          </p>
          <h3 className="f-anton mt-1 text-3xl">GIT PULSE</h3>
        </div>
        <button
          type="button"
          onClick={() => setSeed((s) => s + 1)}
          className="f-mono border border-orange/60 px-3 py-2 text-[0.6rem] tracking-[0.2em] text-orange transition-colors hover:bg-orange hover:text-background focus-visible:bg-orange focus-visible:text-background"
        >
          REGENERATE
        </button>
      </header>

      <div className="grid gap-4 md:grid-cols-3">
        <Stat label="COMMITS · 30d" value={totalCommits.toString()} />
        <Stat
          label="ADDITIONS"
          value={`+${totalAdditions.toLocaleString()}`}
          tone="positive"
        />
        <Stat
          label="DELETIONS"
          value={`−${totalDeletions.toLocaleString()}`}
          tone="negative"
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <p className="f-mono mb-3 text-[0.6rem] tracking-[0.2em] text-muted-foreground">
            / COMMITS · LAST 30 DAYS
          </p>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={data} margin={{ top: 6, right: 8, left: -16, bottom: 0 }}>
              <defs>
                <linearGradient id="commit-grad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="rgb(255 69 0)" stopOpacity={0.6} />
                  <stop offset="100%" stopColor="rgb(255 69 0)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke="rgb(38 38 38)" strokeDasharray="3 3" />
              <XAxis
                dataKey="day"
                tick={{ fill: "rgb(163 163 163)", fontSize: 9 }}
                tickLine={false}
                axisLine={{ stroke: "rgb(38 38 38)" }}
                interval={3}
              />
              <YAxis
                tick={{ fill: "rgb(163 163 163)", fontSize: 9 }}
                tickLine={false}
                axisLine={{ stroke: "rgb(38 38 38)" }}
                width={28}
              />
              <Tooltip
                contentStyle={{
                  background: "rgb(10 10 10)",
                  border: "1px solid rgb(38 38 38)",
                  fontFamily: "var(--font-jetbrains)",
                  fontSize: "0.65rem",
                }}
                cursor={{ stroke: "rgb(255 69 0)", strokeOpacity: 0.4 }}
                labelStyle={{ color: "rgb(255 69 0)" }}
              />
              <Area
                type="monotone"
                dataKey="commits"
                stroke="rgb(255 69 0)"
                strokeWidth={2}
                fill="url(#commit-grad)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div>
          <p className="f-mono mb-3 text-[0.6rem] tracking-[0.2em] text-muted-foreground">
            / LANGUAGES
          </p>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart
              data={languages}
              layout="vertical"
              margin={{ top: 6, right: 16, left: 0, bottom: 0 }}
            >
              <CartesianGrid stroke="rgb(38 38 38)" strokeDasharray="3 3" horizontal={false} />
              <XAxis type="number" hide />
              <YAxis
                type="category"
                dataKey="name"
                tick={{ fill: "rgb(163 163 163)", fontSize: 9 }}
                tickLine={false}
                axisLine={false}
                width={80}
              />
              <Tooltip
                contentStyle={{
                  background: "rgb(10 10 10)",
                  border: "1px solid rgb(38 38 38)",
                  fontFamily: "var(--font-jetbrains)",
                  fontSize: "0.65rem",
                }}
                cursor={{ fill: "rgba(255,69,0,0.08)" }}
              />
              <Bar dataKey="value" fill="rgb(255 69 0)" radius={[0, 2, 2, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

function Stat({
  label,
  value,
  tone = "neutral",
}: {
  label: string;
  value: string;
  tone?: "positive" | "negative" | "neutral";
}) {
  const toneColor =
    tone === "positive"
      ? "text-emerald-400"
      : tone === "negative"
        ? "text-rose-400"
        : "text-foreground";
  return (
    <div className="border border-border bg-background p-4">
      <p className="f-mono text-[0.55rem] tracking-[0.2em] text-muted-foreground">
        {label}
      </p>
      <p className={`f-anton mt-2 text-3xl ${toneColor}`}>{value}</p>
    </div>
  );
}
