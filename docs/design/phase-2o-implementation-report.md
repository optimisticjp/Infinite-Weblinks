# V2 Phase 2O — Implementation Report

**Scope:** the V2 contact experience — migrate exactly `/contact`, the visual presentation of
`ContactForm`, and contact-specific form-control appearance — plus the contained Phase 2N
verification and API-hardening corrections. Branch `claude/infinite-weblinks-v2-design-yb1yi3`.
Light-first Stripe/Clay system. No other conversion route was migrated; `/growth-plan`,
`/troubleshooter`, `/starting-points/[slug]` and the error/status routes are untouched. The
ContactForm behavioural contract, the `/api/forms/contact` pipeline, `contactSchema`, rate-limiting,
Turnstile, Formspree forwarding, honeypot/elapsed handling and the support-email config are all
unchanged. No root colour-scheme flip, no legacy-component deletion, no deploy, no PR.

---

## 1. What Phase 2O accomplished

- **Completed the Phase 2N corrections**: a genuinely per-service no-JS oracle (all 70), a full
  per-dataset pricing no-JS oracle, hardened `PricingDeliveryCard` (derives its note internally),
  typed `EngagementShapeCard.note`, and corrected centralisation/duration documentation.
- **Centralised the contact presentation content** into a typed, server-safe module.
- **Added the V2 form-control appearance** as an additive, opt-in prop (default legacy) and migrated
  `ContactForm`'s visuals with its behaviour preserved (behavior-for-behavior — see §11).
- **Built `ContactFormSection`** (form-first two-column) and **`ContactPathCard`** (whole-card link).
- **Migrated `/contact`** off the cosmic hero + globe + glass + banner onto PageHeader + the V2 form
  section + ProcessStepList + ContactPathCard + a **new** single reserved-night FinalCtaSection
  (the old route had no `FinalCtaBannerSection`, so this adds a closing CTA rather than replacing one),
  preserving
  the URL, metadata, canonical, ContactPage JSON-LD, goal-prefill query, field ids/order,
  `#contact-form` and the support-email fallback.
- Updated `/design-preview`, extended token-hygiene, and added contact route/form/API and E2E coverage.

## 2. Files changed

**New — components:** `sections/ContactFormSection.tsx` + `.module.css`,
`cards/ContactPathCard.tsx` + `.module.css`, `forms/FormFieldV2.module.css`.
**New — content:** `src/lib/content/data/contact.ts` (exported from the data barrel).
**New — preview:** `app/design-preview/ContactPreviewDemo.tsx`.
**New — tests:** `tests/unit/v2-contact-content.test.ts`, `tests/unit/v2-contact-form-appearance.test.tsx`,
`tests/unit/v2-contact-page.test.tsx`.
**Rewritten / edited:** `app/(convert)/contact/page.tsx` + `contact.module.css` (migrated);
`components/forms/ContactForm.tsx` + `.module.css` (visuals); `components/forms/FormField.tsx`,
`fields/TextField.tsx`, `fields/SelectField.tsx`, `fields/TextAreaField.tsx` (additive appearance);
`components/cards/PricingDeliveryCard.tsx`, `EngagementShapeCard.tsx`, `app/(marketing)/pricing/page.tsx`,
`app/design-preview/page.tsx` (Phase 2N hardening + contact preview);
`tests/e2e/contact.spec.ts`, `tests/e2e/services-system.spec.ts`, `tests/e2e/pricing.spec.ts`;
`tests/unit/v2-pricing-*.test.*`, `v2-token-hygiene.test.ts`, `src/lib/content/data/pricing.ts`,
`docs/design/phase-2n-implementation-report.md`.

## 3. Phase 2N corrections

- **Per-service no-JS oracle** — `services-system.spec.ts` now loops every one of the 70 services
  inside its own article with JavaScript disabled: exact title, the summary via the exact
  `serviceCopy` precedence, the canonical delivery label, every `whatYouGet` item and example tool in
  source order, exactly one matching article id, and correct category ownership — inside the existing
  per-category no-JS test (no extra server boots). The category-level outcomes/clusters/connections/
  goals/forWho/when/next/CTA/fragment assertions are kept.
- **Pricing no-JS oracle** — `pricing.spec.ts` now verifies all six factor titles + blurbs, four
  delivery titles + exact derived cost notes + taglines, three engagement shapes (title/blurb/typed
  note), four quote steps, five FAQs, both hero CTAs, the delivery link, both final CTAs and every
  fragment — driven from the exported data + canonical delivery metadata.
- **`PricingDeliveryCard` hardened** — the independent `costNote` prop is removed; the card derives
  `pricingDeliveryCostNotes[modelKey]` internally, so a caller cannot pair a model with another
  model's note. No fallback, no fragment id, no recommendation badge, no `DELIVERY_COLOR`. `/pricing`,
  the preview, and the component/route tests were updated.
- **`EngagementShapeCard.note`** is now the exported `EngagementShapeNote` union (not `string`), not
  derived by order, no fallback, union unbroadened.
- **Documentation corrected** — `pricing.ts` and the Phase 2N report now state that the five *repeated*
  datasets are centralised while route hero/nav/section-framing/prose/CTA copy stay route-local, that
  no route-local pricing array remains, that no numeric price/rate/range/duration is present, and that
  qualitative duration ("a few minutes") is preserved. `v2-pricing-content.test.ts` asserts both.

## 4. Complete service no-JS result

All 16 per-category no-JS tests pass with the genuinely per-service depth above — every one of the 70
services is verified field-by-field from the server HTML. (See §26 for the sharded totals.)

## 5. Complete pricing no-JS result

The pricing no-JS test passes over every exported dataset (6 factors, 4 delivery models + cost notes +
taglines, 3 engagement shapes, 4 quote steps, 5 FAQs, all CTAs and fragments).

## 6. Pricing component API hardening

`PricingDeliveryCard(modelKey, tagline)` — the note is derived, not passed; a `@ts-expect-error` test
proves `costNote` is not accepted, and a per-key render test proves each card shows only its own note.
`EngagementShapeCard` accepts only the two-value `EngagementShapeNote`. Visible /pricing and preview
output is unchanged.

## 7. Contact content centralisation

`src/lib/content/data/contact.ts` holds the four trust points, three process steps and two alternative
paths (email derived from `supportEmail`, growth plan) plus the closing exploratory-conversation note,
moved verbatim with shared string icon names and mapped tones. Field labels, validation copy, API
messages and success/failure copy stay with the form contract. The decorative globe pins/hub are not
carried over. `v2-contact-content.test.ts` locks the exact copy, counts, order, resolvable icons and
the absence of any response-time/phone/rating/price/office claim or pin-coordinate data.

## 8. Contact page information architecture

PageHeader (`#contact-hero`) → `ContactFormSection` (`#contact-form` inside) → "what happens next"
(`#what-happens-next`) → "other ways to reach us" (`#other-ways`) → FinalCtaSection (`#get-started`).
One dark section (the final CTA); every other band is light/alt.

## 9. PageHeader migration

`SectionShell background="horizon"` → `PageHeader` (id `contact-hero`, light, plain server H1 "Let's
plan your next connected step." = LCP, breadcrumb "Contact", eyebrow "Let's connect", the approved
lead, primary `#contact-form` "Start your message", secondary `mailto:` "Email us directly", trust
note "A real person reads every message. No pressure and no obligation."). Metadata, self-canonical,
ContactPage JSON-LD and indexability are preserved; the globe, SVG arcs, country pins, InfinityMark,
NodeOrb, glass hero and gradient word are gone. No BreadcrumbList JSON-LD was added (none in the
current contract).

## 10. ContactFormSection design

A light `SectionShell` (ariaLabel "Send us your goals") with a two-column layout on ≥60rem — a
dominant raised form Card (keeping the "Send us your goals" heading + required-field note) beside a
quieter guidance column ("What you can expect", the four trust points as flat IconTiles with mapped
tones, and the always-visible support-email fallback). Collapses to one column with the **form first**
in DOM order. No glass card, NodeOrb, InfinityMark, GlobeArc, sticky card, fixed height or dark
surface.

## 11. ContactForm visual migration

Behaviour is preserved **behavior-for-behavior** — the state, JSON payload, response-code handling and
focus contracts are retained (field order/ids, honeypot/Turnstile/elapsed, `safeParse`, `/api/forms/
contact` fetch, status machine, privacy/mailto/success links), while the **presentation markup and
styles were intentionally changed**; the production API/schema/security files remained unchanged (§17).
Visually: `GlowButton` → the shared `Button` loading contract (`type=submit`, `size=lg`,
`loading={status === "submitting"}`, full-width, the existing Send icon and idle/submitting labels);
the InfinityMark + SVG-gradient success decoration → a flat success `IconTile` (keeping `role=status`,
`tabIndex=-1` and the exact success copy/links); and the module rebuilt on V2 semantic status surfaces
(danger/warning/success tints + accessible inks) with no raw hex, glow, glass, gradient or dark input.
`aria-invalid`, `aria-describedby`, the error-summary links and status focus are unchanged.

## 12. Form-control compatibility approach

An **additive `appearance?: "legacy" | "v2"` prop** (default `legacy`) threaded through `FormField` →
`TextField`/`SelectField`/`TextAreaField`. The v2 control styling lives in a **separate
`FormFieldV2.module.css`** (light paper input, semantic hairline border, V2 focus ring, V2 radius,
≥44px height, disabled state, V2 required marker); the shared `.hasError :global(input)` rule supplies
the error border for both. `ContactForm` opts every field into `"v2"`; the growth-plan builder passes
nothing and is byte-identical (proven by test — it contains no `appearance=`). No global form-field
output changed, no field id/semantics changed, and no input implementation was duplicated.

## 13. Contact process presentation

`SectionShell` (`#what-happens-next`, alt, eyebrow "What happens next", plain title "No message
disappears into a void.", the existing lead) renders the shared `ProcessStepList` over the three
centralised steps in source order — one consistent V2 accent, no per-step hue cycling, NodeOrb,
gradient word, featured step, progress semantics, response-time or automated-response claim. It still
truthfully says a person reviews the message (existing approved copy).

## 14. Alternative contact paths

`SectionShell` (`#other-ways`, light, the existing eyebrow/title/lead) renders a `CardGrid` of exactly
two `ContactPathCard`s — email (`mailto:` support address, current body) and build-a-growth-plan
(`/growth-plan`, current body) — followed by the verbatim exploratory-conversation closing note. Each
card is a single whole-card link (no nested link) with an H3, flat IconTile and a visible destination
affordance (the email address for the mailto path). No calendar, phone, live chat, fake availability
or arbitrary featured-first card.

## 15. Final CTA

A new single reserved-night `FinalCtaSection` (`#get-started`): "Ready to send the details?" +
grounded lead, primary `#contact-form` "Start your message", secondary `mailto:` "Email us directly".
No response-time / call / proposal / quote / guaranteed-recommendation promise, no globe/orbit/
InfinityMark/gradient/animation.

## 16. Goal-prefill and option integrity

The `searchParams` Promise contract, the `goal` query, valid-slug prefill, invalid-goal-ignored and
legacy-`subject`-ignored behaviours are preserved (the page reads `params.goal` only). Business-type,
stage and goal options come from `getBusinessTypes`/`getStages`/`getGoals` in source order with their
public labels/values. Verified by unit (source contract) and E2E (`?goal=` valid, `?goal=invalid`,
`?subject=legacy`).

## 17. Form/API invariants preserved

`git diff 5eaef7c..HEAD` over `api/forms/contact/route.ts`, `validation/forms.ts`, `forms/config.ts`,
`formspree.ts`, `rate-limit.ts`, `rate-limit-adapter.ts`, `turnstile.ts` and `Turnstile.tsx` returns
**zero files** — the production pipeline is untouched. The defence-in-depth order (JSON → schema →
honeypot → timing → rate-limit → Turnstile → delivery-config → Formspree → truthful failure → success
only after `delivery.delivered`) and the response codes are asserted by `v2-contact-page.test.tsx`.

## 18. Metadata and ContactPage JSON-LD preservation

Title "Contact us", the exact META_DESCRIPTION, canonical `/contact`, indexable `pageMetadata`, and a
single `contactPageJsonLd` node (Organization + support-email ContactPoint + areaServed +
availableLanguage) are preserved. No BreadcrumbList/LocalBusiness/PostalAddress/telephone/Review/
rating/response-time/office was added; the visible content does not contradict the JSON-LD.

## 19. Fragment results

`#contact-form` (the real `<form>` id), `#what-happens-next` and `#other-ways` are preserved;
`#contact-hero` and `#get-started` are added. Each appears exactly once with visible meaningful
content, clears the sticky header on hash navigation, and works from the server-rendered page. No
duplicate or hidden empty target.

## 20. No-JavaScript result and explicit submission limitation

With JavaScript disabled the server response contains the H1, the approved lead, both PageHeader
destinations, the complete form (all eight fields; **all three selects' options — exact value, label
and order against the source datasets, including the placeholder — asserted exhaustively** in Phase
2P, not merely a non-empty count; required/optional labels), the
privacy link, the support-email fallback, the four trust points, the three process steps, both
alternative paths, the final CTA and every fragment target — and the `mailto:` fallback is usable.
**The page content and form fields are server-rendered; the form's fetch-based submission requires
JavaScript; direct email is the no-JS fallback.** No progressive-enhancement API rewrite was attempted
in Phase 2O, and no fake no-JS success route was added.

## 21. Content-integrity results

All contact copy is verbatim from the centralised module; nothing was invented. The only editorial
addition is the guidance-column heading "What you can expect" — a neutral frame over the existing
approved trust points, not a claim.

## 22. Legacy-route safety

`/growth-plan` (+ `PlanBuilder`, engine, rules — and its form fields stay legacy), `/troubleshooter`
(+ `GrowthTroubleshooter`), `/starting-points/[slug]` and every other route are untouched. No legacy
component was deleted: `CosmicPageHero`, `CosmicBackground`, `GlobeArc`, `InfinityMark`, `NodeOrb`,
`GlowButton` and the Card `glass` variant all remain for their other consumers; only `/contact` and
`ContactForm` stopped importing them.

## 23. Client-JavaScript, canvas and presentation-cost changes

Recorded structurally (no invented byte/LCP/CLS/Lighthouse figures):

| | Before (`/contact`) | After (`/contact`) |
|---|---|---|
| Decorative canvas | 1 (`background="horizon"` → CosmicBackground → StarfieldLazy → client `Starfield` `<canvas>`) | **0** (asserted in E2E) |
| CosmicBackground / StarfieldLazy path | present | **none** |
| GlobeArc / InfinityMark / NodeOrb | present | **none** |
| Decoration-only client boundary | the starfield lazy import | **none** |
| Necessary client boundaries | ContactForm (interaction), Turnstile (conditional) | **unchanged** — ContactForm + Turnstile only |
| Page framing | server-rendered | server-rendered |
| New dependency / external host | — | none |
| Route build output | `ƒ` (dynamic — reads `searchParams`) | `ƒ` (unchanged) |

Lighthouse was not run in this environment; no LCP/CLS/byte figures are invented.

## 24. Tests actually run

`npm run lint` (0 problems), `npm run typecheck` (pass), `npm run test` (**1547 unit across 56
files**, 0 fail), `npm run build` (pass; `/contact` `ƒ` dynamic), `npm run cf:build` (pass; worker
saved). E2E below.

## 25. cf:build result

`npm run cf:build` passes — the OpenNext Cloudflare bundle builds and the worker is saved to
`.open-next/worker.js` (exit 0).

## 26. Complete E2E result (every failure and rerun)

The full Playwright + axe suite ran once as four deterministic shards (`--shard=X/4 --workers=4`),
each test executed exactly once, against the final build:

| Shard | Command | Result |
|---|---|---|
| 1 | `npx playwright test --shard=1/4 --workers=4` | 156 passed |
| 2 | `npx playwright test --shard=2/4 --workers=4` | 155 passed |
| 3 | `npx playwright test --shard=3/4 --workers=4` | 155 passed |
| 4 | `npx playwright test --shard=4/4 --workers=4` | 155 passed |
| **Total** | | **621 / 621 passed, 0 failed, 0 flaky** |

**Failures found and fixed during the run** (recorded, not hidden): the first full run surfaced two
issues, both fixed before the clean run above. (a) `audit-fixes.spec.ts` asserted the OLD GlowButton
focus-ring colour on the `/contact` submit — updated to the migrated V2 Button ring. (b) An
inline-field-error contrast failure on `/design-preview` (the legacy `--danger` #ff4d6d pink at
3.21:1) — the v2 form appearance now renders inline errors in `--v2-danger`; axe green. A separate,
pre-existing flaky failure in `article-case-detail.spec.ts` (the naive `setViewportSize` + immediate
overflow read — the documented pre-reflow race, unrelated to this phase) was migrated to the
stable-layout helper, matching prior phases. Targeted reruns confirming each fix are not merged into
the 621 total.

Targeted reruns during development (not merged into the totals above): the rewritten
`services-system` per-service no-JS oracle and the extended `pricing` no-JS oracle were smoke-run
(17/17) before the full run; the migrated `contact.spec.ts` was smoke-run before the full run.

## 27. Responsive, zoom, form-flow and accessibility results

- **No overflow** on `/contact` at all eight widths (320–1440) via the stable-layout helpers.
- **One H1** ("Let's plan your next connected step."); heading hierarchy never jumps more than one
  level (h1 → h2 form / process / paths / CTA → h3 guidance / step titles / path titles).
- **Form-first on mobile**: at 390px the form sits above the process section and is **not** inside a
  sticky/fixed card.
- **No canvas**, **no horizontal rail**, no hidden content.
- **Form flow**: empty submit → ordered accessible error summary, focus moved to it, a summary link
  focuses its exact field, `aria-invalid` set; a valid unconfigured submission surfaces the truthful
  delivery-unavailable notice with the support email (never success); mocked delivered → success
  panel; mocked generic-failure / rate-limit / turnstile-failed → truthful alert; the submit button
  disables while submitting; support email visible throughout. No external Formspree/Cloudflare call.
- **Fragment clearance** for every mid-page fragment; **≥44px** submit target; **visible focus** ring;
  **reduced motion** and **200% root text** hold the layout with one H1.
- **Axe**: 0 serious/critical on `/contact` (wcag2a/2aa/21a/21aa/22aa); the other tiers stay green in
  the full run.

## 28. Preview URLs and screenshots

- `/design-preview` — Phase 2O contact block: trust points (flat IconTiles, mapped tones),
  `ProcessStepList` over the real steps, `ContactPathCard` for email + growth plan, and
  `ContactPreviewDemo` (V2 form controls, a long wrapping error, the success and delivery-unavailable
  panels) — preview-only ids, no API call, no fabricated enquiry/success/response-time/channel. Still
  `noindex, nofollow`, off-nav, off-sitemap. The real integrated ContactForm is previewed at
  `/contact`.
- No screenshots attached; the pages render in any local `npm run start` preview.

## 29. Known limitations

- The contact form's submission is a client-side JSON fetch; it **requires JavaScript**. The no-JS
  fallback is direct email (the `mailto:` support link, visible in every relevant place). No
  progressive-enhancement server-action fallback was built (out of scope for a presentation phase).
- Per-route "First Load JS" is not printed by this Next build configuration, so §23 is structural
  (canvas/client-boundary counts), not byte deltas; Lighthouse/LCP/CLS were not run.
- The wider production Turnstile-configuration policy (a site key without a server secret leaves
  verification effectively skipped) is a pre-existing **deployment-hardening** concern, not a Phase 2O
  change — recorded here, not addressed.
- The legacy cosmic components remain for `/growth-plan`, `/troubleshooter`, `/starting-points/[slug]`
  and the section registry until their own phases.

## 30. Recommended scope for Phase 2P

**`/growth-plan` only.** Migrate the builder route's presentation (PageHeader + light V2 surfaces +
FinalCtaSection) while keeping the **`PlanBuilder` client component, its multi-step state machine, the
growth-plan engine + rules, the `/api/forms/growth-plan` contract, `growthPlanSchema`, the shared
form-field primitives (now opting into `appearance="v2"`), rate-limiting, Turnstile and the plan
reveal** entirely intact — a presentation migration around an unchanged builder. Keep
`/troubleshooter`, `/starting-points/[slug]`, the root colour-scheme flip and any broad
legacy-component / galaxy-engine deletion out of scope until their own phases.
