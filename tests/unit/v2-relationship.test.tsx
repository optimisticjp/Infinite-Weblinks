// @vitest-environment jsdom
import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, cleanup, within } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";
import { LinkChip } from "@/components/primitives/LinkChip";
import { Chip } from "@/components/primitives/Chip";
import { RelationshipCard } from "@/components/cards/RelationshipCard";
import { Icon } from "@/components/primitives/Icon";

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

describe("LinkChip", () => {
  it("renders an internal navigation link with a visible label", () => {
    render(<LinkChip href="/services/seo-content">SEO &amp; Content</LinkChip>);
    const link = screen.getByRole("link", { name: "SEO & Content" });
    expect(link).toHaveAttribute("href", "/services/seo-content");
    // carries the target/treatment class (min 44px target, focus ring, wrapping — see CSS)
    expect(link.className).toContain("chip");
  });

  it("renders an optional decorative icon (aria-hidden)", () => {
    const { container } = render(
      <LinkChip href="/x" icon={<Icon name="search" />}>
        Find
      </LinkChip>,
    );
    expect(container.querySelector('[aria-hidden="true"] svg')).not.toBeNull();
  });

  it("maps tone to an accessible V2 ink accent (never a raw colour)", () => {
    const { container } = render(
      <LinkChip href="/x" tone="var(--domain-convert)">
        Convert
      </LinkChip>,
    );
    const link = container.querySelector("a") as HTMLElement;
    expect(link.style.getPropertyValue("--chip-accent")).toBe("var(--v2-domain-convert-ink)");
  });

  it("supports an explicit aria-label where the visible label needs clarification", () => {
    render(
      <LinkChip href="/how-it-works#retain" aria-label="Retain stage">
        Retain
      </LinkChip>,
    );
    expect(screen.getByRole("link", { name: "Retain stage" })).toBeInTheDocument();
  });

  it("is semantically DIFFERENT from a static Chip (link vs plain span)", () => {
    const linkChip = render(<LinkChip href="/x">Go</LinkChip>);
    expect(linkChip.container.querySelector("a")).not.toBeNull();
    linkChip.unmount();

    const chip = render(<Chip>Static</Chip>);
    expect(chip.container.querySelector("a")).toBeNull();
    // a static Chip is not a link/button — pure informational text
    expect(chip.getByText("Static").closest("a")).toBeNull();
  });
});

describe("RelationshipCard", () => {
  it("renders an <h3> title, optional description and icon, and its child links", () => {
    render(
      <RelationshipCard
        title="Connects with"
        description="Areas this tool joins up to."
        icon={<Icon name="link" />}
        tone="var(--domain-build)"
      >
        <LinkChip href="/tools/analytics-tracking">Analytics & Tracking</LinkChip>
        <LinkChip href="/tools/email-sms-crm">Email, SMS & CRM</LinkChip>
      </RelationshipCard>,
    );
    expect(screen.getByRole("heading", { level: 3, name: "Connects with" })).toBeInTheDocument();
    expect(screen.getByText("Areas this tool joins up to.")).toBeVisible();
    expect(screen.getByRole("link", { name: "Analytics & Tracking" })).toHaveAttribute("href", "/tools/analytics-tracking");
    expect(screen.getByRole("link", { name: "Email, SMS & CRM" })).toBeInTheDocument();
  });

  it("is NOT a whole-card link — the root is not an anchor; only the children are links", () => {
    const { container } = render(
      <RelationshipCard title="Suits">
        <LinkChip href="/business-types/ecommerce">Ecommerce Brands</LinkChip>
      </RelationshipCard>,
    );
    expect(container.firstElementChild!.tagName).not.toBe("A");
    // exactly one link — the child, with no nested-link problem
    expect(container.querySelectorAll("a")).toHaveLength(1);
    expect(within(container.querySelector("a")!).queryByRole("link")).toBeNull();
  });

  it("renders NOTHING when there are no relationships (never an empty card)", () => {
    const empty = render(<RelationshipCard title="Connects with">{null}</RelationshipCard>);
    expect(empty.container).toBeEmptyDOMElement();
    empty.unmount();
    const emptyArray = render(<RelationshipCard title="Connects with">{[]}</RelationshipCard>);
    expect(emptyArray.container).toBeEmptyDOMElement();
  });
});
