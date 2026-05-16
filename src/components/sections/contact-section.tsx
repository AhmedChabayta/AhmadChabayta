import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { Container, Eyebrow, Section, Text, Title } from "@/components/ui";

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

export function ContactSection() {
  return (
    <Section id="contact" aria-labelledby="contact-heading">
      <Container>
        <div className="mb-16 flex flex-col gap-5 md:mb-24">
          <Eyebrow>/ 07 — CONTACT</Eyebrow>
          <Title id="contact-heading" size="section">
            LET&apos;S TALK.
          </Title>
          <Text variant="lead" className="max-w-prose">
            Best for short projects, full-stack frontend hires, or one-off
            interactive builds. Email lands fastest. WhatsApp also works.
          </Text>
        </div>

        <ul className="divide-y divide-border border-y border-border">
          {LINKS.map((l) => {
            const external = l.href.startsWith("http");
            return (
              <li key={l.href}>
                <Link
                  href={l.href}
                  {...(external
                    ? { target: "_blank", rel: "noreferrer noopener" }
                    : {})}
                  className="group grid grid-cols-[auto_1fr_auto] items-center gap-6 px-2 py-8 transition-colors hover:bg-muted focus-visible:bg-muted"
                >
                  <span className="f-mono w-20 text-[0.6rem] tracking-[0.2em] text-orange">
                    {l.label.toUpperCase()}
                  </span>
                  <span className="f-anton text-2xl transition-colors group-hover:text-orange md:text-4xl">
                    {l.value}
                  </span>
                  <ArrowUpRight className="size-5 -translate-x-1 opacity-40 transition-all group-hover:translate-x-0 group-hover:opacity-100" />
                </Link>
              </li>
            );
          })}
        </ul>
      </Container>
    </Section>
  );
}
