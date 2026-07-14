# Cloudflare Deployment & Preview Plan — Infinite Weblinks

Planning-only. Companion to `design/environment.md` (full env var/secret inventory) and
`design/performance.md` (image/animation/budget detail). This document owns the
hosting-side decisions: what runs where, how a change gets from a pull request to
`infiniteweblinks.com`, and how to undo it if something breaks.

## 1. Target architecture

The app is a Next.js **16.2.10** App Router project (React **19.2.7**, RSC by
default), built for Cloudflare with **@opennextjs/cloudflare 1.20.1** (peer
`next >=16.2.6`, satisfied) and shipped with **wrangler 4.110.0**. OpenNext
transforms the standard Next.js build output into a Cloudflare Worker; there is
no separate Node server and no Cloudflare Pages Functions path — Workers is the
one deploy target, matching brief §17/§18 ("Cloudflare Workers via the current
supported Next.js/OpenNext path"). Cloudflare Pages' own Next.js runtime is a
different, older integration and is out of scope here.

The Worker needs three bound resources. Names below are fixed by the OpenNext
Cloudflare adapter's internal conventions, not arbitrary — they must match
exactly in `wrangler.jsonc`:

| Resource | Binding name | Purpose |
|---|---|---|
| KV namespace | `NEXT_CACHE_WORKERS_KV` | Default store for the OpenNext **incremental cache** — ISR/SSG page output and the Next.js `fetch` cache, keyed per route/tag. This is what makes `revalidate` and `revalidateTag`/`revalidatePath` work without a filesystem (Workers has none). |
| R2 bucket | `NEXT_INC_CACHE_R2_BUCKET` | Overflow store for incremental-cache entries too large or too numerous to hold economically in KV (KV has a 25 MB per-value ceiling and is priced per read/write; R2 storage is cheaper and egress-free). Used for larger cached HTML/RSC payloads — e.g. content-rich `/case-studies/[slug]` or `/learn/[slug]` pages. |
| Workers Assets | `ASSETS` → `.open-next/assets` | Serves compiled static output (`_next/static/*`, fonts, `public/*`) directly from Cloudflare's edge, **without invoking the Worker**. Faster (edge cache, no cold start) and cheaper (no Worker request billed) for anything that never changes per-request. |

Rationale for all three: without KV the app falls back to no incremental cache
(every ISR page recomputes on every request — slow, expensive); without R2 the
larger pages either fail to cache or push the KV free-tier limits quickly;
without Workers Assets every static file request would needlessly round-trip
through the Worker instead of Cloudflare's CDN edge.

Also required in `wrangler.jsonc`: the `nodejs_compat` compatibility flag (Next.js's
server runtime expects a subset of Node APIs) and a `compatibility_date` no
earlier than the OpenNext adapter's documented minimum. A future optional
addition — not needed for MVP — is a D1-backed tag cache
(`NEXT_TAG_CACHE_D1`) for stronger multi-instance revalidation consistency;
KV-based tag tracking is sufficient at this site's traffic scale and editor
cadence.

```jsonc
// wrangler.jsonc — bindings only, illustrative
{
  "name": "infinite-weblinks",
  "compatibility_date": "2026-06-01",
  "compatibility_flags": ["nodejs_compat"],
  "assets": { "directory": ".open-next/assets", "binding": "ASSETS" },
  "kv_namespaces": [{ "binding": "NEXT_CACHE_WORKERS_KV", "id": "<kv-id>" }],
  "r2_buckets": [{ "binding": "NEXT_INC_CACHE_R2_BUCKET", "bucket_name": "<bucket>" }]
}
```

## 2. Domains, TLS, DNS

- Canonical: `https://infiniteweblinks.com` (apex/root). Added as a **Worker
  Custom Domain** — Cloudflare auto-creates the DNS record and issues/renews the
  TLS certificate (Universal SSL, mode **Full (strict)**), so no manual
  certificate handling.
- `www.infiniteweblinks.com` → root, **301**, enforced at the **Cloudflare edge**
  via a zone-level Redirect Rule (free on all plans), not in application code.
  This means the redirect works even if the Worker is erroring or mid-deploy,
  costs zero compute, and needs no route in Next.js. `www` gets a proxied DNS
  record but is never routed to the Worker.
- DNS fully hosted on Cloudflare (nameservers delegated to Cloudflare) — single
  zone, single place to manage records, redirect rules, and certificates.
- HSTS and other security headers are configured as Worker response headers /
  Cloudflare Transform Rules (see brief §22, covered in the security review, not
  duplicated here).

## 3. Environments and CI/CD

Two deploy contexts:

- **Production** — `main` branch → `infiniteweblinks.com`. Every merge to `main`
  builds and promotes a new Worker Version to 100% traffic.
- **Preview** — every pull request gets its own ephemeral Worker Version and a
  unique preview URL, generated via `wrangler versions upload` (does not affect
  the production Version or its traffic). Reviewers see the actual running app,
  not just a diff.
- **Staging (optional, recommended for milestone 10)** — a persistent
  `staging` branch/environment for content QA and stakeholder sign-off before a
  launch-critical release, deployed the same way as production but promoted
  manually. Not required day one; add it once the team reaches milestone 9–10
  (SEO/accessibility/performance/security hardening → content QA and launch
  prep).

**Two viable CI paths, both native to this stack:**

| | Cloudflare Workers Builds (Git integration) | GitHub Actions + `wrangler`/`wrangler-action` |
|---|---|---|
| Setup effort | Lowest — connect repo in the Cloudflare dashboard, set build/deploy commands | One workflow file, uses secrets already in GitHub |
| Per-PR preview URL | Built in — auto-comments the PR | Built in — one job step, same effect |
| Gate deploy on full test suite (lint, typecheck, Vitest, Playwright, Lighthouse CI, axe-core) | Possible only by cramming checks into the single build command; no native multi-job pipeline | Native — separate jobs/steps, clear pass/fail per check, matches brief §24's test list directly |
| Distinct env vars per preview vs production | **Not possible** — preview builds currently share production's environment variables/secrets | Full control — GitHub Environments (`production`, `preview`) each with their own secret set |

**Recommendation: GitHub Actions.** The deciding factor is the last row: this
project needs a Sanity **preview-scoped** read token, and ideally sandbox
Turnstile keys, that must never be the same values production uses — Workers
Builds cannot separate those. GitHub Actions also lets the required test suite
(brief §24) act as a real merge gate rather than an informal build-command
step, which fits the "Test Important Behaviour" and small-team-maintainability
principles better. Revisit Workers Builds later only if the team wants to drop
CI maintenance entirely and is willing to accept the shared-env-var
limitation.

Pipeline shape (illustrative, not a working file):

```yaml
# .github/workflows/deploy.yml — job outline only
jobs:
  ci:            # all PRs — lint, typecheck, Vitest, Playwright, Lighthouse CI, axe-core, build
  preview-deploy: # PRs only, needs: ci — opennextjs-cloudflare build + `wrangler versions upload`
                  # posts the preview URL as a PR comment
  deploy:         # push to main only, needs: ci — `wrangler versions deploy` (promote) or `wrangler deploy`
```

## 4. Image handling on Cloudflare

Next.js's default image loader needs Node's `sharp`, which is unavailable in
the Workers runtime. Two image sources exist on this site:

1. **Sanity-managed images** (case studies, articles, testimonials, tool/service
   imagery, examples) are already served from Sanity's own asset CDN
   (`cdn.sanity.io`), which does on-the-fly resize/format/quality transforms via
   the Sanity Image URL builder at no extra cost within the Sanity plan.
2. **Site-authored brand/decorative assets** (hero graphics, icons, logo) are
   SVG or pre-built raster exports that don't need per-request optimisation.

**Decision:** set `images.unoptimized: true` (or a thin custom loader that
delegates to `@sanity/image-url` for Sanity-sourced images) rather than adding
**Cloudflare Images** or the **Image Resizing** add-on. This avoids a second,
paid image pipeline and keeps Sanity as the single source of truth for
editor-uploaded imagery — consistent with the "free-first stack" direction.
Non-Sanity static images are optimised once at build time (correct dimensions,
WebP/AVIF) and served immutable via Workers Assets. Full format/responsive-size/
LCP guidance is owned by `design/performance.md`; this section only fixes the
hosting-side decision so that document doesn't need to re-litigate Cloudflare
Images vs. not. If a future need arises for on-the-fly focal-point cropping
beyond Sanity's URL builder, Cloudflare Images can be added later without
touching the rest of this architecture.

## 5. Caching strategy

- **Static assets** (`_next/static/*`, fonts, `public/*`, hashed filenames):
  immutable, far-future `Cache-Control` (`public, max-age=31536000, immutable`),
  served by Workers Assets straight from the edge.
- **HTML/RSC output** for SSG and ISR routes: held in the incremental cache
  (KV primary, R2 overflow — §1), fronted by Cloudflare's own edge CDN cache so
  repeat requests for a warm route don't invoke the Worker at all.
- **Revalidation model: on-demand first, time-based as a safety net.** Since
  content changes are editor-driven and infrequent (not high-frequency data),
  most routes should carry a generous fallback `revalidate` (e.g. 1 hour) but
  rely on **tag/path-based on-demand revalidation** triggered by publish events
  for near-immediate freshness, rather than short polling intervals.
- **Purge/invalidation on Sanity publish:** a Sanity webhook (configured per
  project, targeting `/api/revalidate`) fires on publish/unpublish/delete,
  verified by a shared secret, and maps the changed document type/slug to the
  relevant cache tag(s) (e.g. `service:${slug}`, `nav`, `sitemap`) before calling
  `revalidateTag`/`revalidatePath`. This repopulates the KV/R2 incremental cache
  on the next request — no manual Cloudflare purge needed in normal operation.
  A manual "Purge Everything" in the Cloudflare dashboard remains the documented
  emergency fallback (e.g. after a bad deploy changes cached data shapes).
- Sitemap and `robots.txt` follow the same on-demand model so newly published
  routes appear promptly rather than waiting on a fixed interval.

## 6. Sanity integration in deploy

- **Dataset:** a single `production` dataset used by both preview and
  production app deployments. A 2-person editorial team with no described
  separate staging-content workflow doesn't benefit from dataset-splitting —
  it would only fragment content and add sync overhead. Draft content stays
  invisible to the public regardless of which deployment serves it, because
  visibility is gated by Draft Mode + a scoped token, not by dataset choice.
  Confirm the exact dataset name at CMS-schema planning time; this plan assumes
  the Sanity-conventional `production`.
- **CDN vs. live:** public/anonymous reads use `useCdn: true` (Sanity's global
  CDN, ~60s max staleness, cheap) for everyday visitor traffic. Editor preview
  reads use `useCdn: false` with a read-only viewer token bound to Draft Mode,
  always fresh, never reachable by public traffic. The Presentation tool layers
  click-to-edit live visual editing on top of this when used from within
  Studio.
- **Studio at `/studio`:** embedded in the same Next.js app and deployed as
  part of the same Worker — one repo, one deploy, matching the "maintainable
  for a two-person team" principle, rather than standing up a second
  application/deploy target just for the Studio. Access control is primarily
  Sanity's own project-member login (only the two invited admin/editor accounts
  can authenticate into Studio at all); additionally, exclude `/studio` from
  indexing (`noindex` + `robots.txt` disallow) and optionally place it behind
  **Cloudflare Access** (Zero Trust — free for small teams, comfortably covers
  two users) as defense-in-depth, though not required for correctness.
- **Preview/Draft Mode wiring:** the Presentation tool's preview link calls a
  `/api/draft-mode/enable` Route Handler with a shared secret and target path,
  sets the Next.js draft cookie, and redirects into the page, which then reads
  the draft perspective. `/api/draft-mode/disable` exits preview. Both routes
  are ordinary Next.js Route Handlers and run inside the Worker like any other
  route — no special Cloudflare handling needed.
- **Publish webhook → revalidation:** one webhook per environment that needs
  fresh content (production always; a persistent staging environment if/when
  added) pointing at that environment's `/api/revalidate`. See §5 for the
  revalidation mechanics.

## 7. Secrets and environment variables at deploy time

Full variable inventory and per-variable ownership live in
`design/environment.md`; this section covers only how values reach the Worker.

- No secrets in the repository. `.env*` files stay gitignored; only
  `.env.example` with placeholder keys is committed.
- **Production:** secrets (Sanity tokens, Formspree endpoint if sensitive,
  Turnstile secret key, webhook shared secret) are set with
  `wrangler secret put <NAME>` or via the Cloudflare dashboard (Worker →
  Settings → Variables), encrypted at rest and never present in
  `wrangler.jsonc`. Non-sensitive config that's safe to expose (public site URL,
  Sanity project ID/dataset — already visible in any browser bundle) can live
  as plain `vars`.
- **Preview:** needs its own values — a Sanity token scoped to preview/read
  only, Turnstile sandbox/test keys, and (if available) a Formspree test form —
  held separately from production secrets. This is supplied via GitHub
  Environments (`production`, `preview`), each with its own secret set, and
  injected at deploy time by the Actions workflow (`wrangler versions upload`
  for preview, `wrangler deploy`/`versions deploy` for production). This is the
  concrete mechanism behind the CI recommendation in §3 — Workers Builds cannot
  do this split.
- **Rotation:** rotating any secret is a `wrangler secret put` (or a GitHub
  Environment secret update + next pipeline run) — never a code change.

## 8. Observability

| Concern | Tool | Notes |
|---|---|---|
| Traffic analytics | Cloudflare Web Analytics (cookieless) | Already in stack; no consent banner required (no cookies/local storage), but still disclosed in the privacy policy. |
| Server/runtime logs | Workers Logs / Observability dashboard | Requests, errors, CPU time, subrequests; `wrangler tail` for live debugging during a rollout. Free tier is sufficient at this site's expected volume. |
| Error tracking | Optional — e.g. a free-tier Sentry project for uncaught Route Handler/Server Component errors | Not required for MVP under the free-first constraint; add if error volume after launch warrants it. |
| Uptime | Free external monitor (e.g. UptimeRobot free tier, or a scheduled GitHub Actions ping) hitting `/` periodically | Cloudflare Health Checks are a paid-plan feature; a Worker returning 5xx doesn't self-report otherwise. |
| Build/deploy status | GitHub Actions job status via PR checks | Optional Slack/email notification step on failure; keeps deploy visibility inside the tool the team already watches. |
| Search health | Google Search Console | Per brief §21; not a deploy-time concern but confirm the property is verified against the canonical root domain once DNS is live. |

## 9. Rollback strategy

- **Workers versioning:** every deploy creates an immutable Version.
  `wrangler rollback` (or Cloudflare dashboard → Deployments → Rollback)
  repoints 100% of traffic to a previous Version in seconds — no rebuild, no
  redeploy.
- **Constraint to plan around:** a rollback is unsafe if bound resources (KV/R2
  names, expected env var shape) changed incompatibly between the target
  Version and the current one. Avoid destructive resource renames without a
  migration note in the PR that changes them.
- **Gradual rollout (optional):** for a higher-risk release, Cloudflare supports
  percentage-based gradual deployments (e.g. 10% → 50% → 100%) instead of an
  instant cutover, watched via Workers Logs/Analytics between steps. Not
  required for a marketing site at this scale, but available if a release ever
  warrants caution (e.g. the Growth Plan Builder logic).
- **Content rollback:** independent of code. Sanity's built-in document History
  lets an editor revert any document to a prior revision (or restore a deleted
  one) without touching the deploy pipeline; the normal publish → webhook →
  revalidate path (§5/§6) then reflects the reverted content automatically.
- **Combined incident:** a bad release paired with bad content is two
  independent, decoupled fixes — `wrangler rollback` for code, Sanity History
  revert for content — so neither has to wait on the other.

## 10. Deploy readiness checklist and first-deploy runbook

### Readiness checklist

- [ ] Cloudflare zone for `infiniteweblinks.com`, nameservers delegated
- [ ] Cloudflare API token scoped to Workers Scripts, Workers KV, Workers R2,
      and Zone edit, stored as a GitHub secret
- [ ] KV namespace created and bound (`NEXT_CACHE_WORKERS_KV`)
- [ ] R2 bucket created and bound (`NEXT_INC_CACHE_R2_BUCKET`)
- [ ] Worker name reserved; Custom Domain `infiniteweblinks.com` attached
- [ ] `www` → root 301 Redirect Rule created at the zone level
- [ ] Sanity project created; `production` dataset; CORS origins added for the
      Worker's domain(s) plus `localhost` for local dev
- [ ] Sanity webhook configured, pointing at `/api/revalidate`, shared secret set
- [ ] Formspree form created; Turnstile site + secret keys generated (prod and,
      if available, sandbox)
- [ ] All secrets populated in GitHub Environments (`production`, `preview`)
      per `design/environment.md`
- [ ] GitHub Actions workflow present and green on a throwaway PR (lint,
      typecheck, unit tests, Playwright, build, preview deploy)
- [ ] Lighthouse CI and axe-core thresholds defined and passing
- [ ] Security headers configured (cross-ref brief §22 / security review)
- [ ] Draft Mode + Presentation preview verified end-to-end on a preview URL
- [ ] Rollback rehearsed once on preview (deploy two versions, roll back,
      confirm traffic switch)

### First-deploy runbook (ordered, high level)

1. Provision the Cloudflare zone and delegate DNS for `infiniteweblinks.com`.
2. Create a scoped Cloudflare API token; store it as GitHub repo/Environment
   secrets.
3. Create the Sanity project and `production` dataset; record project ID and
   dataset name.
4. Create the Formspree form and Turnstile site; record the endpoint and keys.
5. Populate GitHub Environments `production` and `preview` with their
   respective secret sets (full list in `design/environment.md`).
6. Scaffold `wrangler.jsonc`: Worker name, KV namespace, R2 bucket, Assets
   directory, `nodejs_compat` flag, routes/custom domain.
7. Add the GitHub Actions workflow: `ci` job on all PRs; `preview-deploy` job
   (`opennextjs-cloudflare build` + `wrangler versions upload`) posting the
   preview URL; `deploy` job on merge to `main` (`wrangler versions deploy` or
   `wrangler deploy`), gated on `ci` passing.
8. Open a first scaffold PR to confirm the preview pipeline produces a working
   preview URL end-to-end.
9. Configure the Sanity webhook to the relevant environment's
   `/api/revalidate`; verify a test publish triggers revalidation.
10. Attach `infiniteweblinks.com` as the Worker's Custom Domain; add the `www`
    redirect rule; verify TLS (Full strict) resolves cleanly.
11. Enable Cloudflare Web Analytics and Workers Logs/Observability.
12. Run the full QA suite (Playwright journeys, Lighthouse CI, axe-core scans)
    against the production Worker before advertising the domain publicly.
13. Go live; watch Workers Logs/Analytics for the first hours; keep the prior
    Version available for an instant rollback.
14. Record the deploy in the session handoff notes per the constitution's
    Definition of Done (brief §26 / constitution Principle XIV).
