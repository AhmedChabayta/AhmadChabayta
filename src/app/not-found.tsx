import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-[80svh] flex-col items-center justify-center gap-6 px-5 text-center">
      <p className="f-mono text-[0.65rem] tracking-[0.2em] text-orange">/ 404</p>
      <h1 className="f-anton text-[clamp(4rem,15vw,12rem)] leading-none">
        DEAD LINK.
      </h1>
      <p className="max-w-prose text-muted-foreground">
        Whatever you were looking for either moved or never existed.
      </p>
      <Link
        href="/"
        className="f-mono inline-flex items-center gap-2 border border-orange px-5 py-3 text-[0.65rem] tracking-[0.2em] text-orange transition-colors hover:bg-orange hover:text-background focus-visible:bg-orange focus-visible:text-background"
      >
        BACK HOME
      </Link>
    </div>
  );
}
