# Animation Architecture & Reduced-Motion Strategy

Status: Planning artefact (Spec Kit `plan` phase). No code is implemented here; this
document is the contract that `/speckit-implement` and future component work must
follow. Applies to the Infinite Weblinks marketing site (Next.js 16 App Router,
React 19, Server Components by default).

---

## 1. Motion philosophy

Three rules govern every animation on this site, in priority order:

1. **Motion explains connection, it does not decorate.** Infinite Weblinks' core
   idea — that websites, marketing, tools, and data are one connected system — is
   the *only* thing motion is allowed to argue for. A pulse travelling from a
   marketing node to the website and on to analytics is a claim about how work
   flows. Motion with no explanatory job (spinning logos, bouncing icons, parallax
   for its own sake) does not belong on this site.
2. **Motion is a presentation layer, never a load-bearing one.** Every piece of
   content, every CTA, every navigation path must work, read correctly, and be
   operable with motion entirely absent. Static-first, animation-enhanced — never
   the reverse. This is enforced structurally: Server Components render the real
   content and layout first; Client Components layer motion on top of what is
   already complete and readable (see §5).
3. **Motion never blocks reading or interaction.** No animation may delay text
   becoming legible, delay a CTA becoming clickable, trap focus, or force a user
   to wait out a timeline before acting. Calm pacing, long intervals, one thing
   moving at a time (see §3, §6).

These rules apply uniformly regardless of which tool renders the effect.

---

## 2. Tool division of labour

Three tools, each with a narrow, non-overlapping mandate. No animation library is
loaded for a job a lighter one already covers.

### GSAP 3.15 (with ScrollTrigger) — hero and scroll storytelling only
- Scope: the hero's four-moment sequence (§3) and any scroll-driven storytelling
  timeline elsewhere on the page (e.g. the 8-stage Online Growth Journey section
  animating in as it scrolls into view).
- Loading rule: **dynamic-imported**, never in the shared client bundle. Each
  section that uses GSAP imports it locally (`next/dynamic` with `ssr: false`, or
  an on-demand `import('gsap')` inside a `useEffect`) so pages that contain no
  GSAP-driven section pay zero GSAP bytes.
- Registration rule: `gsap.registerPlugin(ScrollTrigger)` runs once, client-side
  only, inside the component that first needs it — never at module scope of a
  file that could be imported into a Server Component tree.
- GSAP's free licence (post-Webflow-acquisition, April 2025) permits this use; the
  one restriction — must not be used to build a competing website-builder product
  — is not applicable to a marketing site and needs no further tracking.

### Motion 12.42 (`motion` package) — UI and micro-interactions
- Scope: header/nav state changes, mega-menu enter/exit, button hover/press/focus
  feedback, layout transitions (e.g. accordion or tab panel height changes), card
  hover lift, modal/dialog enter/exit, page-level shared-element transitions where
  used.
- Rationale: these are short, state-driven, interruptible animations tied to
  discrete UI events (click, hover, focus, route change) — Motion's declarative
  variants and `AnimatePresence` model fit this better than a GSAP timeline, and
  it is far lighter to keep resident for interactions that fire on every page.
- Loading rule: imported normally inside the Client Components that need it
  (nav, mega-menu, buttons); not force-loaded into pages that have no
  interactive chrome beyond static content.

### CSS — small ambient effects only
- Scope: the resting-state glass float on floating panels/header, hover-state
  colour/opacity/transform transitions on links and simple cards, focus-ring
  transitions. Anything expressible as a single `transition` or a simple
  `@keyframes` loop with 2–3 properties.
- Rationale: zero JS cost, runs on the compositor, and is trivially silenced by
  the global `prefers-reduced-motion` block (§4) with no component-level logic.
- Uses the existing effect tokens directly — `--ease-out`, `--ease-in-out`,
  `--ease-bounce`, `--dur-fast` (140ms), `--dur-base` (240ms), `--dur-slow`
  (480ms) — from `design-system/tokens/effects.css`, so hover/press timing is
  consistent everywhere without a JS animation library in the loop.

### Explicit exclusions
- **Avoid Three.js unless a validated prototype proves it necessary.** The hero
  is built from editable SVG (paths + nodes), not WebGL. If a future iteration
  proposes a 3D treatment, it must first ship as an isolated prototype validated
  against the performance budget (§5) before it can replace the SVG approach —
  not adopted speculatively.
- **No uncontrolled continuous animation.** No infinite marquee, no perpetual
  spinning/pulsing that ignores tab visibility, no animation that keeps running
  once its explanatory job is done. Ambient effects (glass float) are slow,
  low-amplitude, and treated as decoration a user can silence, not as a system
  that must always run.

---

## 3. Hero motion storyboard (implementable spec)

Source of truth: brief §8 ("Hero direction") and `hero-motion-notes.md`. The hero
visual is **editable SVG** — paths and nodes as real DOM/SVG elements, not a
flattened image — so copy, colours, and layout stay editable and accessible, and
GSAP can target individual paths/nodes by selector.

### Structure
- One large SVG containing:
  - The **Signature Crossover infinity mark** at the visual centre, drawn as one
    or two `<path>` elements (stroke, not fill, so it can be "drawn on" via
    stroke-dasharray/offset).
  - Six **connection line paths**, one per connected area, running from the
    crossover outward to six **node** groups (small circle + label + icon slot).
  - Optional lightweight particle layer (a handful of small dots reusing the node
    colours) — kept sparse per the performance guardrails (§5); this layer is the
    first thing cut if a device/browser combination struggles.
- Every path, node, and label is a real, inspectable SVG element with accessible
  text (not an image), matching the brief's requirement of "no flattened text
  within a production image."

### The six connected areas and their domain colours
Per `hero-motion-notes.md` (colour-domain logic), each node is tinted to match
its glow token in `effects.css`:

| Connected area | Domain colour | Glow token |
|---|---|---|
| Website or Store | Blue | `--glow-blue` |
| Search and Advertising | Violet | `--glow-violet` |
| Social and Content | Hot pink | `--glow-pink` |
| Customer Tools | Orange | `--glow-orange` |
| Analytics | Cyan | `--glow-cyan` |
| Automation and AI | Violet-blue (blend) | `--glow-violet` / `--glow-blue` blend |

This is the same colour-domain logic used sitewide (e-commerce/customer
relationships elsewhere use lime where applicable) — the hero is the first place
a visitor learns the code, so its mapping must exactly match how the same six (or
related) domains are coloured later, e.g. in the 8-stage journey and Tool
Universe sections.

### The four moments (sequential, one pulse at a time)

**1. Arrival — static, immediate, complete.**
Header, eyebrow ("DIGITAL GROWTH PARTNER"), slogan, headline, supporting copy,
both CTAs, and the reassurance line render server-side and are legible with zero
JavaScript. The infinity mark and all six nodes render in their **final static
positions and full opacity** — the composition already reads correctly as a
finished picture before any animation library has loaded. Nothing meaningful is
gated behind motion.

**2. Connection — path draw + line extension.**
On mount (client-side only, after hydration), GSAP animates:
- The infinity path's `stroke-dashoffset` from full length to 0 ("drawing" the
  mark), ~1–1.5s, `ease: power2.out` (mirrors `--ease-out`'s intent).
- The six connection lines extending from the centre outward to their nodes,
  staggered slightly (e.g. 0.08–0.12s stagger), same easing family.
This moment only runs once per page load; it is not looped or re-triggered on
scroll back into view.

**3. Activity — one pulse at a time.**
A single small light travels along a connection path: marketing node → website
node → analytics node → (implied) customer follow-up, per the notes. Implemented
as one GSAP timeline moving one dot along a `MotionPath`-style progression (or
an SVG `<circle>` animated along the path's points). Rules, taken directly from
the notes and enforced as hard constraints:
- **No more than one active pulse at any time.**
- **Long, calm intervals** between pulse runs (order of several seconds of rest,
  not a tight loop) — this is ambient storytelling, not a busy dashboard.
- The pulse never obscures or crosses behind text/CTAs in a way that reduces
  legibility.

**4. Resting state — calm, ambient, cheap.**
Once the connection + one pulse cycle completes, the scene settles: glass panels
(header, any floating UI fragments) get a slow, low-amplitude float, implemented
in **CSS**, not GSAP — a few pixels of vertical drift over several seconds,
`ease-in-out`, infinite but subtle enough to be visually "calm" rather than
"active." No further GSAP timeline work runs at rest; the pulse (moment 3) may
re-fire on a long interval, but the baseline resting state is CSS-only and cheap
to keep running indefinitely.

### Editability requirement
Because paths/nodes are real SVG (not a flattened raster), content editors and
future design iterations can adjust node labels, positions, and colours without
touching the animation logic — the GSAP timeline targets selectors/refs, not
hard-coded coordinates baked into an image. The reference raster
(`infinity-universe.png`) informs the visual target only; it is not reused as a
production asset (per the facts pack).

---

## 4. Reduced-motion strategy

**Default assumption: static.** The hero (and every other animated surface) must
render its complete, finished end-state correctly with zero JavaScript and zero
animation, because that is what a reduced-motion user sees and it is also what
every user sees for a brief moment before hydration. Motion is additive on top of
that default, never a prerequisite for it.

### Mechanism (two layers, both required)

1. **CSS layer — always-on safety net.**
   The global reduced-motion block already defined in
   `design-system/tokens/base.css`:
   ```css
   @media (prefers-reduced-motion: reduce) {
     *, *::before, *::after {
       animation-duration: 0.001ms !important;
       animation-iteration-count: 1 !important;
       transition-duration: 0.001ms !important;
       scroll-behavior: auto !important;
     }
   }
   ```
   This alone collapses every CSS transition/keyframe animation (hover states,
   glass float, Motion's CSS-driven transforms where applicable) to effectively
   instantaneous, site-wide, with no per-component opt-in required.

2. **JS guard — required before any GSAP timeline runs.**
   CSS cannot stop a GSAP timeline from executing its tween logic (it can only
   crush the visual duration in some cases). Every GSAP-driven component must
   check `window.matchMedia('(prefers-reduced-motion: reduce)').matches` (or use
   GSAP's own `gsap.matchMedia()` helper) **before constructing the timeline**,
   and branch:
   - **Reduced:** set the end-state directly (`stroke-dashoffset: 0`, lines at
     full length, no pulse instance created, no ScrollTrigger scrub) — one
     synchronous style/attribute set, no tween.
   - **Full motion:** build and play the timeline as in §3.
   Illustrative pseudo-snippet (not implementation code):
   ```
   const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
   if (reduced) { setFinalState(); }
   else { buildTimeline().play(); }
   ```

3. **SSR-safe default.** Because the server cannot read the client's motion
   preference, the server-rendered markup always emits the **static end-state**
   (§3 "Arrival," plus lines already drawn, no pulse) as the initial HTML/CSS.
   Client-side JS only *adds* motion for users who don't have the reduced
   preference and only after confirming that via the guard above — it never
   removes something the server already committed to. This means a
   slow-to-hydrate or JS-disabled visitor always sees the same complete,
   correct picture that a reduced-motion visitor sees permanently.

### Static alternative for every complex visual journey
Per accessibility requirement (brief §19: "static alternative to complex visual
journeys"), this is not limited to the hero. Any section whose story is normally
told through motion — the hero's connected-universe reveal, the 8-stage Online
Growth Journey scroll timeline, the "Apparel connected customer journey" — must
have a fully legible static rendering of the same information (same stages,
labels, connections, order) that requires no animation to understand. In
practice this falls out of the static-first rule automatically: because motion
only ever animates *between* states of already-present, already-labelled content
(never reveals content that doesn't otherwise exist), turning motion off simply
removes the transition, not the information.

---

## 5. Performance guardrails for motion

Directly from brief §20 ("Performance") and the stack's dynamic-import
architecture:

- **Animate transform and opacity only.** No animating `width`, `height`, `top`,
  `left`, box-shadow spread, or other layout/paint-triggering properties in any
  looping or scroll-linked animation. (SVG stroke-dashoffset/path draws are the
  one deliberate exception, scoped to the one-time hero "Connection" moment —
  not a continuous loop.)
- **Lazy-load below-fold timelines.** Any GSAP ScrollTrigger timeline outside the
  hero (e.g. the 8-stage journey section) only initialises when its section
  enters the viewport — ScrollTrigger's own viewport awareness, or an
  `IntersectionObserver` gate around the dynamic `import('gsap')` call, so users
  who never scroll that far never pay the parse/execute cost.
- **Keep particle counts low.** The hero's optional particle layer stays sparse
  (a handful of elements, not dozens); if it materially affects frame time on a
  mid-range device it is the first thing removed, ahead of removing the pulse or
  the path draw.
- **No autoplay video on mobile**, full stop — applies to any future video used
  in case studies, examples, or the hero background.
- **GSAP is loaded only where used** — never bundled globally; every page without
  a GSAP-driven section ships no GSAP bytes (§2).
- **Respect the performance budgets proposed during planning** and track Core Web
  Vitals (LCP, INP, CLS) against them; a motion feature that regresses CLS
  (e.g. layout-shifting entrance animations) or LCP (e.g. blocking hero paint on
  script load) is a defect, not an acceptable trade-off for polish.
- **Font optimisation** (Sora, Plus Jakarta Sans, JetBrains Mono) is a
  performance concern adjacent to motion: fonts must be loaded so text is never
  invisible while the (separately loaded) motion libraries parse — no shared
  blocking behaviour between font loading and animation loading.

---

## 6. Accessibility interplay

- **No information only available on hover or animation.** Anything a pulse,
  hover-reveal, or timeline communicates (e.g. "this node connects to that
  node") must also exist as static, always-present text/structure — motion may
  emphasise a relationship, it may never be the sole channel for it.
- **Focus is never trapped by motion.** Mega-menu enter/exit (Motion) and any
  modal/dialog transition must not intercept or delay keyboard focus movement;
  focus moves to the opened panel's first meaningful element immediately,
  independent of whether the enter animation has finished playing.
- **Pause/rest states are the norm, not an add-on.** The hero's own storyboard
  ends in a deliberate "Resting" moment (§3.4) — the design already treats
  "calm and still" as the correct steady state, not "always animating." Ambient
  loops (glass float, any repeating pulse cycle) must be effectively pausable by
  the reduced-motion guard and must not resume or restart in a way that steals
  focus or scroll position.
- **Reduced-motion is a first-class state, not a degraded one.** A
  reduced-motion visitor sees the same information, in the same layout, at the
  same legibility — only the transitions between states are removed. This is
  verified as part of accessibility QA (axe-core + manual toggle of the OS
  reduced-motion setting) alongside WCAG 2.2 AA checks, not treated as a
  separate/optional pass.

---

## 7. Animated surfaces — tool, trigger, and fallback map

| Surface | Tool | Trigger | Reduced-motion fallback |
|---|---|---|---|
| Hero connected-universe (infinity mark, 6 nodes, pulse) | GSAP + ScrollTrigger (dynamic-imported) | Page mount, client-side, once | Full static end-state server-rendered: mark and lines already drawn, nodes visible, no pulse, no particle motion |
| Hero glass panel ambient float | CSS | Continuous, low-amplitude, after resting moment begins | Frozen at neutral position (`animation-duration` collapsed by global CSS rule) |
| 8-stage Online Growth Journey (homepage stepper / scroll story) | GSAP + ScrollTrigger (dynamic-imported, lazy-initialised) | Section enters viewport (IntersectionObserver / ScrollTrigger) | All 8 stages + 3 cross-cutting systems render fully labelled and laid out statically; no scroll-scrub reveal, no motion gate on reading order |
| Apparel connected customer journey (illustrative scroll story) | GSAP + ScrollTrigger (dynamic-imported, lazy-initialised) | Section enters viewport | Full static diagram/labels visible immediately, same content as animated version |
| Mega-menu (How It Works / Solutions / Services / Resources) enter/exit | Motion | Click or focus on nav trigger | Instant show/hide (no slide/fade transition); keyboard/screen-reader access unaffected either way |
| Sticky header state change (glass intensify on scroll) | CSS (+ Motion for any accompanying layout shift) | Scroll position threshold | Instant state swap, no transition duration |
| Buttons (CTA hover/press, incl. "Build My Digital Growth Plan") | CSS for hover/focus colour + Motion for press/clay feedback | Hover, focus, active/press | Instant colour/opacity change; no scale/bounce animation, click still fully functional |
| Cards (services, tools, roadmaps, case-study placeholders) hover lift | CSS | Hover / focus-within | No lift transform; static shadow state, fully readable and clickable |
| CTA banner (final Growth Plan CTA) entrance | Motion (simple fade/slide-in on scroll-into-view) | Section enters viewport | Renders at final position/opacity immediately, no entrance transition |
| Page/layout transitions (route change, tab/accordion panels) | Motion | Route change / user interaction (click) | Instant panel/content swap, no crossfade or height animation |
