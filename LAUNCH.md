# Launch Readiness — Infinite Weblinks

Status as of the `polish/launch-readiness` branch. This document separates **what is already
done in code (and verified)** from **what still needs owner credentials or external setup**, and
gives an ordered checklist to take the site live on a custom domain.

Nothing here attaches a domain, changes DNS, buys a service, or stores a secret in the repo — all
of that is deliberately left to the owner and listed below.

---

## 1. What is already done in code (verified)

| Area | State |
|---|---|
| Full site build (homepage, hubs, listings, detail templates, legal, 404) | Complete, all routes render |
| Growth Plan Builder + Contact form (validation, rate-limit, Turnstile, Formspree) | Complete; degrade safely until keys are set |
| SEO: per-route metadata, canonicals, `robots.ts`, `sitemap.ts`, `manifest.ts`, JSON-LD | Complete; homepage self-canonical added this branch |
| Open Graph image (1200×630, build-time static PNG, locked brand copy) | Added this branch; every route inherits it |
| Cloudflare Web Analytics beacon (env-gated) | Wired this branch; off until token set |
| Google Search Console verification meta (env-gated) | Wired this branch; off until token set |
| Cloudflare-native form rate-limit binding (`FORM_RATE_LIMITER`, 5/60s) | Declared this branch; validated via `wrangler deploy --dry-run` |
| Security headers + CSP (Sanity, Formspree, Turnstile, CF Analytics allow-listed) | Complete |
| Sanity read adapter with seed fallback + content-status gating | Complete; unverified proof routes 404 by design |
| Sanity Studio (separate hosted deploy under `studio/`) | Source + schema complete; not yet deployed (owner action) |

**Verification run on this branch:** `lint` (0), `typecheck` (0), `test` (90 unit pass),
`build` (webpack, 145 routes), `cf:build` (OpenNext worker), `test:e2e` (89 pass — layout,
routes, a11y), plus a local workerd smoke test (real routes 200, hidden proof + unknown 404, OG
image serves `image/png` 1200×630).

---

## 2. Environment variables — complete inventory

Copy `.env.example` → `.env.local` (git-ignored) for local dev. In production these are set on the
Cloudflare Worker (public `NEXT_PUBLIC_*` at **build time**; server secrets via
`wrangler secret put`). The Studio deploy reads its own `studio/.env`.

| Variable | Scope | Needed for | Set by |
|---|---|---|---|
| `NEXT_PUBLIC_SITE_URL` | public, build | canonicals, sitemap, OG URLs | owner (final domain) |
| `NEXT_PUBLIC_SANITY_PROJECT_ID` | public, build | reading live CMS content | owner (Sanity) |
| `NEXT_PUBLIC_SANITY_DATASET` | public, build | reading live CMS content | owner (Sanity) |
| `NEXT_PUBLIC_SANITY_API_VERSION` | public, build | Sanity API pinning | default provided |
| `NEXT_PUBLIC_FORMSPREE_GROWTH_PLAN_ID` | public, build | Growth Plan form delivery | owner (Formspree) |
| `NEXT_PUBLIC_FORMSPREE_CONTACT_ID` | public, build | Contact form delivery | owner (Formspree) |
| `NEXT_PUBLIC_TURNSTILE_SITE_KEY` | public, build | Turnstile widget | owner (Cloudflare) |
| `TURNSTILE_SECRET_KEY` | **secret** | Turnstile server verification | owner (`wrangler secret put`) |
| `NEXT_PUBLIC_CLOUDFLARE_ANALYTICS_TOKEN` | public, build | Web Analytics beacon | owner (Cloudflare) |
| `NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION` | public, build | Search Console ownership | owner (Google) |
| `CLOUDFLARE_ACCOUNT_ID` / `CLOUDFLARE_API_TOKEN` | CI secret | automated deploy | owner (CI secrets) |
| `SANITY_STUDIO_PROJECT_ID` / `SANITY_STUDIO_DATASET` | Studio env | Studio deploy | owner (`studio/.env`) |

Both form and Turnstile paths **fail safe**: with keys unset, submissions are validated and
rate-limited but Turnstile verification is skipped and Formspree delivery is a no-op (documented in
`src/lib/forms/turnstile.ts` and `formspree.ts`). The moment real keys are set, verification and
delivery activate — no code change.

---

## 3. Owner actions by integration

### A. Cloudflare (deploy target) — **required for launch**
1. Create/confirm the Cloudflare account and Workers project `infinite-weblinks`.
2. Provision the bindings referenced in `wrangler.jsonc`:
   - R2 bucket `iw-inc-cache` (incremental cache).
   - D1 database `iw-tag-cache` — **replace the placeholder `database_id`** with the real id.
   - Rate-limit rule `FORM_RATE_LIMITER` (already declared; provisioned automatically on deploy).
3. Set the server secret: `wrangler secret put TURNSTILE_SECRET_KEY`.
4. Deploy: `npm run cf:deploy` (or CI with `CLOUDFLARE_ACCOUNT_ID` + `CLOUDFLARE_API_TOKEN`).

### B. Sanity (CMS project + Studio) — **required for live content**
1. Create a Sanity project at <https://www.sanity.io/manage> with two editor/admin seats.
2. Set `NEXT_PUBLIC_SANITY_PROJECT_ID` / `NEXT_PUBLIC_SANITY_DATASET` (site) and the matching
   `SANITY_STUDIO_*` in `studio/.env`.
3. Deploy the Studio: `cd studio && npm install && npm run deploy` (pick the hosted subdomain once).
4. Add CORS origins in the Sanity project (site origin, Studio origin, localhost) — see
   `studio/README.md`.
5. Populate content and mark it **Verified / Ready to publish** (see G).

Until a project is configured the site serves its **seed content** — fully functional, just not
editor-managed.

### C. Formspree — **required for form delivery**
1. Create two Formspree forms (Growth Plan, Contact).
2. Set `NEXT_PUBLIC_FORMSPREE_GROWTH_PLAN_ID` and `NEXT_PUBLIC_FORMSPREE_CONTACT_ID`.

### D. Cloudflare Turnstile — **required for spam protection**
1. Create a Turnstile widget for the production domain.
2. Set `NEXT_PUBLIC_TURNSTILE_SITE_KEY` (build) and `TURNSTILE_SECRET_KEY` (secret).

### E. Cloudflare Web Analytics — optional, recommended
1. Enable Web Analytics for the site, copy the beacon token.
2. Set `NEXT_PUBLIC_CLOUDFLARE_ANALYTICS_TOKEN`. (Host already CSP-allowed; beacon auto-renders.)

### F. Google Search Console — recommended
1. Add the property, choose the HTML-tag verification method, copy the token.
2. Set `NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION`, redeploy, verify, then submit `/sitemap.xml`.

### G. Verified content — **required before proof routes go live**
`/case-studies`, `/examples` (and their detail pages) intentionally return **404 until at least one
referenced document is Verified** in Sanity — no empty frames, no fake proof. Case-study and
testimonial homepage sections stay hidden on the same rule. To turn them on, add real, approved
content and set its `contentStatus` to Verified / Ready to publish.

### H. Legal review — **required before public launch**
`/privacy`, `/cookies`, `/terms`, `/accessibility` carry a professional-review note. Have them
reviewed by a qualified person and update the copy before launch.

### I. Brand / OG asset — optional
A build-time OG image ships now (locked slogan + palette). Replace `src/app/opengraph-image.tsx`
with a designed asset only if desired — no other code change needed.

### J. Custom domain + DNS — **final launch step (owner only)**
Attach the production domain to the Worker and point DNS. Then set `NEXT_PUBLIC_SITE_URL` to the
final origin, redeploy, and add the domain to Sanity CORS and the Turnstile widget.

---

## 4. Prioritised owner checklist

1. **Cloudflare account + bindings** (R2, D1 real id, deploy) — A.
2. **Turnstile keys** (site key + secret) — D.
3. **Formspree form ids** — C.
4. **Sanity project + Studio deploy + CORS** — B.
5. **Verify real content** to unhide proof routes/sections — G.
6. **Legal review** of the four legal pages — H.
7. **Web Analytics + Search Console tokens** — E, F.
8. **Custom domain + DNS**, then set `NEXT_PUBLIC_SITE_URL` and redeploy — J.

Items 1–3 are the minimum to ship a functional, spam-protected site on the seed content. Items 4–8
bring live CMS content, credibility (proof), legal sign-off, analytics, and the final domain.

---

## 5. Deploy runbook (once credentials exist)

```bash
# one-time: provision R2 + D1 in Cloudflare, put the real D1 id in wrangler.jsonc
wrangler secret put TURNSTILE_SECRET_KEY        # server secret

# each release (public NEXT_PUBLIC_* must be present at build time):
npm run cf:deploy                               # cf:build + wrangler deploy

# Studio (separate):
cd studio && npm run deploy
```

CI already runs lint → typecheck → unit → build → `cf:build`, plus an e2e job. Wire
`CLOUDFLARE_ACCOUNT_ID` + `CLOUDFLARE_API_TOKEN` as CI secrets to automate the deploy step.
