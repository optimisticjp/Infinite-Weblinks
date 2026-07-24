// @vitest-environment jsdom
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { describe, it, expect, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";
import { OptionCards } from "@/components/primitives/OptionCards";
import { Stepper } from "@/components/primitives/Stepper";
import { ProgressChecklist } from "@/components/primitives/ProgressChecklist";

afterEach(cleanup);
const read = (rel: string) => readFileSync(fileURLToPath(new URL(rel, import.meta.url)), "utf8");
const readCode = (rel: string) =>
  read(rel).replace(/\/\*[\s\S]*?\*\//g, "").replace(/(^|[^:])\/\/.*$/gm, "$1");

describe("OptionCards — semantics preserved, V2 appearance", () => {
  const options = [
    { value: "a", label: "Option A", description: "The first one" },
    { value: "b", label: "Option B" },
    { value: "c", label: "Option C" },
  ];

  it("is a fieldset with a legend and native radios (one per option) in source order", () => {
    const { container } = render(<OptionCards legend="Pick one" name="grp" options={options} value="b" onChange={() => {}} />);
    expect(container.querySelector("fieldset")).not.toBeNull();
    expect(screen.getByText("Pick one").tagName).toBe("LEGEND");
    const radios = container.querySelectorAll('input[type="radio"][name="grp"]');
    expect(radios).toHaveLength(3);
    expect([...radios].map((r) => (r as HTMLInputElement).value)).toEqual(["a", "b", "c"]);
  });

  it("shows the checked state with more than colour (a checked radio + a tick element), not colour alone", () => {
    const { container } = render(<OptionCards legend="Pick" name="g" options={options} value="b" onChange={() => {}} />);
    const checked = container.querySelector('input[value="b"]') as HTMLInputElement;
    expect(checked.checked).toBe(true);
    // The selected option's label carries the `checked` class AND renders a tick badge (an svg),
    // so selection is conveyed by the checked radio + a mark, never colour alone.
    const label = checked.closest("label")!;
    expect(label.className).toMatch(/checked/);
    expect(label.querySelector("svg"), "checked option renders a tick mark").not.toBeNull();
  });

  it("ties the error to every radio via aria-describedby and announces it", () => {
    const { container } = render(<OptionCards legend="Pick" name="g" options={options} value={undefined} onChange={() => {}} error="Please choose an option." />);
    const alert = screen.getByRole("alert");
    expect(alert).toHaveTextContent("Please choose an option.");
    const errorId = alert.getAttribute("id");
    for (const r of container.querySelectorAll('input[type="radio"]')) {
      expect(r.getAttribute("aria-describedby")).toBe(errorId);
    }
  });

  it("uses no arbitrary palette cycle — the domain bridge maps a tone, everything else one fallback", () => {
    const src = readCode("../../src/components/primitives/OptionCards.tsx");
    expect(src).not.toContain("CYCLE");
    expect(src).toContain("domainInk");
    expect(src).toMatch(/opt\.color \? domainInk\(opt\.color\) : FALLBACK_INK/);
  });
});

describe("Stepper — semantics preserved, V2 appearance", () => {
  it("is an accessible ordered list with the four labels, current marked, done shown with a check", () => {
    const { container } = render(<Stepper steps={["Business", "Goal", "Setup", "How we'd work"]} current={1} ariaLabel="Growth plan steps" />);
    const ol = screen.getByRole("list", { name: "Growth plan steps" });
    expect(ol.tagName).toBe("OL");
    const items = container.querySelectorAll("li");
    expect(items).toHaveLength(4);
    expect(items[1].getAttribute("aria-current")).toBe("step");
    // Completed step (index 0) carries a visually-hidden "completed" status word (not colour-only).
    expect(items[0]).toHaveTextContent(/completed/);
    expect(items[1]).toHaveTextContent(/current step/);
  });
});

describe("ProgressChecklist — semantics preserved, V2 appearance", () => {
  it("renders the title, every item with an explicit status word, and the note", () => {
    render(
      <ProgressChecklist
        title="Your plan is taking shape"
        items={[
          { label: "Business", state: "done" },
          { label: "Goal", state: "current" },
          { label: "Setup", state: "pending" },
          { label: "How we'd work", state: "pending" },
        ]}
        note="Your information is safe."
      />,
    );
    expect(screen.getAllByText("Your plan is taking shape").length).toBeGreaterThan(0);
    // Status is textual (Done / In progress / To do), never colour-only.
    expect(screen.getByText("Done")).toBeInTheDocument();
    expect(screen.getByText("In progress")).toBeInTheDocument();
    expect(screen.getAllByText("To do").length).toBe(2);
    expect(screen.getByText("Your information is safe.")).toBeInTheDocument();
  });
});

describe("builder primitives — V2 token hygiene at a glance (no legacy palette / horizontal scroller)", () => {
  for (const rel of [
    "../../src/components/primitives/OptionCards.module.css",
    "../../src/components/primitives/Stepper.module.css",
    "../../src/components/primitives/ProgressChecklist.module.css",
  ]) {
    const css = read(rel).replace(/\/\*[\s\S]*?\*\//g, "");
    it(`${rel.split("/").pop()} uses no legacy domain/palette token, no --white/--danger, no horizontal scroller`, () => {
      expect(css).not.toMatch(/var\(--domain-/);
      expect(css).not.toMatch(/var\(--(white|grad-constellation|hairline-strong)\)/);
      expect(css).not.toMatch(/overflow-x:\s*(auto|scroll)/);
    });
  }
});
