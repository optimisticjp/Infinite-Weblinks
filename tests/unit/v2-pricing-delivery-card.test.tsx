// @vitest-environment jsdom
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { describe, it, expect, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";
import { PricingDeliveryCard } from "@/components/cards/PricingDeliveryCard";
import { deliveryModelMeta, DELIVERY_MODEL_KEYS } from "@/lib/design/deliveryModel";
import { pricingDeliveryCostNotes } from "@/lib/content/data/pricing";

afterEach(cleanup);
const readCode = (rel: string) =>
  readFileSync(fileURLToPath(new URL(rel, import.meta.url)), "utf8")
    .replace(/\/\*[\s\S]*?\*\//g, "")
    .replace(/(^|[^:])\/\/.*$/gm, "$1");

describe("PricingDeliveryCard", () => {
  const base = { modelKey: "we-do" as const, tagline: "Done by our in-house team" };

  it("is a static Card (not a link, no button) with the exact canonical model name as its H3", () => {
    const { container } = render(<PricingDeliveryCard {...base} />);
    expect(container.querySelector("a"), "not a link").toBeNull();
    expect(container.querySelector("button"), "no button").toBeNull();
    expect(screen.getByRole("heading", { level: 3, name: deliveryModelMeta("we-do").label })).toBeInTheDocument();
  });

  it("shows the real tagline and derives the exact cost note for its key", () => {
    render(<PricingDeliveryCard {...base} />);
    expect(screen.getByText(base.tagline)).toBeVisible();
    expect(screen.getByText(pricingDeliveryCostNotes["we-do"])).toBeVisible();
  });

  it("takes no costNote prop — the note is always derived internally, so it cannot be mismatched", () => {
    // The public API accepts only modelKey/tagline/className. A caller cannot inject a note.
    // @ts-expect-error costNote is not part of the public API.
    void (<PricingDeliveryCard {...base} costNote="a mismatched note" />);
    // Every key renders ITS OWN note, never another model's.
    for (const key of DELIVERY_MODEL_KEYS) {
      const { container } = render(<PricingDeliveryCard modelKey={key} tagline="t" />);
      expect(container.textContent, `${key} shows its own note`).toContain(pricingDeliveryCostNotes[key]);
      for (const other of DELIVERY_MODEL_KEYS) {
        if (other !== key) {
          expect(container.textContent, `${key} never shows ${other}'s note`).not.toContain(pricingDeliveryCostNotes[other]);
        }
      }
      cleanup();
    }
  });

  it("uses the canonical delivery ink (not DELIVERY_COLOR) for every key", () => {
    for (const key of DELIVERY_MODEL_KEYS) {
      const { container } = render(<PricingDeliveryCard modelKey={key} tagline="t" />);
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

  it("derives the note from pricingDeliveryCostNotes with no costNote prop, no fallback, no DELIVERY_COLOR/map", () => {
    const src = readCode("../../src/components/cards/PricingDeliveryCard.tsx");
    expect(src).toContain("pricingDeliveryCostNotes[modelKey]");
    expect(src).not.toMatch(/costNote:/); // no costNote prop declared in the props type
    expect(src).not.toMatch(/\?\?\s*meta\.|description/); // no fallback to the model description
    expect(src).not.toContain("DELIVERY_COLOR");
    expect(src).not.toMatch(/delivery-\$\{|`delivery-|id=\{`/);
    expect(src).not.toMatch(/NodeOrb|Bento|GlowButton/);
    expect(src).toContain("deliveryModelMeta");
    expect(src).not.toMatch(/label:\s*["']|icon:\s*["']/);
  });
});
