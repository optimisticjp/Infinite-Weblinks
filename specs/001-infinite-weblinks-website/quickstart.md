# Quickstart & Definition of Done — Infinite Weblinks

Phase 1 artifact. How to **resume** this project after planning approval, plus the consolidated
**Definition of Done**. Planning only — nothing here has been built.

## How to resume (after owner approves the plan)
1. **Read the spine**: `spec.md` → `plan.md` → `research.md` → `data-model.md` → `contracts/*`, then the
   `design/*` docs for the area you're starting.
2. **Confirm versions** (brief §17): re-verify and pin exact patches for every package in `research.md`
   at implementation start; resolve R-TS-1 (TypeScript 7 vs 5.9 LTS) with a throwaway compile.
3. **Resolve the two token blockers first** (R-A11Y-1 CTA gradient text colour, R-A11Y-2 section-scoped
   text aliases) before building primitives — see `design/accessibility.md`.
4. **Follow the milestone order** in `plan.md` (M2 → M10); implement tasks from `tasks.md` in dependency
   order.
5. **Provision services**: Cloudflare (Workers/KV/R2/Turnstile/Web Analytics/DNS), Sanity project
   (production dataset), Formspree (two endpoints), Google Search Console. Store secrets only in
   Cloudflare secret storage (`design/environment.md`) — never in Git.
6. **Only then run `/speckit-implement`.** Do not begin implementation before this plan is reviewed and
   approved (brief §25, constitution XI).

## Definition of Done (consolidated — constitution XIV + brief §26)

A milestone/feature is done only when all applicable items below hold. Detailed acceptance items live in
`checklist.md`.

### Product & content
- [ ] Requirements implemented for the milestone's user story (spec FRs).
- [ ] Growth story reads clearly, teaches before selling, uses exact official names.
- [ ] No unverified placeholder metric/testimonial/case-study/client-name/partnership/phone in production.
- [ ] Copy is Global English and passed a humanizer review (no SaaS boilerplate/hype).
- [ ] Two admins can manage the relevant content/sections unaided (approved controls only).

### Experience
- [ ] Mobile-first correct at 360 / 390 / 768 / 1024 / large desktop; no horizontal overflow.
- [ ] Visual direction coherent (approved tokens, section rhythm, one icon family).
- [ ] Motion enhances only; `prefers-reduced-motion` gives the complete static state; no info on hover
      or animation only.

### Quality gates
- [ ] Accessibility: axe zero critical on key routes; keyboard-only journeys pass; WCAG 2.2 AA items met.
- [ ] SEO: metadata, single canonical, structured data (where applicable), sitemap/robots correct;
      no critical content locked in client-only animation.
- [ ] Performance: Lighthouse mobile ≥90 (target 95+), CWV "good", within per-page budgets.
- [ ] Security: inputs validated/sanitised, Turnstile+Formspree working, headers/CSP set, least-privilege
      CMS, draft protection, no secret in repo, dependency review clean.
- [ ] Tests: rules-engine + validation unit tests pass; Playwright critical journeys pass; visual, link,
      metadata & structured-data checks pass.
- [ ] Build + lint + typecheck pass; no unnecessary dependencies added; no unfinished placeholders left.

### Delivery
- [ ] Preview deployment reviewed before production; www→root works; rollback path verified.
- [ ] Convergence review (`/speckit-converge`) records no open blocking gaps.

## Environments (see `design/deployment.md`, `design/environment.md`)
- **dev** — local/preview data, dev Sanity dataset or production read-only, non-prod Formspree/Turnstile
  keys.
- **preview** — per-PR Cloudflare preview URL; production dataset (read); separate secrets.
- **production** — `https://infiniteweblinks.com` (www→root), production secrets in Cloudflare.

## What NOT to do at resume
- Do not scaffold or install anything until versions are re-verified and the plan is approved.
- Do not copy `_ds_bundle.js` or the homepage exploration HTML into production.
- Do not ship the raster hero; rebuild the hero as editable SVG.
- Do not add "Book a Call"/calendar/phone, SaaS/login language, or unverified proof.
