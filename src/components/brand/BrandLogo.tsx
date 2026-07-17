/* eslint-disable @next/next/no-img-element -- a tiny local static SVG served from
   /public; next/image adds no value and would pull optimisation machinery we don't want. */
import styles from "./BrandLogo.module.css";

type BrandLogoProps = {
  /** File slug in /public/brand-logos (e.g. "shopify"). */
  slug: string;
  /** Brand display name — used as the accessible name unless decorative. */
  name: string;
  /** True when the surrounding element already conveys the meaning, so this mark is a
      decorative duplicate and should be hidden from assistive tech. */
  decorative?: boolean;
  className?: string;
};

/**
 * BrandLogo — renders a locally-stored, brand-coloured platform SVG (Simple Icons, CC0 —
 * see public/brand-logos/README.md) for illustrative "works with" / integration displays.
 * No JavaScript and no runtime CDN: a plain <img> pointing at /public/brand-logos. Any
 * colour/whitening treatment is left to the host section's CSS. Meaningful logos get an
 * accessible name; decorative duplicates are hidden. Never implies endorsement.
 */
export function BrandLogo({ slug, name, decorative = false, className }: BrandLogoProps) {
  return (
    <img
      src={`/brand-logos/${slug}.svg`}
      alt={decorative ? "" : name}
      aria-hidden={decorative || undefined}
      width={24}
      height={24}
      loading="lazy"
      decoding="async"
      draggable={false}
      className={[styles.logo, className].filter(Boolean).join(" ")}
    />
  );
}
