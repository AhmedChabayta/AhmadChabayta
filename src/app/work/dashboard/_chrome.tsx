"use client";

import { useState, useEffect } from "react";
import {
  LayoutGrid,
  FolderGit2,
  Activity,
  ScrollText,
  Settings,
  Bell,
  Search,
  Menu,
  X,
  ChevronLeft,
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

const NAV = [
  { icon: LayoutGrid, label: "OVERVIEW", active: true },
  { icon: FolderGit2, label: "PROJECTS" },
  { icon: Activity, label: "BUILDS" },
  { icon: ScrollText, label: "LOGS" },
  { icon: Settings, label: "SETTINGS" },
];

export function DashboardSidebar({ onClose }: { onClose?: () => void }) {
  return (
    <aside className="flex h-full w-64 shrink-0 flex-col border-r border-border bg-[#070707]">
      <div className="flex items-center justify-between border-b border-border px-5 py-5">
        <div className="flex items-center gap-2.5">
          <span className="inline-block size-3 rotate-45 bg-orange" />
          <span className="f-anton text-sm tracking-[0.05em]">PROJECT ATLAS</span>
        </div>
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="-m-2 p-2 text-muted-foreground transition-colors hover:text-orange md:hidden"
            aria-label="Close sidebar"
          >
            <X className="size-4" />
          </button>
        )}
      </div>

      <nav className="flex flex-1 flex-col gap-1 p-3">
        <span className="f-mono px-3 pb-2 pt-3 text-[0.5rem] tracking-[0.25em] text-muted-foreground/60">
          / WORKSPACE
        </span>
        {NAV.map(({ icon: Icon, label, active }) => (
          <button
            key={label}
            type="button"
            className={cn(
              "f-mono group flex items-center gap-3 px-3 py-3 text-left text-[0.6rem] tracking-[0.25em] transition-colors",
              active
                ? "bg-orange/10 text-orange"
                : "text-muted-foreground hover:bg-muted hover:text-foreground",
            )}
          >
            <Icon className="size-4" strokeWidth={1.5} />
            {label}
            {active && (
              <span className="ml-auto inline-block size-1.5 rounded-full bg-orange" />
            )}
          </button>
        ))}
      </nav>

      <div className="border-t border-border p-4">
        <Link
          href="/work"
          className="f-mono group flex items-center gap-2 text-[0.55rem] tracking-[0.25em] text-muted-foreground transition-colors hover:text-orange focus-visible:text-orange"
        >
          <ChevronLeft className="size-3 transition-transform group-hover:-translate-x-0.5" />
          BACK TO WORK
        </Link>
      </div>

      <div className="flex items-center gap-3 border-t border-border px-4 py-4">
        <div className="flex size-9 items-center justify-center border border-orange/40 bg-orange/10 text-[0.6rem] font-bold text-orange">
          AC
        </div>
        <div className="flex flex-col leading-tight">
          <span className="f-mono text-[0.6rem] tracking-[0.2em]">A. CHABAYTA</span>
          <span className="f-mono text-[0.5rem] tracking-[0.25em] text-muted-foreground">
            OWNER · ONLINE
          </span>
        </div>
      </div>
    </aside>
  );
}

export function DashboardTopbar({ onOpenSidebar }: { onOpenSidebar: () => void }) {
  return (
    <header className="sticky top-[68px] z-30 flex w-full items-center gap-3 border-b border-border bg-[#070707]/95 px-4 py-3 backdrop-blur md:top-[88px] md:gap-6 md:px-8 md:py-4">
      <button
        type="button"
        onClick={onOpenSidebar}
        className="-m-2 inline-flex size-11 items-center justify-center text-muted-foreground transition-colors hover:text-foreground md:hidden"
        aria-label="Open sidebar"
      >
        <Menu className="size-5" />
      </button>

      <div className="flex min-w-0 flex-1 flex-col gap-0.5">
        <span className="f-mono truncate text-[0.5rem] tracking-[0.25em] text-muted-foreground/70 md:text-[0.55rem]">
          WORKSPACE / OVERVIEW
        </span>
        <h1 className="f-anton truncate text-xl leading-none md:text-3xl">
          DASHBOARD.
        </h1>
      </div>

      <div className="hidden flex-1 items-center justify-center md:flex">
        <div className="flex w-full max-w-md items-center gap-2 border border-border bg-background/40 px-3 py-2">
          <Search className="size-3.5 text-muted-foreground" strokeWidth={1.5} />
          <input
            type="search"
            placeholder="Search deploys, commits, projects…"
            className="f-mono w-full bg-transparent text-[0.65rem] tracking-[0.1em] placeholder:text-muted-foreground/60 focus:outline-none"
          />
          <kbd className="f-mono border border-border px-1.5 py-0.5 text-[0.5rem] tracking-[0.2em] text-muted-foreground">
            ⌘K
          </kbd>
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-2 md:gap-3">
        <div className="hidden items-center gap-2 border border-orange/30 bg-orange/10 px-3 py-1.5 md:flex">
          <span className="inline-block size-1.5 animate-pulse rounded-full bg-orange" />
          <span className="f-mono text-[0.55rem] tracking-[0.25em] text-orange">
            LIVE
          </span>
        </div>
        <button
          type="button"
          aria-label="Notifications"
          className="relative inline-flex size-10 items-center justify-center border border-border text-muted-foreground transition-colors hover:border-orange hover:text-orange md:size-9"
        >
          <Bell className="size-4 md:size-3.5" strokeWidth={1.5} />
          <span className="absolute right-1.5 top-1.5 size-1.5 rounded-full bg-orange" />
        </button>
      </div>
    </header>
  );
}

export function DashboardShell({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);

  // Lock body scroll while drawer is open
  useEffect(() => {
    if (open) {
      const prev = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = prev;
      };
    }
  }, [open]);

  return (
    <div className="flex w-full">
      {/* Desktop sidebar */}
      <div className="hidden md:flex md:shrink-0">
        <DashboardSidebar />
      </div>

      {/* Mobile sidebar drawer */}
      <div
        className={cn(
          "fixed inset-0 z-50 md:hidden",
          "transition-[visibility,opacity]",
          open ? "visible opacity-100" : "invisible opacity-0",
        )}
        aria-hidden={!open}
      >
        <button
          type="button"
          className="absolute inset-0 bg-black/70 backdrop-blur"
          onClick={() => setOpen(false)}
          aria-label="Close sidebar overlay"
        />
        <div
          className={cn(
            "relative z-10 h-full",
            "transition-transform duration-300 ease-out",
            open ? "translate-x-0" : "-translate-x-full",
          )}
        >
          <DashboardSidebar onClose={() => setOpen(false)} />
        </div>
      </div>

      <div className="flex min-w-0 flex-1 flex-col">
        <DashboardTopbar onOpenSidebar={() => setOpen(true)} />
        <div className="min-w-0 flex-1">{children}</div>
      </div>
    </div>
  );
}
