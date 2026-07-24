# V2 Phase 1 — Implementation Report

**Branch:** `claude/infinite-weblinks-v2-design-yb1yi3`
**Scope:** Foundation + canary only (compatibility-first). No homepage redesign, no nav/footer rebuild, no conversion-tool migration, no API/form/business-logic/content/SEO/route changes, no deletion of legacy tokens or cosmic components. No PR, no deploy.
**Spec:** `docs/design/v2-design-spec.md` (status: Approved for phased implementation).

---

## 1. What this phase accomplished

- **Locked the specification** — status → *Approved for phased implementation*; all 10 open questions resolved to the approved decisions; accessibility target raised to **WCAG 2.2 AA**.
- **Added an additive V2 token foundation** (`src/styles/tokens/v2.css`) under a `--v2-*` namespace, plus three opt-in theme classes (`.theme-light`, `.theme-light-alt`, `.theme-night`) that map the existing semantic tokens the shared components already read.
- **Measured** (not assumed) the contrast of every token pair and tuned values until all pass WCAG 2.2 AA.
- **Migrated one canary** — the shared legal template (`LegalPageView`) to the light system, covering `/privacy`, `/terms`, `/cookies`, `/refunds`, `/accessibility`.
- **Built a temporary internal foundation preview** at `/design-preview` (`noindex,nofollow`, not in sitemap/nav).
- **Left every other route byte-for-byte unchanged** — no legacy token, class, or component was removed or redefined.

---

## 2. Migration-impact census (run before any style edit)

Consumers counted across `src/**/*.{css,tsx}`:

| Surface | Consumers | Phase-1 treatment |
|---|---|---|
| Semantic theme vars (`--surface`, `--text-heading`, `--hairline`, `--link`, …) | 46–60 files each | **Re-theming lever** — V2 classes set these names; nothing edited in consumers |
| `--glow-*` tokens | 10 files | **Retained** (deprecated in comment; removed at convergence) |
| `--grad-*` tokens | 15 files | **Retained** (deprecated; removed at convergence) |
| `.theme-dark` / `.theme-band` / `.theme-band-bright` / `.theme-statement` / `.theme-cosmic` | 22 / 26 / 11 / 1 / 10 applications | **All retained** — untouched routes depend on them |
| `constellation.css` tokens/classes | 49 files | **Retained** (file untouched) |

**Conclusion:** the semantic-token contract means a surface goes light by swapping its wrapper class — no consumer edits. Because the V2 layer is purely additive (`--v2-*` namespace + new class names), **no compatibility alias renames were required**; the "compatibility layer" is simply the entire legacy token set + the five legacy theme classes + the dark `:root` defaults + the dark `body`, all left intact.

---

## 3. Files changed

**Added**
- `src/styles/tokens/v2.css` — V2 foundation tokens + `.theme-light` / `.theme-light-alt` / `.theme-night`.
- `src/app/design-preview/page.tsx` + `design-preview.module.css` — internal foundation preview (temporary).
- `docs/design/phase-1-implementation-report.md` — this report.

**Modified**
- `src/styles/globals.css` — import `tokens/v2.css` last (additive).
- `docs/design/v2-design-spec.md` — status + resolved decisions (§15) + WCAG 2.2.
- `src/components/routes/LegalPageView.tsx` — `theme-cosmic` → `theme-light`; removed the decorative `.wash` element; doc comment updated.
- `src/components/routes/LegalPageView.module.css` — removed `.wash`; `.page` now fills the light canvas (`min-height`); eyebrow → `--link` (brand); review note → `--v2-warning`/`--v2-warning-tint`.

**Not touched (deliberately):** `layout.tsx` root `colorScheme`/`themeColor`/`body`, `colors.css`, `effects.css`, `constellation.css`, `spacing.css`, `typography.css`, chrome (`SiteHeader`/`MobileNav`/`SiteFooter`), all primitives, all cosmic viz, forms, APIs, content data, `sitemap.ts`, `robots.ts`.

---

## 4. Token values introduced

All in `src/styles/tokens/v2.css` (raw hex/rgba confined to this central token file).

| Group | Tokens (value) |
|---|---|
| Paper | `--v2-paper #ffffff` · `--v2-paper-2 #f6f7f9` · `--v2-paper-3 #eef1f5` |
| Ink | `--v2-ink-strong #0a1f3c` · `--v2-ink-body #38415a` · `--v2-ink-muted #5f6b85` · `--v2-ink-faint #767e93` (disabled/decorative only) |
| Night | `--v2-night-950 #0a1124` · `--v2-night-900 #111a33` · `--v2-night-800 #1b2547` · `--v2-on-night #f4f7ff` · `--v2-on-night-muted #b9c2da` |
| Lines | `--v2-line rgba(10,31,60,.12)` (decorative) · `--v2-line-strong #7d8698` (functional/input) · `--v2-line-night rgba(255,255,255,.14)` · `--v2-line-night-strong rgba(255,255,255,.34)` |
| Brand | `--v2-brand #5b3df5` · `--v2-brand-strong #4a2fd6` · `--v2-brand-tint #eeeafe` · `--v2-on-brand #ffffff` · `--v2-grad-signature` (violet→pink, CTAs/rare only) |
| Domain (ink/tint/line ×7) | strategy `#6d28d9`/`#f1ecfe` · build `#1d4ed8`/`#e8effd` · discover `#0e7490`/`#e2f5fa` · convert `#be185d`/`#fdeaf1` · operate `#c2410c`/`#fdeee3` · retain `#127a39`/`#e7f6ec` · ai `#0f766e`/`#e3f4f2` |
| Status | success `#127a39`/`#e7f6ec` · warning `#9a4a07`/`#fdeee3` · danger `#be123c`/`#fdeaef` · info `#1d4ed8`/`#e8effd` |
| Shadows | `--v2-shadow-xs/sm/md/lg/card-hover` (soft neutral, replace glows) |
| Radii | `--v2-radius-sm 8` · `md 12` · `lg 16` · `xl 24` · `pill 999` |
| Focus | `--v2-ring` = surface-colour gap + brand ring |
| Type usage | `--v2-fw-display/heading 700` · `--v2-fw-body` · `--v2-fs-display clamp(2.25rem,5vw,3.75rem)` |
| Motion/rhythm | aliases of existing `--ease-*` / `--dur-*` / `--section-y*` / `--container` (reused, not forked) |

**Adjusted from the spec's initial proposal (after measurement):** `ink-faint #8a93a8→#767e93`; functional border made a solid `#7d8698` (was a 0.16 rgba, which failed 3:1); `success`/`domain-retain` `#15803d→#127a39`; `warning #b45309→#9a4a07`; night functional border `.20→.34` alpha.

---

## 5. Contrast ratios measured (WCAG 2.2 AA)

Computed with the standard sRGB relative-luminance formula; semi-transparent values composited over their surface first. **All pass.** Body/normal text min 4.5:1, large/UI/non-text min 3:1.

**Text on light** — ink-strong 16.48 / ink-body 10.14 / ink-muted 5.35 / ink-faint 4.06 (on paper); on paper-2: 15.38 / 9.46 / 4.99 / 3.78; on paper-3: 14.55 / 8.95 / 4.72 / 3.58.
**Text on night** — on-night 17.52, on-night-muted 10.54 (on night-950); 16.07 / 9.67 (on night-900).
**Brand & links** — white on brand 6.12; white on brand-strong 7.87; brand as link on paper 6.12; brand-strong 7.87; link on night 10.94.
**Focus / borders (non-text ≥3)** — brand ring vs paper 6.12; vs paper-2 5.71; functional border vs white 3.66; vs paper-2 3.42; night functional border 3.07. (Decorative hairline 1.27 — separator only, no min.)
**Domain inks (on white / on own tint)** — strategy 7.10 / 6.15; build 6.70 / 5.81; discover 5.36 / 4.76; convert 6.04 / 5.24; operate 5.18 / 4.57; retain 5.43 / 4.86; ai 5.47 / 4.82.
**Status (on white / on own tint)** — success 5.43 / 4.86; warning 6.26 / 5.52; danger 6.29 / 5.44; info 6.70 / 5.81.

---

## 6. Compatibility aliases / legacy retained

Nothing legacy was removed or renamed. Retained and marked deprecated-for-V2 (physical removal is the final convergence phase, after all consumers migrate):

- All `--glow-*`, `--grad-*` (incl. `--grad-spectrum`/`--grad-path`/`--grad-constellation`), and the full `constellation.css`.
- The five legacy theme classes and the dark `:root` semantic defaults + dark `body`.
- Every cosmic component (`Starfield`, `CosmicBackground`, `GlobeArc`, `NodeOrb`, `Constellation*`, `HeroUniverse`, `CosmicPageHero`, …).

The V2 shadow/ring tokens are overridden **only inside** the three V2 theme classes, so components that use `--shadow-*`/`--ring` on legacy surfaces are unaffected.

---

## 7. What changed visually on the legal pages

`/privacy`, `/terms`, `/cookies`, `/refunds`, `/accessibility` (one shared template):

- Reading surface flipped from the dark cosmic band to a **light near-white canvas** (`.theme-light`), with dark-navy headings and body ink.
- Removed the decorative violet top **wash**; no starfield/globe/glow anywhere.
- Eyebrow now the restrained **brand violet** (measured 6.12:1); review note recoloured to the V2 **amber warning** tint (readable, honest "draft" signal preserved).
- Structure, copy, TOC, anchors, review-note text, breadcrumbs, and metadata **unchanged**.
- **Known transitional state (by design):** the site header and footer are still dark this phase (chrome migrates in Phase 2), so a legal page currently reads *dark header → light content → dark footer*. Documented; not a bug.

---

## 8. What intentionally did NOT change

Homepage, navigation, footer, conversion tools (`/growth-plan`, `/contact`, `/troubleshooter`), all other route families, every primitive/section/viz/form component, APIs, forms, business logic, content data, SEO behaviour (sitemap/robots/JSON-LD/canonicals/redirects), and route URLs. No dependency added or removed. No legacy token/component deleted. Root `colorScheme:"dark"`/`themeColor` left as-is (see §10).

---

## 9. Tests & builds actually run

| Check | Result |
|---|---|
| `npm ci` | 769 packages installed (fresh clone) |
| `npm run lint` | **pass** (no errors) |
| `npm run typecheck` (`tsc --noEmit`) | **pass** |
| `npm run test` (Vitest) | **130/130 pass** (10 files) |
| `npm run build` (Next 16) | **pass** — 102/102 static pages; `/design-preview` prerendered (static) |
| Playwright + axe (`@axe-core/playwright`, tags incl. `wcag22aa`) on `/design-preview`, `/privacy`, `/terms`, `/accessibility` | **0 serious/critical violations** on all four |
| Responsive overflow @ 360 / 390 / 640 / 768 / 1024 / 1440 px | **0 horizontal-overflow failures** across all four routes (640px included as a ~200% reflow proxy) |
| Existing e2e `routes.spec.ts` + `rebrand-pages.spec.ts` | **56/56 pass** (incl. legal-page review-note tests + axe on key templates — confirms the canary didn't regress) |

Validation used the sandbox Chromium at `/opt/pw-browsers/chromium` against a local `next start` on :3101, which was stopped after verification. The contrast and Playwright scripts lived in the scratchpad / a temporary root file that was removed — nothing extra is committed.

**Not run:** `cf:build` (no hosting-affecting change this phase); the full e2e suite (ran the two legal-relevant specs; the rest exercise unchanged dark routes). Reduced-motion: the legal template and preview are fully static (no animation), so the reduced-motion state is trivially complete; verified no motion present.

---

## 10. Global layout safety — prerequisites before the global colour flip

`layout.tsx` still declares `colorScheme:"dark"` and `themeColor:"#07050f"`, and `body` still defaults dark. This is deliberate: flipping them now would make every un-migrated (still-cosmic) route render light chrome behind dark sections. The V2 preview and legal canary opt in locally (`.theme-light` sets `color-scheme:light` on its own scope, so native controls/scrollbars match within them).

**Before the root can safely go light, all of the following must be migrated to V2 light themes:** `SiteHeader`, `MobileNav`, `SiteFooter`, `CosmicPageHero`→`PageHeader`, `PageHero`, `SectionShell` (default light), and every route family in §8 of the spec — i.e. essentially the whole site. The global flip is therefore a **late** step (Phase 3/convergence), not Phase 1/2.

---

## 11. Risks discovered

1. **Transitional chrome mismatch.** Until chrome migrates (Phase 2), migrated light pages carry dark header/footer. Acceptable and documented; the fix is early in Phase 2 (chrome is the highest-leverage next step for exactly this reason).
2. **Functional-border contrast is easy to get wrong.** The natural "very light hairline" for inputs failed 3:1; V2 splits `--hairline` (decorative, any contrast) from `--hairline-strong` (functional, ≥3:1 solid). Component authors must use `--hairline-strong` on control edges — noted in the token comments.
3. **`color-scheme` scoping.** Because the root is still `dark`, any future V2 light surface must sit inside a `.theme-light*` wrapper (which sets `color-scheme:light`); a light surface placed outside a V2 class would get dark form-control/scrollbar rendering. The global flip (§10) resolves this permanently.
4. **`--shadow-*`/`--ring` overrides are scope-bound.** They only change inside the three V2 classes — correct for compatibility, but means a component must be *inside* a V2 theme to get neutral shadows; a stray V2-token reference on a legacy surface won't pick them up (by design).

---

## 12. Recommended scope for Phase 2

Primitives + shared shells (the compatibility-first, high-leverage batch that unlocks most routes without touching the homepage or tools):

1. **`Button`** — consolidate `GlowButton` into one primitive; primary = solid `--v2-brand`, plus secondary/ghost/text and the single signature-gradient variant. (Visual targets already proven in the preview.)
2. **`Card`, `IconTile`, `Badge`, `BentoCard`** — light-first, soft shadow, flat tinted icon chips, one accent rail; drop glass/glow.
3. **`SectionShell`** — make theme + `CosmicBackground` opt-in, defaulting to `.theme-light`; this de-cosmics all `sections/home/*` at once.
4. **`PageHeader`** (replaces `CosmicPageHero`/`PageHero`) — light structured hero, no starfield; migrates the ~13 router-hub + 6 taxonomy-detail routes as a group.
5. **Chrome:** `SiteHeader`, `MobileNav`, `SiteFooter` to light — resolves the Risk #1 transitional mismatch and lets legal (and everything migrated) read fully light.
6. **Extend tests:** add an e2e light-surface + axe check for the migrated families; keep the `/design-preview` board updated as the swatch source of truth.

Explicitly still **out of scope for Phase 2:** homepage IA redesign, `ServiceDomainTemplate`, and the conversion tools (Phase 3), plus deletion of the legacy layer (convergence).
