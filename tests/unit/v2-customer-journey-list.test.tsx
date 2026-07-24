// @vitest-environment jsdom
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { describe, it, expect, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";
import { CustomerJourneyList } from "@/components/routes/CustomerJourneyList";
import { customerJourney } from "@/lib/content/data/customer-journey";

/**
 * Phase 2L — CustomerJourneyList renders the illustrative connected-customer path as a semantic
 * ordered list (no phone strip, no fake device, no active item, no metric or result language).
 */
afterEach(cleanup);
const read = (rel: string) => readFileSync(fileURLToPath(new URL(rel, import.meta.url)), "utf8");
const readCode = (rel: string) =>
  read(rel)
    .replace(/\/\*[\s\S]*?\*\//g, "")
    .replace(/(^|[^:])\/\/.*$/gm, "$1");

describe("CustomerJourneyList", () => {
  it("is a semantic ordered list of six steps, in source order, with phase + caption", () => {
    const { container } = render(<CustomerJourneyList steps={customerJourney} />);
    const ol = container.querySelector("ol");
    expect(ol, "ordered list root").not.toBeNull();
    const items = [...(ol?.querySelectorAll(":scope > li") ?? [])];
    expect(items).toHaveLength(6);

    // Phase titles are H3, in source order.
    const phases = items.map((li) => li.querySelector("h3")?.textContent);
    expect(phases).toEqual(customerJourney.map((s) => s.phase));

    for (const step of customerJourney) {
      expect(screen.getByRole("heading", { level: 3, name: step.phase })).toBeInTheDocument();
      expect(screen.getByText(step.caption)).toBeVisible();
    }
  });

  it("renders every illustrative screen heading and every screen line in source order", () => {
    render(<CustomerJourneyList steps={customerJourney} />);
    for (const step of customerJourney) {
      expect(screen.getByText(step.screen.heading)).toBeVisible();
      for (const line of step.screen.lines ?? []) {
        expect(screen.getAllByText(line).length).toBeGreaterThan(0);
      }
    }
    // The touchpoint is clearly labelled illustrative.
    expect(screen.getAllByText("Illustrative touchpoint").length).toBe(6);
  });

  it("has no PhoneFrame, no active item, no scrollable region and no interaction", () => {
    const { container } = render(<CustomerJourneyList steps={customerJourney} />);
    // No focusable scroll region / tabindex / role=list wrapper.
    expect(container.querySelector("[tabindex]")).toBeNull();
    expect(container.querySelector("a, button")).toBeNull();
    const src = readCode("../../src/components/routes/CustomerJourneyList.tsx");
    const css = readCode("../../src/components/routes/CustomerJourneyList.module.css");
    expect(src).not.toMatch(/PhoneFrame|InfinityMark|active|tabIndex|role="list"/);
    expect(css).not.toMatch(/overflow-x|scroll-snap|@keyframes|animation:/);
    expect(css).not.toMatch(/height:\s*\d+px/); // no fixed device height
  });

  it("uses no metric, price or result language (screens are generic interface copy)", () => {
    const { container } = render(<CustomerJourneyList steps={customerJourney} />);
    const text = container.textContent ?? "";
    expect(text).not.toMatch(/[£$€]\s?\d/); // no price
    expect(text).not.toMatch(/\b\d+%/); // no percentage/metric
    expect(text).not.toMatch(/increase|ROI|revenue|conversion rate|results/i);
  });

  it("maps each step tone to a V2 domain ink (never a raw colour)", () => {
    const { container } = render(<CustomerJourneyList steps={customerJourney} />);
    const inks = [...container.querySelectorAll("ol > li")].map((li) => (li as HTMLElement).style.getPropertyValue("--step-ink"));
    expect(inks).toHaveLength(6);
    inks.forEach((ink) => expect(ink).toMatch(/^var\(--v2-/));
  });
});
