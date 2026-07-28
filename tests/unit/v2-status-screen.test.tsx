// @vitest-environment jsdom
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { describe, it, expect, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";
import { StatusScreen } from "@/components/routes/StatusScreen";

/**
 * Phase 2S (§E) — the V2 status surface (shared by the 404 + error boundary). A calm light panel:
 * self-contained <main id="main"> (so the root skip link resolves), one H1, a restrained brand mark,
 * the caller's actions and helpful links — with no cosmic background, glow, GlowButton or animation.
 */
const read = (rel: string) => readFileSync(fileURLToPath(new URL(rel, import.meta.url)), "utf8");
afterEach(cleanup);

describe("StatusScreen — rendered contract", () => {
  const renderIt = () =>
    render(
      <StatusScreen
        code="404"
        title="We couldn't find that page"
        body="The link may be old or mistyped."
        actions={<a href="/">Back to home</a>}
        links={[
          { label: "How it works", href: "/how-it-works" },
          { label: "Services", href: "/services" },
        ]}
      />,
    );

  it("renders one <main id='main'> on the dark surface with a single H1", () => {
    const { container } = renderIt();
    const main = container.querySelector("main#main");
    expect(main, "main#main").not.toBeNull();
    expect(main).toHaveClass("theme-deep");
    expect(screen.getAllByRole("heading", { level: 1 })).toHaveLength(1);
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("We couldn't find that page");
    expect(screen.getByText("404")).toBeVisible();
  });

  it("exposes the helpful-links navigation with an accessible name and every link", () => {
    renderIt();
    const nav = screen.getByRole("navigation", { name: "Helpful links" });
    expect(nav).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "How it works" })).toHaveAttribute("href", "/how-it-works");
    expect(screen.getByRole("link", { name: "Services" })).toHaveAttribute("href", "/services");
  });

  it("renders no canvas and no decorative connector SVG", () => {
    const { container } = renderIt();
    expect(container.querySelector("canvas")).toBeNull();
    // The old reconnecting-connector <svg> path is gone; only the brand-mark <use> sprite remains.
    expect(container.querySelectorAll("path").length).toBe(0);
  });
});

describe("StatusScreen — source contract", () => {
  const src = read("../../src/components/routes/StatusScreen.tsx");
  const css = read("../../src/components/routes/StatusScreen.module.css");
  // Strip comments so the banned-construct check sees code, not the descriptive doc comment (which
  // legitimately says "non-luminous", "no cosmic background", etc.).
  const code = src.replace(/\/\*[\s\S]*?\*\//g, "").replace(/(^|[^:])\/\/.*$/gm, "$1");
  it("is V3: id='main', theme-deep, restrained non-luminous mark, no cosmic/glow/animation", () => {
    expect(src).toContain('id="main"');
    expect(src).toContain("theme-deep");
    expect(src).toMatch(/InfinityMark[^/]*glow=\{false\}/);
    for (const banned of ["CosmicBackground", "theme-cosmic", "GlowButton", "luminous", "connector"]) {
      expect(code, `no ${banned}`).not.toContain(banned);
    }
    expect(css, "no reconnect animation").not.toContain("reconnect");
    expect(css, "no keyframes").not.toContain("@keyframes");
  });
});

describe("404 + error routes — source contract", () => {
  const notFound = read("../../src/app/not-found.tsx");
  const error = read("../../src/app/error.tsx");
  it("the 404 preserves metadata + destinations and uses Button (not GlowButton)", () => {
    expect(notFound).toMatch(/robots:\s*\{\s*index:\s*false,\s*follow:\s*true\s*\}/);
    expect(notFound).toContain('code="404"');
    expect(notFound).toContain("Back to home");
    expect(notFound).toContain('href="/growth-plan"');
    expect(notFound).toContain('import { Button }');
    expect(notFound).not.toContain("GlowButton");
  });
  it("the error boundary is a Client Component preserving reset() + logging, using Button", () => {
    expect(error).toMatch(/^"use client";/);
    expect(error).toContain("reset()");
    expect(error).toContain("console.error(error)");
    expect(error).toContain("Try again");
    expect(error).toContain('import { Button }');
    expect(error).not.toContain("GlowButton");
  });
});
