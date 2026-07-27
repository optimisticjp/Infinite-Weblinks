import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { describe, it, expect } from "vitest";

/**
 * Phase 2I §A regressions for the three Phase 2H corrections:
 *  1. the Phase 2H report records FOUR new components, not five;
 *  2. no goal-detail route claims every business follows the same journey/sequence;
 *  3. GoalPath's marker uses a semantic surface token, never a raw named colour.
 *
 * (3) was updated for the V3 "Instrument" dark flip: the marker tint now mixes against the semantic
 * --surface-raised (re-themed by .theme-deep), not the V2 light-paper primitive --v2-paper. The
 * intent the check guards — a semantic surface token, never a raw white/black keyword — is unchanged.
 */

const read = (rel: string) => readFileSync(fileURLToPath(new URL(rel, import.meta.url)), "utf8");

describe("Phase 2H report component count", () => {
  const report = read("../../docs/design/phase-2h-implementation-report.md");

  it("states four new components were added, not five", () => {
    expect(report).toMatch(/Added four components/);
    expect(report).not.toMatch(/Added five components/);
  });

  it("names exactly the four new components and marks the two reused ones", () => {
    expect(report).toMatch(/GoalPath.*GoalCard.*ServiceCard.*JourneyStageCard/s);
    expect(report).toMatch(/reused DomainCard \/ RoadmapCard/);
  });
});

describe("goal-detail journey copy is truthful", () => {
  const goalDetail = read("../../src/app/(marketing)/goals/[slug]/page.tsx");

  it("does not claim every business follows the same journey or sequence", () => {
    // The route-level copy must not assert a universal, identical journey/sequence.
    expect(goalDetail).not.toMatch(/every business (moves through|follows) the same (journey|sequence)/i);
    expect(goalDetail).not.toMatch(/same journey/i);
  });

  it("keeps the growth-journey framed as a useful, tailored map", () => {
    expect(goalDetail).toMatch(/useful map/i);
    expect(goalDetail).toMatch(/tailored/i);
  });
});

describe("GoalPath marker uses a semantic token, not a raw named colour", () => {
  const css = read("../../src/components/routes/GoalPath.module.css").replace(/\/\*[\s\S]*?\*\//g, "");

  it("mixes the marker tint against var(--surface-raised), never the raw white keyword", () => {
    expect(css).toMatch(/color-mix\(in srgb, var\(--path-ink\) 8%, var\(--surface-raised\)\)/);
    expect(css).not.toMatch(/(?<![\w-])(white|black)(?![\w-])/i);
  });
});
