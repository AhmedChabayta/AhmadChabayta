"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

const SECTIONS = [
  { id: "work", label: "Work" },
  { id: "visuals", label: "Visuals" },
  { id: "about", label: "About" },
  { id: "contact", label: "Contact" },
];

export function Nav() {
  const pathname = usePathname();
  const onHome = pathname === "/";
  const [active, setActive] = useState<string | null>(null);

  useEffect(() => {
    if (!onHome) return;
    const els = SECTIONS.map((s) => document.getElementById(s.id)).filter(
      (el): el is HTMLElement => el !== null,
    );
    const obs = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (visible) setActive(visible.target.id);
      },
      { rootMargin: "-45% 0px -45% 0px", threshold: [0, 0.25, 0.5, 1] },
    );
    els.forEach((el) => obs.observe(el));
    return () => obs.disconnect();
  }, [onHome]);

  function go(e: React.MouseEvent, id: string) {
    if (!onHome) return; // let <Link> route to "/#id"
    e.preventDefault();
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
    history.replaceState(null, "", `/#${id}`);
  }

  function home(e: React.MouseEvent) {
    if (!onHome) return;
    e.preventDefault();
    window.scrollTo({ top: 0, behavior: "smooth" });
    history.replaceState(null, "", "/");
  }

  return (
    <nav
      aria-label="Primary navigation"
      className="fixed top-0 right-0 left-0 z-50 flex items-center justify-between px-6 pb-5 mix-blend-difference md:px-10 md:pb-7"
      style={{
        paddingTop: "max(1.5rem, calc(env(safe-area-inset-top) + 0.75rem))",
      }}
    >
      <Link
        href="/"
        onClick={home}
        className="f-anton text-xl tracking-tight text-white"
        aria-label="Ahmad Chabayta home"
      >
        A.C.
      </Link>
      <ul className="f-mono flex items-center gap-5 text-[0.6rem] text-white md:gap-9 md:text-[0.65rem]">
        {SECTIONS.map(({ id, label }) => {
          const current = onHome && active === id;
          return (
            <li key={id}>
              <Link
                href={`/#${id}`}
                onClick={(e) => go(e, id)}
                aria-current={current ? "true" : undefined}
                className={cn(
                  "transition-opacity hover:opacity-50 focus-visible:opacity-50 active:opacity-50",
                  current && "text-orange",
                )}
              >
                {label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
