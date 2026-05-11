import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { PROJECTS, getProject } from "@/data/projects";
import { ProjectDemo } from "@/components/work/project-demo";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export function generateStaticParams() {
  return PROJECTS.map((p) => ({ slug: p.slug }));
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

  const idx = PROJECTS.findIndex((p) => p.slug === slug);
  const prev = PROJECTS[(idx - 1 + PROJECTS.length) % PROJECTS.length];
  const next = PROJECTS[(idx + 1) % PROJECTS.length];

  return (
    <article className="px-5 pt-24 pb-24 md:px-10 md:pt-32 md:pb-32">
      <div className="mx-auto max-w-6xl">
        <Link
          href="/work"
          className="f-mono inline-flex items-center gap-2 text-[0.65rem] text-muted-foreground transition-colors hover:text-orange focus-visible:text-orange active:text-orange"
        >
          <ArrowLeft className="size-3" /> ALL WORK
        </Link>

        <header className="mt-8 flex flex-col gap-6">
          <p className="f-mono text-[0.65rem] text-orange">
            {project.index} / {project.year} / {project.role.toUpperCase()}
          </p>
          <h1 className="f-anton text-[clamp(2.5rem,9vw,8rem)] leading-[0.85]">
            {project.title}
          </h1>
          <p className="max-w-prose text-lg text-muted-foreground md:text-xl">
            {project.tagline}
          </p>
          <div className="flex flex-wrap gap-2 pt-2">
            {project.stack.map((s) => (
              <span
                key={s}
                className="f-mono border border-border px-3 py-1 text-[0.6rem] text-muted-foreground"
              >
                {s}
              </span>
            ))}
          </div>
        </header>

        <section className="mt-12">
          <ProjectDemo demo={project.demo} />
        </section>

        <section className="mt-16 grid gap-12 md:grid-cols-3">
          <div className="md:col-span-2">
            <h2 className="f-mono mb-4 text-[0.65rem] tracking-[0.2em] text-orange">
              / SUMMARY
            </h2>
            <p className="max-w-prose text-base leading-relaxed text-muted-foreground md:text-lg">
              {project.summary}
            </p>
          </div>
          <aside className="flex flex-col gap-8">
            {project.links && project.links.length > 0 && (
              <div>
                <h3 className="f-mono mb-3 text-[0.6rem] tracking-[0.2em] text-orange">
                  / LINKS
                </h3>
                <ul className="space-y-2">
                  {project.links.map((l) => (
                    <li key={l.href}>
                      <Link
                        href={l.href}
                        className="f-mono text-[0.7rem] underline-offset-4 hover:underline focus-visible:underline"
                      >
                        {l.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            <div>
              <h3 className="f-mono mb-3 text-[0.6rem] tracking-[0.2em] text-orange">
                / ROLE
              </h3>
              <p className="text-sm text-muted-foreground">{project.role}</p>
            </div>
            <div>
              <h3 className="f-mono mb-3 text-[0.6rem] tracking-[0.2em] text-orange">
                / YEAR
              </h3>
              <p className="text-sm text-muted-foreground">{project.year}</p>
            </div>
          </aside>
        </section>

        <nav className="mt-24 grid gap-4 md:grid-cols-2">
          <Link
            href={`/work/${prev.slug}`}
            className="group flex flex-col gap-2 border border-border p-6 transition-colors hover:bg-muted focus-visible:bg-muted"
          >
            <span className="f-mono text-[0.6rem] tracking-[0.2em] text-muted-foreground">
              ← {prev.index} / PREV
            </span>
            <span className="f-anton text-2xl group-hover:text-orange">
              {prev.title}
            </span>
          </Link>
          <Link
            href={`/work/${next.slug}`}
            className="group flex flex-col items-end gap-2 border border-border p-6 transition-colors hover:bg-muted focus-visible:bg-muted text-right"
          >
            <span className="f-mono text-[0.6rem] tracking-[0.2em] text-muted-foreground">
              {next.index} / NEXT →
            </span>
            <span className="f-anton text-2xl group-hover:text-orange">
              {next.title}
            </span>
          </Link>
        </nav>
      </div>
    </article>
  );
}
