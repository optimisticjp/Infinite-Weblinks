import { describe, it, expect } from "vitest";
import {
  domainInk,
  domainTint,
  domainKeyFromToken,
  NEUTRAL_INK_FALLBACK,
  NEUTRAL_TINT_FALLBACK,
  type DomainKey,
} from "@/lib/design/domainColor";

/** The legacy colour → V2 ink migration bridge. Server-safe: string in, token string out. */

describe("domainColor bridge", () => {
  const DOMAINS: DomainKey[] = ["strategy", "build", "discover", "convert", "operate", "retain", "ai"];

  it("maps every --domain-* token to its matching V2 ink", () => {
    for (const key of DOMAINS) {
      expect(domainInk(`var(--domain-${key})`)).toBe(`var(--v2-domain-${key}-ink)`);
      expect(domainTint(`var(--domain-${key})`)).toBe(`var(--v2-domain-${key}-tint)`);
    }
  });

  it("accepts bare and var()-wrapped token forms", () => {
    expect(domainInk("--domain-convert")).toBe("var(--v2-domain-convert-ink)");
    expect(domainInk("domain-convert")).toBe("var(--v2-domain-convert-ink)");
    expect(domainInk("var(--domain-convert)")).toBe("var(--v2-domain-convert-ink)");
  });

  it("maps the legacy accent-palette aliases used by goals (by hue family)", () => {
    expect(domainInk("var(--lime)")).toBe("var(--v2-domain-retain-ink)");
    expect(domainInk("var(--cyan)")).toBe("var(--v2-domain-discover-ink)");
    expect(domainInk("var(--orange)")).toBe("var(--v2-domain-operate-ink)");
    expect(domainInk("var(--pink)")).toBe("var(--v2-domain-convert-ink)");
    expect(domainInk("var(--violet)")).toBe("var(--v2-domain-strategy-ink)");
    expect(domainInk("var(--violet-bright)")).toBe("var(--v2-domain-strategy-ink)");
    expect(domainInk("var(--blue)")).toBe("var(--v2-domain-build-ink)");
  });

  it("returns the safe neutral fallback for unknown or absent input", () => {
    expect(domainInk(undefined)).toBe(NEUTRAL_INK_FALLBACK);
    expect(domainInk(null)).toBe(NEUTRAL_INK_FALLBACK);
    expect(domainInk("")).toBe(NEUTRAL_INK_FALLBACK);
    expect(domainInk("var(--not-a-token)")).toBe(NEUTRAL_INK_FALLBACK);
    expect(domainTint("var(--not-a-token)")).toBe(NEUTRAL_TINT_FALLBACK);
    expect(domainKeyFromToken("var(--whatever)")).toBeNull();
  });

  it("only ever returns a var(--…) token — never a raw colour value", () => {
    // Domain-mapped outputs are always --v2-domain-* wayfinding tokens; the fallbacks are the
    // semantic neutral tokens (theme-agnostic). Neither path ever returns a raw hex/rgb value.
    const mapped = [
      ...DOMAINS.map((k) => domainInk(`var(--domain-${k})`)),
      ...DOMAINS.map((k) => domainTint(`var(--domain-${k})`)),
      domainInk("var(--lime)"),
    ];
    const fallbacks = [domainInk("nonsense"), domainTint("nonsense")];

    for (const value of mapped) {
      expect(value).toMatch(/^var\(--v2-domain-[a-z]+-(?:ink|tint)\)$/);
    }
    expect(fallbacks).toEqual([NEUTRAL_INK_FALLBACK, NEUTRAL_TINT_FALLBACK]);

    for (const value of [...mapped, ...fallbacks]) {
      expect(value).toMatch(/^var\(--[a-z0-9-]+\)$/);
      expect(value).not.toMatch(/#[0-9a-f]{3,8}/i);
      expect(value).not.toMatch(/rgba?\(/i);
    }
  });

  it("recognises its own V2 ink / tint / line role tokens for every domain", () => {
    for (const key of DOMAINS) {
      for (const role of ["ink", "tint", "line"] as const) {
        expect(domainKeyFromToken(`var(--v2-domain-${key}-${role})`)).toBe(key);
      }
    }
  });

  it("is idempotent: mapping an already-mapped ink or tint returns the same token", () => {
    for (const key of DOMAINS) {
      const legacy = `var(--domain-${key})`;
      const ink = domainInk(legacy);
      const tint = domainTint(legacy);
      // idempotence
      expect(domainInk(ink)).toBe(ink);
      expect(domainTint(tint)).toBe(tint);
      // ink <-> tint round-trips within the domain
      expect(domainTint(ink)).toBe(tint);
      expect(domainInk(tint)).toBe(ink);
      // line token also resolves to the same domain's ink/tint
      const line = `var(--v2-domain-${key}-line)`;
      expect(domainInk(line)).toBe(ink);
      expect(domainTint(line)).toBe(tint);
    }
  });

  it("still rejects raw colour values (fallback), never treating them as a domain", () => {
    for (const raw of ["#6d28d9", "#fff", "rgb(109,40,217)", "rgba(0,0,0,0.5)"]) {
      expect(domainKeyFromToken(raw)).toBeNull();
      expect(domainInk(raw)).toBe(NEUTRAL_INK_FALLBACK);
      expect(domainTint(raw)).toBe(NEUTRAL_TINT_FALLBACK);
    }
  });
});
