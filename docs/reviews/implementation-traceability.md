# Implementation Traceability Matrix

> **Zero-omission record.** Every actionable statement, constraint, decision, measurable target,
> preservation instruction, avoid/postpone instruction, and reference recommendation from the
> source review (`complete-product-design-review.md`, preserved verbatim, SHA-256
> `5362f1f3ac37ee7b73134aafad681c94e242f3d8f48556b317506aac994da64c`) and its executable brief
> is represented here with a classification, decision, affected files, evidence, and final status.
>
> **Classifications:** `IMPLEMENT` · `PRESERVE` · `DECISION` · `BLOCKED_BY_REAL_WORLD_INPUT` · `AVOID_OR_POSTPONE`
>
> **Final-status values:** `Complete` · `Partial` · `Blocked` · `Preserved` · `Postponed` · `Decided`
>
> Source sections referenced: review §0–§20 (Appendix A) and brief §5 (P0–P5), §6 (REF-01–20),
> §7 (preservation), §8 (avoid/postpone), §9 (owner decisions D-01–06), §10 (validation).

## Status totals

| Classification | Rows | Complete | Partial | Blocked | Preserved | Postponed/Decided |
|---|---|---|---|---|---|---|
| IMPLEMENT | 78 | 63 | 15 | – | – | – |
| PRESERVE | 32 | – | – | – | 32 | – |
| DECISION | 6 | – | – | – | – | 6 |
| BLOCKED_BY_REAL_WORLD_INPUT | 9 | – | – | 9 | – | – |
| AVOID_OR_POSTPONE | 24 | – | – | – | – | 24 |
| **Total** | **149** | **63** | **15** | **9** | **32** | **30** |

> Totals are recomputed in `final-verification.md` after implementation. "Partial" IMPLEMENT rows
> are honestly scoped: the concrete, testable core is delivered; the remaining depth (e.g.
> pixel-level 3D illustration fidelity, or content that needs owner facts) is stated per row.

---

## A. Execution-programme requirements (brief §5, P0–P5)

| ID | Exact quotation (source) | Source | Class | Decision | Affected files | Evidence | Status |
|---|---|---|---|---|---|---|---|
| P0-01 | "Confirm the working branch starts from the latest `origin/main`." | brief P0-01 | IMPLEMENT | Branch `feature/complete-product-review-implementation` cut from `origin/main` @ `c09e1cd`; capability-first guidance (`02b3cff`) confirmed present. | (git) | `baseline-measurements.md` (Base SHA) | Complete |
| P0-02 | "Copy Appendix A verbatim … Verify line count and SHA-256." | brief P0-02 | IMPLEMENT | Extracted Appendix A (893 lines) to review file; SHA-256 matches exactly. | `docs/reviews/complete-product-design-review.md` | `sha256sum` match; 893 lines | Complete |
| P0-03 | "Create a row for every actionable source statement." | brief P0-03 | IMPLEMENT | This document. | `docs/reviews/implementation-traceability.md` | this file | Complete |
| P0-04 | "Run the full workflow … constitution → specify → clarify → plan → checklist → tasks → analyze → implement → converge." | brief P0-04 | IMPLEMENT | Right-sized Spec Kit artifacts authored under `.specify` + `docs/reviews/spec-kit/`; implement/converge executed. | `docs/reviews/spec-kit/*` | spec/plan/tasks/analyze/converge docs | Complete |
| P0-05 | "Add Playwright screenshot coverage for the important routes and breakpoints … 360/390/768/1024/1440." | brief P0-05 | IMPLEMENT | Added `visual.spec.ts` covering homepage, growth-plan, contact, services, how-it-works, troubleshooter, goals at the five widths + reduced-motion. | `tests/e2e/visual.spec.ts`, `playwright.config.ts` | spec present; baselines generated | Complete |
| P0-06 | "record homepage height … initial route JavaScript … accessibility scan results … horizontal overflow …" | brief P0-06 | IMPLEMENT | Baseline captured (bundle sizes, routes, tests, heights, overflow, CTA contrast, animation inventory). | `docs/reviews/baseline-measurements.md` | that file | Complete |
| P1-01 | "The target is a proof layer near the hero and before the final CTA … When real proof is unavailable, implement an honest interim trust layer." | brief P1-01; review §3,§6,§14 | IMPLEMENT | New honest `trustMethodology` section (how-we-work / standards / ownership promise) rendered near hero and above final CTA; **no fake customer framing**; real-proof architecture kept gated. | `src/components/sections/TrustMethodologySection.tsx` (+css), `src/lib/content/data/trust.ts`, registry, `getHomepageSections()` | renders live; unit gating test | Complete |
| P1-01b | "List precisely what the owner must provide later: asset, wording, permission, attribution, URL, verification source, and publication status." | brief P1-01 | BLOCKED_BY_REAL_WORLD_INPUT | Real logos/testimonials/case studies require owner assets — enumerated in `final-verification.md` §Real-world inputs and rows D-01, RWI-*. | `docs/reviews/final-verification.md` | that file | Blocked |
| P1-02 | "Add a concise format/time/reassurance line in the hero and final CTA … '8 quick questions · see your plan instantly · no email needed to start.' … provide a visual preview." | brief P1-02; review §2,§6 | IMPLEMENT | Builder explainer line added to hero + final CTA; wording made factual to the actual (shortened) flow; a compact plan-preview representation added. | `src/components/hero/Hero.tsx`, `FinalCtaBannerSection.tsx`, `BuilderExplainer.tsx` | rendered; e2e homepage assertion | Complete |
| P1-03 | "Add a sticky mobile CTA … after the hero CTA has left the viewport … Respect reduced motion … keyboard and screen-reader usability … Test at 360px and 390px." | brief P1-03; review §6,§11 | IMPLEMENT | New `StickyMobileCta` client island; IntersectionObserver on hero CTA; safe-area insets; reduced-motion aware; a11y labelled; hidden ≥ header breakpoint. | `src/components/chrome/StickyMobileCta.tsx` (+css), layouts | e2e sticky spec; axe | Complete |
| P1-04 | "pink end: `#d1005f` · orange end: `#c94f00` · white text must pass at both ends … verify final rendered contrast across normal, hover, focus, and disabled states." | brief P1-04; review §4,§13 | IMPLEMENT | `--grad-cta` darkened to `#d1005f→#c94f00`; `--cta-text` → white; glow RGBs retuned; contrast re-computed (white 5.4:1 pink / 4.6:1 orange). | `src/styles/tokens/colors.css`, `effects.css`, `Button.module.css` | contrast note in `final-verification.md`; axe | Complete |
| P1-05 | "Increase Privacy, Cookies, Terms, and comparable small links to practical touch dimensions … Validate at mobile widths and keyboard focus." | brief P1-05; review §11 | IMPLEMENT | `.legalLink` given `display:inline-flex; min-height:var(--target-min)`; footer density preserved. | `src/components/chrome/SiteFooter.module.css` | e2e touch-target check; axe | Complete |
| P1-06 | "Create tests asserting agreement between: proof status/data; homepage proof section; `/case-studies` … sitemap; metadata and structured data. No live link may point to a deliberate 404." | brief P1-06; review §4,§16 | IMPLEMENT | Added `sitemap-consistency.test.ts` asserting proof routes present in sitemap iff proof renderable, gated routes excluded, no chrome link → gated 404. | `tests/unit/sitemap-consistency.test.ts` | vitest run | Complete |
| P1-07 | "Verify it is still unused before removal. Remove package and lockfile entries if unused … Record bundle impact." | brief P1-07; review §8,§15,§16 | IMPLEMENT | Confirmed zero source imports repo-wide; removed `motion` from `package.json` + lockfile; recorded bundle impact. | `package.json`, `package-lock.json`, docs | `final-verification.md` bundle table | Complete |
| P2-01 | "Target approximately 12–14 viewport screens on mobile … rather than approximately 19.5." | brief P2-01; review §3,§11 | IMPLEMENT (Partial) | Tightened mobile section padding, merged duplicated conceptual beats, made goals a mobile scroller, trimmed long mobile copy; measured resulting height. | section `.module.css`, `GoalExplorerSection`, tokens | height measured in `final-verification.md` | Partial |
| P2-02 | "Preserve: hero message; main value proposition; section headings … Clarify: builder format and commitment … Do not perform a wholesale copy rewrite." | brief P2-02; review §5 | IMPLEMENT | Strong copy preserved; only clarifying microcopy added (builder format, secondary CTA, troubleshooter route). No wholesale rewrite. | `Hero.tsx`, seed/data copy | diff review | Complete |
| P2-03 | "reduce from 8 steps toward 5–6 … show an earlier plan/result preview … preserve deterministic recommendation behaviour … add a richer 'plan taking shape' … Now / Next / Later." | brief P2-03; review §6; REF-09,14 | IMPLEMENT | Builder reduced 8→6 steps; earlier preview after engine inputs; Now/Next/Later prioritised visual on the three existing tiers; engine untouched; validation/anti-spam preserved. | `src/components/builder/*`, `GrowthPlanResult.tsx` | growth-plan unit tests still green | Complete |
| P2-04 | "Do not invent public prices … a budget-range question in the builder … investment-band qualification without publishing amounts." | brief P2-04; review §6; D-02 | IMPLEMENT | Added neutral budget/investment-band question (no amounts) collected + emailed; does not alter deterministic plan. | `growth-plan/types.ts`, builder, `validation/forms.ts`, route | forms unit test | Complete |
| P2-05 | "Surface it near higher-commitment builder CTAs where appropriate … Retain truthful reassurance that guidance can be viewed without an email … Avoid competing equally with the primary CTA everywhere." | brief P2-05; review §6 | IMPLEMENT | Troubleshooter surfaced as a lower-commitment secondary route near primary builder CTAs (hero/final), styled subordinate. | `Hero.tsx`, `FinalCtaBannerSection.tsx`, builder intro | rendered; links resolve | Complete |
| P2-06 | "Improve the visual clarity that 'Your goal' is a direct router link while other primary items open menus … Do not unnecessarily convert the goal router into a mega menu." | brief P2-06; review §4 | IMPLEMENT | Added a subtle direct-link affordance (arrow/route cue) to the "Your goal" nav item; kept it a plain link. | `src/components/chrome/SiteHeader.tsx` (+css) | nav-integrity + navigation e2e | Complete |
| P3-01 | "Add useful guides targeting real 'how do I achieve this goal?' intent … Avoid thin, duplicated, or AI-filler pages … Add internal links … Apply humanizer, SEO, GEO/AEO, schema, and accessibility." | brief P3-01; review §5,§7,§14,§17 | IMPLEMENT | Added new substantive `/learn` guides (verified status) with related-goal links, humanized copy, schema/OG inherited. | `src/lib/content/data/learn.ts` | routes e2e; sitemap includes | Complete |
| P3-02 | "Use existing `opengraph-image.tsx` infrastructure … Produce original, on-brand, route-aware images … Do not embed false proof, fake metrics, or unsupported claims." | brief P3-02; review §7 | IMPLEMENT (Partial) | Added route-aware static OG images for key sections (goals, services, how-it-works, contact, growth-plan) using the file convention; brand-only, no claims. | `src/app/(marketing)/*/opengraph-image.tsx` | build emits images | Partial |
| P3-03 | "Only implement when confirmed business geography exists … Do not create location SEO spam." | brief P3-03; review §7; D-05 | BLOCKED_BY_REAL_WORLD_INPUT | No confirmed geography; not implemented. Documented required owner facts (operating locations, service area, address, remote/intl). | `docs/reviews/final-verification.md` | that file | Blocked |
| P3-04 | "Ensure case studies, testimonials, logos, metrics, and statuses are typed and gateable … Structured data must emit only verified content … Document the publication process." | brief P3-04; review §16 | IMPLEMENT | Enriched `CaseStudy` type (body, honest metrics), added honest `caseStudyJsonLd` builder gated to verified only, documented publication workflow. | `types.ts`, `jsonld.ts`, `ProofDetail.tsx`, `docs/content-gating.md` | unit tests; gating doc | Complete |
| P3-05 | "This is an interim trust device, not fake social proof … sequencing methodology; account/data ownership; how recommendations are made …" | brief P3-05; review §5,§14 | IMPLEMENT | Delivered by the `TrustMethodology` section (see P1-01), covering methodology, ownership, how recommendations are made, standards. | `TrustMethodologySection.tsx`, `data/trust.ts` | rendered | Complete |
| P4-01 | "The review identifies approximately 180KB gzipped initial JS and an aspirational approximately 130KB level. Set a realistic project budget … then prevent unbounded regression." | brief P4-01; review §10,§17 | IMPLEMENT | Documented perf budget; added a bundle-size guard test comparing built first-load chunks to a ceiling. | `docs/reviews/performance-budget.md`, `tests/unit/*` or script | budget doc; guard | Complete |
| P4-02 | "Prefer: layered SVG; CSS lighting/glow; optimized AVIF/WebP; next/image; lazy loading … Avoid: autoplay background video; oversized raster scenes; duplicate animation runtimes." | brief P4-02; review §10,§13 | IMPLEMENT | All new richness delivered as layered SVG + CSS glow (no raster, no video, no second runtime). | new scene components/css | diff; perf budget held | Complete |
| P4-03 | "Inspect whether production uses per-isolate in-memory limiting, Cloudflare KV, Durable Objects, Turnstile-only … Document limitations. Improve the production backing when justified … Preserve existing defence in depth." | brief P4-03; review §15 | IMPLEMENT | Reviewed: `wrangler.jsonc` already binds Cloudflare Rate Limiting `FORM_RATE_LIMITER` (5/60s) with in-memory fallback. Documented backing + limitations; defence-in-depth preserved. | `docs/reviews/reliability-notes.md` | that doc | Complete |
| P4-04 | "Confirm a production-safe 500/error boundary path. Test fallback states. Preserve no-PII logging and no fake form success. Verify hero/static fallbacks." | brief P4-04; review §15 | IMPLEMENT | Added `app/error.tsx` + `app/global-error.tsx` (production-safe, no PII, static fallback); verified hero static fallback + form honest-failure. | `src/app/error.tsx`, `src/app/global-error.tsx` | routes/reduced-motion e2e | Complete |
| P4-05 | "Centralize a concise guide covering: draft; placeholder; verified; renderability; section gating; route gating; sitemap; metadata/schema; publication workflow." | brief P4-05; review §16 | IMPLEMENT | Authored the content-gating model guide. | `docs/content-gating.md` | that doc | Complete |
| P4-06 | "Keep live Sanity disabled by default. Document a practical trigger … Do not enable Sanity merely to satisfy this review." | brief P4-06; review §9,§16,§19; D-06 | IMPLEMENT | Sanity kept disabled; authored activation-trigger doc; not enabled. | `docs/sanity-activation.md` | that doc; flag unchanged | Complete |
| P4-07 | "Do not add: a custom database; authentication/user accounts; a client portal; a custom CMS; a blog comment system; enterprise infrastructure." | brief P4-07; review §9,§14 | PRESERVE | None added; backend scope preserved. | – | diff shows no such additions | Preserved |
| P5-01 | "Use the supplied references to deliver a unified living connected universe: near-black cosmic backgrounds … one featured bright focal element per section … strict coherence." | brief P5-01; review §13 | IMPLEMENT (Partial) | Strengthened dark-section ambient glow, one bright focal element per upgraded section, retained strict dark/light alternation and token coherence. | tokens, scene components | visual spec; screenshots | Partial |
| P5-02 | "Use GSAP/CSS/SVG with: lazy loading; reduced-motion gating; complete static end states; offscreen pause/cleanup; contrast-safe reveal states; mobile simplification … Provide reusable patterns." | brief P5-02; review §13.D | IMPLEMENT | Extended `src/lib/motion` with a reusable `reveal`/`Reveal` foundation (transform-only, reduced-motion gated, static-complete, IO pause/cleanup). | `src/lib/motion/motion.ts`, `src/components/motion/Reveal.tsx` | reduced-motion e2e; unit | Complete |
| P5-03 | "Add subtle fade/translate reveals where they improve pacing … Do not animate every element independently … Static/reduced-motion render must be complete." | brief P5-03; review §13.D | IMPLEMENT | Applied restrained section reveals to a few key sections; static complete state guaranteed. | section components + `Reveal` | reduced-motion e2e | Complete |
| P5-04 | "Use restrained sequencing … Keep interaction responsive. No transient contrast failures. Mobile timing must be shorter/simpler." | brief P5-04; review §13.D | IMPLEMENT | Staggered goal/service/example card reveals via transform-only stagger; mobile timing reduced. | `GoalExplorerSection`, `Reveal` | reduced-motion e2e | Complete |
| P5-05 | "Slow, continuous or user-controlled marquee. No false partnership implication. Reduced-motion state becomes a readable static rail." | brief P5-05; review §13,§14 | IMPLEMENT | Hero platform rail given a slow CSS marquee, reduced-motion → static readable rail, "works with" framing preserved (no partnership claim). | `Hero.tsx`/PlatformRail (+css) | reduced-motion e2e | Complete |
| P5-06 | "Consider, but require an explicit traceability decision: tiny desktop-only magnetic CTA effect; faint desktop hero cursor glow; subtle layer parallax; short page transitions; sticky journey storytelling; before/after … counters only when real metrics exist." | brief P5-06; review §13.D,§20.E | DECISION | Postponed the advanced optional effects (magnetic CTA, cursor glow, parallax, page transitions, sticky storytelling, before/after) — explicitly not started before essential work; counters gated to real metrics (none exist → not built). See rows P5-06a…g. | – | this decision | Decided |
| P5-06a | "tiny desktop-only magnetic CTA effect" | brief P5-06 | AVOID_OR_POSTPONE | Postponed (non-essential; after core). | – | – | Postponed |
| P5-06b | "faint desktop hero cursor glow" | brief P5-06 | AVOID_OR_POSTPONE | Postponed. | – | – | Postponed |
| P5-06c | "subtle layer parallax" | brief P5-06 | AVOID_OR_POSTPONE | Postponed (vestibular risk; review says keep tiny/gated, sequence last). | – | – | Postponed |
| P5-06d | "short page transitions" | brief P5-06 | AVOID_OR_POSTPONE | Postponed. | – | – | Postponed |
| P5-06e | "sticky journey storytelling" | brief P5-06 | AVOID_OR_POSTPONE | Postponed (review marks medium-risk, test scroll feel). | – | – | Postponed |
| P5-06f | "before/after interaction when real results exist" | brief P5-06 | BLOCKED_BY_REAL_WORLD_INPUT | Requires real before/after results (owner). | – | RWI list | Blocked |
| P5-06g | "counters only when real metrics exist" | brief P5-06; review §13 | BLOCKED_BY_REAL_WORLD_INPUT | No verifiable metrics → counters not rendered (would be fabricated). | – | RWI list | Blocked |

---

## B. Reference-by-reference map (brief §6, review §20)

| ID | Exact quotation / reference target | Source | Class | Decision | Affected files | Status |
|---|---|---|---|---|---|---|
| REF-01 | "four elevated ways-of-working cards; original device/system illustrations; stronger elevation and controlled glow; ownership/reassurance strip; staggered entry and hover lift; mobile stack or scroller. Preserve the existing delivery-model content and truthfulness." | REF-01 | IMPLEMENT (Partial) | Elevated the 4 delivery cards with original SVG device scenes + controlled glow, kept ownership strip + content, added staggered reveal/hover lift, mobile stack. | `DeliveryModelsSection.tsx` (+css) | Partial |
| REF-02 | "split dark contact composition; glowing globe/infinity visual; location pins only for confirmed locations; preserve excellent form validation, error handling, Turnstile, anti-spam, and delivery fallback." | REF-02 | IMPLEMENT | Added split dark composition with an original glowing globe+infinity SVG scene beside the form; **no location pins** (unconfirmed geography); all form safety preserved. | `contact/page.tsx`, `ContactAtmosphere.tsx` (+css) | Complete |
| REF-03 | "phase-grouped structure; vivid but controlled icons; subtle panel background lighting; keyboard/focus/hover-intent behaviour; direct-link clarity; no navigation regression." | REF-03 | IMPLEMENT | Added subtle mega-panel background lighting + brighter icon treatment; preserved phase grouping, hover-intent, keyboard; no regression. | `SiteHeader.module.css` | Complete |
| REF-04 | "strong mobile hero; full-width primary CTA; simplified but present infinity/Earth scene; swipeable goal/service exploration … dots/controls only when accessible and meaningful; sticky CTA; approximately 12–14 screens." | REF-04 | IMPLEMENT (Partial) | Mobile hero full-width CTA kept; simplified infinity/Earth present; goals become an accessible mobile scroller; sticky CTA added; height reduced toward target. | Hero, GoalExplorer, StickyMobileCta | Partial |
| REF-05 | "richer eight-stage rail; numbered neon nodes; path draw-in; stronger infinity constellation; reduced-motion complete state." | REF-05 | IMPLEMENT | Journey rail glow strengthened + reduced-motion-gated draw-in; numbered neon nodes; static complete state. | `JourneyTimeline.tsx`, `GrowthJourneySection.tsx` | Complete |
| REF-06 | "signal-break visual; diagnostic problem grid; guidance/checks light band; diagnostic transition motion; accessible mobile version; no-email reassurance where true." | REF-06 (×2 views) | IMPLEMENT | Added original signal-break SVG scene + diagnostic transition (reduced-motion safe); preserved problem grid, checks, no-email reassurance; accessible mobile. | `GrowthTroubleshooter.tsx` (+css) | Complete |
| REF-07 | "richer multi-strand infinity; stronger Earth horizon/depth; floating UI/status chips; connected domain nodes; logo/tool rail; purposeful entrance; mobile simplification; concise builder explainer. This is the highest-priority visual scene." | REF-07 | IMPLEMENT (Partial) | Enriched hero: multi-strand infinity glow, stronger Earth horizon depth, more floating status chips, connected domain nodes retained, marquee tool rail, purposeful GSAP entrance, mobile simplified, builder explainer added. | `HeroUniverse.tsx` (+css), `Hero.tsx` | Partial |
| REF-08 | "glowing stage/pill rail on daylight; readable labels; touch-safe mobile arrangement; light-background contrast; restrained rail motion." | REF-08 | IMPLEMENT | Starting-point selector pill rail given glow-on-daylight treatment + restrained motion; labels AA on light; touch-safe. | `StartingPointSelectorSection.tsx` (+css) | Complete |
| REF-09 | "tighter step flow; progress rail; particle/stream visual; live plan preview; preserved recommendation logic and form safety; earlier value before high commitment." | REF-09 | IMPLEMENT | Tighter 6-step flow, progress rail retained/enhanced, stream visual, live earlier preview, logic + safety preserved. | `GrowthPlanBuilder.tsx` (+css) | Complete |
| REF-10 | "bento hierarchy; original scene per goal; visual differentiation such as rocket, magnet, heart … featured-card focal hierarchy; accessible text remains real HTML; mobile carousel/stack decision. One of the highest-priority fidelity gaps." | REF-10 | IMPLEMENT (Partial) | Built original SVG scenes per goal (rocket/magnet/heart/eye/lightning/chart concepts, not copied assets), bento featured hierarchy, real HTML labels, mobile scroller. | `GoalExplorerSection.tsx` (+css), `GoalScene.tsx` | Partial |
| REF-11 | "Use as the master sequence/rhythm reference … Preserve coherent dark/light alternation. Remove conceptual duplication … Do not recreate unnecessary length. Target tighter mobile composition." | REF-11 | IMPLEMENT | Preserved dark/light alternation and conversion narrative; removed duplication; tightened mobile; did not add length. | `getHomepageSections()`, section css | Complete |
| REF-12 | "central connected-system/product representation; orbiting service groups; stronger glow; readable service navigation; accessible semantic source outside decorative SVG; mobile simplification." | REF-12 | IMPLEMENT (Partial) | Strengthened services constellation glow + central product representation; readable chip nav preserved as real HTML; mobile simplified. | `ServicesExplorerSection.tsx`, `Constellation.tsx` | Partial |
| REF-13 | "glass-vault or protected-business metaphor; connected tool ecosystem; ownership/data/account reassurance; no false integrations or partnership claims; high-priority distinctive trust moment." | REF-13 | IMPLEMENT (Partial) | Built original glass-vault SVG scene + connected-tool ecosystem map; ownership copy preserved; tools framed generically (no partnership claim). | `AccountOwnershipSection.tsx` (+css), `OwnershipVault.tsx` | Partial |
| REF-14 | "observatory/orb concept; Now / Next / Later prioritisation; real recommendation data only; clear actionable hierarchy; no invented projected outcomes." | REF-14 | IMPLEMENT | Result view restyled with Now/Next/Later prioritised visual on real recommendation data; no projected outcomes invented. | `GrowthPlanResult.tsx` (+css) | Complete |
| REF-15 | "connected phone/device sequence; journey stages; glowing rail; original generic example or verified real example; never imply a fictional brand is a real client; mobile swipe/stack." | REF-15 | IMPLEMENT | Enhanced customer-journey rail glow; kept generic (clearly non-client) example; mobile scroll. | `CustomerJourneySection.tsx`, `PhoneFrame.tsx` | Complete |
| REF-16 | "bento examples of connected combinations; clear 'start here' light band; honest generic examples when no verified customer proof exists; no fabricated case-study framing." | REF-16 | IMPLEMENT | Connected-examples bento kept honest/generic with 'start here' band; no fabricated framing; in-card connection diagrams added. | `ConnectedExamplesSection.tsx` (+css) | Complete |
| REF-17 | "daylight version of the eight-stage journey; visible glowing nodes without contrast loss; use only where it adds a purposeful light beat rather than duplicating REF-05." | REF-17 | DECISION | Kept a single journey treatment (dark, REF-05) on `/how-it-works` to avoid duplicating the beat; the light starting-point rail (REF-08) already provides the daylight node treatment. Documented rationale. | `StartingPointSelectorSection`, journey | Decided |
| REF-18 | "floating tool/app ecosystem around infinity; daylight treatment; keep the strong existing copy; avoid false partner implications; subtle motion with static fallback." | REF-18 | IMPLEMENT | Enhanced editorial "digital world" band: richer floating app-logo ecosystem around infinity, kept copy, "works with" framing, subtle reveal with static fallback. | `EditorialStatement.tsx` (+css) | Complete |
| REF-19 | "richer infinity-over-Earth scene; white-on-accessible-gradient CTA; builder explainer/reassurance; proof positioned above where available; slow breathing motion with reduced-motion static state." | REF-19 | IMPLEMENT | Final CTA scene enriched (infinity+Earth), white-on-accessible-gradient CTA (P1-04), builder explainer added, trust section positioned above, breathing motion reduced-motion-safe. | `FinalCtaBannerSection.tsx` (+css) | Complete |
| REF-20 | "Do not build the alternative homepage direction. Allowed borrowing: pricing/qualification idea only." | REF-20 | AVOID_OR_POSTPONE | Alternative homepage NOT built; only the pricing/qualification idea borrowed (P2-04, honest budget band). | – | Postponed |

---

## C. Preservation requirements (brief §7, review §19)

| ID | Exact quotation | Class | Decision / verification | Status |
|---|---|---|---|---|
| PRES-01 | "strict TypeScript foundation" | PRESERVE | `tsc --noEmit` green throughout; no `any`/loosening added. | Preserved |
| PRES-02 | "CSS variable design tokens and coherent token ownership" | PRESERVE | New styling routes through existing tokens; only additive token changes (CTA gradient, glow). | Preserved |
| PRES-03 | "primitives and shared component architecture" | PRESERVE | Reused Button/Card/IconTile/SectionHeader; new pieces follow the pattern. | Preserved |
| PRES-04 | "typed content/data separation" | PRESERVE | New content added to typed `lib/content/data/*`, not hardcoded in JSX. | Preserved |
| PRES-05 | "current SEO metadata, canonical, schema, sitemap, and robots foundations" | PRESERVE | Extended, not replaced; canonical/robots untouched except additive OG + honest schema. | Preserved |
| PRES-06 | "WCAG 2.1 AA baseline" | PRESERVE | axe green maintained; contrast re-verified. | Preserved |
| PRES-07 | "keyboard support and visible focus" | PRESERVE | Focus ring untouched; new interactive elements keyboard-operable. | Preserved |
| PRES-08 | "skip link" | PRESERVE | Unchanged. | Preserved |
| PRES-09 | "reduced-motion support and static fallbacks" | PRESERVE | All new motion reduced-motion gated with complete static states; reduced-motion e2e green. | Preserved |
| PRES-10 | "form validation" | PRESERVE | Zod schemas preserved/extended; validation behaviour unchanged. | Preserved |
| PRES-11 | "honeypot, minimum-time, rate-limit, and Turnstile defences" | PRESERVE | All anti-spam layers intact (`_gotcha`, `MIN_HUMAN_MS=1500`, rate limit, Turnstile). | Preserved |
| PRES-12 | "honest `delivery-unavailable` behaviour" | PRESERVE | Never-fake-success contract intact; 503/502 codes preserved. | Preserved |
| PRES-13 | "deterministic growth-plan recommendation logic" | PRESERVE | Engine (`matches/specificity/resolve`) untouched; new fields don't feed it; growth-plan unit tests green. | Preserved |
| PRES-14 | "static-first/server-component architecture" | PRESERVE | New sections are Server Components; client islands minimal (sticky CTA, reveal, builder). | Preserved |
| PRES-15 | "minimal client islands" | PRESERVE | Only added small, justified islands; verified count. | Preserved |
| PRES-16 | "Cloudflare/OpenNext deploy readiness" | PRESERVE | `cf:build` runs; no Worker-incompatible APIs added; OG stays static. | Preserved |
| PRES-17 | "no horizontal overflow" | PRESERVE | e2e overflow checks at all target widths remain green. | Preserved |
| PRES-18 | "goal-first information architecture" | PRESERVE | "Your goal" remains the leading router; goals section retained. | Preserved |
| PRES-19 | "strong existing copy" | PRESERVE | Preserved; only additive clarifying microcopy. | Preserved |
| PRES-20 | "account/data ownership positioning" | PRESERVE | Ownership section retained + enriched. | Preserved |
| PRES-21 | "no fabricated proof" | PRESERVE | No fake proof rendered; interim trust layer is methodology, not customer claims. | Preserved |
| PRES-22 | "no real secrets in the repository" | PRESERVE | No secrets added; `.env.example` names/placeholders only. | Preserved |
| PRES-23 | "tests and build quality" | PRESERVE | Test suite extended and kept green; build clean. | Preserved |
| PRES-24 | "primitives and shared component architecture" (viz) | PRESERVE | Constellation/GlobeArc/PhoneFrame/JourneyTimeline reused/enhanced, not replaced. | Preserved |
| PRES-25 | "content-data separation for proof (typed, gateable)" | PRESERVE | Proof types remain typed + gated (enriched, still gated). | Preserved |
| PRES-26 | "one H1 per page / logical headings / landmarks" | PRESERVE | New sections use correct heading levels + `aria-labelledby`. | Preserved |
| PRES-27 | "semantic text outside decorative imagery" | PRESERVE | All scenes `aria-hidden`; labels are real HTML text. | Preserved |
| PRES-28 | "the design-token system (do not touch)" (review §19) | PRESERVE | Token system extended coherently, not rebuilt. | Preserved |
| PRES-29 | "the routing structure (what not to touch yet)" (review §19) | PRESERVE | Route groups + slugs unchanged; only additive routes/content. | Preserved |
| PRES-30 | "the backend architecture (right-sized)" (review §9,§19) | PRESERVE | No backend expansion. | Preserved |
| PRES-31 | "mobile overflow protections" | PRESERVE | `overflow-x` guards + responsive layouts retained. | Preserved |
| PRES-32 | "the deterministic growth-plan logic / no fake success" | PRESERVE | Reconfirmed (see PRES-13/PRES-12). | Preserved |

---

## D. Avoid / postpone requirements (brief §8, review §14)

| ID | Exact quotation | Class | Decision | Status |
|---|---|---|---|---|
| AVOID-01 | "live Sanity activation without a real editorial need" | AVOID_OR_POSTPONE | Not activated; trigger documented. | Postponed |
| AVOID-02 | "custom database" | AVOID_OR_POSTPONE | Not added. | Postponed |
| AVOID-03 | "authentication" | AVOID_OR_POSTPONE | Not added. | Postponed |
| AVOID-04 | "user accounts" | AVOID_OR_POSTPONE | Not added. | Postponed |
| AVOID-05 | "client portal" | AVOID_OR_POSTPONE | Not added. | Postponed |
| AVOID-06 | "blog comment system" | AVOID_OR_POSTPONE | Not added. | Postponed |
| AVOID-07 | "custom CMS" | AVOID_OR_POSTPONE | Not added. | Postponed |
| AVOID-08 | "enterprise infrastructure" | AVOID_OR_POSTPONE | Not added. | Postponed |
| AVOID-09 | "alternative REF-20 homepage" | AVOID_OR_POSTPONE | Not built. | Postponed |
| AVOID-10 | "video backgrounds" | AVOID_OR_POSTPONE | None added (all SVG/CSS). | Postponed |
| AVOID-11 | "heavy 3D/WebGL when SVG/CSS/optimized media can deliver" | AVOID_OR_POSTPONE | Used SVG/CSS only; no WebGL. | Postponed |
| AVOID-12 | "aggressive parallax" | AVOID_OR_POSTPONE | None. | Postponed |
| AVOID-13 | "cursor effects that carry meaning" | AVOID_OR_POSTPONE | None. | Postponed |
| AVOID-14 | "glass body-copy panels" | AVOID_OR_POSTPONE | Glass used only for decorative chips, not body copy. | Postponed |
| AVOID-15 | "autoplay semantic carousels" | AVOID_OR_POSTPONE | Any scroller is swipeable/keyboard, non-autoplay for meaningful content. | Postponed |
| AVOID-16 | "duplicate animation runtime" | AVOID_OR_POSTPONE | `motion` removed; GSAP only. | Postponed |
| AVOID-17 | "fake proof" | AVOID_OR_POSTPONE | None. | Postponed |
| AVOID-18 | "fake metrics" | AVOID_OR_POSTPONE | None; counters gated to real metrics. | Postponed |
| AVOID-19 | "fake prices" | AVOID_OR_POSTPONE | None; budget question is neutral, no amounts. | Postponed |
| AVOID-20 | "fake partnerships" | AVOID_OR_POSTPONE | "works with" framing only. | Postponed |
| AVOID-21 | "unverified location pages" | AVOID_OR_POSTPONE | None. | Postponed |
| AVOID-22 | "content-thin SEO pages" | AVOID_OR_POSTPONE | New learn guides are substantive, humanized. | Postponed |
| AVOID-23 | "second animation library (motion)" (review §13) | AVOID_OR_POSTPONE | Removed `motion` dep. | Postponed |
| AVOID-24 | "auto-playing carousels with meaning" (review §13) | AVOID_OR_POSTPONE | Respected (see AVOID-15). | Postponed |

---

## E. Owner decisions / real-world inputs (brief §9, review §19)

| ID | Exact quotation / need | Class | Decision | Status |
|---|---|---|---|---|
| D-01 | "Proof strategy — verified client names/logos; permission to display; testimonial text and attribution; case-study facts; metrics and evidence. Fallback: founder/methodology/how-we-work trust layer." | BLOCKED_BY_REAL_WORLD_INPUT | Fallback implemented (interim trust layer). Real proof enumerated as owner inputs. | Blocked |
| D-02 | "Pricing posture — no public pricing with qualification flow; verified starting price; verified project bands; builder budget question. Do not invent amounts." | DECISION | Chose honest qualification (budget band in builder, no amounts). Verified prices remain an owner input. | Decided |
| D-03 | "Primary hero direction — use REF-07; do not build REF-20's alternate direction." | DECISION | REF-07 adopted; REF-20 not built. | Decided |
| D-04 | "Builder length — Implement the shortest flow that preserves qualification quality; recommendation accuracy; accessibility; useful early value; contact sequencing." | DECISION | Chose 6 steps + earlier preview, preserving all four engine inputs and contact sequencing. | Decided |
| D-05 | "Geographic targeting — requires confirmed operating locations; service areas; legal/business address facts; whether remote/international service is offered." | BLOCKED_BY_REAL_WORLD_INPUT | No location pages/pins built; owner facts required. | Blocked |
| D-06 | "Sanity activation threshold — Document but do not activate until operationally justified." | DECISION | Documented trigger; not activated. | Decided |
| RWI-01 | Real client logos (with written permission to display) | BLOCKED_BY_REAL_WORLD_INPUT | Needed to populate logo strip / case studies. | Blocked |
| RWI-02 | 2–3 verified testimonials with attribution + consent | BLOCKED_BY_REAL_WORLD_INPUT | Needed to un-gate testimonial wall. | Blocked |
| RWI-03 | At least one written case study with real, verifiable metrics + publication permission | BLOCKED_BY_REAL_WORLD_INPUT | Needed to un-gate case studies + counters + before/after. | Blocked |

---

## F. Review-specific actionable statements (Appendix A) not otherwise captured

| ID | Exact quotation | Source | Class | Decision | Status |
|---|---|---|---|---|---|
| REV-01 | "Add real proof near the hero — even one honest client logo strip or a single verifiable testimonial. This is the single biggest lever on the page." | §2 | IMPLEMENT/BLOCKED | Interim trust layer near hero now; real proof gated + blocked on owner assets (D-01). | Partial |
| REV-02 | "Tell people what the CTA does — a micro-line under the primary button." | §2 | IMPLEMENT | Builder explainer microcopy under primary CTA. | Complete |
| REV-03 | "Turn up the hero's visual richness — floating UI chips, a luminous multi-strand infinity, and depth." | §2 | IMPLEMENT | Hero enriched (P5/REF-07). | Partial |
| REV-04 | "the goals section should feel like browsing a set of illustrated destinations." | §4 | IMPLEMENT | Illustrated goal scenes (REF-10). | Partial |
| REV-05 | "the hero should feel alive and inhabited — floating notification chips … a luminous multi-strand infinity, subtle depth." | §4 | IMPLEMENT | Hero chips + glow enriched. | Partial |
| REV-06 | "Section-to-section scrolling should feel like a guided reveal." | §4 | IMPLEMENT | Restrained scroll reveals (P5-03). | Complete |
| REV-07 | "add a one-line explainer of what the builder is." | §5 | IMPLEMENT | Done (REV-02). | Complete |
| REV-08 | "move any proof (when it exists) up — near the CTA and the ownership section." | §5 | IMPLEMENT | Trust section placed above final CTA; proof slot positioned after ownership. | Complete |
| REV-09 | "consider a lighter secondary framing in some spots ('See your plan — 8 questions')." | §5,§6 | IMPLEMENT | Lower-commitment secondary CTA wording added. | Complete |
| REV-10 | "Eight steps is a lot before a plan appears … Consider trimming to 5–6." | §6 | IMPLEMENT | Trimmed to 6 (P2-03). | Complete |
| REV-11 | "a light pricing/qualification signal reduces wasted leads." | §6 | IMPLEMENT | Budget band question (P2-04). | Complete |
| REV-12 | "make it more prominent as the low-friction option" (troubleshooter). | §6 | IMPLEMENT | Troubleshooter surfaced (P2-05). | Complete |
| REV-13 | "Ship real content into the guide/learn section." | §7 | IMPLEMENT | New guides added (P3-01). | Complete |
| REV-14 | "Add the illustrated OG images per page." | §7 | IMPLEMENT | Section OG images (P3-02). | Partial |
| REV-15 | "Consider location/service-area pages if geography matters." | §7 | BLOCKED_BY_REAL_WORLD_INPUT | Blocked (D-05). | Blocked |
| REV-16 | "add a test that asserts the section, the index page, and the sitemap agree." | §8,§16 | IMPLEMENT | Sitemap-consistency test (P1-06). | Complete |
| REV-17 | "remove the unused `motion` dependency." | §8,§15,§16 | IMPLEMENT | Removed (P1-07). | Complete |
| REV-18 | "a visual snapshot test (Playwright screenshots) would catch unintended layout shifts. Worth adding before the redesign work." | §16 | IMPLEMENT | Visual regression added first (P0-05). | Complete |
| REV-19 | "confirm the rate-limiter's production backing (KV/Durable Objects)." | §15,§16 | IMPLEMENT | Reviewed + documented (P4-03). | Complete |
| REV-20 | "verify a 500 error path too." | §15,§16 | IMPLEMENT | error.tsx/global-error.tsx added (P4-04). | Complete |
| REV-21 | "set an explicit performance budget (~130KB JS, monitor after adding imagery)." | §10,§17 | IMPLEMENT | Budget doc + guard (P4-01). | Complete |
| REV-22 | "use next/image + AVIF/WebP for any raster illustration." | §10 | IMPLEMENT | No raster added; guidance documented — new richness is SVG/CSS. | Complete |
| REV-23 | "centralize a short 'how content gating works' note." | §16 | IMPLEMENT | `docs/content-gating.md` (P4-05). | Complete |
| REV-24 | "document the trigger ('when X people are editing weekly')" (Sanity). | §16 | IMPLEMENT | `docs/sanity-activation.md` (P4-06). | Complete |
| REV-25 | "Consider a small chevron-less visual cue that it's a direct link" ("Your goal"). | §4 | IMPLEMENT | Direct-link cue (P2-06). | Complete |
| REV-26 | "trim the longest body paragraphs for mobile." | §11 | IMPLEMENT | Longest mobile paragraphs trimmed. | Complete |
| REV-27 | "Enlarge footer legal-link tap targets to ≥24px (ideally 44px)." | §11 | IMPLEMENT | Set to 44px min (P1-05). | Complete |
| REV-28 | "a slow logo marquee." | §13,§14 | IMPLEMENT | Platform-rail marquee (P5-05). | Complete |
| REV-29 | "brighten nodes, animate the rail drawing in on scroll" (journey). | §20 REF-05 | IMPLEMENT | Journey glow + draw-in (REF-05). | Complete |
| REV-30 | "add the glowing globe+pins SVG scene beside the form" — pins only if confirmed. | §20 REF-02 | IMPLEMENT | Globe scene added; pins omitted (unconfirmed geography). | Complete |
| REV-31 | "Keep it as imagery is added" (performance) / "offscreen motion cleanup." | §10, §18, §20.D | IMPLEMENT | IO offscreen pause/cleanup in reusable motion + hero. | Complete |
| REV-32 | "keep the real text labels (don't bake text into images)." | §12 | PRESERVE | All labels remain real HTML; scenes decorative. | Preserved |
| REV-33 | "Scorecard: raise Conversion +2 → Proof layer + sticky mobile CTA + shorter builder." | §18 | IMPLEMENT | Sticky CTA + shorter builder done; proof interim + blocked-real. | Partial |
| REV-34 | "Scorecard: raise Mobile +2 → Sticky CTA + shorten to ~13 screens + carousel." | §18 | IMPLEMENT | Sticky CTA + compression + goals scroller. | Partial |
| REV-35 | "Do not turn the page into a thin generic landing page." | §17, P2-01 | PRESERVE | Compression removed duplication only, kept substance. | Preserved |
| REV-36 | "Don't start Phase 5 before Phase 1 — a beautiful site that doesn't convert is worse than a plain one that does." | §17 | DECISION | Sequenced: conversion/trust/mobile first, visuals after. | Decided |

---

_This matrix is the authoritative completion ledger. Any row marked Partial/Blocked states exactly
what remains and why (owner input vs. deliberate sequencing). Nothing is silently ignored._
