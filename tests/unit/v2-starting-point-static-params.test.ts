import { describe, it, expect } from "vitest";
import { generateStaticParams } from "@/app/(marketing)/starting-points/[slug]/page";

/**
 * Phase 2S (§A2) — a DIRECT contract on the route's generateStaticParams(). It invokes the real
 * exported function (exercising getStartingPoints() in the current reviewed seed mode), rather than
 * inspecting the route source, and asserts the exact ordered slug set the build will prerender. The
 * seed/Sanity getter is unchanged; this locks the eight static params in their source order.
 */
describe("starting-points/[slug] · generateStaticParams()", () => {
  it("returns exactly the eight public starting-point slugs, in source order", async () => {
    const params = await generateStaticParams();
    expect(params).toEqual([
      { slug: "nothing-built-yet" },
      { slug: "idea-no-website" },
      { slug: "website-no-traffic" },
      { slug: "traffic-few-sales" },
      { slug: "sales-but-chaotic" },
      { slug: "running-ads-unprofitable" },
      { slug: "established-want-to-scale" },
      { slug: "want-to-automate" },
    ]);
  });
});
