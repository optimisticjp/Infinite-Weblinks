// @vitest-environment jsdom
import { describe, it, expect, afterEach } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { render, screen, cleanup } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";
import { Panel } from "@/components/primitives/Panel";

afterEach(cleanup);

describe("Panel — component", () => {
  it("renders a div by default and always carries the panel class", () => {
    const { container } = render(<Panel>surface</Panel>);
    const root = container.firstElementChild!;
    expect(root.tagName).toBe("DIV");
    expect(root.className).toContain("panel");
    expect(root).toHaveTextContent("surface");
  });

  it("honours `as` (section / article / li)", () => {
    const { container, rerender } = render(<Panel as="section">s</Panel>);
    expect(container.firstElementChild!.tagName).toBe("SECTION");
    rerender(<Panel as="article">a</Panel>);
    expect(container.firstElementChild!.tagName).toBe("ARTICLE");
    rerender(<Panel as="li">l</Panel>);
    expect(container.firstElementChild!.tagName).toBe("LI");
  });

  it("adds inner padding only when `padded`", () => {
    const { container, rerender } = render(<Panel>frame</Panel>);
    expect(container.firstElementChild!.className).not.toContain("padded");
    rerender(<Panel padded>content</Panel>);
    expect(container.firstElementChild!.className).toContain("padded");
  });

  it("passes through id, className and style", () => {
    const { container } = render(
      <Panel id="plan" className="mine" style={{ marginTop: 4 }}>
        c
      </Panel>,
    );
    const root = container.firstElementChild as HTMLElement;
    expect(root.id).toBe("plan");
    expect(root.className).toContain("panel");
    expect(root.className).toContain("mine");
    expect(root.style.marginTop).toBe("4px");
  });

  it("renders arbitrary region children (head/body/foot composition)", () => {
    render(
      <Panel>
        <header>Your growth plan</header>
        <div>body</div>
      </Panel>,
    );
    expect(screen.getByText("Your growth plan")).toBeInTheDocument();
    expect(screen.getByText("body")).toBeInTheDocument();
  });
});

describe("Panel — V3 product-surface contract (Panel.module.css)", () => {
  // vitest runs from the repo root; a jsdom env makes import.meta.url an http URL, so read via cwd.
  const css = readFileSync(resolve(process.cwd(), "src/components/primitives/Panel.module.css"), "utf8");
  const decls = css.replace(/\/\*[\s\S]*?\*\//g, "");

  it("is built from the semantic raised surface + hairline", () => {
    expect(decls).toContain("background: var(--surface-raised)");
    expect(decls).toMatch(/border:\s*1px solid var\(--hairline\)/);
  });

  it("carries BOTH the --edge-top highlight and the panel shadow (a real interface, not a flat block)", () => {
    expect(decls).toContain("--edge-top");
    expect(decls).toContain("--shadow-panel");
  });

  it("uses semantic tokens only — no raw hex or rgb colour value", () => {
    // `transparent` (the hue-free box-shadow fallback) is allowed; a hex or rgb() hue is not.
    expect(decls).not.toMatch(/#[0-9a-f]{3,8}\b/i);
    expect(decls).not.toMatch(/rgba?\(/i);
  });
});
