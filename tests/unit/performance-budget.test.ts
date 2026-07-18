import { describe, it, expect } from "vitest";
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { gzipSync } from "node:zlib";
import path from "node:path";

/**
 * Performance budget guard (brief §P4-01, review §10/§17, docs/reviews/performance-budget.md).
 *
 * Prevents unbounded first-load JS regression as visual richness is added. Runs only when a
 * production build exists (skips cleanly in a unit-only run), so it never blocks `npm run test`
 * without a build, but catches regressions in CI where `npm run build` precedes tests.
 *
 * It checks the STABLE core chunks (framework + main + polyfills) rather than trying to
 * classify vendor/lazy chunks, plus a per-chunk ceiling so no single top-level chunk balloons.
 */
const CHUNKS_DIR = path.resolve(".next/static/chunks");

function gz(file: string): number {
  return gzipSync(readFileSync(file)).length;
}

describe("performance budget (first-load JS)", () => {
  const hasBuild = existsSync(CHUNKS_DIR);

  it.skipIf(!hasBuild)("keeps the core framework/main/polyfills chunks within budget", () => {
    const files = readdirSync(CHUNKS_DIR).filter((f) => f.endsWith(".js"));
    const coreBytes = files
      .filter((f) => /^(framework|main|polyfills)[-.]/.test(f))
      .reduce((sum, f) => sum + gz(path.join(CHUNKS_DIR, f)), 0);

    // Baseline framework+main+polyfills ≈ 139 KB gz; ceiling gives ~15% headroom.
    const CORE_CEILING = 160 * 1024;
    expect(
      coreBytes,
      `core first-load JS ${(coreBytes / 1024).toFixed(1)}KB exceeds ${CORE_CEILING / 1024}KB budget`,
    ).toBeLessThanOrEqual(CORE_CEILING);
  });

  it.skipIf(!hasBuild)("keeps every top-level chunk under the single-chunk ceiling", () => {
    const files = readdirSync(CHUNKS_DIR).filter((f) => f.endsWith(".js"));
    const CHUNK_CEILING = 80 * 1024; // gz; largest baseline vendor chunk ≈ 63 KB
    const oversized = files
      .map((f) => ({ f, kb: gz(path.join(CHUNKS_DIR, f)) / 1024 }))
      .filter((c) => c.kb > CHUNK_CEILING / 1024);
    expect(
      oversized,
      `oversized chunks: ${oversized.map((c) => `${c.f} ${c.kb.toFixed(1)}KB`).join(", ")}`,
    ).toEqual([]);
  });
});
