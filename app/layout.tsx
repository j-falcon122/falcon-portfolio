import type { Metadata } from "next";
import { Outfit } from "next/font/google";
import { GeistSans } from "geist/font/sans";
import "./globals.css";
import { getCms } from "portfolio-core/lib/cms";
import { resolveAdminNav } from "portfolio-core/lib/resolveAdminNav";
import SiteHeader from "portfolio-core/components/SiteHeader";
import SiteFooter from "portfolio-core/components/SiteFooter";
import SkipLink from "portfolio-core/components/SkipLink";
import SinglePageHashScroll from "portfolio-core/components/SinglePageHashScroll";

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
  weight: ["700", "800", "900"],
  display: "swap",
});

export async function generateMetadata(): Promise<Metadata> {
  const site = await getCms().getSiteSettings();
  return {
    title: {
      default: site.title,
      template: `%s · ${site.title}`,
    },
    description:
      "Jordan Falcon — frontend-focused software engineer with experience at ESPN and Disney. React, TypeScript, Next.js.",
    openGraph: {
      title: site.title,
      type: "website",
    },
  };
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const cms = getCms();
  const site = await cms.getSiteSettings();
  const adminNav = resolveAdminNav();

  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${outfit.variable} ${GeistSans.variable} min-h-screen bg-[var(--figma-navy)] text-white`}
        suppressHydrationWarning
      >
        <SkipLink />
        <SiteHeader site={site} adminNav={adminNav} />
        <SinglePageHashScroll />
        <main id="main-content">{children}</main>
        <SiteFooter site={site} />
      </body>
    </html>
  );
}
