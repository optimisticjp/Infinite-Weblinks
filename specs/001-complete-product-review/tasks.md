# Tasks (dependency-ordered)

Grouped by commit phase. Each maps to traceability IDs. `[x]` = done, `[~]` = partial (see traceability), `[b]` = blocked, `[a]` = avoided/postponed by decision.

## Phase 0 — protection
- [x] T001 Preserve review verbatim + verify SHA (P0-02)
- [x] T002 Baseline measurements (P0-06)
- [x] T003 Traceability matrix (P0-03)
- [x] T004 Spec Kit artifacts (P0-04)
- [x] T005 Visual-regression spec at 5 widths + reduced-motion (P0-05)
- [x] T006 Sitemap/gating consistency unit test (P1-06)

## Phase 1 — conversion/trust/mobile
- [x] T101 CTA gradient AA (white text, darken ends, retune glow) (P1-04)
- [x] T102 Footer legal touch targets ≥44px (P1-05)
- [x] T103 Remove unused `motion` dep + record bundle impact (P1-07)
- [x] T104 Honest interim trust section (methodology/ownership) near hero + above CTA (P1-01, P3-05)
- [x] T105 Builder explainer microcopy + plan preview (hero + final CTA) (P1-02)
- [x] T106 Sticky mobile CTA (IO, reduced-motion, a11y, safe-area) (P1-03)

## Phase 2 — homepage + builder
- [x] T201 Builder 8→6 steps + earlier preview + budget band (P2-03, P2-04, D-04)
- [x] T202 Now/Next/Later prioritised result visual (REF-14)
- [x] T203 Homepage mobile compression toward 12–14 screens (P2-01)
- [x] T204 Preserve/tighten copy only (P2-02)
- [x] T205 Troubleshooter prominence as low-friction option (P2-05)
- [x] T206 "Your goal" direct-link nav cue (P2-06)

## Phase 4 — reliability/docs
- [x] T401 error.tsx + global-error.tsx (P4-04)
- [x] T402 Performance budget doc + guard (P4-01)
- [x] T403 content-gating.md (P4-05)
- [x] T404 sanity-activation.md (P4-06)
- [x] T405 reliability-notes.md incl. rate-limit backing review (P4-03)

## Phase 5 — visual + motion
- [x] T501 Reusable motion foundation (Reveal + motion helpers) (P5-02)
- [x] T502 Restrained section reveals + staggered cards (P5-03/04)
- [x] T503 Logo-rail marquee (P5-05)
- [~] T504 Hero REF-07 enrichment (P5-01, REF-07)
- [~] T505 Goals REF-10 illustrated scenes (REF-10)
- [~] T506 Ownership REF-13 glass vault + ecosystem (REF-13)
- [x] T507 Contact REF-02 globe scene (no pins) (REF-02)
- [x] T508 Journey REF-05 glow + draw-in (REF-05)
- [x] T509 Digital-world REF-18 floating ecosystem (REF-18)
- [x] T510 Footer CTA REF-19 scene + reassurance (REF-19)
- [x] T511 Starting-points REF-08 glowing rail (REF-08)
- [~] T512 Services REF-12 constellation glow (REF-12)
- [~] T513 Ways-of-working REF-01 device scenes (REF-01)
- [x] T514 Mega-panel REF-03 lighting (REF-03)

## Phase 3 — content/SEO
- [x] T301 Expand /learn guides (humanized, schema) (P3-01)
- [~] T302 Section-specific OG images (P3-02)
- [x] T303 Enrich proof content architecture + honest caseStudy schema (P3-04)
- [b] T304 Location/service-area pages — BLOCKED (P3-03, D-05)

## Phase 6 — validation/convergence
- [x] T601 lint/typecheck/test/build/e2e/cf:build
- [x] T602 Viewport + a11y + perf validation
- [x] T603 final-verification.md
- [x] T604 Push branch + open PR into main (no merge, no deploy)

## Postponed by decision (P5-06 advanced effects)
- [a] magnetic CTA, cursor glow, parallax, page transitions, sticky storytelling
- [b] counters + before/after (need real metrics)
