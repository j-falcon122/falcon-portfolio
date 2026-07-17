import type { Metadata } from "next";
import "./globals.css";
import { getCms } from "portfolio-core/lib/cms";
import { resolveAdminNav } from "portfolio-core/lib/resolveAdminNav";
import SiteHeader from "portfolio-core/components/SiteHeader";
import SiteFooter from "portfolio-core/components/SiteFooter";
import SkipLink from "portfolio-core/components/SkipLink";
import SinglePageHashScroll from "portfolio-core/components/SinglePageHashScroll";

export async function generateMetadata(): Promise<Metadata> {
  const site = await getCms().getSiteSettings();
  return {
    title: {
      default: site.title,
      template: `%s · ${site.title}`,
    },
    description:
      "Jordan Falcon — software engineer building intentional products for millions of sports fans. React, TypeScript, Next.js.",
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
        className="min-h-screen bg-white text-neutral-900"
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
