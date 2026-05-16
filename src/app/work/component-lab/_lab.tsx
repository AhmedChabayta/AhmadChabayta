"use client";

import { useMemo, useState } from "react";
import { Copy, Check, RotateCcw, Search, ChevronLeft } from "lucide-react";
import Link from "next/link";
import { COMPONENTS, defaultValuesFor, type ComponentDef, type PropDef } from "./_data";
import { cn } from "@/lib/utils";

const CATEGORIES = ["INPUTS", "FEEDBACK", "DATA", "LAYOUT"] as const;

export function ComponentLabApp() {
  const [selectedSlug, setSelectedSlug] = useState(COMPONENTS[0].slug);
  const [filter, setFilter] = useState("");
  const [values, setValues] = useState<Record<string, unknown>>(() =>
    defaultValuesFor(COMPONENTS[0]),
  );
  const [copied, setCopied] = useState(false);

  const selected = useMemo(
    () => COMPONENTS.find((c) => c.slug === selectedSlug) ?? COMPONENTS[0],
    [selectedSlug],
  );

  const grouped = useMemo(() => {
    const q = filter.trim().toLowerCase();
    const map = new Map<string, ComponentDef[]>();
    for (const cat of CATEGORIES) map.set(cat, []);
    for (const c of COMPONENTS) {
      if (q && !c.name.toLowerCase().includes(q)) continue;
      map.get(c.category)?.push(c);
    }
    return map;
  }, [filter]);

  const onSelect = (slug: string) => {
    setSelectedSlug(slug);
    const c = COMPONENTS.find((x) => x.slug === slug);
    if (c) setValues(defaultValuesFor(c));
  };

  const reset = () => setValues(defaultValuesFor(selected));

  const update = (name: string, v: unknown) =>
    setValues((s) => ({ ...s, [name]: v }));

  const code = selected.code(values);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      /* ignore */
    }
  };

  return (
    <div className="grid gap-px bg-border md:grid-cols-[240px_1fr_320px]">
      {/* ─── Sidebar ─── */}
      <aside className="flex flex-col gap-3 bg-[#070707] p-4 md:max-h-[calc(100svh-180px)] md:overflow-auto">
        <div className="flex items-center gap-2 border border-border bg-background/40 px-2.5 py-1.5">
          <Search className="size-3 text-muted-foreground" />
          <input
            type="search"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            placeholder="Filter…"
            className="f-mono w-full bg-transparent text-[0.6rem] tracking-[0.1em] placeholder:text-muted-foreground/60 focus:outline-none"
          />
        </div>
        {CATEGORIES.map((cat) => {
          const items = grouped.get(cat) ?? [];
          if (items.length === 0) return null;
          return (
            <div key={cat} className="flex flex-col gap-1">
              <span className="f-mono px-2 pt-2 text-[0.5rem] tracking-[0.25em] text-muted-foreground/60">
                / {cat}
              </span>
              {items.map((c) => (
                <button
                  key={c.slug}
                  type="button"
                  onClick={() => onSelect(c.slug)}
                  className={cn(
                    "f-mono flex items-center justify-between gap-2 px-3 py-2 text-left text-[0.6rem] tracking-[0.2em] transition-colors",
                    c.slug === selectedSlug
                      ? "bg-orange/10 text-orange"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground",
                  )}
                >
                  {c.name}
                  {c.slug === selectedSlug && (
                    <span className="inline-block size-1.5 rounded-full bg-orange" />
                  )}
                </button>
              ))}
            </div>
          );
        })}
        <Link
          href="/#work"
          className="f-mono group mt-auto inline-flex items-center gap-2 px-3 pt-4 text-[0.55rem] tracking-[0.25em] text-muted-foreground transition-colors hover:text-orange focus-visible:text-orange"
        >
          <ChevronLeft className="size-3 transition-transform group-hover:-translate-x-0.5" />
          BACK TO WORK
        </Link>
      </aside>

      {/* ─── Center: preview + code ─── */}
      <section className="flex min-w-0 flex-col gap-px bg-border">
        <header className="flex items-end justify-between gap-4 bg-[#070707] p-6 md:p-8">
          <div className="flex flex-col gap-1.5">
            <span className="f-mono text-[0.55rem] tracking-[0.25em] text-orange">
              / {selected.category}
            </span>
            <h2 className="f-anton text-3xl leading-tight md:text-4xl">
              {selected.name}.
            </h2>
            <p className="max-w-prose text-[0.85rem] leading-[1.65] text-muted-foreground">
              {selected.description}
            </p>
          </div>
          <div className="hidden md:block">
            <span className="f-mono text-[0.55rem] tracking-[0.25em] text-muted-foreground/70">
              {selected.props.length} PROPS
            </span>
          </div>
        </header>
        <div className="relative flex min-h-[280px] items-center justify-center overflow-auto bg-[#050505] p-10 md:min-h-[360px]">
          <div
            aria-hidden
            className="absolute inset-0 opacity-[0.06]"
            style={{
              backgroundImage:
                "linear-gradient(to right, rgb(255 69 0) 1px, transparent 1px), linear-gradient(to bottom, rgb(255 69 0) 1px, transparent 1px)",
              backgroundSize: "32px 32px",
            }}
          />
          <div className="relative">{selected.render(values)}</div>
          <span className="f-mono absolute bottom-3 left-4 text-[0.5rem] tracking-[0.25em] text-muted-foreground/50">
            PREVIEW
          </span>
        </div>
        <div className="flex flex-col gap-3 bg-[#070707] p-6 md:p-8">
          <div className="flex items-center justify-between gap-4">
            <span className="f-mono text-[0.55rem] tracking-[0.25em] text-orange">
              / JSX
            </span>
            <button
              type="button"
              onClick={copy}
              className="f-mono inline-flex items-center gap-2 border border-orange/60 bg-orange/5 px-3 py-1.5 text-[0.55rem] tracking-[0.25em] text-orange transition-colors hover:bg-orange hover:text-background focus-visible:bg-orange focus-visible:text-background"
            >
              {copied ? <Check className="size-3" /> : <Copy className="size-3" />}
              {copied ? "COPIED" : "COPY"}
            </button>
          </div>
          <pre className="scrollbar-thin overflow-x-auto border border-border bg-background p-4 font-mono text-[0.7rem] leading-[1.7] text-foreground/90">
            <code>{code}</code>
          </pre>
        </div>
      </section>

      {/* ─── Right: controls ─── */}
      <aside className="flex flex-col gap-5 bg-[#070707] p-5 md:max-h-[calc(100svh-180px)] md:overflow-auto md:p-6">
        <div className="flex items-center justify-between gap-2">
          <span className="f-mono text-[0.6rem] tracking-[0.25em] text-orange">
            / CONTROLS
          </span>
          <button
            type="button"
            onClick={reset}
            className="f-mono inline-flex items-center gap-1.5 text-[0.55rem] tracking-[0.2em] text-muted-foreground transition-colors hover:text-orange focus-visible:text-orange"
          >
            <RotateCcw className="size-3" /> RESET
          </button>
        </div>
        <div className="flex flex-col gap-5">
          {selected.props.map((p) => (
            <PropControl
              key={p.name}
              def={p}
              value={values[p.name]}
              onChange={(v) => update(p.name, v)}
            />
          ))}
        </div>
      </aside>
    </div>
  );
}

function PropControl({
  def,
  value,
  onChange,
}: {
  def: PropDef;
  value: unknown;
  onChange: (v: unknown) => void;
}) {
  const t = def.type;
  if (t.kind === "select") {
    return (
      <label className="flex flex-col gap-2">
        <span className="f-mono text-[0.55rem] tracking-[0.25em] text-muted-foreground">
          {def.label}
        </span>
        <div className="flex flex-wrap gap-1.5">
          {t.options.map((opt) => (
            <button
              key={opt}
              type="button"
              onClick={() => onChange(opt)}
              className={cn(
                "f-mono border px-2.5 py-1.5 text-[0.55rem] tracking-[0.18em] transition-colors",
                value === opt
                  ? "border-orange bg-orange text-background"
                  : "border-border text-muted-foreground hover:border-orange/60 hover:text-orange",
              )}
            >
              {opt}
            </button>
          ))}
        </div>
      </label>
    );
  }
  if (t.kind === "boolean") {
    const checked = Boolean(value);
    return (
      <label className="flex items-center justify-between gap-2">
        <span className="f-mono text-[0.55rem] tracking-[0.25em] text-muted-foreground">
          {def.label}
        </span>
        <button
          type="button"
          role="switch"
          aria-checked={checked}
          onClick={() => onChange(!checked)}
          className={cn(
            "relative h-5 w-10 border transition-colors",
            checked ? "border-orange bg-orange/20" : "border-border bg-muted",
          )}
        >
          <span
            className={cn(
              "absolute top-0.5 size-3.5 bg-orange transition-transform",
              checked ? "translate-x-5" : "translate-x-0.5",
            )}
          />
        </button>
      </label>
    );
  }
  if (t.kind === "string") {
    return (
      <label className="flex flex-col gap-2">
        <span className="f-mono text-[0.55rem] tracking-[0.25em] text-muted-foreground">
          {def.label}
        </span>
        <input
          type="text"
          value={String(value ?? "")}
          placeholder={t.placeholder}
          onChange={(e) => onChange(e.target.value)}
          className="f-mono border border-border bg-background px-2.5 py-1.5 text-[0.65rem] text-foreground placeholder:text-muted-foreground/40 outline-none focus:border-orange"
        />
      </label>
    );
  }
  // number
  const n = Number(value ?? t.default);
  return (
    <label className="flex flex-col gap-2">
      <span className="f-mono flex items-center justify-between text-[0.55rem] tracking-[0.25em] text-muted-foreground">
        {def.label}
        <span className="text-foreground">{n}</span>
      </span>
      <input
        type="range"
        min={t.min}
        max={t.max}
        step={t.step}
        value={n}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className="w-full appearance-none bg-transparent accent-orange [&::-webkit-slider-runnable-track]:h-px [&::-webkit-slider-runnable-track]:bg-border [&::-webkit-slider-thumb]:-mt-1.5 [&::-webkit-slider-thumb]:size-3 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:bg-orange"
      />
    </label>
  );
}
