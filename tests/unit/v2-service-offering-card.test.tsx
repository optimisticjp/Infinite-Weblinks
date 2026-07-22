// @vitest-environment jsdom
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { describe, it, expect, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";
import { ServiceOfferingCard } from "@/components/cards/ServiceOfferingCard";
import { deliveryModelMeta } from "@/lib/design/deliveryModel";

afterEach(cleanup);
const readCode = (rel: string) =>
  readFileSync(fileURLToPath(new URL(rel, import.meta.url)), "utf8")
    .replace(/\/\*[\s\S]*?\*\//g, "")
    .replace(/(^|[^:])\/\/.*$/gm, "$1");

describe("ServiceOfferingCard", () => {
  const base = {
    slug: "seo-audit",
    title: "SEO Audit",
    summary: "A clear picture of how you show up in search today, what's missing, and where the easiest wins are.",
    deliveryModel: "we-do" as const,
    whatYouGet: ["A prioritised list of issues", "A plain-English summary", "Quick wins highlighted"],
    exampleTools: ["Ahrefs", "Screaming Frog", "Search Console"],
    categoryIcon: "compass",
    categoryTone: "var(--domain-strategy)",
  };

  it("is a static article (not a link) with an H4 title, the summary and no nested control", () => {
    const { container } = render(<ServiceOfferingCard {...base} />);
    expect(container.querySelector("a"), "not a link").toBeNull();
    expect(container.querySelector("button"), "no nested control").toBeNull();
    const article = container.querySelector("article") as HTMLElement;
    expect(article, "semantic article root").not.toBeNull();
    expect(screen.getByRole("heading", { level: 4, name: "SEO Audit" })).toBeInTheDocument();
    expect(screen.getByText(base.summary)).toBeVisible();
  });

  it("derives the fragment id from the slug (and omits it when withFragmentTarget=false)", () => {
    const { container, rerender } = render(<ServiceOfferingCard {...base} />);
    expect((container.querySelector("article") as HTMLElement).id).toBe("seo-audit");
    rerender(<ServiceOfferingCard {...base} withFragmentTarget={false} />);
    expect((container.querySelector("article") as HTMLElement).id).toBe("");
    // The public API exposes no `id` prop — a caller cannot inject one.
    // @ts-expect-error id is not part of the public API.
    void (<ServiceOfferingCard {...base} id="hacked" />);
  });

  it("shows the exact DeliveryModelBadge for the service's key", () => {
    render(<ServiceOfferingCard {...base} deliveryModel="we-expert" />);
    expect(screen.getByText(deliveryModelMeta("we-expert").label)).toBeVisible();
  });

  it("renders the complete whatYouGet list in source order and every example tool", () => {
    const { container } = render(<ServiceOfferingCard {...base} />);
    const points = [...container.querySelectorAll("ul")[0].querySelectorAll("li")].map((li) => li.textContent?.trim());
    expect(points).toEqual(base.whatYouGet);
    for (const tool of base.exampleTools) expect(screen.getByText(tool)).toBeVisible();
  });

  it("omits the tools list entirely when there are no example tools", () => {
    const { container } = render(<ServiceOfferingCard {...base} exampleTools={[]} />);
    expect(container.querySelector('ul[aria-label="Example tools we can connect"]')).toBeNull();
  });

  it("uses no price/duration/result language and no featured state", () => {
    const { container } = render(<ServiceOfferingCard {...base} />);
    const text = container.textContent ?? "";
    expect(text).not.toMatch(/[£$€]\s?\d|\bfrom \d|per month|\/mo|\b\d+ (days|weeks)|guarantee|\b\d+%/i);
    const src = readCode("../../src/components/cards/ServiceOfferingCard.tsx");
    expect(src).not.toMatch(/featured|NodeOrb|Bento|variant\s*===/);
  });
});
