// @vitest-environment jsdom
import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";
import { FilterChip } from "@/components/primitives/FilterChip";
import { Card } from "@/components/primitives/Card";
import { BentoCard } from "@/components/primitives/BentoCard";
import { DeliveryModelBadge } from "@/components/primitives/DeliveryModelBadge";

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

describe("FilterChip", () => {
  it("is a <button> with aria-pressed reflecting the selected state", () => {
    const { rerender } = render(<FilterChip selected>SEO</FilterChip>);
    const el = screen.getByRole("button", { name: /SEO/ });
    expect(el.tagName).toBe("BUTTON");
    expect(el).toHaveAttribute("aria-pressed", "true");
    rerender(<FilterChip>SEO</FilterChip>);
    expect(screen.getByRole("button", { name: /SEO/ })).toHaveAttribute("aria-pressed", "false");
  });

  it("adds the selected class (state not conveyed by colour alone)", () => {
    render(<FilterChip selected>X</FilterChip>);
    expect(screen.getByRole("button", { name: /X/ }).className).toContain("selected");
  });

  it("forwards onClick", () => {
    const onClick = vi.fn();
    render(
      <FilterChip onClick={onClick}>Toggle</FilterChip>,
    );
    screen.getByRole("button", { name: /Toggle/ }).click();
    expect(onClick).toHaveBeenCalledOnce();
  });
});

describe("Card", () => {
  it("non-interactive card renders a non-focusable container", () => {
    const { container } = render(<Card>content</Card>);
    const el = container.firstElementChild as HTMLElement;
    expect(el.tagName).toBe("DIV");
    expect(el).not.toHaveAttribute("tabindex");
    expect(el).not.toHaveAttribute("href");
  });

  it("interactive card uses the requested element and gets interactivity from a nested link", () => {
    render(
      <Card as="article" interactive>
        <a href="/x">go</a>
      </Card>,
    );
    const article = screen.getByRole("article");
    expect(article.tagName).toBe("ARTICLE");
    expect(article).not.toHaveAttribute("tabindex");
    expect(screen.getByRole("link", { name: "go" })).toHaveAttribute("href", "/x");
  });
});

describe("BentoCard", () => {
  it("renders the whole tile as a single link when href is set", () => {
    render(
      <ul>
        <BentoCard title="Websites" href="/services" icon="monitor" />
      </ul>,
    );
    expect(screen.getByRole("link", { name: /Websites/ })).toHaveAttribute("href", "/services");
  });

  it("renders a non-link informational tile when href is omitted", () => {
    render(
      <ul>
        <BentoCard title="Operate" icon="settings" />
      </ul>,
    );
    expect(screen.queryByRole("link")).toBeNull();
    expect(screen.getByText("Operate")).toBeInTheDocument();
  });
});

describe("DeliveryModelBadge", () => {
  it("renders the exact locked model label", () => {
    render(<DeliveryModelBadge model="we-expert" />);
    expect(screen.getByText("We Bring In an Expert")).toBeInTheDocument();
  });
});
