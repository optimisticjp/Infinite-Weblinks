# Sanity Activation Trigger

> When to turn on live Sanity CMS reads (brief §P4-06, review §9/§16/§19, decision D-06).
> **Status today: intentionally OFF.** Do not enable Sanity merely to satisfy the review.

## Current state

- The public site renders **reviewed local seed content** from `src/lib/content/data/*` and
  issues **no Sanity queries**.
- Live reads are gated behind `NEXT_PUBLIC_SANITY_LIVE_CONTENT_ENABLED` (default `false`).
- The Studio (`studio/`), schemas, GROQ queries, the `fromSanityOrSeed` seam, and ISR wiring
  are all in place and unit-tested, so activation is a **flag + credentials** change, not a
  build.

This static-first, seed-by-default posture is a deliberate strength: fast, cheap, no moving
CMS to operate before there's an editorial need.

## Activate only when one of these is true

1. **Non-technical editors need to make frequent changes** without a developer/deploy in the
   loop (the strongest trigger).
2. **Content volume makes the typed seed files hard to maintain** — e.g. `services.ts`
   (~1,400 lines) becomes painful to edit by hand and a non-developer needs to own it.
3. **The large services dataset becomes operationally painful** to keep accurate in code.

A one-off content tweak by a developer is **not** a trigger — just edit the seed file.

## How to activate (when justified)

1. Provision the Sanity project + dataset; set `NEXT_PUBLIC_SANITY_PROJECT_ID` /
   `NEXT_PUBLIC_SANITY_DATASET` / `NEXT_PUBLIC_SANITY_API_VERSION`.
2. Add the server-only tokens as needed (`SANITY_API_READ_TOKEN`,
   `SANITY_REVALIDATE_SECRET`, `SANITY_PREVIEW_SECRET`) — **never** in `.env.example`, never in
   the client bundle.
3. Seed the dataset from the reviewed content (`npm run seed:export` produces the NDJSON).
4. Set `NEXT_PUBLIC_SANITY_LIVE_CONTENT_ENABLED=true`. The reading routes become ISR (the
   revalidate cadence lives with the fetch, not a segment export).
5. Verify the **gate still holds**: only `verified` / `readyToPublish` documents render (the
   GROQ queries and `isRenderable` both enforce this). Run `npm run test` (Sanity adapter +
   roundtrip tests) and `npm run test:e2e`.

## Rollback

Set `NEXT_PUBLIC_SANITY_LIVE_CONTENT_ENABLED=false`. The site immediately falls back to seed
content with zero Sanity queries — no data migration, no code change.
