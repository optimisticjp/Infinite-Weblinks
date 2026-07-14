---
description: "Implementation tasks for the Infinite Weblinks website"
---

# Tasks: Infinite Weblinks Website

**Input**: Design documents in `specs/001-infinite-weblinks-website/`
**Prerequisites**: `plan.md`, `spec.md`, `research.md`, `data-model.md`, `contracts/`, `design/`
**Tests**: INCLUDED — the brief (§24) explicitly requires testing; the rules engine is TDD-first.
**Organization**: Grouped by milestone (M2–M10 from `plan.md`) and user story (US1–US4 from `spec.md`).

**Status**: This is the planned task backlog. **No task below has been started** — implementation is
deferred to owner approval. IDs are stable references for `/speckit-implement`.

## Format: `[ID] [P?] [Story] Description`
- **[P]** = can run in parallel (different files, no dependency).
- **[Story]** = US1/US2/US3/US4 or `INFRA` (cross-cutting).
- Paths follow the proposed structure in `plan.md`.

---

## Phase 1 — Setup & foundation (Milestone M2)

**Purpose**: Repository, tooling, design tokens, CI. Blocks everything else.

- [ ] T001 [INFRA] Re-verify & pin exact versions from `research.md`; resolve **R-TS-1** (TS7 vs 5.9 LTS) via throwaway compile; record decision.
- [ ] T002 [INFRA] Scaffold Next.js 16 App Router + React 19 + TypeScript strict; add route groups `(marketing)`, `(convert)`, `studio`.
- [ ] T003 [P] [INFRA] Configure ESLint (+ `jsx-a11y`), Prettier, `tsconfig` strict, editorconfig.
- [ ] T004 [P] [INFRA] Add `@opennextjs/cloudflare`, `wrangler.jsonc`, `open-next.config.ts`; KV + R2 bindings (names per `design/deployment.md`); verify a hello-world Worker build/deploy to a preview.
- [ ] T005 [INFRA] Port design tokens to `src/styles/tokens/` (colours, type, spacing, effects).
- [ ] T006 [INFRA] **Resolve R-A11Y-1 (CHK-A12)**: dark text on the pink→orange CTA gradient; add a validated CTA token.
- [ ] T007 [INFRA] **Resolve R-A11Y-2 (CHK-A13)**: add section-scoped text aliases (on-dark / on-band / on-statement); re-run contrast checks on all pairs.
- [ ] T008 [P] [INFRA] Self-host subset fonts (Sora / Plus Jakarta Sans / JetBrains Mono) via `next/font`; `display: swap`; preload hero weight (`design/performance.md`).
- [ ] T009 [P] [INFRA] Set up CI (`.github/workflows`): install, lint, typecheck, unit, build. (E2E/LHCI added in M9.)
- [ ] T010 [INFRA] Add `.env.example` (names + placeholders only per `design/environment.md`); wire secret loading for dev/preview/prod.

**Checkpoint**: App builds and deploys to a Cloudflare preview; tokens pass contrast; CI green.

---

## Phase 2 — Primitives & chrome (Milestone M4 foundation)

- [ ] T011 [P] [INFRA] Build primitives: `Button`, `Eyebrow`, `GradientText`, `Badge` (+ content-status flag), `IconTile`, `Card`, `Stepper`, `Accordion`, `Tabs`, `Table` (`src/components/primitives/`) — accessible, token-driven.
- [ ] T012 [P] [INFRA] Build form primitives `Input`/`Textarea`/`Select` with label/hint/error a11y.
- [ ] T013 [INFRA] Motion setup: `src/lib/motion/` GSAP registration (dynamic import, client-only) + reduced-motion guard; Motion config (`design/animation.md`).
- [ ] T014 [INFRA] `SkipLink`, root `layout.tsx`, `lang`, landmarks, `not-found.tsx`, `error.tsx`.

---

## Phase 3 — CMS schemas & preview (Milestone M3) — 🎯 US3 (P2)

**Purpose**: Full content model so pages can be data-driven from M4 onward.

- [ ] T015 [US3] Add Sanity to repo; `sanity.config.ts`, embedded Studio at `/studio/[[...tool]]` (protected); Vision.
- [ ] T016 [P] [US3] Shared objects: `contentStatus`, `seo`, `cta` (approved routes only), `mediaImage`, `themeChoice`, `layoutVariant`, `link` (`data-model.md`).
- [ ] T017 [P] [US3] Taxonomy documents: `businessType`, `goal`, `startingPoint`, `growthStage` (8, locked), `crossCuttingSystem` (3), `deliveryModel` (4), `serviceCategory`, `service`, `toolCategory`, `tool`, `roadmap`, `solution`.
- [ ] T018 [P] [US3] Editorial docs: `article`, `resource`, `faq`, `caseStudy` (gated), `example` (gated), `testimonial` (gated), `legalPage`.
- [ ] T019 [P] [US3] Config singletons: `siteSettings`, `navigation`, `megaMenu`, `footer`, `ctaLibrary`.
- [ ] T020 [US3] `page` document + **approved section-type objects** (component-inventory §4) with enabled/order/theme/layout and validation (closed `_type` list; rhythm warning; alt/focal required).
- [ ] T021 [US3] `growthPlanRuleSet` document + option-set docs (`existingSetupOption`); status/version fields.
- [ ] T022 [US3] Desk structure + least-privilege roles for two admins; protect Studio.
- [ ] T023 [US3] Sanity client + GROQ queries in `src/lib/sanity/` with **public status-gating** (`verified`/`readyToPublish`); typed results (Sanity typegen).
- [ ] T024 [US3] Draft Mode + Presentation live preview: `/api/draft`, `/api/disable-draft` (secret), preview data path.
- [ ] T025 [US3] Publish webhook → `/api/revalidate` (secret-verified) → on-demand ISR revalidation by tag.
- [ ] T026 [P] [US3] Component test: status gating (placeholder/draft never renders publicly).
- [ ] T027 [US3] Seed a minimal Verified dataset (site settings, nav, a few stages/goals/services/tools) for development.

**Checkpoint**: Editors can create/preview/publish; public queries return only Verified content.

---

## Phase 4 — Header, navigation & homepage opening (Milestone M4) — 🎯 US1 (P1) MVP

- [ ] T028 [US1] `SiteHeader` (sticky selective glass) + `SiteFooter` (support email, CMS social hidden-until-valid, no phone).
- [ ] T029 [US1] `MegaMenu` (CMS-driven columns; keyboard pattern, Esc, focus return; fade+slide) — WCAG 2.4.11 focus-not-obscured.
- [ ] T030 [US1] `MobileNav` (one button → full-screen menu; focus trap + restore; no squeezed desktop menu).
- [ ] T031 [US1] `HeroCopy` (RSC: eyebrow, slogan, headline, support copy, CTAs, reassurance — server-rendered).
- [ ] T032 [US1] `HeroConnectedUniverse` editable SVG (infinity + 6 domain nodes) as client island; static-first; four-moment timeline (`design/animation.md`).
- [ ] T033 [US1] Reduced-motion end-state for hero (connection lines drawn, no pulses/float); verify SSR static default.
- [ ] T034 [P] [US1] `editorialStatement` + first bright-editorial section; enforce section rhythm.
- [ ] T035 [P] [US1] E2E: homepage loads, hero readable without animation, no horizontal overflow at 360/390/768/1024/desktop (SC-001); reduced-motion (SC-004).

**Checkpoint**: Homepage opening is live, accessible, static-first, CMS-driven.

---

## Phase 5 — Remaining homepage sections (Milestone M5) — US1 (P1)

- [ ] T036 [P] [US1] `growthJourney` (8-stage spectrum) + `crossCuttingSystemsBand`; static text fallback.
- [ ] T037 [P] [US1] `goalExplorer`, `startingPointSelector` (interactive, accessible).
- [ ] T038 [P] [US1] `roadmapShowcase`, `servicesExplorer` (preview), `toolUniverse` (preview).
- [ ] T039 [P] [US1] `deliveryModels` (4 + ownership line), `processSteps` (8-step).
- [ ] T040 [P] [US1] `whyInfiniteWeblinks`, `learningResources`, `faqSection` (accordion), `finalCtaBanner`.
- [ ] T041 [P] [US1] `caseStudyShowcase` + `testimonialWall` built but **auto-hidden** until Verified.
- [ ] T042 [US1] `connectedJourneyScene` illustrated (client island) with static equivalent.
- [ ] T043 [US1] E2E + axe on the full homepage; verify no placeholder content renders (SC-007).

---

## Phase 6 — Growth Plan Builder & forms (Milestone M6) — 🎯 US1 (P1)

- [ ] T044 [US1] **TDD**: `src/lib/growth-plan/` rules engine (pure `resolve()`), types, per `contracts/growth-plan-rules.md` — write unit tests first (matching, specificity, wildcard, fallback, dereference).
- [ ] T045 [US1] Zod validation schemas (`src/lib/validation/`) for builder + contact (shared client/server) — unit tested (header-injection, boundaries).
- [ ] T046 [US1] `GrowthPlanBuilder` multi-step client component (accessible steps, error summary, `aria-live`, progress); neutral engagement ranges.
- [ ] T047 [US1] `GrowthPlanResult` renders the structured output (Start here/Connect next/Add later/capabilities/example tools/expected outcomes/how we help).
- [ ] T048 [US1] `TurnstileWidget` (accessible) + internal Route Handler `/api/forms/growth-plan`: server Zod re-validate, Turnstile siteverify, honeypot/timing/rate-limit, forward to Formspree (team-only), no auto-reply (`contracts/forms-and-email.md`).
- [ ] T049 [US1] `ContactForm` + `/api/forms/contact`; `?subject=growth-goals` prefill; success/error states + email fallback.
- [ ] T050 [P] [US1] E2E: builder happy path + submit (Formspree + Turnstile mocked), validation/error states, keyboard-only, reduced-motion (SC-002, SC-009); security tests (Turnstile-fail, honeypot, rate-limit).

**Checkpoint**: Core P1 experience complete — MVP. Homepage + builder + email delivery working.

---

## Phase 7 — Core templates (Milestone M7) — US2 (P2)

- [ ] T051 [P] [US2] `ServiceDetail` template (`/services/[slug]`): delivery model + ownership line + related tools/goals/stages + CTA.
- [ ] T052 [P] [US2] `ToolDetail` template (`/tools/[slug]`): 6 facets; labelled "we can connect".
- [ ] T053 [P] [US2] `RoadmapDetail` (`/roadmaps/[slug]`): phases using exact stage names + cross-links.
- [ ] T054 [P] [US2] `SolutionDetail`, `BusinessTypeLanding`, `StartingPointLanding` templates.
- [ ] T055 [US2] `ListingIndex` + `ServiceFilter`/`ToolFilter` islands (facets: category, goal, stage, business type, delivery model, tool); canonical unfiltered page stays SSG; pagination/virtualisation.
- [ ] T056 [P] [US2] `Breadcrumbs` on all deep routes (+ BreadcrumbList schema).
- [ ] T057 [P] [US2] E2E: filter services; open service/tool/roadmap detail; breadcrumbs; SSR/indexable (SC-003).

---

## Phase 8 — Resources, articles & proof (Milestone M8) — US4 (P3)

- [ ] T058 [P] [US4] `ArticleDetail` (`/learn/[slug]`) + `/learn`, `/resources` indexes; Article schema.
- [ ] T059 [P] [US4] `/faq` page (accessible accordion) + FAQPage schema **only when visible**.
- [ ] T060 [P] [US4] `CaseStudyDetail`/`ExampleDetail` templates (Verified-gated; indexes hidden while empty).
- [ ] T061 [P] [US4] `/about` (positioning, delivery models, ownership) + `/how-it-works` full page.
- [ ] T062 [P] [US4] Legal pages (`/privacy`, `/cookies`, `/terms`, `/accessibility`) — structural draft, `reviewFlag` set (professional review pending).
- [ ] T063 [US4] E2E: contact `?subject=growth-goals`; FAQ keyboard; article render/index.

---

## Phase 9 — SEO, a11y, performance & security hardening (Milestone M9) — INFRA

- [ ] T064 [P] [INFRA] `generateMetadata` per route from CMS `seo`; title templates; single canonical; www→root (`design/seo.md`).
- [ ] T065 [P] [INFRA] JSON-LD builders (`src/lib/seo/`): Organization (Verified fields only), Service, Article, BreadcrumbList, FAQPage (visible-only), ItemList; **no** Review/AggregateRating until verified.
- [ ] T066 [P] [INFRA] Dynamic `sitemap.ts` (Verified + indexable only) + `robots.ts` (disallow /studio, /api, /growth-plan, /contact); per-route OG images.
- [ ] T067 [INFRA] Security headers + CSP (Sanity/Formspree/Turnstile/Cloudflare Analytics/fonts allowlist), HSTS, referrer-policy, frame-ancestors, permissions-policy (`design/security-privacy.md`).
- [ ] T068 [INFRA] Consent-gate scaffold (dormant); confirm cookieless Cloudflare Web Analytics needs no banner.
- [ ] T069 [P] [INFRA] Add axe-core to Playwright across key routes; keyboard/screen-reader pass; fix WCAG 2.2 items (2.4.11, 2.5.8, 3.3.7, 3.3.8, 3.2.6).
- [ ] T070 [P] [INFRA] Lighthouse CI with per-page budgets (`design/performance.md`) gating the build; bundle-size check.
- [ ] T071 [P] [INFRA] Link checker + metadata/structured-data validation in CI.
- [ ] T072 [INFRA] `npm audit` / dependency review in CI; review third-party scripts; SRI where applicable.

---

## Phase 10 — Content QA, preview deploy & launch prep (Milestone M10) — INFRA

- [ ] T073 [INFRA] Content QA: verify status gating end-to-end; ensure no placeholder proof/phone/partnership claims in production (SC-007).
- [ ] T074 [INFRA] Humanizer pass on all shipped copy (Global English, no SaaS/hype/boilerplate).
- [ ] T075 [P] [INFRA] Visual regression baselines at 360/390/768/1024/desktop for key pages.
- [ ] T076 [INFRA] Production Cloudflare deploy behind preview review; verify www→root, caching/ISR revalidation on publish, rollback path.
- [ ] T077 [INFRA] Wire Google Search Console; submit sitemap; verify Cloudflare Web Analytics RUM.
- [ ] T078 [INFRA] Run `/speckit-converge`: assess build vs spec/plan; log residual gaps; confirm Definition of Done (`quickstart.md`).

---

## Dependencies & execution order
- **Phase 1** blocks all. **Phase 2** (primitives) blocks Phases 4–8. **Phase 3** (CMS) blocks all
  content rendering (Phases 4–8). **Phase 6** depends on Phases 2–3 (forms need primitives + CMS option
  sets + rules doc). **Phase 9** hardening depends on the surfaces existing (Phases 4–8). **Phase 10**
  depends on all desired stories complete.
- **MVP path**: Phase 1 → 2 → 3 → 4 → 5 → 6 (US1 P1). Then Phase 7 (US2), Phase 8 (US4), then 9–10.

## Parallelization notes
- `[P]` tasks touch different files and can run concurrently (e.g. T016–T019 schema groups; the
  section-type components in Phase 5; the detail templates in Phase 7).
- The rules engine (T044) and validation (T045) are TDD-first and independent of presentation.
- Do not parallelize the two **token contrast fixes** (T006/T007) with primitive-building — primitives
  depend on the fixed tokens.

## Testing map (see `design/testing.md`)
Unit (Vitest): T044, T045, T021/T026 gating. Component: primitives, mega-menu, accordion, stepper,
status gating. E2E (Playwright): T035, T043, T050, T057, T063. a11y/perf/SEO gates: T069–T071. Visual:
T075. All land within their milestone; CI gates tighten by M9.
