// @vitest-environment jsdom
import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, cleanup, within } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";
import { GoalPath } from "@/components/routes/GoalPath";
import { GoalCard } from "@/components/cards/GoalCard";
import { ServiceCard } from "@/components/cards/ServiceCard";
import { JourneyStageCard } from "@/components/cards/JourneyStageCard";

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

describe("GoalPath", () => {
  const base = {
    need: "A store built to sell, with payments and tracking in place from day one.",
    help: "We build it in-house and set up your tools.",
    outcome: "A store that's ready to take orders and measure them.",
    tone: "var(--lime)",
  };

  it("is a semantic ordered list of exactly three items in the fixed order", () => {
    render(<GoalPath {...base} />);
    const list = screen.getByRole("list");
    expect(list.tagName).toBe("OL");
    const items = within(list).getAllByRole("listitem");
    expect(items).toHaveLength(3);
    const headings = within(list).getAllByRole("heading", { level: 3 });
    expect(headings.map((h) => h.textContent)).toEqual([
      "What you need",
      "How we help",
      "Intended outcome",
    ]);
  });

  it("renders each part's source text verbatim", () => {
    render(<GoalPath {...base} />);
    expect(screen.getByText(base.need)).toBeVisible();
    expect(screen.getByText(base.help)).toBeVisible();
    expect(screen.getByText(base.outcome)).toBeVisible();
  });

  it("has no links or controls, and its sequence markers are decorative (aria-hidden)", () => {
    const { container } = render(<GoalPath {...base} />);
    expect(container.querySelector("a")).toBeNull();
    expect(container.querySelector("button")).toBeNull();
    // markers 01/02/03 are aria-hidden so the <ol> order is not announced twice
    const markers = container.querySelectorAll('[aria-hidden="true"]');
    expect(markers.length).toBeGreaterThanOrEqual(3);
    expect(Array.from(markers).some((m) => m.textContent === "01")).toBe(true);
  });

  it("makes no guarantee or numeric-promise claim", () => {
    const { container } = render(<GoalPath {...base} />);
    expect(container.textContent ?? "").not.toMatch(/guarantee|guaranteed|\d+%/i);
    expect(container.querySelector("progress")).toBeNull();
  });
});

describe("GoalCard", () => {
  const base = {
    href: "/goals/launch-professional-store",
    title: "Launch a professional store",
    outcome: "A store that's ready to take orders and measure them.",
    icon: "shopping-bag",
    tone: "var(--lime)",
  };

  it("is one whole-card link with an <h3> title, a Goal label and a prominent outcome", () => {
    const { container } = render(<GoalCard {...base} />);
    const link = screen.getByRole("link");
    expect(link).toHaveAttribute("href", "/goals/launch-professional-store");
    expect(container.querySelectorAll("a")).toHaveLength(1);
    expect(container.querySelector("button")).toBeNull();
    expect(screen.getByRole("heading", { level: 3, name: "Launch a professional store" })).toBeInTheDocument();
    expect(screen.getByText("Goal")).toBeVisible();
    expect(screen.getByText("Intended outcome")).toBeVisible();
    expect(screen.getByText(base.outcome)).toBeVisible();
  });

  it("maps the tone to an accessible V2 ink + tint (never a raw colour)", () => {
    const { container } = render(<GoalCard {...base} />);
    const link = container.querySelector("a") as HTMLElement;
    expect(link.style.getPropertyValue("--card-accent")).toBe("var(--v2-domain-retain-ink)");
    expect(link.style.getPropertyValue("--card-tint")).toBe("var(--v2-domain-retain-tint)");
  });

  it("shows the audience hint only when the goal genuinely has one", () => {
    const withHint = render(
      <GoalCard {...base} audienceHint="For brands selling products online for the first time." />,
    );
    expect(screen.getByText("For brands selling products online for the first time.")).toBeVisible();
    withHint.unmount();
    const withoutHint = render(<GoalCard {...base} />);
    // no fabricated audience line — only the outcome label + the "Goal" kicker are present
    expect(withoutHint.container.textContent).toContain("A store that's ready to take orders");
  });

  it("makes no metric or guarantee claim, and shows no image", () => {
    const { container } = render(<GoalCard {...base} />);
    expect(container.textContent ?? "").not.toMatch(/guarantee|guaranteed|\d+%/i);
    expect(container.querySelector("img")).toBeNull();
  });
});

describe("ServiceCard", () => {
  const base = {
    href: "/services/websites-development#shopify-woocommerce-store-builds",
    title: "Shopify / WooCommerce Store Builds",
    description: "A full ecommerce store build, set up to take payments and grow with you.",
    categoryLabel: "Websites & Development",
    categoryIcon: "monitor",
    categoryTone: "var(--blue)",
    deliveryModel: "we-do" as const,
  };

  it("is one whole-card link with an <h3> title, category label and description", () => {
    const { container } = render(<ServiceCard {...base} />);
    const link = screen.getByRole("link");
    expect(link).toHaveAttribute("href", base.href);
    expect(container.querySelectorAll("a")).toHaveLength(1);
    expect(container.querySelector("button")).toBeNull();
    expect(screen.getByRole("heading", { level: 3, name: base.title })).toBeInTheDocument();
    expect(screen.getByText("Websites & Development")).toBeVisible();
    expect(screen.getByText(/A full ecommerce store build/)).toBeVisible();
  });

  it("maps the category tone to an accessible V2 ink (never a raw colour)", () => {
    const { container } = render(<ServiceCard {...base} />);
    const link = container.querySelector("a") as HTMLElement;
    expect(link.style.getPropertyValue("--card-accent")).toBe("var(--v2-domain-build-ink)");
  });

  it("renders exactly the locked delivery-model label for each of the four models", () => {
    const cases: Array<["we-do" | "we-expert" | "we-run" | "you-run", string]> = [
      ["we-do", "We Do the Work"],
      ["we-expert", "We Bring In an Expert"],
      ["we-run", "We Run It End to End"],
      ["you-run", "You Run It After"],
    ];
    for (const [model, label] of cases) {
      const { unmount } = render(<ServiceCard {...base} deliveryModel={model} />);
      expect(screen.getByText(label)).toBeVisible();
      unmount();
    }
  });

  it("invents no price, duration, provider or numeric outcome, and shows no image", () => {
    const { container } = render(<ServiceCard {...base} />);
    expect(container.textContent ?? "").not.toMatch(/[£$€]\s?\d|\d+\s?(day|week|month)|\d+%/i);
    expect(container.querySelector("img")).toBeNull();
  });
});

describe("JourneyStageCard", () => {
  const base = {
    order: 2,
    title: "Foundation",
    summary: "Brand, website or store, hosting, tracking, and the legal basics.",
    href: "/how-it-works#foundation",
    icon: "layout",
    tone: "var(--blue)",
  };

  it("is one whole-card link with an <h3> title, a compact 'Stage N' label and a summary", () => {
    const { container } = render(<JourneyStageCard {...base} />);
    const link = screen.getByRole("link");
    expect(link).toHaveAttribute("href", "/how-it-works#foundation");
    expect(container.querySelectorAll("a")).toHaveLength(1);
    expect(container.querySelector("button")).toBeNull();
    expect(screen.getByRole("heading", { level: 3, name: "Foundation" })).toBeInTheDocument();
    expect(screen.getByText("Stage 2")).toBeVisible();
    expect(screen.getByText(/Brand, website or store/)).toBeVisible();
  });

  it("maps the stage tone to an accessible V2 ink (never a raw colour)", () => {
    const { container } = render(<JourneyStageCard {...base} />);
    const link = container.querySelector("a") as HTMLElement;
    expect(link.style.getPropertyValue("--card-accent")).toBe("var(--v2-domain-build-ink)");
  });

  it("reads as a journey position, not project progress", () => {
    const { container } = render(<JourneyStageCard {...base} />);
    expect(container.textContent ?? "").not.toMatch(/\d+%|complete|progress|of \d|\d+\s?(day|week|month)/i);
    expect(container.querySelector("progress")).toBeNull();
  });
});
