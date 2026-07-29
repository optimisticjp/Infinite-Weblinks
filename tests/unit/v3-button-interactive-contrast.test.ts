import { readFileSync, readdirSync, statSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { describe, it, expect } from "vitest";

/**
 * WCAG 2.2 AA contrast coverage for the Button's INTERACTIVE states on the V3 dark surfaces.
 *
 * axe (the e2e a11y pass) only ever evaluates the resting, default state — hover, focus-visible,
 * active and disabled are never rendered during a scan, so a contrast failure can hide in any of
 * them. A browser-based check would have to synthesise every state; static analysis is the right
 * tool. This test PARSES the interactive-state colour declarations straight out of
 * Button.module.css, resolves the referenced tokens against the REAL values in v3.css / v2.css
 * (no duplicated palette), and asserts every state clears its threshold. If someone re-points a
 * state at a lighter fill (e.g. the brand-TEXT hue under white), the parse picks up the new token
 * and the assertion fails here rather than shipping a state axe can't see.
 *
 * Thresholds: text ≥ 4.5:1 (AA 1.4.3); focus ring / functional border ≥ 3:1 (non-text 1.4.11);
 * disabled is WCAG-exempt (1.4.3 excludes inactive components) so it is documented, not gated.
 */

/** Strip CSS block comments so declaration/selector parsing never trips on documentation prose
 *  (e.g. a comment that mentions a `--token:` while explaining why it was removed). */
const stripComments = (s: string) => s.replace(/\/\*[\s\S]*?\*\//g, "");
const read = (rel: string) => stripComments(readFileSync(fileURLToPath(new URL(rel, import.meta.url)), "utf8"));
const v3 = read("../../src/styles/tokens/v3.css");
const v2 = read("../../src/styles/tokens/v2.css");
const btn = read("../../src/components/primitives/Button.module.css");

// ---------------------------------------------------------------- colour maths (sRGB)
type RGB = [number, number, number];
const WHITE: RGB = [255, 255, 255];
function hexToRgb(h: string): RGB {
  let s = h.replace("#", "").trim();
  if (s.length === 3) s = s.split("").map((c) => c + c).join("");
  return [0, 2, 4].map((i) => parseInt(s.slice(i, i + 2), 16)) as RGB;
}
/** Resolve a hex or rgb(a) literal to an opaque RGB, compositing any alpha over `bg`. */
function toRgb(value: string, bg: RGB = WHITE): RGB {
  const v = value.trim();
  if (v.startsWith("#")) return hexToRgb(v);
  const m = v.match(/rgba?\(([^)]+)\)/i);
  if (m) {
    const parts = m[1].split(",").map((x) => parseFloat(x.trim()));
    const [r, g, b] = parts;
    const a = parts.length > 3 ? parts[3] : 1;
    return [r, g, b].map((c, i) => Math.round(c * a + bg[i] * (1 - a))) as RGB;
  }
  throw new Error(`cannot parse colour literal: ${value}`);
}
const linear = (c: number) => {
  const s = c / 255;
  return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
};
const lum = (rgb: RGB) => 0.2126 * linear(rgb[0]) + 0.7152 * linear(rgb[1]) + 0.0722 * linear(rgb[2]);
const contrast = (a: RGB, b: RGB) => (Math.max(lum(a), lum(b)) + 0.05) / (Math.min(lum(a), lum(b)) + 0.05);

// ---------------------------------------------------------------- token maps (the REAL values)
/** Parse `--name: value;` declarations out of a `{ … }` block body. */
function declMap(body: string): Map<string, string> {
  const out = new Map<string, string>();
  for (const m of body.matchAll(/(--[a-z0-9-]+)\s*:\s*([^;]+);/gi)) {
    if (!out.has(m[1])) out.set(m[1], m[2].trim());
  }
  return out;
}
/** The body of the first rule whose selector text contains `needle` (no nested braces in these). */
function bodyAfter(css: string, needle: string): string {
  const i = css.indexOf(needle);
  if (i < 0) throw new Error(`selector not found: ${needle}`);
  const open = css.indexOf("{", i);
  const close = css.indexOf("}", open);
  return css.slice(open + 1, close);
}

// :root literals (--v3-*), the shared V3 semantic block, the per-theme surface blocks, and the V2
// :root (for names V3 does not remap, e.g. --v2-on-brand).
const v3root = declMap(bodyAfter(v3, ":root {"));
const sem = declMap(bodyAfter(v3, ".theme-deep-alt,")); // the `.theme-deep, .theme-deep-alt, .theme-night {` block
const v2root = declMap(bodyAfter(v2, ":root {"));
const surfaceBlock: Record<string, Map<string, string>> = {
  deep: declMap(bodyAfter(v3, ".theme-deep {")),
  "deep-alt": declMap(bodyAfter(v3, ".theme-deep-alt {")),
};

function lookup(name: string, theme: string): string | undefined {
  return surfaceBlock[theme]?.get(name) ?? sem.get(name) ?? v3root.get(name) ?? v2root.get(name);
}
/** Resolve a CSS value (possibly `var(--x, fallback)` chains) down to a colour literal. */
function resolveColor(expr: string, theme = "deep"): string {
  const v = expr.trim();
  if (v.startsWith("#") || v.startsWith("rgb")) return v;
  const m = v.match(/var\(\s*(--[a-z0-9-]+)\s*(?:,\s*([\s\S]+))?\)/i);
  if (!m) throw new Error(`cannot resolve expression: ${expr}`);
  const raw = lookup(m[1], theme);
  if (raw !== undefined) return resolveColor(raw, theme);
  if (m[2]) return resolveColor(m[2], theme);
  throw new Error(`unresolved token: ${m[1]}`);
}

// ---------------------------------------------------------------- parse Button.module.css states
function decl(body: string, prop: string): string {
  const m = body.match(new RegExp(`(?:^|;|\\n)\\s*${prop}\\s*:\\s*([^;]+);`));
  if (!m) throw new Error(`property ${prop} not found in block`);
  return m[1].trim();
}
// The V3-themed primary block, its hover block, and the base variant blocks.
const primaryRest = bodyAfter(btn, "theme-deep-alt) .primary {");
const primaryHover = bodyAfter(btn, "theme-deep-alt) .primary:hover:not(:disabled) {");
const STATE = {
  primaryText: decl(primaryRest, "color"), //            var(--v2-on-brand)  (white, kept on hover)
  primaryRestBg: decl(primaryRest, "background-color"), // var(--brand-fill, …)
  primaryHoverBg: decl(primaryHover, "background-color"), // var(--brand-fill, …)
  secondaryText: decl(bodyAfter(btn, ".secondary {"), "color"),
  secondaryHoverBg: decl(bodyAfter(btn, ".secondary:hover:not(:disabled) {"), "background"),
  ghostText: decl(bodyAfter(btn, ".ghost {"), "color"),
  ghostHoverBg: decl(bodyAfter(btn, ".ghost:hover:not(:disabled) {"), "background"),
  textRest: decl(bodyAfter(btn, ".text {"), "color"),
  textHover: decl(bodyAfter(btn, ".text:hover:not(:disabled) {"), "color"),
  focusShadow: decl(bodyAfter(btn, ".btn:focus-visible {"), "box-shadow"), // var(--ring)
  disabledOpacity: decl(bodyAfter(btn, ".btn:disabled {"), "opacity"),
};

const AA = 4.5;
const NON_TEXT = 3;
// The surface levels a button realistically sits on (section bands + raised cards / panel bodies),
// darkest → lightest. Light-text and link states must clear AA on the LIGHTEST of these.
const SURFACES: [string, RGB][] = [
  ["deep/canvas", toRgb(resolveColor("var(--surface)", "deep"))],
  ["deep/raised", toRgb(resolveColor("var(--surface-raised)", "deep"))],
  ["deep/raised-2", toRgb(resolveColor("var(--surface-raised-2)", "deep"))],
  ["deep-alt/canvas", toRgb(resolveColor("var(--surface)", "deep-alt"))],
  ["deep-alt/raised", toRgb(resolveColor("var(--surface-raised)", "deep-alt"))],
  ["deep-alt/raised-2", toRgb(resolveColor("var(--surface-raised-2)", "deep-alt"))],
];

describe("Button primary — white label on the CTA fill (rest + hover)", () => {
  const label = toRgb(resolveColor(STATE.primaryText));
  it("uses the CTA fill (--brand-fill / #6b4eff), NOT the lifted brand-text hue", () => {
    expect(resolveColor(STATE.primaryRestBg).toLowerCase()).toBe("#6b4eff");
    expect(resolveColor(STATE.primaryHoverBg).toLowerCase()).toBe("#6b4eff");
  });
  it(`rest: white on the fill ≥ ${AA}`, () => {
    expect(contrast(label, toRgb(resolveColor(STATE.primaryRestBg)))).toBeGreaterThanOrEqual(AA);
  });
  it(`hover: white on the fill ≥ ${AA} (feedback is elevation, not a hue shift)`, () => {
    expect(contrast(label, toRgb(resolveColor(STATE.primaryHoverBg)))).toBeGreaterThanOrEqual(AA);
  });
});

describe("Button primary — the brand-text hue is correctly NOT used as a fill under white", () => {
  // Negative control: white on --v3-brand-hover (#7a5fff, what a 'lighten on hover' would pick)
  // measures below AA — which is exactly why the hover stays on --brand-fill.
  it("white on --v3-brand-hover (#7a5fff) is BELOW 4.5 (documents the hazard)", () => {
    const hover = toRgb(resolveColor("var(--v3-brand-hover)"));
    expect(contrast(WHITE, hover)).toBeLessThan(AA);
  });
  it("neither the rest nor the hover fill resolves to the brand-text/hover hue", () => {
    for (const bg of [STATE.primaryRestBg, STATE.primaryHoverBg]) {
      const hex = resolveColor(bg).toLowerCase();
      expect(hex).not.toBe("#8b6bff"); // --v3-brand-text
      expect(hex).not.toBe("#7a5fff"); // --v3-brand-hover
    }
  });
});

describe("Button secondary + ghost — label on the hover surface", () => {
  const cases: [string, string, string][] = [
    ["secondary rest", STATE.secondaryText, "var(--surface)"],
    ["secondary hover", STATE.secondaryText, STATE.secondaryHoverBg],
    ["ghost rest", STATE.ghostText, "var(--surface)"],
    ["ghost hover", STATE.ghostText, STATE.ghostHoverBg],
  ];
  for (const [name, textExpr, bgExpr] of cases) {
    for (const [sn, surf] of SURFACES) {
      it(`${name} label ≥ ${AA} on ${sn}`, () => {
        const text = toRgb(resolveColor(textExpr, sn.startsWith("deep-alt") ? "deep-alt" : "deep"));
        // hover surfaces are a translucent wash → composite over the section surface behind them.
        const bg = toRgb(resolveColor(bgExpr, sn.startsWith("deep-alt") ? "deep-alt" : "deep"), surf);
        expect(contrast(text, bg)).toBeGreaterThanOrEqual(AA);
      });
    }
  }
});

describe("Button text variant — link colour on every button surface (rest + hover)", () => {
  for (const [sn, surf] of SURFACES) {
    it(`rest link ≥ ${AA} on ${sn}`, () => {
      expect(contrast(toRgb(resolveColor(STATE.textRest)), surf)).toBeGreaterThanOrEqual(AA);
    });
    it(`hover link ≥ ${AA} on ${sn}`, () => {
      expect(contrast(toRgb(resolveColor(STATE.textHover)), surf)).toBeGreaterThanOrEqual(AA);
    });
  }
});

describe("Button focus-visible ring — non-text contrast against adjacent surfaces", () => {
  // --ring = "0 0 0 2px var(--surface), 0 0 0 4px var(--v3-brand-text)": a surface-coloured gap
  // then the brand-text ring. The ring must clear 3:1 against BOTH the gap (--surface) and the
  // surface behind it, at every level a focused button can sit on.
  it("the button applies var(--ring) on focus-visible", () => {
    expect(STATE.focusShadow).toMatch(/var\(\s*--ring\s*\)/);
  });
  const ringVal = v3root.get("--v3-ring")!;
  const ringVars = [...ringVal.matchAll(/var\(\s*(--[a-z0-9-]+)/g)].map((m) => m[1]);
  const ringColor = toRgb(resolveColor(`var(${ringVars[ringVars.length - 1]})`)); // last var = colour
  it("the ring colour is the brand-text hue (#8b6bff)", () => {
    expect(ringVars[ringVars.length - 1]).toBe("--v3-brand-text");
    expect(resolveColor(`var(${ringVars[ringVars.length - 1]})`).toLowerCase()).toBe("#8b6bff");
  });
  for (const [sn, surf] of SURFACES) {
    it(`ring ≥ ${NON_TEXT} against ${sn}`, () => {
      expect(contrast(ringColor, surf)).toBeGreaterThanOrEqual(NON_TEXT);
    });
  }
});

describe("Button disabled — WCAG-exempt, but still visibly de-emphasised", () => {
  it("dims via opacity (inactive components carry no contrast requirement, 1.4.3)", () => {
    const o = parseFloat(STATE.disabledOpacity);
    expect(o).toBeGreaterThan(0);
    expect(o).toBeLessThan(1);
  });
});

// ---------------------------------------------------------------- the #7a5fff brand-hover value,
// wherever it is used — not just in Button. axe only sees resting states, so a fill painted with
// this value behind a hover/pressed icon (or, worse, behind text) can hide. It measures 4.28:1
// against white: fine behind a NON-TEXT icon (>= 3:1), a failure behind light TEXT (< 4.5:1).
const SRC = fileURLToPath(new URL("../../src", import.meta.url));
const readFile = (p: string) => readFileSync(p, "utf8");
function walk(dir: string): string[] {
  const out: string[] = [];
  for (const entry of readdirSync(dir)) {
    const p = `${dir}/${entry}`;
    if (statSync(p).isDirectory()) out.push(...walk(p));
    else if (p.endsWith(".module.css")) out.push(p);
  }
  return out;
}
const MODULE_CSS = walk(SRC);
const BRAND_HOVER = "#7a5fff"; // --v3-brand-hover, aliased by --v2-brand-strong (and the deleted --brand-strong)
// The three token names that resolve to #7a5fff on the V3 surfaces.
const HOVER_TOKENS = "(?:--v2-brand-strong|--v3-brand-hover|--brand-strong)";

describe("--v3-brand-hover (#7a5fff) — the fragile brand-hover value, everywhere it is used", () => {
  it("the live alias --v2-brand-strong resolves to #7a5fff on the deep surfaces", () => {
    expect(resolveColor("var(--v2-brand-strong)").toLowerCase()).toBe(BRAND_HOVER);
  });

  it("measures 4.28:1 vs white — below the 4.5 text bar, at/above the 3 non-text bar", () => {
    const c = contrast(WHITE, hexToRgb(BRAND_HOVER));
    expect(c).toBeLessThan(AA); // must never back light TEXT
    expect(c).toBeGreaterThanOrEqual(NON_TEXT); // may back a non-text graphic
  });

  it("the dead --brand-strong alias was removed from v3.css (comments aside)", () => {
    expect(v3).not.toMatch(/--brand-strong\s*:/); // `v3` is comment-stripped
  });

  it("is painted as a SOLID background in exactly one place: IconButton's icon-only hover", () => {
    const re = new RegExp(`background(?:-color)?\\s*:\\s*var\\(\\s*${HOVER_TOKENS}\\s*\\)`);
    const fills = MODULE_CSS.filter((f) => re.test(stripComments(readFile(f)))).map((f) => f.slice(SRC.length + 1));
    expect(fills).toEqual(["components/primitives/IconButton.module.css"]);
  });

  it("the white glyph on that hover fill is a non-text icon — clears 3:1 but NOT 4.5 (so never text)", () => {
    // IconButton paints color: var(--v2-on-brand) (white) — an SVG glyph, not a text label.
    const glyph = toRgb(resolveColor("var(--v2-on-brand)"));
    const c = contrast(glyph, hexToRgb(BRAND_HOVER));
    expect(c).toBeGreaterThanOrEqual(NON_TEXT);
    expect(c).toBeLessThan(AA);
  });

  it("as accent TEXT / icon colour it clears AA on the deep canvas it is designed to sit on", () => {
    expect(contrast(hexToRgb(BRAND_HOVER), toRgb(resolveColor("var(--surface)", "deep")))).toBeGreaterThanOrEqual(AA);
  });
});
