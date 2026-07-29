import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, it, expect } from "vitest";

/**
 * V3 dark-surface guard — no CSS module may reference the V2 light-paper / dark-ink PRIMITIVES
 * (--v2-paper*, --v2-ink-*) directly.
 *
 * Why the rest of the suite can't catch this: the V3 "Instrument" flip works because components read
 * SEMANTIC token names (--surface*, --surface-input, --text-*, --cta-text) that the .theme-deep
 * mapping re-themes. The --v2-paper and --v2-ink- primitives are the raw LIGHT values and are NOT
 * remapped by the theme classes, so a module reading one renders a light value on the dark canvas —
 * a near-white card, an invisible input, or dark-on-dark text. No snapshot or render test in this
 * suite exercises that, which is exactly how the regression this guard replaces slipped through.
 *
 * The guard globs EVERY *.module.css under src/ (not a fixed allowlist), so it also protects the
 * modules migrated route-by-route during the Phase 4 rollout, not just the ones fixed today.
 */

const SRC = fileURLToPath(new URL("../../src", import.meta.url));

/** Every *.module.css under src/, found by walking the tree (no glob dependency). */
function moduleCssFiles(dir: string): string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) return moduleCssFiles(full);
    return entry.name.endsWith(".module.css") ? [full] : [];
  });
}

/** CSS declarations only — block comments stripped, so a doc comment that names a banned token
 *  (e.g. "migrated off --v2-paper") documents the history without tripping the guard. */
const declarationsOf = (file: string) => readFileSync(file, "utf8").replace(/\/\*[\s\S]*?\*\//g, "");

// --v2-paper, --v2-paper-2/-3, and the whole --v2-ink-* scale (strong / body / muted / faint).
const FORBIDDEN = /--v2-(?:paper|ink-)[a-z0-9-]*/gi;

const files = moduleCssFiles(SRC);

describe("V3 dark-surface token guard (src/**/*.module.css)", () => {
  it("discovers the CSS-module set, so the guard is never vacuously green", () => {
    expect(files.length).toBeGreaterThan(50);
  });

  it("no CSS module references a --v2-paper* or --v2-ink-* light primitive", () => {
    const offenders = files
      .map((file) => {
        const hits = declarationsOf(file).match(FORBIDDEN);
        return hits ? `${file.slice(SRC.length + 1)} → ${[...new Set(hits)].join(", ")}` : null;
      })
      .filter((entry): entry is string => entry !== null);

    // Empty array = clean. A failure prints each offending module and the exact token(s) it must
    // swap for a semantic surface/text/cta token.
    expect(offenders).toEqual([]);
  });
});
