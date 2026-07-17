// scripts/fetch-brand-logos.mjs
//
// Provenance + regeneration script for the platform logos in public/brand-logos/.
//
// Source: Simple Icons (https://simple-icons.org) via the jsDelivr mirror of the npm
// package. Simple Icons' SVG data is released under CC0 1.0 (public domain dedication),
// so the marks are the brands' OFFICIAL, un-redrawn shapes — not approximated or invented.
// Each brand's primary colour (a public brand fact) is baked into the stored file.
//
// These are used only for an illustrative "works with" / integration display. No
// endorsement, partnership or certification is implied. Trademarks belong to their owners.
//
// Run once (needs network); the committed SVGs are what the app actually serves — nothing
// is fetched at runtime. Node 20+ (built-in fetch), no dependencies.
//
//   node scripts/fetch-brand-logos.mjs

import { mkdir, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";

const OUT = fileURLToPath(new URL("../public/brand-logos", import.meta.url));

// slug (Simple Icons) · official brand hex · display name
const LOGOS = [
  ["shopify", "7AB55C", "Shopify"],
  ["wordpress", "21759B", "WordPress"],
  ["google", "4285F4", "Google"],
  ["meta", "0467DF", "Meta"],
  ["mailchimp", "FFE01B", "Mailchimp"],
  ["hubspot", "FF7A59", "HubSpot"],
  ["instagram", "E4405F", "Instagram"],
  ["tiktok", "000000", "TikTok"],
  ["linkedin", "0A66C2", "LinkedIn"],
  ["youtube", "FF0000", "YouTube"],
];

await mkdir(OUT, { recursive: true });

for (const [slug, hex, name] of LOGOS) {
  const url = `https://cdn.jsdelivr.net/npm/simple-icons@latest/icons/${slug}.svg`;
  const res = await fetch(url);
  if (!res.ok) {
    console.warn(`SKIP ${slug} — HTTP ${res.status}`);
    continue;
  }
  const raw = await res.text();
  if (!raw.includes("<path")) {
    console.warn(`SKIP ${slug} — no path in response`);
    continue;
  }
  // Optimise: drop role + the <title> (accessibility is handled by the host <img alt>),
  // bake the official brand colour onto the root <svg>, collapse whitespace.
  const svg = raw
    .replace(/\srole="img"/, "")
    .replace(/<title>[^<]*<\/title>/, "")
    .replace(/<svg /, `<svg fill="#${hex}" `)
    .replace(/>\s+</g, "><")
    .trim();
  await writeFile(`${OUT}/${slug}.svg`, svg, "utf8");
  console.log(`OK ${slug} (${name}) — ${Buffer.byteLength(svg)} bytes`);
}
