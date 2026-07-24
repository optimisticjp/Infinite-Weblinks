// @vitest-environment jsdom
import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, cleanup, within } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";
import { ToolCard } from "@/components/cards/ToolCard";
import { RoadmapCard } from "@/components/cards/RoadmapCard";
import { DomainCard } from "@/components/cards/DomainCard";

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

describe("ToolCard", () => {
  const base = {
    href: "/tools/analytics-tracking",
    title: "Analytics & Tracking Tools",
    description: "Measuring what's actually happening on your site or store.",
    categoryLabel: "Analytics & Tracking",
    categoryTone: "var(--cyan)",
    categoryIcon: "bar-chart-3",
  };

  it("is one whole-card link with an <h3> title, category label, icon and description", () => {
    const { container } = render(<ToolCard {...base} />);
    const link = screen.getByRole("link");
    expect(link).toHaveAttribute("href", "/tools/analytics-tracking");
    expect(container.querySelectorAll("a")).toHaveLength(1); // no nested link
    expect(container.querySelector("button")).toBeNull(); // no nested button
    expect(screen.getByRole("heading", { level: 3, name: "Analytics & Tracking Tools" })).toBeInTheDocument();
    expect(screen.getByText("Analytics & Tracking")).toBeVisible();
    expect(screen.getByText(/Measuring what's actually happening/)).toBeVisible();
    // decorative category tile carries an icon
    expect(container.querySelector('[aria-hidden="true"] svg')).not.toBeNull();
  });

  it("maps the category tone to an accessible V2 ink (never a raw colour)", () => {
    const { container } = render(<ToolCard {...base} />);
    const link = container.querySelector("a") as HTMLElement;
    expect(link.style.getPropertyValue("--card-accent")).toBe("var(--v2-domain-discover-ink)");
  });

  it("shows up to three real connection chips, then a truthful +N chip", () => {
    render(
      <ToolCard
        {...base}
        connectedAreaLabels={[
          "Websites, Hosting & Performance",
          "Ecommerce & Operations",
          "Email, SMS & CRM",
          "SEO & Content",
          "Automation & AI",
        ]}
      />,
    );
    expect(screen.getByText("Connects with")).toBeVisible();
    // first three real names shown
    expect(screen.getByText("Websites, Hosting & Performance")).toBeVisible();
    expect(screen.getByText("Ecommerce & Operations")).toBeVisible();
    expect(screen.getByText("Email, SMS & CRM")).toBeVisible();
    // the 4th/5th collapse into a single truthful overflow chip
    expect(screen.getByText("+2 more")).toBeVisible();
    expect(screen.queryByText("SEO & Content")).toBeNull();
    // chips are informational spans, not links/buttons
    const link = screen.getByRole("link");
    expect(within(link).queryAllByRole("button")).toHaveLength(0);
  });

  it("shows exactly the connections when three or fewer (no overflow chip)", () => {
    render(<ToolCard {...base} connectedAreaLabels={["Ecommerce & Operations", "Email, SMS & CRM"]} />);
    expect(screen.getByText("Ecommerce & Operations")).toBeVisible();
    expect(screen.getByText("Email, SMS & CRM")).toBeVisible();
    expect(screen.queryByText(/\+\d+ more/)).toBeNull();
  });

  it("handles missing connections cleanly (no 'Connects with' group)", () => {
    render(<ToolCard {...base} />);
    expect(screen.queryByText("Connects with")).toBeNull();
    render(<ToolCard {...base} connectedAreaLabels={[]} />);
    expect(screen.queryByText("Connects with")).toBeNull();
  });

  it("shows no product brands, screenshot or image on the card", () => {
    const { container } = render(<ToolCard {...base} connectedAreaLabels={["Email, SMS & CRM"]} />);
    expect(container.querySelector("img")).toBeNull();
  });
});

describe("RoadmapCard", () => {
  const base = {
    href: "/roadmaps/ecommerce",
    title: "Ecommerce Brand Roadmap",
    intro: "The rough shape we'd follow for a product seller or D2C brand.",
    businessTypeLabel: "Ecommerce Brands",
    businessTypeTone: "var(--lime)",
    businessTypeIcon: "shopping-bag",
  };
  const fourPhases = [
    { title: "Build the foundation" },
    { title: "Bring in and convert traffic" },
    { title: "Operate and retain" },
    { title: "Scale with data and automation" },
  ];

  it("is one whole-card link with an <h3> title and the business-type label", () => {
    const { container } = render(<RoadmapCard {...base} phases={fourPhases} />);
    const link = screen.getByRole("link");
    expect(link).toHaveAttribute("href", "/roadmaps/ecommerce");
    expect(container.querySelectorAll("a")).toHaveLength(1);
    expect(container.querySelector("button")).toBeNull();
    expect(screen.getByRole("heading", { level: 3, name: "Ecommerce Brand Roadmap" })).toBeInTheDocument();
    expect(screen.getByText(/For Ecommerce Brands/)).toBeVisible();
  });

  it("shows the real phase count and an ORDERED preview of the first three phase titles", () => {
    render(<RoadmapCard {...base} phases={fourPhases} />);
    expect(screen.getByText("4 phases")).toBeVisible();
    const list = screen.getByRole("list");
    const items = within(list).getAllByRole("listitem");
    expect(items).toHaveLength(3);
    expect(items[0]).toHaveTextContent("Build the foundation");
    expect(items[1]).toHaveTextContent("Bring in and convert traffic");
    expect(items[2]).toHaveTextContent("Operate and retain");
    // the 4th title is not previewed
    expect(screen.queryByText("Scale with data and automation")).toBeNull();
  });

  it("uses a truthful SINGULAR overflow label for a 4-phase roadmap", () => {
    render(<RoadmapCard {...base} phases={fourPhases} />);
    expect(screen.getByText("+1 more phase")).toBeVisible();
  });

  it("uses a truthful PLURAL overflow label for a 5-phase roadmap", () => {
    render(<RoadmapCard {...base} phases={[...fourPhases, { title: "Expand to new markets" }]} />);
    expect(screen.getByText("+2 more phases")).toBeVisible();
  });

  it("shows no overflow line when three or fewer phases", () => {
    render(<RoadmapCard {...base} phases={fourPhases.slice(0, 3)} />);
    expect(screen.queryByText(/\+\d+ more phase/)).toBeNull();
    expect(screen.getByText("3 phases")).toBeVisible();
  });

  it("makes no duration, progress, completion or 'fixed plan' claim", () => {
    const { container } = render(<RoadmapCard {...base} phases={fourPhases} />);
    const text = container.textContent ?? "";
    expect(text).not.toMatch(/\d+%|\bweek|\bmonth|complete|progress|guaranteed|fixed/i);
    expect(container.querySelector("progress")).toBeNull();
    // it frames itself as a suggested sequence
    expect(screen.getByText("Suggested sequence")).toBeVisible();
  });
});

describe("DomainCard", () => {
  const base = {
    href: "/services/analytics-data",
    title: "Analytics & Data",
    description: "Where the numbers actually live, so decisions are based on evidence.",
    icon: "bar-chart-3",
    tone: "var(--cyan)",
    eyebrow: "Service domain",
  };

  it("is one whole-card link with an <h3> title, icon and description (no nested interaction)", () => {
    const { container } = render(<DomainCard {...base} />);
    const link = screen.getByRole("link");
    expect(link).toHaveAttribute("href", "/services/analytics-data");
    expect(container.querySelectorAll("a")).toHaveLength(1);
    expect(container.querySelector("button")).toBeNull();
    expect(screen.getByRole("heading", { level: 3, name: "Analytics & Data" })).toBeInTheDocument();
    expect(screen.getByText(/Where the numbers actually live/)).toBeVisible();
    expect(container.querySelector('[aria-hidden="true"] svg')).not.toBeNull();
  });

  it("maps the tone to an accessible V2 ink (never a raw colour) and has no NodeOrb", () => {
    const { container } = render(<DomainCard {...base} />);
    const link = container.querySelector("a") as HTMLElement;
    expect(link.style.getPropertyValue("--card-accent")).toBe("var(--v2-domain-discover-ink)");
    // no legacy node-orb markup
    expect(container.querySelector('[class*="orbLegacy"]')).toBeNull();
  });

  it("supports long titles and descriptions (renders them fully)", () => {
    const longTitle = "Retention, Loyalty & Advocacy across every owned channel and lifecycle stage";
    render(<DomainCard {...base} title={longTitle} />);
    expect(screen.getByRole("heading", { level: 3, name: longTitle })).toBeInTheDocument();
  });
});
