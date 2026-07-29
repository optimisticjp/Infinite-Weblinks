import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, it, expect } from "vitest";

/**
 * V3 dark-first guard — no surface in the migrated app may re-scope itself back to the V2 LIGHT
 * theme. SectionShell / PageHeader now map their tone names to the dark surfaces, and the standalone
 * chrome / route / band overrides were flipped to theme-deep; this locks that in. A className that
 * sets `theme-light` (or `theme-light-alt`) turns one section light again on the dark canvas — the
 * exact regression this pass fixed (the site had rendered light despite the body being theme-deep).
 *
 * Scope: the section / chrome / route components, the (marketing) routes, and design-preview. The
 * ONLY allowed theme-light usages are the design-preview comparison swatches, which deliberately
 * render a theme-light surface beside the others to demonstrate the token system — those are
 * allowlisted. CSS modules keep their `:global(.theme-light)` STYLE blocks (that is how the class is
 * themed, not a surface opting into it), so this scans .tsx className usage only.
 */

const SRC = fileURLToPath(new URL("../../src", import.meta.url));
const DIRS = [
  "components/sections",
  "components/chrome",
  "components/routes",
  "app/(marketing)",
  "app/design-preview",
];

function tsxFiles(dir: string): string[] {
  let entries: string[];
  try {
    entries = readdirSync(dir);
  } catch {
    return [];
  }
  return entries.flatMap((e) => {
    const full = join(dir, e);
    return statSync(full).isDirectory() ? tsxFiles(full) : full.endsWith(".tsx") ? [full] : [];
  });
}

const files = DIRS.flatMap((d) => tsxFiles(join(SRC, d)));

// A className string opening with theme-light / theme-light-alt (backtick- or quote-prefixed). A
// `.theme-light` doc-comment reference or `>theme-light<` label text is NOT matched (the char before
// theme-light is `.` or `>`, not a string delimiter).
const THEME_LIGHT_CLASS = /[`"]theme-light(-alt)?[\s`"]/;
// The one legitimate exception: the design-preview swatches that demonstrate theme-light for contrast.
const isAllowedSwatch = (file: string, line: string) =>
  file.includes("design-preview") && line.includes("surfacePanel");

describe("V3 dark-first: no surface re-scopes to theme-light", () => {
  it("finds the section/chrome/route/marketing/design-preview tsx set (guard is not vacuous)", () => {
    expect(files.length).toBeGreaterThan(30);
  });

  it("no component or route sets a theme-light className (design-preview swatches allowlisted)", () => {
    const offenders: string[] = [];
    for (const file of files) {
      readFileSync(file, "utf8")
        .split("\n")
        .forEach((line, i) => {
          if (THEME_LIGHT_CLASS.test(line) && !isAllowedSwatch(file, line)) {
            offenders.push(`${file.slice(SRC.length + 1)}:${i + 1}  ${line.trim()}`);
          }
        });
    }
    // Empty = every surface is dark-themed. A failure lists each file:line that must move to theme-deep.
    expect(offenders).toEqual([]);
  });
});
