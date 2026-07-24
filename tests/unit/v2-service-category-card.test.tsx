// @vitest-environment jsdom
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { describe, it, expect, afterEach, vi } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";
import { ServiceCategoryCard } from "@/components/cards/ServiceCategoryCard";

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
const readCode = (rel: string) =>
  readFileSync(fileURLToPath(new URL(rel, import.meta.url)), "utf8")
    .replace(/\/\*[\s\S]*?\*\//g, "")
    .replace(/(^|[^:])\/\/.*$/gm, "$1");

describe("ServiceCategoryCard", () => {
  const base = {
    order: 3,
    title: "Websites & Development",
    description: "Your site, store, or app, built to load fast, look right, and turn visitors into customers.",
    href: "/services/websites-development",
    icon: "monitor",
    tone: "var(--domain-build)",
    serviceCount: 6,
  };

  it("is one whole-card link with an <h3>, order marker, intro and destination affordance", () => {
    const { container } = render(<ServiceCategoryCard {...base} />);
    const link = screen.getByRole("link");
    expect(link).toHaveAttribute("href", "/services/websites-development");
    expect(container.querySelectorAll("a")).toHaveLength(1); // one internal link
    expect(container.querySelector("button")).toBeNull(); // no nested control
    expect(screen.getByRole("heading", { level: 3, name: "Websites & Development" })).toBeInTheDocument();
    expect(screen.getByText("03")).toBeVisible();
    expect(screen.getByText(base.description)).toBeVisible();
  });

  it("shows the exact pluralised service count", () => {
    render(<ServiceCategoryCard {...base} serviceCount={6} />);
    expect(screen.getByText("6 services")).toBeVisible();
    cleanup();
    render(<ServiceCategoryCard {...base} serviceCount={1} />);
    expect(screen.getByText("1 service")).toBeVisible();
  });

  it("maps the tone to an accessible V2 ink (never a raw colour)", () => {
    const { container } = render(<ServiceCategoryCard {...base} />);
    const link = container.querySelector("a") as HTMLElement;
    expect(link.style.getPropertyValue("--card-accent")).toBe("var(--v2-domain-build-ink)");
  });

  it("has no featured/selected state — the card renders the same regardless of position", () => {
    const src = readCode("../../src/components/cards/ServiceCategoryCard.tsx");
    expect(src).not.toMatch(/featured|selected|variant\s*===|order\s*===\s*1|NodeOrb|Bento/i);
    const css = readCode("../../src/components/cards/ServiceCategoryCard.module.css");
    expect(css).not.toMatch(/@keyframes|glow|gradient|backdrop-filter/i);
    // No fixed decorative card height (viewport units or a large fixed px); small icon sizes are fine.
    expect(css).not.toMatch(/(min-)?height:\s*(100vh|100dvh|\d{3,}px)/);
  });
});
