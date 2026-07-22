// @vitest-environment jsdom
import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, cleanup, within } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";
import { GrowthJourneyList } from "@/components/routes/GrowthJourneyList";
import { CrossCuttingSystemCard } from "@/components/cards/CrossCuttingSystemCard";
import { ConnectedSystemFlow } from "@/components/routes/ConnectedSystemFlow";
import { ProcessStepList } from "@/components/routes/ProcessStepList";
import { DeliveryModelCard } from "@/components/cards/DeliveryModelCard";
import { stages, systems, processSteps } from "@/lib/content/data";
import { domainInk } from "@/lib/design/domainColor";
import { DELIVERY_MODEL_META, type DeliveryModelKey } from "@/lib/design/deliveryModel";

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

const journeyStages = () =>
  [...stages]
    .sort((a, b) => a.order - b.order)
    .map((s) => ({
      order: s.order,
      slug: s.slug,
      name: s.name,
      summary: s.summary,
      whatHappens: s.whatHappens,
      outcome: s.outcome,
      icon: s.icon,
      tone: s.color,
    }));

describe("GrowthJourneyList", () => {
  it("is a semantic ordered list of exactly the eight production stages in source order", () => {
    const items = journeyStages();
    const { container } = render(<GrowthJourneyList stages={items} />);
    const list = container.querySelector("ol");
    expect(list).not.toBeNull();
    const lis = container.querySelectorAll("ol > li");
    expect(lis).toHaveLength(8);
    // real ids in source order
    expect(Array.from(lis).map((li) => li.id)).toEqual(items.map((s) => s.slug));
    // H3 names in source order
    const headings = screen.getAllByRole("heading", { level: 3 });
    expect(headings.map((h) => h.textContent)).toEqual(items.map((s) => s.name));
  });

  it("retains each stage's summary, whatHappens and outcome verbatim", () => {
    const items = journeyStages();
    render(<GrowthJourneyList stages={items} />);
    for (const s of items) {
      expect(screen.getByText(s.summary)).toBeInTheDocument();
      expect(screen.getByText(s.whatHappens)).toBeInTheDocument();
      expect(screen.getByText(s.outcome)).toBeInTheDocument();
    }
    // The outcome is labelled as an intended outcome, not a guarantee.
    expect(screen.getAllByText("Intended outcome").length).toBe(items.length);
  });

  it("has no buttons, aria-pressed, progress or node-orb markup", () => {
    const { container } = render(<GrowthJourneyList stages={journeyStages()} />);
    expect(container.querySelector("button")).toBeNull();
    expect(container.querySelector("[aria-pressed]")).toBeNull();
    expect(container.querySelector("progress")).toBeNull();
    expect(container.querySelector('[class*="orbLegacy"], [class*="StageTimeline"]')).toBeNull();
    expect(container.textContent ?? "").not.toMatch(/\d+%|\bof 8\b/);
  });
});

describe("CrossCuttingSystemCard", () => {
  const sys = systems[0];
  const base = {
    id: sys.key,
    title: sys.name,
    description: sys.description,
    icon: sys.icon,
    tone: sys.color,
  };

  it("is a static card (not a link) with the real id, an H3 and the full description", () => {
    const { container } = render(<CrossCuttingSystemCard {...base} />);
    expect(container.querySelector("a")).toBeNull(); // static, not a link
    expect(container.querySelector("button")).toBeNull();
    const article = container.querySelector("article");
    expect(article?.id).toBe(sys.key);
    expect(screen.getByRole("heading", { level: 3, name: sys.name })).toBeInTheDocument();
    expect(screen.getByText(sys.description)).toBeVisible();
    expect(screen.getByText("Runs across the journey")).toBeVisible();
  });

  it("maps the tone to an accessible V2 ink and has no rail-bar markup", () => {
    const { container } = render(<CrossCuttingSystemCard {...base} />);
    const article = container.querySelector("article") as HTMLElement;
    const ink = article.style.getPropertyValue("--card-accent");
    expect(ink).toBe(domainInk(sys.color));
    expect(ink).toMatch(/^var\(--v2-domain-[a-z]+-ink\)$/);
    expect(container.querySelector('[class*="RailBar"], [class*="rail"]')).toBeNull();
  });
});

describe("ConnectedSystemFlow", () => {
  const TITLES = ["Get discovered", "Your website", "Analytics", "Email and SMS", "Repeat customers"];

  it("is a semantic ordered list of the five nodes in source order with exact titles/blurbs", () => {
    const { container } = render(<ConnectedSystemFlow />);
    const list = container.querySelector("ol");
    expect(list).not.toBeNull();
    const headings = within(list as HTMLElement).getAllByRole("heading", { level: 3 });
    expect(headings.map((h) => h.textContent)).toEqual(TITLES);
    expect(screen.getByText("The right people find you.")).toBeVisible();
    expect(screen.getByText(/Loyal customers cost less and buy more/)).toBeVisible();
  });

  it("keeps the informational chips and the loop note", () => {
    render(<ConnectedSystemFlow />);
    for (const chip of ["SEO", "Ads", "Social"]) expect(screen.getByText(chip)).toBeVisible();
    expect(screen.getByText(/the loop\s+strengthens every time round/)).toBeVisible();
  });

  it("has no interaction, node-orb, connector-path or measured-result presentation", () => {
    const { container } = render(<ConnectedSystemFlow />);
    // No links/buttons/progress; the chips are static informational spans.
    expect(container.querySelector("a, button, progress")).toBeNull();
    // No legacy node-orb or connector-path markup.
    expect(container.querySelector('[class*="orbLegacy"], [class*="ConnectorPath"], [class*="conn"]')).toBeNull();
    // No fabricated analytics / measured proof (the removed StatCard trend, percentages).
    expect(container.textContent ?? "").not.toMatch(/month on month|growing month|\d+%/i);
  });
});

describe("ProcessStepList", () => {
  const steps = () =>
    [...processSteps]
      .sort((a, b) => a.order - b.order)
      .map((s) => ({ order: s.order, title: s.title, description: s.description, icon: s.icon }));

  it("is a semantic ordered list in source order with exact titles and descriptions", () => {
    const items = steps();
    const { container } = render(<ProcessStepList steps={items} />);
    const lis = container.querySelectorAll("ol > li");
    expect(lis).toHaveLength(items.length);
    const headings = screen.getAllByRole("heading", { level: 3 });
    expect(headings.map((h) => h.textContent)).toEqual(items.map((s) => s.title));
    for (const s of items) expect(screen.getByText(s.description)).toBeVisible();
  });

  it("shows the step icons and makes no progress or duration claim", () => {
    const { container } = render(<ProcessStepList steps={steps()} />);
    expect(container.querySelector('[aria-hidden="true"] svg')).not.toBeNull();
    expect(container.querySelector("progress")).toBeNull();
    expect(container.textContent ?? "").not.toMatch(/\d+%|\bweek|\bmonth|\bday(s)?\b|complete/i);
  });
});

describe("DeliveryModelCard", () => {
  const base = {
    order: 1,
    modelKey: "we-do" as const,
    tagline: "Done by our in-house team",
    description: "Our own team handles it start to finish.",
  };

  it("derives its anchor id from the key, with the exact name, tagline, description and shared ink", () => {
    const { container } = render(<DeliveryModelCard {...base} />);
    expect(container.querySelector("a")).toBeNull();
    expect(container.querySelector("button")).toBeNull();
    const article = container.querySelector("article") as HTMLElement;
    // id is DERIVED as delivery-<key> — a caller cannot supply a mismatching id.
    expect(article.id).toBe("delivery-we-do");
    expect(article.style.getPropertyValue("--card-accent")).toBe(DELIVERY_MODEL_META["we-do"].ink);
    expect(screen.getByRole("heading", { level: 3, name: "We Do the Work" })).toBeInTheDocument();
    expect(screen.getByText("Done by our in-house team")).toBeVisible();
    expect(screen.getByText(/Our own team handles it/)).toBeVisible();
  });

  it("derives the four production ids exactly, one per locked key", () => {
    const cases: Array<[DeliveryModelKey, string]> = [
      ["we-do", "delivery-we-do"],
      ["we-expert", "delivery-we-expert"],
      ["we-run", "delivery-we-run"],
      ["you-run", "delivery-you-run"],
    ];
    for (const [key, id] of cases) {
      const { container, unmount } = render(<DeliveryModelCard order={1} modelKey={key} tagline="t" description="d" />);
      expect((container.querySelector("article") as HTMLElement).id).toBe(id);
      unmount();
    }
  });

  it("shows the 'Our default' Badge ONLY for we-do — callers cannot override it", () => {
    const withDefault = render(<DeliveryModelCard {...base} />);
    expect(screen.getByText("Our default")).toBeVisible();
    withDefault.unmount();
    for (const key of ["we-expert", "we-run", "you-run"] as const) {
      const other = render(<DeliveryModelCard order={2} modelKey={key} tagline="Through our specialist network" description="We bring in a vetted specialist." />);
      expect(other.container.textContent ?? "", key).not.toMatch(/our default|popular|recommended|best/i);
      other.unmount();
    }
  });
});
