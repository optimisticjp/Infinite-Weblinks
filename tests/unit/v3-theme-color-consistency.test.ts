import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { describe, it, expect } from "vitest";
import manifest from "@/app/manifest";

/**
 * V3 theme-colour consistency. The install manifest (app/manifest.ts) and the root viewport
 * (app/layout.tsx `themeColor`) both declare the browser / OS chrome colour. If they disagree, the
 * PWA splash and the address bar flash a different dark from the page on load. This guard pins both
 * to the V3 base canvas (--v3-ink-950 = #08080a) and — the point of the test — asserts they AGREE,
 * so a future edit to one file can't silently drift from the other again.
 */
const CANVAS = "#08080a";

const layout = readFileSync(fileURLToPath(new URL("../../src/app/layout.tsx", import.meta.url)), "utf8");
const layoutThemeColor = layout.match(/themeColor:\s*"(#[0-9a-fA-F]{6})"/)?.[1]?.toLowerCase();

const m = manifest();
const manifestBg = m.background_color?.toLowerCase();
const manifestTheme = m.theme_color?.toLowerCase();

describe("V3 theme-colour consistency (manifest ↔ root viewport)", () => {
  it("the manifest background_color and theme_color are the V3 canvas", () => {
    expect(manifestBg).toBe(CANVAS);
    expect(manifestTheme).toBe(CANVAS);
  });

  it("the root viewport themeColor is the V3 canvas", () => {
    expect(layoutThemeColor).toBe(CANVAS);
  });

  it("all three agree, so the chrome colour cannot drift between the two files", () => {
    expect(new Set([manifestBg, manifestTheme, layoutThemeColor]).size).toBe(1);
  });
});
