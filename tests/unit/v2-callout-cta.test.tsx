// @vitest-environment jsdom
import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, cleanup, within } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";
import { Callout } from "@/components/primitives/Callout";
import { FinalCtaSection } from "@/components/sections/FinalCtaSection";

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
vi.mock("@/components/viz/CosmicBackground", () => ({
  CosmicBackground: () => <div data-testid="cosmic-bg" />,
}));

afterEach(cleanup);

describe("Callout", () => {
  it("is a passive note by default (role=note, NOT alert)", () => {
    render(<Callout>Heads up, this is context.</Callout>);
    const note = screen.getByRole("note");
    expect(note).toBeInTheDocument();
    expect(screen.queryByRole("alert")).toBeNull();
  });

  it("renders the title, body and a decorative (aria-hidden) icon", () => {
    const { container } = render(
      <Callout tone="information" title="Good to know">
        These are illustrative examples.
      </Callout>,
    );
    expect(screen.getByText("Good to know")).toBeVisible();
    expect(screen.getByText("These are illustrative examples.")).toBeVisible();
    // the default icon is decorative
    const svg = container.querySelector('[aria-hidden="true"] svg');
    expect(svg).not.toBeNull();
  });

  it("applies the tone class (meaning is not colour-only — icon + copy carry it)", () => {
    const { container, rerender } = render(<Callout tone="warning">w</Callout>);
    expect(container.firstElementChild!.className).toContain("warning");
    rerender(<Callout tone="neutral">n</Callout>);
    expect(container.firstElementChild!.className).toContain("neutral");
  });

  it("allows an explicit role override and omitting the icon", () => {
    const { container } = render(
      <Callout role="status" icon={null}>
        live
      </Callout>,
    );
    expect(screen.getByRole("status")).toBeInTheDocument();
    expect(container.querySelector("svg")).toBeNull();
  });
});

describe("FinalCtaSection", () => {
  it("renders a night SectionShell with an <h2> (never an <h1>) and no cosmic layer", () => {
    const { container } = render(
      <FinalCtaSection
        id="get-started"
        title="Ready to plan your growth?"
        lead="No obligation."
        primary={{ href: "/growth-plan", label: "Build my growth plan" }}
      />,
    );
    const section = container.querySelector("section")!;
    expect(section.className).toContain("theme-night");
    expect(section.className).not.toContain("theme-cosmic");
    expect(container.querySelectorAll("h1")).toHaveLength(0);
    expect(screen.getByRole("heading", { level: 2, name: "Ready to plan your growth?" })).toBeInTheDocument();
    expect(screen.queryByTestId("cosmic-bg")).toBeNull();
  });

  it("renders the signature primary and an optional secondary action as links", () => {
    render(
      <FinalCtaSection
        title="T"
        primary={{ href: "/growth-plan", label: "Build my growth plan" }}
        secondary={{ href: "/contact", label: "Talk to us" }}
      />,
    );
    const primary = screen.getByRole("link", { name: "Build my growth plan" });
    expect(primary).toHaveAttribute("href", "/growth-plan");
    // non-scoped module class names in tests: signature variant → "signature"
    expect(primary.className).toContain("signature");
    expect(screen.getByRole("link", { name: "Talk to us" })).toHaveAttribute("href", "/contact");
  });

  it("omits the secondary action when not provided", () => {
    render(<FinalCtaSection title="T" primary={{ href: "/x", label: "Only primary" }} />);
    expect(screen.getByRole("link", { name: "Only primary" })).toBeInTheDocument();
    expect(within(screen.getByRole("region", { name: "T" })).getAllByRole("link")).toHaveLength(1);
  });
});
