# Implementation Plan

**Spec:** `./spec.md` · **Traceability:** `../../docs/reviews/implementation-traceability.md`

## Approach

Additive, not corrective. The review's own conclusion is that the engineering is strong and the
work is *additive* (richness, motion, proof, clarity). So: preserve the token system, primitives,
content-data separation, forms, SEO, tests, and architecture; layer new sections/components/scenes
on top; change the foundation only where a requirement genuinely needs it (CTA gradient tokens,
motion library extension, error boundary, dependency removal).

## Constitution Check (`.specify/memory/constitution.md` v2.0.0)

| Principle | Compliance |
|---|---|
| I Spec Before Code, Right-Sized | Full Spec Kit for this large program; spec+plan+tasks+traceability precede code. ✅ |
| II Mobile-First | Mobile compression, sticky CTA, scrollers, touch targets, 360/390 validation. ✅ |
| III Performance Is a Validation Outcome | Budget + guard; SVG/CSS richness; no raster/video/2nd runtime; removed unused dep. ✅ |
| IV Deliberate Design | One coherent living-universe direction from references; token-driven. ✅ |
| V Capability-First Skill Use | Used ui-ux, frontend-design, humanizer, cro/marketing, owasp, seo, tdd/write-tests, context skills as relevant. ✅ |
| VI Human-Sounding Content | humanizer applied to new copy/guides. ✅ |
| VII/VIII/IX SEO/A11y/Security in build | OG + schema, axe green, OWASP review on new surfaces, anti-spam preserved. ✅ |
| X Test Important Behaviour | Extended unit + e2e + new visual regression + gating-consistency tests. ✅ |
| XI Right-Sized Spec Kit | Full workflow used (this is a large program). ✅ |
| XII Efficient Context | Concise artifacts; parallel exploration; summarized decisions. ✅ |
| XIII Preview Without Deployment | Build + e2e locally; **no `cf:deploy`**. ✅ |
| XIV Verified Definition of Done | All validation commands + traceability + final-verification. ✅ |
| XV Technical Freedom, Outcome-Bound | New components/motion within existing stack; no gratuitous churn. ✅ |

No Complexity-Tracking exceptions required (no framework/CMS/DB/hosting/styling-system swap).

## Phased delivery (maps to commit sequence)

1. **P0** specs, traceability, baselines, visual-regression + gating tests (regression protection first).
2. **P1** conversion/trust/mobile: trust section, builder explainer, sticky CTA, CTA gradient AA, footer targets, gating test, remove `motion`.
3. **P2** homepage compression + builder (6 steps, preview, Now/Next/Later, budget band), troubleshooter prominence, nav cue.
4. **P4-reliability** error boundary, perf budget, gating/sanity/reliability docs.
5. **P5** motion foundation + visual direction + reference scene upgrades.
6. **P3** content: learn guides, OG images, proof architecture + honest schema.
7. **P6** validation, convergence, final-verification, PR.

## Key technical decisions

- **CTA gradient:** darken `--grad-cta` to `#d1005f→#c94f00`, flip `--cta-text` to white, retune `--glow-cta` + hover shadow; re-verify contrast in normal/hover/focus/disabled.
- **Sticky mobile CTA:** new `chrome/StickyMobileCta` client island rendered as a layout sibling *outside* any `backdrop-filter` ancestor (containing-block trap); IO on hero CTA; safe-area insets.
- **Motion foundation:** extend `src/lib/motion/motion.ts` + add `components/motion/Reveal.tsx` — transform-only reveals, reduced-motion gate, static-complete, IntersectionObserver pause/cleanup.
- **Trust layer:** new `SectionType` + registry entry + `getHomepageSections()` order entry + typed `data/trust.ts`; renders live (methodology, not fake proof); real proof stays status-gated.
- **Builder:** merge engagement+timeline (+budget) into one scope step; drop standalone review (fold preview+review into the flow); engine inputs (businessType/currentStage/mainGoal/existingSetup) untouched.
- **Scenes:** layered SVG + CSS glow, `aria-hidden`, real HTML labels; no raster/WebGL.
- **Error path:** `app/error.tsx` + `app/global-error.tsx`, no PII, static fallback.

## Risks & mitigations

- *Visual regression from restyle* → visual-regression baselines added first (P0-05); re-baseline intentionally after upgrades.
- *A11y regression from new motion/scenes* → reduced-motion e2e + axe kept green; transform-only reveals; decorative scenes aria-hidden.
- *Breaking deterministic engine* → engine untouched; growth-plan unit tests are the guard.
- *Homepage compression breaking layout* → overflow e2e at all widths; height measured before/after.
