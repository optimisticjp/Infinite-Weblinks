# Infinite Weblinks — GATE-1 Report (Homepage Opening)

**Branch:** `impl/homepage-opening` · **Date:** 2026-07-14 · **Status:** 🚦 **STOPPED at GATE-1 for owner review.**
Milestones **M2 → M4** are complete. **Phase 5 (remaining homepage sections) has NOT started.**

## Commit hashes (this branch, on top of the approved planning commits)
| Commit | Milestone |
|---|---|
| `5ec264f` | M2 — repository + toolchain foundation, design tokens, OpenNext/Cloudflare config |
| `d572304` | M2 — brand (Signature Crossover logo), primitives, motion utils |
| `e75be30` | M3 — initial Sanity setup (separate Studio workspace + app content layer) |
| `1464faf` | M4 — homepage opening (header, mega-menus, mobile nav, hero, bright section) |
| `b3d9c49` | GATE-1 — Playwright + axe e2e, Vitest invariants, screenshot harness |

## Preview
- ✅ **OpenNext Worker verified locally in the real Cloudflare runtime (workerd via `wrangler dev`):**
  `GET /` → **HTTP 200**, server-rendered content present. The exact bundle that deploys to Workers runs
  with the R2 incremental cache + D1 tag cache bindings emulated locally.
- ⚠️ **A hosted private Cloudflare preview URL cannot be produced from this container** — it has **no
  Cloudflare account/API token** (and no Sanity project). Deploying the already-built Worker needs only:
  a Cloudflare API token + account id, an R2 bucket, and a D1 database (see `design/deployment.md`).
  Everything else is ready (`npm run cf:build` produces `.open-next/worker.js`; `npm run cf:deploy` is one
  command once credentials exist).

## Systems implemented (M2 → M4)
- **Toolchain & config:** Next.js 16 App Router (RSC, Turbopack), TypeScript 6.0.3 strict, ESLint 9
  (eslint-config-next flat) + Prettier, `open-next.config.ts` (R2 incremental cache + D1 tag cache, **no
  KV**, on-demand revalidation), `wrangler.jsonc` (ASSETS + R2 + D1 bindings), `.env.example`
  (names/placeholders only), CI workflow (lint · typecheck · test · build · cf:build + Playwright).
- **Design tokens:** rebuilt cleanly from the approved handoff with the two planning-review a11y fixes
  baked in — dark ink text on the CTA gradient (R-A11Y-1) and section-scoped text colours
  (`.theme-dark`/`.theme-band`/`.theme-statement`, R-A11Y-2). Self-hosted fonts via `next/font`.
- **Brand:** Signature Crossover logo rebuilt as a shared SVG symbol (gradient mark) + real-text
  wordmark (accessible, recolourable); favicon `app/icon.svg`. Header/footer/favicon use this logo.
- **Primitives:** Button (dark-on-gradient CTAs, 44px targets), IconTile (glowing node), motion utils
  (reduced-motion guard + lazy GSAP loader).
- **Chrome:** sticky selective-glass **SiteHeader** with **CMS-driven, keyboard-accessible desktop
  mega-menus** (panel inside the trigger so Tab flows in; `aria-expanded`/`aria-controls`; Esc closes +
  restores focus; scroll-padding keeps focus clear of the sticky header — WCAG 2.4.11); full-screen
  **MobileNav** (focus trap + restore, body-scroll lock, accordion families); **SiteFooter** (email-only
  contact, social hidden until a valid URL, no phone).
- **Hero:** server-rendered copy (SEO/AEO) + client **HeroUniverse** — editable-SVG glowing infinity,
  six domain-coloured nodes, connection lines, one travelling pulse; **static-first** (complete state on
  SSR/no-JS), GSAP enhancement only when motion is allowed, `prefers-reduced-motion` → complete static
  state. The six connected areas are also real text ("Connected across").
- **Bright next-section:** cream editorial band ("The digital world keeps getting bigger") — the
  required section-rhythm break after the dark hero.
- **CMS (initial slice):** separate Sanity Studio workspace under `studio/` (53 files, own package.json,
  `sanity deploy` → `*.sanity.studio`; not embedded); app content layer renders **approved seed copy**
  now and swaps to status-gated Sanity queries once a project is provisioned.

## Package versions selected (re-verified on npm at setup)
`next@16.2.10` · `react`/`react-dom@19.2.7` · `typescript@6.0.3` (owner-locked stable 6.0 line;
toolchain typechecks clean — no 5.9.x fallback needed) · `@opennextjs/cloudflare@1.20.1` ·
`wrangler@4.110.0` · `@sanity/client@7.23.1` · `@sanity/image-url@2.1.1` · `gsap@3.15.0` ·
`motion@12.42.2` · `lucide-react@1.24.0` · `eslint@9.39.5` + `eslint-config-next@16.2.10` ·
`prettier@3.9.5` · `@playwright/test@1.61.1` · `@axe-core/playwright@4.10.x` · `vitest@4.1.10`.
OpenNext override paths + binding names (`NEXT_INC_CACHE_R2_BUCKET`, `NEXT_TAG_CACHE_D1`, `ASSETS`)
verified against the installed adapter.

## Test & accessibility results
- **Unit (Vitest): 6/6 pass** — content-guardrail invariants (six areas; email-led CTA → `/growth-plan`;
  no phone/booking/SaaS-login language; social hidden until valid URL; approved CTA routes).
- **E2E (Playwright + axe): 14/14 pass** —
  - **Accessibility:** axe reports **0 serious/critical violations** on the homepage AND with a mega-menu
    open. **Lighthouse Accessibility = 100.**
  - **Keyboard:** mega-menu opens on Enter, Tab reaches panel links, Esc closes and restores focus;
    mobile nav traps focus, Esc closes and restores focus.
  - **Responsive:** **no horizontal overflow at 360 / 390 / 768 / 1024 / 1440 px.**
  - **Reduced motion:** complete static state, nodes visible, no page errors.
- **Build/lint/typecheck:** all green. **OpenNext `cf:build`** green (deploy-ready Worker).

## Performance (Lighthouse, mobile — the constitution's target)
| Metric | Result |
|---|---|
| **Performance** | **95** (target 90+, stretch 95+ — met) |
| **Accessibility** | **100** |
| **Best Practices** | **96** |
| **SEO** | **100** |
| FCP / LCP | 0.9 s / 2.7 s |
| Total Blocking Time | 140 ms |
| **Cumulative Layout Shift** | **0** |
| Speed Index | 1.1 s |

(Desktop Lighthouse hit a Chrome-launch quirk in this sandbox; desktop performance is typically ≥ mobile.)

## Screenshots (`artifacts/screenshots/`, git-ignored — attached in chat)
Desktop hero · desktop full page · desktop mega-menu open · desktop reduced-motion · tablet · mobile full
page · mobile nav open.

## Known limitations / deviations (all reasonable, documented)
1. **No hosted preview URL / no live Sanity** — the container has no Cloudflare or Sanity credentials.
   The app renders from **approved seed content** and the Worker is verified locally in workerd. Provide
   a Cloudflare token (+ R2/D1) and a Sanity project to produce the hosted private preview and live CMS.
2. **App uses `@sanity/client` directly** (not `next-sanity`) for now — lighter app bundle; `next-sanity/
   live` + Presentation wiring lands with the Draft-Mode milestone.
3. **Tablet/small-laptop (768–1079px) use the mobile hamburger nav** (desktop mega-menus enable at
   ≥1080px, secondary CTA at ≥1280px) — chosen so the header never overflows and mega-menus always have
   room. Adjustable if you prefer desktop nav lower.
4. **Logo wordmark is the approved live-text form** (usable in previews per the owner decision); vector
   cleanup + trademark review remain production-launch gates.
5. **Desktop Lighthouse** couldn't complete in-sandbox (Chrome launch); mobile — the target — is captured.

## Confirmation
**Phase 5 (remaining homepage sections) has NOT started.** Work stopped at GATE-1 as instructed, awaiting
owner review and approval before continuing.
