# Environment Variables & Secrets Inventory

Planning artifact only. This document lists variable **names and purposes** for the Infinite
Weblinks stack (Next.js 16.2.10 on Cloudflare Workers via `@opennextjs/cloudflare` 1.20.1,
`wrangler` 4.110.0, `sanity`/`next-sanity` 6.4.0/13.1.1, Formspree, Cloudflare Turnstile via
`@marsidev/react-turnstile` 1.5.3, Cloudflare Web Analytics). It does **not** contain, and must
never come to contain, a real secret value.

## 1. Governing principle

- **No real secret value is ever written here, in the repository, in commit messages, in CI logs,
  or in any planning document.** This file records *what exists and where it lives*, not the
  value itself.
- Secrets live in exactly two places: **Cloudflare's secret storage** for the deployed Worker
  (`wrangler secret put`, or the Cloudflare dashboard → Worker → Settings → Variables and
  Secrets), and **GitHub Actions encrypted secrets** for the CI/CD pipeline. Nowhere else.
- A committed **`.env.example`** file (see §7) carries variable *names* with placeholder text
  only (`""`, `changeme`, `your-token-here`). Every developer copies it to a git-ignored
  `.env.local` and fills in their own working values; `.env.local`, `.env`, and `.dev.vars` are
  all listed in `.gitignore` and must never be committed.
- Any variable prefixed `NEXT_PUBLIC_` is **not confidential by design** — it is inlined into the
  client JavaScript bundle at build time and is readable by anyone who views page source. Treat
  the `NEXT_PUBLIC_` prefix as a hard boundary: a value that must stay confidential must never
  carry it.
- Rotation: if a token in this table is ever exposed (committed by accident, leaked in a log),
  rotate it at the provider (Sanity, Cloudflare, Formspree) and update the stored secret — do not
  just remove it from git history and consider the job done.

## 2. Master variable table

| Variable name | Purpose | Scope | Required at | Environment | Where stored | Notes |
|---|---|---|---|---|---|---|
| `NEXT_PUBLIC_SANITY_PROJECT_ID` | Identifies the Sanity project the app reads/writes | Public, build-time | Build + runtime | All three, same value | `.env.local` (dev); CI build env var; Worker build env var | Not secret — visible in any Sanity CDN request URL anyway |
| `NEXT_PUBLIC_SANITY_DATASET` | Which dataset (`production`, optionally `development`) to query | Public, build-time | Build + runtime | All three — recommend single `production` dataset for a free-tier, two-admin team; see §5 | Same as above | Free-tier Sanity allows extra datasets if the team later wants a separate `staging` dataset |
| `NEXT_PUBLIC_SANITY_API_VERSION` | Pins the Sanity API version (date string, e.g. `2025-06-01`) to avoid silent API drift | Public, build-time | Build + runtime | All three, same value | Same as above | Set once at implementation kickoff; bump deliberately, never "latest" |
| `SANITY_API_READ_TOKEN` | Server-side read token for fetching **draft/unpublished** content (Presentation tool, preview routes) | Server secret | Runtime only | All three, distinct token per environment recommended | Cloudflare Worker secret (`wrangler secret put`); `.env.local` for local `next dev` | Scope to **Viewer** role, read-only; never the write/admin token |
| `SANITY_REVALIDATE_SECRET` | Shared secret Sanity's outgoing webhook must present so the on-publish revalidation route trusts the call | Server secret | Runtime only | All three, distinct value per environment recommended | Cloudflare Worker secret; mirrored in Sanity's webhook config (not in this repo) | Reject any revalidation request missing/mismatching this |
| `SANITY_PREVIEW_SECRET` | Authorizes entering Next.js Draft Mode from a Sanity Presentation preview link | Server secret | Runtime only | All three, distinct value per environment recommended | Cloudflare Worker secret | Checked by the `/api/draft-mode/enable` (or equivalent) route handler before setting the draft cookie |
| `SANITY_STUDIO_PROJECT_ID` / `SANITY_STUDIO_DATASET` | Project ID/dataset for the **separately-deployed** Studio (the `studio/` workspace, built and published with `sanity deploy` to a `*.sanity.studio` URL) | Public (Studio build-time) | Studio build/deploy | Studio deploy (values equal the site's `NEXT_PUBLIC_SANITY_*`) | `studio/.env` (git-ignored) and/or `studio/sanity.config.ts` | Studio is **not** embedded in the Next.js app (owner decision); it has its own config and deploy. The hosted Studio origin (`*.sanity.studio`) plus PR preview URLs must be added to the Sanity project's CORS allowed origins. |
| `NEXT_PUBLIC_FORMSPREE_GROWTH_PLAN_ID` | Formspree form ID/endpoint for the Growth Plan Builder submission | Public, build-time | Build + runtime | Recommend a separate **test form** for dev/preview vs the live prod form (see §5) | `.env.local`; CI build env var; Worker build env var | Semi-public by nature — a Formspree form endpoint can be seen in any submitted network request; protection is Turnstile + Formspree's own spam filtering, not secrecy of this ID |
| `NEXT_PUBLIC_FORMSPREE_CONTACT_ID` | Formspree form ID/endpoint for the general contact form | Public, build-time | Build + runtime | Same as above | Same as above | Same as above |
| `NEXT_PUBLIC_TURNSTILE_SITE_KEY` | Cloudflare Turnstile widget site key rendered in the browser | Public, build-time | Build + runtime | All three, distinct per environment (see §5) | Same as above | Public by design — this is the key embedded in the HTML widget |
| `TURNSTILE_SECRET_KEY` | Server-side secret used to verify a Turnstile token against Cloudflare's `siteverify` endpoint before accepting a form submission | Server secret | Runtime only | All three, distinct per environment | Cloudflare Worker secret | Never expose in client code or logs; verification call is server → Cloudflare only |
| `CLOUDFLARE_ACCOUNT_ID` | Identifies the Cloudflare account for `wrangler deploy` / OpenNext build | CI/deploy-time only | Deploy-time only (CI) | Not deployed into the running app | GitHub Actions encrypted secret (or repository variable — account ID is not itself sensitive, but keep alongside the token for simplicity) | Never read by the running Worker at request time |
| `CLOUDFLARE_API_TOKEN` | Authenticates CI to push the build to Cloudflare Workers and manage R2/D1/secrets | CI/deploy-time secret | Deploy-time only (CI) | Not deployed into the running app | GitHub Actions encrypted secret | Scope least-privilege: Workers Scripts Edit, Workers R2 Storage Edit, D1 Edit, Workers deploy — not full account admin, no KV needed |
| `NEXT_PUBLIC_CLOUDFLARE_ANALYTICS_TOKEN` | Cloudflare Web Analytics beacon token, embedded in page HTML | Public, build-time | Build + runtime | All three; recommend prod-only injection so dev/preview traffic doesn't pollute analytics (see §5) | `.env.local`; CI build env var; Worker build env var | Inherently public — it is a client-side beacon token, visible in every page's `<script>` tag |
| `NEXT_PUBLIC_SITE_URL` | Canonical absolute origin used for metadata, canonical URLs, sitemap, Open Graph, and structured data | Public, build-time | Build + runtime | All three, value differs (see §5) | Same as above | Production value is exactly `https://infiniteweblinks.com` — no trailing slash, no `www` |

Cloudflare **bindings** (R2 for the incremental cache, D1 for the tag cache, the Workers Assets
binding) are deliberately **not** in this table — see §3.

## 3. Bindings vs environment variables

OpenNext's Cloudflare adapter distinguishes two different mechanisms, and they must not be
confused:

- **Environment variables** (the table above) are plain strings — configuration and secrets —
  read via `process.env.X` (Node-style, polyfilled by the adapter) at build time (`NEXT_PUBLIC_*`,
  inlined into the JS bundle by `next build`) or at request time (server-only vars, read from the
  Worker's runtime environment).
- **Bindings** are Cloudflare resource handles wired up in the `wrangler` config file
  (`wrangler.jsonc` or `wrangler.toml`), not `.env` files, and accessed via the Worker's `env`
  object (through OpenNext's `getCloudflareContext()`), not `process.env`. For this project:
  - **`NEXT_INC_CACHE_R2_BUCKET`** — an R2 bucket binding used by OpenNext as the **primary
    incremental cache** (SSG/ISR HTML/RSC output + Next.js `fetch` cache). *(Binding names per
    `design/deployment.md`; re-verify against current OpenNext docs at implementation start.)*
  - **`NEXT_TAG_CACHE_D1`** — a D1 database binding used as the **tag cache** so on-demand
    `revalidateTag`/`revalidatePath` invalidate exactly the right cache entries on publish.
  - **`ASSETS`** — the Workers Static Assets binding that serves the built Next.js static output.
  - **Workers KV is deliberately NOT used** as the primary incremental cache (owner decision).
- Practical consequence: creating or renaming the R2 bucket or D1 database is a `wrangler.jsonc`
  change plus a `wrangler r2 bucket create` / `wrangler d1 create` command — it is
  **infrastructure-as-config**, reviewed in pull requests like any other code, not a secret to
  rotate. Their IDs are not secret but are not meaningful outside the Cloudflare account, so they
  belong in `wrangler.jsonc`, not in this environment-variable inventory or in `.env.example`.

## 4. Public vs secret — classification summary

| Class | Rule | Examples |
|---|---|---|
| **Public / `NEXT_PUBLIC_*`** | Embedded in the client JS bundle at **build time**. Anyone can read it via view-source or devtools. Never put a secret here. | Sanity project ID/dataset/API version, Formspree form IDs, Turnstile *site* key, Cloudflare Analytics beacon token, site URL |
| **Server-only secret** | Never sent to the browser; read only inside Server Components, Route Handlers, or middleware running in the Worker. Must **not** carry the `NEXT_PUBLIC_` prefix. | Sanity read token, Sanity revalidate/preview secrets, Turnstile *secret* key |
| **CI/deploy-time secret** | Used only by the GitHub Actions runner to build and deploy; never present inside the deployed Worker's runtime environment. | Cloudflare account ID, Cloudflare API token |
| **Cloudflare binding (not an env var)** | Configured in `wrangler.jsonc`; accessed via the Worker `env` object, not `process.env`. | `NEXT_INC_CACHE_R2_BUCKET`, `NEXT_TAG_CACHE_D1`, `ASSETS` (no KV) |

The single rule that prevents the most damage: **if a value must stay confidential, it must never
be prefixed `NEXT_PUBLIC_`, and it must never be logged, printed, or committed — set it only via
`wrangler secret put` or the GitHub Actions secrets UI.**

## 5. Per-environment matrix

| Variable / group | Development (local `next dev`) | Preview (Cloudflare preview Worker, per PR/branch) | Production |
|---|---|---|---|
| `NEXT_PUBLIC_SANITY_PROJECT_ID` | Same project ID as prod (Sanity has no free "dev project" concept worth the overhead for a 2-admin team) | Same | Same |
| `NEXT_PUBLIC_SANITY_DATASET` | `production` (recommended default — see rationale below) | `production` | `production` |
| `SANITY_API_READ_TOKEN` | Developer's own Viewer-scoped token | Separate preview-environment Viewer token (recommended, so it can be revoked without touching prod) | Production Viewer token |
| `SANITY_REVALIDATE_SECRET` / `SANITY_PREVIEW_SECRET` | Local-only throwaway value | Preview-specific value | Production value |
| `NEXT_PUBLIC_FORMSPREE_GROWTH_PLAN_ID` / `..._CONTACT_ID` | **Test/sandbox Formspree form** (so local testing never reaches `support@infiniteweblinks.com`) | Same test form as dev, or a dedicated "preview" form the team checks occasionally | Live production form delivering to `support@infiniteweblinks.com` |
| `NEXT_PUBLIC_TURNSTILE_SITE_KEY` / `TURNSTILE_SECRET_KEY` | Cloudflare's published **testing key pair** (always-pass site key `1x00000000000000000000AA` / secret `1x0000000000000000000000000000AA` — publicly documented dummy keys, not project secrets) so local dev never needs a live Turnstile site | Recommend a real Turnstile widget scoped to the preview hostname (Turnstile supports multiple hostnames per site, or a second widget) | Live Turnstile widget scoped to `infiniteweblinks.com` |
| `NEXT_PUBLIC_CLOUDFLARE_ANALYTICS_TOKEN` | Omitted — analytics script not loaded in local dev | Omitted or a separate non-prod beacon, so preview traffic doesn't skew production analytics | Live beacon token |
| `NEXT_PUBLIC_SITE_URL` | `http://localhost:3000` | Cloudflare preview Worker URL (e.g. `https://<branch>.infinite-weblinks.workers.dev` or a per-PR preview hostname, finalized in `design/deployment.md`) | `https://infiniteweblinks.com` |
| `CLOUDFLARE_ACCOUNT_ID` / `CLOUDFLARE_API_TOKEN` | Not needed for `next dev`; only needed locally if a developer runs `wrangler dev`/`wrangler deploy` directly, via `.dev.vars` | GitHub Actions secret, scoped to the preview deploy job | GitHub Actions secret, scoped to the production deploy job (ideally a distinct token or the same token with a GitHub Environment protection rule requiring approval) |

Rationale for a single shared `production` dataset across dev/preview/prod: Sanity's free plan
comfortably supports this project's content volume, and draft/unpublished content is already
separated from published content via Sanity's document draft/publish state and the
`SANITY_API_READ_TOKEN`-gated preview perspective — a second dataset would mostly duplicate that
separation while adding sync overhead for a two-admin team. Revisit only if the team later wants
content-level environment isolation (e.g. bulk content experiments that should never leak to
prod).

## 6. Handling in CI and in Cloudflare

- **Local development**: two separate files, both git-ignored.
  - `.env.local` — read by `next dev` (Node.js process) for all `NEXT_PUBLIC_*` and server-only
    vars used by the Next.js app itself.
  - `.dev.vars` — read by `wrangler dev`/`wrangler pages dev` (the Workers runtime emulator) for
    anything a developer needs to test through the actual Workers runtime, including bindings
    behavior. Most day-to-day work only needs `.env.local`; `.dev.vars` matters when testing
    OpenNext/Workers-specific behavior (R2 incremental cache, D1 tag cache, secrets access through `env`).
- **CI (GitHub Actions)**: `NEXT_PUBLIC_*` values must be present as CI environment variables
  **before the build step**, because Next.js inlines them into the compiled bundle — setting them
  only as a post-deploy Cloudflare dashboard variable does not work, they must exist when
  `next build` / `opennextjs-cloudflare build` runs. Server-only secrets are not needed at build
  time; they are pushed to the Worker separately via `wrangler secret put` (or already present
  from a prior deploy) and read at request time. Full pipeline detail — job structure, environment
  gating, preview-vs-production triggers — is specified in `design/deployment.md`.
- **Cloudflare**: server-only secrets and CI credentials are set via `wrangler secret put <NAME>`
  (or the dashboard's Worker → Settings → Variables and Secrets → "Secret" type, which encrypts at
  rest and never displays the value again). Public `NEXT_PUBLIC_*` values, since they are already
  visible in the shipped bundle, may be set as plain (non-secret) Worker environment variables if
  the deploy tooling needs them outside the build step, but the source of truth for their build-time
  value is the CI environment, not the dashboard.
- **Security header, CSP, and consent-management handling** (which scripts may load and when) is
  covered in `design/security-privacy.md` — this document only inventories the variable *names*
  that configure those scripts, not the loading policy itself.
- Access to Cloudflare dashboard secret management and GitHub Actions secrets should follow
  least-privilege: only the two admin users need write access; least-privilege CMS/API tokens
  scoped per §2 and §4.

## 7. `.env.example` proposal

Committed to the repository root. Every value below is a placeholder — copy this file to
`.env.local` and replace each placeholder with a real (non-committed) value.

```bash
# --- Sanity CMS ---
NEXT_PUBLIC_SANITY_PROJECT_ID=your-sanity-project-id
NEXT_PUBLIC_SANITY_DATASET=production
NEXT_PUBLIC_SANITY_API_VERSION=2025-06-01
SANITY_API_READ_TOKEN=changeme-viewer-scoped-token
SANITY_REVALIDATE_SECRET=changeme-webhook-shared-secret
SANITY_PREVIEW_SECRET=changeme-draft-mode-secret
# Studio is deployed SEPARATELY (studio/ workspace → `sanity deploy` to *.sanity.studio),
# with its own git-ignored studio/.env (values equal the NEXT_PUBLIC_SANITY_* above):
# SANITY_STUDIO_PROJECT_ID=your-sanity-project-id
# SANITY_STUDIO_DATASET=production

# --- Formspree ---
NEXT_PUBLIC_FORMSPREE_GROWTH_PLAN_ID=your-growth-plan-form-id
NEXT_PUBLIC_FORMSPREE_CONTACT_ID=your-contact-form-id

# --- Cloudflare Turnstile ---
# Local dev may use Cloudflare's published always-pass testing keys instead of a live widget.
NEXT_PUBLIC_TURNSTILE_SITE_KEY=changeme-turnstile-site-key
TURNSTILE_SECRET_KEY=changeme-turnstile-secret-key

# --- Cloudflare Web Analytics ---
NEXT_PUBLIC_CLOUDFLARE_ANALYTICS_TOKEN=changeme-analytics-beacon-token

# --- Site ---
NEXT_PUBLIC_SITE_URL=http://localhost:3000

# --- Cloudflare deploy (CI only — not read by the running app; used by wrangler/CI, not Next.js) ---
# CLOUDFLARE_ACCOUNT_ID=changeme-account-id
# CLOUDFLARE_API_TOKEN=changeme-deploy-token
```

`CLOUDFLARE_ACCOUNT_ID` and `CLOUDFLARE_API_TOKEN` are commented out in `.env.example` because
they belong to the CI/deploy pipeline (GitHub Actions secrets), not to the Next.js application's
own runtime configuration — including them uncommented would wrongly suggest the app reads them
at request time.
