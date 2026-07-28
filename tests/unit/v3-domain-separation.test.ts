import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { describe, it, expect } from "vitest";

/**
 * Perceptual-separation coverage for the seven V3 wayfinding hues (`--v3-domain-*`).
 *
 * These hues are not decoration: they are the colour code for the seven service worlds, and they
 * render at tiny sizes — 7px legend dots and 2.5px accent rails — where hue is the ONLY cue. At
 * that size two colours that are close in CIE Lab read as the same world, so perceptual distance
 * is a FUNCTIONAL requirement, exactly like the WCAG contrast guarded in v2-contrast.test.ts.
 *
 * This is the guard that would have caught the V2 palette's weakness: there `ai` (#0f766e) and
 * `discover` (#0e7490) were both teal and only ΔE 23.1 apart — the closest pair in the palette —
 * so they were confusable at dot/rail sizes. V3 moved `ai` to gold (#f5cc57); the minimum pair is
 * now `strategy`/`build` at ΔE 28.8. See docs/design/v3-design-spec.md §3.1.
 *
 * Threshold: every one of the 21 pairs must be ≥ ΔE 25 (CIE Lab, ΔE76). 25 sits below V3's real
 * floor of 28.8 (so the current palette passes with headroom) and above the old confusable pair
 * at 23.1 (so a future edit that reintroduces a teal/teal-style collision fails here). Reads the
 * REAL values from src/styles/tokens/v3.css — no duplicated palette — so a token edit is covered.
 */

const css = readFileSync(fileURLToPath(new URL("../../src/styles/tokens/v3.css", import.meta.url)), "utf8");

const DOMAINS = ["strategy", "build", "discover", "convert", "operate", "retain", "ai"] as const;
const MIN_DELTA_E = 25;

/** Parse a `--v3-domain-<name>: #rrggbb;` value straight out of v3.css. */
function domainHex(name: string): string {
  const m = css.match(new RegExp(`--v3-domain-${name}\\s*:\\s*(#[0-9a-fA-F]{6})`));
  if (!m) throw new Error(`--v3-domain-${name} not found in v3.css`);
  return m[1];
}

type RGB = [number, number, number];
type Lab = [number, number, number];

function hexToRgb(hex: string): RGB {
  const s = hex.replace("#", "");
  return [0, 2, 4].map((i) => parseInt(s.slice(i, i + 2), 16)) as RGB;
}

/** sRGB (0–255) → CIE Lab (D65), the standard sRGB→XYZ→Lab pipeline. */
function rgbToLab(rgb: RGB): Lab {
  const inv = (c: number) => {
    const s = c / 255;
    return s <= 0.04045 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
  };
  const [r, g, b] = rgb.map(inv);
  // linear sRGB → XYZ, then normalise by the D65 reference white.
  let x = (0.4124564 * r + 0.3575761 * g + 0.1804375 * b) / 0.95047;
  let y = 0.2126729 * r + 0.7151522 * g + 0.072175 * b;
  let z = (0.0193339 * r + 0.119192 * g + 0.9503041 * b) / 1.08883;
  const f = (t: number) => (t > (6 / 29) ** 3 ? Math.cbrt(t) : t / (3 * (6 / 29) ** 2) + 4 / 29);
  [x, y, z] = [f(x), f(y), f(z)];
  return [116 * y - 16, 500 * (x - y), 200 * (y - z)];
}

/** CIE76 colour difference — Euclidean distance in Lab. */
const deltaE = (a: Lab, b: Lab): number => Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]);

const labs = new Map<string, Lab>(DOMAINS.map((d) => [d, rgbToLab(hexToRgb(domainHex(d)))]));

describe("V3 domain wayfinding hues — perceptual separation", () => {
  it("parses all seven --v3-domain-* hues from v3.css", () => {
    expect(labs.size).toBe(7);
  });

  // One assertion per pair (21 total) so a failure names the exact confusable pair.
  for (let i = 0; i < DOMAINS.length; i++) {
    for (let j = i + 1; j < DOMAINS.length; j++) {
      const a = DOMAINS[i];
      const b = DOMAINS[j];
      it(`${a} vs ${b} is ≥ ΔE ${MIN_DELTA_E}`, () => {
        const d = deltaE(labs.get(a)!, labs.get(b)!);
        expect(d, `${a}/${b} = ΔE ${d.toFixed(1)}`).toBeGreaterThanOrEqual(MIN_DELTA_E);
      });
    }
  }
});
