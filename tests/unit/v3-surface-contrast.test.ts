import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { describe, it, expect } from "vitest";

/**
 * WCAG 2.2 AA contrast coverage for the V3 dark SURFACE stack, and a guard that the alternating
 * band actually reads as distinct from the canvas.
 *
 * Reads the REAL --v3-ink-* / --v3-on-* / --v3-domain-* / --v3-brand-* literals from v3.css (no
 * duplicated palette), so a surface re-space that regresses text legibility — or that narrows the
 * canvas↔band gap back into "one flat strip" — fails here. Text sits on BOTH the canvas and the
 * (now lifted) alternating band, so both are checked.
 */
const v3 = readFileSync(fileURLToPath(new URL("../../src/styles/tokens/v3.css", import.meta.url)), "utf8");
const root = v3.slice(v3.indexOf(":root {"), v3.indexOf("\n}"));
const tokens = new Map<string, string>();
for (const m of root.matchAll(/(--v3-[a-z0-9-]+)\s*:\s*(#[0-9a-fA-F]{3,8})\s*;/g)) tokens.set(m[1], m[2]);
const hex = (name: string): string => {
  const v = tokens.get(name);
  if (!v) throw new Error(`token ${name} not found in v3.css :root`);
  return v;
};

type RGB = [number, number, number];
function hexToRgb(h: string): RGB {
  let s = h.replace("#", "");
  if (s.length === 3) s = s.split("").map((c) => c + c).join("");
  return [0, 2, 4].map((i) => parseInt(s.slice(i, i + 2), 16)) as RGB;
}
const linear = (c: number) => {
  const s = c / 255;
  return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
};
const lum = (rgb: RGB) => 0.2126 * linear(rgb[0]) + 0.7152 * linear(rgb[1]) + 0.0722 * linear(rgb[2]);
const contrast = (a: RGB, b: RGB) => (Math.max(lum(a), lum(b)) + 0.05) / (Math.min(lum(a), lum(b)) + 0.05);
const rgb = (name: string) => hexToRgb(hex(name));

const AA = 4.5;
const NON_TEXT = 3;

const CANVAS = rgb("--v3-ink-950"); // page canvas / section band A
const BAND = rgb("--v3-ink-900"); //   alternating band surface / cards
const PANEL = rgb("--v3-ink-850"); //  panel bodies / alt-band cards
const INPUT = rgb("--v3-ink-800"); //  inputs / nested fills

describe("V3 alternating band reads as distinct from the canvas", () => {
  it("the band surface is meaningfully lighter than the canvas (not one flat strip)", () => {
    // Both are near-black, so a text-style ratio is uninformative; guard the luminance step instead.
    expect(lum(BAND)).toBeGreaterThan(lum(CANVAS) * 2.5);
  });
  it("the surface stack stays strictly monotonic (canvas < band < panel < input)", () => {
    expect(lum(CANVAS)).toBeLessThan(lum(BAND));
    expect(lum(BAND)).toBeLessThan(lum(PANEL));
    expect(lum(PANEL)).toBeLessThan(lum(INPUT));
  });
  it("keeps the canvas off pure black so panels can sit above it", () => {
    expect(hex("--v3-ink-950").toLowerCase()).not.toBe("#000000");
  });
});

describe("V3 body/heading/muted text ≥ 4.5 on every surface it sits on (canvas + band + panel + input)", () => {
  const surfaces: [string, RGB][] = [["canvas", CANVAS], ["band", BAND], ["panel", PANEL], ["input", INPUT]];
  for (const token of ["--v3-on-strong", "--v3-on-body", "--v3-on-muted"]) {
    for (const [sn, s] of surfaces) {
      it(`${token} on ${sn} ≥ ${AA}`, () => expect(contrast(rgb(token), s)).toBeGreaterThanOrEqual(AA));
    }
  }
  // --v3-on-faint is DECORATIVE / disabled only → the non-text 3:1 bar, never body copy.
  for (const [sn, s] of surfaces) {
    it(`--v3-on-faint on ${sn} ≥ ${NON_TEXT} (decorative only)`, () =>
      expect(contrast(rgb("--v3-on-faint"), s)).toBeGreaterThanOrEqual(NON_TEXT));
  }
});

describe("V3 brand-text (links) ≥ 4.5 on the surfaces links sit on (up to the panel-body floor)", () => {
  // Links / accent text sit on the section bands, cards and panel bodies — never on the raw input
  // surface, so ink-850 is the documented floor.
  for (const [sn, s] of [["canvas", CANVAS], ["band", BAND], ["panel", PANEL]] as [string, RGB][]) {
    it(`--v3-brand-text on ${sn} ≥ ${AA}`, () => expect(contrast(rgb("--v3-brand-text"), s)).toBeGreaterThanOrEqual(AA));
  }
});

describe("V3 domain wayfinding inks ≥ 4.5 as text on canvas + band + panel", () => {
  for (const d of ["strategy", "build", "discover", "convert", "operate", "retain", "ai"]) {
    for (const [sn, s] of [["canvas", CANVAS], ["band", BAND], ["panel", PANEL]] as [string, RGB][]) {
      it(`domain-${d} on ${sn} ≥ ${AA}`, () =>
        expect(contrast(rgb(`--v3-domain-${d}`), s)).toBeGreaterThanOrEqual(AA));
    }
  }
});
