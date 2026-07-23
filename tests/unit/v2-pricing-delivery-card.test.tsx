// @vitest-environment jsdom
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { describe, it, expect, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";
import { PricingDeliveryCard } from "@/components/cards/PricingDeliveryCard";
import { deliveryModelMeta, DELIVERY_MODEL_KEYS } from "@/lib/design/deliveryModel";

afterEach(cleanup);
const readCode = (rel: string) =>
  readFileSync(fileURLToPath(new URL(rel, import.meta.url)), "utf8")
    .replace(/\/\*[\s\S]*?\*\//g, "")
    .replace(/(^|[^:])\/\/.*$/gm, "$1");

describe("PricingDeliveryCard", () => {
  const base = {
    modelKey: "we-do" as const,
    tagline: "Done by our in-house team",
    costNote: "A project fee for one-off builds, or a monthly amount when it is ongoing. Priced to the scope we agree up front.",
  };

  it("is a static Card (not a link, no button) with the exact canonical model name as its H3", () => {
    const { container } = render(<PricingDeliveryCard {...base} />);
    expect(container.querySelector("a"), "not a link").toBeNull();
    expect(container.querySelector("button"), "no button").toBeNull();
    expect(screen.getByRole("heading", { level: 3, name: deliveryModelMeta("we-do").label })).toBeInTheDocument();
  });

  it("shows the real tagline and the exact cost note", () => {
    render(<PricingDeliveryCard {...base} />);
    expect(screen.getByText(base.tagline)).toBeVisible();
    expect(screen.getByText(base.costNote)).toBeVisible();
  });

  it("uses the canonical delivery ink (not DELIVERY_COLOR) for every key", () => {
    for (const key of DELIVERY_MODEL_KEYS) {
      const { container } = render(<PricingDeliveryCard modelKey={key} tagline="t" costNote="c" />);
      const article = container.querySelector("article") as HTMLElement;
      expect(article.getAttribute("style"), `${key} uses canonical ink`).toContain(deliveryModelMeta(key).ink);
      cleanup();
    }
  });

  it("has no fragment id, no popularity/default/recommendation label, and no fabricated price", () => {
    const { container } = render(<PricingDeliveryCard {...base} />);
    expect((container.querySelector("article") as HTMLElement).id).toBe("");
    const text = container.textContent ?? "";
    expect(text).not.toMatch(/our default|most popular|best value|recommended/i);
    expect(text).not.toMatch(/[£$€]\s?\d|\bfrom \d|per month|\/mo|\b\d+ (days|weeks)/i);
  });

  it("does not use DELIVERY_COLOR, a duplicated delivery map, a fragment id, NodeOrb or Bento", () => {
    const src = readCode("../../src/components/cards/PricingDeliveryCard.tsx");
    expect(src).not.toContain("DELIVERY_COLOR");
    expect(src).not.toMatch(/delivery-\$\{|`delivery-|id=\{`/);
    expect(src).not.toMatch(/NodeOrb|Bento|GlowButton/);
    // The only delivery label/icon/ink source is the central deliveryModelMeta — no second map.
    expect(src).toContain("deliveryModelMeta");
    expect(src).not.toMatch(/label:\s*["']|icon:\s*["']/);
  });
});
