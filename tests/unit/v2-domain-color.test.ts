import { describe, it, expect } from "vitest";
import {
  domainInk,
  domainTint,
  domainKeyFromToken,
  V2_INK_FALLBACK,
  V2_TINT_FALLBACK,
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
    expect(domainInk(undefined)).toBe(V2_INK_FALLBACK);
    expect(domainInk(null)).toBe(V2_INK_FALLBACK);
    expect(domainInk("")).toBe(V2_INK_FALLBACK);
    expect(domainInk("var(--not-a-token)")).toBe(V2_INK_FALLBACK);
    expect(domainTint("var(--not-a-token)")).toBe(V2_TINT_FALLBACK);
    expect(domainKeyFromToken("var(--whatever)")).toBeNull();
  });

  it("only ever returns var(--v2-*) tokens — never a raw colour value", () => {
    const outputs = [
      ...DOMAINS.map((k) => domainInk(`var(--domain-${k})`)),
      ...DOMAINS.map((k) => domainTint(`var(--domain-${k})`)),
      domainInk("var(--lime)"),
      domainInk("nonsense"),
      domainTint("nonsense"),
    ];
    for (const value of outputs) {
      expect(value).toMatch(/^var\(--v2-[a-z0-9-]+\)$/);
      expect(value).not.toMatch(/#[0-9a-f]{3,8}/i);
      expect(value).not.toMatch(/rgba?\(/i);
    }
  });
});
