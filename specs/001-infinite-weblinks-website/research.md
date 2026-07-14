# Phase 0 Research — Compatibility & Technology Decisions

**Feature**: Infinite Weblinks Website · **Date**: 2026-07-14 · **Status**: planning only.

Brief §17 mandates: *"The planning phase must validate current compatibility and choose pinned
versions. Do not assume stale package versions from previous prototypes."* Versions below were read
from the **npm registry on 2026-07-14** and must be **re-verified at implementation start** (pin exact
patches in the lockfile).

## Decision summary (chosen stack)

| Concern | Decision | Pinned (observed 2026-07-14) | Peer/compat notes |
|---|---|---|---|
| Framework | Next.js App Router | `next@16.2.10` | React Server Components default; PPR available |
| UI runtime | React | `react`/`react-dom@19.2.7` | required by Next 16 + next-sanity 13 |
| Language | TypeScript (strict) | `typescript@7.0.2` | ⚠ TS7 is the native compiler generation — validate ecosystem compat; fallback `5.9.x` LTS |
| Deploy adapter | OpenNext for Cloudflare | `@opennextjs/cloudflare@1.20.1` | peer `next >=15.5.18 <16 \|\| >=16.2.6` → **16.2.10 ✓**; needs KV + R2 |
| Runtime CLI | Wrangler | `wrangler@4.110.0` | adapter peer `^4.86.0` ✓ |
| CMS | Sanity + toolkit | `sanity@6.4.0`, `next-sanity@13.1.1` | next-sanity peer `next ^16`, `react ^19.2.3` → ✓ |
| Sanity helpers | client/image/live | `@sanity/client`, `@sanity/image-url`, `next-sanity/live` | bundled/companion to next-sanity 13 |
| Forms transport | Formspree | service (no core SDK required) | REST endpoint per form |
| Spam / bot | Cloudflare Turnstile | `@marsidev/react-turnstile@1.5.3` | + server-side siteverify |
| Scroll/hero motion | GSAP + ScrollTrigger | `gsap@3.15.0` | free since Webflow acquisition; **dynamic-import only** |
| React micro-motion | Motion | `motion@12.42.2` | nav/buttons/layout/micro-interactions |
| Icons | Lucide | `lucide-react@~1.x` (verify) | one family only; tree-shake per-icon |
| Validation | Zod | `zod@^4` (verify) | shared client+server form/rule schemas |
| Unit/component tests | Vitest + Testing Library | latest (verify) | rules engine + utilities |
| E2E | Playwright | `@playwright/test@1.61.1` | critical journeys, a11y, visual regression |
| Lint/format | ESLint + Prettier | latest (verify) | + `eslint-plugin-jsx-a11y` |
| Perf/a11y gates | Lighthouse CI + axe-core | latest (verify) | CI budgets |
| Analytics | Cloudflare Web Analytics (cookieless) | service | + Google Search Console |

## R1 — Next.js version & rendering model
**Decision**: Next.js **16.2.10**, App Router, Server Components by default; Client Components only for
interaction (hero motion, builder, filters, menus, forms). Use static generation + on-demand ISR for
CMS content; stream where useful.
**Rationale**: Matches brief §17 architecture principles; 16.2.10 satisfies the OpenNext-Cloudflare peer
floor (`>=16.2.6`), unlocking the current adapter.
**Compatibility check**: `@opennextjs/cloudflare@1.20.1` peer `next >=16.2.6` → 16.2.10 ✓;
`next-sanity@13.1.1` peer `next ^16` → ✓.
**Caveat**: Node.js middleware introduced in the 15.2 line is **not** supported by the Cloudflare
adapter — avoid Node-runtime middleware; do host canonicalisation / redirects at the Cloudflare edge and
security headers via config/Worker (see `design/security-privacy.md`, `design/deployment.md`).

## R2 — Cloudflare Workers via OpenNext
**Decision**: Build with `@opennextjs/cloudflare@1.20.1` (`opennextjs-cloudflare build` →
`wrangler deploy`), deploy to **Cloudflare Workers** with a **KV** namespace for the incremental cache
and an **R2** bucket for large/cache assets, plus Workers static assets.
**Rationale**: The brief targets "Cloudflare Workers via the current supported Next.js/OpenNext path".
OpenNext-Cloudflare reached 1.x GA and supports App Router, Server Actions and PPR.
**Alternatives rejected**: (a) `@cloudflare/next-on-pages` — Pages-oriented, less aligned with the
Workers target and the current recommended path; (b) `cloudflare/vinext` (Vite reimplementation of the
Next API) — promising but too new/experimental for a production build this cycle; revisit later;
(c) Vercel — not free-first per the brief's Cloudflare requirement.
**Open item**: Confirm exact wrangler binding names and KV/R2 setup against adapter 1.20.1 docs at
implementation (deployment doc used the adapter's documented binding names).

## R3 — CMS: Sanity (kept)
**Decision**: **Sanity** (`sanity@6.4.0`) with `next-sanity@13.1.1`, embedded Studio at `/studio`,
**Presentation tool** for live visual editing, and Draft Mode for protected preview.
**Evaluation vs "materially better free-first option"** (brief §14 allows switching only if clearly
better): considered Payload CMS (self-hostable, needs a DB/hosting — more ops for a two-person team on
Workers), TinaCMS (git-based; weaker for large relational taxonomies), Contentful/Storyblok (SaaS free
tiers with editor limits). **Sanity wins** on: generous free tier for two editors, strong Portable
Text + references (ideal for the goal↔service↔tool↔roadmap graph), Presentation live editing with
App Router, embeddable Studio (no separate hosting), and first-party Next tooling. No materially better
free-first option found → **keep Sanity**.
**Compatibility**: next-sanity 13 peers on next ^16 / react ^19.2.3 → ✓.
**Constraints honoured**: controlled modular page builder (approved section types only, no arbitrary
CSS), least-privilege roles, content-status workflow, draft protection.

## R4 — Forms & email delivery: Formspree + Turnstile
**Decision**: Post forms to **Formspree** endpoints (one per form), gate with **Cloudflare Turnstile**
(client widget `@marsidev/react-turnstile@1.5.3` + server `siteverify`), server-validate with Zod, add
a honeypot and edge rate-limiting; deliver **only** to `support@infiniteweblinks.com`; **no visitor
auto-reply at launch**. Full contract in `contracts/forms-and-email.md`.
**Rationale**: Brief §4 mandates Formspree + Turnstile, team-only delivery, email fallback (not primary).
**Alternative considered**: a Cloudflare Worker → email (MailChannels/Resend) route — more control but
more to build/maintain; Formspree satisfies the brief with less code. Keep Formspree; the Worker route
is a documented future option.

## R5 — Animation: GSAP + Motion + CSS
**Decision**: **GSAP 3.15 + ScrollTrigger** (dynamic-imported, client-only) for the hero and scroll
storytelling timelines; **Motion 12.42** for navigation, buttons, layout transitions and
micro-interactions; **CSS** for small ambient effects. Avoid **Three.js** unless a validated prototype
proves it necessary. Full plan in `design/animation.md`.
**Rationale**: Matches brief §8 recommended implementation; keeps JS off the critical path (constitution
III); motion is enhancement over server-rendered content.
**Licensing note (GSAP)**: GSAP became free for commercial use (incl. former premium plugins) after the
Webflow acquisition (April 2025). The licence prohibits using GSAP to build a product that **competes
with Webflow** — **not applicable** to Infinite Weblinks (a marketing site). Recorded in `analysis.md`
risk register (R-LGL-1) as a watch item, not a blocker.

## R6 — TypeScript 7 vs 5.9 LTS
**Observation**: npm `typescript@latest` = **7.0.2** (the native/"Go" compiler generation).
**Decision**: Target TS **strict mode**; at implementation, **spin up a throwaway compile** of the
chosen toolchain (Next 16 types, ESLint typescript plugin, Vitest, Sanity typegen) against **TS 7.0.x**;
if any critical tool lacks TS7 support, **pin `typescript@5.9.x` (LTS)** instead. Either satisfies the
brief. Tracked as R-TS-1 in the risk register.
**Rationale**: TS7 is new; ecosystem type-tooling may lag. This is a low-cost validation with a safe
fallback.

## R7 — Fonts
**Decision**: **Sora** (display), **Plus Jakarta Sans** (body/UI), **JetBrains Mono** (small labels).
Prefer **self-hosting** subset woff2 via `next/font/local` (or `next/font/google`) with `display: swap`,
limited weights, and preload of the hero display weight — over the handoff's runtime Google Fonts
`@import` (render-blocking, third-party). See `design/performance.md`.
**Rationale**: Performance + privacy (no third-party font request) + CSP simplicity.
**Note**: Handoff fonts are Google-Fonts substitutions; real brand webfonts pending — swap in later
without layout change.

## R8 — Images
**Decision**: Rebuild the hero as **editable SVG** (paths/nodes/live text/animation layers), never
raster with baked text. For raster content images, use a Cloudflare-appropriate image path: either the
Sanity image pipeline (`@sanity/image-url` with responsive `srcset`) or `next/image` with an OpenNext/
Cloudflare-compatible loader. **Validate `next/image` behaviour under `@opennextjs/cloudflare@1.20.1`**
at implementation and pick one loader strategy. Tracked as R-IMG-1. See `design/performance.md` /
`design/deployment.md`.

## R9 — Analytics & Search
**Decision**: **Cloudflare Web Analytics** (cookieless, no consent banner required) for field RUM +
Core Web Vitals; **Google Search Console** for indexation/coverage. No marketing pixels at launch;
consent architecture is prepared but dormant (see `design/security-privacy.md`).

## Proposed package/tool list (initial `package.json` intent — planning only, not installed)

**dependencies**: `next@16.2.10`, `react@19.2.7`, `react-dom@19.2.7`, `sanity@6.4.0`,
`next-sanity@13.1.1`, `@sanity/client`, `@sanity/image-url`, `@sanity/vision` (Studio),
`styled-is`/none (tokens are plain CSS), `gsap@3.15.0`, `motion@12.42.2`, `lucide-react@~1.x`,
`@marsidev/react-turnstile@1.5.3`, `zod@^4`.
**devDependencies**: `@opennextjs/cloudflare@1.20.1`, `wrangler@4.110.0`, `typescript@7.0.2`
*(or 5.9.x per R6)*, `@playwright/test@1.61.1`, `vitest`, `@testing-library/react`,
`@testing-library/jest-dom`, `eslint`, `eslint-config-next`, `eslint-plugin-jsx-a11y`, `prettier`,
`@lhci/cli` (Lighthouse CI), `axe-core`/`@axe-core/playwright`, `@types/*` as needed.
**services**: Cloudflare (Workers, KV, R2, Web Analytics, Turnstile, DNS), Sanity project (production
dataset), Formspree (two form endpoints), Google Search Console.

All versions are re-verified and pinned at implementation start; no version is assumed from prior
prototypes (brief §17).
