import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { describe, it, expect } from "vitest";

/** Guards the Phase 2A/2B token hygiene: the night link/accent colour is a central token,
 *  and no raw #cdbcff (or other raw hex) is reintroduced into the component modules. */

const read = (rel: string) => readFileSync(fileURLToPath(new URL(rel, import.meta.url)), "utf8");

const v2 = read("../../src/styles/tokens/v2.css");
const card = read("../../src/components/primitives/Card.module.css");
const bento = read("../../src/components/primitives/Bento.module.css");

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
