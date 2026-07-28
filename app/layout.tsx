import type { Metadata } from "next";
import { Outfit } from "next/font/google";
import { GeistSans } from "geist/font/sans";
import "./globals.css";
import { getFalconCms } from "@/lib/cms";
import { resolveFalconAdminNav } from "@/lib/falconAdminNav";
import SiteHeader from "@/components/SiteHeader";
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
  const site = await getFalconCms().getSiteSettings();
  return {
    title: {
      default: site.title,
      template: `%s · ${site.title}`,
    },
    description:
      "Jordan Falcon — frontend-focused software engineer with experience at ESPN and Disney. React, TypeScript, Next.js.",
    icons: {
      icon: [{ url: "/icon.png", type: "image/png", sizes: "64x64" }],
      apple: [{ url: "/apple-icon.png", type: "image/png", sizes: "180x180" }],
    },
    openGraph: {
      title: site.title,
      type: "website",
    },
  };
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const cms = getFalconCms();
  const site = await cms.getSiteSettings();
  const adminNav = resolveFalconAdminNav();

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
