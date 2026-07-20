import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { describe, it, expect } from "vitest";

/** Guards the Phase 2A/2B token hygiene: the night link/accent colour is a central token,
 *  and no raw #cdbcff (or other raw hex) is reintroduced into the component modules. */

const readRaw = (rel: string) => readFileSync(fileURLToPath(new URL(rel, import.meta.url)), "utf8");
/** Read a CSS module with /* … *​/ comments stripped, so hygiene checks the declarations,
 *  not the documentation comment that lists the banned tokens. */
const read = (rel: string) => readRaw(rel).replace(/\/\*[\s\S]*?\*\//g, "");

const v2 = read("../../src/styles/tokens/v2.css");
const card = read("../../src/components/primitives/Card.module.css");
const bento = read("../../src/components/primitives/Bento.module.css");

// Rebuilt V2 chrome modules — must not reintroduce legacy/raw colour values.
const CHROME_MODULES = [
  "../../src/components/chrome/SiteHeader.module.css",
  "../../src/components/chrome/MobileNav.module.css",
  "../../src/components/chrome/SiteFooter.module.css",
];
// Banned in rebuilt V2 chrome CSS (see Phase 2C §F). color-mix() with V2 tokens is allowed.
const BANNED = [
  /var\(--ink-[a-z0-9-]+\)/i, // --ink-* scale
  /var\(--text-[1-4]\)/i, // --text-1..4 (semantic --text-heading/body/muted are fine)
  /var\(--border-[a-z0-9-]+\)/i, // --border-1/2/glow
  /var\(--grad-[a-z0-9-]+\)/i, // gradients
  /var\(--glow-[a-z0-9-]+\)/i, // glows
  /var\(--glass-[a-z0-9-]+\)/i, // glass
  /backdrop-filter/i,
  /#[0-9a-fA-F]{3,8}\b/, // raw hex
  /\brgba?\s*\(/i, // raw rgb/rgba (color-mix with tokens is used instead)
];

describe("V2 chrome token hygiene", () => {
  for (const rel of CHROME_MODULES) {
    const css = read(rel);
    const name = rel.split("/").pop();
    for (const pattern of BANNED) {
      it(`${name} contains no ${pattern}`, () => {
        expect(css).not.toMatch(pattern);
      });
    }
  }
});

describe("V2 night link token hygiene", () => {
  it("defines --v2-link-night centrally in v2.css", () => {
    expect(v2).toMatch(/--v2-link-night:\s*#[0-9a-f]{6}/i);
  });

  it("theme-night uses the token for --link (no raw hex link value)", () => {
    expect(v2).toContain("--link: var(--v2-link-night)");
  });

  it("Card.module.css .night uses the token and contains no raw #cdbcff", () => {
    expect(card).toContain("--link: var(--v2-link-night)");
    expect(card.toLowerCase()).not.toContain("#cdbcff");
  });

  it("BentoCard night styling references the night accent token", () => {
    expect(bento).toContain("var(--v2-link-night)");
    expect(bento.toLowerCase()).not.toContain("#cdbcff");
  });
});
