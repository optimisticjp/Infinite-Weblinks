// @vitest-environment jsdom
import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";
import { Card } from "@/components/primitives/Card";

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

describe("Card — optional href (link root)", () => {
  it("without href renders a non-link div by default", () => {
    const { container } = render(<Card variant="raised">plain card</Card>);
    const root = container.firstElementChild!;
    expect(root.tagName).toBe("DIV");
    expect(container.querySelector("a")).toBeNull();
  });

  it("without href honours `as` (li / article)", () => {
    const { container, rerender } = render(
      <Card as="li" variant="plain">
        item
      </Card>,
    );
    expect(container.firstElementChild!.tagName).toBe("LI");
    rerender(
      <Card as="article" variant="raised">
        art
      </Card>,
    );
    expect(container.firstElementChild!.tagName).toBe("ARTICLE");
  });

  it("with href renders a SINGLE anchor as the root (whole card is the link, no nested link)", () => {
    const { container } = render(
      <Card href="/learn/example" variant="raised">
        <span>Read the guide</span>
      </Card>,
    );
    const root = container.firstElementChild!;
    expect(root.tagName).toBe("A");
    expect(root).toHaveAttribute("href", "/learn/example");
    // exactly one anchor in the whole card — no nested link
    expect(container.querySelectorAll("a")).toHaveLength(1);
    expect(screen.getByRole("link", { name: "Read the guide" })).toBe(root);
  });

  it("with href is auto-interactive and preserves className, style and accent", () => {
    const { container } = render(
      <Card href="/x" accent="var(--v2-domain-convert-ink)" className="myCard" style={{ marginTop: 4 }}>
        c
      </Card>,
    );
    const root = container.firstElementChild as HTMLElement;
    // non-scoped CSS-module class names in tests
    expect(root.className).toContain("interactive");
    expect(root.className).toContain("card");
    expect(root.className).toContain("myCard");
    expect(root.style.marginTop).toBe("4px");
    expect(root.style.getPropertyValue("--card-accent")).toBe("var(--v2-domain-convert-ink)");
  });

  it("renders the ordinal index badge aria-hidden regardless of link/static", () => {
    const { container } = render(
      <Card href="/x" index="01">
        c
      </Card>,
    );
    const badge = container.querySelector('[aria-hidden="true"]');
    expect(badge).not.toBeNull();
    expect(badge).toHaveTextContent("01");
  });
});
