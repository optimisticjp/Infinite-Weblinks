# Implementation Plan: Infinite Weblinks Website

**Branch**: `001-infinite-weblinks-website` (planning committed on `planning/initial-spec`) |
**Date**: 2026-07-14 | **Spec**: [`spec.md`](./spec.md)

**Input**: Feature specification from `specs/001-infinite-weblinks-website/spec.md`

**Status**: Planning only. Implementation has **not** started (no app scaffold, no packages installed,
no production components). This plan stops at Spec Kit `analyze`; `implement`/`converge` are deferred to
owner approval.

## Summary

Build a **vibrant, education-first marketing website** for Infinite Weblinks (a Digital Growth Partner
services company) that teaches visitors how online growth works as one connected system and converts
them **by email** through a guided **Growth Plan Builder** — not a call booking. Technical approach:
**Next.js 16 App Router (React 19, TypeScript strict), Server Components by default**, content and
business logic in **Sanity CMS** via a **controlled modular page builder**, forms via **Formspree +
Cloudflare Turnstile**, motion via **GSAP (hero/scroll) + Motion (UI)**, deployed to **Cloudflare
Workers via OpenNext** with preview-before-production. All content-status gating, accessibility (WCAG
2.2 AA), SEO/structured-data, performance budgets, and security are built in from the start. Design
follows the approved token system and Signature Crossover logo; the hero is rebuilt as **editable SVG**.

## Technical Context

**Language/Version**: TypeScript 7.0.2 (strict) — validate vs 5.9.x LTS fallback (R6). Node LTS for
tooling.
**Primary Dependencies**: Next.js 16.2.10, React 19.2.7, Sanity 6.4.0 + next-sanity 13.1.1,
@opennextjs/cloudflare 1.20.1, wrangler 4.110.0, gsap 3.15.0, motion 12.42.2, lucide-react ~1.x,
@marsidev/react-turnstile 1.5.3, zod. (Full list + rationale in [`research.md`](./research.md).)
**Storage / Content**: Sanity (production dataset) as the content source of truth; Cloudflare KV
(incremental cache) + R2 (assets). No application database; form data flows to email via Formspree.
**Testing**: Vitest (unit/component, esp. the rules engine), Playwright 1.61.1 (E2E, a11y, visual),
Lighthouse CI, axe-core. (See [`design/testing.md`](./design/testing.md).)
**Target Platform**: Cloudflare Workers (edge); canonical `https://infiniteweblinks.com`, www→root.
**Project Type**: Web application (single Next.js app + embedded Sanity Studio) — see Structure below.
**Performance Goals**: Core Web Vitals "good"; Lighthouse mobile ≥90 (target 95+); per-page-type
budgets in [`design/performance.md`](./design/performance.md).
**Constraints**: Email-led only (no calendar/phone); services-company positioning (no SaaS/login);
no unverified public content; Global English; WCAG 2.2 AA; mobile-first; no secrets in Git; two admins;
small-team maintainable.
**Scale/Scope**: ~28 primary route patterns; ~110+ services, ~80+ tools, 8 stages, 3 cross-cutting
systems, 4 delivery models, multiple goals/business-types/starting-points/roadmaps; 19-block homepage;
one guided multi-step builder; one CMS with ~25 document types.

## Constitution Check

*GATE: must pass before Phase 0. Re-checked after Phase 1 design. Constitution v1.0.0.*

| # | Principle | Status | How this plan satisfies it |
|---|---|---|---|
| I | Spec Before Code | ✅ | Full spec + this plan + design docs precede any implementation; implementation deferred to approval. |
| II | Mobile-First | ✅ | Mobile-first layouts validated at 360/390/768/1024/large; full-screen mobile nav; no desktop-only interactions; touch targets ≥24px (WCAG 2.5.8). |
| III | Speed | ✅ | RSC default, minimal client JS, dynamic-import GSAP, self-hosted subset fonts, no Three.js, ISR at edge; Lighthouse-CI budgets. See performance doc. |
| IV | Deliberate Design | ✅ | One approved system (dark cinematic + bright editorial + full-colour rhythm), Sora/Plus Jakarta/JetBrains Mono, constrained motion vocabulary, domain colour-coding — not style soup. |
| V | Selective Skills | ✅ | Only web-relevant skills used (Spec Kit, frontend/design, SEO, security, testing, humanizer); no scientific skills. |
| VI | Human-Sounding Content | ✅ | Growth Guide voice: plain Global English, honest expectation-setting, no hype/SaaS boilerplate; humanizer pass planned in content QA. |
| VII | SEO in the Build | ✅ | Metadata/canonical/sitemap/robots/breadcrumbs/structured-data/GEO-AEO from the start; see SEO doc. |
| VIII | Accessibility in the Build | ✅ **exceeds** | Target **WCAG 2.2 AA** (stricter than the 2.1 AA baseline); see accessibility doc (with 2 token contrast fixes flagged). |
| IX | Security in the Build | ✅ | No secrets in Git, validated/sanitised inputs, Turnstile, security headers, least-privilege CMS, draft protection, dependency review; see security doc. |
| X | Test Important Behaviour | ✅ | TDD for the rules engine + validation; Playwright critical journeys; not over-testing static pages. |
| XI | Spec Kit Workflow | ✅ | Following constitution→specify→clarify→plan→checklist→tasks→analyze; stopping before implement per request. |
| XII | Efficient Context | ✅ | Concise, decision-focused artifacts; design split into focused docs; no pasted file dumps. |
| XIII | Preview Without Deployment | ✅ | Cloudflare preview deployments before production; no local-machine requirement; review via preview URLs. |
| XIV | Definition of Done | ✅ | Consolidated DoD in `quickstart.md` + acceptance `checklist.md`; convergence review planned. |

**Result: PASS** (no violations). One deliberate enhancement (WCAG 2.2 > 2.1) recorded as improvement,
not a deviation. Complexity Tracking below is therefore empty.

## Technical Architecture

### Layers
1. **Presentation (RSC-first)** — App Router routes render Server Components that read published,
   status-gated content from Sanity and compose **approved modular section types**. Client Components
   are isolated islands: hero motion, Growth Plan Builder, service/tool filters, mega-menu/mobile-nav
   interactivity, forms.
2. **Content (Sanity)** — a controlled schema (see [`data-model.md`](./data-model.md)) modelling the
   taxonomy graph (Goal/Service/Tool/Roadmap/Stage/BusinessType/StartingPoint/DeliveryModel), the modular
   page builder, navigation/footer/CTA/SiteSettings, articles/FAQ/legal, and placeholder-gated proof
   (case studies/testimonials/stats). Presentation tool for live editing; Draft Mode for preview.
3. **Business logic (separated from presentation)** — the **Growth Plan Builder rules engine**: pure,
   testable functions mapping inputs → structured recommendation, driven by a reviewed
   `growthPlanRuleSet` stored in the CMS (see [`contracts/growth-plan-rules.md`](./contracts/growth-plan-rules.md)).
   Zod schemas shared client/server for validation.
4. **Integrations (edge)** — Formspree (form transport, team-only email), Turnstile (bot defence,
   server-verified), Cloudflare Web Analytics (cookieless RUM), Sanity webhook → `/api/revalidate`.
5. **Delivery (Cloudflare Workers via OpenNext)** — SSG/ISR pages cached in KV, assets in R2, on-demand
   revalidation on publish; edge host canonicalisation + security headers; preview per PR.

### Data flow
- **Read**: Route (RSC) → Sanity GROQ query (published + status-gated) → render section types → HTML at
  edge (KV-cached). Publish in Studio → webhook → targeted revalidation.
- **Convert**: Builder (client) → Zod validate → Turnstile token → rules engine (local, deterministic)
  → result render → submit to Formspree with Turnstile server-verify → team email → success state.
- **Preview**: Editor → Draft Mode (secret) → RSC reads drafts → Presentation live edit; never public.

### Cross-cutting
Accessibility, SEO/structured-data, performance budgets, security headers/CSP, and motion/reduced-motion
are applied per the design docs across all layers. Secrets live only in Cloudflare secret storage.

## Proposed Repository Structure

```text
Infinite-Weblinks/
├── app/
│   ├── (marketing)/                 # SSG/ISR public pages, shared header/footer
│   │   ├── page.tsx                 # homepage (19-block modular)
│   │   ├── how-it-works/
│   │   ├── about/
│   │   ├── solutions/[[...slug]]/
│   │   ├── business-types/[slug]/
│   │   ├── starting-points/[slug]/
│   │   ├── services/                # + [slug]/ (filter island on index)
│   │   ├── tools/                   # + [slug]/
│   │   ├── roadmaps/                # + [slug]/
│   │   ├── examples/ · case-studies/ · learn/   # + [slug]/
│   │   ├── resources/ · faq/
│   │   └── (legal)/privacy · cookies · terms · accessibility/
│   ├── (convert)/
│   │   ├── growth-plan/page.tsx     # Growth Plan Builder (client island)
│   │   └── contact/page.tsx
│   ├── studio/[[...tool]]/page.tsx   # embedded Sanity Studio (protected)
│   ├── api/{revalidate,draft,disable-draft}/route.ts
│   ├── sitemap.ts · robots.ts · opengraph-image.tsx
│   └── layout.tsx · not-found.tsx · error.tsx
├── src/
│   ├── components/{primitives,chrome,sections,hero,forms,builder}/
│   ├── lib/
│   │   ├── growth-plan/             # rules engine (pure, unit-tested) + types
│   │   ├── sanity/                  # client, queries (GROQ), image, live/preview
│   │   ├── validation/              # zod schemas (forms, builder)
│   │   ├── seo/                     # metadata + JSON-LD builders
│   │   └── motion/                  # GSAP registration, reduced-motion guard
│   └── styles/tokens/               # colours, type, spacing, effects (from handoff, contrast-fixed)
├── sanity/
│   ├── schemaTypes/                 # documents + objects (section types, taxonomy)
│   ├── structure/                   # desk structure, roles guidance
│   └── sanity.config.ts · sanity.cli.ts
├── public/                          # editable SVG logo/hero assets, favicons
├── tests/{unit,e2e,visual}/         # Vitest + Playwright
├── .github/workflows/               # CI: lint, typecheck, test, a11y, LHCI, deploy
├── open-next.config.ts · wrangler.jsonc · next.config.ts
├── .env.example                     # names + placeholders only (no secrets)
└── eslint/prettier/tsconfig/vitest/playwright configs
```

**Structure Decision**: A **single Next.js App Router application** with an **embedded Sanity Studio**
(no separate frontend/backend split — content lives in Sanity, form handling is edge/serverless). Route
groups `(marketing)` / `(convert)` / `studio` separate concerns and layouts. Business logic (rules
engine, validation, SEO/JSON-LD) lives under `src/lib/` cleanly separated from presentation, satisfying
brief §17 and constitution IV/X.

## Milestone Plan (brief §25)

Delivery is milestone-based; the **CMS architecture is complete from Milestone 3** even though pages
ship incrementally. P-priorities from the spec map to milestones.

| # | Milestone | Delivers | Primary story |
|---|---|---|---|
| M1 | Planning & architecture | This spec/plan/design set (this deliverable) | — |
| M2 | Repository foundation & design tokens | Next.js+TS+Cloudflare/OpenNext scaffold, token layer (contrast-fixed), primitives, lint/format/CI | Foundation |
| M3 | CMS schemas & preview | Sanity schema (all doc/section types), Studio at `/studio`, roles, Draft Mode/Presentation, revalidation webhook | US3 (P2) |
| M4 | Header, navigation & homepage opening | Chrome (sticky glass header, CMS mega-menus, mobile nav), hero connected universe (editable SVG, reduced-motion), first homepage sections | US1 (P1) |
| M5 | Remaining homepage sections | All 19 blocks as modular section types (placeholder blocks hidden) | US1 (P1) |
| M6 | Growth Plan Builder & forms | Rules engine (unit-tested), multi-step builder, structured result, Formspree+Turnstile, contact form | US1 (P1) |
| M7 | Core templates | Solutions/business-types/starting-points, services+filter, tools+filter, roadmaps, service/tool/roadmap detail | US2 (P2) |
| M8 | Resources, articles & proof | Learn/articles, resources, FAQ, examples/case-studies templates (Verified-gated) | US4 (P3) |
| M9 | SEO, a11y, performance & security hardening | Metadata/JSON-LD/sitemap/robots, axe/keyboard pass, LHCI budgets, headers/CSP/consent scaffold | cross-cutting |
| M10 | Content QA, preview deploy & launch prep | Content status QA, humanizer pass, preview deployment, structured-data/link validation, launch checklist | Definition of Done |

**MVP line**: M2→M6 (Foundation + homepage + builder) yields the core P1 experience. M7 adds P2 depth;
M8 adds P3; M9/M10 harden and prepare launch.

## Design Artifacts (Phase 1 outputs)
- [`data-model.md`](./data-model.md) — CMS content model + modular section model + Growth Plan data.
- [`contracts/forms-and-email.md`](./contracts/forms-and-email.md) — form & email-delivery architecture.
- [`contracts/growth-plan-rules.md`](./contracts/growth-plan-rules.md) — recommendation rules contract.
- [`design/sitemap-and-routes.md`](./design/sitemap-and-routes.md) — routes, IA, mega-menus, sitemap.
- [`design/component-inventory.md`](./design/component-inventory.md) — components & section types.
- [`design/animation.md`](./design/animation.md) · [`design/accessibility.md`](./design/accessibility.md)
  · [`design/seo.md`](./design/seo.md) · [`design/security-privacy.md`](./design/security-privacy.md)
  · [`design/performance.md`](./design/performance.md) · [`design/testing.md`](./design/testing.md)
  · [`design/deployment.md`](./design/deployment.md) · [`design/environment.md`](./design/environment.md)

## Complexity Tracking

No constitution violations to justify — table intentionally empty.

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| — | — | — |
