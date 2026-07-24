// @vitest-environment jsdom
import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, cleanup, within } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";
import { PageHeader } from "@/components/routes/PageHeader";
import { SectionShell } from "@/components/sections/SectionShell";

vi.mock("next/link", () => ({
  default: ({ href, children, prefetch: _p, ...rest }: { href: unknown; children: unknown; prefetch?: unknown }) => {
    void _p;
    return (
      <a href={typeof href === "string" ? href : "#"} {...(rest as Record<string, unknown>)}>
        {children as never}
      </a>
    );
  },
}));

afterEach(cleanup);

describe("PageHeader", () => {
  it("renders exactly one <h1> carrying the title", () => {
    const { container } = render(<PageHeader title="Questions, answered plainly" />);
    const h1s = container.querySelectorAll("h1");
    expect(h1s).toHaveLength(1);
    expect(h1s[0]).toHaveTextContent("Questions, answered plainly");
  });

  it("renders breadcrumb, lead, actions, trust note and aside when provided", () => {
    render(
      <PageHeader
        title="T"
        breadcrumbs={[{ name: "FAQ" }]}
        lead="A supporting line."
        actions={<button type="button">Go</button>}
        trustNote="No sales pressure."
        aside={<div data-testid="aside">visual</div>}
      />,
    );
    expect(screen.getByRole("navigation", { name: /breadcrumb/i })).toBeInTheDocument();
    expect(screen.getByText("A supporting line.")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Go" })).toBeInTheDocument();
    expect(screen.getByText("No sales pressure.")).toBeInTheDocument();
    expect(screen.getByTestId("aside")).toBeInTheDocument();
  });

  it("maps surface to the right V2 theme class and never uses a cosmic surface", () => {
    for (const [surface, cls] of [
      ["light", "theme-light"],
      ["alt", "theme-light-alt"],
      ["night", "theme-night"],
    ] as const) {
      const { container, unmount } = render(<PageHeader surface={surface} title="T" />);
      const section = container.querySelector("section")!;
      expect(section.className).toContain(cls);
      expect(section.className).not.toContain("theme-cosmic");
      unmount();
    }
  });

  it("defaults to the light surface", () => {
    const { container } = render(<PageHeader title="T" />);
    expect(container.querySelector("section")!.className).toContain("theme-light");
  });
});

describe("SectionShell", () => {
  it("defaults to the V2 light surface (the legacy cosmic surface was removed in Phase 2S)", () => {
    const { container } = render(<SectionShell title="Default">child</SectionShell>);
    const section = container.querySelector("section")!;
    expect(section.className).toContain("theme-light");
    expect(section.className).not.toContain("theme-cosmic");
    expect(screen.getByText("child")).toBeInTheDocument();
  });

  it("maps explicit surfaces to the right theme class and never a cosmic surface", () => {
    for (const [surface, cls] of [
      ["light", "theme-light"],
      ["alt", "theme-light-alt"],
      ["night", "theme-night"],
    ] as const) {
      const { container, unmount } = render(
        <SectionShell surface={surface} title="T">
          x
        </SectionShell>,
      );
      const section = container.querySelector("section")!;
      expect(section.className).toContain(cls);
      expect(section.className).not.toContain("theme-cosmic");
      unmount();
    }
  });

  it("gives multiple untitled-id titled shells UNIQUE heading ids, each referenced by aria-labelledby", () => {
    const { container } = render(
      <div>
        <SectionShell surface="light" title="One">a</SectionShell>
        <SectionShell surface="light" title="Two">b</SectionShell>
        <SectionShell surface="alt" title="Three">c</SectionShell>
      </div>,
    );
    const ids: string[] = [];
    container.querySelectorAll("section").forEach((sec) => {
      const labelledby = sec.getAttribute("aria-labelledby");
      expect(labelledby).toBeTruthy();
      // aria-labelledby references a heading that exists inside that section
      expect(sec.querySelector(`[id="${labelledby}"]`)).not.toBeNull();
      ids.push(labelledby as string);
    });
    expect(ids).toHaveLength(3);
    expect(new Set(ids).size).toBe(3); // all unique — no "section-title" collisions
  });

  it("uses a readable ${id}-title heading id when an explicit id is given", () => {
    const { container } = render(
      <SectionShell surface="light" id="areas" title="Areas">
        x
      </SectionShell>,
    );
    expect(container.querySelector("section")!.getAttribute("aria-labelledby")).toBe("areas-title");
  });

  it("uses a plain (non-gradient) eyebrow on every V2 surface (the legacy gradient eyebrow was removed)", () => {
    for (const surface of ["light", "alt", "night"] as const) {
      const { container, unmount } = render(
        <SectionShell surface={surface} eyebrow="Kicker" title="T">
          x
        </SectionShell>,
      );
      // non-scoped CSS-module names in tests: the V2 eyebrow is "eyebrowV2"; the legacy gradient
      // "eyebrow" class no longer exists.
      expect(within(container).getByText("Kicker").className).toBe("eyebrowV2");
      unmount();
    }
  });
});
