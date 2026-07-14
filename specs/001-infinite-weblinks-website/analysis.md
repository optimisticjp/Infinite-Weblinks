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

**Post-review revisions applied (owner-locked, 2026-07-14) — consistent across artifacts**
- **TypeScript → stable 6.0.x** (native TS7 = future experiment only; `5.9.x` LTS interim if no 6.0 GA):
  research.md R6, plan.md, tasks.md T001, checklist CHK043.
- **OpenNext cache → R2 incremental cache + D1 tag cache + Workers Assets, no KV; on-demand revalidation**
  (no time-based ISR, no Durable-Object queue initially): research.md R2, deployment.md §1/§5,
  environment.md §3, performance.md §caching, sitemap-and-routes legend, plan.md, tasks.md T004/T025,
  CHK044/045. Binding names verified across deployment/environment (`NEXT_INC_CACHE_R2_BUCKET`,
  `NEXT_TAG_CACHE_D1`, `ASSETS`).
- **Sanity Studio → separate Sanity-hosted deploy (`*.sanity.studio`), not embedded at `/studio`**:
  research.md R3, deployment.md §6, security-privacy §3.1/§4.2/§4.5, environment.md, sitemap-and-routes,
  seo.md, plan.md, data-model.md, tasks.md T015/T022/T024, CHK046. CSP now relaxes preview
  `frame-ancestors` to `https://*.sanity.studio`; Sanity CORS adds that origin.
- **Progressive CMS**: initial slice at M3; roadmaps → M7; articles/resources/examples/case-studies/
  testimonials → M8; full model preserved: data-model.md, plan.md milestones, tasks.md, CHK047.
- **Content seeded as Draft/Placeholder**, owner verifies progressively; previews don't need polished
  copy: spec.md, data-model.md, tasks.md T027, CHK048.
- **Mandatory homepage-opening review gate (GATE-1)** after M4: plan.md, tasks.md T035a/T035b,
  quickstart.md, CHK049.

**No contradictions found** between spec requirements, plan architecture, and task backlog after the
revisions.

## 3. Risk register

Severity: 🔴 high · 🟠 medium · 🟡 low. Each risk has an owner action or mitigation.

| ID | Risk | Sev | Mitigation / action |
|---|---|---|---|
| R-A11Y-1 | Primary CTA gradient (white text on pink→orange) fails WCAG AA at the orange end (~2.6:1) | 🟠 | Use dark `--ink-950` text on the CTA gradient; add a validated CTA token. Fix in M2 (T006) before primitives. |
| R-A11Y-2 | Global body-text token fails on the bright `#F4F1EA` editorial band (~1.6:1) | 🟠 | Introduce section-scoped text aliases (on-dark/on-band/on-statement); re-check all pairs. M2 (T007). |
| R-TS-1 | TypeScript owner-locked to stable **6.0.x**, but npm shows **no 6.0.x GA yet** (`6.0.0-beta` only; `latest`=7.0.2) | 🟡 | Pin the 6.0.x GA once published, else **`5.9.x` LTS** interim (both honour the owner's intent + brief strict mode); typecheck the full toolchain at setup. research.md R6 / T001. Native TS7 = experiment only. |
| R-CACHE-1 | The R2-incremental-cache + D1-tag-cache OpenNext config must match current OpenNext docs (binding/override names, `wrangler.jsonc`) | 🟠 | **Owner-required re-validation at implementation start** (T004); a mismatch silently disables caching. deployment.md §1/§5. |
| R-STUDIO-1 | Separate hosted Studio needs correct Sanity CORS origins (`*.sanity.studio`, previews) + preview `frame-ancestors` for Presentation; misconfig breaks live editing/preview | 🟡 | Configure CORS + preview framing per security-privacy §3.1/§4.5 and deployment §6; verify Presentation end-to-end on a preview URL. |
| R-IMG-1 | `next/image` optimisation behaviour under `@opennextjs/cloudflare` 1.20.1 unconfirmed | 🟠 | Decision: serve editor media via Sanity image CDN; validate at M2 (deployment §4). `design/performance.md` / `design/deployment.md`. |
| R-DEPLOY-1 | Cloudflare Workers Builds cannot cleanly separate preview vs production secrets | 🟠 | Recommend **GitHub Actions** (`opennextjs-cloudflare build` + `wrangler deploy`) for per-env secrets + PR previews; Studio deploys separately via `sanity deploy` (`design/deployment.md`). |
| R-MW-1 | Node.js middleware (Next 15.2+) is unsupported by the Cloudflare adapter | 🟡 | Do host canonicalisation/redirects at the Cloudflare edge and headers via config/Worker; avoid Node middleware. `research.md` R1. |
| R-CONTENT-1 | Large taxonomy (~110+ services, ~80+ tools, goals, roadmaps, rules) needs **Verified** copy; content lift | 🟡 | **Resolved (Q1 locked)**: seed structure from the Growth Guide as **Draft/Placeholder**; owner reviews and Verifies **progressively**; previews don't need polished copy. Real effort remains but is no longer a blocker; gating keeps unverified content off the public site. |
| R-CMS-1 | Sanity free-tier seat/dataset/bandwidth limits for two editors + preview | 🟡 | **Resolved (Q2 locked)**: create a **new free Sanity project** (two editor seats, one `production` dataset). Monitor usage; free tier covers this profile. |
| R-LGL-1 | GSAP licence forbids building a Webflow **competitor** | 🟡 | Not applicable (marketing site). Watch item only; re-check if scope ever changes. |
| R-LOGO-1 | Logo needs human vector cleanup (outline live Sora wordmark) + originality/trademark review | 🟡 | **Resolved (Q3 locked)**: current logo is fine for **previews**; cleanup + trademark review are **production-launch gates only**. Owner action: complete both before production. |
| R-FONT-1 | Real brand webfonts not supplied; current fonts are Google-Fonts substitutions | 🟡 | Build with substitutes via `next/font`; swap real webfonts later with no layout change. |
| R-PERF-1 | Rich hero/scroll motion could threaten performance budgets on low-end mobile | 🟠 | Static-first hero, dynamic-import GSAP, transforms/opacity only, lazy below-fold, LHCI budget gate (M9). If a validated Three.js prototype is ever proposed, re-budget. |
| R-VER-1 | Pinned versions may move before implementation begins | 🟡 | Re-verify + pin at start (T001); brief §17. |
| R-SPAM-1 | Public email-led forms attract spam/abuse | 🟡 | Turnstile (server-verified) + honeypot + timing + edge rate-limit + Formspree filtering (`contracts/forms-and-email.md`). |
| R-SEC-1 | CSP must allow Sanity (API/CDN), Formspree, Turnstile, Cloudflare Analytics, fonts without over-opening; preview routes must be framable by `*.sanity.studio` (Presentation) without opening public routes | 🟡 | Explicit allowlist + test; keep third-party surface minimal; `frame-ancestors 'none'` on public routes, relaxed only on preview/Draft-Mode responses (`design/security-privacy.md`). The external Studio is **not** served by the app, shrinking the app's script surface. |

## 4. Open questions / decisions — **RESOLVED (owner-locked, 2026-07-14)**

The three previously-open decisions are now **locked** by the owner and reflected across the artifacts:

- **Q1 — Content authoring & verification → LOCKED.** Content authoring **is in scope as structured
  Draft/Placeholder seeding** from the Growth Guide; the owner reviews and marks content **Verified
  progressively**. Full polished taxonomy copy is **not** required before homepage previews. (spec.md,
  data-model.md, tasks.md T027; R-CONTENT-1.)
- **Q2 — Sanity project → LOCKED.** Create a **new free Sanity project** for two editors. (research.md
  R3, spec.md; R-CMS-1.)
- **Q3 — Logo → LOCKED.** The current logo may be used in **previews**; human vector cleanup +
  originality/trademark review are **production-launch gates only**. (spec.md, research.md; R-LOGO-1.)

**No new blocking questions** arise from the architecture revisions (they were owner-directed). The only
remaining owner **action items** are the risk-register follow-ups: re-validate the OpenNext R2/D1 cache
config at implementation (R-CACHE-1), confirm the TypeScript 6.0.x GA vs 5.9.x interim at setup (R-TS-1),
and complete the logo cleanup before production (R-LOGO-1).

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
- **Consistency**: no contradictions after the owner-locked revisions; TypeScript/caching/Studio/
  progressive-CMS/review-gate changes reflected consistently across all affected artifacts (§2).
- **Owner decisions**: Q1–Q3 **locked** and applied; only implementation-time re-validations remain
  (R-CACHE-1, R-TS-1) plus the pre-launch logo gate (R-LOGO-1).
- **Blockers to approval**: none.

**Recommended next step**: begin Milestone **M2** via `/speckit-implement` when ready — building to the
**GATE-1** homepage-opening review stop, at which point a private preview is deployed and work halts for
owner review before the remaining homepage sections. **Implementation has not started.**
