import { describe, it, expect, vi, beforeEach } from "vitest";

/**
 * The adapter reads `sanityClient`/`isSanityConfigured` from the client module, so we mock
 * it to simulate a configured project with a controllable `fetch`. Proves the seam prefers
 * live status-gated data, never throws, and falls back to the seed array on empty/error.
 */
const { fetchMock } = vi.hoisted(() => ({ fetchMock: vi.fn() }));
vi.mock("@/lib/sanity/client", () => ({
  isSanityConfigured: true,
  sanityClient: { fetch: fetchMock },
  PUBLIC_STATUS_FILTER: 'contentStatus.status in ["verified","readyToPublish"]',
}));

import { fromSanityOrSeed, sanityFetch } from "@/lib/sanity/fetch";
import type { Faq } from "@/lib/content/types";

const seed: Faq[] = [{ status: "verified", slug: "seed-faq", question: "Q?", answer: "A." }];
const identity = (docs: Faq[]) => docs;

beforeEach(() => {
  fetchMock.mockReset();
  // The adapter logs a warning (with the caught Error) on the fallback path; silence it so
  // the expected, handled error isn't surfaced as noise/failure by the runner.
  vi.spyOn(console, "warn").mockImplementation(() => {});
});

describe("fromSanityOrSeed", () => {
  it("returns mapped live data when Sanity has rows", async () => {
    const rows: Faq[] = [{ status: "verified", slug: "live", question: "L?", answer: "L." }];
    fetchMock.mockResolvedValue(rows);
    expect(await fromSanityOrSeed<Faq, Faq>({ query: "q", map: identity, seed })).toEqual(rows);
  });

  it("falls back to seed when Sanity returns an empty set", async () => {
    fetchMock.mockResolvedValue([]);
    expect(await fromSanityOrSeed<Faq, Faq>({ query: "q", map: identity, seed })).toEqual(seed);
  });

  it("falls back to seed when the query throws", async () => {
    fetchMock.mockImplementation(async () => {
      throw new Error("network");
    });
    expect(await fromSanityOrSeed<Faq, Faq>({ query: "q", map: identity, seed })).toEqual(seed);
  });

  it("does not query (uses seed) when the query is null", async () => {
    expect(await fromSanityOrSeed<Faq, Faq>({ query: null, map: identity, seed })).toEqual(seed);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("defensively drops any non-renderable rows a mapper produced", async () => {
    fetchMock.mockResolvedValue([{ status: "draft", slug: "x", question: "?", answer: "." }]);
    expect(await fromSanityOrSeed<Faq, Faq>({ query: "q", map: identity, seed })).toEqual([]);
  });
});

describe("sanityFetch", () => {
  it("returns null (never throws) when the query errors", async () => {
    fetchMock.mockImplementation(async () => {
      throw new Error("boom");
    });
    expect(await sanityFetch("q")).toBeNull();
  });
});
