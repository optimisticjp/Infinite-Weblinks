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

  it("accepts a strict YYYY-MM-DD calendar date and formats it without timezone drift", () => {
    // First of the month in UTC — the day would drift backwards if formatted in a negative
    // offset, so a correct <time> proves the date-only path is timezone-stable.
    const { container } = render(<ArticleMetaLine publishedAt="2025-03-01" />);
    const time = container.querySelector("time");
    expect(time).not.toBeNull();
    expect(time).toHaveAttribute("datetime", "2025-03-01");
    expect(time?.textContent).toBe("1 March 2025");
  });

  it("accepts a real leap day and rejects a non-leap 29 February", () => {
    const leap = render(<ArticleMetaLine publishedAt="2024-02-29" />);
    expect(leap.container.querySelector("time")?.textContent).toBe("29 February 2024");
    leap.unmount();
    const notLeap = render(<ArticleMetaLine publishedAt="2025-02-29" />);
    expect(notLeap.container.querySelector("time")).toBeNull();
  });

  it("rejects an impossible day even though JS would normalise it", () => {
    // new Date("2025-02-30") silently rolls to 2 March — we must not display that.
    const { container } = render(<ArticleMetaLine publishedAt="2025-02-30" />);
    expect(container.querySelector("time")).toBeNull();
  });

  it("rejects an out-of-range month or day", () => {
    for (const bad of ["2025-13-01", "2025-00-10", "2025-01-32", "2025-01-00"]) {
      const { container, unmount } = render(<ArticleMetaLine publishedAt={bad} />);
      expect(container.querySelector("time"), bad).toBeNull();
      unmount();
    }
  });

  it("rejects an incomplete or non-padded date", () => {
    for (const bad of ["2025", "2025-03", "2025-3-4", "25-03-04"]) {
      const { container, unmount } = render(<ArticleMetaLine publishedAt={bad} />);
      expect(container.querySelector("time"), bad).toBeNull();
      unmount();
    }
  });

  it("rejects free-form or locale-formatted date text", () => {
    for (const bad of ["14 March 2025", "March 14, 2025", "14/03/2025", "03/14/2025", "yesterday"]) {
      const { container, unmount } = render(<ArticleMetaLine publishedAt={bad} />);
      expect(container.querySelector("time"), bad).toBeNull();
      unmount();
    }
  });

  it("accepts an RFC3339 timestamp with a Z or numeric offset, preserving the source string", () => {
    const zulu = render(<ArticleMetaLine publishedAt="2025-03-14T12:00:00Z" />);
    const zTime = zulu.container.querySelector("time");
    expect(zTime).toHaveAttribute("datetime", "2025-03-14T12:00:00Z");
    expect(zTime?.textContent).toBe("14 March 2025");
    zulu.unmount();
    // Offset form — the label shows the written calendar date, never a shifted day.
    const offset = render(<ArticleMetaLine publishedAt="2025-03-14T23:30:00+05:30" />);
    const oTime = offset.container.querySelector("time");
    expect(oTime).toHaveAttribute("datetime", "2025-03-14T23:30:00+05:30");
    expect(oTime?.textContent).toBe("14 March 2025");
  });

  it("rejects a timestamp with no timezone (never guesses one)", () => {
    for (const bad of ["2025-03-14T12:00:00", "2025-03-14T12:00", "2025-03-14 12:00:00"]) {
      const { container, unmount } = render(<ArticleMetaLine publishedAt={bad} />);
      expect(container.querySelector("time"), bad).toBeNull();
      unmount();
    }
  });

  it("rejects a timestamp with out-of-range time or offset fields", () => {
    for (const bad of ["2025-03-14T24:00:00Z", "2025-03-14T12:60:00Z", "2025-03-14T12:00:00+25:00"]) {
      const { container, unmount } = render(<ArticleMetaLine publishedAt={bad} />);
      expect(container.querySelector("time"), bad).toBeNull();
      unmount();
    }
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
