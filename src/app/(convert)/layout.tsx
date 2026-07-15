import { SiteHeader } from "@/components/chrome/SiteHeader";
import { SiteFooter } from "@/components/chrome/SiteFooter";
import { getSiteChrome } from "@/lib/content";

/**
 * Chrome for the "convert" route group (Growth Plan Builder, Contact) — mirrors
 * `(marketing)/layout.tsx` so both groups share the same header/footer, just split so
 * these two conversion-focused routes can evolve (noindex, form-heavy layout) without
 * touching the marketing group.
 */
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
