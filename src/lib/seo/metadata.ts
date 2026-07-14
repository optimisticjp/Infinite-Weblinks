import type { Metadata } from "next";

const SITE = process.env.NEXT_PUBLIC_SITE_URL ?? "https://infiniteweblinks.com";

/** Absolute canonical URL for a path on the canonical host. */
export function canonical(path = "/"): string {
  return new URL(path, SITE).toString();
}

/**
 * Build page metadata with a single canonical URL, OG + Twitter, and robots.
 * Utility/personalised routes pass `noindex: true` (index:false, follow:true) so
 * link equity still flows while keeping them out of the index.
 */
export function pageMetadata(opts: {
  title: string;
  description: string;
  path?: string;
  noindex?: boolean;
  ogImage?: string;
}): Metadata {
  const url = canonical(opts.path ?? "/");
  return {
    title: opts.title,
    description: opts.description,
    alternates: { canonical: url },
    robots: opts.noindex ? { index: false, follow: true } : { index: true, follow: true },
    openGraph: {
      title: opts.title,
      description: opts.description,
      url,
      siteName: "Infinite Weblinks",
      type: "website",
      ...(opts.ogImage ? { images: [{ url: opts.ogImage }] } : {}),
    },
    twitter: { card: "summary_large_image", title: opts.title, description: opts.description },
  };
}
