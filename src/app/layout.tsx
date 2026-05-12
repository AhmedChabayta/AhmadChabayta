import type { Metadata } from "next";
import { Anton, JetBrains_Mono, Inter } from "next/font/google";
import "./globals.css";
import { Nav } from "@/components/site/nav";
import { Footer } from "@/components/site/footer";
import { ScrollProgress } from "@/components/site/scroll-progress";

const anton = Anton({
  variable: "--font-anton",
  weight: "400",
  subsets: ["latin"],
  display: "swap",
});

const jetbrains = JetBrains_Mono({
  variable: "--font-jetbrains",
  subsets: ["latin"],
  display: "swap",
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const SITE_URL = "https://ahmadchabayta.com";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Ahmad Chabayta — Frontend Developer & Creative Technologist",
    template: "%s · Ahmad Chabayta",
  },
  description:
    "Self-taught frontend developer based in Beirut, born in Riyadh. Four years of React, Next.js, WebGL/GLSL shaders, and data engineering. No degree — only the work.",
  keywords: [
    "Ahmad Chabayta",
    "frontend developer",
    "React",
    "Next.js",
    "TypeScript",
    "WebGL",
    "GLSL",
    "creative technologist",
    "Beirut",
    "portfolio",
  ],
  authors: [{ name: "Ahmad Chabayta" }],
  creator: "Ahmad Chabayta",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: SITE_URL,
    siteName: "Ahmad Chabayta Portfolio",
    title: "Ahmad Chabayta — Frontend Developer & Creative Technologist",
    description:
      "Self-taught frontend developer. React, Next.js, live WebGL shaders, and data engineering.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Ahmad Chabayta — Frontend Developer",
    description:
      "Self-taught frontend developer. React, Next.js, live GLSL fractals, and data pipelines. Based in Beirut.",
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className={`${anton.variable} ${jetbrains.variable} ${inter.variable} h-full`}
      suppressHydrationWarning
    >
      <body className="flex min-h-full w-full flex-col bg-background text-foreground antialiased">
        <ScrollProgress />
        <Nav />
        <main id="main" className="w-full min-w-0 flex-1">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
