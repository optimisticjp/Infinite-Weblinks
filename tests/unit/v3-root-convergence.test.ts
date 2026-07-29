import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { describe, it, expect } from "vitest";

/**
 * V3 ("Instrument") — the document root is converged to DARK-first.
 *
 * This file replaces v2-root-convergence.test.ts, which guarded the previous light-first
 * decision (Phase 2S). That decision was deliberately reversed; see docs/design/v3-design-spec.md.
 * The guard is rewritten rather than removed so the new decision is enforced just as hard as
 * the old one was: the viewport declares dark + the ink-950 canvas, the body adopts the V3
 * semantic mapping, and the global treatments stay token-driven with no hard-coded colour.
 */
const read = (rel: string) => readFileSync(fileURLToPath(new URL(rel, import.meta.url)), "utf8");
const layout = read("../../src/app/layout.tsx");
const base = read("../../src/styles/tokens/base.css");
const v3 = read("../../src/styles/tokens/v3.css");
const globals = read("../../src/styles/globals.css");

describe("root viewport + body (app/layout.tsx)", () => {
  it("declares a dark colour-scheme and the ink-950 theme-colour", () => {
    expect(layout).toMatch(/colorScheme:\s*"dark"/);
    expect(layout).toMatch(/themeColor:\s*"#08080a"/);
    expect(layout).not.toMatch(/colorScheme:\s*"light"/);
  });

  it("adopts the V3 dark mapping on <body>", () => {
    expect(layout).toMatch(/<body className="theme-deep">/);
    expect(layout).not.toMatch(/<body className="theme-light">/);
  });
});

describe("v3.css token layer", () => {
  it("is imported last so its semantic values win over the V2 light mapping", () => {
    const v3At = globals.indexOf("tokens/v3.css");
    const v2At = globals.indexOf("tokens/v2.css");
    expect(v3At).toBeGreaterThan(-1);
    expect(v3At).toBeGreaterThan(v2At);
  });

  it("defines the three dark surface classes", () => {
    for (const cls of [".theme-deep", ".theme-deep-alt", ".theme-night"]) {
      expect(v3).toContain(cls);
    }
  });

  it("remaps every domain wayfinding hue so light-paper inks never render on dark", () => {
    for (const d of ["strategy", "build", "discover", "convert", "operate", "retain", "ai"]) {
      expect(v3).toMatch(new RegExp(`--v2-domain-${d}-ink:\\s*var\\(--v3-domain-${d}\\)`));
    }
  });

  it("uses no pure black canvas (panels must be able to sit above the page)", () => {
    expect(v3).not.toMatch(/--v3-ink-950:\s*#000\b/);
    expect(v3).not.toMatch(/--v3-ink-950:\s*#000000\b/);
  });

  it("keeps elevation neutral — shadows and a hairline edge, never a colour glow", () => {
    const shadows = v3.match(/--v3-shadow-[a-z]+:[^;]+;/g) ?? [];
    expect(shadows.length).toBeGreaterThan(0);
    for (const s of shadows) {
      expect(s).toMatch(/rgba\(0,\s*0,\s*0/);
    }
    expect(v3).toContain("--v3-edge-top");
  });

  it("splits brand into a legible text value and a saturated fill value", () => {
    expect(v3).toContain("--v3-brand-text");
    expect(v3).toContain("--v3-brand-fill");
  });

  it("applies grain once on the document, never per component", () => {
    expect(v3).toMatch(/body\.theme-deep::before/);
    expect(v3).toContain("pointer-events: none");
  });
});

describe("base.css canvas + global treatments", () => {
  it("the body canvas stays theme-driven via semantic tokens", () => {
    const body = base.slice(base.indexOf("\nbody {"), base.indexOf("\nbody {") + 400);
    expect(body).toContain("background: var(--surface)");
    expect(body).toContain("color: var(--text-body)");
  });

  it("selection uses a brand tint rather than a hard-coded colour", () => {
    expect(base).toMatch(/::selection\s*\{[^}]*color-mix\(in srgb, var\(--v2-brand\)/);
    expect(base).not.toContain("rgba(245, 25, 126, 0.32)");
  });

  it("autofilled controls stay pinned to the themed surface + ink", () => {
    expect(base).toMatch(/-webkit-autofill/);
    expect(base).toMatch(/-webkit-text-fill-color: var\(--text-heading\)/);
    expect(base).toMatch(/-webkit-box-shadow: 0 0 0 1000px var\(--surface-input/);
  });
});
