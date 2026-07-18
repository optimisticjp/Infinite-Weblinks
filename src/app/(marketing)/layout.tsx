import { SiteHeader } from "@/components/chrome/SiteHeader";
import { SiteFooter } from "@/components/chrome/SiteFooter";
import { StickyMobileCta } from "@/components/chrome/StickyMobileCta";
import { getSiteChrome } from "@/lib/content";

/**
 * ISR is driven at the data layer, not here: when live CMS reads are enabled the Sanity fetches
 * carry `next.revalidate` (see src/lib/sanity/fetch.ts), which makes the reading routes ISR so the
 * live dataset and editor changes reach the site. When the release-safety flag is off (default),
 * no Sanity query runs, so these routes stay fully static on seed content — exactly as before this
 * integration. (A segment-level `revalidate` export can't be flag-conditional — Next requires a
 * static literal — so the cadence lives with the fetch.)
 */
export default async function MarketingLayout({ children }: { children: React.ReactNode }) {
  const { nav, footer } = await getSiteChrome();
  return (
    <>
      <SiteHeader nav={nav} />
      <main id="main">{children}</main>
      <SiteFooter footer={footer} />
      {/* Rendered outside the header/nav so its backdrop-filter doesn't trap this fixed bar. */}
      <StickyMobileCta />
    </>
  );
}
