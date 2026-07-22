// @vitest-environment jsdom
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { describe, it, expect, afterEach, vi } from "vitest";
import { render, screen, cleanup, within } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";
import { ServiceDomainTemplate } from "@/components/routes/ServiceDomainTemplate";
import { serviceCategories, services, stages, goals } from "@/lib/content/data";
import { getServiceDomainConfig } from "@/lib/services/domains";
import { deliveryModelMeta } from "@/lib/design/deliveryModel";

vi.mock("next/link", () => ({
  default: ({ href, children, prefetch: _p, ...rest }: { href: unknown; children: unknown; prefetch?: unknown }) => {
    void _p;
    return (
      <a href={typeof href === "string" ? href : "#"} {...(rest as Record<string, unknown>)}>
        {children as never}
      </a>
    );
  },
}));

afterEach(cleanup);
const read = (rel: string) => readFileSync(fileURLToPath(new URL(rel, import.meta.url)), "utf8");
const readCode = (rel: string) =>
  read(rel)
    .replace(/\/\*[\s\S]*?\*\//g, "")
    .replace(/(^|[^:])\/\/.*$/gm, "$1");

// Build resolved props for a representative category (Strategy & Discovery).
const category = serviceCategories.find((c) => c.slug === "strategy-discovery")!;
const config = getServiceDomainConfig("strategy-discovery")!;
const catServices = services.filter((s) => s.categorySlug === "strategy-discovery");
const activeStage = stages.find((s) => s.slug === config.stageSlug)!;
const nextCategory = serviceCategories.find((c) => c.slug === config.next.slug)!;
const relatedGoals = [...new Set(catServices.flatMap((s) => s.goalSlugs))]
  .map((gs) => goals.find((g) => g.slug === gs))
  .filter((g): g is NonNullable<typeof g> => Boolean(g))
  .map((g) => ({ slug: g.slug, title: g.title, outcome: g.outcome }));

describe("ServiceDomainTemplate — source contract", () => {
  const src = readCode("../../src/components/routes/ServiceDomainTemplate.tsx");

  it("uses the V2 building blocks", () => {
    for (const used of ["PageHeader", "SectionShell", "ServiceOfferingCard", "ServiceConnectionList", "FinalCtaSection", "DomainCard", "RelationshipCard"]) {
      expect(src, `template uses ${used}`).toContain(used);
    }
    // serviceCopy precedence preserved exactly.
    expect(src).toMatch(/config\.serviceCopy\?\.\[service\.slug\]\s*\?\?\s*service\.plainDescription/);
  });

  it("no longer uses the cosmic / legacy constructs", () => {
    for (const banned of [
      "CosmicBackground",
      "ScrollThread",
      "NodeOrb",
      "GlowButton",
      "BentoCard",
      "BentoGrid",
      "ConnectorPath",
      "StageMarker",
      "MessageCard",
      "DELIVERY_COLOR",
      "theme-cosmic",
      "theme-band-bright",
    ]) {
      expect(src, `template no longer uses ${banned}`).not.toContain(banned);
    }
  });
});

describe("ServiceDomainTemplate — representative render (strategy-discovery)", () => {
  const renderIt = () =>
    render(
      <ServiceDomainTemplate
        config={config}
        category={category}
        services={catServices}
        activeStage={activeStage}
        nextCategory={nextCategory}
        relatedGoals={relatedGoals}
      />,
    );

  it("renders one H1 (the category name), the stage link, and all section fragments", () => {
    const { container } = renderIt();
    const h1 = screen.getAllByRole("heading", { level: 1 });
    expect(h1).toHaveLength(1);
    expect(h1[0]).toHaveTextContent(category.name);
    expect(container.querySelector(`a[href="/how-it-works#${config.stageSlug}"]`)).not.toBeNull();
    expect(screen.getByText(activeStage.name)).toBeVisible();
    for (const id of ["domain-outcomes", "domain-catalog", "domain-connects", "domain-forwho", "domain-next", "get-started"]) {
      expect(container.querySelector(`#${id}`), `#${id}`).not.toBeNull();
    }
  });

  it("renders every outcome, every cluster heading, and every service exactly once", () => {
    const { container } = renderIt();
    for (const o of config.outcomes) {
      expect(screen.getByRole("heading", { level: 3, name: o.title })).toBeInTheDocument();
    }
    for (const cluster of config.clusters) {
      expect(screen.getByRole("heading", { level: 3, name: cluster.heading })).toBeInTheDocument();
    }
    for (const s of catServices) {
      const article = container.querySelector(`article[id="${s.slug}"]`);
      expect(article, `service ${s.slug} once`).not.toBeNull();
      const scope = within(article as HTMLElement);
      expect(scope.getByRole("heading", { level: 4, name: s.name })).toBeInTheDocument();
      expect(scope.getByText(deliveryModelMeta(s.deliveryModel).label)).toBeVisible();
      for (const point of s.whatYouGet) expect(scope.getByText(point)).toBeVisible();
      for (const tool of s.exampleTools) expect(scope.getByText(tool)).toBeVisible();
    }
    // No arbitrary featured service — no ".featured" class or Bento in the tree.
    expect(container.querySelector('[class*="featured"], [class*="Bento"]')).toBeNull();
  });

  it("shows the non-endorsement clarification once, connections, related goals, forWho and the next area", () => {
    const { container } = renderIt();
    expect(screen.getByText("Example tools are illustrative. No partnership or endorsement is implied.")).toBeVisible();
    // How this connects: current category first.
    expect(screen.getByRole("heading", { level: 3, name: /Strategy & Discovery/ })).toBeInTheDocument();
    // Related goals card + at least one goal link.
    expect(screen.getByRole("heading", { level: 3, name: "Goals these services help with" })).toBeInTheDocument();
    if (relatedGoals[0]) {
      expect(container.querySelector(`a[href="/goals/${relatedGoals[0].slug}"]`)).not.toBeNull();
    }
    // Who it's for: every when item.
    for (const w of config.when) expect(screen.getByText(w)).toBeVisible();
    // Next area card → the resolved next category, plus a link back to /services.
    expect(container.querySelector(`a[href="/services/${config.next.slug}"]`)).not.toBeNull();
    expect(screen.getByText(config.next.name)).toBeVisible();
    expect(container.querySelector('a[href="/services"]')).not.toBeNull();
  });
});

describe("/services/[category] route — source contract", () => {
  const page = read("../../src/app/(marketing)/services/[category]/page.tsx");
  const code = readCode("../../src/app/(marketing)/services/[category]/page.tsx");

  it("preserves generateStaticParams, generateMetadata, notFound and all three JSON-LD graphs", () => {
    expect(page).toContain("generateStaticParams");
    expect(page).toContain("generateMetadata");
    expect(page).toContain("notFound");
    expect(page).toContain("breadcrumbJsonLd");
    expect(page).toContain("serviceJsonLd");
    expect(page).toContain("itemListJsonLd");
    expect(page).toMatch(/path:\s*`\/services\/\$\{category\.slug\}`/);
  });

  it("renders ServiceDomainTemplate for every valid category (the legacy PageHero fallback is gone)", () => {
    expect(code).toContain("ServiceDomainTemplate");
    expect(code).not.toContain("PageHero");
    expect(code).not.toContain("RelatedLinks");
    // Resolved props passed in (not the full delivery-model array).
    expect(page).toMatch(/activeStage=\{activeStage\}/);
    expect(page).toMatch(/nextCategory=\{nextCategory\}/);
    expect(page).toMatch(/relatedGoals=\{relatedGoals\}/);
    expect(page).not.toMatch(/deliveryModels=\{/);
  });
});

describe("legacy safety — removed-from-service components remain for their other consumers", () => {
  it("the legacy hero / viz components still exist (not deleted)", () => {
    for (const rel of [
      "../../src/components/routes/CosmicPageHero.tsx",
      "../../src/components/routes/PageHero.tsx",
      "../../src/components/viz/CosmicBackground.tsx",
      "../../src/components/viz/ScrollThread.tsx",
      "../../src/components/viz/StageMarker.tsx",
      "../../src/components/viz/ConnectorPath.tsx",
      "../../src/components/primitives/NodeOrb.tsx",
      "../../src/components/primitives/GlowButton.tsx",
      "../../src/components/primitives/BentoCard.tsx",
      "../../src/components/sections/FinalCtaBannerSection.tsx",
    ]) {
      expect(() => read(rel), `${rel} still exists`).not.toThrow();
    }
  });

  it("the non-migrated service consumers (/pricing) still use the legacy cosmic hero + banner", () => {
    const pricing = read("../../src/app/(marketing)/pricing/page.tsx");
    expect(pricing).toContain("CosmicPageHero");
    expect(pricing).toContain("FinalCtaBannerSection");
  });

  it("DELIVERY_COLOR is still exported for its remaining consumers", () => {
    const badge = read("../../src/components/primitives/Badge.tsx");
    expect(badge).toMatch(/export const DELIVERY_COLOR/);
  });
});
