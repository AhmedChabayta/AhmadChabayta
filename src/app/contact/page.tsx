import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

export const metadata: Metadata = {
  title: "Contact",
  description: "Get in touch with Ahmad Chabayta.",
};

const LINKS = [
  {
    label: "Email",
    value: "ahmadchabayta@proton.me",
    href: "mailto:ahmadchabayta@proton.me",
  },
  {
    label: "WhatsApp",
    value: "+961 70 687 167",
    href: "https://wa.me/96170687167",
  },
  {
    label: "GitHub",
    value: "@AhmedChabayta",
    href: "https://github.com/AhmedChabayta",
  },
];

export default function ContactPage() {
  return (
    <div className="px-5 pt-24 pb-24 md:px-10 md:pt-32 md:pb-32">
      <div className="mx-auto flex max-w-5xl flex-col gap-16">
        <header className="flex flex-col gap-4">
          <p className="f-mono text-[0.65rem] text-orange">/ CONTACT</p>
          <h1 className="f-anton text-[clamp(3rem,9vw,8rem)] leading-[0.85]">
            LET&apos;S TALK.
          </h1>
          <p className="max-w-prose text-lg text-muted-foreground">
            Best for short projects, full-stack frontend hires, or one-off
            interactive builds. Email lands fastest. WhatsApp also works.
          </p>
        </header>

        <ul className="divide-y divide-border border-y border-border">
          {LINKS.map((l) => (
            <li key={l.href}>
              <Link
                href={l.href}
                className="group grid grid-cols-[auto_1fr_auto] items-center gap-6 py-8 transition-colors hover:bg-muted focus-visible:bg-muted px-2"
              >
                <span className="f-mono text-[0.6rem] tracking-[0.2em] text-orange w-20">
                  {l.label.toUpperCase()}
                </span>
                <span className="f-anton text-2xl transition-colors group-hover:text-orange md:text-4xl">
                  {l.value}
                </span>
                <ArrowUpRight className="size-5 -translate-x-1 opacity-40 transition-all group-hover:translate-x-0 group-hover:opacity-100" />
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
