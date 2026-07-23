# V2 Phase 2P — Implementation Report

**Scope:** the V2 Growth Plan Builder experience — migrate exactly `/growth-plan`, the visual
presentation of `PlanBuilder` and `PlanReveal`, and the builder-specific V2 appearances for
`OptionCards`, `Stepper` and `ProgressChecklist` — plus a contained set of Phase 2O corrections and
the truthfulness corrections the builder needed. Branch `claude/infinite-weblinks-v2-design-yb1yi3`,
reviewed base `b332f26`. Light-first Stripe/Clay system.

No other route was migrated: `/troubleshooter`, `/starting-points/[slug]`, the remaining conversion
routes and the error/status routes are untouched. The Growth Plan **behavioural contract** is
unchanged — the four steps, `PlanBuilder` state, step validation, Back/Continue behaviour, focus
management, the client-side deterministic resolution, `growthPlanRuleSet`, the engine, the
`GrowthPlanResult` shape, Build-again/reset, `/api/forms/growth-plan`, `growthPlanSchema`,
rate-limiting, honeypot, elapsed-time, Turnstile, Formspree forwarding, the delivery-unavailable /
delivery-failed behaviour and the support-email config all remain as they were. No new
recommendations, free-form output, accounts, persistence, local storage, sessions, prices, numeric
claims, guarantees, proof, testimonials, ratings, partnerships or autoresponder were added. The
`/growth-plan` URL, canonical, `noindex, follow`, every field id and API JSON key, the rule
ids/precedence, the recommendation ordering and the API response codes are unchanged. No root
`body`/`themeColor`/`colorScheme` flip, no broad legacy-component deletion, no deploy, no PR.

---

## 1. What Phase 2P accomplished

- **Completed the contained Phase 2O corrections** (§A): report accuracy, the V2 invalid-control
  border, and an exhaustive no-JS contact-options oracle — already landed in the Phase 2O work and
  re-verified here.
- **Corrected the growth-plan delivery promise** so the copy matches what the tool actually does
  (§B, §C): the plan is generated **client-side and shown on screen**; the optional email form is a
  **review request**, not a "we've emailed you a copy" delivery. The hero, the follow-up panel, the
  success state and the `PlanReveal` framing were all re-worded to be truthful, and the same false
  "yours to keep" claim was removed from `llms.txt`.
- **Centralised the growth-plan presentation content** into a typed, server-safe module (§D).
- **Migrated `/growth-plan`** off the cosmic hero + starfield onto `PageHeader` (server H1 = LCP) →
  the builder on a light `SectionShell` → a "what your plan can include" grid → the single reserved
  dark `FinalCtaSection` (§E, §F, §K, §L).
- **Migrated `PlanBuilder`'s presentation** to V2 (§G, §H, §I): `GlowButton` → the shared `Button`
  (with its loading contract), the five follow-up fields opted into the V2 control appearance, the
  `InfinityMark` success mark replaced by a flat success `IconTile`, and the module rewritten on V2
  tokens (no sticky sidebar, no gradient, no `--domain-*` / `--orange` / `--danger` /
  `--hairline-strong`).
- **Rebuilt `PlanReveal`** on flat V2 cards (§J): no `NodeOrb`, `ConnectorPath`, gradient word or
  featured-phase glow; per-phase wayfinding via accessible V2 domain ink.
- **Migrated the builder primitives** `OptionCards`, `Stepper` and `ProgressChecklist` directly to V2
  (their sole runtime consumer is `PlanBuilder`).
- **Updated `/design-preview`**, extended token-hygiene, and added growth-plan content / builder /
  PlanReveal / route / API-safety unit coverage and a full E2E rewrite.

## 2. Files changed

**New — content:** `src/lib/content/data/growth-plan.ts` (exported from the data barrel).
**New — components:** `components/cards/PlanIncludeCard.tsx` + `.module.css`.
**New — preview:** `app/design-preview/GrowthPlanPreviewDemo.tsx`.
**New — tests:** `tests/unit/v2-growth-plan-content.test.ts`, `tests/unit/v2-builder-primitives.test.tsx`,
`tests/unit/v2-plan-reveal.test.tsx`, `tests/unit/v2-growth-plan-truthful.test.ts`,
`tests/unit/v2-growth-plan-api-safety.test.ts`, `tests/unit/v2-phase-2o-corrections.test.ts`.
**Rewritten / edited:** `app/(convert)/growth-plan/page.tsx` + `growth-plan.module.css` (migrated);
`components/builder/PlanBuilder.tsx` + `.module.css` (visuals + truthful follow-up);
`components/builder/PlanReveal.tsx` + `.module.css` (rebuilt);
`components/primitives/OptionCards.tsx` + `.module.css`, `Stepper.module.css`,
`ProgressChecklist.module.css` (V2 appearance); `components/forms/FormField.tsx`,
`components/forms/FormFieldV2.module.css` (V2 invalid-control border, Phase 2O correction);
`app/design-preview/page.tsx`; `app/llms.txt/route.ts` (truthfulness); `tests/e2e/growth-plan.spec.ts`;
`tests/e2e/contact.spec.ts`, `tests/unit/v2-contact-form-appearance.test.tsx`,
`tests/unit/v2-token-hygiene.test.ts`; `docs/design/phase-2o-implementation-report.md`.

## 3. Phase 2O corrections (§A)

- **Report accuracy** — `phase-2o-implementation-report.md` corrected: the closing CTA is a *new*
  single reserved-night `FinalCtaSection` (the old route had none); the ContactForm migration is
  behaviour-for-behaviour with markup/styles intentionally changed; the no-JS options oracle asserts
  all three selects' options — exact value, label and order — exhaustively.
- **V2 invalid-control border** — `FormFieldV2.module.css` gained a `.hasError` border on the
  wrapped control (using `--v2-danger`), and `FormField.tsx` applies **either** the v2 or the legacy
  error class (never both) so there is no cross-module specificity tie and no `!important`.
- **Exhaustive contact no-JS options** — `contact.spec.ts` compares every option in all three
  selects (business type, current stage, main goal) — exact value, label and order, including the
  leading "Select an option" placeholder — against the real source datasets.

## 4. Truthfulness corrections (§B, §C)

The plan lives only in React state; it is never stored, downloaded or emailed to the visitor. The
copy now says exactly that:

| Where | Before | After |
|---|---|---|
| Hero lead | "…the plan is yours to keep." | "No account needed — your plan appears on screen." |
| Email panel heading | "Get this plan by email" | **"Ask us to review this plan"** |
| Email panel support | "Want a copy to keep…yours either way." | **"The plan above is already yours to read on screen. Add your details if you would like a real person to review it and reply by email with a practical next step."** |
| Submit label | "Send my plan by email" | **"Send my plan for review"** |
| Success heading | "Thanks, your plan is on its way." | **"Thanks, your plan was sent to our team."** |
| Success body | "We've sent this plan to your email…" | **"A real person will review it and reply by email with a practical next step. The plan above remains available on screen."** |
| PlanReveal intro | "…the same growth journey we use with everyone…" | reusable-model framing: recommendations mapped from a reviewed framework used across many businesses; which stages appear depends on the answers; not every business needs every stage; a sensible starting point, not a guarantee |
| PlanReveal outcomes heading | "What you'd end up with" | **"What this plan is designed to help you build"** |
| PlanReveal tools | — | added: **"Example tools are illustrative. No partnership or endorsement is implied."** |
| `llms.txt` | "…the plan is yours to keep either way." | "No sign-up is required, and your plan appears on screen right away. There is no obligation." |

A cross-surface unit sweep (`v2-growth-plan-truthful.test.ts`) fails the build if any of the old
"keep / on its way / emailed the plan / same growth journey" phrasings reappears in the rendered copy.

## 5. Content centralisation (§D)

`src/lib/content/data/growth-plan.ts` holds only route **presentation** data: the three hero trust
points, the five-item plan-preview list, and the six `PlanIncludeItem`s (title, body, shared icon
name, wayfinding tone). `STEP_META`, the validation messages, the state-machine labels, the rule
data, the API messages and the generated result content stay with the builder / engine / API — they
are behaviour-bound, not repeated presentation. The module docstring records the truthfulness
constraint so no keep/download/email-copy claim is authored there.

## 6. Route migration (§E, §K, §L, §P)

`/growth-plan` is now `PageHeader` (server H1 = LCP, breadcrumb, eyebrow, truthful lead, two CTAs,
trust note) → the builder on a light `SectionShell` (`id="builder"`) → a "what your plan can include"
grid of `PlanIncludeCard`s on a light `SectionShell` (`id="what-your-plan-includes"`) → the single
reserved-night `FinalCtaSection` (`id="get-started"`, builder anchor + `/contact` fallback). The
metadata is byte-preserved: title, description, `robots: { index: false, follow: true }` and the
self-canonical `canonical("/growth-plan")`. No cosmic hero/starfield, `ConnectorPath`, `InView`,
`FloatingCards`, `InfinityMark`, `NodeOrb`, glass or fake chart remains.

## 7. Builder presentation (§G, §H, §I)

- **Controls** — `GlowButton` → the shared `Button`: Back is `secondary`, Continue is `primary`, and
  the follow-up submit uses the `Button` `loading` contract (spinner, `aria-busy`, disabled, icons
  hidden) as a full-width action.
- **Fields** — the five follow-up fields (name, email, business, website, message) opt into
  `appearance="v2"`.
- **Success** — the luminous `InfinityMark` is replaced by a flat success `IconTile` (Check glyph) on
  the V2 success ink; it stays an accessible `role="status"` live region with focus management.
- **Styling** — `PlanBuilder.module.css` rewritten on V2 tokens: the sticky sidebar is gone (the
  progress rail is a plain in-flow column, hidden on narrow screens where the Stepper carries
  progress), and the gradient/`--domain-*`/`--orange`/`--danger`/`--hairline-strong` are replaced —
  the review-request panel uses the brand tint + hairline, the notice uses the V2 warning tokens, and
  the required marker uses the V2 brand-strong ink.

## 8. PlanReveal rebuild (§J)

Flat V2 cards on paper. The roadmap phases, the capability/tool sections, the outcomes and the "how
we'd help" note are ordinary bordered/tinted panels; per-phase wayfinding colour is an accessible V2
domain ink resolved through the domain bridge (`--phase-ink`) for the top accent, the eyebrow, the
bullet and the "Recommended starting point" tag; icons render in flat `IconTile`s; outcomes use the
V2 success tokens. `NodeOrb`, `ConnectorPath`, the gradient hero word and the featured-phase bloom
are gone. **Contract preserved:** the `growth-plan-result` test id, every result array (start-here /
connect-next / add-later / relevant capabilities / example tools / expected outcomes / how-we-help),
the recommendation ordering, the "Recommended starting point" marker on the first start-here item, and
the rule that the internal `matchedRuleId` is **never** rendered.

## 9. Builder primitives (§G)

A JSX-consumer census confirmed `PlanBuilder` is the **sole** runtime consumer of `OptionCards`,
`Stepper` and `ProgressChecklist` (the homepage `GrowthPlanPreview` is a separate static panel), so
they were migrated directly to V2 (no additive appearance prop needed). `OptionCards` maps a single
wayfinding tone through the domain bridge (no palette cycle), shows the checked state with a checked
radio **and** a tick mark (never colour alone), ties its error to every radio via `aria-describedby`,
and uses `--v2-danger` for its error text. `Stepper` and `ProgressChecklist` keep their ordered-list
semantics, `aria-current`, and visible textual status words (completed / current / Done / In progress
/ To do).

## 10. Preview, hygiene and tests (§Q, §S, §T)

- **Preview** — a "Phase 2P · Growth plan builder" section on `/design-preview` shows the Stepper, the
  ProgressChecklist, the OptionCards (selected + error), the V2 follow-up controls and the
  review-request success / delivery-unavailable panels (new `GrowthPlanPreviewDemo`, preview ids
  only), the `PlanIncludeCard` grid, and `PlanReveal` from an illustrative fixture — so a human and
  the axe scan can see the full result view.
- **Token hygiene** — the seven V2 growth-plan modules (OptionCards, Stepper, ProgressChecklist,
  PlanBuilder, PlanReveal, PlanIncludeCard and the route module) are added to the strict V2
  detail-module hygiene set.
- **Unit** — content shape; builder-primitive semantics + V2 appearance; PlanReveal render (every
  array shown, one recommended item, truthful framing, disclaimer, empty-section omission, no rule
  id); the truthful-copy source contract + a cross-surface false-claim sweep; and the API-safety
  source-lock (§11). The Phase 2O appearance test is updated: the builder now intentionally opts its
  five follow-up fields into the V2 control appearance.

## 11. Engine / rule / API invariants (§O)

The protected files are **byte-for-byte unchanged** (verified `git diff` against the reviewed base is
empty): `api/forms/growth-plan/route.ts`, `lib/growth-plan/engine.ts`, `rules.ts`, `types.ts`,
`lib/validation/forms.ts`, `lib/forms/config.ts`, `formspree.ts`, `rate-limit.ts`,
`rate-limit-adapter.ts`, `turnstile.ts`, and `components/forms/Turnstile.tsx`. A source-lock unit
test (`v2-growth-plan-api-safety.test.ts`) additionally pins the route's contract: `growthPlanSchema`
validation, the deterministic recompute, all six response codes, the honeypot + human-timing +
rate-limit + Turnstile gates, and the support-inbox forwarding of the recommendation summary +
`matchedRuleId`. The `matchedRuleId` is forwarded to the team's inbox only — it is never returned to
the client (the delivered response is exactly `{ok:true}`) and never rendered in the UI.

## 12. No-JS contract (§N)

With JavaScript disabled, `/growth-plan` still serves the hero (H1 + truthful lead + trust points),
the first-step question and its option radios (exact values + order from the real dataset), the whole
"what your plan can include" grid (all six titles + bodies), and the final CTA with its `/contact`
fallback; every section fragment resolves exactly once. The multi-step flow and the on-screen plan are
interactive by nature and require JavaScript — the no-JS path stays understandable and offers the
contact route.

## 13. Responsive, zoom, reduced motion, accessibility (§R, §U)

The E2E suite checks `/growth-plan` for no horizontal overflow at eight widths (320 → 1440), holds
its width with the root text at 200% and under reduced motion, and runs axe (serious/critical) on the
first step, the last step, the generated plan, the mocked review-sent success, and the real
delivery-unavailable state. The follow-up branches (delivered / generic failure / rate-limit /
turnstile-failed / submitting-disabled) are exercised by **mocking** the API response, so no external
Formspree/Cloudflare call is made; the real unconfigured server continues to surface the truthful
delivery-unavailable notice rather than a fake success.

## 14. Validation

`npm run lint`, `npm run typecheck`, `npm run test` (**1731 unit tests, 62 files**), `npm run build`
and `npm run cf:build` (OpenNext → Cloudflare Worker bundle, no deploy) all pass. The protected
growth-plan engine / rule / API / forms files are **byte-identical to the reviewed base `b332f26`**
(`git diff` empty). The `/growth-plan` E2E spec (29 tests: flow, validation, plan, build-again,
mocked states, no-JS, axe on first/last/plan/success/delivery-unavailable, no overflow at 8 widths,
200% text, reduced motion) passes, and the full Playwright suite is green.

## 15. Spec section coverage (A–V)

| § | Item | Status |
|---|---|---|
| A | Phase 2O corrections (report, V2 error border, exhaustive contact no-JS options) | ✅ §3 |
| B | Correct growth-plan delivery promise (follow-up copy) | ✅ §4, §7 |
| C | Correct hero "keep" + PlanReveal framing + tools disclaimer | ✅ §4, §8 |
| D | Centralise growth-plan content | ✅ §5 |
| E | Migrate PageHeader | ✅ §6 |
| F | V2 builder section (no sticky sidebar) | ✅ §6, §7 |
| G | V2 builder primitives (OptionCards / Stepper / ProgressChecklist) | ✅ §9 |
| H | Migrate PlanBuilder presentation | ✅ §7 |
| I | Migrate follow-up form (V2 controls) | ✅ §7 |
| J | Rebuild PlanReveal | ✅ §8 |
| K | PlanIncludeCard + what-your-plan-includes | ✅ §6 |
| L | Final CTA | ✅ §6 |
| M | Fragments (`#builder` kept; retired `#gp-heading` had no consumer) | ✅ §6, §12 |
| N | No-JS contract | ✅ §12 |
| O | Engine / rule / API invariants (git diff proof) | ✅ §11 |
| P | Metadata / SEO (noindex,follow + self-canonical preserved) | ✅ §6 |
| Q | CSS / token hygiene | ✅ §10 |
| R | Performance (server H1 = LCP; heavy motion removed; no CLS/overflow) | ✅ §6, §13 |
| S | Design preview | ✅ §10 |
| T | Unit tests (content / builder / PlanReveal / truthful / API-safety) | ✅ §10, §11 |
| U | E2E / accessibility | ✅ §13 |
| V | Nine commits | ✅ §16 |

## 16. Commits

1. Phase 2P(1) — Phase 2O corrections (report + V2 invalid-control border + exhaustive contact no-JS options)
2. Phase 2P(2) — centralise growth-plan content
3. Phase 2P(3) — V2 builder primitive appearances (OptionCards / Stepper / ProgressChecklist)
4. Phase 2P(4) — migrate `/growth-plan` PageHeader + builder shell + PlanIncludeCard
5. Phase 2P(5) — migrate PlanBuilder controls + truthful follow-up states
6. Phase 2P(6) — rebuild PlanReveal on V2 with a truthful reusable-model framing
7. Phase 2P(7) — preview the builder pieces, extend token hygiene, add unit coverage
8. Phase 2P(8) — rewrite the growth-plan E2E and lock the API contract
9. Phase 2P(9) — this report + full validation

## 17. Recommended next scope (Phase 2Q)

**`/troubleshooter` only.** It is the last cosmic conversion route. The remaining
`/starting-points/[slug]`, Turnstile production-policy hardening, a new email architecture,
persistence/accounts, the root colour-scheme flip and any broad legacy-component / galaxy-engine
deletion are explicitly **out of scope** and should not begin as part of this migration.
