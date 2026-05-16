"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const LINKS = [
  { href: "/", label: "Home" },
  { href: "/work", label: "Work" },
  { href: "/visuals", label: "Visuals" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];

export function Nav() {
  const pathname = usePathname();
  return (
    <nav
      aria-label="Primary navigation"
      className="fixed top-0 left-0 right-0 z-50 mix-blend-difference flex items-center justify-between px-6 pb-5 md:px-10 md:pb-7"
      style={{
        paddingTop: "max(1.5rem, calc(env(safe-area-inset-top) + 0.75rem))",
      }}
    >
      <Link
        href="/"
        className="f-anton text-xl tracking-tight text-white"
        aria-label="Ahmad Chabayta home"
      >
        A.C.
      </Link>
      <ul className="f-mono flex items-center gap-5 md:gap-9 text-[0.6rem] md:text-[0.65rem] text-white">
        {LINKS.slice(1).map(({ href, label }) => {
          const active = pathname === href || pathname.startsWith(href + "/");
          return (
            <li key={href}>
              <Link
                href={href}
                className={cn(
                  "transition-opacity hover:opacity-50 focus-visible:opacity-50 active:opacity-50",
                  active && "text-orange",
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
