# Infinite Weblinks — V2 Design Specification

**Status:** ✅ **Implemented — redesign complete (Phase 2S).** · **Type:** Design-definition + phased build
**Branch:** `claude/infinite-weblinks-v2-design-yb1yi3`
**Approved decisions:** §15 (locked) · **Implemented:** the full V2 system across every route/template (Phases 1 → 2A–2S). Root converged to light-first in Phase 2S; the legacy cosmic system is retired.
**Author role:** Principal product designer · design-system architect · senior frontend engineer · conversion strategist · accessibility reviewer

> **Phase 2S convergence (redesign complete).** Implementation ran strictly phased and
> compatibility-first from Phase 1 (additive V2 foundation + canary) through Phases 2A–2R (route and
> component migration) to **Phase 2S**, which converged the document root to **light-first**
> (`viewport.colorScheme:"light"`, paper `themeColor`, `theme-light` on `<body>`; night sections stay
> explicitly scoped), migrated the final two legacy surface families (the 404/error status screens and
> the gated `/examples` proof templates), and removed the proven-dead cosmic/registry visual legacy
> code and tokens. **No route URLs, form APIs, Formspree/Turnstile behaviour, rate limiting, validation
> schemas, CSP/security headers, Sanity delivery, legal wording, proof statuses, pricing, analytics or
> deployment config were changed** — those are the separate Phase 3 (3A security/infrastructure,
> 3B legal/proof/trust, 3C release/CI/deploy) work, which this redesign does not begin.
>
> - **Final route/template inventory:** [`docs/design/v2-final-route-inventory.md`](v2-final-route-inventory.md)
> - **Legacy-reachability proof + removals:** [`docs/design/v2-legacy-reachability.md`](v2-legacy-reachability.md)
> - **Visual/responsive/a11y review:** [`docs/design/phase-2s-visual-review.md`](phase-2s-visual-review.md)
> - **Redesign handoff (+ Phase 3 scopes):** [`docs/design/v2-redesign-handoff.md`](v2-redesign-handoff.md)
>
> **Retained intentional exceptions** (documented, not dead code): `InfinityMark` (learn article +
> the restrained status mark), `BentoGrid`/`BentoCard` on the light `/resources` surface, the seven
> `--domain-*` wayfinding hues, and the `theme-band` legacy class still used by a small number of
> live light sections (EditorialStatement, ProcessStepsSection). See the reachability report for the
> per-item reasons.

> This document defines the target for a V2 redesign of the Infinite Weblinks marketing site. The direction and the §15 decisions are **approved for phased implementation**. Implementation is **strictly phased and compatibility-first**: Phase 1 (this pass) adds an additive V2 foundation and migrates only a canary; it changes no APIs, forms, business logic, content data, SEO behaviour or route URLs, and removes no legacy tokens or components. It is written in the Spec Kit `specify → clarify → plan → tasks → implement` frame and draws on the `frontend-design`, `ui-ux-pro-max`, `design-system`, `accessibility` and `cro` skills.
>
> **The new direction, in one line:** ~70% Stripe (structure, restraint, product clarity, typographic confidence) + ~30% Clay (colour, bento composition, friendly character), rendered as **original Infinite Weblinks branding** — light-first, product-forward, accessible and conversion-focused. **The current cosmic/galaxy system is not the target.**

---

## 0. Method & inputs

Inspected first-hand: `CLAUDE.md`, `.specify/memory/constitution.md` (v2.0.0), the full token layer (`src/styles/tokens/{colors,typography,spacing,effects,constellation,base}.css` + `globals.css`), the content model (`src/lib/content/types.ts`), the navigation IA (`src/lib/content/seed.ts`), motion (`src/lib/motion/motion.ts`), security headers (`next.config.ts`), `package.json`, `playwright.config.ts`, the homepage (`src/app/(marketing)/page.tsx`) and root layout. A full component + route census was performed across `primitives/`, `brand/`, `builder/`, `hero/`, `sections/` (+ `sections/home/`), `viz/`, `chrome/`, `forms/`, `routes/`, `troubleshooter/`, and every App Router page.

> **Note on visual references:** the `docs/design-references/` directory referenced in `CLAUDE.md` contains no image assets in the current repository. The V2 visual target used here is the written brief (Stripe 70% / Clay 30%) plus the design leads' public design language. **Open question Q1** (§15) asks for the actual reference set so token values (exact hues, radii, shadow depths) can be locked precisely rather than proposed.

---

## 1. Diagnosis of the current visual & UX system

The current build is a **dark-first "Constellation" cosmic system**: a near-black navy canvas lit by neon violet/pink/orange/cyan/lime, with an "everything connects" orbit metaphor repeated as the primary visual idea across the whole site. It is well-engineered and accessible, but it is the opposite of the V2 target on almost every axis.

### 1.1 What's structurally strong (preserve these)

These are genuine assets and must survive V2 — they are *why* the rebuild is a refactor, not a rewrite:

- **Section-theme token contract.** Components read semantic tokens (`--surface`, `--surface-raised`, `--surface-input`, `--text-heading`, `--text-body`, `--text-muted`, `--hairline`, `--link`) that a wrapper class overrides (`.theme-dark`, `.theme-band`, `.theme-band-bright`, `.theme-statement`, `.theme-cosmic`). `src/styles/tokens/colors.css:130-203`. **A light system already exists** — `.theme-band-bright` sets `--surface:#f7f6fc`, `--surface-input:#fff`, dark-ink text. Most "make it light" work is flipping wrappers, not rewriting CSS.
- **Accessibility baseline is excellent** and must not regress: visible focus everywhere (`--ring`, `base.css:91-95`), complete `prefers-reduced-motion` static states (`base.css:97-110`), semantic HTML, `aria-*` wiring, focus management in `PlanBuilder`/`MobileNav`/`ContactForm`, WCAG 2.2 target sizes (`--target-min: 44px`), and axe in the e2e suite.
- **Form security is strong:** honeypot + timing trap + Turnstile + Zod client schema + **server-authoritative** re-validation, and an honest "never fake a successful send" contract (`src/lib/forms/config.ts`, `ContactForm.tsx`, `api/forms/*`).
- **Performance hygiene:** self-hosted fonts via `next/font` (`layout.tsx:7-26`), GSAP lazy-loaded only where used and skipped under reduced motion (`motion.ts:17-25`), canvas starfield capped + IO-paused, server-rendered LCP headings.
- **Fluid type scale**, 4px spacing system, deliberate section rhythm tokens (`--section-y{,-tight,-loose}`), and a working **bento grid primitive** (`BentoGrid`/`BentoCard`) — bento is directly on-brief for Clay.
- **Strong content architecture / IA:** a rich typed taxonomy (`types.ts`) and a well-considered mega-menu (`seed.ts`) that already reflects a clear funnel (Your goal → How it works → Services → Resources → About).

### 1.2 What fights the V2 target (the problems)

**P1 — Dark-first by default.** The page base is dark (`--bg-page: var(--ink-950)`, `base.css:19`; `colorScheme:"dark"`, `themeColor:"#07050f"` in `layout.tsx:55-58`). Every router hero (`CosmicPageHero`), the legacy page header (`PageHero`), legal pages (`LegalPageView`), the service domain template, and the 404 all open dark. **Target is mostly-light**, with dark reserved for signature moments. Long-form surfaces (legal, `learn/[slug]`) are exactly where light wins for readability and trust.

**P2 — Neon glow is the signature, and it leaks onto light.** `effects.css:10-19` defines `--glow-violet/pink/orange/cyan/lime/blue/cta` as literal rgba shadows in `:root` — they **do not flip per theme**, so a component using `box-shadow: var(--glow-cta)` glows even on a cream band. Glows are baked into `Button.primary`, `GlowButton`, `IconTile`, `NodeOrb`, `Card.interactive`, `BentoCard:hover`, `Constellation`, `FloatingCards`, `PhoneFrame`, `RailBar`, `JourneyTimeline`, `StageTimeline`. Stripe/Clay use **soft neutral shadows**, not colour glows.

**P3 — Gradient overload.** Five signature gradients plus a 5-stop rainbow: `--grad-cta`, `--grad-brand`, `--grad-constellation`, `--grad-spectrum`, `--grad-path` (`colors.css:56-63,127`). Gradient *text* utilities (`.iw-gradient-text`, `.iw-gradient-word`) headline the hero, final CTA, and every `SectionShell` eyebrow. This reads as "AI-generated" (the `frontend-design` skill flags purple-blue gradients and glowing orbs as the #1 generic-AI tell) and undercuts the "product clarity" goal.

**P4 — Full-screen decorative galaxy on ordinary content.** `CosmicBackground` (aurora radial gradients + `Starfield` canvas + `GlobeArc` horizon) sits behind **every** router hero via `CosmicPageHero`, behind two homepage sections via `SectionShell background`, three times inside `ServiceDomainTemplate`, and behind the 404. `PageHero` fakes a starfield with 7 layered radial-gradients (`.field`). **V2 bans full-screen decorative backgrounds on ordinary sections.**

**P5 — One metaphor, everywhere (the opposite of "one idea per section").** The orbit/constellation "everything connects" motif is not one section's idea — it is the whole site's only idea, rendered ~a dozen ways: `HeroUniverse` (vortex + orbits + Earth), `Constellation`, `ConstellationLayout`, `NodeOrb`, `ServicesConstellationSection`, `ServicesExplorerSection`, `ConnectedSystemSection`, `FinalCtaBannerSection` (9-node orbit), `ConnectorPath` threads, `GlobeArc`. It's beautiful and coherent, but it shows a **galaxy, not the product**. The brief wants product/UI mockups instead of cinematic illustration.

**P6 — Two parallel section systems + real duplication.** "System A" (top-level `sections/*`) hardcodes flat themes and is already ~70% Stripe-clean and mostly light-capable. "System B" (`sections/home/*`) is built on `SectionShell` → forced `.theme-cosmic` + starfield. They overlap: **`GoalExplorerSection` ≈ `GoalBentoSection`**, **`ServicesExplorerSection` ≈ `ServicesConstellationSection`**. Plus dead indirection: `sections/registry.tsx` (`HomepageSections`) and its data source `getHomepageSections()` are **imported nowhere** — the live homepage hand-composes instead.

**P7 — Two button primitives.** `Button` (`.primary` = `--grad-cta` + `--glow-cta`; `.brand` = `--grad-brand` + `--glow-violet`) and `GlowButton` (`.primary` = `--grad-constellation` + `--glow-brand`) are near-duplicates. A restrained system needs **one** button with clear variants.

**P8 — Cosmic decoration hardcodes dark surfaces.** `NodeOrb` fills with `--space-surface` (breaks on light), `PhoneFrame` bezel/screen hardcode `--ink-*`, and `SiteHeader`/`MobileNav`/`SiteFooter` hardcode `--ink-*`/`--glow-*`/`--grad-path` rather than reading the semantic tokens — so they can't simply re-theme to light.

### 1.3 UX / conversion diagnosis

- **The aesthetic works against the value proposition.** The buyer is a business owner evaluating a *growth partner*. Heavy neon motion signals "creative/entertainment," not "clear, trustworthy, in-control." Stripe's restraint reads as competence; that is the tone this brand needs.
- **The homepage is long (12 stacked sections)** with several competing interactive "router" moments (goal bento, services constellation, journey timeline). Two of them are near-duplicates of other pages. CRO wants **one primary action per section** and a shorter, decisive spine.
- **Primary CTA is consistent and good** — "Build my growth plan" → `/growth-plan` everywhere — but it's buried under cosmic chrome. V2 should make it the clearest thing on the page.
- **The mega-menu IA is strong and should mostly carry over** (see §9), but the header/mobile-nav skins are hardcoded dark and must be rebuilt light.
- **Proof is correctly gated** (case studies/testimonials render only when verified). V2 must give proof a real, prominent home for CRO the moment content exists.

---

## 2. V2 design-direction statement

**Direction name: "Clear Systems."**
Infinite Weblinks helps owners see their digital growth as one connected system and take the right next step. The interface should *embody* that: calm, structured, and legible, with colour used to organise — not to dazzle. We take **Stripe's** discipline (generous white space, confident typography, real product surfaces, one accent doing a lot of work, restrained motion) and warm it with **Clay's** character (a friendly bento rhythm, rounded cards, a small set of saturated accent hues, approachable copy). The result is **original to Infinite Weblinks**, not a clone of either.

**Three adjectives:** **Clear · Structured · Warm.**

**Surface strategy — mostly light, dark as punctuation:**

- **Default canvas is light** (near-white, faint cool tint). Neutral ink text. This is the resting state of ~85% of the site.
- **Dark is reserved for signature moments only:** the homepage hero *may* use one deep-navy band (Q3), the final CTA band, and optionally the footer. A dark moment must earn its place by being a genuine emphasis beat — never the default and never on long-form reading surfaces.
- **Colour is accent and wayfinding, not atmosphere.** The seven domain hues survive as a *wayfinding* palette (one hue per service world) at accessible, slightly-desaturated values; they tint icons, rails, badges and one accent line per card — never a full glow or a full-screen wash.
- **Gradients are demoted to accents:** at most one signature brand gradient, used on the reserved dark hero/CTA only. No rainbow gradients, no gradient body/heading text on content sections.

**Visual language — show the product, not the galaxy:**

- Replace cinematic galaxy scenes with **honest product/system visuals**: the Growth Plan builder UI, a clean connected-systems diagram (nodes + labelled edges, flat, no glow), phone/app mockups of the customer journey, and small "system-state" cards (campaign ready, tracking active) drawn as crisp UI, not floating glass. These are *illustrative and generic* (no fabricated brands, metrics, or clients — the existing content rule holds).
- **One major visual idea per section.** Each section gets a single, purposeful visual; the "everything connects" idea appears **once** as a signature diagram, not on every band.
- **Bento is the compositional workhorse** for routers and grouped content (the Clay 30%), rendered light with soft shadows and a single accent rail per tile.

**Typography — keep the brand voice, lower the volume.** Retain the self-hosted **Sora (display) + Plus Jakarta Sans (body)** pairing — it's distinctive, already loaded, and on-brand — but shift from all-`800`-black display weight toward a Stripe-like **600–700** with tighter tracking, and let hierarchy come from size/weight/space rather than gradient fills and glow. (Font *pairing* is a keep; usage changes. See §5.)

---

## 3. Design principles (explicit, testable)

1. **Light by default, dark by intent.** Every new section starts on a light/neutral surface. A dark section requires a documented reason (signature emphasis) — it is never the fallback.
2. **One idea per section.** Each section carries a single message and a single visual device. If a section needs two visuals to explain itself, it's two sections.
3. **Colour organises; it does not decorate.** Hue is reserved for meaning (domain wayfinding, status, one accent per element). No decorative neon, no full-screen colour washes on content.
4. **Shadows, not glows.** Elevation is expressed with soft, neutral, layered shadows. Colour glows (`--glow-*`) are removed from the system.
5. **Show the product.** Prefer real UI/system mockups (builder, diagrams, dashboards, phones) over abstract illustration. Visuals must be honest — generic states only, never fabricated brands/metrics/clients.
6. **Typography carries hierarchy.** Emphasis comes from scale, weight, and space — not gradient text. Gradient text is allowed in **at most one** signature location, on a dark surface.
7. **Restraint in motion.** Motion is functional and quiet (entrance reveals, hover feedback, progress). No ambient loops, no continuous rotation, no parallax on content. Reduced-motion is a first-class, complete static state.
8. **Structure over spectacle for conversion.** Every section that asks for action states the value plainly and offers exactly one primary action. The primary CTA ("Build my growth plan") is the most legible element on the page.
9. **Mobile is designed, not shrunk.** Layouts are composed mobile-first; a device that can't hover or fit a diagram still gets a first-class, non-overflowing experience (§10).
10. **Accessibility and security are acceptance criteria, not polish.** WCAG 2.2 AA, keyboard operability, honest form handling, and the existing CSP hold for every new surface (§12).
11. **Token-driven, not ad hoc.** Every colour, space, radius, shadow, and duration comes from a token. No hardcoded `--ink-*`, `rgba(...)`, or hex in components (the current chrome/viz violations are fixed, not extended).
12. **Refactor, don't rewrite.** Keep the token contract, the a11y patterns, the form security, and the working primitives. Change the *skin and composition*, preserve the *architecture*.

---

## 4. Do-not-use list

Concrete bans for V2 (each maps to a current pattern being removed):

- ❌ **Full-screen decorative backgrounds on content sections** — no `CosmicBackground`, `Starfield`/`StarfieldLazy`, `GlobeArc`, aurora radial washes, or `PageHero.field` faux-starfield behind ordinary content.
- ❌ **Neon colour glows** — remove `--glow-violet/pink/orange/cyan/lime/blue/cta/brand/orb*` from component styling. No `box-shadow: 0 0 Npx <hue>`.
- ❌ **Rainbow / multi-stop gradients** — retire `--grad-spectrum`, `--grad-path`, `--grad-constellation` from general use.
- ❌ **Gradient text on content** — no `.iw-gradient-text` / `.iw-gradient-word` on section eyebrows, headings, or body. (One signature dark-surface exception, max.)
- ❌ **Orbit / constellation diagrams as the primary metaphor** — retire `HeroUniverse`, `Constellation`, `ConstellationLayout`, `NodeOrb` (glossy orb), and the multi-node orbit in `FinalCtaBanner` as the default visual. Keep the *idea* only as one flat connected-systems diagram.
- ❌ **Dark page default** — no `--bg-page: dark`, no `colorScheme:"dark"` global.
- ❌ **Glassmorphism as default surface** — no `backdrop-filter` glass panels for ordinary cards/headers (it's a dark-scene device). Solid light surfaces with hairlines instead.
- ❌ **Two button primitives / bespoke CTAs** — no `GlowButton`; one `Button` with variants.
- ❌ **Ambient/continuous motion** — no endless vortex rotation, no drifting float loops, no scroll-driven parallax on content.
- ❌ **Hardcoded colour in components** — no `--ink-*`, raw `rgba()`, or hex in TSX/CSS modules; read semantic tokens only.
- ❌ **Generic-AI hero** — no "bold headline + two buttons + abstract glowing graphic." The hero shows a real product/system surface (§9).

---

## 5. Proposed token architecture

Keep the **section-theme contract** (it's the redesign's biggest lever) but **invert the defaults to light** and restructure the palette. The token files stay in `src/styles/tokens/` and keep importing through `globals.css`; `constellation.css` is retired and its useful pieces fold into the core files.

> Values below are **proposed starting points** calibrated to a Stripe-light + Clay-warm blend; exact hues/shadows to be locked against the reference set (Q1). All text/background pairs must be verified ≥ 4.5:1 (body) / ≥ 3:1 (large & UI) before lock.

### 5.1 File layout (target)

```
tokens/
  colors.css       → light-first neutrals, ink text, brand accent, domain wayfinding, semantic themes
  typography.css   → Sora + Jakarta, restrained weights, tightened scale (keep families)
  spacing.css      → keep (4px base, section rhythm, container) — largely unchanged
  effects.css      → REPLACE glows with soft neutral shadows; keep motion tokens
  surfaces.css     → (new, optional) elevation + card recipes if effects.css grows large
  # constellation.css RETIRED (folded in / deleted)
```

### 5.2 Neutrals & ink (light-first)

```css
:root {
  /* Paper (light surfaces) */
  --paper:      #ffffff;   /* base page */
  --paper-2:    #f6f7f9;   /* alternating band / subtle raised */
  --paper-3:    #eef1f5;   /* deeper alt / input well on light */

  /* Ink (text on light) — cool near-navy, Stripe-like */
  --ink-strong: #0a1f3c;   /* headings (target ≥ 12:1 on paper) */
  --ink-body:   #38415a;   /* body copy */
  --ink-muted:  #5f6b85;   /* captions/secondary (≥ 4.5:1) */
  --ink-faint:  #8a93a8;   /* disabled/decorative only — never body */

  /* Deep surfaces (reserved dark moments) */
  --night-950:  #0a1124;   /* signature dark band base */
  --night-900:  #111a33;   /* raised on dark */
  --on-night:   #f4f7ff;   /* text on dark */
  --on-night-muted: #b9c2da;

  /* Hairlines & borders (on light) */
  --line:        rgba(10,31,60,.10);
  --line-strong: rgba(10,31,60,.16);
}
```

### 5.3 Brand accent + domain wayfinding

```css
:root {
  /* Single brand accent doing most of the CTA/interaction work (Stripe pattern).
     Keep the violet lineage from today's brand, tuned for AA on white. */
  --brand:        #5b3df5;   /* primary actions, links, focus */
  --brand-strong: #4a2fd6;   /* hover/active */
  --brand-tint:   #eeeafe;   /* soft brand surface (selected states) */

  /* One signature gradient — ONLY on the reserved dark hero/CTA. */
  --grad-signature: linear-gradient(120deg, #6d3bff 0%, #f5197e 100%);

  /* Domain wayfinding — 7 worlds, AA-safe on light. Each hue ships THREE roles:
     -ink (text/icon on white), -line (accent rail), -tint (soft surface). */
  --domain-strategy-ink:  #6d28d9;  --domain-strategy-tint: #f1ecfe;
  --domain-build-ink:     #1d4ed8;  --domain-build-tint:    #e8effd;
  --domain-discover-ink:  #0e7490;  --domain-discover-tint: #e2f5fa;
  --domain-convert-ink:   #be185d;  --domain-convert-tint:  #fdeaf1;
  --domain-operate-ink:   #c2410c;  --domain-operate-tint:  #fdeee3;
  --domain-retain-ink:    #15803d;  --domain-retain-tint:   #e7f6ec;
  --domain-ai-ink:        #0f766e;  --domain-ai-tint:       #e3f4f2;

  /* Status */
  --success: #15803d; --warning: #c2410c; --danger: #be123c; --info: #1d4ed8;
}
```

### 5.4 Elevation (shadows replace glows)

```css
:root {
  /* Soft, neutral, layered — Stripe/Clay elevation. No colour glows. */
  --shadow-xs: 0 1px 2px rgba(10,31,60,.06);
  --shadow-sm: 0 1px 3px rgba(10,31,60,.08), 0 1px 2px rgba(10,31,60,.06);
  --shadow-md: 0 4px 12px rgba(10,31,60,.08), 0 2px 4px rgba(10,31,60,.06);
  --shadow-lg: 0 12px 32px rgba(10,31,60,.10), 0 4px 8px rgba(10,31,60,.06);
  --shadow-card-hover: 0 16px 40px rgba(10,31,60,.12);
  --ring: 0 0 0 3px rgba(91,61,245,.40);   /* focus, ≥3:1 */
}
```

### 5.5 Radii, type, motion

- **Radii** (Clay-warm, Stripe-restrained): `--radius-sm:8px` (inputs/buttons), `--radius-md:12px`, `--radius-lg:16px` (cards), `--radius-xl:24px` (panels/bento featured), `--radius-pill:999px`. Keep the existing scale names; adjust the *usage* toward the 12–16px card range.
- **Typography** (`typography.css`): keep `--font-display: Sora`, `--font-body: Plus Jakarta Sans`, `--font-mono: JetBrains Mono` (labels only). Change: display weight default `700` (was `800`), headings `600–700`, body `400–450`; keep the fluid scale but reduce hero display max (`clamp(2.25rem, 5vw, 3.75rem)`) so it reads as confident, not cinematic. Retain `--measure: 68ch`.
- **Motion** (`effects.css`): keep `--ease-out`, `--ease-in-out`, `--dur-fast/base/slow/entrance`; drop `--ease-bounce` from default use. Add nothing that loops.

### 5.6 Semantic theme classes (inverted)

```css
:root { /* light is the default, not dark */
  --surface: var(--paper);
  --surface-raised: var(--paper);      /* card on paper: hairline + shadow, not a fill */
  --surface-alt: var(--paper-2);       /* alternating band */
  --surface-input: #ffffff;
  --text-heading: var(--ink-strong);
  --text-body: var(--ink-body);
  --text-muted: var(--ink-muted);
  --hairline: var(--line);
  --hairline-strong: var(--line-strong);
  --link: var(--brand);
  --link-hover: var(--brand-strong);
}
.theme-light      { /* explicit light (= default) */ }
.theme-light-alt  { --surface: var(--paper-2); }     /* the alternating band */
.theme-night      { /* reserved dark signature moment */
  --surface: var(--night-950); --surface-raised: var(--night-900);
  --text-heading: var(--on-night); --text-body: var(--on-night-muted);
  --hairline: rgba(255,255,255,.12); --link: #cdbcff; --link-hover:#fff;
  background: var(--surface); color: var(--text-body);
}
/* .theme-cosmic, .theme-band, .theme-band-bright, .theme-statement → collapse into the three above */
```

> **Migration mechanic:** because components already read `--surface`/`--text-*`/`--hairline`, retheming a section is mostly changing its wrapper class and deleting decorative layers. The token *names components consume* stay the same; only their values and defaults change.

---

## 6. Component inventory (V2 target library)

Grouped as requested. ✅ exists (keep/refactor) · ✳ new · ⤫ retire.

### Foundations
- **Tokens** ✅ (restructured, §5) · **Section themes** ✅ (`.theme-light` / `-alt` / `.theme-night`) · **Container/section rhythm helpers** ✅ (`.iw-container`, `.iw-section*`) · **Type/utility helpers** ✅ (keep `.iw-eyebrow`, `.iw-lead`; retire `.iw-gradient-text`/`.iw-gradient-word` from general use) · **Icon set** ✅ `Icon` (lucide) · **Brand mark** ✅ `BrandSprite`/`InfinityMark`/`Logo` (de-glow).

### Primitives
- **Button** ✅ (one primitive: `primary` solid brand · `secondary` outline · `ghost` · `text`; 44px targets, focus ring). Absorbs `GlowButton`.
- **Badge / Pill** ✅ (`Badge` — already light-safe; re-map hues).
- **IconTile / IconChip** ✅→refactor (flat tinted chip: `--domain-*-tint` fill + `-ink` glyph; **drop the glow**).
- **SectionHeader** ✅ (eyebrow + heading + intro + aside) — keep as-is.
- **Breadcrumbs** ✅ · **Stepper** ✅ · **ProgressChecklist** ✅ (re-map hues; swap `--grad-constellation` bar for solid brand) · **OptionCards** ✅ (light-safe, accessible radio cards) · **StageMarker** ✅ (structural wayfinding).
- ⤫ **NodeOrb** (glossy orb) → replaced by IconTile/IconChip. ⤫ **GlowButton**.

### Cards
- **Card** ✅→refactor (`raised` = paper + hairline + `--shadow-sm`; **retire `glass` variant**; interactive hover = `--shadow-card-hover` lift, no colour glow; optional accent rail = `--domain-*-line`).
- **BentoCard** ✅→refactor (the Clay tile: light surface, soft shadow, one accent rail; icon = flat IconTile; hover lift not glow).
- **IndexCard** ✅ (already light-aware; make light the default).
- **GoalCard** ✅ (`GoalCards` VM grid) · **NotificationCard** ✅ (default `tone="light"`; a product-mockup building block) · **Stat / Chart / Message cards** ✅ (`FloatingCards` → static light "system-state" cards; drop drift + glow).
- ✳ **Pricing/PlanCard** (if pricing gains tiers — Q5) · ✳ **TestimonialCard** (extract from `TestimonialWall`).

### Grids
- **BentoGrid** ✅ (featured + medium + compact; the primary composition engine) · **HubGrid** ✅ · **RelatedLinks** ✅ · generic **CardGrid** helper ✳ (thin wrapper standardising the 1/2/3-col responsive grid used ad hoc today).

### Navigation
- **SiteHeader** ✅→**rebuild light** (keep the mega-menu behaviour + a11y; re-skin surfaces to light, drop `--grad-path` hairline + violet promo glow; **stop hardcoding `--ink-*`**).
- **MobileNav** ✅→rebuild light (keep dialog/focus-trap/`inert` behaviour; drop `.glow` horizon).
- **SiteFooter** ✅→rebuild (light default, or **one** reserved dark moment — Q3; remove `GlobeArc`).
- **MegaMenu panel/promo** ✅ (data-driven from `seed.ts`; re-skin).
- **ScrollThread** ✅ optional (neutral progress line; drop glow) · **Breadcrumbs** ✅.

### Forms
- Keep the whole kit — it's structural and token-driven: **ContactForm** ✅ (soften luminous success mark), **FormField** ✅, **TextField/SelectField/TextAreaField** ✅, **Turnstile** ✅ (`theme:auto`). All re-theme to light automatically. **PlanBuilder** ✅→refactor (swap `GlowButton`→`Button`, de-neon success `InfinityMark`; keep the excellent step/focus logic). **PlanReveal** ✅→refactor (flat tiles instead of `NodeOrb`, drop gradient eyebrow/word + phase glow).

### Overlays
- **MobileNav dialog** ✅ (above) · **Turnstile challenge iframe** ✅ · native **`<details>` accordions** ✅ (`FaqSection`, `FaqAccordion` — light, soften hue) · ✳ optional **Tooltip/Popover** only if a real need appears (not required for launch).

### Content / templates
- **CosmicPageHero** ⤫→ ✳ **PageHeader** (new light structured hero: breadcrumb + eyebrow + H1 (LCP) + lead + CTAs + optional product-mockup aside; **no `CosmicBackground`**). One optional dark variant.
- **PageHero (legacy)** ⤫→ folds into PageHeader (drop `.field` starfield).
- **SectionShell** ✅→refactor (theme + background become **opt-in**; default light, no starfield) — this single change de-cosmics all `sections/home/*`.
- **LegalPageView** ✅→light reading surface (drop `.wash`) · **ProofDetail** ✅ (follows PageHeader; body already light) · **ServiceDomainTemplate** ✅→**major refactor** (invert band rhythm to light-default, strip 3× `CosmicBackground`, keep the bento catalog + "how this connects" flow) · **FaqAccordion** ✅ · **StatusScreen** ✅ (light, or one reserved dark exception).

### Signature visuals (the deliberate "one idea" moments)
- ✳ **ConnectedSystemDiagram** — the single, flat, labelled node-and-edge diagram that carries the "everything connects" idea (replaces `Constellation`/`ConstellationLayout`/`HeroUniverse`). Static, accessible (`role="img"` + text list fallback), light; edges are hairlines, nodes are IconChips.
- ✳ **BuilderPreview** — a crisp mockup of the Growth Plan builder UI for the hero/`/growth-plan` (shows the actual product).
- **PhoneFrame** ✅→re-skin neutral (the customer-journey mockups; light bezel/screen) · **JourneyTimeline / StageTimeline** ✅→light structured timeline (single accent line, no rainbow/orb glow; keep the accessible tabbed interaction of `StageTimeline`) · **CustomerJourney** phone strip ✅→light.
- ⤫ **HeroUniverse, Starfield, StarfieldLazy, CosmicBackground, GlobeArc, Constellation, ConstellationLayout** (retire the galaxy engine).

---

## 7. Current components — keep / refactor / replace / retire

Synthesised from the full census. "Refactor" = same component, de-neon + light-first. "Replace" = same job, new implementation. "Retire" = delete, no successor.

### KEEP (already light-safe / structural — minimal change)
`SectionHeader`, `Breadcrumbs`, `Icon`, `BentoGrid`, `Badge`, `Stepper`, `OptionCards`, `StageMarker`, `HubGrid`, `RelatedLinks`, `InView`, `GoalCards`, `IndexCard` (light default), `FaqAccordion` (soften hue), `NotificationCard` (light default) — plus the **entire forms kit**: `FormField`, `TextField`, `SelectField`, `TextAreaField`, `Turnstile`, `Analytics`, `JsonLd`. Retheme-to-light-only: `FaqSection`, `WhyInfiniteWeblinksSection`, `TestimonialWallSection`, `CaseStudyShowcaseSection`, `LearningResourcesSection`, `ProcessStepsSection`, `DeliveryModelsSection`.

### REFACTOR (de-neon, light-first; structure survives)
`Button` (absorb GlowButton, solid CTA), `Card` (drop glass, soft shadow), `IconTile` (flat chip), `ProgressChecklist`, `BentoCard`, `InfinityMark` (drop bloom/pulse), `Logo` (drop violet drop-shadow), `BrandSprite` (optionally restrain the 5-stop gradient — Q2), `PlanBuilder`, `PlanReveal`, `SiteHeader`, `MobileNav`, `SiteFooter` (or reserve dark), `ContactForm` (success flourish), `SectionShell` (**highest leverage** — theme/bg opt-in), `LegalPageView`, `ProofDetail`, `ServiceDomainTemplate` (**biggest single job**), `GrowthTroubleshooter`, `StatusScreen` (or reserve), `ConnectorPath` (hairline, no spark), `RailBar`, `ScrollThread`, `JourneyTimeline`, `StageTimeline`, `PhoneFrame` (neutral bezel), `FloatingCards` (static light), and sections: `AccountOwnershipSection`, `ConnectedExamplesSection`, `ConnectedSystemSection`, `CustomerJourneySection`, `EditorialStatement`, `GoalExplorerSection`, `GrowthJourneySection`, `StartingPointSelectorSection`, `FinalCtaBannerSection` (keep as *the* signature dark moment), `ConnectedGrowthSection`, `GoalBentoSection` (→ Clay light bento), `HonestExpectationsSection`, `OneSystemSection` (keep the mockup cards as its one idea).

### REPLACE (same job, new component)
- `CosmicPageHero` → **PageHeader** (light).
- `PageHero` (legacy) → **PageHeader**.
- `ServicesConstellationSection` → light structured **service grid / router** (and consolidate the duplicate — see below).
- `Constellation` / `ConstellationLayout` / `HeroUniverse` → **ConnectedSystemDiagram** (one flat diagram) + `BuilderPreview`.
- `NodeOrb` → **IconTile/IconChip** (flat).
- `GlowButton` → **Button**.

### RETIRE (delete)
`Starfield`, `StarfieldLazy`, `CosmicBackground`, `GlobeArc`, `constellation.css`, the `--glow-*`/`--grad-spectrum`/`--grad-path`/`--grad-constellation` tokens, `sections/registry.tsx` + `getHomepageSections()` (orphaned dead indirection), and **one of each duplicate pair**: `ServicesExplorerSection` **or** `ServicesConstellationSection`; `GoalExplorerSection` **or** `GoalBentoSection` (recommend keeping the bento variants, retiring the explorer variants).

---

## 8. Route migration matrix

Seven template families (from the route census). Migrating the **shared shells** (PageHeader, SectionShell, BentoCard, chrome) carries most routes at once.

| # | Template family | Routes | Current theme | V2 target | Key changes | Phase |
|---|---|---|---|---|---|---|
| 1 | **Homepage (bespoke)** | `/` | Dark cosmic + `sections/home/*` | Light spine, one dark signature (final CTA; hero optional) | New IA (§9); replace Hero→light PageHero+BuilderPreview/diagram; de-cosmic home sections; drop duplicates | 3 (flagship) |
| 2 | **Conversion tools (bespoke, `(convert)`)** | `/growth-plan`, `/contact`, `/troubleshooter` | Dark cosmic / mixed | Light, product-forward; builder UI is the hero | `/growth-plan`: light hero + `BuilderPreview`, remove `CosmicBackground`/`ConnectorPath`/floating glass, keep light builder panel; `/contact`: light form, replace coded globe with simple diagram/none; `/troubleshooter`: light-first, soften active glow | 2 (critical tier) |
| 3 | **Router hubs & landings (`CosmicPageHero`)** | `/services`, `/pricing`, `/about`, `/goals`, `/case-studies`, `/learn`, `/tools`, `/faq`, `/roadmaps`, `/resources`, `/how-it-works`, `/connected-growth`, `/account-ownership` | Dark cosmic throughout | Light PageHeader + light `SectionShell`/`BentoGrid` | Upgrade `CosmicPageHero`→**PageHeader**, `SectionShell` default light, `BentoCard` light — migrates all 13 at once | 2 (shared shells) |
| 4 | **Taxonomy detail (`CosmicPageHero`)** | `/goals/[slug]`, `/business-types/[slug]`, `/roadmaps/[slug]`, `/starting-points/[slug]`, `/case-studies/[slug]`, `/tools/[slug]` | Dark cosmic (hue per entity) | Light PageHeader (hue as accent, not glow) | Same shared-shell upgrade as family 3; `/case-studies/[slug]` also swaps `ConnectorPath` flow → flat diagram; `NodeOrb`→IconChip | 2–3 |
| 5 | **Service domain template** | `/services/[category]` (`ServiceDomainTemplate`) | Mixed, dark-dominant, 3× `CosmicBackground` | Light-default rhythm, one optional dark beat | Invert bands; strip `CosmicBackground`; keep bento catalog + connects-flow; `ScrollThread` neutral | 3 (largest single) |
| 6 | **Legal (`LegalPageView`)** | `/privacy`, `/terms`, `/cookies`, `/refunds`, `/accessibility` | Dark cosmic (quiet) | Light reading surface | Edit `LegalPageView` once (drop `.wash`, light prose) — migrates all 5 | 1 (fast win) |
| 7 | **Legacy proof (`PageHero`/`HubGrid`)** | `/examples`, `/examples/[slug]` | Dark hero + light band | Light PageHeader + light band | Fold onto PageHeader; retire legacy `PageHero` | 2 |
| — | **Special: `/learn/[slug]`** | article detail | Hand-rolled cosmic + `CosmicBackground` + `ScrollThread` | Light editorial reading surface | Called out separately: diverges from family 4; light body, neutral progress line, de-glow byline | 2 |
| — | **404 / error** | `StatusScreen`, `error.tsx` | Dark cosmic | Light (or one reserved dark exception — Q3) | De-cosmic or keep as deliberate dark | 3 |

**Redirects unaffected:** `/business-types`, `/starting-points`, `/solutions` 301s and the 70 folded service redirects in `next.config.ts` stay as-is — pure routing, no visual coupling.

**Migration order rationale:** family 6 (one file, low risk) validates the light token flip cheaply; then the shared shells (families 3/4 + PageHeader + SectionShell) unlock the bulk; then the critical conversion tier (family 2) and the flagship homepage (family 1) and the heavy service template (family 5) get individual design attention.

---

## 9. Homepage information architecture

**Goal:** a shorter, decisive, mostly-light spine that states the value fast, gives one clear action, proves it, and closes — **one idea per section**, CRO-ordered. Trims the current 12 sections to ~9 and removes the duplicate routers.

| # | Section | Surface | One idea | Primary visual | Primary action |
|---|---|---|---|---|---|
| 1 | **Hero** | Light (or one dark signature — Q3) | "Digital growth, built around your goals — one connected system, the right next step." | **BuilderPreview** or **ConnectedSystemDiagram** (real product surface, right/below) | **Build my growth plan** (primary) · See how it works (secondary) |
| 2 | **Works-with rail** | Light (part of hero foot) | "Works with the tools you already use" | Real brand logos, **full colour on light** (no white-out), labelled non-endorsement | — (trust) |
| 3 | **The problem** | Light-alt band | "The digital world keeps getting bigger — you don't need all of it, you need the right parts in order." | 3 restrained points (`EditorialStatement`, de-ringed) | — |
| 4 | **Start with your goal** | Light (Clay bento) | "Pick where you want to grow." | **GoalBento** router (the 30% Clay moment) | Goal tiles → `/growth-plan?goal=` |
| 5 | **One connected system** | Light | "Everything works better connected — here's how the parts fit." | **ConnectedSystemDiagram** + static system-state cards (the site's *single* signature diagram) | See how it works → `/how-it-works` |
| 6 | **How we deliver** | Light-alt | "Four ways to work with us." | `DeliveryModels` restrained card row | — |
| 7 | **Proof** | Light | "Real outcomes." (case scenarios / testimonials, status-gated; hidden until verified) | `CaseStudyShowcase` / `TestimonialWall` | View case studies |
| 8 | **Trust: ownership + honest expectations** | Light (merge the two current sections) | "You own everything; here's what we will and won't promise." | Two-column contrast + ownership assets (flat) | — |
| 9 | **Final CTA** | **Dark (the reserved signature moment)** | "Start where you are." | One restrained mark + email-led form | **Build my growth plan** |

Removed/relocated from today's homepage: `CustomerJourneySection` (moves to `/connected-growth` and/or `/how-it-works` where the phone story has room), `ServicesConstellationSection` (retired duplicate; services live in nav + `/services`), `LearningResourcesSection` (footer + `/learn` cover it; optional as a light strip if Q4 favours keeping it). The homepage's job is *route to the plan builder*, not tour the whole site.

**Above-the-fold contract (CRO):** on a 390px viewport, the hero must show — without scrolling — the H1 value statement, one line of support copy, and the primary CTA. The product visual may sit below the fold on mobile.

---

## 10. Mobile adaptation rules

Validated at **360px and 390px**, up through 768/1024/large. No horizontal overflow (the `overflow-x:hidden` guard stays, but layouts must not *rely* on it).

1. **Compose mobile-first.** Single column by default; grids collapse `3→2→1`; bento featured tiles drop to full-width first.
2. **Signature diagrams degrade to lists.** `ConnectedSystemDiagram`, timelines, and any node/edge visual must render as an ordered/labelled **list** on narrow screens (they already do this pattern in `Constellation`/`StageTimeline` at <720px — preserve it). The diagram is enhancement; the list is the truth.
3. **No hover-only meaning.** The mega-menu is hover-driven on desktop but must be fully operable by tap/keyboard (it already is); mobile uses `MobileNav`'s accordion dialog. Any hover reveal has a tap/focus equivalent.
4. **Touch targets ≥ 44px** (`--target-min`); spacing between tappable rows ≥ 8px; CTAs full-width on mobile where they're the section's action.
5. **Type & spacing scale down, not away.** Fluid clamps keep the hero readable; section rhythm uses `--section-y-tight` on mobile. Body stays ≥ 16px.
6. **Product mockups shrink gracefully.** `BuilderPreview`/`PhoneFrame` cap at `max-width:100%`, never force min-widths that overflow; on mobile a single representative frame, not a drifting cluster.
7. **Sticky header stays compact** (`--header-h`), `scroll-padding-top` preserved so anchored/focused targets clear it (WCAG 2.4.11).
8. **Forms are mobile-native:** native `<select>`, correct `inputmode`/`autocomplete`, single-column fields, error summary in view on submit.
9. **Reduced data/motion by default on mobile:** heavier entrance reveals simplify; no parallax; diagrams static.
10. **Tables/pricing/accordions** (pricing factors, FAQ) reflow to stacked cards under ~640px — never horizontal scroll.

---

## 11. Motion rules

Motion is **functional and quiet**. It confirms, guides, and reveals — it never decorates or loops.

- **Vocabulary (allowed):** entrance reveal (fade + 8–16px translate-up, `--dur-entrance`, `--ease-out`, IO-triggered, staggered ≤ 100ms); hover feedback on interactive cards/buttons (≤ 2px lift + `--shadow-card-hover`, `--dur-base`); focus ring (instant); progress fills (builder stepper, scroll thread) that reflect real state; accordion/disclosure expand (`--dur-base`); a **one-shot** draw-in on the single signature diagram's edges (then static).
- **Banned:** continuous/ambient loops (vortex, drift, twinkle), scroll-linked parallax on content, endless rotation, bounce easing as default, gradient/glow pulsing, motion that carries meaning not present in the static state.
- **Reduced motion:** every animation has a complete static end-state (already the codebase's contract — keep it). Under `prefers-reduced-motion: reduce`, diagrams render fully drawn, reveals are instant, no smooth scroll. Verified by the existing axe/e2e approach.
- **Performance guardrails:** animate only `transform`/`opacity`; no layout-thrashing properties; IO-gate anything offscreen; keep the reveal work off the LCP path (server-render the hero H1, as today). GSAP is optional in V2 — most V2 motion is CSS + IntersectionObserver; keep `loadGsap()`'s lazy, reduced-motion-aware pattern if any timeline survives (unlikely beyond the signature diagram). `motion`/`motion/react` may be used for component transitions but is **not required** — prefer CSS for the restrained vocabulary above.
- **Budget:** at most **one** deliberate motion moment per section; the hero and final CTA may each have one signature reveal. No section runs two competing animations.

---

## 12. Accessibility & performance acceptance criteria

Every V2 change must pass these before it's "done" (extends the constitution's Definition of Done; the current suite already enforces much of it).

### Accessibility (WCAG 2.2 AA baseline — decision 10)
Explicitly in scope for every V2 surface: visible & unobscured focus (2.4.11/2.4.12), minimum target sizes (2.5.8, `--target-min: 44px`), focus restoration on overlay close, complete reduced-motion static states, full keyboard operation, screen-reader alternatives for every diagram, and no colour-only meaning.
- **Contrast:** body text ≥ 4.5:1, large/UI text & meaningful non-text ≥ 3:1, on **every** surface (light default + reserved dark). **All V2 tokens measured at lock — see the Phase 1 report; all pass.** No meaning conveyed by colour alone (status words accompany status colour — keep the existing pattern in `ProgressChecklist`/`Stepper`).
- **Keyboard & focus:** all interactive elements operable and in logical order; visible, **unobscured** focus (the V2 `--ring` uses a surface-coloured gap + brand ring, ≥ 3:1 on light and night); mega-menu, mobile dialog, accordions, tabbed timelines, forms fully keyboard-operable; Esc closes overlays and restores focus (already implemented — preserve). Sticky-header offset (`scroll-padding-top`) keeps focused anchors unobscured (2.4.12).
- **Structure & SR:** one `<h1>` per page (server-rendered), correct heading order, landmarks (`header`/`main`/`footer`/`nav`), skip link, `aria-current`, breadcrumb + JSON-LD, meaningful `alt`, decorative visuals `aria-hidden`. Diagrams expose a text alternative (`role="img"`+label or a real list).
- **Forms:** labels, `aria-describedby`, error summary with focus management, honest states, no colour-only errors (all present in `FormField`/`ContactForm` — keep).
- **Motion:** `prefers-reduced-motion` fully honoured (complete static states).
- **Gate:** `npm run test:e2e` (Playwright + `@axe-core/playwright`) green on every migrated route; zero serious/critical axe violations.

### Performance (Core Web Vitals green where realistic; Lighthouse mobile 90+, 95+ target)
- **LCP:** hero H1 server-rendered text (never motion-gated); hero product visual is `max-width:100%`, lazy below the fold, dimensioned to avoid CLS.
- **CLS ≈ 0:** all media/mockups have explicit dimensions/aspect ratios; fonts self-hosted with `display:swap` (already) and matched fallback metrics; no layout-shifting late inserts.
- **JS:** retiring the galaxy engine (`Starfield` canvas, `HeroUniverse` GSAP timeline, `CosmicBackground`) **removes** client JS and a canvas rAF loop — V2 should be *lighter* than today. Keep client boundaries small; server components by default.
- **Images:** the `next.config.ts` `images.unoptimized` + Sanity-CDN resize path stays; local SVG logos stay inline/optimized; any new mockup art is SVG or pre-sized.
- **CSS:** removing `constellation.css`, glows, and multi-stop gradients reduces paint cost; no `backdrop-filter` on scroll-heavy surfaces.
- **Gate:** `npm run build` + `npm run cf:build` succeed; Lighthouse mobile ≥ 90 on home/services/pricing/growth-plan; no regression vs current baseline.

### Security (unchanged bar, re-checked per new surface)
- CSP + security headers in `next.config.ts` continue to pass; **no new external hosts** unless justified (V2 removes cosmic assets, adds none). Any new form/endpoint gets `/owasp-security`. Form security contract (honeypot/timing/Turnstile/Zod/server-authoritative) preserved. No secrets in client or `.env.example`.

### Quality gate (per change)
`npm run lint` · `npm run typecheck` · `npm run test` · `npm run test:e2e` · `npm run build` all green; `cf:build` for hosting-affecting changes.

---

## 13. Dependency-ordered implementation roadmap

Each phase is independently shippable and leaves the site coherent. Uses the Spec Kit `plan → tasks → implement → converge` cadence per phase.

**Phase 0 — Spec sign-off & reference lock (this document).**
Approve direction + principles; resolve §15 questions (esp. Q1 references, Q3 dark moments); lock exact token values against references. *No code.*

**Phase 1 — Token foundation (the enabling change).**
Restructure `tokens/*` to light-first (§5): new neutrals/ink/brand/domain roles, shadow-for-glow swap, inverted semantic themes (`.theme-light`/`-alt`/`.theme-night`), retire `constellation.css` + glow/rainbow gradient tokens (leave temporary aliases so nothing breaks mid-migration). Update `layout.tsx` (`colorScheme`, `themeColor`, light body default). **Validate cheaply on the Legal family (family 6)** — one component, immediate visible proof the light system works. Gate: build + axe on legal routes.

**Phase 2 — Primitives & shared shells (unlocks the bulk).**
Refactor `Button` (absorb `GlowButton`), `Card` (drop glass), `IconTile` (flat), `BentoCard`, `Badge`, `ProgressChecklist`. Build **PageHeader** (replaces `CosmicPageHero`/`PageHero`) and make **SectionShell** theme/background opt-in (light default). Rebuild **SiteHeader**/**MobileNav**/**SiteFooter** light. → This migrates **families 3 & 4** (13 hubs + 6 taxonomy details) and the legacy proof family (7) largely for free. Gate: axe + build across all hub/detail routes; visual QA at 360/390px.

**Phase 3 — Signature visuals & the critical conversion tier.**
Build **ConnectedSystemDiagram** + **BuilderPreview**; refactor `PhoneFrame`/`FloatingCards`/timelines to light. Redesign the **critical tier individually**: `/growth-plan` (builder-forward), `/contact`, `/troubleshooter`, `/services`+`/pricing`+`/how-it-works`, then the **flagship homepage** to the new IA (§9), then the **`ServiceDomainTemplate`** (largest single refactor). Retire the galaxy engine (`Starfield*`, `CosmicBackground`, `GlobeArc`, `HeroUniverse`, `Constellation*`, `NodeOrb`) and the duplicate sections/orphaned `registry.tsx`. Gate: full suite + Lighthouse on the critical tier.

**Phase 4 — Convergence & cleanup.**
Delete temporary token aliases; remove dead CSS; extend unit/e2e coverage for new components; run `/code-review` + `/owasp-security` on any touched handler; `/speckit-converge` to catch residue; final CWV/axe pass site-wide. Update `docs/design-references/` with the shipped V2 (so this spec and the build agree).

**Dependency graph:** 0 → 1 → 2 → 3 → 4. Within Phase 2, PageHeader + SectionShell must land before the routes that consume them. Phase 3's homepage depends on the Phase-3 signature visuals.

---

## 14. Risks & rollback strategy

| Risk | Likelihood | Impact | Mitigation | Rollback |
|---|---|---|---|---|
| **Token flip breaks contrast on a surface** | Med | High (a11y) | Verify every text/bg pair at lock; axe gate per route; ship Phase 1 on legal first as canary | Tokens are one layer; revert `tokens/*` to restore prior look instantly |
| **Mid-migration inconsistency** (half light, half cosmic) | High | Med | Keep temporary token aliases so old components still render; migrate by shared shell (families) not page-by-page; each phase leaves site coherent | Phases are additive; unmerged phase = no user impact (task branch) |
| **Losing the brand's distinctiveness** (becomes generic light SaaS) | Med | High | Keep Sora + the infinity mark + domain-hue wayfinding + one signature diagram + Clay bento warmth; the `frontend-design` anti-pattern checklist (§4) is the guardrail | Direction is documented; adjust accent/character without re-architecting |
| **SEO/JSON-LD/redirect regressions** during route reskin | Low | High | Reskins change CSS/composition, not metadata/JSON-LD/redirects; keep server-rendered H1s; e2e asserts headings/canonical | Redirects + metadata are untouched code paths |
| **Perf regression from new mockups** | Low | Med | Retiring canvas/GSAP frees budget; new visuals are SVG/pre-sized; CWV gate | Swap heavy mockup for static image/list |
| **Scope creep on `ServiceDomainTemplate`** | Med | Med | It's isolated to Phase 3, one unit; keep its data-driven structure, change only skin/rhythm | Its own commit; revert independently |
| **Duplicate-section removal breaks a linked route** | Low | Med | Grep consumers before retiring (`registry.tsx`/`getHomepageSections` confirmed orphaned; explorer/bento pairs checked) | Keep retired files one release as `.bak`-equivalent until converge |

**Overall rollback posture:** all work lands on the task branch behind phase commits; the token layer is the single biggest lever and is fully reversible; nothing ships to production without explicit authorization (`cf:deploy` is gated). The redesign is a **refactor of skin + composition on a preserved architecture**, which is what makes rollback cheap.

---

## 15. Resolved product decisions (approved — locked)

The following are the approved answers to the original open questions. They govern every subsequent phase.

1. **Visual references.** The supplied concepts are references for *component variety, bento layouts, card types, icon systems, information architecture, branded colour continuity, and product/system mockups* — **not** an instruction to preserve full-screen galaxies, giant globes, repeated constellation backgrounds, excessive neon bloom, oversized cinematic illustrations, or every section filling the viewport. The V2 target remains **~70% Stripe** (structure, restraint, product clarity) **+ ~30% Clay** (colour, bento, warmth) as **original Infinite Weblinks identity**. The §5 token values are **the initial approved values**, to be reviewed visually via the foundation preview before wider migration. *(Phase 1 locks them; all measured AA-compliant.)*
2. **Brand mark & gradients.** **Keep** the existing multicolour gradient **inside** the infinity logo mark (`BrandSprite` `#iw-grad`). **Outside** the logo: retire the 5-stop spectrum; permit **one restrained two-colour signature gradient** (`--v2-grad-signature`, violet→pink) used **only** for selected primary CTAs or rare signature moments. Ordinary cards, icons, headings and backgrounds must **not** use rainbow gradients.
3. **Dark surfaces (approved strategy).** Homepage hero **light**; final CTA **dark**; footer **light**; 404/error **light**; long-form & legal **light**. **One additional dark signature section** is allowed *only* when it communicates a meaningful product idea. **Dark is never the default fallback.**
4. **Homepage.** Approve the ~9-section structure (§9). Remove/relocate: `ServicesConstellationSection` off the homepage, the homepage learning-resources strip, duplicate goal/service routers, and oversized customer-journey visuals off the homepage. Dedicated **service, learn and connected-growth routes are kept.**
5. **Pricing.** **Do not invent prices, tiers or ranges.** Keep the existing *"how pricing works"* positioning. A `PricingCard`/`EngagementCard` may be built **later** for one-off project · ongoing support · managed delivery · specialist engagement, using labels like **"Custom quote"** until truthful, business-approved figures exist.
6. **CTA hierarchy.** Default sitewide **primary CTA: "Build my growth plan."** Secondary is contextual (commonly *See how it works* / *Explore services* / *Contact us*). On the contact page, **the contact-form submission is the primary action.**
7. **Duplicate components.** **Keep the bento-based route components; retire the older explorer variants** during the later migration phase. **Cosmic terminology must not survive** in renamed V2 components — e.g. `ServicesConstellationSection` → **`ServicesBentoSection`** (or `ServicesGridSection`); no "cosmic/constellation/universe/galaxy" names on components that are no longer cosmic.
8. **Sanity.** **Keep local seed content** as the active source during V2. Enabling live Sanity content is **out of scope** for this redesign phase.
9. **Styling technology.** **Keep CSS Modules + CSS custom properties + the existing Next.js architecture + Server Components by default.** Do **not** introduce Tailwind, shadcn, a second styling framework, or a general component dependency merely to reproduce components the repo already supports.
10. **Accessibility standard.** Target is **WCAG 2.2 AA** (was 2.1). The existing contract holds and explicitly includes visible/unobscured focus, minimum target sizes, focus restoration, reduced-motion static states, keyboard operation, screen-reader alternatives for diagrams, and no colour-only meaning.

> **Implementation namespacing note.** During the phased migration the V2 primitives ship under a `--v2-*` namespace (`src/styles/tokens/v2.css`) so they never collide with legacy tokens and can be reviewed/rolled back in isolation. They are mapped onto the existing semantic token names (`--surface`, `--text-heading`, `--ring`, …) inside `.theme-light` / `.theme-light-alt` / `.theme-night`. At the final convergence phase — once every consumer has migrated and the legacy layer is deleted — the `--v2-` primitives are promoted to the canonical names used in §5.

---

*Specification approved for phased implementation. Phase 1 (foundation + canary) is implemented on this branch; see `docs/design/phase-1-implementation-report.md`. Phases 2+ remain gated on review of the foundation preview.*
