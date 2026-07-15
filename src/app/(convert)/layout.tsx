import { SiteHeader } from "@/components/chrome/SiteHeader";
import { SiteFooter } from "@/components/chrome/SiteFooter";
import { getSiteChrome } from "@/lib/content";
import { SANITY_REVALIDATE_SECONDS } from "@/lib/sanity/client";

/**
 * Chrome for the "convert" route group (Growth Plan Builder, Contact) — mirrors
 * `(marketing)/layout.tsx` so both groups share the same header/footer, just split so
 * these two conversion-focused routes can evolve (noindex, form-heavy layout) without
 * touching the marketing group.
 */
// The Growth Plan Builder reads the same Sanity-backed taxonomy, so keep it on ISR too.
export const revalidate = SANITY_REVALIDATE_SECONDS;

export default async function ConvertLayout({ children }: { children: React.ReactNode }) {
  const { nav, footer } = await getSiteChrome();
  return (
    <>
      <SiteHeader nav={nav} />
      <main id="main">{children}</main>
      <SiteFooter footer={footer} />
    </>
  );
}
