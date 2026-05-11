import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t border-border bg-background px-5 py-16 md:px-10 md:py-20">
      <div className="mx-auto max-w-7xl grid gap-12 md:grid-cols-2">
        <div className="flex flex-col gap-6">
          <Link
            href="mailto:ahmadchabayta@proton.me"
            className="f-anton text-3xl md:text-5xl transition-colors hover:text-orange focus-visible:text-orange active:text-orange"
          >
            ahmadchabayta@proton.me
          </Link>
          <Link
            href="https://wa.me/96170687167"
            className="f-anton text-3xl md:text-5xl transition-colors hover:text-orange focus-visible:text-orange active:text-orange"
          >
            +961 70 687 167
          </Link>
          <div className="f-mono flex gap-8 text-[0.7rem] font-semibold">
            <Link
              href="https://github.com/AhmedChabayta"
              className="transition-opacity hover:opacity-50 focus-visible:opacity-50 active:opacity-50"
            >
              Github
            </Link>
            <Link
              href="/work"
              className="transition-opacity hover:opacity-50 focus-visible:opacity-50 active:opacity-50"
            >
              Work
            </Link>
          </div>
        </div>
        <div className="f-mono text-right text-[0.7rem] leading-loose text-muted-foreground">
          AHMAD CHABAYTA — PORTFOLIO {new Date().getFullYear()}.
          <br />
          3D · INTERACTIVE · DATA · DESIGN.
          <br />
          BASED IN BEIRUT.
        </div>
      </div>
    </footer>
  );
}
