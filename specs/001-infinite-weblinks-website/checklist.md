# Requirements Quality Checklist — Infinite Weblinks

**Purpose**: Validate that the spec and plan are complete, clear, consistent and testable **before**
implementation (Spec Kit `checklist` stage). Items are written against the artifacts, not code. Mark
`[x]` when satisfied; unresolved items are surfaced in `analysis.md`.

**Feature**: [`spec.md`](./spec.md) · **Plan**: [`plan.md`](./plan.md)

## Coverage — every brief section is addressed
- [x] CHK001 Conversion model (brief §4) reflected: email-led, Formspree+Turnstile, no calendar/phone (spec FR-040/041, contracts/forms-and-email).
- [x] CHK002 Positioning (brief §2): services-company, no SaaS/login language, in guardrails + copy rules.
- [x] CHK003 Audiences (brief §3) captured as `businessType` axis + Key Entities.
- [x] CHK004 Visual direction (brief §6) mapped to tokens/section rhythm/component inventory.
- [x] CHK005 Logo usage (brief §7) reflected (Signature Crossover; approved files; stale note ignored).
- [x] CHK006 Hero direction (brief §8) → `design/animation.md` + component inventory (editable SVG, 6 nodes).
- [x] CHK007 Header/nav + mega-menus (brief §9) → `design/sitemap-and-routes.md` + component inventory.
- [x] CHK008 8-stage journey + 3 cross-cutting systems (brief §10) named exactly in spec + data-model.
- [x] CHK009 4 delivery models + ownership line (brief §11) in data-model + component inventory.
- [x] CHK010 Route architecture (brief §12) → full route table in `design/sitemap-and-routes.md`.
- [x] CHK011 19-block homepage model (brief §13) → section types in component inventory + data-model.
- [x] CHK012 CMS/admin requirements (brief §14) → `data-model.md` (controlled builder, status, roles, preview).
- [x] CHK013 Growth Plan Builder (brief §15) → `data-model.md` + `contracts/growth-plan-rules.md`.
- [x] CHK014 Services/tools filterability + tool facets (brief §16) → data-model + sitemap doc.
- [x] CHK015 Technical direction + version validation (brief §17) → `research.md` (pinned + re-verify).
- [x] CHK016 Cloudflare deployment (brief §18) → `design/deployment.md`.
- [x] CHK017 Accessibility WCAG 2.2 AA (brief §19) → `design/accessibility.md`.
- [x] CHK018 Performance (brief §20) → `design/performance.md` (budgets).
- [x] CHK019 SEO + structured data (brief §21) → `design/seo.md`.
- [x] CHK020 Security & privacy (brief §22) → `design/security-privacy.md` + `design/environment.md`.
- [x] CHK021 Footer + social + support email, no phone (brief §23) → sitemap/component/data-model.
- [x] CHK022 Testing scope (brief §24) → `design/testing.md`.
- [x] CHK023 Milestones (brief §25) → `plan.md` milestone table.
- [x] CHK024 Definition of success (brief §26) → spec Success Criteria + `quickstart.md` DoD.

## Clarity & testability
- [x] CHK025 Each user story has an independent test and Given/When/Then acceptance scenarios.
- [x] CHK026 Success criteria (SC-001…010) are measurable and technology-agnostic.
- [x] CHK027 Functional requirements are uniquely IDed (FR-0xx) and unambiguous.
- [x] CHK028 Growth Plan output fields exactly match brief §15 (Start here/Connect next/Add later/…).
- [x] CHK029 Engagement ranges are the exact 6 neutral options, no currency.
- [x] CHK030 CTAs limited to the approved set with fixed routes.
- [x] CHK031 Owner clarifications resolved and **locked** (analysis.md §4): Q1 content seeded as Draft/Placeholder from the Growth Guide; Q2 new free Sanity project; Q3 logo cleanup/trademark = production-launch gate only.

## Consistency (spec ↔ plan ↔ design ↔ sources)
- [x] CHK032 Official names identical across all artifacts (stages, systems, delivery models).
- [x] CHK033 Route list identical in spec, plan structure, and sitemap doc.
- [x] CHK034 Pinned versions identical across research, plan, deployment, environment docs.
- [x] CHK035 Brief overrides Growth Guide where they differ (no "book a call" leaks into requirements).
- [x] CHK036 No forbidden patterns asserted as site copy (SaaS/login/partners/placeholders/phone).
- [x] CHK037 Constitution Check passes with no unjustified violations (plan.md).

## Guardrail compliance (verified in artifacts)
- [x] CHK038 No unverified content is public by design (status gating in data-model, query gate).
- [x] CHK039 Platform logos labelled "we work with"/"can connect", never "partners".
- [x] CHK040 Reduced-motion + static alternatives specified for hero and journeys.
- [x] CHK041 Secrets never in Git; env inventory is names-only.
- [x] CHK042 Hero rebuilt as editable SVG; artifact code not reused.

## Design-quality blockers to resolve before build (from accessibility review)
- [ ] CHK-A12 Fix primary CTA gradient contrast: use dark (`--ink-950`) text on pink→orange (white fails
      AA at the orange end). → risk R-A11Y-1.
- [ ] CHK-A13 Add section-scoped text colour aliases (on-dark / on-band / on-statement); the global
      body-text token fails on the bright `#F4F1EA` band. → risk R-A11Y-2.

## Owner-locked revisions (post-review) — reflected across artifacts
- [x] CHK043 TypeScript pinned to **latest stable 6.0.x** (native TS7 = future experiment only; `5.9.x`
      LTS interim if no 6.0 GA at setup) — research.md R6, plan.md, tasks.md T001.
- [x] CHK044 OpenNext cache = **R2 incremental cache + D1 tag cache + Workers Assets, no KV**, **on-demand
      revalidation** (no time-based ISR, no Durable-Object queue initially) — research.md R2,
      design/deployment.md, design/environment.md, design/performance.md, tasks.md T004/T025.
- [x] CHK045 Config re-validated against current OpenNext docs at implementation (**R-CACHE-1**) recorded.
- [x] CHK046 Sanity Studio **deployed separately** (`*.sanity.studio`, `studio/` workspace), **not
      embedded** at `/studio`; CSP/CORS/framing updated — research.md R3, deployment, security-privacy,
      environment, sitemap-and-routes, plan.md.
- [x] CHK047 **Progressive CMS**: initial schema slice in M3; roadmaps → M7; articles/resources/examples/
      case-studies/testimonials → M8; full model preserved — data-model.md, plan.md, tasks.md.
- [x] CHK048 Content **seeded as Draft/Placeholder** from the Growth Guide; owner verifies progressively;
      polished copy not required before homepage previews — spec.md, data-model.md, tasks.md T027.
- [x] CHK049 **Mandatory homepage-opening review gate (GATE-1)** added after tokens/primitives, header,
      mega-menu foundation, mobile nav, static hero, animated infinity, bright transition, reduced-motion,
      responsive testing → private preview → owner stop — plan.md, tasks.md T035a/T035b, quickstart.md.
- [x] CHK050 New free **Sanity project** for two editors; logo usable in previews, cleanup/trademark =
      production gate — research.md R3, spec.md, analysis.md.

## Notes
- Unchecked items (**CHK-A12, CHK-A13**) are **planned resolutions**, not gaps: both are design-token
  fixes scheduled for Milestone 2 (before component build). Owner clarifications (CHK031) are resolved
  and the post-review architecture revisions are applied (CHK043–CHK050). None block plan approval.
