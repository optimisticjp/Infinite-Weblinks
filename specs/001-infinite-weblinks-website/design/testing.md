# Testing Strategy

Status: Planning — no code in this repository yet. This document defines what gets tested, with which tool, at what stage, and what "done" means for testing. It implements Constitution Principle X (Test Important Behavior) and Locked Brief §24.

Cross-references: `design/accessibility.md` (scan rules and manual checks), `design/seo.md` (metadata/structured-data rules), `design/performance.md` (budgets and Core Web Vitals targets).

---

## 1. Testing Philosophy

Principle X is explicit: test-driven development where it pays off, not everywhere. Three rules govern every testing decision on this project:

1. **TDD where correctness is invisible from the UI.** If a bug would only surface as "the wrong recommendation appeared" or "the form accepted bad data," write the test first. This applies to:
   - The Growth Plan Builder recommendation rules engine (highest-value target on this project — pure logic, no UI, easy to get subtly wrong, directly shapes what a prospect is told to do).
   - Input validation schemas (contact form, Growth Plan Builder form, Formspree payload shape).
   - Utility and formatting functions (slug generation, date/label formatting, CMS query mappers that reshape Sanity documents into page props).
   - CMS query mappers (Sanity GROQ result → typed view model), because a schema drift here fails silently in production (wrong field renders as blank, not as an error).

2. **Test behaviour, not presentation.** Do not assert on exact pixel values, class names, or copy strings that a content edit could legitimately change. Assert on: does the right content type render, is the interactive element keyboard-operable, does the verified-only gate hold, does the form submit the right payload, does the error message appear. Visual correctness is covered separately by visual regression (§2.5), not by unit/component assertions on markup.

3. **No heavy stack on static pages.** Most routes (`/about`, `/learn/[slug]`, legal pages, most of `/solutions/[slug]`) are Server Components rendering CMS content with no client-side logic. These do not get component tests — they get one shared "renders without throwing + has one H1 + has required metadata" smoke check inside the existing E2E suite, not a bespoke unit-test harness. Do not write component tests for presentational-only components (a `Card`, a `SectionHeading`, a `Badge` with no logic beyond a `variant` prop) — cover them through the E2E journeys and visual regression instead.

The Growth Plan Builder rules engine is the one place on this site where "a services company's marketing site" behaves like an application. It gets application-grade testing. Everything else gets proportionate testing.

---

## 2. Test Pyramid

### 2.1 Unit tests — Vitest

Scope: pure functions and modules with no DOM, no network, no React rendering.

| Target | What is tested | Priority |
|---|---|---|
| **Growth Plan Builder recommendation rules engine** | Every input combination (business type × current stage × main goal × existing setup × engagement preference × timeline) maps to the correct `Start here` / `Connect next` / `Add later` bucket, correct `Relevant capabilities`, `Example tools`, `Expected outcomes`, and `How Infinite Weblinks can help` text keys. Rules are pure functions over structured content/data (Locked Brief §15) — no AI, no randomness — so outputs are deterministic and fully assertable. | Highest |
| **Growth Plan Builder input validation** | Required fields enforced, "Not sure yet" / "Prefer to discuss by email" treated as valid non-blocking answers, malformed contact details rejected, no currency values leak into engagement preference (per Locked Brief neutral-range rule). | High |
| **Contact form validation schema** | Email format, required-field enforcement, max-length guards, honeypot/spam-field handling. | High |
| **CMS query mappers** | Sanity GROQ result → page view-model: required fields present, missing optional fields degrade gracefully (no crash), content `status` field (Draft/Placeholder/Approval Required/Verified/Ready to Publish) is correctly read and passed through unmodified. | High |
| **Utility/formatter functions** | Slug builders, breadcrumb path builders, date/label formatting, filter-tag builders for Services/Tools taxonomy (category, goal, growth stage, business type, delivery model, tool). | Medium |
| **Structured-data builders** | Functions that assemble Organization/Article/Service/FAQ JSON-LD objects from CMS content produce valid shapes for the inputs given (schema conformance itself is checked in §2.6). | Medium |

Rules-engine test file structure recommendation: one test suite per input dimension combined with representative cross-products (not full combinatorial explosion — use pairwise/boundary cases plus a handful of full end-to-end scenarios matching realistic client profiles), plus explicit tests for every "Not sure yet" / "Prefer to discuss by email" escape-hatch path, since these must never produce an empty or broken recommendation.

### 2.2 Component tests — Vitest + Testing Library

Scope: components with real interaction logic or conditional rendering rules. Test behaviour through the accessibility tree (roles, names, states), not implementation detail.

| Component | What is tested |
|---|---|
| **Mega-menu** | Opens on click/Enter, closes on Escape and outside click, focus moves into the panel on open and returns to the trigger on close, arrow-key/tab order within the panel, `aria-expanded`/`aria-haspopup` state reflects open/closed. |
| **Mobile navigation (drawer)** | Opens/closes, traps focus while open, closes on Escape, closes on route change, does not scroll the background page while open. |
| **Accordion** (FAQ, service detail, roadmap steps) | Single- or multi-open behaviour is consistent with spec, `aria-expanded` toggles, content is reachable by keyboard, closed panels are not in the tab order (or are correctly hidden from assistive tech). |
| **Growth Plan Builder stepper** | Step advances only when the current step's required fields are valid, back navigation preserves entered values, progress indicator reflects current step, final step shows a review summary before submission. |
| **Form fields** (contact + Growth Plan Builder) | Label-input association, error message is programmatically associated (`aria-describedby`) and announced, required fields are marked, disabled/loading state during submission is reflected in the UI and to assistive tech. |
| **Badge / status gating component** | Given a content `status` of Draft/Placeholder/Approval Required, the component does NOT render into the public tree (or renders an internal-only preview affordance instead). Given `Verified` or `Ready to Publish`, it renders normally. This is the automated backstop for the "no public placeholders" rule — treat it as a release-blocking test, not an optional one. |

### 2.3 End-to-end tests — Playwright

Scope: real browser, critical user journeys, run against a built preview (§4). One spec file per journey; each spec should be independently runnable.

Critical journeys:

1. **Homepage loads, static-first.** Content is visible and readable with JavaScript/animation disabled or before hydration; hero communicates the value proposition without motion; primary CTA (`Build My Digital Growth Plan → /growth-plan`) is present and correctly links.
2. **Mobile navigation open/close/focus.** At 360–390px: menu opens, focus enters it, Escape and outside-tap close it, focus returns to the trigger, no horizontal scroll is introduced.
3. **Desktop mega-menus, keyboard-only.** Tab into the primary nav, open each mega-menu via keyboard, navigate its items via keyboard, confirm every link is reachable and focus is visibly indicated at every step.
4. **Growth Plan Builder — full happy path.** Complete every step with valid representative answers, reach the recommendation output (Start here/Connect next/Add later/capabilities/tools/outcomes/how IW can help), submit contact details, confirm the mocked Formspree endpoint received the expected payload shape, confirm a success state renders.
5. **Growth Plan Builder — validation and error states.** Attempt to advance with missing required fields (blocked with visible errors); attempt final submission with an invalid email (blocked); simulate a mocked Formspree failure response (user sees a clear error state and the fallback `support@infiniteweblinks.com` guidance, not a silent failure).
6. **Contact form** — same happy-path/validation/error pattern as #5, scoped to the simpler contact form.
7. **CMS preview vs. published behaviour.** A document in Draft/Placeholder/Approval Required status is visible in the protected Sanity Presentation/preview context but absent from the public production-equivalent render; a Verified/Ready to Publish document appears in both.
8. **Reduced-motion mode.** With `prefers-reduced-motion: reduce` emulated, hero and scroll-triggered animations are replaced by their static end-state; no content is only revealed by an animation that reduced-motion has skipped.
9. **Keyboard-only navigation, full page.** From page load, reach primary nav, main content, Growth Plan Builder CTA, and footer using only Tab/Shift+Tab/Enter/Escape/Arrow keys; no keyboard trap outside the intentional drawer/menu traps in #2–#3.

Formspree and Cloudflare Turnstile are mocked/stubbed in all E2E runs (§3) — no test hits the real Formspree endpoint or a real Turnstile challenge.

### 2.4 Accessibility scans — axe-core in Playwright

`@axe-core/playwright` runs against every route class listed in the sitemap once per PR (homepage, one representative `/solutions/[slug]`, one `/business-types/[slug]`, one `/services/[slug]`, one `/tools/[slug]`, `/growth-plan` at each step, `/contact`, `/faq`, `/about`, one `/learn/[slug]`, one `/case-studies/[slug]`). Scans run in both the default and the mobile viewport. Zero serious/critical axe violations is a merge gate; moderate/minor violations are logged and triaged, not auto-blocking, unless they duplicate a manual finding in `design/accessibility.md`. Manual checks that axe cannot verify (meaningful focus order, drag-free interaction, sensible reading order, actual screen-reader announcement quality) stay a manual pre-launch pass, not an automated gate — see `design/accessibility.md` for that checklist.

### 2.5 Visual regression — Playwright screenshots

Screenshot comparison at four breakpoints — 360px, 390px, 768px, 1024px — plus one large-desktop width (1440px or 1920px, matching whatever `design/performance.md`/design tokens settle on), for:

- Homepage (above the fold + full page)
- One representative page per template family: `/solutions/[slug]`, `/business-types/[slug]`, `/services/[slug]`, `/tools/[slug]`, `/roadmaps/[slug]`, `/case-studies/[slug]`
- `/growth-plan` (each step)
- `/contact`
- Header in both closed and open (mega-menu / mobile drawer) states
- Footer

Screenshots are masked or excluded where CMS content is expected to change frequently (e.g., dynamic dates) to avoid false diffs. Baselines are committed and reviewed like code — a visual diff is expected and approved deliberately, not silently accepted. Run only on PRs touching layout/CSS/component files (path-filtered) to avoid slowing down content-only PRs.

### 2.6 Link checking

An automated crawl (internal links via a Playwright/sitemap-driven check, external links via a lighter HTTP HEAD/GET check with retries) runs against the built preview on every PR that touches routing, navigation, or content-linking code, and on a scheduled basis against production (weekly) to catch external link rot. Internal 404s are a merge gate; external link failures are reported but not blocking (third-party sites go down independently of this codebase).

### 2.7 Metadata and structured-data validation

Automated checks (Playwright + a schema-validation library, e.g. `structured-data-testing-tool` or a custom JSON-LD schema check) confirm, per route class:

- `<title>` and meta description are present and within reasonable length
- Canonical URL is present and self-referential (or correctly points to the canonical variant)
- Open Graph tags are present with a valid image
- Organization structured data appears sitewide; Article structured data on articles/roadmaps/case studies; Service structured data on service pages; FAQ structured data ONLY on pages where the FAQ content is actually visible in the rendered page (never injected for an invisible/collapsed-away FAQ) — this is a merge gate given Locked Brief §21's explicit rule.
- No critical content (headings, primary copy, primary CTA) is rendered exclusively inside a client-only animated component invisible to a no-JS/no-hydration crawl.

Full rule set lives in `design/seo.md`; this section is the automated enforcement of that rule set.

### 2.8 Performance checks — Lighthouse CI

Lighthouse CI runs against the built preview for: homepage, one `/solutions/[slug]`, `/growth-plan`, `/services/[slug]`, `/tools/[slug]`. Budgets are defined in `design/performance.md` (Constitution Principle III target: mobile performance 90+, 95+ best-effort). Lighthouse CI enforces those budgets as a merge gate on PRs touching pages/layout/global scripts; it runs read-only (non-blocking, logged) on content-only PRs to catch regressions from heavy CMS-supplied media without blocking routine content edits.

---

## 3. Test Data / CMS Strategy

- **Seed/fixture dataset.** A fixture set of Sanity documents (or a local JSON fixture layer consumed directly by unit/component tests without hitting Sanity) covers one representative document per content type: solution, business type, starting point, service, tool, roadmap, example, case study, learn article, FAQ set. Each fixture set includes at least one document in each `status` value (Draft, Placeholder, Approval Required, Verified, Ready to Publish) so gating logic (§2.2 Badge/status test, §2.3 journey 7) has real data to assert against.
- **Formspree mocking.** All automated tests (component and E2E) intercept the Formspree POST endpoint (Playwright route interception / MSW for component tests) and assert on the outgoing payload shape rather than performing a real submission. A dedicated E2E case simulates a non-2xx response to verify the user-facing error path.
- **Turnstile mocking.** Turnstile is stubbed to always resolve successfully in test environments via its documented test site-key/test-mode support, so CI does not depend on solving a real challenge or on Cloudflare's live service being reachable. A separate manual/staging smoke check (not CI) confirms the real Turnstile integration works with live keys before launch.
- **Verified-vs-placeholder gating tests.** Beyond the component-level Badge test (§2.2), an E2E-level check asserts that a full route composed partly of placeholder content (e.g., a case study with an unapproved metric) never leaks that content into the rendered public HTML — this is the automated version of the Locked Brief's "no public placeholders" rule and should be treated as a release-blocking category, not a nice-to-have.

---

## 4. CI Integration

**Tooling assumption:** GitHub Actions, matching Locked Brief §18 (GitHub Actions or Cloudflare Git integration). Pipeline runs against a genuine preview build (Next.js build + `@opennextjs/cloudflare` output, or a Vercel/Cloudflare Pages preview URL if used for interim review) — Playwright drives the built app, not `next dev`, so what is tested matches what ships.

**On every pull request:**
1. Lint + typecheck (fail fast, seconds)
2. Unit tests (Vitest) — rules engine, validation, mappers, utilities
3. Component tests (Vitest + Testing Library)
4. Build the preview (Next.js build → OpenNext/Cloudflare or preview deploy)
5. Playwright E2E critical journeys (§2.3) against the built preview, parallelized across journeys/workers
6. axe-core accessibility scans (§2.4) — runs inside the same Playwright pass, sharing browser contexts where practical
7. Metadata/structured-data validation (§2.7)
8. Link check, internal-only (§2.6) — fast, path-filtered to routing/content changes
9. Visual regression (§2.5) — path-filtered to layout/CSS/component changes only
10. Lighthouse CI (§2.8) — full budget gate on page/layout/script changes; logged-only on content-only changes

Steps 1–3 run in parallel with each other; step 4 (build) blocks 5–10, which then run in parallel against the same built artifact. Target: steps 1–3 complete in under 2 minutes; the full pipeline (including build) in under 10 minutes, so PR feedback stays fast enough to not discourage small PRs.

**On merge to main:**
- Full pipeline above, plus the scheduled-cadence external link check (§2.6) runs here rather than on every PR.
- Successful main pipeline is the gate before a production deploy/promotion (Locked Brief §18 preview-before-production).

**Gating thresholds:**
- Merge-blocking: lint/typecheck failure, any unit/component test failure, any critical E2E journey failure, axe serious/critical violations, internal link 404s, FAQ-structured-data-without-visible-FAQ violations, placeholder-content-leak failures, Lighthouse budget failures on page/layout PRs.
- Logged/non-blocking (visible in PR check output, triaged by the two admins): axe moderate/minor violations, external link failures, visual regression diffs pending human approval, Lighthouse on content-only PRs.

---

## 5. Coverage Expectations

Coverage is a signal, not a target to game. Locked Brief and Principle X both explicitly reject 100%-coverage mandates on trivial code.

| Area | Expectation |
|---|---|
| Growth Plan Builder rules engine | Near-complete branch coverage — every business type × stage × goal combination that produces a distinct Start here/Connect next/Add later outcome must be covered by at least one assertion; all escape-hatch paths ("Not sure yet", "Prefer to discuss by email") explicitly covered. |
| Validation schemas (contact, Growth Plan Builder) | All required-field and format-rejection paths covered; malformed-input fuzz cases not required. |
| CMS query mappers | Cover the "field present" and "field missing/optional" paths per content type; do not chase 100% on every CMS field permutation. |
| Utilities/formatters | Cover realistic and boundary inputs; skip exhaustive permutation testing. |
| Components (mega-menu, accordion, stepper, forms, Badge) | Cover the interaction and gating behaviour listed in §2.2; do not test styling, spacing, or copy text. |
| Presentational-only components | No dedicated test file; covered indirectly by E2E + visual regression. |
| Page templates (Server Components rendering CMS content) | No unit/component tests; covered by the E2E smoke check, metadata validation, and visual regression. |

A single sitewide numeric coverage threshold (e.g., "80% lines") is explicitly NOT adopted — it would either force meaningless tests onto presentational components or mask a genuine gap in the rules engine behind an average. Instead, the rules-engine and validation-schema packages carry their own stricter coverage check in CI (near-complete branch coverage, checked per-file), while the rest of the codebase is covered by the pyramid above without a blanket percentage gate.

---

## 6. Per-Milestone Testing Map

Maps to the ten milestones in Locked Brief §25 / `design/delivery-plan.md`.

| Milestone | Testing that lands in this milestone |
|---|---|
| 1. Planning and architecture | This document; test tooling choices confirmed (Vitest, Testing Library, Playwright, axe-core, Lighthouse CI versions pinned per Locked Brief stack table). |
| 2. Repository foundation and design tokens | CI skeleton wired (lint, typecheck, empty Vitest/Playwright configs run green on a hello-world check); no feature tests yet. |
| 3. CMS schemas and preview | CMS query mapper unit tests; status-field fixture set (Draft/Placeholder/Approval Required/Verified/Ready to Publish) created; preview-vs-published E2E scaffold (journey 7) stubbed against fixtures. |
| 4. Header, navigation and homepage opening | Mega-menu and mobile-nav component tests; homepage static-first E2E (journey 1); keyboard mega-menu E2E (journey 3); mobile nav E2E (journey 2); reduced-motion E2E (journey 8) for the hero. |
| 5. Remaining homepage sections | Visual regression baselines for homepage; axe scan added for homepage; link check added for homepage internal links. |
| 6. Growth Plan Builder and forms | Rules engine unit tests (near-complete coverage, written before/alongside implementation per TDD); validation schema unit tests; stepper and form-field component tests; Badge/status gating component test; Growth Plan Builder happy-path E2E (journey 4); validation/error-state E2E (journey 5); contact form E2E (journey 6); Formspree/Turnstile mocking wired into CI. |
| 7. Core goal/business/service/tool templates | Accordion component tests (service detail, tool detail); filter-by-taxonomy unit tests (category/goal/stage/business type/delivery model/tool); metadata/structured-data validation extended to these route classes; visual regression baselines for each template family. |
| 8. Resources, articles and case studies | Article/roadmap/case-study structured-data validation; placeholder-leak E2E extended to case studies (the highest-risk content type for unverified claims); full-keyboard-navigation E2E (journey 9). |
| 9. SEO, accessibility, performance and security hardening | Full axe scan across all route classes as merge gate; Lighthouse CI budgets enforced as merge gate; full metadata/structured-data validation as merge gate; link check extended to scheduled external-link cadence; security-relevant input validation re-verified (`design/security.md`/OWASP pass). |
| 10. Content QA, preview deployment and launch preparation | Full pipeline run against the production-equivalent preview; manual accessibility pass beyond axe (`design/accessibility.md`); manual Formspree/Turnstile live-key smoke check (not CI); final placeholder-leak sweep across real CMS content before go-live. |

---

## 7. Testing Done Checklist

Use this at the end of each milestone and again before launch (Locked Brief §26 / Constitution Principle XIV).

- [ ] Rules engine unit tests cover every distinct recommendation outcome and both escape-hatch paths
- [ ] Validation schema tests cover all required-field and format-rejection paths for both forms
- [ ] CMS query mapper tests cover present/missing-field paths for every content type in use
- [ ] Mega-menu, mobile nav, accordion, stepper, and form-field component tests pass and cover keyboard + ARIA state
- [ ] Badge/status gating test confirms non-Verified/Ready content never reaches the public render
- [ ] All nine critical E2E journeys (§2.3) pass against the built preview
- [ ] Formspree and Turnstile are mocked in every automated test; no test depends on live third-party services
- [ ] axe-core scan shows zero serious/critical violations across all listed route classes, both viewports
- [ ] Visual regression baselines exist and are current for homepage, each template family, Growth Plan Builder steps, header states, footer
- [ ] Internal link check passes with zero 404s; external link check is running on its scheduled cadence
- [ ] Metadata and structured-data validation passes, including the FAQ-only-when-visible rule
- [ ] Lighthouse CI budgets pass on all checked routes (or documented exceptions recorded in the plan's Complexity Tracking)
- [ ] CI pipeline order and gating thresholds match §4 and are enforced on both PR and main
- [ ] No blanket coverage-percentage gate has been added; rules-engine/validation coverage is checked per-file instead
- [ ] Testing map for the current milestone (§6) is fully checked off before moving to the next milestone
