// @vitest-environment jsdom
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { describe, it, expect, afterEach, vi } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";
import { PrincipleCard } from "@/components/cards/PrincipleCard";

/**
 * Phase 2L — PrincipleCard and the migrated /about route. The route file is asserted at the source
 * level (it composes async server sections + JSON-LD, so a full render is covered by the e2e suite).
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
const readCode = (rel: string) =>
  read(rel)
    .replace(/\/\*[\s\S]*?\*\//g, "")
    .replace(/(^|[^:])\/\/.*$/gm, "$1");

describe("PrincipleCard", () => {
  const base = {
    title: "We understand before we sell",
    body: "We learn your business, goals and current setup before recommending anything.",
    icon: "compass",
    tone: "var(--domain-strategy)",
  };

  it("is a static Card with an H3 title, the verbatim body and a mapped V2 ink (no link/button)", () => {
    const { container } = render(<PrincipleCard {...base} />);
    expect(container.querySelector("a"), "no link").toBeNull();
    expect(container.querySelector("button"), "no button").toBeNull();
    expect(screen.getByRole("heading", { level: 3, name: base.title })).toBeInTheDocument();
    expect(screen.getByText(base.body)).toBeVisible();
    const root = container.querySelector("article") as HTMLElement;
    expect(root.style.getPropertyValue("--card-accent")).toBe("var(--v2-domain-strategy-ink)");
  });

  it("has no featured/enlarged state — every card renders the same way regardless of position", () => {
    const src = readCode("../../src/components/cards/PrincipleCard.tsx");
    expect(src).not.toMatch(/featured|variant\s*===\s*|i\s*===\s*0|index/i);
    const css = readCode("../../src/components/cards/PrincipleCard.module.css");
    expect(css).not.toMatch(/@keyframes|animation:|glow|gradient|backdrop-filter/i);
    expect(css).not.toMatch(/height:\s*\d+px/); // no fixed decorative height
  });
});

describe("/about route (source contract)", () => {
  const about = read("../../src/app/(marketing)/about/page.tsx");

  it("keeps the metadata, canonical path and breadcrumb JSON-LD", () => {
    expect(about).toMatch(/pageMetadata\(/);
    expect(about).toMatch(/path:\s*"\/about"/);
    expect(about).toContain("breadcrumbJsonLd");
  });

  it("uses PageHeader + explicit V2 sections and the reusable panels", () => {
    for (const used of [
      "PageHeader",
      "PrincipleCard",
      "DeliveryModelsExplainerSection",
      "HonestExpectationsPanel",
      "FinalCtaSection",
    ]) {
      expect(about, `/about uses ${used}`).toContain(used);
    }
    // The four ways of working carry no delivery-* fragment target on /about.
    expect(about).toMatch(/DeliveryModelsExplainerSection[^/]*cardFragmentTargets=\{false\}/s);
    // Retained fragment ids.
    for (const id of ['"about-hero"', '"who-we-are"', '"principles"', '"ways-of-working"', '"honest"', '"get-started"']) {
      expect(about, `/about keeps id ${id}`).toContain(id);
    }
  });

  it("keeps all five principle titles verbatim, in source order", () => {
    const titles = [
      "We understand before we sell",
      "Growth is one connected system",
      "We start with the smallest next step",
      "You own your accounts, data and tools",
      "More tools is not better",
    ];
    let last = -1;
    for (const t of titles) {
      const at = about.indexOf(t);
      expect(at, `principle "${t}" present`).toBeGreaterThan(-1);
      expect(at, `principle "${t}" in source order`).toBeGreaterThan(last);
      last = at;
    }
  });

  it("removes the cosmic/legacy homepage constructs", () => {
    const code = readCode("../../src/app/(marketing)/about/page.tsx");
    for (const banned of [
      "CosmicPageHero",
      "GlowButton",
      "InfinityMark",
      "BentoCard",
      "BentoGrid",
      "FinalCtaBannerSection",
      "iw-gradient-word",
      "<HonestExpectationsSection",
      "<DeliveryModelsSection",
    ]) {
      expect(code, `/about no longer uses ${banned}`).not.toContain(banned);
    }
  });
});
