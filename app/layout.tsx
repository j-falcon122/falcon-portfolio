import "./globals.css";
import type { Metadata } from "next";
import { getCms } from "@/lib/cms";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";

export const metadata: Metadata = {
  title: {
    default: "J. Falcon",
    template: "%s | J. Falcon",
  },
  description: "Software engineer and creator.",
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const cms = getCms();
  const site = await cms.getSiteSettings();

  return (
    <html lang="en">
      <body className="min-h-screen bg-black text-white">
        <SiteHeader site={site} />
        {children}
        <SiteFooter site={site} />
      </body>
    </html>
  );
}