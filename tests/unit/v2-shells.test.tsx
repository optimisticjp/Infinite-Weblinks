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

// Marker so we can assert whether the cosmic background layer was rendered.
vi.mock("@/components/viz/CosmicBackground", () => ({
  CosmicBackground: () => <div data-testid="cosmic-bg" />,
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
      expect(screen.queryByTestId("cosmic-bg")).toBeNull();
      unmount();
    }
  });

  it("defaults to the light surface", () => {
    const { container } = render(<PageHeader title="T" />);
    expect(container.querySelector("section")!.className).toContain("theme-light");
  });
});

describe("SectionShell", () => {
  it("defaults to the legacy cosmic surface for existing callers", () => {
    const { container } = render(
      <SectionShell title="Legacy" background>
        child
      </SectionShell>,
    );
    const section = container.querySelector("section")!;
    expect(section.className).toContain("theme-cosmic");
    // legacy background still renders the cosmic layer
    expect(screen.getByTestId("cosmic-bg")).toBeInTheDocument();
    expect(screen.getByText("child")).toBeInTheDocument();
  });

  it("maps explicit surfaces to the right theme class", () => {
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
      expect(container.querySelector("section")!.className).toContain(cls);
      unmount();
    }
  });

  it("never renders the cosmic background on V2 surfaces, even if background is passed", () => {
    render(
      <SectionShell surface="light" background="horizon" title="T">
        x
      </SectionShell>,
    );
    expect(screen.queryByTestId("cosmic-bg")).toBeNull();
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

  it("uses a plain (non-gradient) eyebrow on V2 surfaces and the gradient eyebrow on legacy", () => {
    const v2 = render(
      <SectionShell surface="light" eyebrow="Kicker" title="T">
        x
      </SectionShell>,
    );
    // non-scoped CSS-module names in tests: gradient eyebrow === "eyebrow", V2 === "eyebrowV2"
    expect(within(v2.container).getByText("Kicker").className).toBe("eyebrowV2");
    v2.unmount();

    const legacy = render(
      <SectionShell eyebrow="Kicker" title="T">
        x
      </SectionShell>,
    );
    expect(within(legacy.container).getByText("Kicker").className).toBe("eyebrow");
  });
});
