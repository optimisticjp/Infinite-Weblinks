// @vitest-environment jsdom
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { describe, it, expect, afterEach } from "vitest";
import { render, screen, cleanup, within } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";
import { EngagementShapeCard } from "@/components/cards/EngagementShapeCard";
import { QuoteProcessList } from "@/components/routes/QuoteProcessList";
import { PricingFaqList } from "@/components/routes/PricingFaqList";
import { pricingEngagementShapes, pricingQuoteSteps, pricingFaqs } from "@/lib/content/data/pricing";

afterEach(cleanup);
const readCode = (rel: string) =>
  readFileSync(fileURLToPath(new URL(rel, import.meta.url)), "utf8")
    .replace(/\/\*[\s\S]*?\*\//g, "")
    .replace(/(^|[^:])\/\/.*$/gm, "$1");

describe("EngagementShapeCard", () => {
  // The content field is `blurb`; the card prop is `body` (mapped by the page).
  const shape = pricingEngagementShapes[2]; // "An ongoing partnership" → "Monthly, quoted to scope"
  const base = { title: shape.title, body: shape.blurb, note: shape.note, icon: shape.icon, tone: shape.tone };

  it("is a static Card (not a link, no button) with an H3 title and the body verbatim", () => {
    const { container } = render(<EngagementShapeCard {...base} />);
    expect(container.querySelector("a"), "not a link").toBeNull();
    expect(container.querySelector("button"), "no button").toBeNull();
    expect(container.querySelector("article"), "static article root").not.toBeNull();
    expect(screen.getByRole("heading", { level: 3, name: base.title })).toBeInTheDocument();
    expect(screen.getByText(base.body)).toBeVisible();
  });

  it("shows the exact source note in a Badge", () => {
    render(<EngagementShapeCard {...base} />);
    expect(screen.getByText("Monthly, quoted to scope")).toBeVisible();
  });

  it("has no featured/tier/package semantics and no price or duration", () => {
    const { container } = render(<EngagementShapeCard {...base} />);
    const text = container.textContent ?? "";
    // No price, duration, or popularity/recommendation markers (approved copy words like the verb
    // "plan" are not banned; tier/package/featured *semantics* are guarded against the source below).
    expect(text).not.toMatch(/[£$€]\s?\d|\bfrom \d|per month|\/mo|\b\d+ (days|weeks)|most popular|recommended/i);
    const src = readCode("../../src/components/cards/EngagementShapeCard.tsx");
    expect(src).not.toMatch(/featured|NodeOrb|Bento|GlowButton|comparison|\btier\b/i);
  });
});

describe("QuoteProcessList", () => {
  it("is a semantic ordered list of the four steps in source order, each with an H3 and exact blurb", () => {
    const { container } = render(<QuoteProcessList steps={pricingQuoteSteps} />);
    const ol = container.querySelector("ol");
    expect(ol, "ordered list root").not.toBeNull();
    const items = [...(ol as HTMLOListElement).querySelectorAll(":scope > li")];
    expect(items).toHaveLength(4);
    items.forEach((li, i) => {
      const scope = within(li as HTMLElement);
      expect(scope.getByRole("heading", { level: 3, name: pricingQuoteSteps[i].title })).toBeInTheDocument();
      expect(scope.getByText(pricingQuoteSteps[i].blurb)).toBeVisible();
    });
  });

  it("uses no progress state, duration, buttons or client state", () => {
    const { container } = render(<QuoteProcessList steps={pricingQuoteSteps} />);
    expect(container.querySelector("button"), "no button").toBeNull();
    const text = container.textContent ?? "";
    expect(text).not.toMatch(/\b\d+%|complete|in progress|\b\d+ (days|weeks|hours)/i);
    const src = readCode("../../src/components/routes/QuoteProcessList.tsx");
    expect(src).not.toContain('"use client"');
    expect(src).not.toMatch(/useState|useEffect|selected|progress/);
  });
});

describe("PricingFaqList", () => {
  it("is a semantic dl with one dt/dd per FAQ, all five in source order, answers visible", () => {
    const { container } = render(<PricingFaqList faqs={pricingFaqs} />);
    const dl = container.querySelector("dl");
    expect(dl, "definition list root").not.toBeNull();
    const groups = [...(dl as HTMLDListElement).querySelectorAll(":scope > div")];
    expect(groups).toHaveLength(5);
    groups.forEach((div, i) => {
      const dt = div.querySelector("dt");
      const dd = div.querySelector("dd");
      expect(dt?.textContent).toBe(pricingFaqs[i].question);
      expect(dd?.textContent).toBe(pricingFaqs[i].answer);
      expect(dd).toBeVisible();
    });
  });

  it("renders every answer without any interaction (no accordion, no client state, no search)", () => {
    const { container } = render(<PricingFaqList faqs={pricingFaqs} />);
    expect(container.querySelector("details, summary, input, button"), "no interactive controls").toBeNull();
    for (const faq of pricingFaqs) expect(screen.getByText(faq.answer)).toBeVisible();
    const src = readCode("../../src/components/routes/PricingFaqList.tsx");
    expect(src).not.toContain('"use client"');
    expect(src).not.toMatch(/useState|useEffect/);
    // No duplicated FAQ data — the component maps the passed array, it does not redeclare one.
    expect(src).not.toMatch(/question:\s*["']/);
  });
});
