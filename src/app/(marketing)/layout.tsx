import { SiteHeader } from "@/components/chrome/SiteHeader";
import { SiteFooter } from "@/components/chrome/SiteFooter";
import { getSiteChrome } from "@/lib/content";
import { SANITY_REVALIDATE_SECONDS } from "@/lib/sanity/client";

/**
 * Marketing routes render Sanity-backed content, so they must NOT be frozen at build time.
 * This segment-level `revalidate` opts the whole group into ISR: pages re-render on this cadence
 * and re-read the live dataset, so the initial content and later editor changes reach the site.
 * (Seed-only routes under here, e.g. legal, simply re-render identically — harmless.)
 */
export const revalidate = SANITY_REVALIDATE_SECONDS;

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
