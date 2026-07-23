// @vitest-environment jsdom
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { describe, it, expect, afterEach } from "vitest";
import { render, screen, cleanup, fireEvent, within } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";
import { GrowthTroubleshooter } from "@/components/troubleshooter/GrowthTroubleshooter";
import { troubleshooterProblems } from "@/lib/content/data/troubleshooter";

afterEach(cleanup);
const read = (rel: string) => readFileSync(fileURLToPath(new URL(rel, import.meta.url)), "utf8");
const source = read("../../src/components/troubleshooter/GrowthTroubleshooter.tsx");

const P = troubleshooterProblems;
const selectorButton = (label: string) => screen.getByRole("button", { name: label });

describe("GrowthTroubleshooter — selection contract", () => {
  it("renders all eight problems as native buttons with a stable aria-controls, one pressed", () => {
    const { container } = render(<GrowthTroubleshooter problems={P} />);
    for (const p of P) {
      const btn = selectorButton(p.label);
      expect(btn.tagName, `${p.slug} is a button`).toBe("BUTTON");
      expect(btn).toHaveAttribute("type", "button");
      expect(btn).toHaveAttribute("aria-controls", "troubleshooter-result");
    }
    const pressed = container.querySelectorAll('button[aria-pressed="true"]');
    expect(pressed, "exactly one pressed").toHaveLength(1);
    expect(selectorButton(P[0].label)).toHaveAttribute("aria-pressed", "true");
  });

  it("shows the first problem's guidance initially (heading, explanation, reasons, checks, focus, stage)", () => {
    render(<GrowthTroubleshooter problems={P} />);
    const region = screen.getByRole("region", { name: P[0].label });
    expect(within(region).getByRole("heading", { name: P[0].label })).toBeInTheDocument();
    expect(within(region).getByText(P[0].explanation)).toBeInTheDocument();
    expect(within(region).getByText(P[0].reasons[0].title)).toBeInTheDocument();
    expect(within(region).getByText(P[0].checks[0])).toBeInTheDocument();
    expect(within(region).getByText(P[0].focusFirst)).toBeInTheDocument();
    expect(within(region).getByRole("link", { name: "See the connected stage" })).toHaveAttribute(
      "href",
      `/how-it-works#${P[0].recommendedStageSlug}`,
    );
    expect(within(region).getByRole("link", { name: "Build my growth plan" })).toHaveAttribute("href", "/growth-plan");
  });

  it("only the ACTIVE problem's detailed guidance is in the DOM (inactive detail is not)", () => {
    render(<GrowthTroubleshooter problems={P} />);
    // A reason title unique to problem 2 (spend-no-clarity) is absent while problem 1 is active.
    expect(screen.queryByText(P[1].reasons[0].title)).toBeNull(); // "No clean tracking"
    expect(screen.queryByText(P[1].checks[0])).toBeNull();
  });

  it("clicking another problem updates the active guidance completely", () => {
    render(<GrowthTroubleshooter problems={P} />);
    fireEvent.click(selectorButton(P[2].label));

    expect(selectorButton(P[2].label)).toHaveAttribute("aria-pressed", "true");
    expect(selectorButton(P[0].label)).toHaveAttribute("aria-pressed", "false");

    const region = screen.getByRole("region", { name: P[2].label });
    expect(within(region).getByRole("heading", { name: P[2].label })).toBeInTheDocument();
    expect(within(region).getByText(P[2].explanation)).toBeInTheDocument();
    expect(within(region).getByText(P[2].reasons[0].title)).toBeInTheDocument();
    expect(within(region).getByText(P[2].checks[0])).toBeInTheDocument();
    expect(within(region).getByText(P[2].focusFirst)).toBeInTheDocument();
    expect(within(region).getByRole("link", { name: "See the connected stage" })).toHaveAttribute(
      "href",
      `/how-it-works#${P[2].recommendedStageSlug}`,
    );
    // The previously-active problem's detail is gone.
    expect(screen.queryByText(P[0].explanation)).toBeNull();
  });

  it("announces the change through a concise polite status", () => {
    const { container } = render(<GrowthTroubleshooter problems={P} />);
    const status = container.querySelector('[aria-live="polite"]');
    expect(status).not.toBeNull();
    expect(status).toHaveTextContent(`Showing guidance for: ${P[0].label}`);
    fireEvent.click(selectorButton(P[3].label));
    expect(container.querySelector('[aria-live="polite"]')).toHaveTextContent(
      `Showing guidance for: ${P[3].label}`,
    );
  });
});

describe("GrowthTroubleshooter — source contract (no hover / API / persistence / URL state)", () => {
  it("selection is click-driven, never hover-driven", () => {
    expect(source).toMatch(/onClick=\{\(\)\s*=>\s*setActiveSlug/);
    expect(source).not.toMatch(/onMouseEnter|onMouseOver|onPointerEnter|onFocus=\{\(\)\s*=>\s*setActiveSlug/);
  });
  it("makes no network request and adds no persistence or URL state", () => {
    expect(source).not.toMatch(/\bfetch\(|localStorage|sessionStorage|useRouter|useSearchParams|history\.|location\.hash|pushState/);
  });
  it("keeps the state in React only (useState, first-problem fallback)", () => {
    expect(source).toMatch(/useState\(problems\[0\]\?\.slug\)/);
    expect(source).toMatch(/problems\.find\(\(p\)\s*=>\s*p\.slug === activeSlug\)\s*\?\?\s*problems\[0\]/);
  });
});
