// @vitest-environment jsdom
import { describe, it, expect, afterEach } from "vitest";
import { render, screen, cleanup, within } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";
import { ScenarioApproachList, type ApproachStep } from "@/components/routes/ScenarioApproachList";

afterEach(cleanup);

const STEPS: ApproachStep[] = [
  { number: 1, label: "A store built to convert", detail: "Fix the checkout and product pages.", icon: "monitor", tone: "var(--domain-build)" },
  { number: 2, label: "Tracking you can trust", detail: "Set up analytics properly.", icon: "bar-chart-3", tone: "var(--domain-ai)" },
  { number: 3, label: "Follow-up that brings people back", detail: "Automated abandoned-cart email.", icon: "mail", tone: "var(--domain-retain)" },
];

describe("ScenarioApproachList", () => {
  it("renders a semantic ordered list with the steps in source order", () => {
    const { container } = render(<ScenarioApproachList steps={STEPS} />);
    const ol = container.querySelector("ol");
    expect(ol).not.toBeNull();
    const items = within(ol as HTMLElement).getAllByRole("listitem");
    expect(items).toHaveLength(3);
    expect(items[0]).toHaveTextContent("A store built to convert");
    expect(items[1]).toHaveTextContent("Tracking you can trust");
    expect(items[2]).toHaveTextContent("Follow-up that brings people back");
  });

  it("uses an <h3> per step label and shows its detail", () => {
    render(<ScenarioApproachList steps={STEPS} />);
    expect(screen.getByRole("heading", { level: 3, name: "A store built to convert" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { level: 3, name: "Tracking you can trust" })).toBeInTheDocument();
    expect(screen.getByText("Fix the checkout and product pages.")).toBeVisible();
  });

  it("renders a decorative icon per step and maps each tone to an accessible V2 ink", () => {
    const { container } = render(<ScenarioApproachList steps={STEPS} />);
    // an icon glyph per step (decorative IconTile), and the mapped ink on each step
    expect(container.querySelectorAll('[aria-hidden="true"] svg').length).toBeGreaterThanOrEqual(3);
    const items = container.querySelectorAll("ol > li");
    expect((items[0] as HTMLElement).style.getPropertyValue("--step-ink")).toBe("var(--v2-domain-build-ink)");
    expect((items[1] as HTMLElement).style.getPropertyValue("--step-ink")).toBe("var(--v2-domain-ai-ink)");
    expect((items[2] as HTMLElement).style.getPropertyValue("--step-ink")).toBe("var(--v2-domain-retain-ink)");
  });

  it("has no ConnectorPath / NodeOrb / canvas and no progress or result language", () => {
    const { container } = render(<ScenarioApproachList steps={STEPS} />);
    expect(container.querySelector("canvas")).toBeNull();
    expect(container.querySelector('[class*="orbLegacy"]')).toBeNull();
    expect(container.querySelector('[class*="ConnectorPath"], [class*="connector"]')).toBeNull();
    const text = container.textContent ?? "";
    expect(text).not.toMatch(/\d+%|progress|outcome|result|complete/i);
  });

  it("does not make the static step <li> focusable", () => {
    const { container } = render(<ScenarioApproachList steps={STEPS} />);
    for (const li of Array.from(container.querySelectorAll("ol > li"))) {
      expect(li.hasAttribute("tabindex")).toBe(false);
    }
  });
});
