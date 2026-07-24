import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { describe, it, expect } from "vitest";

/**
 * Automated WCAG 2.2 AA contrast coverage for the V2 foundation tokens.
 *
 * Reads the REAL values from src/styles/tokens/v2.css (no duplicated palette), so a token
 * edit that regresses contrast fails here. Covers text on paper/night, white-on-brand,
 * white across the sampled signature gradient, domain inks on white + their tints, status
 * colours on white + their tints, functional borders, and the focus indicator.
 */

const css = readFileSync(
  fileURLToPath(new URL("../../src/styles/tokens/v2.css", import.meta.url)),
  "utf8",
);

// --- parse `--v2-name: value;` declarations from :root ---
const tokens = new Map<string, string>();
for (const m of css.matchAll(/(--v2-[a-z0-9-]+)\s*:\s*([^;]+);/g)) {
  if (!tokens.has(m[1])) tokens.set(m[1], m[2].trim());
}
const raw = (name: string): string => {
  const v = tokens.get(name);
  if (!v) throw new Error(`token ${name} not found in v2.css`);
  return v;
};

// --- colour maths (sRGB) ---
type RGB = [number, number, number];
const WHITE: RGB = [255, 255, 255];
function hexToRgb(h: string): RGB {
  let s = h.replace("#", "").trim();
  if (s.length === 3) s = s.split("").map((c) => c + c).join("");
  return [0, 2, 4].map((i) => parseInt(s.slice(i, i + 2), 16)) as RGB;
}
/** Resolve a token value (hex or rgba) to an opaque RGB, compositing alpha over `bg`. */
function toRgb(value: string, bg: RGB = WHITE): RGB {
  const v = value.trim();
  if (v.startsWith("#")) return hexToRgb(v);
  const m = v.match(/rgba?\(([^)]+)\)/);
  if (m) {
    const parts = m[1].split(",").map((x) => parseFloat(x.trim()));
    const [r, g, b] = parts;
    const a = parts.length > 3 ? parts[3] : 1;
    return [r, g, b].map((c, i) => Math.round(c * a + bg[i] * (1 - a))) as RGB;
  }
  throw new Error(`cannot parse colour: ${value}`);
}
const linear = (c: number) => {
  const s = c / 255;
  return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
};
const lum = (rgb: RGB) => 0.2126 * linear(rgb[0]) + 0.7152 * linear(rgb[1]) + 0.0722 * linear(rgb[2]);
function contrast(a: RGB, b: RGB): number {
  const l1 = lum(a);
  const l2 = lum(b);
  return (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);
}
const tok = (name: string, bg: RGB = WHITE) => toRgb(raw(name), bg);

const PAPER = tok("--v2-paper");
const PAPER2 = tok("--v2-paper-2");
const PAPER3 = tok("--v2-paper-3");
const NIGHT950 = tok("--v2-night-950");
const NIGHT900 = tok("--v2-night-900");
const AA = 4.5;
const NON_TEXT = 3;

describe("V2 text on light surfaces", () => {
  const surfaces: [string, RGB][] = [["paper", PAPER], ["paper-2", PAPER2], ["paper-3", PAPER3]];
  for (const [sn, s] of surfaces) {
    it(`ink-strong on ${sn} ≥ ${AA}`, () => expect(contrast(tok("--v2-ink-strong"), s)).toBeGreaterThanOrEqual(AA));
    it(`ink-body on ${sn} ≥ ${AA}`, () => expect(contrast(tok("--v2-ink-body"), s)).toBeGreaterThanOrEqual(AA));
    it(`ink-muted on ${sn} ≥ ${AA}`, () => expect(contrast(tok("--v2-ink-muted"), s)).toBeGreaterThanOrEqual(AA));
    it(`ink-faint on ${sn} ≥ ${NON_TEXT} (disabled/decorative)`, () =>
      expect(contrast(tok("--v2-ink-faint"), s)).toBeGreaterThanOrEqual(NON_TEXT));
  }
});

describe("V2 text on night surfaces", () => {
  for (const [sn, s] of [["night-950", NIGHT950], ["night-900", NIGHT900]] as [string, RGB][]) {
    it(`on-night on ${sn} ≥ ${AA}`, () => expect(contrast(tok("--v2-on-night", s), s)).toBeGreaterThanOrEqual(AA));
    it(`on-night-muted on ${sn} ≥ ${AA}`, () =>
      expect(contrast(tok("--v2-on-night-muted", s), s)).toBeGreaterThanOrEqual(AA));
  }
});

describe("V2 brand + links", () => {
  it("white on brand ≥ 4.5", () => expect(contrast(tok("--v2-on-brand"), tok("--v2-brand"))).toBeGreaterThanOrEqual(AA));
  it("white on brand-strong ≥ 4.5", () =>
    expect(contrast(tok("--v2-on-brand"), tok("--v2-brand-strong"))).toBeGreaterThanOrEqual(AA));
  it("brand as link text on paper ≥ 4.5", () =>
    expect(contrast(tok("--v2-brand"), PAPER)).toBeGreaterThanOrEqual(AA));
});

describe("V2 signature gradient — white across sampled stops", () => {
  const from = hexToRgb(raw("--v2-grad-signature-from"));
  const to = hexToRgb(raw("--v2-grad-signature-to"));
  // sanity: the exposed endpoints match the gradient token itself
  const grad = raw("--v2-grad-signature");
  it("exposed endpoints match the gradient token", () => {
    const hexes = grad.match(/#[0-9a-f]{6}/gi) ?? [];
    expect(hexes.map((h) => h.toLowerCase())).toEqual([
      raw("--v2-grad-signature-from").toLowerCase(),
      raw("--v2-grad-signature-to").toLowerCase(),
    ]);
  });
  for (let i = 0; i <= 10; i++) {
    const t = i / 10;
    it(`white on gradient @ ${t * 100}% ≥ ${AA}`, () => {
      const c = from.map((v, k) => Math.round(v + (to[k] - v) * t)) as RGB;
      expect(contrast(WHITE, c)).toBeGreaterThanOrEqual(AA);
    });
  }
});

describe("V2 domain wayfinding inks (on white + on own tint)", () => {
  for (const d of ["strategy", "build", "discover", "convert", "operate", "retain", "ai"]) {
    const ink = tok(`--v2-domain-${d}-ink`);
    const tint = tok(`--v2-domain-${d}-tint`);
    it(`domain-${d}-ink on white ≥ ${AA}`, () => expect(contrast(ink, PAPER)).toBeGreaterThanOrEqual(AA));
    it(`domain-${d}-ink on ${d}-tint ≥ ${AA}`, () => expect(contrast(ink, tint)).toBeGreaterThanOrEqual(AA));
  }
});

describe("V2 domain Badge tone — ink on the 8% tint (matches Badge.module.css .domain)", () => {
  // Badge `.domain` renders color-mix(in srgb, <ink> 8%, white) as the surface. Guard that
  // every domain ink stays ≥ 4.5:1 on that computed tint as small badge text.
  const mix8 = (ink: RGB): RGB => ink.map((c) => Math.round(c * 0.08 + 255 * 0.92)) as RGB;
  for (const d of ["strategy", "build", "discover", "convert", "operate", "retain", "ai"]) {
    it(`domain-${d}-ink on 8% badge tint ≥ ${AA}`, () => {
      const ink = tok(`--v2-domain-${d}-ink`);
      expect(contrast(ink, mix8(ink))).toBeGreaterThanOrEqual(AA);
    });
  }
});

describe("V2 status colours (on white + on own tint)", () => {
  for (const s of ["success", "warning", "danger", "info"]) {
    const ink = tok(`--v2-${s}`);
    const tint = tok(`--v2-${s}-tint`);
    it(`${s} on white ≥ ${AA}`, () => expect(contrast(ink, PAPER)).toBeGreaterThanOrEqual(AA));
    it(`${s} on ${s}-tint ≥ ${AA}`, () => expect(contrast(ink, tint)).toBeGreaterThanOrEqual(AA));
  }
});

describe("V2 night accent (theme-night links + BentoCard night treatment)", () => {
  const linkNight = tok("--v2-link-night");
  // Mix the night accent over the night surface the way Bento.module.css builds the night
  // icon-tile background: color-mix(link-night 16%, night-950).
  const mixNight = (fg: RGB, p: number): RGB =>
    fg.map((c, i) => Math.round(c * p + NIGHT950[i] * (1 - p))) as RGB;

  it("link-night as text/icon on night-950 ≥ 4.5", () =>
    expect(contrast(linkNight, NIGHT950)).toBeGreaterThanOrEqual(AA));
  it("link-night as text/icon on night-900 ≥ 4.5", () =>
    expect(contrast(linkNight, NIGHT900)).toBeGreaterThanOrEqual(AA));
  it("link-night glyph on its 16% night icon-tile ≥ 3 (non-text)", () =>
    expect(contrast(linkNight, mixNight(linkNight, 0.16))).toBeGreaterThanOrEqual(NON_TEXT));
});

describe("V2 functional borders + focus indicator (non-text ≥ 3)", () => {
  it("functional border (line-strong) on paper ≥ 3", () =>
    expect(contrast(tok("--v2-line-strong"), PAPER)).toBeGreaterThanOrEqual(NON_TEXT));
  it("functional border on paper-2 ≥ 3", () =>
    expect(contrast(tok("--v2-line-strong"), PAPER2)).toBeGreaterThanOrEqual(NON_TEXT));
  it("night functional border on night-950 ≥ 3", () =>
    expect(contrast(tok("--v2-line-night-strong", NIGHT950), NIGHT950)).toBeGreaterThanOrEqual(NON_TEXT));
  it("focus ring (brand) vs paper ≥ 3", () =>
    expect(contrast(tok("--v2-brand"), PAPER)).toBeGreaterThanOrEqual(NON_TEXT));
  it("focus ring (brand) vs night-950 ≥ 3", () =>
    expect(contrast(tok("--v2-brand"), NIGHT950)).toBeGreaterThanOrEqual(NON_TEXT));
});
