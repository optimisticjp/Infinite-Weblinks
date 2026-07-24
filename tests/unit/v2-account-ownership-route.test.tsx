import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { describe, it, expect } from "vitest";
import { accountOwnership } from "@/lib/content/data/account-ownership";

/**
 * Phase 2L — the migrated /account-ownership route (source contract). The page composes async
 * server sections + JSON-LD; the rendered output (assets, flow, guarantees, closing, a11y) is
 * covered by OwnershipDetails unit tests and the e2e suite.
 */
const read = (rel: string) => readFileSync(fileURLToPath(new URL(rel, import.meta.url)), "utf8");
const readCode = (rel: string) =>
  read(rel)
    .replace(/\/\*[\s\S]*?\*\//g, "")
    .replace(/(^|[^:])\/\/.*$/gm, "$1");

describe("/account-ownership route (source contract)", () => {
  const page = read("../../src/app/(marketing)/account-ownership/page.tsx");
  const code = readCode("../../src/app/(marketing)/account-ownership/page.tsx");

  it("keeps the metadata, canonical path and breadcrumb JSON-LD", () => {
    expect(page).toMatch(/pageMetadata\(/);
    expect(page).toMatch(/path:\s*"\/account-ownership"/);
    expect(page).toContain("breadcrumbJsonLd");
  });

  it("uses PageHeader + a single ownership section (id=ownership) composing OwnershipDetails", () => {
    expect(page).toContain("PageHeader");
    expect(page).toContain("OwnershipDetails");
    expect(page).toContain("FinalCtaSection");
    expect(page).toMatch(/id="ownership-hero"/);
    expect(page).toMatch(/id="ownership"/);
    expect(page).toMatch(/id="get-started"/);
    // A clear information Callout about documented access/ownership.
    expect(page).toContain("Callout");
    expect(page).toMatch(/continue with Infinite Weblinks, bring the work in-house, or\s+move on/);
  });

  it("drives the CTAs from the real accountOwnership data (destinations retained)", () => {
    expect(page).toMatch(/ownership\.primaryCta\.route/);
    expect(page).toMatch(/ownership\.secondaryCta\.route/);
    // The real destinations resolve to the approved routes.
    expect(accountOwnership.primaryCta.route).toBe("/growth-plan");
    expect(accountOwnership.secondaryCta.route).toBe("/how-it-works");
  });

  it("removes the cosmic/legacy constructs (no duplicated ownership CTA inside the detail)", () => {
    for (const banned of ["CosmicPageHero", "GlowButton", "NodeOrb", "iw-gradient-word", "AccountOwnershipSection"]) {
      expect(code, `/account-ownership no longer uses ${banned}`).not.toContain(banned);
    }
  });
});
