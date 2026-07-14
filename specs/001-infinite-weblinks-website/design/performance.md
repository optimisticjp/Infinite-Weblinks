# Performance Budgets and Measurement Plan

**Feature**: 001-infinite-weblinks-website
**Status**: Planning
**Owner input required**: none — this document is self-contained; revisit budgets after the first Lighthouse CI baseline run in Phase 1 implementation.

This document defines the performance targets, per-page budgets, rendering and
asset strategy, and measurement/CI gates for the Infinite Weblinks marketing
site. It implements Constitution Principle III (Speed Is Non-Negotiable) and
brief Section 20 (Performance), and is a direct input to `design/testing.md`
(Lighthouse CI + axe gates) and `design/deployment.md` (Cloudflare cache
headers, OpenNext image/incremental-cache configuration).

The site is visually rich (SVG hero, GSAP-driven storytelling, gradient-rich
editorial sections), but every rule below exists to stop that richness from
costing load time. Mobile is the binding constraint: most traffic to a
UK/US/Canada/Australia/Europe-facing services site arrives on a phone, often
throttled, and the hero must still land fast and calm.

---

## 1. Core Web Vitals targets (mobile-first)

Measured at the 75th percentile of real mobile traffic (field data) and on a
simulated mid-tier mobile profile (lab data: Moto G Power equivalent, 4x CPU
slowdown, slow 4G). Field targets follow Google's "good" thresholds; the
stretch column is this project's internal bar once the hero and Growth Plan
Builder are optimised.

| Metric | Good (Google threshold) | Infinite Weblinks target | Stretch |
|---|---|---|---|
| LCP (Largest Contentful Paint) | ≤ 2.5s | ≤ 2.3s | ≤ 1.8s |
| INP (Interaction to Next Paint) | ≤ 200ms | ≤ 180ms | ≤ 120ms |
| CLS (Cumulative Layout Shift) | ≤ 0.1 | ≤ 0.08 | ≤ 0.02 |
| FCP (First Contentful Paint) | ≤ 1.8s | ≤ 1.6s | ≤ 1.2s |
| TTFB (Time to First Byte) | ≤ 0.8s | ≤ 0.6s | ≤ 0.4s |

Lighthouse mobile Performance score (lab, per Constitution Principle III):

- **90+ required** on every indexable page before merge.
- **95+ best-effort** on the homepage, service/tool detail pages, and article
  pages, where most organic traffic and SEO signal land.
- The Growth Plan Builder route may run 5-10 points below the homepage
  because of form/validation JS, but must not fall below 85.

Desktop is measured but is not the gate — mobile numbers above are what fails
a build (see Section 7).

---

## 2. Per-page-type performance budgets

Budgets are per-route, gzip/brotli-compressed sizes, measured on a cold cache
mobile load. "Requests" counts document + first-party assets only (fonts,
CSS, JS chunks, above-the-fold images); third-party requests (Formspree,
Turnstile, Cloudflare Web Analytics beacon) are tracked separately and capped
at 3 total.

| Page type | Total JS (gz) | Total CSS (gz) | Image weight (above-fold) | Font weight | Requests (first-party) | TTFB |
|---|---|---|---|---|---|---|
| Homepage (`/`) | 130 KB | 35 KB | 180 KB (SVG hero + first editorial section) | 60 KB | ≤ 28 | ≤ 0.6s |
| Listing pages (`/solutions`, `/services`, `/tools`, `/roadmaps`, `/examples`, `/case-studies`, `/learn`, `/resources`) | 90 KB | 25 KB | 120 KB | 60 KB | ≤ 20 | ≤ 0.5s |
| Detail pages (`/solutions/[slug]`, `/services/[slug]`, `/tools/[slug]`, `/business-types/[slug]`, `/starting-points/[slug]`, `/roadmaps/[slug]`, `/examples/[slug]`, `/case-studies/[slug]`) | 80 KB | 22 KB | 100 KB | 60 KB | ≤ 18 | ≤ 0.5s |
| Growth Plan Builder (`/growth-plan`) | 150 KB | 25 KB | 40 KB (no hero visual) | 60 KB | ≤ 22 | ≤ 0.5s |
| Article pages (`/learn/[slug]`) | 70 KB | 22 KB | 90 KB (cover image) | 60 KB | ≤ 16 | ≤ 0.5s |
| Static/legal pages (`/faq`, `/privacy`, `/cookies`, `/terms`, `/accessibility`, `/about`, `/contact`, `/how-it-works`) | 60 KB | 20 KB | 60 KB | 60 KB | ≤ 14 | ≤ 0.4s |

Notes on the numbers:

- **Homepage JS** is highest — it is the only route paying for the hero SVG
  interaction layer plus the Goal Explorer / Tool Universe interactive
  modules. GSAP itself (~40-50 KB gz core + ScrollTrigger) is dynamically
  imported when the hero enters the viewport and is excluded from this
  figure and from the route-specific budget below.
- **Growth Plan Builder JS** is second-highest: the one genuinely stateful
  client experience (multi-step form, validation, Turnstile widget ~15-20
  KB). No hero visual or GSAP timeline ships on this route.
- **Font weight (60 KB)** is a shared, cached-once cost (Section 4) — counted
  per page type because it hits first-load weight on a cold cache, but
  subsequent navigations pay 0 KB (browser cache).
- **CSS** stays flat across route types: purged utility CSS shared via one
  cached stylesheet, with small per-route overrides only.
- Figures are initial-load budgets, not totals — lazy-loaded below-fold
  images and mega-menu content are excluded until requested.

**Route-level initial JS budget (route-specific bundle only, excludes shared
framework runtime which is cached once across the whole site):**

| Route | Route-specific JS (gz) |
|---|---|
| `/` | ≤ 45 KB (before GSAP dynamic import fires) |
| `/growth-plan` | ≤ 60 KB (before Turnstile script loads) |
| all other routes | ≤ 25 KB |

Shared framework runtime (React 19 + Next.js client runtime + Motion) is
budgeted separately at **≤ 85 KB gz**, cached across all routes after the
first visit.

---

## 3. Rendering strategy for speed

- **React Server Components (RSC) by default.** Every page starts as a
  Server Component; a component becomes a Client Component only when it
  needs interactivity, browser-only APIs, or animation state (hero
  controller, Growth Plan Builder form, mega-menu, mobile nav, accordions/
  tabs, GSAP/Motion wrappers). This keeps most of the DOM server-rendered
  with zero hydration cost.
- **Static generation + on-demand revalidation for CMS-backed content.** All
  Sanity-sourced routes (`/solutions/[slug]`, `/services/[slug]`,
  `/tools/[slug]`, `/business-types/[slug]`, `/starting-points/[slug]`,
  `/roadmaps/[slug]`, `/examples/[slug]`, `/case-studies/[slug]`,
  `/learn/[slug]`, listing pages, homepage sections) are generated at build
  time and **revalidated on-demand only** (Sanity publish webhook → tag/path
  revalidation); **no time-based ISR polling** at launch. Pages are served from
  the OpenNext incremental cache backed by **Cloudflare R2**, with a **D1 tag
  cache** driving precise invalidation, so a cache read never blocks on
  Sanity's API.
- **Streaming with `loading.tsx` / Suspense boundaries** on listing and
  detail pages so the shell (header, breadcrumb, layout) paints immediately
  while content streams in — relevant mainly to on-demand/preview paths
  (Sanity Presentation live editing in the separately-hosted Studio), since
  public pages are pre-rendered.
- **Minimal client JS**: interactivity is isolated to leaf Client Components
  (a single accordion item, a single form field group) rather than wrapping
  whole sections in `"use client"`, keeping RSC boundaries as low in the
  tree as possible.
- **The hero is usable without animation.** The SVG hero (logo, eyebrow,
  slogan, headline, supporting copy, both CTAs, reassurance line, static
  infinity/six-node graphic) is valid server-rendered markup that reads
  correctly with zero JavaScript. GSAP/ScrollTrigger only *enhances* an
  already-complete hero — it never gates content or CTA availability. This
  satisfies both brief Section 8 ("static hero is immediately
  understandable") and Section 20 ("hero is usable without animation").
- **Content renders before enhancement** site-wide: text, images, and CTAs
  are present in the initial HTML; GSAP/Motion only animate opacity/
  transform on elements already in the DOM. This keeps critical content
  crawlable, per brief Section 21 ("no hidden critical content inside
  client-only animation").

---

## 4. Asset strategy

### Fonts — Sora, Plus Jakarta Sans, JetBrains Mono

- **Self-host via `next/font`**, not a Google Fonts `<link>`. `next/font`
  downloads the font files at build time and self-hosts them from the same
  origin, inlining `@font-face` with automatic size-adjust metrics. This is
  the correct call for Cloudflare Workers: no third-party font request, no
  render-blocking cross-origin fetch, no CLS from late-swapping metrics.
- **Subset**: Latin only (Global English, no non-Latin scripts required) —
  typically cuts variable-font files by 60-70%.
- **Weight limits** (do not ship the full family):
  - Sora (display): 2 weights — 600 (headings), 700 (hero headline/large
    numerals).
  - Plus Jakarta Sans (body/UI): 3 weights — 400 (body), 500 (UI labels/nav),
    600 (emphasis/buttons).
  - JetBrains Mono (small technical labels only — stage numbers, code-like
    tags): 1 weight — 500, loaded only on routes that use it, not site-wide.
- **`font-display: swap`** on every face so text renders in a fallback font
  immediately and swaps without blocking FCP, paired with `next/font`'s
  fallback-metric adjustment to keep the swap's shift near zero (supports
  the CLS ≤ 0.08 target).
- **Preload the hero fonts**: Sora 700 and Plus Jakarta Sans 400 (the hero
  headline and supporting copy — the LCP element on `/`) are preloaded via
  `next/font`'s automatic above-the-fold preload. JetBrains Mono and
  secondary weights load on demand, not preloaded.
- Total font payload budget: **≤ 60 KB gz** first load across all three
  families combined, cached thereafter.

### Images

- **Responsive images via `next/image`** on every raster asset (case-study
  thumbnails, tool/service icons, article cover images, avatar/testimonial
  images once verified) — emits `srcset`/`sizes`, serves AVIF/WebP with a
  JPEG/PNG fallback.
- **OpenNext image handling decision**: `@opennextjs/cloudflare` does not run
  the Next.js image optimizer as a Node process on Workers by default. The
  planning default is to point `next/image`'s loader at **Cloudflare Images**
  (or the documented OpenNext custom-loader pattern) for edge resizing/format
  negotiation rather than the built-in `/_next/image` optimizer. Large
  source originals live in **R2** (Section 18), served resized through
  Cloudflare Images or a Worker resizing route. Re-validate against the
  exact `@opennextjs/cloudflare` 1.20.1 docs at implementation start (flagged
  in `design/deployment.md`); fallback if Cloudflare Images isn't provisioned
  in time is Sanity's own image URL builder, which already resizes
  CMS-sourced images on the fly with no extra Cloudflare configuration.
- **Sanity-sourced images** (case studies, articles, tool/service imagery)
  use Sanity's image URL builder (`?w=`, `?fm=webp`, `?q=`) directly, which
  covers most CMS image needs independent of the Cloudflare Images decision.
- **SVG hero over raster**: the hero visual (infinity + six connected areas)
  ships as inline/optimized SVG (SVGO-compressed), not a raster export —
  smaller payload, sharp at any density, directly animatable by GSAP with no
  raster decode step. Satisfies the brief's instruction that the hero is
  rebuilt from editable SVG, not the reference raster
  (`infinity-universe.png`).
- **Lazy-load below-the-fold imagery**: `next/image` lazy-loads by default
  for any image without `priority`; only the true LCP candidate per page
  (hero visual on `/`, cover image on article/detail pages) sets `priority`.
- **Explicit width/height (or `fill` + aspect-ratio container)** on every
  image to reserve layout space and prevent CLS.
- **No autoplay video on mobile.** If video is used anywhere (e.g. a future
  process explainer), it is muted, poster-framed, click-to-play on mobile,
  and lazy-loaded — autoplay is avoided on mobile viewports per brief
  Section 20 and Constitution Principle III.

---

## 5. JS and animation weight control

- **GSAP (ScrollTrigger bundled) is dynamically imported** (`next/dynamic` /
  dynamic `import()`) only inside the specific Client Components that use it
  (hero motion sequence, scroll-triggered storytelling sections). It never
  appears in the shared/root bundle — routes without a GSAP-driven section
  (e.g. `/faq`, `/privacy`) ship zero GSAP bytes.
- **Motion (for React) is the default for everything else** — nav
  open/close, button/hover states, layout transitions, accordion/tab
  micro-interactions, mega-menu reveal — since it is lighter than GSAP, per
  brief Section 8's recommended implementation split.
- **No Three.js.** The brief requires a validated prototype before any 3D
  library is considered, and none is planned for v1. A future request needs
  a performance-impact review before adoption (Constitution Principle III,
  Complexity Tracking if approved).
- **Tree-shake `lucide-react`**: import icons individually
  (`import { ArrowRight } from "lucide-react"`), never the barrel import, so
  unused icons are eliminated at build time. One icon family only (brief
  constraint) also avoids duplicate icon-set weight.
- **Code-split per route** (Next.js App Router default, each route segment
  its own chunk), reinforced by keeping route-specific interactive modules
  (Growth Plan Builder steps, mega-menu content, hero controller) as
  separate dynamically-imported chunks rather than one shared bundle.
- **Avoid heavy client state.** No global client-state library (Redux/
  Zustand/etc.) — RSC + URL state + local component state cover the site's
  needs. The Growth Plan Builder's multi-step state is scoped to that
  route's Client Component tree only, not lifted into a global store.
- **Particle layer stays lightweight**: the hero's "optional lightweight
  particle layer" (brief Section 8) is capped at ≤ 40 concurrent particles,
  driven by CSS/Motion transforms rather than canvas/WebGL, and is the first
  thing disabled under `prefers-reduced-motion` or on low-end devices.
- **`prefers-reduced-motion` short-circuit**: when set, GSAP timelines and
  the particle layer do not run at all — the component renders the final
  static state directly. The reduced-motion check happens before the GSAP
  dynamic import is triggered, so those users skip the fetch entirely, not
  just the animation.

---

## 6. Cloudflare edge caching strategy

| Asset class | Cache location | Policy |
|---|---|---|
| Static build assets (JS/CSS chunks, fonts, SVGs, `_next/static/*`) | Cloudflare CDN edge cache | `Cache-Control: public, max-age=31536000, immutable` — content-hashed filenames make this safe indefinitely. |
| Pre-rendered HTML (SSG / on-demand-revalidated pages) | OpenNext incremental cache → Cloudflare **R2** (tags in **D1**) | Served from R2 on cache hit. Invalidated **on-demand** by a Sanity publish webhook that revalidates the affected tags/paths (D1 resolves tags → cache entries); **no short time-based `revalidate` polling** at launch. |
| Editor-uploaded media (case-study/article/tool imagery) | Sanity asset CDN (`cdn.sanity.io`) | Resized/format-optimised on the fly via the Sanity Image URL builder and edge-cached; no second image pipeline (see `design/deployment.md` §4). |
| API-like routes (Formspree POST target is external; internal route handlers, e.g. revalidation webhook, Draft-Mode enable/disable) | No cache / `Cache-Control: no-store` | Mutating or trigger endpoints must never be cached. |
| Sanity Studio | n/a (separate Sanity-hosted deploy at `*.sanity.studio`) | Not part of this site's caching strategy; no `/studio` route on the Worker. |
| `sitemap.xml`, `robots.txt` | Edge cache with short `max-age` (e.g. 1 hour) + on-demand revalidation on content publish | Keeps crawl signals fresh without regenerating on every request. |

- **R2** is the source of truth for the OpenNext incremental cache (rendered
  HTML + fetch cache for CMS data), keeping cold-start regeneration rare and
  TTFB low (cache-hit path never touches Sanity or the Worker's render path).
- **D1** holds the tag cache so publish-driven `revalidateTag`/`revalidatePath`
  invalidates exactly the affected entries. **Workers KV is not used** (owner
  decision). Editor-uploaded images come from Sanity's asset CDN; brand/static
  assets from Workers Assets — per brief Section 18's requirement to plan cache
  strategy and image handling together.
- **Stale-while-revalidate** is the default posture across HTML and
  resized-image caching: never make a user wait for a rebuild; serve the
  last good version and refresh in the background.
- Full environment variable list, Turnstile key handling, rollback strategy,
  and CI/Git integration choice are owned by `design/deployment.md`, not
  duplicated here.

---

## 7. Measurement and CI gating

- **Lighthouse CI (`@lhci/cli`)** runs in the build pipeline (GitHub Actions
  or Cloudflare-integrated CI, per `design/deployment.md`) against a
  representative page set: `/`, one listing page, one detail page,
  `/growth-plan`, one article page. Mobile emulation profile, 3 runs per
  page, median score gates the build.
  - **Build fails** if any page's mobile Performance score drops below the
    90+ floor (Constitution Principle III), or if LCP/CLS/TTFB regress more
    than 10% against the previous baseline (`lighthouserc` assertions at
    `error` level on `categories:performance`, `largest-contentful-paint`,
    `cumulative-layout-shift`, `total-blocking-time`/INP proxy).
  - Budgets from Section 2 are encoded as Lighthouse CI's `resourceSizes` /
    `resourceCounts` assertions (per resource type) so a silent dependency-
    weight creep fails CI before it reaches production.
- **Bundle-size analysis**: `@next/bundle-analyzer` (or equivalent) runs on
  each PR touching `app/`, `components/`, or `package.json`, comparing
  `.next` build output against the Section 2 budget table. Any route
  exceeding its budget requires optimization or a documented exception.
- **Cloudflare Web Analytics (cookieless RUM)** is the field-data source of
  truth for real Core Web Vitals as experienced by actual UK/US/Canada/
  Australia/Europe visitors, since Lighthouse is lab-only and can miss real-
  network variance. Reviewed monthly at minimum; a field regression that lab
  tests miss is treated as a bug.
- **Cross-references**: the axe-core accessibility gate, Playwright critical-
  flow tests, and CI job structure are defined in `design/testing.md`.
  Environment variables, cache headers, rollback, and preview-deployment
  flow are defined in `design/deployment.md`. A change to cache strategy or
  CI gates in one document is a change to reflect in the others.

---

## 8. Performance done checklist

- [ ] Lighthouse CI configured with page set (`/`, listing, detail,
      `/growth-plan`, article) and mobile-first assertions wired to fail the
      build below 90 Performance.
- [ ] Per-route JS/CSS/image/font budgets from Section 2 encoded as CI
      assertions (or a documented manual-check step).
- [ ] Fonts self-hosted via `next/font`, subset to Latin, `font-display:
      swap`, hero fonts (Sora 700, Plus Jakarta Sans 400) preloaded, weight
      count matches Section 4 limits.
- [ ] Hero renders as valid, readable, CTA-complete markup with JavaScript
      disabled; GSAP only enhances, never gates.
- [ ] GSAP/ScrollTrigger confirmed dynamically imported and absent from the
      bundle on routes that don't use it (verified via bundle analyzer).
- [ ] `lucide-react` icons imported individually; no barrel import present.
- [ ] `next/image` (or the chosen Cloudflare Images / Sanity image-URL path)
      used for every raster image; hero and cover images use `priority`,
      everything else lazy-loads.
- [ ] Image handling path (Cloudflare Images vs. Sanity URL builder vs.
      static variants) finalized against `@opennextjs/cloudflare` 1.20.1
      docs and recorded in `design/deployment.md`.
- [ ] OpenNext incremental cache (**R2**) and **D1** tag cache configured;
      **on-demand** revalidation wired to the Sanity publish webhook
      (no time-based ISR polling at launch); no Workers KV.
- [ ] `prefers-reduced-motion` short-circuits GSAP and the particle layer,
      and skips the GSAP dynamic import entirely for those users.
- [ ] No autoplay video on mobile anywhere on the site.
- [ ] Cloudflare Web Analytics live and reviewed as the field-CWV source
      alongside Lighthouse CI's lab numbers.
- [ ] CLS sources checked: image dimensions reserved, font swap metrics
      matched, no layout-shifting late-loading banners above the fold.
- [ ] Budgets reconciled with `design/testing.md` (CI gate wiring) and
      `design/deployment.md` (cache headers, R2/D1 roles, image handling)
      before implementation begins.
