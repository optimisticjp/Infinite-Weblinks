// @vitest-environment jsdom
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { describe, it, expect, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";
import { PricingFactorCard } from "@/components/cards/PricingFactorCard";

afterEach(cleanup);
const readCode = (rel: string) =>
  readFileSync(fileURLToPath(new URL(rel, import.meta.url)), "utf8")
    .replace(/\/\*[\s\S]*?\*\//g, "")
    .replace(/(^|[^:])\/\/.*$/gm, "$1");

describe("PricingFactorCard", () => {
  const base = {
    title: "The scope of the work",
    body: "How much there is to build or set up, and how much of it is new versus tidying what you already have.",
    icon: "layers",
    tone: "var(--domain-build)",
  };

  it("is a static Card (not a link, no button) with an H3 title and the body verbatim", () => {
    const { container } = render(<PricingFactorCard {...base} />);
    expect(container.querySelector("a"), "not a link").toBeNull();
    expect(container.querySelector("button"), "no button").toBeNull();
    expect(container.querySelector("article"), "static article root").not.toBeNull();
    expect(screen.getByRole("heading", { level: 3, name: base.title })).toBeInTheDocument();
    expect(screen.getByText(base.body)).toBeVisible();
  });

  it("renders a decorative icon tile and maps the tone to an accessible V2 ink accent", () => {
    const { container } = render(<PricingFactorCard {...base} />);
    const tile = container.querySelector('[aria-hidden="true"]') as HTMLElement;
    expect(tile, "icon tile present").not.toBeNull();
    // The domain bridge output (V2 ink) drives the accent, never a raw colour.
    expect((container.querySelector("article") as HTMLElement).getAttribute("style")).toContain("--card-accent");
    expect((container.querySelector("article") as HTMLElement).getAttribute("style")).toContain("var(--v2-domain-build-ink)");
  });

  it("has no fragment id, no featured state, and no price/rank/weighting language", () => {
    const { container } = render(<PricingFactorCard {...base} />);
    expect((container.querySelector("article") as HTMLElement).id).toBe("");
    const text = container.textContent ?? "";
    expect(text).not.toMatch(/[£$€]\s?\d|\bfrom \d|per month|\/mo|\b\d+ (days|weeks)|guarantee|\b\d+%|most popular|recommended/i);
    const src = readCode("../../src/components/cards/PricingFactorCard.tsx");
    expect(src).not.toMatch(/featured|NodeOrb|Bento|GlowButton/);
    // No public id prop — a caller cannot inject a fragment target.
    // @ts-expect-error id is not part of the public API.
    void (<PricingFactorCard {...base} id="hacked" />);
  });

  it("the module uses no fixed decorative height", () => {
    const css = readCode("../../src/components/cards/PricingFactorCard.module.css");
    expect(css).not.toMatch(/(min-)?height:\s*(100vh|100dvh|\d{3,}px)/);
  });
});
