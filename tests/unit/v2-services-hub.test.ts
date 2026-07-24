import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { describe, it, expect } from "vitest";
import { serviceCategories } from "@/lib/content/data";

/**
 * Phase 2M — the migrated /services hub (source contract). The rendered output (16 links, real
 * counts, JSON-LD, axe) is covered by the e2e suite.
 */
const read = (rel: string) => readFileSync(fileURLToPath(new URL(rel, import.meta.url)), "utf8");
const readCode = (rel: string) =>
  read(rel)
    .replace(/\/\*[\s\S]*?\*\//g, "")
    .replace(/(^|[^:])\/\/.*$/gm, "$1");

describe("/services hub (source contract)", () => {
  const page = read("../../src/app/(marketing)/services/page.tsx");
  const code = readCode("../../src/app/(marketing)/services/page.tsx");

  it("keeps the metadata, canonical path and both JSON-LD graphs (breadcrumb + ItemList)", () => {
    expect(page).toMatch(/pageMetadata\(/);
    expect(page).toMatch(/path:\s*"\/services"/);
    expect(page).toContain("breadcrumbJsonLd");
    expect(page).toContain("itemListJsonLd");
  });

  it("uses PageHeader + a ServiceCategoryCard grid + FinalCtaSection with the retained ids", () => {
    for (const used of ["PageHeader", "ServiceCategoryCard", "CardGrid", "FinalCtaSection"]) {
      expect(page, `/services uses ${used}`).toContain(used);
    }
    for (const id of ['"services-hero"', '"service-domains"', '"get-started"']) {
      expect(page, `/services keeps id ${id}`).toContain(id);
    }
    // One card per category, in source order, linking to its category route.
    expect(page).toMatch(/categories\.map\(\(category, i\)/);
    expect(page).toMatch(/href=\{`\/services\/\$\{category\.slug\}`\}/);
    // No featured-first card (every card uses the same component with order={i + 1}).
    expect(page).not.toMatch(/i === 0|featured/);
  });

  it("removes the cosmic/legacy hub constructs", () => {
    for (const banned of [
      "CosmicPageHero",
      "GlowButton",
      "NodeOrb",
      "BentoCard",
      "BentoGrid",
      "FinalCtaBannerSection",
      "iw-gradient-word",
    ]) {
      expect(code, `/services no longer uses ${banned}`).not.toContain(banned);
    }
  });

  it("still has 16 renderable categories for the ItemList", () => {
    expect(serviceCategories.filter((c) => c.status === "verified" || c.status === "readyToPublish")).toHaveLength(16);
  });
});
