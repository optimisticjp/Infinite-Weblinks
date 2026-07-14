# Phase 0 Research — Compatibility & Technology Decisions

**Feature**: Infinite Weblinks Website · **Date**: 2026-07-14 · **Status**: planning only.

Brief §17 mandates: *"The planning phase must validate current compatibility and choose pinned
versions. Do not assume stale package versions from previous prototypes."* Versions below were read
from the **npm registry on 2026-07-14** and must be **re-verified at implementation start** (pin exact
patches in the lockfile).

> **Owner-locked revisions (post-review, 2026-07-14):** (1) TypeScript → latest stable **6.0.x**
> (native TS7 becomes a future experiment only); (2) OpenNext cache → **R2 incremental cache + D1 tag
> cache + Workers Assets**, **no KV**, **on-demand revalidation** (no time-based ISR, no Durable-Object
> queue initially); (3) Sanity Studio is **deployed separately** (Sanity-hosted `*.sanity.studio`),
> **not embedded** at `/studio`. These are reflected below.

## Decision summary (chosen stack)

| Concern | Decision | Pinned (observed 2026-07-14) | Peer/compat notes |
|---|---|---|---|
| Framework | Next.js App Router | `next@16.2.10` | React Server Components default; PPR available |
| UI runtime | React | `react`/`react-dom@19.2.7` | required by Next 16 + next-sanity 13 |
| Language | TypeScript (strict) | **`typescript@6.0.x`** (latest stable 6.0 line) | Owner-locked: stable **6.0.x**, not native 7. ⚠ npm currently shows no stable 6.0.x GA (`6.0.0-beta` only; `latest`=7.0.2) — pin the 6.0.x GA once published, else **5.9.x LTS** interim. See R6. |
| Deploy adapter | OpenNext for Cloudflare | `@opennextjs/cloudflare@1.20.1` | peer `next >=15.5.18 <16 \|\| >=16.2.6` → **16.2.10 ✓**; cache = **R2 (incremental) + D1 (tags) + Workers Assets**, no KV |
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

## R2 — Cloudflare Workers via OpenNext (owner-locked small-site cache)
**Decision**: Build with `@opennextjs/cloudflare@1.20.1` (`opennextjs-cloudflare build` →
`wrangler deploy`), deploy to **Cloudflare Workers** using the **current small-site OpenNext caching
approach**: **Workers Static Assets** for static files, an **R2 bucket as the incremental cache**
(binding `NEXT_INC_CACHE_R2_BUCKET`), and a **D1 database as the tag cache** (binding
`NEXT_TAG_CACHE_D1`) for **on-demand** revalidation. **Workers KV is deliberately NOT configured** as
the primary incremental cache, and the **Durable Object revalidation queue is avoided initially** by
using **on-demand revalidation** (Sanity publish webhook → targeted tag/path revalidation) rather than
time-based ISR. Manual redeploy / manual revalidation is the documented fallback.
**Rationale**: The brief targets "Cloudflare Workers via the current supported Next.js/OpenNext path";
this is the OpenNext-recommended configuration for a small, editor-driven marketing site (cheaper,
simpler, precise invalidation) and is owner-locked.
**Alternatives rejected**: (a) KV-primary incremental cache — owner ruled out in favour of R2+D1;
(b) `@cloudflare/next-on-pages` — Pages-oriented, less aligned with the Workers target; (c)
`cloudflare/vinext` — too new for production this cycle; (d) Vercel — not free-first.
**Open item (owner-required)**: **Re-validate this exact caching configuration (R2 incremental cache,
D1 tag cache, override names, `wrangler.jsonc` bindings) against the current OpenNext documentation at
implementation start.** Tracked as R-CACHE-1. See `design/deployment.md` §1/§5.

## R3 — CMS: Sanity (kept) — **separately-hosted Studio** (owner-locked)
**Decision**: **Sanity** (`sanity@6.4.0`) with `next-sanity@13.1.1`. A **new free Sanity project** is
created for the two editors. The **Studio is deployed separately via Sanity hosting** (`sanity deploy`
→ `*.sanity.studio`), **NOT embedded** at a `/studio` route in the Next.js app; its source lives in the
same repo under `studio/`. **Presentation tool** provides live visual editing (its preview iframe
points at the deployed site preview URL); **Draft Mode** (secret-gated Route Handlers in the Next.js
app) provides protected preview. A custom admin domain is an optional later step.
**Evaluation vs "materially better free-first option"** (brief §14 allows switching only if clearly
better): considered Payload CMS (self-hostable, needs a DB/hosting — more ops for a two-person team on
Workers), TinaCMS (git-based; weaker for large relational taxonomies), Contentful/Storyblok (SaaS free
tiers with editor limits). **Sanity wins** on: generous free tier for two editors, strong Portable
Text + references (ideal for the goal↔service↔tool↔roadmap graph), Presentation live editing with
App Router, and first-party Next tooling. No materially better free-first option found → **keep Sanity**.
**Impact of the separate-Studio decision**: smaller app bundle + cleaner CSP (site no longer serves the
Studio shell); the site's CSP must allow the hosted Studio to **frame** its preview routes
(`frame-ancestors https://*.sanity.studio`), and the Sanity project CORS allowlist must include the
`*.sanity.studio` origin + preview URLs. See `design/security-privacy.md`, `design/deployment.md`.
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

## R6 — TypeScript: latest stable 6.0.x (owner-locked; native TS7 = future experiment only)
**Owner decision**: Use the **latest stable TypeScript 6.0.x** release in **strict mode**. The native
**TypeScript 7** preview is kept as a **future, non-blocking experiment only** — not the build compiler.
**npm reality (2026-07-14)**: the registry `latest` tag is `7.0.2` and the only 6.0 build published is
`6.0.0-beta` (there is no stable `6.0.x` GA tagged yet). Therefore:
- **If a stable 6.0.x GA is available at implementation start** → pin it (`typescript@6.0.x`).
- **If not yet GA** → pin **`typescript@5.9.x` (LTS)** as the stable interim (the last proven pre-native
  line), and adopt 6.0.x when it ships. Either honours the owner's intent (a stable, non-native compiler)
  and the brief's strict-mode requirement.
**Validation at setup (owner-required)**: compile the chosen toolchain — Next 16 types, `next-sanity`/
Sanity typegen, OpenNext build, ESLint TS plugin, Vitest, generated types — against the pinned version
and confirm clean typecheck before proceeding. Tracked as R-TS-1.
**Rationale**: TS7 is a brand-new native generation; the ecosystem's type-tooling may lag. A stable
6.0.x/5.9.x compiler removes that risk from the critical path while keeping TS7 as an opt-in experiment.

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

**app dependencies**: `next@16.2.10`, `react@19.2.7`, `react-dom@19.2.7`, `next-sanity@13.1.1`,
`@sanity/client`, `@sanity/image-url`, `gsap@3.15.0`, `motion@12.42.2`, `lucide-react@~1.x`,
`@marsidev/react-turnstile@1.5.3`, `zod@^4`. (Design tokens are plain CSS — no CSS-in-JS runtime.)
**`studio/` workspace (separate deploy)**: `sanity@6.4.0`, `@sanity/vision`, `@sanity/image-url`.
**devDependencies**: `@opennextjs/cloudflare@1.20.1`, `wrangler@4.110.0`, **`typescript@6.0.x`
*(latest stable 6.0 line; `5.9.x` LTS interim if no 6.0 GA yet — R6)*`**, `@playwright/test@1.61.1`,
`vitest`, `@testing-library/react`, `@testing-library/jest-dom`, `eslint`, `eslint-config-next`,
`eslint-plugin-jsx-a11y`, `prettier`, `@lhci/cli` (Lighthouse CI), `axe-core`/`@axe-core/playwright`,
`@types/*` as needed. Studio (`studio/` workspace, separate deploy): `sanity`, `@sanity/vision`.
**services**: Cloudflare (Workers, **R2** [incremental cache], **D1** [tag cache], Workers Assets, Web
Analytics, Turnstile, DNS — **no KV**), a **new** Sanity project (production dataset) with a
**separately-hosted Studio** (`*.sanity.studio`), Formspree (two form endpoints), Google Search Console.

All versions are re-verified and pinned at implementation start; no version is assumed from prior
prototypes (brief §17).
