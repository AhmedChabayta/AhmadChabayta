import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, ArrowUpRight } from "lucide-react";
import { PROJECTS, getProject } from "@/data/projects";
import { ProjectDemo } from "@/components/work/project-demo";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export function generateStaticParams() {
  // Only generate internal case-study pages; external projects redirect.
  return PROJECTS.filter((p) => !p.externalUrl).map((p) => ({ slug: p.slug }));
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
  // If this project is external, send the visitor to the live deployment.
  if (project.externalUrl) redirect(project.externalUrl);

  const internalProjects = PROJECTS.filter((p) => !p.externalUrl);
  const idx = internalProjects.findIndex((p) => p.slug === slug);
  const prev =
    internalProjects[(idx - 1 + internalProjects.length) % internalProjects.length];
  const next = internalProjects[(idx + 1) % internalProjects.length];

  return (
    <article className="px-5 pt-32 pb-32 md:px-10 md:pt-44 md:pb-44">
      <div className="mx-auto max-w-6xl">
        <Link
          href="/work"
          className="f-mono inline-flex items-center gap-2 text-[0.65rem] tracking-[0.25em] text-muted-foreground transition-colors hover:text-orange focus-visible:text-orange active:text-orange"
        >
          <ArrowLeft className="size-3" /> ALL WORK
        </Link>

        <header className="mt-12 flex flex-col gap-8 md:mt-16">
          <p className="f-mono text-[0.65rem] tracking-[0.25em] text-orange">
            {project.index} / {project.year} / {project.role.toUpperCase()}
          </p>
          <h1 className="f-anton text-[clamp(3rem,10vw,10rem)] leading-[0.92]">
            {project.title}
          </h1>
          <p className="max-w-prose text-[1.1rem] leading-[1.7] text-muted-foreground md:text-2xl">
            {project.tagline}
          </p>
          <div className="flex flex-wrap gap-2 pt-4">
            {project.stack.map((s) => (
              <span
                key={s}
                className="f-mono border border-border px-3 py-1.5 text-[0.6rem] tracking-[0.25em] text-muted-foreground"
              >
                {s}
              </span>
            ))}
          </div>
        </header>

        <section className="mt-20 md:mt-28">
          <ProjectDemo demo={project.demo} />
        </section>

        <section className="mt-24 grid gap-16 md:mt-32 md:grid-cols-3">
          <div className="md:col-span-2">
            <h2 className="f-mono mb-6 text-[0.65rem] tracking-[0.25em] text-orange">
              / SUMMARY
            </h2>
            <p className="max-w-prose text-[1.05rem] leading-[1.8] text-muted-foreground md:text-lg">
              {project.summary}
            </p>

            {project.caseStudy && project.caseStudy.length > 0 && (
              <div className="mt-20 flex flex-col gap-16">
                {project.caseStudy.map((section, i) => (
                  <div key={section.heading} className="grid gap-4 md:grid-cols-[80px_1fr] md:gap-10">
                    <span className="f-mono text-[0.6rem] tracking-[0.25em] text-orange">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <div>
                      <h3 className="f-anton mb-4 text-2xl leading-[1.05] md:text-3xl">
                        {section.heading}
                      </h3>
                      <p className="max-w-prose text-[1rem] leading-[1.8] text-muted-foreground md:text-lg">
                        {section.body}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          <aside className="flex flex-col gap-10">
            {project.links && project.links.length > 0 && (
              <div>
                <h3 className="f-mono mb-4 text-[0.6rem] tracking-[0.25em] text-orange">
                  / LINKS
                </h3>
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
              <h3 className="f-mono mb-3 text-[0.6rem] tracking-[0.25em] text-orange">
                / ROLE
              </h3>
              <p className="text-sm leading-relaxed text-muted-foreground">
                {project.role}
              </p>
            </div>
            <div>
              <h3 className="f-mono mb-3 text-[0.6rem] tracking-[0.25em] text-orange">
                / YEAR
              </h3>
              <p className="text-sm text-muted-foreground">{project.year}</p>
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
            <span className="f-anton text-[clamp(1.5rem,3vw,2.5rem)] leading-[1.05] group-hover:text-orange">
              {prev.title}
            </span>
          </Link>
          <Link
            href={`/work/${next.slug}`}
            className="group flex flex-col items-end gap-3 border border-border p-8 text-right transition-all hover:border-orange/40 hover:bg-muted focus-visible:border-orange/40 focus-visible:bg-muted"
          >
            <span className="f-mono text-[0.6rem] tracking-[0.25em] text-muted-foreground">
              {next.index} / NEXT →
            </span>
            <span className="f-anton text-[clamp(1.5rem,3vw,2.5rem)] leading-[1.05] group-hover:text-orange">
              {next.title}
            </span>
          </Link>
        </nav>
      </div>
    </article>
  );
}
