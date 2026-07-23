// @vitest-environment jsdom
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { describe, it, expect, afterEach, vi } from "vitest";
import { render, screen, cleanup, within } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";
import { ExamplesIndex } from "@/components/routes/ExamplesIndex";
import { ProofDetail } from "@/components/routes/ProofDetail";

/**
 * Phase 2S (§F) — the gated proof templates, migrated to V2. The production /examples routes stay
 * 404 until a Verified/Ready-to-Publish record exists, so the LATENT templates are exercised here as
 * pure presentation components with fixtures: a future verified record renders on the V2 kit
 * (PageHeader + light SectionShell + ExampleCard/FinalCtaSection), never the old cosmic/theme-band
 * design, with a single BreadcrumbList and no fabricated proof / Review / AggregateRating.
 */
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
const breadcrumbLists = (container: HTMLElement) =>
  Array.from(container.querySelectorAll('script[type="application/ld+json"]'))
    .map((s) => JSON.parse(s.textContent ?? "{}"))
    .filter((d) => d["@type"] === "BreadcrumbList");

const EXAMPLES = [
  { slug: "connected-store", title: "A connected store", summary: "Store, email and analytics working as one." },
  { slug: "local-service", title: "A local service site", summary: "A site that turns searches into enquiries." },
];

describe("ExamplesIndex — latent index template", () => {
  it("renders one H1, the Proof eyebrow, and a restrained whole-card link per example", () => {
    const { container } = render(<ExamplesIndex examples={EXAMPLES} />);
    const h1 = screen.getAllByRole("heading", { level: 1 });
    expect(h1).toHaveLength(1);
    expect(h1[0]).toHaveTextContent("Examples");
    expect(screen.getByText("Proof")).toBeVisible();
    for (const ex of EXAMPLES) {
      const heading = screen.getByRole("heading", { level: 3, name: ex.title });
      expect(heading).toBeInTheDocument();
      expect(screen.getByText(ex.summary)).toBeVisible();
      expect(container.querySelector(`a[href="/examples/${ex.slug}"]`), ex.slug).not.toBeNull();
    }
  });

  it("emits exactly one BreadcrumbList (Home → Examples) and the final CTA", () => {
    const { container } = render(<ExamplesIndex examples={EXAMPLES} />);
    const crumbs = breadcrumbLists(container);
    expect(crumbs).toHaveLength(1);
    expect(crumbs[0].itemListElement.map((i: { name: string }) => i.name)).toEqual(["Home", "Examples"]);
    expect(container.querySelector('#get-started a[href="/growth-plan"]')).not.toBeNull();
    expect(container.querySelector('#get-started a[href="/contact"]')).not.toBeNull();
  });
});

describe("ProofDetail — latent detail template", () => {
  const base = {
    collectionName: "Examples",
    collectionPath: "/examples",
    title: "A connected store",
    path: "/examples/connected-store",
    summary: "Store, email and analytics working as one connected system.",
  };

  it("renders the exact title as the H1, the summary, an optional meta line, and the CTA", () => {
    const { container } = render(<ProofDetail {...base} meta="Retail · connected system" />);
    const h1 = screen.getAllByRole("heading", { level: 1 });
    expect(h1).toHaveLength(1);
    expect(h1[0]).toHaveTextContent(base.title);
    expect(screen.getAllByText(base.summary).length).toBeGreaterThan(0);
    expect(screen.getByText("Retail · connected system")).toBeVisible();
    expect(container.querySelector('#get-started a[href="/growth-plan"]')).not.toBeNull();
  });

  it("emits exactly one BreadcrumbList: Home → Examples → title", () => {
    const { container } = render(<ProofDetail {...base} />);
    const crumbs = breadcrumbLists(container);
    expect(crumbs).toHaveLength(1);
    expect(crumbs[0].itemListElement.map((i: { name: string }) => i.name)).toEqual([
      "Home",
      "Examples",
      base.title,
    ]);
    // A breadcrumb link to the collection index, and the current record as non-link text.
    const nav = screen.getByRole("navigation", { name: "Breadcrumb" });
    expect(within(nav).getByRole("link", { name: "Examples" })).toHaveAttribute("href", "/examples");
  });
});

describe("gated-proof source contract (V2 + gate preserved)", () => {
  // Strip comments so the banned-construct checks see code, not doc comments that legitimately name
  // the removed constructs (PageHero, theme-band, HubGrid, IndexCard, Review, AggregateRating).
  const strip = (s: string) => s.replace(/\/\*[\s\S]*?\*\//g, "").replace(/(^|[^:])\/\/.*$/gm, "$1");
  const index = read("../../src/app/(marketing)/examples/page.tsx");
  const detail = read("../../src/app/(marketing)/examples/[slug]/page.tsx");
  const proof = read("../../src/components/routes/ProofDetail.tsx");
  const examplesIndex = read("../../src/components/routes/ExamplesIndex.tsx");

  it("the index keeps the 404 gate + ItemList and drops the cosmic constructs", () => {
    expect(index).toMatch(/if \(examples\.length === 0\) notFound\(\)/);
    expect(index).toContain("itemListJsonLd");
    expect(index).toContain("ExamplesIndex");
    for (const banned of ["PageHero", "HubGrid", "IndexCard", "theme-band"]) {
      expect(strip(index), `index no ${banned}`).not.toContain(banned);
      expect(strip(examplesIndex), `ExamplesIndex no ${banned}`).not.toContain(banned);
    }
  });
  it("the detail keeps generateStaticParams + notFound + ProofDetail", () => {
    expect(detail).toContain("generateStaticParams");
    expect(detail).toMatch(/if \(!example\) notFound\(\)/);
    expect(detail).toContain("ProofDetail");
  });
  it("ProofDetail is V2 (PageHeader, no PageHero/theme-band/self-emitted breadcrumb, no Review/AggregateRating)", () => {
    expect(proof).toContain("PageHeader");
    for (const banned of ["PageHero", "theme-band", "breadcrumbJsonLd", "Review", "AggregateRating"]) {
      expect(strip(proof), `ProofDetail no ${banned}`).not.toContain(banned);
    }
  });
});
