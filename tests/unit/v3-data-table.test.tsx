// @vitest-environment jsdom
import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, fireEvent, cleanup, within } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";
import { DataTable, type DataTableRow, type DataTableFilter } from "@/components/primitives/DataTable";

vi.mock("next/link", () => ({
  default: ({ href, children, ...rest }: { href: unknown; children: unknown }) => (
    <a href={typeof href === "string" ? href : "#"} {...(rest as Record<string, unknown>)}>
      {children as never}
    </a>
  ),
}));

afterEach(cleanup);

const ROWS: DataTableRow[] = [
  { id: "a", label: "Bring customers back", tone: "var(--lime)", cells: ["Retain"], href: "/goals/a", filterKeys: ["retain"] },
  { id: "b", label: "Get found on Google", tone: "var(--cyan)", cells: ["Discover"], href: "/goals/b", filterKeys: ["discover"] },
];
const FILTERS: DataTableFilter[] = [
  { id: "retain", label: "Retain", tone: "var(--lime)" },
  { id: "discover", label: "Discover", tone: "var(--cyan)" },
];

describe("DataTable", () => {
  it("renders every row as a link with a leading domain-colour dot resolved through the bridge", () => {
    const { container } = render(<DataTable rows={ROWS} ariaLabel="Goals" />);
    expect(screen.getByRole("link", { name: /Bring customers back/ })).toHaveAttribute("href", "/goals/a");
    expect(screen.getByRole("link", { name: /Get found on Google/ })).toHaveAttribute("href", "/goals/b");
    // the dot resolves --lime -> the accessible V2 domain ink (never a raw hue)
    const dot = container.querySelector('[style*="--dt-dot"]') as HTMLElement;
    expect(dot.style.getPropertyValue("--dt-dot")).toBe("var(--v2-domain-retain-ink)");
  });

  it("filters rows by the chip's id (plain-data filterKeys) and restores on All", () => {
    render(<DataTable rows={ROWS} filters={FILTERS} ariaLabel="Goals" />);
    expect(screen.getByRole("link", { name: /Bring customers back/ })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Get found on Google/ })).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /Retain/ }));
    expect(screen.getByRole("link", { name: /Bring customers back/ })).toBeInTheDocument();
    expect(screen.queryByRole("link", { name: /Get found on Google/ })).toBeNull();

    fireEvent.click(screen.getByRole("button", { name: /^All$/ }));
    expect(screen.getByRole("link", { name: /Get found on Google/ })).toBeInTheDocument();
  });

  it("marks the active filter with aria-pressed (All is the default)", () => {
    render(<DataTable rows={ROWS} filters={FILTERS} ariaLabel="Goals" />);
    expect(screen.getByRole("button", { name: /^All$/ })).toHaveAttribute("aria-pressed", "true");
    fireEvent.click(screen.getByRole("button", { name: /Discover/ }));
    expect(screen.getByRole("button", { name: /Discover/ })).toHaveAttribute("aria-pressed", "true");
    expect(screen.getByRole("button", { name: /^All$/ })).toHaveAttribute("aria-pressed", "false");
  });

  it("shows a live count from countNoun, updating with the filter", () => {
    render(
      <DataTable
        rows={ROWS}
        filters={FILTERS}
        ariaLabel="Goals"
        countNoun={{ singular: "goal", plural: "goals" }}
      />,
    );
    expect(screen.getByText("2 goals")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: /Retain/ }));
    expect(screen.getByText("1 goal")).toBeInTheDocument();
  });

  it("renders a header from `columns` and the accessible list name", () => {
    render(<DataTable rows={ROWS} columns={["Goal", "World"]} ariaLabel="Goals" />);
    expect(screen.getByRole("list", { name: "Goals" })).toBeInTheDocument();
    expect(screen.getByText("Goal")).toBeInTheDocument();
    expect(screen.getByText("World")).toBeInTheDocument();
  });

  it("is a static list (no filter bar) when no filters are given", () => {
    render(<DataTable rows={ROWS} ariaLabel="Goals" />);
    expect(screen.queryByRole("group", { name: /Filter/ })).toBeNull();
  });
});
