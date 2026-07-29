// @vitest-environment jsdom
import { describe, it, expect, afterEach } from "vitest";
import { readFileSync } from "node:fs";
import { resolve as pathResolve } from "node:path";
import { render, screen, cleanup } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";
import { StickyRoadmap } from "@/components/routes/StickyRoadmap";
import { roadmaps } from "@/lib/content/data/roadmaps";
import { stages } from "@/lib/content/data/stages";

afterEach(cleanup);

const ROADMAP = roadmaps.find((r) => r.slug === "ecommerce") ?? roadmaps[0];
const STAGE_BY_SLUG = new Map(stages.map((s) => [s.slug, s]));

describe("StickyRoadmap — wired to real roadmap data", () => {
  it("renders the roadmap's real name, intro and every phase title (not hard-coded)", () => {
    render(<StickyRoadmap />);
    expect(screen.getByRole("heading", { name: ROADMAP.name })).toBeInTheDocument();
    expect(screen.getByText(ROADMAP.intro)).toBeInTheDocument();
    for (const phase of ROADMAP.phases) {
      expect(screen.getAllByText(phase.title).length).toBeGreaterThanOrEqual(1);
    }
  });

  it("resolves each phase's stage NAME from the stages data", () => {
    render(<StickyRoadmap />);
    for (const phase of ROADMAP.phases) {
      const stage = STAGE_BY_SLUG.get(phase.stageSlug);
      if (stage) expect(screen.getAllByText(stage.name).length).toBeGreaterThanOrEqual(1);
    }
  });

  it("pairs one sync node with one stage block per phase, indexed for the observer", () => {
    const { container } = render(<StickyRoadmap />);
    const nodes = container.querySelectorAll("[data-roadmap-node]");
    const blocks = container.querySelectorAll("[data-roadmap-block]");
    expect(nodes.length).toBe(ROADMAP.phases.length);
    expect(blocks.length).toBe(ROADMAP.phases.length);
    nodes.forEach((n, i) => expect(n.getAttribute("data-roadmap-node")).toBe(String(i)));
    blocks.forEach((b, i) => expect(b.getAttribute("data-roadmap-block")).toBe(String(i)));
  });
});

describe("StickyRoadmap — architecture", () => {
  const read = (p: string) => readFileSync(pathResolve(process.cwd(), p), "utf8");

  it("is a server component; only the active-stage sync is a client wrapper", () => {
    expect(read("src/components/routes/StickyRoadmap.tsx")).not.toMatch(/["']use client["']/);
    expect(read("src/components/routes/RoadmapSync.tsx")).toMatch(/["']use client["']/);
  });

  it("uses position: sticky (no scroll-hijack) and drops the pin to a static column below 960px", () => {
    const css = read("src/components/routes/StickyRoadmap.module.css");
    expect(css).toMatch(/position:\s*sticky/);
    const mq = css.slice(css.indexOf("@media (max-width: 960px)"));
    expect(mq).toMatch(/position:\s*static/);
    expect(mq).toMatch(/grid-template-columns:\s*1fr/);
  });

  it("drives the active stage from IntersectionObserver, not scroll-position arithmetic", () => {
    const sync = read("src/components/routes/RoadmapSync.tsx");
    expect(sync).toMatch(/IntersectionObserver/);
    expect(sync).not.toMatch(/scrollY|scrollTop|pageYOffset/);
  });

  it("has a reduced-motion state that lights every stage's node at once", () => {
    const css = read("src/components/routes/StickyRoadmap.module.css");
    const rm = css.slice(css.indexOf("prefers-reduced-motion"));
    expect(css).toMatch(/prefers-reduced-motion: reduce/);
    // the active dot treatment is applied unconditionally under reduced motion (uses --node-ink,
    // not gated on [data-active])
    expect(rm).toMatch(/--node-ink/);
    expect(rm).toMatch(/transition:\s*none/);
  });
});
