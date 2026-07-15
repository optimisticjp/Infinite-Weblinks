import { describe, it, expect, vi, beforeEach } from "vitest";

/**
 * The adapter reads `sanityClient`/`isSanityConfigured` from the client module, so we mock it
 * to simulate a configured project with a controllable `fetch`. `cfg.configured` is exposed via a
 * getter so a single test can exercise the unconfigured path. These tests pin the seam's contract
 * now the dataset is populated: a SUCCESSFUL live result is authoritative (an empty live result
 * stays empty — seed must not re-leak), and only a genuine failure falls back to seed.
 */
const { fetchMock, cfg } = vi.hoisted(() => ({ fetchMock: vi.fn(), cfg: { configured: true } }));
vi.mock("@/lib/sanity/client", () => ({
  get isSanityConfigured() {
    return cfg.configured;
  },
  sanityClient: { fetch: fetchMock },
  SANITY_REVALIDATE_SECONDS: 30,
  PUBLIC_STATUS_FILTER: 'contentStatus.status in ["verified","readyToPublish"]',
}));

import { fromSanityOrSeed, sanityFetch } from "@/lib/sanity/fetch";
import type { Faq } from "@/lib/content/types";

const seed: Faq[] = [{ status: "verified", slug: "seed-faq", question: "Q?", answer: "A." }];
const identity = (docs: Faq[]) => docs;

beforeEach(() => {
  fetchMock.mockReset();
  cfg.configured = true;
  // The adapter logs a warning (with the caught Error) on the fallback path; silence it so
  // the expected, handled error isn't surfaced as noise/failure by the runner.
  vi.spyOn(console, "warn").mockImplementation(() => {});
});

describe("fromSanityOrSeed", () => {
  it("live rows override seed", async () => {
    const rows: Faq[] = [{ status: "verified", slug: "live", question: "L?", answer: "L." }];
    fetchMock.mockResolvedValue(rows);
    expect(await fromSanityOrSeed<Faq, Faq>({ query: "q", map: identity, seed })).toEqual(rows);
  });

  it("a successful EMPTY result stays empty (does not re-leak seed)", async () => {
    fetchMock.mockResolvedValue([]);
    expect(await fromSanityOrSeed<Faq, Faq>({ query: "q", map: identity, seed })).toEqual([]);
  });

  it("a successful result of only non-renderable rows stays empty", async () => {
    fetchMock.mockResolvedValue([{ status: "draft", slug: "x", question: "?", answer: "." }]);
    expect(await fromSanityOrSeed<Faq, Faq>({ query: "q", map: identity, seed })).toEqual([]);
  });

  it("keeps only renderable rows from a mixed live result", async () => {
    fetchMock.mockResolvedValue([
      { status: "verified", slug: "ok", question: "?", answer: "." },
      { status: "placeholder", slug: "hidden", question: "?", answer: "." },
    ]);
    const out = await fromSanityOrSeed<Faq, Faq>({ query: "q", map: identity, seed });
    expect(out).toEqual([{ status: "verified", slug: "ok", question: "?", answer: "." }]);
  });

  it("falls back to seed when the request FAILS (sanityFetch returns null)", async () => {
    fetchMock.mockImplementation(async () => {
      throw new Error("network");
    });
    expect(await fromSanityOrSeed<Faq, Faq>({ query: "q", map: identity, seed })).toEqual(seed);
  });

  it("falls back to seed when the query is null (unavailable) — no request made", async () => {
    expect(await fromSanityOrSeed<Faq, Faq>({ query: null, map: identity, seed })).toEqual(seed);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("falls back to seed when Sanity is unconfigured — no request made", async () => {
    cfg.configured = false;
    expect(await fromSanityOrSeed<Faq, Faq>({ query: "q", map: identity, seed })).toEqual(seed);
    expect(fetchMock).not.toHaveBeenCalled();
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
