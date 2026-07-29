// @vitest-environment jsdom
import { describe, it, expect, afterEach } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { render, screen, cleanup } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";
import { FloatingCard } from "@/components/primitives/FloatingCard";

afterEach(cleanup);

describe("FloatingCard — component", () => {
  it("renders a div by default with the floatingCard class and its children", () => {
    const { container } = render(<FloatingCard>+38%</FloatingCard>);
    const root = container.firstElementChild!;
    expect(root.tagName).toBe("DIV");
    expect(root.className).toContain("floatingCard");
    expect(root).toHaveTextContent("+38%");
  });

  it("honours `as` (aside)", () => {
    const { container } = render(<FloatingCard as="aside">x</FloatingCard>);
    expect(container.firstElementChild!.tagName).toBe("ASIDE");
  });

  it("passes through className and style (positioning is the caller's job)", () => {
    const { container } = render(
      <FloatingCard className="mine" style={{ position: "absolute", left: -24 }}>
        x
      </FloatingCard>,
    );
    const root = container.firstElementChild as HTMLElement;
    expect(root.className).toContain("floatingCard");
    expect(root.className).toContain("mine");
    expect(root.style.position).toBe("absolute");
    expect(root.style.left).toBe("-24px");
  });
});

describe("FloatingCard — depth contract (FloatingCard.module.css)", () => {
  const css = readFileSync(
    resolve(process.cwd(), "src/components/primitives/FloatingCard.module.css"),
    "utf8",
  );
  const decls = css.replace(/\/\*[\s\S]*?\*\//g, "");

  it("sits a step above the Panel: the raised-2 surface, its own --edge-top and a deep shadow", () => {
    expect(decls).toContain("var(--surface-raised-2");
    expect(decls).toContain("--edge-top");
    expect(decls).toContain("--shadow-lg");
  });

  it("uses semantic tokens only — no raw hex or rgb colour value", () => {
    expect(decls).not.toMatch(/#[0-9a-f]{3,8}\b/i);
    expect(decls).not.toMatch(/rgba?\(/i);
  });
});
