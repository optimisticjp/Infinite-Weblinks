// @vitest-environment jsdom
import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, cleanup, within } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";
import { ToolCard } from "@/components/cards/ToolCard";

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
