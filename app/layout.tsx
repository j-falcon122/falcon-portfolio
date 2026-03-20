import "./globals.css";
import { getCms } from "@/lib/cms";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";

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