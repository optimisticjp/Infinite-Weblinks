// @vitest-environment jsdom
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { describe, it, expect, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";
import { TextField } from "@/components/forms/fields/TextField";
import { SelectField } from "@/components/forms/fields/SelectField";
import { TextAreaField } from "@/components/forms/fields/TextAreaField";

afterEach(cleanup);
const read = (rel: string) => readFileSync(fileURLToPath(new URL(rel, import.meta.url)), "utf8");
const readCode = (rel: string) =>
  read(rel)
    .replace(/\/\*[\s\S]*?\*\//g, "")
    .replace(/(^|[^:])\/\/.*$/gm, "$1");

describe("form-field appearance is additive (legacy default unchanged)", () => {
  it("a field with no appearance prop renders the legacy control, label and required wiring", () => {
    render(<TextField id="f" label="Full name" required value="" onChange={() => {}} />);
    const input = screen.getByLabelText(/Full name/);
    expect(input.tagName).toBe("INPUT");
    // Default (legacy) control class is applied — the existing consumer output is unchanged.
    expect(input.className).toContain("control");
    expect(input).toHaveAttribute("required");
  });

  it("appearance=\"v2\" still renders a working, labelled, accessible control", () => {
    render(<TextField id="g" label="Email" appearance="v2" required value="" onChange={() => {}} error="Bad email" />);
    const input = screen.getByLabelText(/Email/);
    expect(input.tagName).toBe("INPUT");
    expect(input).toHaveAttribute("aria-invalid", "true");
    expect(input).toHaveAttribute("aria-describedby");
    expect(input.className).toContain("control");
  });

  it("select and textarea accept the additive prop and stay operable by default", () => {
    render(
      <>
        <SelectField id="s" label="Pick" value="" onChange={() => {}} options={[{ value: "a", label: "A" }]} placeholder="Choose" />
        <TextAreaField id="t" label="Notes" value="" onChange={() => {}} maxLength={100} />
      </>,
    );
    expect(screen.getByLabelText("Pick").tagName).toBe("SELECT");
    expect(screen.getByLabelText("Notes").tagName).toBe("TEXTAREA");
  });
});

describe("form-field source contract — legacy default, v2 opt-in", () => {
  const files = {
    FormField: readCode("../../src/components/forms/FormField.tsx"),
    TextField: readCode("../../src/components/forms/fields/TextField.tsx"),
    SelectField: readCode("../../src/components/forms/fields/SelectField.tsx"),
    TextAreaField: readCode("../../src/components/forms/fields/TextAreaField.tsx"),
  };

  it("every field component defaults appearance to legacy and selects the v2 module only on opt-in", () => {
    for (const [name, src] of Object.entries(files)) {
      expect(src, `${name} defaults to legacy`).toMatch(/appearance\s*=\s*"legacy"/);
    }
    for (const name of ["TextField", "SelectField", "TextAreaField"] as const) {
      const src = files[name];
      expect(src, `${name} imports the v2 control module`).toContain("FormFieldV2.module.css");
      expect(src, `${name} selects control by appearance`).toMatch(/appearance === "v2" \? v2Control\.control : controlStyles\.control/);
    }
  });

  it("the growth-plan builder opts its five follow-up fields into the v2 appearance (Phase 2P)", () => {
    const plan = read("../../src/components/builder/PlanBuilder.tsx");
    expect((plan.match(/appearance="v2"/g) ?? []).length, "five follow-up fields opt into v2").toBe(5);
  });
});

describe("ContactForm presentation migration", () => {
  const src = read("../../src/components/forms/ContactForm.tsx");
  const code = readCode("../../src/components/forms/ContactForm.tsx");

  it("opts every field into the v2 appearance", () => {
    expect((src.match(/appearance="v2"/g) ?? []).length, "all eight fields opt into v2").toBe(8);
  });

  it("replaces GlowButton with the shared Button loading contract", () => {
    expect(code).not.toContain("GlowButton");
    expect(code).toContain("<Button");
    expect(code).toContain('loading={status === "submitting"}');
    expect(code).toContain('type="submit"');
    // Idle/submitting labels and the Send icon are preserved.
    expect(code).toContain("Send my goals");
    expect(code).toContain("Sending…");
    expect(code).toContain("Send size={18}");
  });

  it("removes the InfinityMark + SVG gradient success decoration for a flat IconTile", () => {
    expect(code).not.toContain("InfinityMark");
    expect(code).not.toMatch(/<svg|linearGradient|successConnector|successLine/);
    expect(src).not.toMatch(/#[0-9a-fA-F]{3,8}\b/); // no raw hex gradient stops
    expect(code).not.toContain("NodeOrb");
    expect(code).toContain("<IconTile");
    // Success is still an accessible live region with focus management.
    expect(code).toContain('role="status"');
    expect(code).toContain("tabIndex={-1}");
    expect(code).toContain("your message is on its way");
  });
});
