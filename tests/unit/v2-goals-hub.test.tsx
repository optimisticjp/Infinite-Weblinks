// @vitest-environment jsdom
import { readFileSync } from "node:fs";
import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, cleanup, within } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";
import { StartingPointCard } from "@/components/cards/StartingPointCard";
import { BusinessTypeCard } from "@/components/cards/BusinessTypeCard";
import { StartingPointSelectorSection } from "@/components/sections/StartingPointSelectorSection";
import { startingPoints, stages } from "@/lib/content/data";

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

describe("StartingPointCard", () => {
  const base = {
    order: 3,
    title: "I have a website but no traffic",
    situation: "The site is live, but almost nobody is finding it.",
    href: "/growth-plan",
    icon: "search",
    tone: "var(--cyan)",
    recommendedStageLabel: "Get Discovered",
  };

  it("is one whole-card link with an <h3>, order label, situation and stage Badge", () => {
    const { container } = render(<StartingPointCard {...base} />);
    const link = screen.getByRole("link");
    expect(link).toHaveAttribute("href", "/growth-plan");
    expect(container.querySelectorAll("a")).toHaveLength(1); // no nested link
    expect(container.querySelector("button")).toBeNull(); // no nested button
    expect(screen.getByRole("heading", { level: 3, name: "I have a website but no traffic" })).toBeInTheDocument();
    expect(screen.getByText("Starting point 3")).toBeVisible();
    expect(screen.getByText("The site is live, but almost nobody is finding it.")).toBeVisible();
    expect(screen.getByText("Start at Get Discovered")).toBeVisible();
  });

  it("maps the tone to an accessible V2 ink (never a raw colour)", () => {
    const { container } = render(<StartingPointCard {...base} />);
    const link = container.querySelector("a") as HTMLElement;
    expect(link.style.getPropertyValue("--card-accent")).toBe("var(--v2-domain-discover-ink)");
  });

  it("omits the stage Badge when no recommended stage is supplied", () => {
    render(<StartingPointCard {...base} recommendedStageLabel={undefined} />);
    expect(screen.queryByText(/^Start at /)).toBeNull();
  });

  it("renders the longer recommendation only when a caller opts in", () => {
    const withoutRec = render(<StartingPointCard {...base} />);
    expect(withoutRec.container.textContent).not.toContain("Move to Get Discovered.");
    withoutRec.unmount();
    render(<StartingPointCard {...base} recommendation="Move to Get Discovered. SEO, content, social, or ads." />);
    expect(screen.getByText(/Move to Get Discovered\./)).toBeVisible();
  });

  it("shows no selected/progress semantics or image", () => {
    const { container } = render(<StartingPointCard {...base} />);
    expect(container.querySelector("progress")).toBeNull();
    expect(container.querySelector("img")).toBeNull();
    expect(container.querySelector('[aria-selected], [aria-current], [role="tab"]')).toBeNull();
  });
});

describe("BusinessTypeCard", () => {
  const base = {
    title: "Ecommerce Brands",
    summary: "Selling products online, or moving from a marketplace to your own store.",
    href: "/business-types/ecommerce",
    icon: "shopping-bag",
    tone: "var(--lime)",
  };

  it("is one whole-card link with a Business type label, <h3> name and summary", () => {
    const { container } = render(<BusinessTypeCard {...base} />);
    const link = screen.getByRole("link");
    expect(link).toHaveAttribute("href", "/business-types/ecommerce");
    expect(container.querySelectorAll("a")).toHaveLength(1);
    expect(container.querySelector("button")).toBeNull();
    expect(screen.getByText("Business type")).toBeVisible();
    expect(screen.getByRole("heading", { level: 3, name: "Ecommerce Brands" })).toBeInTheDocument();
    expect(screen.getByText(/Selling products online/)).toBeVisible();
  });

  it("maps the tone to an accessible V2 ink (never a raw colour)", () => {
    const { container } = render(<BusinessTypeCard {...base} />);
    const link = container.querySelector("a") as HTMLElement;
    expect(link.style.getPropertyValue("--card-accent")).toBe("var(--v2-domain-retain-ink)");
  });

  it("shows no roadmap preview, fabricated qualification, phase list or image", () => {
    const { container } = render(<BusinessTypeCard {...base} />);
    expect(container.textContent ?? "").not.toMatch(/phase|roadmap|qualif/i);
    expect(container.querySelector("ol, img, progress")).toBeNull();
  });
});

describe("StartingPointSelectorSection (V2)", () => {
  it("renders every starting point as a card, in source order, all linking to the plan builder", async () => {
    const { container } = render(await StartingPointSelectorSection({ anchorId: "by-where-you-are" }));

    // The caller anchor id lands on the section (permanent #by-where-you-are target).
    expect(container.querySelector("section#by-where-you-are")).not.toBeNull();

    // One H3 per starting point, in the seed's source order.
    const headings = screen.getAllByRole("heading", { level: 3 });
    expect(headings.map((h) => h.textContent)).toEqual(startingPoints.map((sp) => sp.label));

    // Every card links to that starting point's real CTA route (all /growth-plan today).
    for (const sp of startingPoints) {
      const cardLinks = container.querySelectorAll(`a[href="${sp.cta.route}"]`);
      expect(cardLinks.length).toBeGreaterThan(0);
    }

    // Resolved recommended-stage names appear on the cards.
    const stageBySlug = new Map(stages.map((s) => [s.slug, s]));
    for (const sp of startingPoints) {
      const name = stageBySlug.get(sp.recommendedStageSlug)?.name;
      if (name) expect(screen.getAllByText(`Start at ${name}`).length).toBeGreaterThan(0);
    }
  });

  it("keeps the closing CTA destination and label, and the 'more than one is normal' copy", async () => {
    const { container } = render(await StartingPointSelectorSection({ anchorId: "by-where-you-are" }));
    expect(screen.getByText(/Fit more than one\?/)).toBeVisible();
    const cta = within(container.querySelector("section#by-where-you-are") as HTMLElement)
      .getAllByRole("link")
      .find((a) => a.textContent?.includes("Build my growth plan"));
    expect(cta).toHaveAttribute("href", "/growth-plan");
  });

  it("has no spectrum rail, node markup, selected state or hard-coded duplicate heading id", async () => {
    const { container } = render(await StartingPointSelectorSection({ anchorId: "by-where-you-are" }));
    expect(container.querySelector('[class*="spectrum"], [class*="rail"], [class*="node"]')).toBeNull();
    expect(container.querySelector('[aria-selected], [role="tab"], [role="tablist"]')).toBeNull();
    expect(container.querySelector("#starting-point-heading")).toBeNull(); // old hard-coded id gone
    // Exactly one section heading (the SectionShell <h2>), with a single title id.
    expect(container.querySelectorAll("h2")).toHaveLength(1);
  });
});

describe("StartingPointSelectorSection V2 CSS", () => {
  // Read from the repo root (cwd) — this file runs under jsdom, where import.meta.url is not a
  // file:// URL, so fileURLToPath cannot be used here. Strip comments so the checks look at the
  // declarations, not the documentation comment that lists the banned treatments.
  const css = readFileSync("src/components/sections/StartingPointSelectorSection.module.css", "utf8").replace(
    /\/\*[\s\S]*?\*\//g,
    "",
  );
  it("uses no horizontal-scroll / scroll-snap / spectrum treatment", () => {
    expect(css).not.toMatch(/overflow-x/i);
    expect(css).not.toMatch(/scroll-snap/i);
    expect(css).not.toMatch(/grid-auto-flow:\s*column/i);
    expect(css).not.toMatch(/\.spectrum|\.rail\b/);
    expect(css).not.toMatch(/theme-band-bright/);
  });
});
