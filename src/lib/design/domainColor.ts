/**
 * Legacy wayfinding colour → accessible V2 ink bridge.
 *
 * A MIGRATION BRIDGE (removable at final convergence). Seed content still carries the legacy
 * wayfinding colour tokens — the seven `--domain-*` tokens used by case scenarios, and the
 * accent-palette tokens (`--violet`, `--blue`, …) used by goals. On the V2 light surfaces
 * those legacy values are not guaranteed to clear WCAG AA as text/icon colours, so this module
 * maps each to the matching V2 domain ink token, which IS measured AA on white and on its tint
 * (see src/styles/tokens/v2.css). Once the datasets are re-authored with V2 tokens directly,
 * this bridge can be deleted.
 *
 * Pure and server-safe: a token string in, a token string out. No DOM, no computed style, no
 * raw colour values (it only ever returns `var(--v2-*)` tokens). Unknown or absent input
 * returns a safe neutral ink that is AA on every V2 surface.
 */

export type DomainKey =
  | "strategy"
  | "build"
  | "discover"
  | "convert"
  | "operate"
  | "retain"
  | "ai";

/** The accessible V2 ink token for each domain (measured >= 4.5:1 on white and on its tint). */
const V2_DOMAIN_INK: Record<DomainKey, string> = {
  strategy: "var(--v2-domain-strategy-ink)",
  build: "var(--v2-domain-build-ink)",
  discover: "var(--v2-domain-discover-ink)",
  convert: "var(--v2-domain-convert-ink)",
  operate: "var(--v2-domain-operate-ink)",
  retain: "var(--v2-domain-retain-ink)",
  ai: "var(--v2-domain-ai-ink)",
};

/** The soft V2 tint token for each domain (a surface fill; the ink above reads AA on it). */
const V2_DOMAIN_TINT: Record<DomainKey, string> = {
  strategy: "var(--v2-domain-strategy-tint)",
  build: "var(--v2-domain-build-tint)",
  discover: "var(--v2-domain-discover-tint)",
  convert: "var(--v2-domain-convert-tint)",
  operate: "var(--v2-domain-operate-tint)",
  retain: "var(--v2-domain-retain-tint)",
  ai: "var(--v2-domain-ai-tint)",
};

/** Safe neutral fallbacks — AA on white and on the paper-2/3 tints. */
export const V2_INK_FALLBACK = "var(--v2-ink-muted)";
export const V2_TINT_FALLBACK = "var(--v2-paper-2)";

/**
 * Legacy custom-property name → domain key. The seven `--domain-*` tokens are the primary,
 * spec-defined set; the accent-palette aliases (still carried by the goals seed) are mapped
 * by hue family so per-goal wayfinding survives the migration.
 */
const LEGACY_TOKEN_TO_DOMAIN: Record<string, DomainKey> = {
  // The seven domain tokens (constellation.css) — the canonical set.
  "--domain-strategy": "strategy",
  "--domain-build": "build",
  "--domain-discover": "discover",
  "--domain-convert": "convert",
  "--domain-operate": "operate",
  "--domain-retain": "retain",
  "--domain-ai": "ai",
  // Accent-palette aliases (colors.css) used by the goals seed, mapped by hue family.
  "--violet": "strategy",
  "--violet-bright": "strategy",
  "--violet-deep": "strategy",
  "--blue": "build",
  "--blue-bright": "build",
  "--cyan": "discover",
  "--pink": "convert",
  "--pink-bright": "convert",
  "--orange": "operate",
  "--orange-bright": "operate",
  "--lime": "retain",
  "--lime-bright": "retain",
};

/**
 * Resolve a legacy colour token to a domain key, or null when it isn't a recognised token.
 * Accepts `var(--domain-convert)`, `--domain-convert`, or `domain-convert`.
 */
export function domainKeyFromToken(token: string | null | undefined): DomainKey | null {
  if (!token) return null;
  const match = token.match(/--[a-z0-9-]+/i);
  const name = match ? match[0].toLowerCase() : `--${token.trim().toLowerCase()}`;
  return LEGACY_TOKEN_TO_DOMAIN[name] ?? null;
}

/** The accessible V2 ink token for a legacy wayfinding token (safe neutral fallback otherwise). */
export function domainInk(token: string | null | undefined): string {
  const key = domainKeyFromToken(token);
  return key ? V2_DOMAIN_INK[key] : V2_INK_FALLBACK;
}

/** The soft V2 tint token for a legacy wayfinding token (safe neutral fallback otherwise). */
export function domainTint(token: string | null | undefined): string {
  const key = domainKeyFromToken(token);
  return key ? V2_DOMAIN_TINT[key] : V2_TINT_FALLBACK;
}
