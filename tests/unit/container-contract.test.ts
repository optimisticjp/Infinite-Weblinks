import { describe, it, expect } from "vitest";
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

/**
 * Layout container contract (guards the site-wide alignment fix). `.iw-container--wide` is
 * a MODIFIER — it only widens `max-width`. Used without the base `.iw-container` it loses
 * `margin-inline: auto` + `padding-inline: var(--gutter)`, so the element goes flush-left
 * and touches the viewport edge (the header/hero/mega-menu/footer regression). This test
 * fails if the modifier-only pattern ever reappears in the source.
 */

const SRC = fileURLToPath(new URL("../../src", import.meta.url));

function walk(dir: string): string[] {
  return readdirSync(dir).flatMap((entry) => {
    const full = join(dir, entry);
    return statSync(full).isDirectory() ? walk(full) : [full];
  });
}

/** True when the line carries a standalone base `iw-container` (i.e. one NOT immediately
 * followed by the `--wide` modifier). */
const hasBaseContainer = (line: string) => /iw-container(?!--)/.test(line);

describe("layout container contract", () => {
  it("never uses `iw-container--wide` without the base `iw-container`", () => {
    const files = walk(SRC).filter((f) => f.endsWith(".tsx") || f.endsWith(".ts"));
    const offenders: string[] = [];

    for (const file of files) {
      readFileSync(file, "utf8")
        .split("\n")
        .forEach((line, i) => {
          if (line.includes("iw-container--wide") && !hasBaseContainer(line)) {
            offenders.push(`${file.replace(SRC, "src")}:${i + 1}`);
          }
        });
    }

    expect(
      offenders,
      `Found modifier-only container usage (add the base \`iw-container\`):\n${offenders.join("\n")}`,
    ).toEqual([]);
  });
});
