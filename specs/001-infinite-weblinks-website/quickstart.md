# Quickstart & Definition of Done — Infinite Weblinks

Phase 1 artifact. How to **resume** this project after planning approval, plus the consolidated
**Definition of Done**. Planning only — nothing here has been built.

> **Owner-locked (2026-07-14):** TypeScript **6.0.x** (not native TS7); OpenNext cache **R2 + D1, no KV**,
> on-demand revalidation; Sanity Studio **deployed separately** (`*.sanity.studio`), not embedded;
> **progressive CMS** (initial slice at M3); seed content as **Draft/Placeholder**; **hard stop at
> GATE-1** (homepage opening) for owner review before the rest of the homepage.

## How to resume (after owner approves the plan)
1. **Read the spine**: `spec.md` → `plan.md` → `research.md` → `data-model.md` → `contracts/*`, then the
   `design/*` docs for the area you're starting.
2. **Confirm versions** (brief §17): re-verify and pin exact patches for every package in `research.md`
   at implementation start. **TypeScript**: pin the latest stable **6.0.x** (or `5.9.x` LTS interim if
   no 6.0 GA yet — R6) and typecheck the whole toolchain; keep native TS7 as an experiment only.
3. **Re-validate the OpenNext cache config** (R2 incremental cache + D1 tag cache, on-demand
   revalidation, no KV) against the **current OpenNext docs** — R-CACHE-1 (`design/deployment.md`).
4. **Resolve the two token blockers first** (R-A11Y-1 CTA gradient text colour, R-A11Y-2 section-scoped
   text aliases) before building primitives — see `design/accessibility.md`.
5. **Follow the milestone order** in `plan.md` (M2 → M10); implement `tasks.md` in dependency order.
   **Stop at GATE-1** (end of M4): deploy a private preview of the homepage opening and **wait for owner
   review** before Phase 5. Build CMS schemas **progressively** (initial slice at M3; roadmaps at M7;
   articles/resources/examples/case-studies/testimonials at M8). **Seed taxonomy as Draft/Placeholder**
   from the Growth Guide.
6. **Provision services**: Cloudflare (Workers, **R2** [incremental cache], **D1** [tag cache], Workers
   Assets, Turnstile, Web Analytics, DNS — **no KV**); a **new free Sanity project** (two editors,
   `production` dataset) with the **Studio deployed separately** via `sanity deploy` to `*.sanity.studio`
   (add CORS origins: site, `*.sanity.studio`, previews, localhost); Formspree (two endpoints); Google
   Search Console. Store secrets only in Cloudflare/CI secret storage (`design/environment.md`) — never
   in Git.
7. **Only then run `/speckit-implement`.** Do not begin implementation before this plan is reviewed and
   approved (brief §25, constitution XI), and do not pass GATE-1 without owner approval.

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
- [ ] **GATE-1 owner review passed** (homepage opening) before building the rest of the homepage.
- [ ] Preview deployment reviewed before production; www→root works; **on-demand revalidation (R2 cache +
      D1 tags) fires on Sanity publish**; rollback path verified (Workers version rollback + Sanity History).
- [ ] Studio deployed separately (`*.sanity.studio`) with correct CORS; Presentation preview verified.
- [ ] Convergence review (`/speckit-converge`) records no open blocking gaps.

## Environments (see `design/deployment.md`, `design/environment.md`)
- **dev** — local data, production dataset read-only (or a dev dataset), non-prod Formspree/Turnstile keys.
- **preview** — per-PR Cloudflare preview URL; production dataset (read); separate secrets.
- **production** — `https://infiniteweblinks.com` (www→root), production secrets in Cloudflare.
- **Studio** — a **separate Sanity-hosted deploy** at `*.sanity.studio` (not a per-environment Worker),
  pointing at the `production` dataset; its origin is in the Sanity CORS allowlist.

## What NOT to do at resume
- Do not scaffold or install anything until versions are re-verified and the plan is approved.
- Do not pin native **TypeScript 7** as the build compiler (use stable 6.0.x / 5.9.x — R6).
- Do not embed Sanity Studio at `/studio`, and do not configure **Workers KV** as the incremental cache
  (use the **separately-hosted Studio** + **R2 incremental cache + D1 tag cache**).
- Do not proceed past **GATE-1** (homepage opening) without explicit owner approval.
- Do not copy `_ds_bundle.js` or the homepage exploration HTML into production.
- Do not ship the raster hero; rebuild the hero as editable SVG.
- Do not add "Book a Call"/calendar/phone, SaaS/login language, or unverified proof.
