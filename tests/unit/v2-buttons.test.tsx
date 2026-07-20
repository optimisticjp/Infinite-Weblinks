// @vitest-environment jsdom
import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";
import { Button } from "@/components/primitives/Button";
import { IconButton } from "@/components/primitives/IconButton";

// next/link needs no router context for a plain anchor in tests.
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

describe("Button", () => {
  it("renders a <button> for actions", () => {
    render(<Button onClick={() => {}}>Go</Button>);
    expect(screen.getByRole("button", { name: "Go" }).tagName).toBe("BUTTON");
  });

  it("renders a Next link (anchor) when href is set", () => {
    render(<Button href="/plan">Plan</Button>);
    expect(screen.getByRole("link", { name: "Plan" })).toHaveAttribute("href", "/plan");
  });

  it("passes supported button attributes (type, disabled, aria)", () => {
    render(
      <Button type="submit" disabled aria-label="Submit form">
        X
      </Button>,
    );
    const el = screen.getByRole("button", { name: "Submit form" });
    expect(el).toHaveAttribute("type", "submit");
    expect(el).toBeDisabled();
  });

  it("does not leak non-DOM props onto the element", () => {
    render(
      <Button variant="secondary" size="lg" iconLeft={<span />}>
        Y
      </Button>,
    );
    const el = screen.getByRole("button", { name: "Y" });
    expect(el).not.toHaveAttribute("iconLeft");
    expect(el).not.toHaveAttribute("variant");
    expect(el).not.toHaveAttribute("size");
  });

  it("renders left and right icons", () => {
    render(
      <Button iconLeft={<span data-testid="L" />} iconRight={<span data-testid="R" />}>
        Z
      </Button>,
    );
    expect(screen.getByTestId("L")).toBeInTheDocument();
    expect(screen.getByTestId("R")).toBeInTheDocument();
  });

  it("loading sets aria-busy, disables, and shows a spinner (icon suppressed)", () => {
    render(
      <Button loading iconLeft={<span data-testid="L" />}>
        Save
      </Button>,
    );
    const el = screen.getByRole("button", { name: "Save" });
    expect(el).toBeDisabled();
    expect(el).toHaveAttribute("aria-busy", "true");
    expect(screen.queryByTestId("L")).toBeNull();
  });

  it("applies variant and size classes", () => {
    render(
      <Button variant="signature" size="lg">
        S
      </Button>,
    );
    const el = screen.getByRole("button", { name: "S" });
    expect(el.className).toContain("signature");
    expect(el.className).toContain("lg");
  });
});

describe("IconButton", () => {
  it("provides an accessible name via `label` (not the hidden glyph)", () => {
    render(<IconButton label="Search" icon={<span />} />);
    expect(screen.getByRole("button", { name: "Search" })).toBeInTheDocument();
  });

  it("renders a link when href is set", () => {
    render(<IconButton label="Download" icon={<span />} href="/x" />);
    expect(screen.getByRole("link", { name: "Download" })).toHaveAttribute("href", "/x");
  });

  it("supports the disabled state", () => {
    render(<IconButton label="Off" icon={<span />} disabled />);
    expect(screen.getByRole("button", { name: "Off" })).toBeDisabled();
  });
});
