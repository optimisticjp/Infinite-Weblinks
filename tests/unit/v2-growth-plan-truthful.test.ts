import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { describe, it, expect } from "vitest";

/**
 * Phase 2P — truthfulness + migration contract for the Growth Plan Builder surface.
 *
 * The plan is generated client-side and shown on screen; the optional email form is a REVIEW
 * REQUEST, not a "we've emailed you a copy" delivery. These source-contract checks pin the corrected
 * copy in place and guard against the old, misleading phrasing creeping back. The vitest CSS strategy
 * makes class-based assertions weak, so we assert on the component source (whitespace-normalised).
 */

const read = (rel: string) => readFileSync(fileURLToPath(new URL(rel, import.meta.url)), "utf8");
const squish = (s: string) => s.replace(/\s+/g, " ");
/** Strip block ( /* … *​/, incl. JSX ) and whole-line ( // ) comments, so the truthfulness sweep
 *  checks the RENDERED copy, not documentation that deliberately names the banned phrases. */
const stripComments = (s: string) =>
  s.replace(/\/\*[\s\S]*?\*\//g, "").replace(/^\s*\/\/.*$/gm, "");

const builder = read("../../src/components/builder/PlanBuilder.tsx");
const builderSquished = squish(builder);
const reveal = read("../../src/components/builder/PlanReveal.tsx");
const revealSquished = squish(reveal);
const page = read("../../src/app/(convert)/growth-plan/page.tsx");
const pageSquished = squish(page);
const content = read("../../src/lib/content/data/growth-plan.ts");
const llms = read("../../src/app/llms.txt/route.ts");

describe("PlanBuilder — truthful review-request follow-up copy", () => {
  const present = [
    "Ask us to review this plan",
    "The plan above is already yours to read on screen. Add your details if you would like a real person to review it and reply by email with a practical next step.",
    "Send my plan for review",
    "Thanks, your plan was sent to our team.",
    "A real person will review it and reply by email with a practical next step. The plan above remains available on screen.",
  ];
  for (const phrase of present) {
    it(`includes: ${phrase.slice(0, 48)}…`, () => {
      expect(builderSquished).toContain(squish(phrase));
    });
  }

  const absent = [
    "Get this plan by email",
    "Send my plan by email",
    "your plan is on its way",
    "sent this plan to your email",
    "yours either way",
    "Want a copy to keep",
  ];
  for (const phrase of absent) {
    it(`no longer claims: ${phrase}`, () => {
      expect(builderSquished).not.toContain(squish(phrase));
    });
  }
});

describe("PlanBuilder — V2 controls + preserved API contract", () => {
  it("drops the legacy GlowButton and InfinityMark, uses the V2 Button + IconTile", () => {
    expect(builder).not.toMatch(/GlowButton|InfinityMark/);
    expect(builder).toMatch(/from "@\/components\/primitives\/Button"/);
    expect(builder).toMatch(/from "@\/components\/primitives\/IconTile"/);
  });

  it("wires the submit through the Button loading contract", () => {
    expect(builder).toMatch(/loading=\{status === "submitting"\}/);
  });

  it("opts all five follow-up fields into the V2 control appearance", () => {
    const count = (builder.match(/appearance="v2"/g) ?? []).length;
    expect(count).toBe(5);
  });

  it("still posts to the protected route and validates with growthPlanSchema (unchanged behaviour)", () => {
    expect(builder).toContain('fetch("/api/forms/growth-plan"');
    expect(builder).toMatch(/growthPlanSchema\.safeParse/);
    expect(builder).toContain("growthPlanRuleSet");
  });

  it("introduces no client persistence (no storage / accounts / autoresponder)", () => {
    expect(builder).not.toMatch(/localStorage|sessionStorage|autoresponder/i);
  });
});

describe("PlanReveal — migration contract in source", () => {
  it("no longer imports NodeOrb or ConnectorPath", () => {
    expect(stripComments(reveal)).not.toMatch(/NodeOrb|ConnectorPath/);
  });
  it("keeps the result test id and never renders matchedRuleId", () => {
    expect(reveal).toContain('data-testid="growth-plan-result"');
    expect(reveal).not.toContain("matchedRuleId");
  });
  it("carries the reusable-model framing and the tools disclaimer, not the old phrasing", () => {
    expect(revealSquished).toContain("mapped from a reviewed framework");
    expect(revealSquished).toContain("not every business needs every stage");
    expect(revealSquished).toContain(
      "Example tools are illustrative. No partnership or endorsement is implied.",
    );
    expect(revealSquished).not.toContain("the same growth journey we use with everyone");
    expect(reveal).not.toMatch(/end up with/i);
  });
});

describe("/growth-plan route — metadata + truthful hero", () => {
  it("keeps noindex, follow and the self-canonical", () => {
    expect(pageSquished).toContain("robots: { index: false, follow: true }");
    expect(page).toContain('canonical("/growth-plan")');
  });
  it("hero lead is truthful (no account; plan appears on screen)", () => {
    expect(pageSquished).toContain("No account needed");
  });
  it("composes the builder, the plan-include cards and the final CTA", () => {
    expect(page).toMatch(/<PlanBuilder\b/);
    expect(page).toMatch(/<PlanIncludeCard\b/);
    expect(page).toMatch(/<FinalCtaSection\b/);
  });
});

describe("growth-plan surface — no false keep/download/delivery claims anywhere", () => {
  const banned = [
    /yours to keep/i,
    /plan is on its way/i,
    /sent this plan to your email/i,
    /download your plan/i,
    /Send my plan by email/i,
    /the same growth journey we use with everyone/i,
  ];
  for (const [file, src] of Object.entries({
    "PlanBuilder.tsx": stripComments(builder),
    "PlanReveal.tsx": stripComments(reveal),
    "growth-plan/page.tsx": stripComments(page),
    "growth-plan.ts": stripComments(content),
    "llms.txt/route.ts": stripComments(llms),
  })) {
    for (const pattern of banned) {
      it(`${file} contains no ${pattern}`, () => {
        expect(src).not.toMatch(pattern);
      });
    }
  }
});
