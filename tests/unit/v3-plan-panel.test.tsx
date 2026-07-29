// @vitest-environment jsdom
import { describe, it, expect, afterEach } from "vitest";
import { readFileSync } from "node:fs";
import { resolve as pathResolve } from "node:path";
import { render, screen, cleanup, within } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";
import { PlanPanel } from "@/components/routes/PlanPanel";
import { resolve } from "@/lib/growth-plan/engine";
import { growthPlanRuleSet } from "@/lib/growth-plan/rules";

afterEach(cleanup);

// The same fixed input PlanPanel bakes in — resolved independently so the test proves the panel
// shows REAL engine output, not a hard-coded arrangement.
const EXPECTED = resolve(
  { businessType: "local-service", mainGoal: "get-leads-and-bookings", existingSetup: "I have a website or store" },
  growthPlanRuleSet,
);
const STEP_COUNT = EXPECTED.startHere.length + EXPECTED.connectNext.length + EXPECTED.addLater.length;
const STAGE_COUNT = [EXPECTED.startHere, EXPECTED.connectNext, EXPECTED.addLater].filter((p) => p.length > 0).length;

describe("PlanPanel — real engine output", () => {
  it("resolves to the local-bookings rule and renders its real start/connect/later items", () => {
    render(<PlanPanel />);
    expect(EXPECTED.matchedRuleId).toBe("local-bookings"); // guards the fixture stays representative
    for (const item of [...EXPECTED.startHere, ...EXPECTED.connectNext, ...EXPECTED.addLater]) {
      expect(screen.getAllByText(item).length).toBeGreaterThanOrEqual(1);
    }
  });

  it("shows the real inputs as Built-from chips, titled from the content layer", () => {
    render(<PlanPanel />);
    expect(screen.getByText("Local & Service Businesses")).toBeInTheDocument();
    expect(screen.getByText("Get more leads and bookings")).toBeInTheDocument();
  });

  it("marks the recommended starting point", () => {
    render(<PlanPanel />);
    expect(screen.getByText("Recommended start")).toBeInTheDocument();
  });
});

describe("PlanPanel — floating cards are derived facts, never outcome/performance claims", () => {
  it("carries the plan's first step and roadmap size (both derived from the result)", () => {
    const { container } = render(<PlanPanel />);
    const firstStepCard = container.querySelector('[class*="floatA"]') as HTMLElement;
    expect(within(firstStepCard).getByText("First step")).toBeInTheDocument();
    expect(within(firstStepCard).getByText(EXPECTED.startHere[0])).toBeInTheDocument();

    const roadmapCard = container.querySelector('[class*="floatB"]') as HTMLElement;
    expect(within(roadmapCard).getByText(`${STEP_COUNT} steps`)).toBeInTheDocument();
    expect(within(roadmapCard).getByText(`across ${STAGE_COUNT} stages`)).toBeInTheDocument();
  });

  it("contains no percentage, currency, multiplier, +N delta or growth claim in the floating cards", () => {
    const { container } = render(<PlanPanel />);
    const floatText = [...container.querySelectorAll('[class*="floatA"], [class*="floatB"]')]
      .map((n) => n.textContent ?? "")
      .join("  ");
    expect(floatText).not.toMatch(/\d+(\.\d+)?\s?%/); // percentage
    expect(floatText).not.toMatch(/[£$€]\s?\d/); // currency
    expect(floatText).not.toMatch(/\b\d+(\.\d+)?\s?x\b/i); // multiplier
    expect(floatText).not.toMatch(/\+\s?\d/); // +N delta
    expect(floatText).not.toMatch(/\b(increase|boost|grow|more|up)\s+by\b/i); // "up by …"
  });
});

describe("PlanPanel — architecture", () => {
  const read = (p: string) => readFileSync(pathResolve(process.cwd(), p), "utf8");

  it("is a server component; the reveal is delegated to the client RevealOnView wrapper", () => {
    expect(read("src/components/routes/PlanPanel.tsx")).not.toMatch(/["']use client["']/);
    expect(read("src/components/primitives/RevealOnView.tsx")).toMatch(/["']use client["']/);
  });

  it("has a complete prefers-reduced-motion static state (visible, no transition)", () => {
    const css = read("src/components/routes/PlanPanel.module.css");
    const rm = css.slice(css.indexOf("prefers-reduced-motion"));
    expect(css).toMatch(/prefers-reduced-motion: reduce/);
    expect(rm).toMatch(/opacity:\s*1/);
    expect(rm).toMatch(/transform:\s*none/);
    expect(rm).toMatch(/transition:\s*none/);
  });
});
