# Platform logos

Official brand marks for the platforms Infinite Weblinks can help connect, used **only**
for illustrative "works with" / integration displays (the hero platform rail and the
"digital world" ecosystem visual). Their presence does **not** imply endorsement,
partnership or certification — all trademarks belong to their respective owners.

## Source & licence

Shapes come from **[Simple Icons](https://simple-icons.org)**, whose SVG icon data is
released under the **CC0 1.0 Universal** public-domain dedication. They are the brands'
official marks — **not redrawn, approximated or invented**. Each file has the brand's
official primary colour baked onto the root `<svg>` (brand colours are public facts).

**Dark-surface exception — TikTok.** TikTok's official mark colour is `#000000`, which is
invisible on the V3 dark canvas (~1.05:1 on the page background). Its file is baked with a
**white** mark instead. The shape is TikTok's official, un-redrawn mark; only the fill is
lightened — which is TikTok's own standard treatment on dark backgrounds. This is set per-logo
in `scripts/fetch-brand-logos.mjs`, so regeneration preserves it.

## Files

`shopify`, `wordpress`, `google`, `meta`, `mailchimp`, `hubspot`, `instagram`, `tiktok`,
`linkedin`, `youtube` — each a single-path, ~24×24 viewBox SVG.

## Regenerating

```
node scripts/fetch-brand-logos.mjs
```

Fetches the current Simple Icons SVGs, strips the redundant `<title>`/`role` (accessibility
is handled by the host `<img alt>`), bakes in the brand colour, and writes here. The
committed SVGs are what the app serves — nothing is fetched at runtime, and no external
CDN is used in the browser.

## Adding a logo

Only add a platform that is **genuinely relevant** to the site and visibly used in the
design references. Add it to the `LOGOS` list in `scripts/fetch-brand-logos.mjs`, rerun,
and reference it through the `BrandLogo` component. Don't overuse.
