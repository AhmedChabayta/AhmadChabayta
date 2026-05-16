import Link from "next/link";
import { Container, Eyebrow } from "@/components/ui";

export function Footer() {
  return (
    <footer className="border-t border-border bg-background px-5 py-24 md:px-10 md:py-32">
      <Container className="grid gap-16 md:grid-cols-[1.4fr_1fr] md:gap-20">
        <div className="flex flex-col gap-8">
          <Eyebrow>/ GET IN TOUCH</Eyebrow>
          <Link
            href="mailto:ahmadchabayta@proton.me"
            className="f-anton text-[clamp(2rem,5vw,4rem)] leading-[1.05] transition-colors hover:text-orange focus-visible:text-orange active:text-orange"
          >
            ahmadchabayta@proton.me
          </Link>
          <Link
            href="https://wa.me/96170687167"
            className="f-anton text-[clamp(2rem,5vw,4rem)] leading-[1.05] transition-colors hover:text-orange focus-visible:text-orange active:text-orange"
          >
            +961 70 687 167
          </Link>
          <div className="f-mono mt-4 flex gap-10 text-[0.7rem] font-semibold">
            <Link
              href="https://github.com/AhmedChabayta"
              className="transition-opacity hover:opacity-50 focus-visible:opacity-50 active:opacity-50"
            >
              Github ↗
            </Link>
            <Link
              href="/#work"
              className="transition-opacity hover:opacity-50 focus-visible:opacity-50 active:opacity-50"
            >
              Work →
            </Link>
            <Link
              href="/#contact"
              className="transition-opacity hover:opacity-50 focus-visible:opacity-50 active:opacity-50"
            >
              Contact →
            </Link>
          </div>
        </div>
        <div className="f-mono flex flex-col gap-6 text-[0.7rem] leading-[2] text-muted-foreground md:text-right">
          <p>
            AHMAD CHABAYTA
            <br />
            PORTFOLIO {new Date().getFullYear()}
          </p>
          <p>
            3D · INTERACTIVE
            <br />
            DATA · DESIGN
          </p>
          <p className="text-orange/70">BASED IN BEIRUT.</p>
        </div>
      </Container>
    </footer>
  );
}
