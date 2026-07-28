# Infinite Weblinks — V3 Design Specification ("Instrument")

**Status:** 🚧 **Phase 1 applied — foundation tokens landed.** · **Type:** Design-definition + phased build
**Branch:** `redesign/v3-instrument`
**Supersedes:** [`docs/design/v2-design-spec.md`](v2-design-spec.md) (the light-first "Clear Systems" convergence).
**Source of record:** [`V3_HANDOFF.md`](../../V3_HANDOFF.md) (repo root) — the verified Phase 1 payload and the remaining-phase plan.

> **The new direction, in one line:** dark, high-craft, **product-led** — the site is
> carried by rendered product interfaces (the growth plan, the roadmap, the troubleshooter)
> rather than by decorative graphics. Register: Raycast / Attio / Cuberto / Pitch. The
> light-first "Clear Systems" system is **deliberately reversed**.

---

## 1. Why V2 is reversed

V2 ("Clear Systems") converged the whole site to **light-first**, with dark reserved for a
single signature section (the `theme-night` `FinalCtaSection`). That decision — recorded in the
V2 spec and guarded by `tests/unit/v2-root-convergence.test.ts` — is now reversed.

The site as shipped under V2 was a light-first, text-only marketing site with almost no visual
inventory (11 brand-logo SVGs and one icon). The owner found it flat and catalogue-like. The
reference sites the owner chose — **raycast.com, attio.com, cuberto.com, pitch.com** — do not
share a colour or a layout. What they share is that **every one of them is carried by a rendered
artifact**: real product UI, real decks, real 3D. V3 follows that: the growth plan, roadmap and
troubleshooter become real interfaces on a dark, high-craft canvas.

Owner decisions, already made (do not re-litigate):

- The **whole site** goes dark, including long-form reading pages.
- The **real** plan builder is upgraded to match the mockups — the mockups are not down-scoped
  to the current builder.
- Colour lives **inside** the product UI (rows, chips, dots, meters), not on the page chrome.

## 2. How the reversal is done without touching components

V3 **does not fork the semantic contract.** It reuses V2's token *names* (`--surface`,
`--text-heading`, `--hairline`, `--shadow-*`, `--ring`, and the seven `--v2-domain-*`
wayfinding hues) and supplies different *values* for them. Because every consumer already reads
those semantic names — `domainColor.ts`, `deliveryModel.ts`, `IconTile`, `Badge`, `BentoCard`,
`SiteHeader`, `SiteFooter`, and the resources / FAQ / design-preview routes — a **site-wide
inversion needs no component edits**. The change is entirely in the token layer plus the root
document declaration.

The new token layer lives in [`src/styles/tokens/v3.css`](../../src/styles/tokens/v3.css),
imported **last** in `globals.css` so its semantic mapping wins over the retained V2 light
mapping. V2 is retained, not deleted, because V3 reuses its names and still references some of
its primitives.

## 3. The palette, and why

| Role | Value |
|---|---|
| Page canvas | `#08080A` |
| Raised (cards, panels) | `#0D0D10` |
| Panel body / nested fill | `#131317` |
| Input / tile / chip | `#1A1A20` |
| Heading text | `#F3F3F6` |
| Body text | `#B9B9C6` |
| Muted / caption | `#9A9AA8` |

Every pair was measured against **WCAG 2.2 AA** (body ≥ 4.5:1, large/UI/non-text ≥ 3:1). The
weakest text pair in the system is the brand link on a panel at **4.98:1**; the seven domain
hues as text bottom out at **6.36:1**. Nothing relies on the 3:1 large-text allowance. **These
colour values are measured and must not be adjusted.**

**Deliberately neutral, not indigo.** A blue-black canvas with violet accents is the generic
AI-template look, and the owner rejected it explicitly. The ink scale is neutral with only a
very slight cool cast so it reads as *tooling*. Do not "warm it up" or shift it blue.

The seven domain hues were the real work: V2's values are dark inks built for white paper and
are unreadable on dark. Because every consumer reads them as `var(--v2-domain-X-ink)` rather
than raw hex, the `.theme-deep` class remaps them to re-measured bright values and every
wayfinding consumer re-themes for free.

### 3.1 The AI domain: teal → gold (a measured separation fix)

The V3 domain hues are:

| Domain | V2 ink (paper) | V3 hue (dark) |
|---|---|---|
| strategy | `#6d28d9` | `#a78bfa` |
| build | `#1d4ed8` | `#6fa8ff` |
| discover | `#0e7490` | `#2dd4c4` |
| convert | `#be185d` | `#ff6fa3` |
| operate | `#c2410c` | `#ffa05c` |
| retain | `#127a39` | `#4fda8b` |
| **ai** | **`#0f766e` (teal)** | **`#f5cc57` (gold)** |

Re-measuring the domain hues for dark, the **AI domain moved from teal (`#0f766e`) to gold
(`#f5cc57`)**. That hue shift was **unintentional** when `v3.css` was written — but the
measurement says keep it, because it fixes a real wayfinding weakness in the V2 palette:

- In **V2**, `ai` (`#0f766e`) and `discover` (`#0e7490`) were **both teal**, and they were the
  **closest pair in the whole palette** at **ΔE 23.1** (CIE Lab, ΔE76). At the sizes these hues
  actually render — 7px legend dots and 2.5px accent rails — a ΔE of 23 is not reliably
  distinguishable, so two different service worlds read as the same colour.
- In **V3**, moving `ai` to gold removes that collision. The **minimum pairwise separation across
  all 21 pairs rises to ΔE 28.8** (now `strategy`/`build`), and `discover`/`ai` are no longer
  anywhere near the floor. Gold also fits the "signal / automation" reading of the AI world and
  sits apart from the six cooler/warmer worlds.

This is a **deliberate decision recorded after the fact**, not a colour nobody checked. The
separation floor is enforced by [`tests/unit/v3-domain-separation.test.ts`](../../tests/unit/v3-domain-separation.test.ts),
which parses the seven `--v3-domain-*` values from `v3.css`, converts them to CIE Lab, and fails
if any of the 21 pairs drops below **ΔE 25** — above V3's real floor (28.8) and above the V2
confusable pair (23.1), so it would have caught the old teal/teal collision and will catch any
future edit that reintroduces one. Like the WCAG contrast in `v2-contrast.test.ts`, perceptual
separation here is a **functional requirement, not aesthetics**.

## 4. Guardrails

- **No colour glows.** Elevation is neutral shadow (`--v3-shadow-*`, all black-based) plus a
  1px light hairline top edge (`--v3-edge-top`). On dark, the hairline is what makes a surface
  read as a real interface; a shadow alone reads as nothing.
- **No decorative full-bleed gradients.** The signature gradient stays CTA-only.
- **No pure black.** The canvas is `#08080A` so panels can sit visibly above it.
- **No fourth font.** Sora / Plus Jakarta Sans / JetBrains Mono only — Core Web Vitals are a
  stated non-negotiable and a fourth family is not worth the budget.
- **Grain is applied once** on `body.theme-deep::before` (~3% noise to stop 8-bit banding on
  large flat dark fields), never per component, `pointer-events: none`, below all content.
- **Every animation needs a complete `prefers-reduced-motion` static state** — the axe suite
  enforces it.
- **No invented proof.** The approved prototype carried a "+38% enquiries" card; the
  constitution's evidence rules block unverified claims. Any figure must be backed by real data
  or left out.

## 5. Phase 1 — what landed (this branch)

Applied verbatim from the handoff and verified (`typecheck`, `lint`, unit tests, `build`):

- **Add** `src/styles/tokens/v3.css` — the foundation tokens and the `.theme-deep` /
  `.theme-deep-alt` / `.theme-night` classes.
- **Edit** `src/styles/globals.css` — import `v3.css` last so its values win the cascade.
- **Edit** `src/app/layout.tsx` — `<body>` carries `theme-deep`; `viewport` declares
  `colorScheme: "dark"` and `themeColor: "#08080a"`; the convergence comment is rewritten.
- **Replace** `tests/unit/v2-root-convergence.test.ts` with
  `tests/unit/v3-root-convergence.test.ts` — the guard is rewritten to enforce the dark-first
  decision just as hard as the old test enforced light-first, not dropped.

## 6. Remaining phases (not started on this branch)

- **Phase 2 — primitives.** `Panel`, `FloatingCard`, `DataTable`, and the mockup components
  (plan panel, roadmap, troubleshooter) — wired to the real content layer
  (`src/lib/content/data/*`), never hard-coded strings.
- **Phase 3 — homepage.** Rebuild the spine; rewrite (do not delete)
  `tests/unit/v2-homepage-safety.test.ts` to the new section order; keep `page.tsx` a server
  component and push `"use client"` down into the sections.
- **Phase 4 — rollout.** Route by route, hubs before detail pages; long-form pages use
  `--v3-read-surface` and `--v3-read-measure` so dark prose stays trackable.
- **Phase 5 — gates.** axe green, mobile 360/390 with no horizontal overflow, Core Web Vitals,
  and regenerate the obsolete screenshots in `docs/release/phase-3c-visual/`.
