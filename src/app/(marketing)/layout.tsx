import { SiteHeader } from "@/components/chrome/SiteHeader";
import { SiteFooter } from "@/components/chrome/SiteFooter";
import { getSiteChrome } from "@/lib/content";

export default async function MarketingLayout({ children }: { children: React.ReactNode }) {
  const { nav, footer } = await getSiteChrome();
  return (
    <>
      <SiteHeader nav={nav} />
      <main id="main">{children}</main>
      <SiteFooter footer={footer} />
    </>
  );
}
