// @vitest-environment jsdom
import { describe, it, expect, afterEach } from "vitest";
import { render, screen, cleanup, within } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";
import { PlanReveal } from "@/components/builder/PlanReveal";
import type { GrowthPlanResult } from "@/lib/growth-plan/types";

afterEach(cleanup);

const FULL: GrowthPlanResult = {
  matchedRuleId: "secret-internal-rule-id-9f2",
  startHere: ["Publish a clear one-page website", "Set up email on your own domain"],
  connectNext: ["Connect a contact form", "Add privacy-friendly analytics"],
  addLater: ["Start a newsletter", "Add checkout when demand is steady"],
  relevantCapabilities: ["Website & landing pages", "Domain & email setup"],
  exampleTools: ["Google Workspace", "Cloudflare"],
  expectedOutcomes: ["A site you own", "A clear view of your visitors"],
  howWeHelp: "We'd set up the first version with you, then hand over the controls.",
};

describe("PlanReveal — V2 result view, truthful framing", () => {
  it("keeps the result test id and renders every section from the result arrays", () => {
    render(<PlanReveal result={FULL} />);
    const region = screen.getByTestId("growth-plan-result");
    expect(region).toBeInTheDocument();

    // Roadmap phases (all three non-empty here).
    expect(within(region).getByRole("heading", { name: "Start here" })).toBeInTheDocument();
    expect(within(region).getByRole("heading", { name: "Connect next" })).toBeInTheDocument();
    expect(within(region).getByRole("heading", { name: "Add later" })).toBeInTheDocument();

    // Every roadmap item and every chip / outcome / help line is present verbatim.
    for (const t of [
      ...FULL.startHere,
      ...FULL.connectNext,
      ...FULL.addLater,
      ...FULL.relevantCapabilities,
      ...FULL.exampleTools,
      ...FULL.expectedOutcomes,
      FULL.howWeHelp,
    ]) {
      expect(within(region).getByText(t)).toBeInTheDocument();
    }

    // The detail / help section headings.
    expect(within(region).getByText("What this involves")).toBeInTheDocument();
    expect(within(region).getByText("Tools that fit your setup")).toBeInTheDocument();
    expect(within(region).getByText("How we'd help")).toBeInTheDocument();
  });

  it("marks the first start-here item (only) as the recommended starting point", () => {
    render(<PlanReveal result={FULL} />);
    expect(screen.getAllByText("Recommended starting point")).toHaveLength(1);
  });

  it("uses the truthful reusable-model framing, never 'the same growth journey we use with everyone'", () => {
    render(<PlanReveal result={FULL} />);
    const region = screen.getByTestId("growth-plan-result");
    const text = region.textContent ?? "";
    expect(text).toMatch(/reviewed framework/i);
    expect(text).toMatch(/not every business needs every stage/i);
    expect(text).toMatch(/sensible starting point, not a guarantee/i);
    expect(text).not.toMatch(/the same growth journey we use with everyone/i);
  });

  it("titles the outcomes 'What this plan is designed to help you build' (not 'What you'd end up with')", () => {
    render(<PlanReveal result={FULL} />);
    expect(screen.getByText("What this plan is designed to help you build")).toBeInTheDocument();
    expect(screen.queryByText(/What you'?d end up with/i)).toBeNull();
  });

  it("shows the example-tools disclaimer next to the tools", () => {
    render(<PlanReveal result={FULL} />);
    expect(
      screen.getByText("Example tools are illustrative. No partnership or endorsement is implied."),
    ).toBeInTheDocument();
  });

  it("never renders the internal rule id, and carries no gradient word", () => {
    const { container } = render(<PlanReveal result={FULL} />);
    expect(container.textContent ?? "").not.toContain(FULL.matchedRuleId);
    expect(container.querySelector(".iw-gradient-word")).toBeNull();
  });

  it("omits empty sections: no tools, no disclaimer, no outcomes, no skipped phase", () => {
    const minimal: GrowthPlanResult = {
      matchedRuleId: "r",
      startHere: ["Only a starting point"],
      connectNext: [],
      addLater: [],
      relevantCapabilities: ["One capability"],
      exampleTools: [],
      expectedOutcomes: [],
      howWeHelp: "A short honest note.",
    };
    render(<PlanReveal result={minimal} />);
    expect(screen.getByRole("heading", { name: "Start here" })).toBeInTheDocument();
    expect(screen.queryByRole("heading", { name: "Connect next" })).toBeNull();
    expect(screen.queryByRole("heading", { name: "Add later" })).toBeNull();
    expect(screen.queryByText("Tools that fit your setup")).toBeNull();
    expect(screen.queryByText(/Example tools are illustrative/)).toBeNull();
    expect(screen.queryByText("What this plan is designed to help you build")).toBeNull();
    expect(screen.getByText("What this involves")).toBeInTheDocument();
    expect(screen.getByText("How we'd help")).toBeInTheDocument();
  });
});
