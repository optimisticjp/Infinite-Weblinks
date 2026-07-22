// @vitest-environment jsdom
import { describe, it, expect, vi } from "vitest";
import { render } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";

/**
 * Phase 2K — HomepageLearningSection must render NOTHING when there are no articles (rather than an
 * empty "coming soon" shell). Isolated so the content getter can be mocked to return an empty list.
 */
vi.mock("@/lib/content", () => ({
  getLearnArticles: () => Promise.resolve([]),
  getGoals: () => Promise.resolve([]),
}));

import { HomepageLearningSection } from "@/components/sections/home/HomepageLearningSection";

describe("HomepageLearningSection with no articles", () => {
  it("renders nothing (no empty section, no CTA shell)", async () => {
    const { container } = render(await HomepageLearningSection({}));
    expect(container.querySelector("section")).toBeNull();
    expect(container.querySelector('a[href="/learn"]')).toBeNull();
    expect(container.textContent).toBe("");
  });
});
