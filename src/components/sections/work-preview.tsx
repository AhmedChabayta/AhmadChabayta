"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useRef } from "react";
import { useReducedMotion } from "framer-motion";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import { PROJECTS, type Project } from "@/data/projects";
import { SHOTS } from "@/data/shots.generated";
import { Tilt } from "@/components/motion/reveal";
import {
  Badge,
  Container,
  Eyebrow,
  Section,
  SectionHeader,
  Text,
  Title,
} from "@/components/ui";

function ProjectLinkProps(p: Project) {
  if (p.externalUrl) {
    return {
      href: p.externalUrl,
      target: "_blank" as const,
      rel: "noreferrer noopener",
    };
  }
  return { href: p.appHref ?? `/work/${p.slug}` };
}

function status(p: Project): { label: string; dot?: "pulse" | "solid" } {
  if (p.externalUrl) return { label: "LIVE", dot: "pulse" };
  if (p.appHref) return { label: "APP", dot: "solid" };
  return { label: "CASE STUDY" };
}

function ProjectCard({ p }: { p: Project }) {
  const isExternal = Boolean(p.externalUrl);
  const s = status(p);
  return (
    <Link
      {...ProjectLinkProps(p)}
      className="group flex h-full flex-col gap-5 overflow-hidden rounded-sm border border-border/40 bg-card/40 p-7 backdrop-blur-md transition-colors hover:border-orange/40 focus-visible:border-orange/40"
    >
      {SHOTS[p.slug] && (
        <div className="relative -mx-7 -mt-7 mb-1 aspect-[16/10] overflow-hidden border-b border-border">
          <Image
            src={SHOTS[p.slug]}
            alt={`${p.title} — screenshot`}
            fill
            sizes="(min-width:1024px) 50vw, 100vw"
            className="object-cover object-top transition-transform duration-700 group-hover:scale-[1.04]"
          />
          <div
            aria-hidden
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(180deg, transparent 55%, rgb(var(--card)) 100%)",
            }}
          />
        </div>
      )}

      <div className="flex items-start justify-between gap-4">
        <Eyebrow>
          {p.index} / {p.year}
        </Eyebrow>
        {s.dot ? (
          <Badge tone="accent" dot={s.dot}>
            {s.label}
          </Badge>
        ) : (
          <Badge tone="muted">{s.label}</Badge>
        )}
      </div>

      <Title
        as="h3"
        size="card"
        className="transition-colors group-hover:text-orange"
      >
        {p.title}
      </Title>

      <Text variant="body" className="line-clamp-3">
        {p.tagline}
      </Text>

      <div className="mt-auto flex items-end justify-between gap-4 pt-2">
        <div className="flex flex-wrap gap-1.5">
          {p.stack.slice(0, 3).map((t) => (
            <Badge key={t} className="group-hover:border-orange/30">
              {t}
            </Badge>
          ))}
        </div>
        {isExternal ? (
          <ArrowUpRight className="size-5 shrink-0 -translate-x-1 opacity-40 transition-all group-hover:translate-x-0 group-hover:text-orange group-hover:opacity-100" />
        ) : (
          <ArrowRight className="size-5 shrink-0 -translate-x-1 opacity-40 transition-all group-hover:translate-x-0 group-hover:text-orange group-hover:opacity-100" />
        )}
      </div>
    </Link>
  );
}

const HEADER = (
  <SectionHeader
    titleId="work-heading"
    eyebrow="/ 01 — SELECTED WORK"
    title="THE WORK."
    aside={
      <Text variant="mono" className="max-w-[28ch] md:text-right">
        {PROJECTS.length} PROJECTS.
        <br />
        LIVE APPS, DEMOS &amp; CASE STUDIES.
      </Text>
    }
  />
);

/** Accessible / no-JS / reduced-motion fallback: a normal grid. */
function WorkGrid() {
  return (
    <Section id="work" aria-labelledby="work-heading">
      <Container>
        {HEADER}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {PROJECTS.map((p) => (
            <Tilt
              key={p.slug}
              className="group relative h-full overflow-hidden rounded-sm"
            >
              <ProjectCard p={p} />
            </Tilt>
          ))}
        </div>
      </Container>
    </Section>
  );
}

export function WorkPreview() {
  const reduced = useReducedMotion();
  const trackRef = useRef<HTMLDivElement>(null);
  const screenRef = useRef<HTMLDivElement>(null);
  const rowRef = useRef<HTMLDivElement>(null);
  const idxRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (reduced) return;
    const track = trackRef.current;
    const screen = screenRef.current;
    const row = rowRef.current;
    if (!track || !screen || !row) return;
    const n = PROJECTS.length;
    let raf = 0;
    let running = false;

    const place = () => {
      const r = track.getBoundingClientRect();
      const span = r.height - window.innerHeight;
      const prog = span > 0 ? Math.min(1, Math.max(0, -r.top / span)) : 0;
      const af = prog * (n - 1);
      const w = screen.clientWidth;
      row.style.transform = `translate3d(${(-af * w).toFixed(2)}px,0,0)`;
      const kids = row.children;
      for (let i = 0; i < kids.length; i++) {
        const el = kids[i] as HTMLElement;
        const d = Math.abs(i - af);
        const o = Math.max(0, 1 - d * 1.7);
        el.style.opacity = o.toFixed(3);
        el.style.transform = `scale(${(1 - Math.min(d, 1) * 0.07).toFixed(3)})`;
        el.style.pointerEvents = d < 0.5 ? "auto" : "none";
      }
      if (idxRef.current) {
        idxRef.current.textContent = String(
          Math.min(n, Math.round(af) + 1),
        ).padStart(2, "0");
      }
    };

    const tick = () => {
      place();
      running = false;
    };
    const onScroll = () => {
      if (running) return;
      running = true;
      raf = requestAnimationFrame(tick);
    };
    place();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [reduced]);

  if (reduced) return <WorkGrid />;

  return (
    <Section id="work" aria-labelledby="work-heading" pad="none">
      <Container className="px-6 pt-28 md:px-10 md:pt-40">{HEADER}</Container>
      <div
        ref={trackRef}
        className="relative"
        style={{ height: `${PROJECTS.length * 55 + 50}vh` }}
      >
        <div className="sticky top-0 flex h-screen flex-col items-center justify-center gap-5 px-4 md:px-10">
          <div className="flex w-full max-w-[1000px] items-center justify-between px-1">
            <span className="f-mono text-[0.6rem] tracking-[0.25em] text-muted-foreground">
              <span ref={idxRef}>01</span> / {String(PROJECTS.length).padStart(2, "0")}
            </span>
            <span className="f-mono text-[0.6rem] tracking-[0.25em] text-muted-foreground">
              SCROLL ↓
            </span>
          </div>
          <div
            ref={screenRef}
            className="relative aspect-[3/4] w-full max-w-[1000px] overflow-hidden rounded-md sm:aspect-[16/10]"
          >
            <div ref={rowRef} className="absolute inset-0 flex h-full will-change-transform">
              {PROJECTS.map((p) => (
                <div
                  key={p.slug}
                  className="h-full w-full shrink-0 p-3 sm:p-6"
                >
                  <ProjectCard p={p} />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </Section>
  );
}
