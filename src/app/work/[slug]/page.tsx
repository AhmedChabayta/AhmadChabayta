import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, ArrowUpRight } from "lucide-react";
import { PROJECTS, getProject } from "@/data/projects";
import { ProjectDemo } from "@/components/work/project-demo";
import { Badge, Eyebrow, Text, Title } from "@/components/ui";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export function generateStaticParams() {
  // Only generate case-study pages for projects that aren't an external link
  // or a dedicated full-page app.
  return PROJECTS.filter((p) => !p.externalUrl && !p.appHref).map((p) => ({
    slug: p.slug,
  }));
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const p = getProject(slug);
  if (!p) return {};
  return {
    title: p.title,
    description: p.tagline,
    openGraph: {
      title: `${p.title} · Ahmad Chabayta`,
      description: p.tagline,
    },
  };
}

export default async function ProjectPage({ params }: PageProps) {
  const { slug } = await params;
  const project = getProject(slug);
  if (!project) notFound();
  if (project.externalUrl) redirect(project.externalUrl);
  if (project.appHref) redirect(project.appHref);

  const caseStudyProjects = PROJECTS.filter((p) => !p.externalUrl && !p.appHref);
  const idx = caseStudyProjects.findIndex((p) => p.slug === slug);
  const prev =
    caseStudyProjects[(idx - 1 + caseStudyProjects.length) % caseStudyProjects.length];
  const next = caseStudyProjects[(idx + 1) % caseStudyProjects.length];

  return (
    <article className="px-5 pt-32 pb-32 md:px-10 md:pt-44 md:pb-44">
      <div className="mx-auto max-w-6xl">
        <Link
          href="/#work"
          className="f-mono inline-flex items-center gap-2 text-[0.65rem] tracking-[0.25em] text-muted-foreground transition-colors hover:text-orange focus-visible:text-orange active:text-orange"
        >
          <ArrowLeft className="size-3" /> ALL WORK
        </Link>

        <header className="mt-12 flex flex-col gap-8 md:mt-16">
          <Eyebrow>
            {project.index} / {project.year} / {project.role.toUpperCase()}
          </Eyebrow>
          <Title as="h1" size="display">
            {project.title}
          </Title>
          <Text variant="lead" className="max-w-prose md:text-2xl">
            {project.tagline}
          </Text>
          <div className="flex flex-wrap gap-2 pt-4">
            {project.stack.map((s) => (
              <Badge key={s}>{s}</Badge>
            ))}
          </div>
        </header>

        <section className="mt-20 md:mt-28">
          <ProjectDemo demo={project.demo} />
        </section>

        <section className="mt-24 grid gap-16 md:mt-32 md:grid-cols-3">
          <div className="md:col-span-2">
            <Eyebrow className="mb-6">/ SUMMARY</Eyebrow>
            <Text variant="lead" className="max-w-prose">
              {project.summary}
            </Text>
          </div>
          <aside className="flex flex-col gap-10">
            {project.links && project.links.length > 0 && (
              <div>
                <Eyebrow className="mb-4">/ LINKS</Eyebrow>
                <ul className="space-y-3">
                  {project.links.map((l) => (
                    <li key={l.href}>
                      <Link
                        href={l.href}
                        className="f-mono inline-flex items-center gap-2 text-[0.7rem] tracking-[0.2em] underline-offset-4 hover:underline focus-visible:underline"
                      >
                        {l.label}
                        <ArrowUpRight className="size-3" />
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            <div>
              <Eyebrow className="mb-3">/ ROLE</Eyebrow>
              <Text variant="body" className="text-sm leading-relaxed">
                {project.role}
              </Text>
            </div>
            <div>
              <Eyebrow className="mb-3">/ YEAR</Eyebrow>
              <Text variant="body" className="text-sm">
                {project.year}
              </Text>
            </div>
          </aside>
        </section>

        <nav className="mt-32 grid gap-6 md:grid-cols-2">
          <Link
            href={`/work/${prev.slug}`}
            className="group flex flex-col gap-3 border border-border p-8 transition-all hover:border-orange/40 hover:bg-muted focus-visible:border-orange/40 focus-visible:bg-muted"
          >
            <span className="f-mono text-[0.6rem] tracking-[0.25em] text-muted-foreground">
              ← {prev.index} / PREV
            </span>
            <Title
              as="h2"
              size="project"
              className="group-hover:text-orange"
            >
              {prev.title}
            </Title>
          </Link>
          <Link
            href={`/work/${next.slug}`}
            className="group flex flex-col items-end gap-3 border border-border p-8 text-right transition-all hover:border-orange/40 hover:bg-muted focus-visible:border-orange/40 focus-visible:bg-muted"
          >
            <span className="f-mono text-[0.6rem] tracking-[0.25em] text-muted-foreground">
              {next.index} / NEXT →
            </span>
            <Title
              as="h2"
              size="project"
              className="group-hover:text-orange"
            >
              {next.title}
            </Title>
          </Link>
        </nav>
      </div>
    </article>
  );
}
