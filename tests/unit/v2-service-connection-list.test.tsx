// @vitest-environment jsdom
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { describe, it, expect, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";
import { ServiceConnectionList } from "@/components/routes/ServiceConnectionList";

afterEach(cleanup);
const readCode = (rel: string) =>
  readFileSync(fileURLToPath(new URL(rel, import.meta.url)), "utf8")
    .replace(/\/\*[\s\S]*?\*\//g, "")
    .replace(/(^|[^:])\/\/.*$/gm, "$1");

describe("ServiceConnectionList", () => {
  const connectsTo = [
    { label: "Build and launch", body: "The plan tells the build what to make first.", icon: "monitor", hue: "var(--domain-build)" },
    { label: "Get discovered", body: "It points the traffic work at the right people.", icon: "search", hue: "var(--domain-discover)" },
  ];
  const base = {
    categoryTitle: "Strategy & Discovery",
    categoryDescription: "Work out what you actually need before anything gets built.",
    categoryIcon: "compass",
    categoryTone: "var(--domain-strategy)",
    connectsTo,
  };

  it("is a semantic ordered list with the current category first, then each connectsTo in order", () => {
    const { container } = render(<ServiceConnectionList {...base} />);
    const ol = container.querySelector("ol");
    expect(ol, "ordered list root").not.toBeNull();
    const items = [...(ol?.querySelectorAll(":scope > li") ?? [])];
    expect(items).toHaveLength(1 + connectsTo.length);

    const labels = items.map((li) => li.querySelector("h3")?.textContent ?? "");
    expect(labels[0]).toContain("Strategy & Discovery");
    expect(labels[1]).toContain("Build and launch");
    expect(labels[2]).toContain("Get discovered");
  });

  it("renders H3 labels, full bodies and a mapped V2 tone per item, with no links", () => {
    const { container } = render(<ServiceConnectionList {...base} />);
    expect(container.querySelector("a"), "no links (no verified destination)").toBeNull();
    expect(container.querySelector("button")).toBeNull();
    expect(screen.getByRole("heading", { level: 3, name: /Strategy & Discovery/ })).toBeInTheDocument();
    for (const c of connectsTo) {
      expect(screen.getByRole("heading", { level: 3, name: new RegExp(c.label) })).toBeInTheDocument();
      expect(screen.getByText(c.body)).toBeVisible();
    }
    const inks = [...container.querySelectorAll("ol > li")].map((li) => (li as HTMLElement).style.getPropertyValue("--conn-ink"));
    inks.forEach((ink) => expect(ink).toMatch(/^var\(--v2-/));
  });

  it("has no ConnectorPath, connector-only item, animation or interaction", () => {
    const src = readCode("../../src/components/routes/ServiceConnectionList.tsx");
    const css = readCode("../../src/components/routes/ServiceConnectionList.module.css");
    expect(src).not.toMatch(/ConnectorPath|NodeOrb|Link|href|aria-hidden="true">\s*<\/li>/);
    expect(css).not.toMatch(/@keyframes|animation:|overflow-x|scroll-snap|glow|gradient/i);
    // Every list item carries a label + body (no connector-only items).
    const { container } = render(<ServiceConnectionList {...base} />);
    for (const li of container.querySelectorAll("ol > li")) {
      expect(li.querySelector("h3"), "each item has a heading").not.toBeNull();
      expect(li.querySelector("p"), "each item has a body").not.toBeNull();
    }
  });
});
