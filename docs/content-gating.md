# Content Gating Model

> The single reference for how content becomes publicly visible (brief §P4-05, review §16).
> A new contributor should be able to answer "why isn't this showing?" and "how do I publish
> a case study?" from this page alone.

## The status workflow

Every publishable content item `extends Statused` (`src/lib/content/types.ts`) and carries a
`status`:

| Status | Renders publicly? | Meaning |
|---|---|---|
| `draft` | No | Work in progress. |
| `placeholder` | No | Structural stand-in — **explicitly not real** (e.g. seed proof). |
| `approvalRequired` | No | Complete but awaiting sign-off. |
| `verified` | **Yes** | Reviewed and true. |
| `readyToPublish` | **Yes** | Approved for release. |

```ts
export const RENDERABLE_STATUSES: ContentStatus[] = ["verified", "readyToPublish"];
export function isRenderable(item: Statused): boolean { … }
```

`RENDERABLE_STATUSES` is the **single source of truth**. Only `verified` / `readyToPublish`
ever reach the public site, in both the seed path and the (optional) Sanity path.

## Where the gate is applied (defence in depth)

1. **Getters** — `src/lib/content/index.ts` filters every list through `renderable()`
   (`items.filter(isRenderable)`). Single-item getters resolve against the already-gated list,
   so a placeholder slug is never found → its detail route 404s.
2. **Sanity seam** — `fromSanityOrSeed` (`src/lib/sanity/fetch.ts`) re-applies `isRenderable`
   after mapping, and the GROQ queries themselves filter at source
   (`contentStatus.status in ["verified","readyToPublish"]`). An authoritative empty result
   stays empty (it never silently re-leaks seed).
3. **Section render** — each proof section returns `null` when its list is empty, so an
   unavailable section disappears rather than showing an empty shell.
4. **Route gating** — `/case-studies`, `/case-studies/[slug]`, `/examples`, `/examples/[slug]`
   call `notFound()` when their gated list is empty / the slug isn't in it.
5. **Sitemap** — `src/app/sitemap.ts` adds proof index + detail URLs **only** when the gated
   list is non-empty, so nothing hidden is ever advertised.
6. **Structured data** — JSON-LD reads the same getters, so schema is emitted only for
   renderable items (no fabricated `Review`/`AggregateRating`).

The `sitemap / proof-gating / robots consistency` unit test
(`tests/unit/sitemap-consistency.test.ts`) plus `content-integrity.test.ts` lock these views
together, so gated-out proof can never leak into the sitemap or schema, and a future real
record can never ship with a broken index.

## How to publish a real case study / testimonial

1. Add a real record to `src/lib/content/data/proof.ts` (or the Sanity dataset) with
   **real, verifiable** content and `status: "verified"`. The `CaseStudy` type supports an
   optional `body` and `metrics` — **metrics must be real and verifiable; never illustrative
   or fabricated** (enforced by the Studio schema description + the no-fake-proof tests).
2. That's it — the homepage proof section, the `/case-studies` index + detail route, the
   sitemap, and the JSON-LD all react automatically off list length. No other wiring.
3. Confirm `npm run test` (gating tests) and `npm run test:e2e` (route gating) stay green.

## `noindex` (per-item)

`Statused.noindex` exists on the type but is **not yet honoured** in `sitemap.ts` or in dynamic
pages' `generateMetadata`. If you need per-item noindex, wire `item.noindex` into both places
before relying on it. (Utility routes like `/growth-plan` use a separate manual `noindex` flag
in `pageMetadata`, which does work.)

## Truth boundary (non-negotiable)

Never fabricate clients, logos, testimonials, case studies, metrics, prices, locations,
partnerships or awards. Until real proof exists, the honest interim trust layer
(`TrustMethodologySection`, `data/trust.ts`) carries trust via method + standards + ownership —
not fake social proof.
