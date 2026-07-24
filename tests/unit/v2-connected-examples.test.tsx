// @vitest-environment jsdom
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { describe, it, expect, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";
import { ConnectedExampleCard } from "@/components/cards/ConnectedExampleCard";
import { connectedExamples } from "@/lib/content/data/connected-examples";

/**
 * Phase 2L — ConnectedExampleCard (static illustrative combination card) and the /connected-growth
 * route source contract.
 */
afterEach(cleanup);
const read = (rel: string) => readFileSync(fileURLToPath(new URL(rel, import.meta.url)), "utf8");
const readCode = (rel: string) =>
  read(rel)
    .replace(/\/\*[\s\S]*?\*\//g, "")
    .replace(/(^|[^:])\/\/.*$/gm, "$1");

describe("ConnectedExampleCard", () => {
  const base = {
    title: "Turn visitors into customers",
    summary: "Improve the store, the tracking and the advertising together.",
    goalHint: "Sell more products",
    services: ["Store & checkout", "Conversion", "Paid ads"],
    tone: "var(--pink)",
  };

  it("is a static Card with an information Badge, goalHint, H3 title, summary and a Chip per service", () => {
    const { container } = render(<ConnectedExampleCard {...base} />);
    expect(container.querySelector("a"), "no link").toBeNull();
    expect(container.querySelector("button"), "no button").toBeNull();
    expect(screen.getByText("Illustrative combination")).toBeVisible();
    expect(screen.getByText(base.goalHint)).toBeVisible();
    expect(screen.getByRole("heading", { level: 3, name: base.title })).toBeInTheDocument();
    expect(screen.getByText(base.summary)).toBeVisible();
    for (const service of base.services) {
      expect(screen.getByText(service)).toBeVisible();
    }
    // The services are a semantic list.
    const chips = container.querySelector('ul[aria-label="Areas connected in this combination"]');
    expect(chips?.querySelectorAll("li")).toHaveLength(base.services.length);
  });

  it("maps the tone to a V2 ink and carries no false 'see how it works' affordance", () => {
    const { container } = render(<ConnectedExampleCard {...base} />);
    const root = container.querySelector("article") as HTMLElement;
    expect(root.style.getPropertyValue("--card-accent")).toBe("var(--v2-domain-convert-ink)");
    expect(container.textContent ?? "").not.toMatch(/see how it works/i);
  });

  it("uses no result/testimonial/metric language and no featured state or legacy theme field", () => {
    const { container } = render(<ConnectedExampleCard {...base} />);
    const text = container.textContent ?? "";
    expect(text).not.toMatch(/[£$€]\s?\d|\b\d+%|increase|ROI|testimonial|result/i);
    const src = readCode("../../src/components/cards/ConnectedExampleCard.tsx");
    expect(src).not.toMatch(/featured|\.theme\b|theme ===|Featured/);
  });
});

describe("/connected-growth route (source contract)", () => {
  const page = read("../../src/app/(marketing)/connected-growth/page.tsx");
  const code = readCode("../../src/app/(marketing)/connected-growth/page.tsx");

  it("keeps the metadata, canonical path and breadcrumb JSON-LD", () => {
    expect(page).toMatch(/pageMetadata\(/);
    expect(page).toMatch(/path:\s*"\/connected-growth"/);
    expect(page).toContain("breadcrumbJsonLd");
  });

  it("uses PageHeader + the V2 journey/examples sections with the retained fragments", () => {
    for (const used of ["PageHeader", "CustomerJourneyList", "ConnectedGrowthExamplesSection", "FinalCtaSection"]) {
      expect(page, `/connected-growth uses ${used}`).toContain(used);
    }
    for (const id of ['"connected-growth-hero"', '"journey"', '"get-started"']) {
      expect(page, `/connected-growth keeps id ${id}`).toContain(id);
    }
    // #examples is owned by ConnectedGrowthExamplesSection.
    expect(read("../../src/components/sections/ConnectedGrowthExamplesSection.tsx")).toMatch(/id="examples"/);
  });

  it("keeps the visible illustrative framing (a Badge + a not-real-clients clarification)", () => {
    expect(page).toMatch(/Illustrative examples/);
    expect(page).toMatch(/not real clients/i);
    expect(page).toMatch(/generic, illustrative path/i);
  });

  it("removes the cosmic/legacy constructs and the horizontal phone strip", () => {
    for (const banned of [
      "CosmicPageHero",
      "GlowButton",
      "NodeOrb",
      "PhoneFrame",
      "InfinityMark",
      "iw-gradient-word",
      "CustomerJourneySection",
      "ConnectedExamplesSection",
      "FinalCtaBannerSection",
    ]) {
      expect(code, `/connected-growth no longer uses ${banned}`).not.toContain(banned);
    }
  });
});
