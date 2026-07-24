import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { describe, it, expect } from "vitest";

/**
 * Phase 2S (§D) — the document root is converged to V2 light-first. These guard the flip so it can't
 * silently regress to the retired dark default: the viewport is light + paper, the body adopts the V2
 * light semantic mapping, and the global selection / skip-link / autofill treatments use V2 tokens
 * (no reintroduced legacy pink or --ink-* chip). Night sections stay explicitly scoped elsewhere.
 */
const read = (rel: string) => readFileSync(fileURLToPath(new URL(rel, import.meta.url)), "utf8");
const layout = read("../../src/app/layout.tsx");
const base = read("../../src/styles/tokens/base.css");

describe("root viewport + body (app/layout.tsx)", () => {
  it("declares a light colour-scheme and the paper theme-colour", () => {
    expect(layout).toMatch(/colorScheme:\s*"light"/);
    expect(layout).toMatch(/themeColor:\s*"#ffffff"/);
    expect(layout).not.toMatch(/colorScheme:\s*"dark"/);
    expect(layout).not.toContain("#07050f");
  });
  it("adopts the V2 light mapping on <body>", () => {
    expect(layout).toMatch(/<body className="theme-light">/);
  });
});

describe("base.css canvas + global treatments", () => {
  it("the body canvas is theme-driven (semantic tokens, not the dark --bg-page/--text-2)", () => {
    const body = base.slice(base.indexOf("\nbody {"), base.indexOf("\nbody {") + 400);
    expect(body).toContain("background: var(--surface)");
    expect(body).toContain("color: var(--text-body)");
    expect(body).not.toContain("var(--bg-page)");
    expect(body).not.toContain("var(--text-2)");
  });
  it("selection uses a V2 brand tint, not the legacy pink with forced white text", () => {
    expect(base).toMatch(/::selection\s*\{[^}]*color-mix\(in srgb, var\(--v2-brand\)/);
    expect(base).not.toContain("rgba(245, 25, 126, 0.32)");
  });
  it("the skip link is a V2 high-contrast chip (night tokens, not --ink-800/--text-1)", () => {
    const skip = base.slice(base.indexOf(".iw-skip-link {"), base.indexOf(".iw-skip-link:focus") + 120);
    expect(skip).toContain("background: var(--v2-night-900)");
    expect(skip).toContain("color: var(--v2-on-night)");
    expect(skip).not.toContain("var(--ink-800)");
  });
  it("autofilled controls are pinned to the V2 surface + ink", () => {
    expect(base).toMatch(/-webkit-autofill/);
    expect(base).toMatch(/-webkit-text-fill-color: var\(--text-heading\)/);
    expect(base).toMatch(/-webkit-box-shadow: 0 0 0 1000px var\(--surface-input/);
  });
});
