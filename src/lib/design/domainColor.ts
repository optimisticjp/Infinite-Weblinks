/**
 * Wayfinding colour → accessible V2 ink/tint bridge.
 *
 * A MIGRATION BRIDGE (removable at final convergence). It accepts EITHER a legacy wayfinding
 * token — the seven `--domain-*` tokens used by case scenarios, or the accent-palette tokens
 * (`--violet`, `--blue`, …) used by goals — OR one of its own V2 domain-role tokens
 * (`--v2-domain-{X}-ink` / `-tint` / `-line`). It resolves each to the matching V2 domain ink or
 * tint, which is measured AA on white and on its tint (see src/styles/tokens/v2.css). Because it
 * recognises its own outputs, the mapping is IDEMPOTENT: `domainInk(domainInk(t)) === domainInk(t)`,
 * `domainTint(domainTint(t)) === domainTint(t)`, and ink↔tint round-trips within a domain. So a
 * component API may truthfully say it accepts a legacy OR a V2 domain-role token. Once the
 * datasets are re-authored with V2 tokens directly, this bridge can be deleted.
 *
 * Pure and server-safe: a token string in, a token string out. No DOM, no computed style, no
 * raw colour values (raw hex/rgb inputs are not recognised and fall back; it only ever returns
 * `var(--v2-*)` tokens). Unknown or absent input returns a safe neutral ink/tint that is AA on
 * every V2 surface.
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

const DOMAIN_KEYS: DomainKey[] = ["strategy", "build", "discover", "convert", "operate", "retain", "ai"];

/**
 * Custom-property name → domain key. The seven `--domain-*` tokens are the primary, spec-defined
 * set; the accent-palette aliases (still carried by the goals seed) are mapped by hue family; and
 * the module's own V2 domain-role tokens (`--v2-domain-{X}-ink/-tint/-line`) are recognised too,
 * so the mapping is idempotent (it accepts its own outputs).
 */
const TOKEN_TO_DOMAIN: Record<string, DomainKey> = {
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
  // The module's own V2 domain-role tokens — makes ink/tint mapping idempotent.
  ...Object.fromEntries(
    DOMAIN_KEYS.flatMap((k) => [
      [`--v2-domain-${k}-ink`, k],
      [`--v2-domain-${k}-tint`, k],
      [`--v2-domain-${k}-line`, k],
    ]),
  ),
};

/**
 * Resolve a wayfinding token to a domain key, or null when it isn't a recognised token.
 * Accepts `var(--domain-convert)`, `--domain-convert`, `domain-convert`, or any V2 domain-role
 * token (`var(--v2-domain-convert-ink)` etc). Raw colour values are not recognised.
 */
export function domainKeyFromToken(token: string | null | undefined): DomainKey | null {
  if (!token) return null;
  const match = token.match(/--[a-z0-9-]+/i);
  const name = match ? match[0].toLowerCase() : `--${token.trim().toLowerCase()}`;
  return TOKEN_TO_DOMAIN[name] ?? null;
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
