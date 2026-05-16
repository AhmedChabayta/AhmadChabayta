import type { Metadata } from "next";
import Link from "next/link";
import { PROJECTS } from "@/data/projects";
import { ArrowUpRight, ArrowRight } from "lucide-react";
import { Badge, Container, Eyebrow, Text, Title } from "@/components/ui";

export const metadata: Metadata = {
  title: "Work",
  description:
    "Selected projects — live apps, interactive demos, GLSL experiments, data dashboards.",
};

export default function WorkIndexPage() {
  return (
    <div className="px-5 pt-32 pb-32 md:px-10 md:pt-44 md:pb-44">
      <Container>
        <header className="mb-20 flex flex-col gap-6 md:mb-28">
          <Eyebrow>/ INDEX · {PROJECTS.length} PROJECTS</Eyebrow>
          <Title as="h1" size="display">
            WORK.
          </Title>
          <Text variant="lead" className="mt-4 max-w-prose">
            Live deployments, interactive demos, and case studies. External
            projects open in a new tab — internal ones unfold into their own
            page.
          </Text>
        </header>

        <ul className="divide-y divide-border border-y border-border">
          {PROJECTS.map((p) => {
            const isExternal = Boolean(p.externalUrl);
            const linkProps = isExternal
              ? {
                  href: p.externalUrl!,
                  target: "_blank" as const,
                  rel: "noreferrer noopener",
                }
              : { href: p.appHref ?? `/work/${p.slug}` };
            const isApp = Boolean(p.appHref);
            return (
              <li key={p.slug}>
                <Link
                  {...linkProps}
                  className="group grid grid-cols-12 items-center gap-4 px-2 py-10 transition-colors hover:bg-muted focus-visible:bg-muted md:py-12"
                >
                  <span className="f-mono col-span-2 text-[0.6rem] tracking-[0.25em] text-muted-foreground md:col-span-1">
                    {p.index}
                  </span>
                  <Title
                    as="h2"
                    size="project"
                    className="col-span-8 transition-colors group-hover:text-orange md:col-span-5"
                  >
                    {p.title}
                  </Title>
                  <span className="f-mono col-span-12 order-3 text-[0.6rem] tracking-[0.25em] text-muted-foreground md:order-none md:col-span-3">
                    {p.role.toUpperCase()}
                  </span>
                  <span className="col-span-2 hidden md:inline">
                    {isExternal ? (
                      <Badge tone="accent" dot="pulse">
                        LIVE
                      </Badge>
                    ) : isApp ? (
                      <Badge tone="accent" dot="solid">
                        APP
                      </Badge>
                    ) : (
                      <Badge tone="muted">CASE STUDY</Badge>
                    )}
                  </span>
                  <span className="col-span-2 flex items-center justify-end gap-3 md:col-span-1">
                    <span className="f-mono hidden text-[0.55rem] tracking-[0.25em] text-muted-foreground md:inline">
                      {p.year}
                    </span>
                    {isExternal ? (
                      <ArrowUpRight className="size-4 -translate-x-2 opacity-0 transition-all group-hover:translate-x-0 group-hover:opacity-100 group-hover:text-orange" />
                    ) : (
                      <ArrowRight className="size-4 -translate-x-2 opacity-0 transition-all group-hover:translate-x-0 group-hover:opacity-100 group-hover:text-orange" />
                    )}
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      </Container>
    </div>
  );
}
