# V3 "INSTRUMENT" — HANDOFF FOR CLAUDE CODE

Repo: https://github.com/optimisticjp/Infinite-Weblinks (public, `main`)

Attach this file to a Claude Code session and say:
> Read V3_HANDOFF.md and do Phase 1. Branch, verify, commit, open a PR.

---

## 1. CONTEXT

The site was a light-first, text-only marketing site with no imagery: 11 brand-logo SVGs
and one icon are the entire visual inventory. The owner found it flat and catalogue-like.

Reference sites the owner chose: **raycast.com, attio.com, cuberto.com, pitch.com**. What
they share is not colour, it is that every one of them is carried by a rendered artifact
(real product UI, real decks, real 3D). The redesign follows that: **dark, high-craft,
product-led**, with the growth plan / roadmap / troubleshooter rendered as real interfaces.

Owner decisions, already made, do not re-ask:
- Whole site goes dark, including long-form pages.
- The real plan builder gets upgraded to match the mockups (not the reverse).
- The release candidate is already shipped. Do not hold work for it.

---

## 2. WHAT V3 REPLACES

V2 ("Clear Systems") converged the site to light-first with dark reserved for one section.
That decision is deliberately reversed. V3 does **not** fork the semantic contract — it
reuses V2's token NAMES and supplies different VALUES. That is why a site-wide inversion
needs no component edits.

`docs/design/v2-design-spec.md` is now superseded. Write `docs/design/v3-design-spec.md`
recording the reversal and why.

---

## 3. PHASE 1 — DONE AND VERIFIED, JUST APPLY IT

Verified on a clean checkout: typecheck clean, lint clean, **2006 tests green**, production
build passes. Flipping the whole site dark broke exactly 1 test out of 2000 — the one that
encoded the old light-first decision.

### 3a. CREATE `src/styles/tokens/v3.css`

Exact contents:

```css
/* ============================================================
   V3 FOUNDATION TOKENS — "Instrument"  (Raycast / Attio register)
   Supersedes the V2 light-first surface decision. See docs/design/v3-design-spec.md.

   WHY THIS EXISTS
   ---------------
   V2 ("Clear Systems") converged on a light-first site with dark reserved for a
   single signature section. V3 inverts that: the whole document is dark, and the
   site is carried by rendered product interfaces (the growth plan, the roadmap,
   the troubleshooter) rather than by decorative graphics.

   V3 does NOT fork the semantic contract. Components keep reading the same names
   V2 gave them (--surface, --text-heading, --hairline, --shadow-*, --ring, and the
   --v2-domain-* wayfinding hues). This file only supplies different VALUES for
   them. That is why a site-wide inversion needs no component edits.

   CONTRAST
   --------
   Every pair below was measured (WCAG 2.2 AA: body text >= 4.5:1, large/UI/
   non-text >= 3:1). Measured minima are noted inline. The weakest text pair in
   the system is --v3-brand-text on --v3-ink-850 at 4.98:1.

   DO NOT
   ------
   - No colour glows. Elevation is neutral shadow plus a hairline top highlight.
   - No decorative full-bleed gradients. The signature gradient stays CTA-only.
   - No pure black (#000). The canvas is #08080A so panels can sit above it.
   ============================================================ */

:root {
  /* ---- Ink scale: the dark surface stack ----
     Neutral with a very slight cool cast. Deliberately NOT indigo/navy: a blue-black
     canvas plus violet accents reads as generic AI-template. Neutral reads as tooling. */
  --v3-ink-950: #08080a; /* page canvas */
  --v3-ink-900: #0d0d10; /* raised: cards, panels */
  --v3-ink-850: #131317; /* raised-2: panel bodies, nested fills */
  --v3-ink-800: #1a1a20; /* inputs, tiles, chips */
  --v3-ink-750: #21212a; /* hover / pressed on a raised surface */

  /* ---- Text on the dark stack (measured against #08080a … #1a1a20) ---- */
  --v3-on-strong: #f3f3f6; /* headings — 18.07:1 canvas / 15.64:1 input */
  --v3-on-body: #b9b9c6; /* body — 10.31:1 canvas / 8.92:1 input */
  --v3-on-muted: #9a9aa8; /* secondary, captions — 7.21:1 canvas / 6.24:1 input */
  --v3-on-faint: #6e6e7c; /* DECORATIVE / disabled only — 3.99:1. Never body copy. */

  /* ---- Lines ----
     -hairline is decorative separation. -strong is a functional control edge and
     clears 3:1 as a non-text boundary. */
  --v3-line: rgba(255, 255, 255, 0.075);
  --v3-line-2: rgba(255, 255, 255, 0.13);
  --v3-line-strong: rgba(255, 255, 255, 0.24);

  /* ---- Brand ----
     Two values, because one colour cannot do both jobs on dark: -text is lifted for
     legibility as link/accent text, -fill stays the saturated CTA surface. */
  --v3-brand-text: #8b6bff; /* links, accent text/icons — 5.38:1 canvas, 4.98:1 on ink-850 */
  --v3-brand-fill: #6b4eff; /* CTA fill — white on it measures 5.05:1 */
  --v3-brand-hover: #7a5fff;
  --v3-brand-tint: rgba(107, 78, 255, 0.14); /* selected / active soft fill */
  --v3-brand-edge: rgba(107, 78, 255, 0.42);

  /* ---- Domain wayfinding, brightened for a dark surface ----
     Same seven worlds and the same token NAMES as V2, so every existing consumer
     (domainColor.ts, deliveryModel.ts, IconTile, Badge, BentoCard, the header and
     footer) re-themes with no edit. The V2 values were inks built for white paper
     and fail badly here; these were re-measured. Worst case 6.36:1 as text. */
  --v3-domain-strategy: #a78bfa; /* 7.35:1 canvas */
  --v3-domain-build: #6fa8ff; /* 8.31:1 */
  --v3-domain-discover: #2dd4c4; /* 10.79:1 */
  --v3-domain-convert: #ff6fa3; /* 7.68:1 */
  --v3-domain-operate: #ffa05c; /* 9.94:1 */
  --v3-domain-retain: #4fda8b; /* 11.18:1 */
  --v3-domain-ai: #f5cc57; /* 13.01:1 */

  /* ---- Status, matched to the domain hue family ---- */
  --v3-success: #4fda8b;
  --v3-warning: #ffa05c;
  --v3-danger: #ff6f7d;
  --v3-info: #6fa8ff;

  /* ---- Elevation ----
     Layered neutral shadow. On dark, a shadow alone reads as nothing, so every
     raised surface also gets --v3-edge-top: a 1px light hairline along its top edge.
     That pairing is what produces the "real interface" feel; it is not decoration. */
  --v3-shadow-xs: 0 1px 2px rgba(0, 0, 0, 0.5);
  --v3-shadow-sm: 0 2px 6px rgba(0, 0, 0, 0.45), 0 1px 2px rgba(0, 0, 0, 0.4);
  --v3-shadow-md: 0 8px 24px -6px rgba(0, 0, 0, 0.6), 0 2px 6px rgba(0, 0, 0, 0.4);
  --v3-shadow-lg: 0 32px 64px -20px rgba(0, 0, 0, 0.85), 0 12px 28px -10px rgba(0, 0, 0, 0.6);
  --v3-shadow-panel: 0 40px 80px -24px rgba(0, 0, 0, 0.9), 0 16px 32px -12px rgba(0, 0, 0, 0.65);
  --v3-edge-top: inset 0 1px 0 rgba(255, 255, 255, 0.07);

  /* ---- Grain ----
     Large flat dark fields band on 8-bit displays. A ~3% noise overlay removes it.
     Applied once on the body pseudo-element, never per component. */
  --v3-grain-opacity: 0.028;

  /* ---- Focus ring — brand, with a surface-coloured gap so it detaches ---- */
  --v3-ring: 0 0 0 2px var(--surface), 0 0 0 4px var(--v3-brand-text);

  /* ---- Typography ----
     Display weight goes back up from V2's restrained 700. On dark, type needs more
     mass to hold the same optical weight it had on paper. Tracking tightens to match. */
  --v3-fw-display: 800;
  --v3-fw-heading: 700;
  --v3-fs-display: clamp(2.375rem, 4.6vw, 3.75rem);
  --v3-tracking-display: -0.045em;
  --v3-tracking-heading: -0.035em;

  /* ---- Long-form reading ----
     Dark backgrounds make long prose harder to track. Reading surfaces lift one step
     off the canvas and the measure narrows slightly. Used by the learn/guide routes. */
  --v3-read-surface: var(--v3-ink-900);
  --v3-read-measure: 68ch;
}

/* ============================================================
   V3 THEME CLASSES
   Same semantic token names V2 defined, different values. Any component already
   reading --surface / --text-heading / --hairline re-themes automatically.
   ============================================================ */

/* Deep — the V3 default canvas. Carried by <body>. */
.theme-deep,
.theme-deep-alt,
.theme-night {
  color-scheme: dark;

  --surface-hover: rgba(255, 255, 255, 0.055);
  --text-heading: var(--v3-on-strong);
  --text-body: var(--v3-on-body);
  --text-muted: var(--v3-on-muted);
  --text-faint: var(--v3-on-faint);

  --hairline: var(--v3-line);
  --hairline-2: var(--v3-line-2);
  --hairline-strong: var(--v3-line-strong);

  --link: var(--v3-brand-text);
  --link-hover: #b9a3ff;
  --cta-text: #ffffff;

  --shadow-sm: var(--v3-shadow-sm);
  --shadow-md: var(--v3-shadow-md);
  --shadow-lg: var(--v3-shadow-lg);
  --shadow-card: var(--v3-shadow-md);
  --shadow-panel: var(--v3-shadow-panel);
  --edge-top: var(--v3-edge-top);

  --ring: var(--v3-ring);
  --brand: var(--v3-brand-text);
  --brand-strong: var(--v3-brand-hover);
  --brand-fill: var(--v3-brand-fill);
  --brand-tint: var(--v3-brand-tint);
  --brand-edge: var(--v3-brand-edge);

  /* Domain hue remap — this is what re-themes every wayfinding consumer.
     ink / tint / line keep their V2 role split: ink is text+icon, tint is a soft
     fill, line is the accent rail. On dark, tint becomes a low-alpha wash of the
     hue itself rather than a pale pastel. */
  --v2-domain-strategy-ink: var(--v3-domain-strategy);
  --v2-domain-strategy-line: var(--v3-domain-strategy);
  --v2-domain-strategy-tint: rgba(167, 139, 250, 0.14);
  --v2-domain-build-ink: var(--v3-domain-build);
  --v2-domain-build-line: var(--v3-domain-build);
  --v2-domain-build-tint: rgba(111, 168, 255, 0.14);
  --v2-domain-discover-ink: var(--v3-domain-discover);
  --v2-domain-discover-line: var(--v3-domain-discover);
  --v2-domain-discover-tint: rgba(45, 212, 196, 0.14);
  --v2-domain-convert-ink: var(--v3-domain-convert);
  --v2-domain-convert-line: var(--v3-domain-convert);
  --v2-domain-convert-tint: rgba(255, 111, 163, 0.14);
  --v2-domain-operate-ink: var(--v3-domain-operate);
  --v2-domain-operate-line: var(--v3-domain-operate);
  --v2-domain-operate-tint: rgba(255, 160, 92, 0.14);
  --v2-domain-retain-ink: var(--v3-domain-retain);
  --v2-domain-retain-line: var(--v3-domain-retain);
  --v2-domain-retain-tint: rgba(79, 218, 139, 0.14);
  --v2-domain-ai-ink: var(--v3-domain-ai);
  --v2-domain-ai-line: var(--v3-domain-ai);
  --v2-domain-ai-tint: rgba(245, 204, 87, 0.14);

  /* Status remap, same reason */
  --v2-success: var(--v3-success);
  --v2-success-tint: rgba(79, 218, 139, 0.14);
  --v2-warning: var(--v3-warning);
  --v2-warning-tint: rgba(255, 160, 92, 0.14);
  --v2-danger: var(--v3-danger);
  --v2-danger-tint: rgba(255, 111, 125, 0.14);
  --v2-info: var(--v3-info);
  --v2-info-tint: rgba(111, 168, 255, 0.14);

  /* V2 brand primitives remapped so any component still reading them stays legible */
  --v2-brand: var(--v3-brand-text);
  --v2-brand-strong: var(--v3-brand-hover);
  --v2-brand-tint: var(--v3-brand-tint);
  --v2-line: var(--v3-line);
  --v2-line-strong: var(--v3-line-strong);

  background-color: var(--surface);
  color: var(--text-body);
}

/* Canvas level */
.theme-deep {
  --surface: var(--v3-ink-950);
  --surface-raised: var(--v3-ink-900);
  --surface-raised-2: var(--v3-ink-850);
  --surface-input: var(--v3-ink-800);
}

/* Alternating band — one step up, so a card on it still reads as raised. */
.theme-deep-alt {
  --surface: var(--v3-ink-900);
  --surface-raised: var(--v3-ink-850);
  --surface-raised-2: var(--v3-ink-800);
  --surface-input: var(--v3-ink-800);
}

/* Night — retained so the existing FinalCtaSection consumer keeps working.
   In V3 it is the deepest surface, used for the closing CTA moment. */
.theme-night {
  --surface: var(--v3-ink-950);
  --surface-raised: var(--v3-ink-850);
  --surface-raised-2: var(--v3-ink-800);
  --surface-input: var(--v3-ink-800);
}

/* Grain — applied once, on the document only. Large flat dark fields band on 8-bit
   displays; ~3% noise removes it. pointer-events:none so it never intercepts input,
   and it sits below all content. Not repeated per component. */
body.theme-deep::before {
  content: "";
  position: fixed;
  inset: 0;
  z-index: 0;
  pointer-events: none;
  opacity: var(--v3-grain-opacity);
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='140' height='140'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.85' numOctaves='3'/%3E%3C/filter%3E%3Crect width='140' height='140' filter='url(%23n)'/%3E%3C/svg%3E");
}

/* Heading weight + tracking on V3 surfaces */
.theme-deep :is(h1, h2, h3, h4),
.theme-deep-alt :is(h1, h2, h3, h4),
.theme-night :is(h1, h2, h3, h4) {
  font-weight: var(--v3-fw-heading);
  letter-spacing: var(--v3-tracking-heading);
}

/* Long-form reading surfaces lift off the canvas and narrow the measure. */
.theme-deep .v3-prose,
.theme-deep-alt .v3-prose,
.theme-night .v3-prose {
  max-width: var(--v3-read-measure);
}

```

### 3b. EDIT `src/styles/globals.css`

Append at the very end, so V3 wins the cascade:

```css
/* V3 foundation ("Instrument") — the CURRENT system. Dark-first, product-led.
   Imported LAST so its semantic values win over the V2 light mapping. V2 is retained
   because V3 reuses its token NAMES and its primitives are still referenced.
   See docs/design/v3-design-spec.md. */
@import "./tokens/v3.css";
```

### 3c. EDIT `src/app/layout.tsx`

Three changes:

1. `<body className="theme-light">` becomes `<body className="theme-deep">`
2. In `export const viewport`: `themeColor: "#ffffff"` becomes `themeColor: "#08080a"`,
   and `colorScheme: "light"` becomes `colorScheme: "dark"`
3. Replace the stale V2 convergence comment above `export const viewport` with:

```
// V3 convergence ("Instrument"): the document root is dark-first. The theme-colour matches the V3
// base canvas (--v3-ink-950) so the browser chrome, overscroll canvas, scrollbars and native form
// controls all agree with the page instead of flashing white on load. V2's light classes remain
// defined for any surface that opts back into paper; nothing does so by default.
```

Also update the inline comment above `<body>` from "theme-light on <body> adopts the final
V2 light semantic mapping" to "theme-deep on <body> adopts the V3 dark semantic mapping".

### 3d. DELETE `tests/unit/v2-root-convergence.test.ts`

It guards the reversed decision. It is replaced, not dropped.

### 3e. CREATE `tests/unit/v3-root-convergence.test.ts`

Exact contents:

```ts
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { describe, it, expect } from "vitest";

/**
 * V3 ("Instrument") — the document root is converged to DARK-first.
 *
 * This file replaces v2-root-convergence.test.ts, which guarded the previous light-first
 * decision (Phase 2S). That decision was deliberately reversed; see docs/design/v3-design-spec.md.
 * The guard is rewritten rather than removed so the new decision is enforced just as hard as
 * the old one was: the viewport declares dark + the ink-950 canvas, the body adopts the V3
 * semantic mapping, and the global treatments stay token-driven with no hard-coded colour.
 */
const read = (rel: string) => readFileSync(fileURLToPath(new URL(rel, import.meta.url)), "utf8");
const layout = read("../../src/app/layout.tsx");
const base = read("../../src/styles/tokens/base.css");
const v3 = read("../../src/styles/tokens/v3.css");
const globals = read("../../src/styles/globals.css");

describe("root viewport + body (app/layout.tsx)", () => {
  it("declares a dark colour-scheme and the ink-950 theme-colour", () => {
    expect(layout).toMatch(/colorScheme:\s*"dark"/);
    expect(layout).toMatch(/themeColor:\s*"#08080a"/);
    expect(layout).not.toMatch(/colorScheme:\s*"light"/);
  });

  it("adopts the V3 dark mapping on <body>", () => {
    expect(layout).toMatch(/<body className="theme-deep">/);
    expect(layout).not.toMatch(/<body className="theme-light">/);
  });
});

describe("v3.css token layer", () => {
  it("is imported last so its semantic values win over the V2 light mapping", () => {
    const v3At = globals.indexOf("tokens/v3.css");
    const v2At = globals.indexOf("tokens/v2.css");
    expect(v3At).toBeGreaterThan(-1);
    expect(v3At).toBeGreaterThan(v2At);
  });

  it("defines the three dark surface classes", () => {
    for (const cls of [".theme-deep", ".theme-deep-alt", ".theme-night"]) {
      expect(v3).toContain(cls);
    }
  });

  it("remaps every domain wayfinding hue so light-paper inks never render on dark", () => {
    for (const d of ["strategy", "build", "discover", "convert", "operate", "retain", "ai"]) {
      expect(v3).toMatch(new RegExp(`--v2-domain-${d}-ink:\\s*var\\(--v3-domain-${d}\\)`));
    }
  });

  it("uses no pure black canvas (panels must be able to sit above the page)", () => {
    expect(v3).not.toMatch(/--v3-ink-950:\s*#000\b/);
    expect(v3).not.toMatch(/--v3-ink-950:\s*#000000\b/);
  });

  it("keeps elevation neutral — shadows and a hairline edge, never a colour glow", () => {
    const shadows = v3.match(/--v3-shadow-[a-z]+:[^;]+;/g) ?? [];
    expect(shadows.length).toBeGreaterThan(0);
    for (const s of shadows) {
      expect(s).toMatch(/rgba\(0,\s*0,\s*0/);
    }
    expect(v3).toContain("--v3-edge-top");
  });

  it("splits brand into a legible text value and a saturated fill value", () => {
    expect(v3).toContain("--v3-brand-text");
    expect(v3).toContain("--v3-brand-fill");
  });

  it("applies grain once on the document, never per component", () => {
    expect(v3).toMatch(/body\.theme-deep::before/);
    expect(v3).toContain("pointer-events: none");
  });
});

describe("base.css canvas + global treatments", () => {
  it("the body canvas stays theme-driven via semantic tokens", () => {
    const body = base.slice(base.indexOf("\nbody {"), base.indexOf("\nbody {") + 400);
    expect(body).toContain("background: var(--surface)");
    expect(body).toContain("color: var(--text-body)");
  });

  it("selection uses a brand tint rather than a hard-coded colour", () => {
    expect(base).toMatch(/::selection\s*\{[^}]*color-mix\(in srgb, var\(--v2-brand\)/);
    expect(base).not.toContain("rgba(245, 25, 126, 0.32)");
  });

  it("autofilled controls stay pinned to the themed surface + ink", () => {
    expect(base).toMatch(/-webkit-autofill/);
    expect(base).toMatch(/-webkit-text-fill-color: var\(--text-heading\)/);
    expect(base).toMatch(/-webkit-box-shadow: 0 0 0 1000px var\(--surface-input/);
  });
});

```

### 3f. VERIFY

```bash
npm ci
npm run typecheck   # must be clean
npm run lint        # must be clean
npm run test        # must be 86 files / 2006 tests green
npm run build       # must succeed
```

---

## 4. THE PALETTE, AND WHY

Canvas `#08080A` · raised `#0D0D10` · panel `#131317` · input `#1A1A20`
Heading `#F3F3F6` · body `#B9B9C6` · muted `#9A9AA8`

All measured WCAG 2.2 AA. Worst text pair in the system is 4.98:1 (brand link on panel).
Domain hues as text: worst 6.36:1. Nothing relies on the 3:1 large-text allowance.

**Deliberately neutral, not indigo.** A blue-black canvas with violet accents is the generic
AI-template look and the owner rejected it explicitly. Neutral reads as tooling. Do not
"warm it up" or shift it blue.

The seven domain hues were the real work. V2's values are dark inks built for white paper
and are unreadable on dark. Every consumer reads them as `var(--v2-domain-X-ink)` rather
than raw hex, so the theme class remaps them and these all re-theme for free:
`domainColor.ts`, `deliveryModel.ts`, `IconTile`, `Badge`, `BentoCard`, `SiteHeader`,
`SiteFooter`, and the resources / FAQ / design-preview routes.

---

## 5. REMAINING PHASES

### Phase 2 — primitives
- `Panel` — the product-surface card: `--surface-raised`, 1px hairline, `--v3-edge-top`
  highlight along the top edge, `--v3-shadow-panel`. The hairline is what makes it read as
  a real interface on dark; a shadow alone reads as nothing.
- `FloatingCard` — smaller card that overlaps a Panel at a different depth.
- `DataTable` — filterable row list with a leading domain-colour dot, hover row highlight,
  and an arrow that appears on hover.
- Mockup components (plan panel, roadmap, troubleshooter). **Wire these to the real content
  layer** (`src/lib/content/data/*`), never hard-coded strings, so they stay correct as
  content changes.

### Phase 3 — homepage
Rebuild the spine. `tests/unit/v2-homepage-safety.test.ts` hard-codes the current
eight-section order and will fail; rewrite it to the new spine, do not delete it. Keep
`page.tsx` a server component and push `"use client"` down into the sections.

### Phase 4 — rollout
Route by route, hubs before detail pages. Long-form reading pages use `--v3-read-surface`
(one step off canvas) and `--v3-read-measure` so dark prose stays trackable.

### Phase 5 — gates
axe green, mobile 360/390 with no horizontal overflow, Core Web Vitals, and regenerate all
36 screenshots in `docs/release/phase-3c-visual/` since every one is now obsolete.

---

## 6. GUARDRAILS

- **No colour glows.** Elevation is neutral shadow plus the hairline edge. V2's rule holds.
- **No decorative gradients.** The signature gradient stays CTA-only.
- **No pure black.** `#08080A` so panels sit visibly above the canvas.
- **No fourth font.** Plus Jakarta Sans handles UI chrome. Core Web Vitals are a stated
  non-negotiable and a fourth family is not worth the budget.
- **Grain is applied once** on `body.theme-deep::before`. Never per component.
- **Every animation needs a complete `prefers-reduced-motion` static state.** The axe suite
  enforces it.
- **Do not edit `.claude/skills/`.** CLAUDE.md forbids it.
- **Invented proof is not allowed.** The prototype had a "+38% enquiries" card. The
  constitution's evidence rules block unverified claims — either back it with real data or
  leave it out.

---

## 7. IF YOU NEED THE VISUAL TARGET

`/mnt/user-data/outputs/homepage-product-led.html` was the approved prototype. If it is not
attached, the register is: Raycast/Attio. Rendered product interfaces carrying the page,
hairline borders, layered depth, tabular numerals, tight type, hover states on every row,
colour living inside the UI rather than on the page chrome.
