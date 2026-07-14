# Cross-Artifact Analysis, Risk Register & Open Questions

Spec Kit `analyze` output. Checks consistency across spec ↔ plan ↔ tasks ↔ design ↔ sources, records
the risk register, and lists owner decisions. **Implementation has not started.**

## 1. Deliverable coverage (planning prompt → artifacts)

| # | Requested deliverable | Where |
|---|---|---|
| 1 | Product & UX specification | `spec.md` |
| 2 | Route & sitemap proposal | `design/sitemap-and-routes.md` (+ spec/plan) |
| 3 | User journeys | `spec.md` (US1–US4) |
| 4 | Component & section inventory | `design/component-inventory.md` |
| 5 | Technical architecture | `plan.md` §Technical Architecture |
| 6 | Proposed repository structure | `plan.md` §Repository Structure |
| 7 | Current-version compatibility plan | `research.md` |
| 8 | CMS content model + modular section model | `data-model.md` |
| 9 | Growth Plan Builder data & rules | `data-model.md` + `contracts/growth-plan-rules.md` |
| 10 | Form & email-delivery architecture | `contracts/forms-and-email.md` |
| 11 | Animation architecture & reduced-motion | `design/animation.md` |
| 12 | Accessibility plan (WCAG 2.2 AA) | `design/accessibility.md` |
| 13 | SEO & structured-data plan | `design/seo.md` |
| 14 | Security & privacy plan | `design/security-privacy.md` |
| 15 | Performance budgets & measurement | `design/performance.md` |
| 16 | Testing strategy | `design/testing.md` |
| 17 | Cloudflare deployment & preview plan | `design/deployment.md` |
| 18 | Environment-variable inventory (no secrets) | `design/environment.md` |
| 19 | Milestone plan | `plan.md` §Milestone Plan |
| 20 | Detailed implementation tasks & dependencies | `tasks.md` |
| 21 | Risk register | this doc §3 |
| 22 | Acceptance criteria & definition of done | `spec.md` §Success Criteria + `quickstart.md` + `checklist.md` |

All 22 deliverables are present.

## 2. Consistency findings

**Consistent ✔**
- Official names (8 stages, 3 cross-cutting systems, 4 delivery models) identical across spec,
  data-model, component-inventory, sitemap.
- Route list consistent across `spec.md`, `plan.md` structure, `design/sitemap-and-routes.md`.
- Pinned versions consistent across `research.md`, `plan.md`, `design/deployment.md`,
  `design/environment.md` (Next 16.2.10, React 19.2.7, @opennextjs/cloudflare 1.20.1, wrangler 4.110,
  sanity 6.4.0 / next-sanity 13.1.1, gsap 3.15.0, motion 12.42.2, Turnstile wrapper 1.5.3, Playwright
  1.61.1).
- Guardrails (email-led, no SaaS/login, no unverified content, Global English) appear as *prohibitions*
  only — grep confirms no artifact asserts a forbidden pattern as site copy.
- The **brief overrides the Growth Guide** where they conflict: the Guide's "book a discovery call"
  language does **not** appear in any requirement; conversion is email-led throughout.
- Constitution Check passes (`plan.md`) with no unjustified violations.

**Resolved during planning (source conflicts handled)**
- Growth Guide stage "Grow through advocacy" → normalised to brief's **Advocacy & Growth**.
- Guide "Maintain & Scale" → brief's **Maintenance & Scale**.
- Design-system README's "logo is temporary" note → treated as **stale**; `logo/` files are current.
- Raster `infinity-universe.png` (baked text) → **not shipped**; hero rebuilt as editable SVG.

**Deliberate enhancements (not deviations)**
- Accessibility target **WCAG 2.2 AA** exceeds the constitution's 2.1 AA baseline (brief §19).

**Design-quality issues found (must fix before component build, tracked as risks + CHK items)**
- CTA gradient contrast (R-A11Y-1 / CHK-A12) and section-scoped text colour aliases (R-A11Y-2 /
  CHK-A13) — surfaced by computing contrast on the approved tokens.

**No contradictions found** between spec requirements, plan architecture, and task backlog.

## 3. Risk register

Severity: 🔴 high · 🟠 medium · 🟡 low. Each risk has an owner action or mitigation.

| ID | Risk | Sev | Mitigation / action |
|---|---|---|---|
| R-A11Y-1 | Primary CTA gradient (white text on pink→orange) fails WCAG AA at the orange end (~2.6:1) | 🟠 | Use dark `--ink-950` text on the CTA gradient; add a validated CTA token. Fix in M2 (T006) before primitives. |
| R-A11Y-2 | Global body-text token fails on the bright `#F4F1EA` editorial band (~1.6:1) | 🟠 | Introduce section-scoped text aliases (on-dark/on-band/on-statement); re-check all pairs. M2 (T007). |
| R-TS-1 | TypeScript 7.0.2 (native compiler) may outpace tooling type-support (ESLint TS plugin, Sanity typegen, Vitest) | 🟠 | Throwaway compile at start; pin TS 5.9.x LTS if gaps. Both satisfy the brief. T001. |
| R-IMG-1 | `next/image` optimisation behaviour under `@opennextjs/cloudflare` 1.20.1 unconfirmed | 🟠 | Validate loader at M2; choose Sanity image pipeline vs Cloudflare Images/loader. `design/performance.md` / `design/deployment.md`. |
| R-DEPLOY-1 | Cloudflare Workers Builds cannot cleanly separate preview vs production secrets | 🟠 | Recommend **GitHub Actions** (`opennextjs-cloudflare build` + `wrangler deploy`) for per-env secrets + PR previews (`design/deployment.md`). |
| R-MW-1 | Node.js middleware (Next 15.2+) is unsupported by the Cloudflare adapter | 🟡 | Do host canonicalisation/redirects at the Cloudflare edge and headers via config/Worker; avoid Node middleware. `research.md` R1. |
| R-CONTENT-1 | Large taxonomy (~110+ services, ~80+ tools, goals, roadmaps, rules) needs authored + **Verified** copy; heavy content lift | 🔴 | **Owner decision Q1**: who authors/verifies content, and is it in this build's scope? Seed from the Guide; gate everything until Verified. Affects M8/M10 timeline. |
| R-CMS-1 | Sanity free-tier seat/dataset/bandwidth limits for two editors + preview | 🟡 | Confirm project/plan (Owner Q2); Sanity free tier covers two editors + one dataset; monitor usage. |
| R-LGL-1 | GSAP licence forbids building a Webflow **competitor** | 🟡 | Not applicable (marketing site). Watch item only; re-check if scope ever changes. |
| R-LOGO-1 | Logo needs human vector cleanup (outline live Sora wordmark) + originality/trademark review before final launch | 🟠 | Does not block previews (brief §7). **Owner action**: schedule the human review before production launch. |
| R-FONT-1 | Real brand webfonts not supplied; current fonts are Google-Fonts substitutions | 🟡 | Build with substitutes via `next/font`; swap real webfonts later with no layout change. |
| R-PERF-1 | Rich hero/scroll motion could threaten performance budgets on low-end mobile | 🟠 | Static-first hero, dynamic-import GSAP, transforms/opacity only, lazy below-fold, LHCI budget gate (M9). If a validated Three.js prototype is ever proposed, re-budget. |
| R-VER-1 | Pinned versions may move before implementation begins | 🟡 | Re-verify + pin at start (T001); brief §17. |
| R-SPAM-1 | Public email-led forms attract spam/abuse | 🟡 | Turnstile (server-verified) + honeypot + timing + edge rate-limit + Formspree filtering (`contracts/forms-and-email.md`). |
| R-SEC-1 | CSP must allow Sanity Studio, Formspree, Turnstile, Cloudflare Analytics, fonts without over-opening | 🟡 | Explicit allowlist + test; keep third-party surface minimal (`design/security-privacy.md`). |

## 4. Open questions / decisions requested

**None block plan approval.** The brief is thorough enough to proceed on grounded defaults. The
following need an owner answer **before the noted milestone**, not before approval:

- **Q1 (before M8/M10) — Content authoring & verification.** The taxonomy is large and everything is
  gated until **Verified**. Is authoring/verifying the full service/tool/goal/roadmap/rule content in
  scope for this build, or will the owner supply approved copy? This materially affects the M8/M10
  timeline. *(Default assumed: seed structure from the Growth Guide; owner reviews/Verifies before any
  page goes public.)*
- **Q2 (before M3) — Sanity project.** Use an existing Sanity organisation/project or create a new one?
  Confirm two editor seats + a production dataset on the free tier are acceptable. *(Default: create a
  new free project.)*
- **Q3 (before production launch) — Logo finalisation.** Confirm the human vector cleanup (outline the
  live Sora wordmark) and originality/trademark review will be completed before production (does not
  block preview builds). *(Default: previews proceed; production gated on this.)*

**Refinements defaulted (documented, non-blocking; adjust at `plan` review if desired):**
- Keep `/business-types/[slug]` and `/solutions` as **distinct** routes (better internal linking/SEO)
  rather than unifying under one facet.
- `/examples` and `/case-studies` may remain distinct but both **hidden** until Verified content exists.
- Self-host subset fonts (over runtime Google Fonts) for performance/privacy/CSP.
- Route conversion forms through an internal Route Handler (for server Turnstile verification + edge
  rate-limiting) rather than posting the browser straight to Formspree.

## 5. Readiness

- **Constitution**: PASS, no unjustified violations.
- **Coverage**: all 22 deliverables present; all brief sections addressed (see `checklist.md`).
- **Consistency**: no contradictions; source conflicts resolved in favour of the locked brief.
- **Blockers to approval**: none. Three owner decisions requested before specific downstream milestones.

**Recommended next step**: owner reviews this planning set; on approval, resolve Q1–Q3, then begin
Milestone M2 via `/speckit-implement`. **Do not start implementation before approval.**
