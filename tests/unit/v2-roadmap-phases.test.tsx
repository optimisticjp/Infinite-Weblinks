// @vitest-environment jsdom
import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, cleanup, within } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";
import { RoadmapPhaseList, type RoadmapPhaseItem } from "@/components/routes/RoadmapPhaseList";

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

const PHASES: RoadmapPhaseItem[] = [
  {
    id: "phase-1",
    number: 1,
    title: "Build the foundation",
    summary: "Store, tracking and core email flows.",
    stage: { slug: "foundation", name: "Foundation", tone: "var(--blue)" },
    services: [
      { slug: "ga4-google-tag-manager-setup", categorySlug: "analytics-data", name: "GA4 & Google Tag Manager setup" },
    ],
    goals: [{ slug: "launch-professional-store", title: "Launch a professional store" }],
  },
  {
    id: "phase-2",
    number: 2,
    title: "Bring in and convert traffic",
    summary: "Ads and SEO, then reviews and retargeting.",
    stage: null, // optional — omitted
    services: [],
    goals: [],
  },
];

describe("RoadmapPhaseList", () => {
  it("renders a semantic ordered list with the phases in source order and stable ids", () => {
    const { container } = render(<RoadmapPhaseList phases={PHASES} />);
    const ol = container.querySelector("ol");
    expect(ol).not.toBeNull();
    const items = within(ol as HTMLElement).getAllByRole("listitem");
    expect(items).toHaveLength(2);
    expect(items[0]).toHaveAttribute("id", "phase-1");
    expect(items[1]).toHaveAttribute("id", "phase-2");
    // order preserved
    expect(items[0]).toHaveTextContent("Build the foundation");
    expect(items[1]).toHaveTextContent("Bring in and convert traffic");
  });

  it("uses an <h3> per phase title", () => {
    render(<RoadmapPhaseList phases={PHASES} />);
    expect(screen.getByRole("heading", { level: 3, name: "Build the foundation" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { level: 3, name: "Bring in and convert traffic" })).toBeInTheDocument();
  });

  it("links the stage, services and goals to their real destinations", () => {
    render(<RoadmapPhaseList phases={PHASES} />);
    expect(screen.getByRole("link", { name: "Foundation" })).toHaveAttribute("href", "/how-it-works#foundation");
    expect(screen.getByRole("link", { name: "GA4 & Google Tag Manager setup" })).toHaveAttribute(
      "href",
      "/services/analytics-data#ga4-google-tag-manager-setup",
    );
    expect(screen.getByRole("link", { name: "Launch a professional store" })).toHaveAttribute(
      "href",
      "/goals/launch-professional-store",
    );
  });

  it("omits empty optional groups (no Stage/Services/Goals labels for a bare phase)", () => {
    render(<RoadmapPhaseList phases={[PHASES[1]]} />);
    expect(screen.queryByText("Stage")).toBeNull();
    expect(screen.queryByText("Services in this phase")).toBeNull();
    expect(screen.queryByText("Goals this moves")).toBeNull();
  });

  it("has no NodeOrb/canvas dependency and no progress/duration/completion language", () => {
    const { container } = render(<RoadmapPhaseList phases={PHASES} />);
    expect(container.querySelector("canvas")).toBeNull();
    const text = container.textContent ?? "";
    expect(text).not.toMatch(/\d+%|\bweek|\bmonth|complete|progress|guaranteed/i);
  });
});
