// @vitest-environment jsdom
import { describe, it, expect, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";
import { ArticleMetaLine } from "@/components/routes/ArticleMetaLine";

afterEach(cleanup);

describe("ArticleMetaLine", () => {
  it("is inline-safe: the root is a <span> with no block-level descendants", () => {
    const { container } = render(<ArticleMetaLine readMinutes={6} />);
    expect(container.firstElementChild?.tagName).toBe("SPAN");
    expect(container.querySelector("div, p, section, article, ul, li")).toBeNull();
  });

  it("shows the reading time only when present", () => {
    const withRead = render(<ArticleMetaLine readMinutes={5} />);
    expect(screen.getByText(/5 min read/)).toBeInTheDocument();
    withRead.unmount();
    const withoutRead = render(<ArticleMetaLine />);
    expect(screen.queryByText(/min read/)).toBeNull();
  });

  it("renders a <time dateTime> for a real published date, keeping the original ISO", () => {
    const { container } = render(<ArticleMetaLine publishedAt="2025-03-14T12:00:00Z" />);
    const time = container.querySelector("time");
    expect(time).not.toBeNull();
    expect(time).toHaveAttribute("datetime", "2025-03-14T12:00:00Z");
    // readable en-GB output (month + year are timezone-stable for a mid-month date)
    expect(time?.textContent).toMatch(/March 2025/);
  });

  it("omits the date safely for an invalid or absent value (never invents one)", () => {
    const invalid = render(<ArticleMetaLine readMinutes={4} publishedAt="not-a-real-date" />);
    expect(invalid.container.querySelector("time")).toBeNull();
    expect(screen.getByText(/4 min read/)).toBeInTheDocument();
    invalid.unmount();
    const absent = render(<ArticleMetaLine readMinutes={4} />);
    expect(absent.container.querySelector("time")).toBeNull();
  });

  it("always shows the organisation author, never a fabricated individual", () => {
    render(<ArticleMetaLine readMinutes={6} />);
    expect(screen.getByText("By Infinite Weblinks")).toBeInTheDocument();
  });

  it("accepts an explicit organisation author label", () => {
    render(<ArticleMetaLine authorLabel="Infinite Weblinks Team" />);
    expect(screen.getByText("By Infinite Weblinks Team")).toBeInTheDocument();
  });
});
