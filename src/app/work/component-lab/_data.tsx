"use client";

import type { ReactNode } from "react";
import { ArrowRight, Check, Mail, Loader2, X, AlertCircle, Bell } from "lucide-react";
import { cn } from "@/lib/utils";

export type PropType =
  | { kind: "select"; options: string[]; default: string }
  | { kind: "boolean"; default: boolean }
  | { kind: "string"; default: string; placeholder?: string }
  | { kind: "number"; min: number; max: number; step: number; default: number };

export interface PropDef {
  name: string;
  label: string;
  type: PropType;
}

export interface ComponentDef {
  slug: string;
  name: string;
  category: "INPUTS" | "FEEDBACK" | "DATA" | "LAYOUT";
  description: string;
  props: PropDef[];
  render: (values: Record<string, unknown>) => ReactNode;
  code: (values: Record<string, unknown>) => string;
}

const formatProp = (name: string, v: unknown): string => {
  if (typeof v === "boolean") return v ? ` ${name}` : "";
  if (typeof v === "string") {
    if (v === "") return "";
    return ` ${name}="${v}"`;
  }
  if (typeof v === "number") return ` ${name}={${v}}`;
  return "";
};

// ───────────────────────── Button
function ButtonShowcase({ variant, size, loading, disabled, icon, label }: { variant: string; size: string; loading: boolean; disabled: boolean; icon: boolean; label: string }) {
  const variants: Record<string, string> = {
    primary: "bg-orange text-background hover:shadow-[0_0_30px_rgba(255,69,0,0.4)]",
    outline: "border border-orange text-orange hover:bg-orange hover:text-background",
    ghost: "text-foreground hover:bg-muted",
    destructive: "bg-destructive text-foreground hover:opacity-90",
  };
  const sizes: Record<string, string> = {
    sm: "px-3 py-1.5 text-[0.65rem]",
    md: "px-5 py-2.5 text-[0.75rem]",
    lg: "px-7 py-3.5 text-[0.85rem]",
  };
  return (
    <button
      type="button"
      disabled={disabled || loading}
      className={cn(
        "f-mono inline-flex items-center gap-2 font-bold uppercase tracking-[0.1em] transition-all disabled:cursor-not-allowed disabled:opacity-40",
        variants[variant],
        sizes[size],
      )}
    >
      {loading && <Loader2 className="size-3.5 animate-spin" />}
      {label}
      {icon && !loading && <ArrowRight className="size-3.5" />}
    </button>
  );
}

// ───────────────────────── Input
function InputShowcase({ size, label, helper, error, placeholder, value }: { size: string; label: string; helper: string; error: boolean; placeholder: string; value: string }) {
  const sizes: Record<string, string> = {
    sm: "px-2.5 py-1.5 text-[0.7rem]",
    md: "px-3 py-2.5 text-sm",
    lg: "px-4 py-3.5 text-base",
  };
  return (
    <label className="flex w-full max-w-xs flex-col gap-1.5">
      {label && (
        <span className="f-mono text-[0.55rem] tracking-[0.25em] text-muted-foreground">
          {label}
        </span>
      )}
      <input
        type="text"
        defaultValue={value}
        placeholder={placeholder}
        className={cn(
          "border bg-background outline-none transition-colors focus:border-orange",
          error ? "border-destructive" : "border-border",
          sizes[size],
        )}
      />
      {helper && (
        <span
          className={cn(
            "f-mono flex items-center gap-1.5 text-[0.55rem] tracking-[0.25em]",
            error ? "text-destructive" : "text-muted-foreground/80",
          )}
        >
          {error && <AlertCircle className="size-3" />}
          {helper}
        </span>
      )}
    </label>
  );
}

// ───────────────────────── Badge
function BadgeShowcase({ variant, size, dot, label }: { variant: string; size: string; dot: boolean; label: string }) {
  const variants: Record<string, string> = {
    success: "border-orange/40 bg-orange/10 text-orange",
    danger: "border-destructive/40 bg-destructive/10 text-destructive",
    neutral: "border-border bg-muted/40 text-muted-foreground",
    outline: "border-foreground/40 text-foreground",
  };
  const sizes: Record<string, string> = {
    sm: "px-2 py-0.5 text-[0.5rem]",
    md: "px-2.5 py-1 text-[0.55rem]",
    lg: "px-3 py-1.5 text-[0.65rem]",
  };
  return (
    <span
      className={cn(
        "f-mono inline-flex items-center gap-1.5 border tracking-[0.25em]",
        variants[variant],
        sizes[size],
      )}
    >
      {dot && <span className="inline-block size-1.5 rounded-full bg-current" />}
      {label}
    </span>
  );
}

// ───────────────────────── Switch
function SwitchShowcase({ size, checked, label }: { size: string; checked: boolean; label: string }) {
  const sizes: Record<string, { track: string; thumb: string; translate: string }> = {
    sm: { track: "h-4 w-8", thumb: "size-2.5", translate: checked ? "translate-x-4" : "translate-x-0.5" },
    md: { track: "h-5 w-10", thumb: "size-3.5", translate: checked ? "translate-x-5" : "translate-x-0.5" },
    lg: { track: "h-6 w-12", thumb: "size-4.5", translate: checked ? "translate-x-6" : "translate-x-0.5" },
  };
  const s = sizes[size];
  return (
    <label className="flex items-center gap-3">
      <span
        role="switch"
        aria-checked={checked}
        className={cn(
          "relative inline-block border transition-colors",
          s.track,
          checked ? "border-orange bg-orange/30" : "border-border bg-muted",
        )}
      >
        <span
          className={cn(
            "absolute top-0.5 bg-orange transition-transform",
            s.thumb,
            s.translate,
          )}
        />
      </span>
      {label && (
        <span className="f-mono text-[0.6rem] tracking-[0.25em] text-foreground">
          {label}
        </span>
      )}
    </label>
  );
}

// ───────────────────────── Card
function CardShowcase({ padding, hover, accent, title, body }: { padding: string; hover: boolean; accent: boolean; title: string; body: string }) {
  const pads: Record<string, string> = { sm: "p-4", md: "p-6", lg: "p-10" };
  return (
    <article
      className={cn(
        "group flex max-w-xs flex-col gap-3 border bg-card transition-all",
        pads[padding],
        accent ? "border-orange/40" : "border-border",
        hover && "hover:border-orange/60 hover:bg-muted",
      )}
    >
      <span className="f-mono text-[0.55rem] tracking-[0.25em] text-orange">
        / CARD
      </span>
      <h3 className="f-anton text-2xl leading-[1.05]">{title}</h3>
      <p className="text-[0.85rem] leading-[1.65] text-muted-foreground">
        {body}
      </p>
    </article>
  );
}

// ───────────────────────── Alert
function AlertShowcase({ variant, label, body, dismissable }: { variant: string; label: string; body: string; dismissable: boolean }) {
  const variants: Record<string, { wrap: string; Icon: typeof Check }> = {
    success: { wrap: "border-orange/40 bg-orange/5 text-orange", Icon: Check },
    danger: { wrap: "border-destructive/40 bg-destructive/5 text-destructive", Icon: AlertCircle },
    info: { wrap: "border-border bg-muted/40 text-foreground", Icon: Bell },
  };
  const { wrap, Icon } = variants[variant];
  return (
    <div
      role="alert"
      className={cn(
        "flex max-w-md items-start gap-3 border p-3.5",
        wrap,
      )}
    >
      <Icon className="size-4 shrink-0" strokeWidth={1.75} />
      <div className="flex flex-col gap-1">
        <span className="f-mono text-[0.6rem] tracking-[0.25em]">{label}</span>
        <p className="text-[0.8rem] leading-[1.55] text-foreground/85">{body}</p>
      </div>
      {dismissable && (
        <button
          type="button"
          aria-label="Dismiss"
          className="ml-auto text-current opacity-60 transition-opacity hover:opacity-100"
        >
          <X className="size-3.5" />
        </button>
      )}
    </div>
  );
}

// ───────────────────────── Avatar
function AvatarShowcase({ size, initials, status }: { size: string; initials: string; status: string }) {
  const sizes: Record<string, string> = {
    sm: "size-8 text-[0.55rem]",
    md: "size-12 text-[0.7rem]",
    lg: "size-16 text-[0.9rem]",
  };
  const statusColors: Record<string, string> = {
    online: "bg-orange",
    away: "bg-yellow-500",
    offline: "bg-muted-foreground",
    none: "",
  };
  return (
    <div className="relative inline-block">
      <span
        className={cn(
          "f-mono inline-flex items-center justify-center border border-orange/40 bg-orange/10 font-bold tracking-[0.1em] text-orange",
          sizes[size],
        )}
      >
        {initials}
      </span>
      {status !== "none" && (
        <span
          className={cn(
            "absolute -bottom-0.5 -right-0.5 block size-3 rounded-full border-2 border-background",
            statusColors[status],
          )}
        />
      )}
    </div>
  );
}

// ───────────────────────── Tabs
function TabsShowcase({ variant }: { variant: string }) {
  const tabs = ["Overview", "Activity", "Settings"];
  if (variant === "underline") {
    return (
      <div className="flex w-full max-w-md gap-6 border-b border-border">
        {tabs.map((t, i) => (
          <span
            key={t}
            className={cn(
              "f-mono cursor-pointer pb-2 text-[0.6rem] tracking-[0.25em] transition-colors",
              i === 0
                ? "border-b-2 border-orange text-orange"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            {t.toUpperCase()}
          </span>
        ))}
      </div>
    );
  }
  return (
    <div className="inline-flex border border-border bg-card p-1">
      {tabs.map((t, i) => (
        <span
          key={t}
          className={cn(
            "f-mono cursor-pointer px-3 py-1.5 text-[0.55rem] tracking-[0.25em] transition-colors",
            i === 0
              ? "bg-orange text-background"
              : "text-muted-foreground hover:text-foreground",
          )}
        >
          {t.toUpperCase()}
        </span>
      ))}
    </div>
  );
}

// ───────────────────────── Stat Card
function StatCardShowcase({ trend, label, value, delta }: { trend: string; label: string; value: string; delta: string }) {
  const isUp = trend === "up";
  return (
    <article className="flex w-56 flex-col gap-3 border border-border bg-card p-5">
      <span className="f-mono text-[0.55rem] tracking-[0.25em] text-muted-foreground">
        {label}
      </span>
      <span className="f-anton text-3xl leading-none">{value}</span>
      <span
        className={cn(
          "f-mono inline-flex items-center gap-1.5 self-start text-[0.55rem] tracking-[0.25em]",
          isUp ? "text-orange" : "text-destructive",
        )}
      >
        <span aria-hidden>{isUp ? "↑" : "↓"}</span>
        {delta}
      </span>
    </article>
  );
}

export const COMPONENTS: ComponentDef[] = [
  {
    slug: "button",
    name: "Button",
    category: "INPUTS",
    description: "The workhorse trigger. 4 variants, 3 sizes, loading + disabled + optional trailing icon.",
    props: [
      { name: "variant", label: "VARIANT", type: { kind: "select", options: ["primary", "outline", "ghost", "destructive"], default: "primary" } },
      { name: "size", label: "SIZE", type: { kind: "select", options: ["sm", "md", "lg"], default: "md" } },
      { name: "loading", label: "LOADING", type: { kind: "boolean", default: false } },
      { name: "disabled", label: "DISABLED", type: { kind: "boolean", default: false } },
      { name: "icon", label: "WITH ICON", type: { kind: "boolean", default: true } },
      { name: "label", label: "LABEL", type: { kind: "string", default: "Get in touch", placeholder: "Button label" } },
    ],
    render: (v) =>
      ButtonShowcase(v as Parameters<typeof ButtonShowcase>[0]),
    code: (v) => {
      const variant = v.variant as string;
      const size = v.size as string;
      const props =
        formatProp("variant", variant) +
        formatProp("size", size) +
        formatProp("loading", v.loading) +
        formatProp("disabled", v.disabled) +
        (v.icon ? " trailingIcon={<ArrowRight />}" : "");
      return `<Button${props}>\n  ${v.label}\n</Button>`;
    },
  },
  {
    slug: "input",
    name: "Input",
    category: "INPUTS",
    description: "Text input with optional label, helper text, error state and three sizes.",
    props: [
      { name: "size", label: "SIZE", type: { kind: "select", options: ["sm", "md", "lg"], default: "md" } },
      { name: "label", label: "LABEL", type: { kind: "string", default: "Email", placeholder: "Field label" } },
      { name: "placeholder", label: "PLACEHOLDER", type: { kind: "string", default: "you@email.com", placeholder: "Placeholder" } },
      { name: "value", label: "VALUE", type: { kind: "string", default: "" } },
      { name: "helper", label: "HELPER", type: { kind: "string", default: "We'll never share it.", placeholder: "Helper text" } },
      { name: "error", label: "ERROR", type: { kind: "boolean", default: false } },
    ],
    render: (v) => InputShowcase(v as Parameters<typeof InputShowcase>[0]),
    code: (v) => {
      const props =
        formatProp("label", v.label) +
        formatProp("placeholder", v.placeholder) +
        formatProp("value", v.value) +
        formatProp("helper", v.helper) +
        formatProp("size", v.size) +
        formatProp("error", v.error);
      return `<Input${props} />`;
    },
  },
  {
    slug: "badge",
    name: "Badge",
    category: "DATA",
    description: "Tiny status pill. 4 variants, 3 sizes, optional dot indicator.",
    props: [
      { name: "variant", label: "VARIANT", type: { kind: "select", options: ["success", "danger", "neutral", "outline"], default: "success" } },
      { name: "size", label: "SIZE", type: { kind: "select", options: ["sm", "md", "lg"], default: "md" } },
      { name: "dot", label: "DOT", type: { kind: "boolean", default: true } },
      { name: "label", label: "LABEL", type: { kind: "string", default: "LIVE", placeholder: "Badge text" } },
    ],
    render: (v) => BadgeShowcase(v as Parameters<typeof BadgeShowcase>[0]),
    code: (v) => {
      const props =
        formatProp("variant", v.variant) +
        formatProp("size", v.size) +
        formatProp("dot", v.dot);
      return `<Badge${props}>${v.label}</Badge>`;
    },
  },
  {
    slug: "switch",
    name: "Switch",
    category: "INPUTS",
    description: "Boolean toggle. 3 sizes, optional label.",
    props: [
      { name: "size", label: "SIZE", type: { kind: "select", options: ["sm", "md", "lg"], default: "md" } },
      { name: "checked", label: "CHECKED", type: { kind: "boolean", default: true } },
      { name: "label", label: "LABEL", type: { kind: "string", default: "Notifications" } },
    ],
    render: (v) => SwitchShowcase(v as Parameters<typeof SwitchShowcase>[0]),
    code: (v) => {
      const props =
        formatProp("size", v.size) +
        formatProp("checked", v.checked) +
        formatProp("label", v.label);
      return `<Switch${props} />`;
    },
  },
  {
    slug: "card",
    name: "Card",
    category: "LAYOUT",
    description: "Bordered container. Padding scale, optional hover state and orange accent.",
    props: [
      { name: "padding", label: "PADDING", type: { kind: "select", options: ["sm", "md", "lg"], default: "md" } },
      { name: "hover", label: "HOVER", type: { kind: "boolean", default: true } },
      { name: "accent", label: "ACCENT", type: { kind: "boolean", default: false } },
      { name: "title", label: "TITLE", type: { kind: "string", default: "Project alpha" } },
      { name: "body", label: "BODY", type: { kind: "string", default: "A short, plainspoken description of what the card represents." } },
    ],
    render: (v) => CardShowcase(v as Parameters<typeof CardShowcase>[0]),
    code: (v) => {
      const props =
        formatProp("padding", v.padding) +
        formatProp("hover", v.hover) +
        formatProp("accent", v.accent);
      return `<Card${props}>\n  <CardTitle>${v.title}</CardTitle>\n  <CardBody>\n    ${v.body}\n  </CardBody>\n</Card>`;
    },
  },
  {
    slug: "alert",
    name: "Alert",
    category: "FEEDBACK",
    description: "Inline message. 3 variants, optional dismiss control.",
    props: [
      { name: "variant", label: "VARIANT", type: { kind: "select", options: ["success", "danger", "info"], default: "success" } },
      { name: "label", label: "LABEL", type: { kind: "string", default: "DEPLOY SUCCEEDED" } },
      { name: "body", label: "BODY", type: { kind: "string", default: "Your build finished in 42 seconds." } },
      { name: "dismissable", label: "DISMISSABLE", type: { kind: "boolean", default: true } },
    ],
    render: (v) => AlertShowcase(v as Parameters<typeof AlertShowcase>[0]),
    code: (v) => {
      const props =
        formatProp("variant", v.variant) +
        formatProp("dismissable", v.dismissable);
      return `<Alert${props}>\n  <AlertTitle>${v.label}</AlertTitle>\n  <AlertBody>${v.body}</AlertBody>\n</Alert>`;
    },
  },
  {
    slug: "avatar",
    name: "Avatar",
    category: "DATA",
    description: "Identity badge with initials and optional status dot.",
    props: [
      { name: "size", label: "SIZE", type: { kind: "select", options: ["sm", "md", "lg"], default: "md" } },
      { name: "initials", label: "INITIALS", type: { kind: "string", default: "AC" } },
      { name: "status", label: "STATUS", type: { kind: "select", options: ["online", "away", "offline", "none"], default: "online" } },
    ],
    render: (v) => AvatarShowcase(v as Parameters<typeof AvatarShowcase>[0]),
    code: (v) => {
      const props =
        formatProp("initials", v.initials) +
        formatProp("size", v.size) +
        formatProp("status", v.status);
      return `<Avatar${props} />`;
    },
  },
  {
    slug: "tabs",
    name: "Tabs",
    category: "LAYOUT",
    description: "Section switcher. Two stylistic variants.",
    props: [
      { name: "variant", label: "VARIANT", type: { kind: "select", options: ["underline", "filled"], default: "underline" } },
    ],
    render: (v) => TabsShowcase(v as Parameters<typeof TabsShowcase>[0]),
    code: (v) =>
      `<Tabs${formatProp("variant", v.variant)} defaultValue="overview">\n  <Tab value="overview">Overview</Tab>\n  <Tab value="activity">Activity</Tab>\n  <Tab value="settings">Settings</Tab>\n</Tabs>`,
  },
  {
    slug: "stat-card",
    name: "Stat Card",
    category: "DATA",
    description: "KPI block with a labeled value and signed delta.",
    props: [
      { name: "label", label: "LABEL", type: { kind: "string", default: "MONTHLY DEPLOYS" } },
      { name: "value", label: "VALUE", type: { kind: "string", default: "47" } },
      { name: "delta", label: "DELTA", type: { kind: "string", default: "12.4%" } },
      { name: "trend", label: "TREND", type: { kind: "select", options: ["up", "down"], default: "up" } },
    ],
    render: (v) => StatCardShowcase(v as Parameters<typeof StatCardShowcase>[0]),
    code: (v) => {
      const props =
        formatProp("label", v.label) +
        formatProp("value", v.value) +
        formatProp("delta", v.delta) +
        formatProp("trend", v.trend);
      return `<StatCard${props} />`;
    },
  },
];

export function defaultValuesFor(c: ComponentDef): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const p of c.props) {
    out[p.name] = p.type.default;
  }
  return out;
}

// Re-export icon for use by the lab's preview frame.
export { Mail, ArrowRight };
