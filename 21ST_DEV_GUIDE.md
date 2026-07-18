# Using 21st.dev / shadcn Components in Infinite Weblinks

[21st.dev](https://21st.dev) and [shadcn/ui](https://ui.shadcn.com) are marketplaces of React
UI components. They ship as **Tailwind-classed** components. As of today, Infinite Weblinks
styles with **CSS Modules** and a **CSS-variable design-token system** (`src/styles/`), and
shadcn is **not yet initialized** (there is no `components.json`) — but that's the current
default, not a locked foundation.

**You have two fully-supported paths. Pick the one that produces the better result:**

- **Path A — Adapt into the existing system.** Take the component's markup and behavior and
  **translate its Tailwind utilities into CSS Modules + this repo's design tokens**. Best when
  you want one or a few components and prefer to keep a single styling system. This guide's
  §3–§6 walk through it.
- **Path B — Adopt Tailwind / initialize shadcn / add 21st.dev components directly.** When the
  task genuinely benefits — bringing in many components, or building on shadcn's primitives —
  you may add Tailwind and run `shadcn init`. This is a deliberate choice you can make and act
  on (briefly explain why, then proceed); it is **not** gated behind a separate approval step.
  Reconcile it with the existing CSS-variable tokens and the site's CSP rather than blindly
  replacing the design foundation. See §7.

> **Golden rule:** paste nothing you haven't read. Treat every external component as a draft to
> adapt — substantially rewrite, combine, or extend it — not a black box to trust.

> **Know which path you're on.** On Path A, don't add `className="flex gap-4 ..."` Tailwind
> utilities — they do nothing until Tailwind is installed; translate them (see §4). On Path B,
> install Tailwind first, then the utilities work as written.

---

## What this project actually provides

| Concern | Infinite Weblinks | (shadcn/21st.dev assume) |
|---|---|---|
| Styling | **CSS Modules** (`*.module.css`) | Tailwind utility classes |
| Theme | **CSS-variable tokens** in `src/styles/tokens/` (`colors`, `spacing`, `typography`, `effects`, `base`) + `src/styles/globals.css` | Tailwind theme + `globals.css` vars |
| Components | `src/components/` — `brand/ builder/ chrome/ forms/ hero/ primitives/ routes/ sections/ seo/ troubleshooter/ viz/` | `src/components/ui`, `src/components/sections` |
| Icons | **lucide-react** | lucide-react |
| Animation | **GSAP** + **Motion** (`motion/react`) | Motion / framer-motion |
| Utilities | plain CSS Modules; no `cn()` / `clsx` / `tailwind-merge` by default | `cn()` (clsx + tailwind-merge) |

There is **no `cn()` helper and no `components.json`** in this project. Components that import
`@/lib/utils`'s `cn()` need that call removed or replaced when you adapt them.

---

## 1. Choose a component

1. Browse [21st.dev](https://21st.dev) / [shadcn/ui](https://ui.shadcn.com) and find a component
   that matches the *structure* you need (navbar, hero, pricing, testimonial grid, etc.).
   Prioritize structure and interaction logic over decoration — you will re-skin it with this
   project's tokens anyway.
2. Choose by **what serves the design**. Heavy motion, parallax, cursor followers, WebGL, and
   3D are all fair game **when the direction calls for them** (Principle XV). What to drop is
   *incidental* spectacle that doesn't earn its place (see §5) — not effects by category. Every
   dependency a component drags in should earn its weight in the result; the ones that don't,
   remove.
3. Remember the visual direction: dark, space-inspired, neon-lit, glowing gradients, premium
   cards, subtle glass. Choose components you can bend toward that, and **preserve the existing
   design system** — don't import a look that fights the tokens.

---

## 2. Bring the source into the repo

You will usually have either a **CLI command** or a **raw source snippet**.

### CLI commands (research, inspect — and add, once initialized)

`npx shadcn@latest add "<url>"` and similar commands assume an initialized shadcn project
(Tailwind + `components.json`). Until you initialize (Path B), use the CLI to **research and
inspect** — running `add` before init won't wire up correctly:

```bash
npx shadcn@latest search <query>          # discover registry components
npx shadcn@latest view <component>        # read its source/metadata
npx shadcn@latest add <component> --dry-run   # see what it *would* write, without writing
```

On **Path A**, read the output and hand-port the parts you want into a CSS-Modules component
(§4). On **Path B**, once you've run `shadcn init`, `npx shadcn@latest add <component>` writes
components into the tree directly — that's expected and fine.

### Raw source

If you have the JSX/TSX, add it as a new component under the right `src/components/<group>/`
folder with its own `*.module.css`, and wire it in. Then walk §3–§6 before shipping. Read the
component top to bottom first — imports, `"use client"`, external network calls, inline styles,
and hard-coded colors.

---

## 3. Inspect dependencies (Path A)

Before accepting new packages, find out exactly what the component pulls in. (On **Path B**,
where you've installed Tailwind and initialized shadcn, `clsx` / `tailwind-merge` / `cn()` are
part of the toolchain and stay — this section is for the adapt-into-CSS-Modules path.)

1. **Scan the imports.** Anything not from `react`, `next/*`, `@/*`, `lucide-react`,
   `motion/react`, or `gsap` is a **new dependency** to evaluate — keep it if it earns its
   weight, drop it if it doesn't.
2. **Drop Tailwind-only helpers.** `clsx` / `tailwind-merge` / `class-variance-authority`
   exist to manage Tailwind class strings — you don't need them on Path A. Replace conditional
   `cn()` class logic with CSS-Module class composition (e.g. `styles.card`, and toggle a
   `styles.active` class with a template literal or an array `.join(" ")`).
3. **Avoid duplicate animation runtimes.** This project already ships **Motion**
   (`motion/react`) and **GSAP**. If a component imports `framer-motion`, rewrite the import to
   `motion/react` (same API) rather than adding a second runtime that does the same job — a
   consistency call, not a ban on other libraries.
4. **Install intentionally**, one line, and note it — then re-run `npm run build`. A dependency
   that breaks the build or balloons the bundle is a dependency to remove.

---

## 4. Translate Tailwind → CSS Modules + design tokens

This is the core step. The goal: the component looks like it was always part of this project,
reads the repo's tokens, and responds to the design system — not to Tailwind classes that
aren't there.

Create a `Component.module.css` next to the component and move styles there. Map utilities to
the CSS-variable tokens defined in `src/styles/tokens/`:

| Tailwind utility (from the source) | CSS Modules + token equivalent |
|---|---|
| `bg-white` / `bg-black` / `bg-gray-950` | `background: var(--color-surface)` / `var(--color-bg)` (from `tokens/colors.css`) |
| `text-black` / `text-gray-900` | `color: var(--color-text)` |
| `text-gray-500` / `text-gray-400` | `color: var(--color-text-muted)` |
| `bg-blue-600` (brand action) | `background: var(--color-primary)` + `color: var(--color-on-primary)` |
| `border-gray-200/800` | `border: 1px solid var(--color-border)` |
| `ring-blue-500` (focus) | `outline` / `box-shadow` using `var(--color-focus)` |
| `rounded-[10px]` / `rounded-lg` | `border-radius: var(--radius-…)` (from `tokens/effects.css`) |
| `p-4` / `gap-6` / `mt-8` | `padding` / `gap` / `margin` using `var(--space-…)` (from `tokens/spacing.css`) |
| `text-2xl` / `font-bold` | `font-size` / `font-weight` using `var(--font-…)` (from `tokens/typography.css`) |
| `shadow-xl` / glow | `box-shadow: var(--shadow-…)` / gradient effects from `tokens/effects.css` |

> Read the actual token names in `src/styles/tokens/*.css` before mapping — use the tokens the
> project defines, and if a needed token is genuinely missing, add it in the token layer (so
> the design stays centralized), not inline in a component.

Then:

- **Delete `dark:` / `light:` variants.** The token system already resolves per-theme; encode
  theme differences in the tokens, not in duplicated component classes.
- **Reuse this repo's primitives** (`src/components/primitives/`) and existing section shells so
  spacing, type, and interaction stay consistent.
- **Re-theming is centralized.** Never hard-code brand colors in a component — change them once
  in the token layer and every adapted component follows. **Preserve the existing design
  system and visual direction.**

---

## 5. Remove unnecessary effects (keep the ones that serve the design)

Most performance and accessibility problems in pasted components come from effects you didn't
need. But this project's design references *do* call for rich, expressive motion — so the rule
is **curate, not strip-everything**:

- **Keep effects that match the direction** (glow, gradient reveals, connected-systems motion),
  and implement them with **GSAP** (timeline/scroll choreography) or **Motion** (component-level
  animation) — the runtimes already installed — rather than a new library.
- **Downgrade incidental decoration to CSS.** A hover color/scale change is a
  `transition` / `transform` in the module, not JavaScript.
- **Cut `"use client"` when you can.** If, after adaptation, a component has no state, effects,
  or handlers, render it as a Server Component. Push interactivity into the smallest child.
- **Replace stock imagery / external hosts.** The site's CSP disallows arbitrary image hosts
  (only `self`, `data:`, and the Sanity CDN). Swap remote `<img>` / avatars for local `/public`
  assets, `lucide-react` icons, or text initials.
- **Always gate motion on preference.** Every animation must respect `prefers-reduced-motion`
  (via `useReducedMotion()` in Motion, GSAP `matchMedia`, or a `@media (prefers-reduced-motion)`
  rule). Scale heavy motion down on mobile rather than deleting the direction.

---

## 6. Verify mobile, accessibility, and performance

Do not consider a ported component "done" until it passes these checks — the same bar the whole
project holds.

### Mobile
- Test at **360px and 390px**. There must be **no horizontal scroll**.
- Common overflow causes: fixed pixel widths, `100vw` inside padded containers, `white-space:
  nowrap` on long text, oversized headings. Prefer `width: 100%`, `max-width`, fluid `clamp()`
  type, and `min-width: 0` on flex children holding text.
- Touch targets ~40px+; stack multi-column layouts to one column on small screens.

### Accessibility (the e2e suite runs axe — keep it green)
- **Keyboard:** real `<button>` / `<a>`, reachable by Tab, operable by Enter/Space, with a
  visible focus style using the focus token.
- **Semantics:** correct heading order (one `<h1>` per page), `alt` on meaningful images,
  `aria-label` on icon-only buttons.
- **Overlays** (menus, dialogs): close on `Escape`, lock background scroll, mark hidden content
  `inert` / `aria-hidden`.

### Performance
- Run `npm run build` and check route sizes. A large First-Load-JS jump after adding a
  component means it dragged in a heavy dependency — investigate.
- Keep Server Components the default; don't turn a whole page into a Client Component to satisfy
  one interactive widget.
- No new render-blocking external requests (fonts are self-hosted via `next/font`).

### Quick verification loop

```
npm run lint        # style/correctness
npm run typecheck   # types
npm run test        # unit (Vitest)
npm run build       # bundle sizes
npm run test:e2e    # Playwright + axe (mobile + a11y)
```

Only when these are green is the ported component ready to keep.

---

## Path B — Adopting Tailwind or initializing shadcn (a deliberate choice you can make)

Adopting Tailwind or initializing shadcn is fully allowed when it produces a better result —
it's a **foundation choice**, so make it deliberately rather than by accident. When you take
this path:

1. **Decide it on purpose, and say why in a sentence or two** (e.g. "adding shadcn because this
   feature pulls in a dozen registry components and its primitives are the right base"). This
   does not require a separate approval cycle — explain, then proceed.
2. **Consider the impact as you go** — bundle size, how Tailwind's theme maps onto the existing
   CSS-variable tokens, the migration surface, and the site's CSP. Note anything significant in
   your change summary.
3. **Run `shadcn init` / add Tailwind, and reconcile with the existing token system** — map
   Tailwind's theme to `src/styles/tokens/` so the two systems share one source of truth, rather
   than replacing the design foundation wholesale for no reason.

If you only need one or a few components and don't want a second styling system, **Path A**
(adapt into CSS Modules + tokens) is usually the lower-friction choice — but either path is
legitimate. Let the result decide.

---

## Reference: what this project provides

- **Tokens & theme:** `src/styles/tokens/` (`base`, `colors`, `spacing`, `typography`,
  `effects` `.css`) + `src/styles/globals.css`
- **Components:** `src/components/` — `primitives/`, `sections/`, `hero/`, `chrome/`, `forms/`,
  `brand/`, `builder/`, `routes/`, `seo/`, `troubleshooter/`, `viz/`
- **Icons:** `lucide-react`
- **Animation:** `gsap`, `motion` (`motion/react`) — with reduced-motion support
- **Logic/adapters:** `src/lib/` (`forms/`, `validation/`, `sanity/`, `seo/`, `growth-plan/`,
  `content/`, `motion/`)

Match these patterns and a ported component will feel native — without a single Tailwind class.
