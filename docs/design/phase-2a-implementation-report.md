# V2 Phase 2A — Implementation Report

**Branch:** `claude/infinite-weblinks-v2-design-yb1yi3`
**Scope:** Core V2 visual primitives (compatibility-first). No production-route migration, no homepage/nav/footer/forms/builder redesign, no PageHeader, no SectionShell change, no deletion of legacy tokens/components. No PR, no deploy.
**Spec:** `docs/design/v2-design-spec.md` · **Phase 1:** `docs/design/phase-1-implementation-report.md`.

---

## 1. What Phase 2A accomplished

- **Corrected the two Phase 1 issues** (signature-gradient contrast, duplicate preview `<h1>`) and added **automated contrast coverage** that reads the real `v2.css` values.
- **Refactored the shared primitives into the V2 source of truth** — Button, Badge, IconTile, Card, BentoCard — with V2 appearance scoped to the V2 theme surfaces, so **every untouched legacy route renders exactly as before**.
- **Added the new V2 primitives** — IconButton, Chip, FilterChip, DeliveryModelBadge.
- **Rebuilt `/design-preview` to use the real production components** (the component source of truth), keeping it internal (noindex/nofollow, off-nav, off-sitemap, one `<h1>`).
- **Added component tests** (Button, IconButton, FilterChip, Card, BentoCard, DeliveryModelBadge) and a contrast test, and validated with lint / typecheck / test / build + Playwright/axe at five breakpoints.

**Governing rule honoured:** V2 styling activates **only** inside `.theme-light` / `.theme-light-alt` / `.theme-night`, via `:global(.theme-*)`-scoped CSS. Legacy surfaces (`theme-dark`/`band`/`band-bright`/`cosmic` and the raw page) are untouched.

---

## 2. Files changed

**Added (new primitives + tests + report):** `IconButton.tsx` + `.module.css`, `Chip.tsx` + `.module.css`, `FilterChip.tsx` + `.module.css`, `DeliveryModelBadge.tsx` (all in `src/components/primitives/`); `src/app/design-preview/FilterChipDemo.tsx`; `tests/unit/v2-contrast.test.ts`, `tests/unit/v2-buttons.test.tsx`, `tests/unit/v2-components.test.tsx`; this report.

**Modified:** `src/styles/tokens/v2.css` (gradient fix + endpoint tokens); `Button.tsx` + `Button.module.css`; `GlowButton.tsx` (deprecation comment only); `Badge.tsx` + `Badge.module.css`; `IconTile.tsx` + `IconTile.module.css`; `Card.tsx` + `Card.module.css`; `BentoCard.tsx` + `Bento.module.css`; `src/app/design-preview/page.tsx` + `design-preview.module.css`; `vitest.config.ts` (test infra: enable `.tsx` tests, React plugin, non-scoped CSS-module class names).

**Untouched:** all production routes, chrome (header/mega-menu/mobile-nav/footer), forms, PlanBuilder, SectionShell, legacy tokens/glows/gradients/themes, and all cosmic components (GlowButton, NodeOrb, Starfield, etc. kept).

---

## 3. Phase 1 corrections made

1. **Signature-gradient contrast (fixed).** See §4.
2. **Duplicate preview `<h1>` (fixed).** The typography specimen no longer renders a second document heading; all type specimens are now non-semantic styled paragraphs. Verified: `/design-preview` has exactly **one `<h1>`** and no heading-level skips (`1,2,2,…`).
3. **Automated contrast coverage (added).** `tests/unit/v2-contrast.test.ts` parses the real `--v2-*` values from `src/styles/tokens/v2.css` (no duplicated palette) and asserts, at minimum: heading/body/muted on paper surfaces; night text on night; white on brand; white across 11 sampled signature-gradient stops; domain inks on white + their tints (and on the 8% Badge-tone tint); status colours on white + their tints; functional borders; and the focus indicator. **65 assertions, all pass.**

---

## 4. Final signature-gradient values & measured minimum contrast

- **Before:** `linear-gradient(120deg, #6d3bff 0%, #f5197e 100%)` — the `#f5197e` stop measured **3.95:1** against white (fails 4.5:1).
- **After:** `linear-gradient(120deg, #6d3bff 0%, #cc1466 100%)`.
- **Measured minimum white contrast across the whole gradient (sampled at 11 points, 0→100%): 5.44:1** (violet endpoint 5.65:1; magenta endpoint 5.44:1). Comfortable margin above 4.5:1.
- White foreground retained (dark ink was **not** an option — it fails against the violet endpoint). Endpoints are also exposed as `--v2-grad-signature-from` / `--v2-grad-signature-to` so the test reads the real stops; the test asserts they match the gradient token.

---

## 5. Components implemented or refactored

**Refactored (V2 source of truth; legacy appearance preserved via theme scoping):**
- **Button** — variants `primary` (solid brand, neutral shadow, no glow, no moving gradient) · `signature` (corrected gradient, static, neutral shadow) · `secondary` (functional border, restrained hover) · `ghost` (no resting fill, subtle hover) · `text` (underlined). Sizes sm/md/lg. States: default/hover/focus-visible/active/disabled + a clean **loading** state (spinner, `aria-busy`, disabled, reduced-motion-safe). 44px normal target; ring never replaced by a resting shadow.
- **Badge** — legacy `variant`/`color` unchanged; new V2 `tone`: neutral · brand · domain · success · warning · danger · information · (+ legacy outline). Optional leading icon.
- **IconTile** — flat V2 treatment (tinted bg + accessible ink glyph, no bloom/glow/gloss) on V2 surfaces; named sizes sm/md/lg added alongside the numeric size; neutral/brand/domain/status via `color`.
- **Card** — legacy variants kept; new V2 variants plain/outlined/tinted/night; the `interactive` modifier now lifts ≤2px with a neutral shadow and **focus-within parity** on V2 surfaces (no coloured glow); `@media (hover:hover)` so touch devices don't get sticky hover.
- **BentoCard** — V2 rendering is flat (light surface, one accent rail, ≤2px neutral hover, no radial wash/glow) with **no visible NodeOrb** (a flat tile replaces it on V2 surfaces; see §6); public API preserved; whole tile clickable when `href` is set; valid focus-visible.

**New:**
- **IconButton** — square icon-only action/link; required accessible name (`label` → `aria-label`); appearances primary/secondary/ghost; sizes sm(40)/md(44)/lg(52); no glow.
- **Chip** — static informational label, optional icon, no click.
- **FilterChip** — native `<button>`, `aria-pressed`, selected state shown by a check glyph **and** fill/border (never colour alone), visible focus.
- **DeliveryModelBadge** — the four exact locked models (We Do the Work · We Bring In an Expert · We Run It End to End · You Run It After), consistent glyphs, accessible domain inks. No models invented; labels not rewritten.

---

## 6. Compatibility behaviour retained

- **Theme-scoped V2 CSS.** All V2 overrides are written as `:global(.theme-light) .x, :global(.theme-light-alt) .x, :global(.theme-night) .x { … }` using semantic + `--v2-*` tokens. On any legacy surface those selectors don't match, so the existing rules win → **legacy appearance is byte-identical.** Verified: axe on `/` and `/contact` shows **0 serious/critical**, no overflow at any breakpoint.
- **Button:** legacy gradient CTA appearance (via `--grad-cta`/`--grad-brand` + glows) unchanged off V2 surfaces; the `brand` variant (0 consumers) retained.
- **Badge:** legacy `soft`/`outline` + `color` path unchanged; tones are opt-in via the new `tone` prop.
- **Card:** legacy `raised`/`glass`/`outline` + the neon interactive glow unchanged off V2 surfaces; `glass` retained for its one consumer (contact page).
- **BentoCard:** the glossy **NodeOrb is still rendered on legacy surfaces**; on V2 surfaces it is hidden by CSS and a flat `.iconV2` tile is shown instead — so the V2 rendering carries no visible NodeOrb, while legacy tiles are unchanged. (`DELIVERY_COLOR` export kept for its 4 consumers.)
- **No production route composition changed.** New/refactored components are exercised only in `/design-preview`.

---

## 7. Deprecated APIs / components still present (not removed)

- **`GlowButton`** — `@deprecated` comment added; **28 consumers untouched**; superseded by `Button` (`primary`/`signature`). Remove at convergence.
- **`Button` `brand` variant** — deprecated in the type doc; 0 consumers; kept for compile-safety.
- **`Card` `glass` variant** — deprecated for V2; kept for the contact page.
- **`NodeOrb`** — legacy component retained (BentoCard still renders it on legacy surfaces; 27 other consumers). Not deleted.
- **Legacy tokens** — all `--glow-*`, `--grad-*` (spectrum/path/constellation), `constellation.css`, and the five legacy theme classes remain (deprecated-for-V2 in comments). Physical removal is the convergence phase.

---

## 8. Preview changes

`/design-preview` is now the component source of truth: hand-built button/badge/chip/icon-tile/card/bento substitutes were removed and replaced with the real components. It shows every Button variant/size, icon-left/right, disabled, loading, link vs button, IconButton (appearance × size, button + link), the signature gradient; Badge tones + delivery-model badges + Chips + selected/unselected + interactive FilterChips; IconTiles (neutral/brand/7 domains/status/sizes/filled); Cards (plain/raised/outlined/tinted/interactive/night, accent rail, non-interactive comparison); and a Bento grid (featured/medium/compact, linked + informational, mobile stacking). Retained: noindex/nofollow, off-nav, off-sitemap, **exactly one `<h1>`**, and correct heading order. Only layout CSS remains local; the examples are all production components.

---

## 9. Tests actually run

| Check | Result |
|---|---|
| `npm run lint` | **pass** |
| `npm run typecheck` | **pass** |
| `npm run test` (Vitest) | **213/213 pass** (13 files) — incl. 65 contrast assertions + Button/IconButton/FilterChip/Card/BentoCard/DeliveryModelBadge component tests |
| `npm run build` (Next 16) | **pass** — `/design-preview` prerendered (static) |
| Playwright + axe (tags incl. `wcag22aa`) | `/design-preview` **0 serious/critical**, `/privacy` **0**, and legacy `/` **0** & `/contact` **0** |

Component tests cover: Button renders `<button>` for actions and a link for `href`, passes button attributes, doesn't leak non-DOM props, renders icons, loading (aria-busy + disabled + spinner suppresses icon), variant/size classes; IconButton accessible name + link/action + disabled; FilterChip button semantics + aria-pressed + selected class + onClick; Card non-interactive is a non-focusable container, interactive uses the requested element with a nested focusable link; BentoCard link vs informational; DeliveryModelBadge exact label.

---

## 10. Responsive & accessibility results

- **No horizontal overflow** at **360 / 390 / 768 / 1024 / 1440px** on `/design-preview`, `/privacy`, `/` and `/contact`.
- **One `<h1>`** on the preview; heading levels `1,2,2,…` — **no skips**.
- **Touch targets:** primary md button = **44px** tall; IconButton md = **44×44**.
- **200% text zoom** (root font-size 200% at 1280px): **no horizontal overflow**.
- **Reduced motion:** preview renders complete under `reducedMotion: reduce`; the button spinner and all V2 hover lifts are guarded by `@media (prefers-reduced-motion: reduce)`; hover enhancements gated by `@media (hover: hover)`.
- **Focus:** visible V2 ring (`--v2-ring`: surface-gap + brand ring) on all interactive V2 controls; interactive Card has focus-within parity with hover.
- **Colour:** axe color-contrast clean after correcting the domain-Badge tone tint (see §12).
- **Legacy pages remain visually functional** and axe-clean.

---

## 11. Screenshots / preview URL

Internal preview route: **`/design-preview`** (noindex/nofollow, off-nav, off-sitemap). Screenshots captured at 360 (full page) and 1440px for the preview and legacy pages during validation.

---

## 12. Known limitations

1. **Domain-Badge tone tint tuned to 8%.** The generic `color-mix(ink 14%, white)` tint fell just under 4.5:1 for operate/discover/retain as small text; lowered to **8%** (worst hue = operate **4.62:1**), now covered by a contrast test. Deeper tints for domain-tone badges are unsafe as small text.
2. **BentoCard keeps NodeOrb in the tree on V2 (hidden).** Because theme context isn't known at server render, the flat V2 tile and the legacy NodeOrb are both rendered and toggled by CSS. The V2 rendering shows no orb, but the NodeOrb element is present-but-hidden; its true removal happens when BentoCard's consumers migrate (convergence).
3. **Transitional chrome still dark.** As in Phase 1, header/footer remain dark; only `/design-preview` (own layout) and the legal template are light. Chrome migrates in Phase 2B.
4. **V2 BentoCard expects an accessible `hue`.** On V2 surfaces the flat tile/eyebrow use `hue` as an ink; pass a V2 domain ink (`var(--v2-domain-*-ink)`), not a legacy neon domain hue, or small-text contrast may fail.
5. **`vitest.config.ts` now processes CSS modules** (non-scoped) and adds the React plugin — a test-infra change; runtime build is unaffected.

---

## 13. Recommended scope for Phase 2B

Shared shells + chrome (the batch that unlocks most routes, still no homepage/tools redesign):

1. **PageHeader** — new light structured page hero (breadcrumb + eyebrow + H1 + lead + CTAs + optional product-mockup aside) to replace `CosmicPageHero`/`PageHero`; built on the Phase-2A primitives.
2. **SectionShell** — make `theme` + `CosmicBackground` opt-in, defaulting to `.theme-light`; de-cosmics all `sections/home/*` in one change.
3. **Chrome** — migrate `SiteHeader`, `MobileNav`, `SiteFooter` to light (resolves the transitional dark-chrome mismatch); keep the mega-menu behaviour + a11y.
4. **Consolidation prep** — start routing V2 pages to `Button`/`Badge`/`Card`/`BentoCard`, and (only when a route is migrated) swap its `GlowButton`/`NodeOrb` usages.
5. **Tests** — extend e2e light-surface + axe coverage to the first migrated router-hub route; keep `/design-preview` current as the swatch/component source of truth.

Explicitly still **out of scope** for 2B: homepage IA redesign, `ServiceDomainTemplate`, conversion tools (Phase 3), and deletion of the legacy layer + galaxy engine (convergence).
