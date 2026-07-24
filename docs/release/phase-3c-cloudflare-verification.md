# Phase 3C — Cloudflare External Verification (read-only)

Phase 3C §F requires authenticated **read-only** verification of the account-side Cloudflare
resources and secrets — **only when credentials are available**, and with **no mutation**.

## Credential check (this environment)

| Signal                                                                                                                               | Result                           |
| ------------------------------------------------------------------------------------------------------------------------------------ | -------------------------------- |
| `CLOUDFLARE_API_TOKEN` / `CLOUDFLARE_ACCOUNT_ID` / `CF_API_TOKEN` / `CLOUDFLARE_API_KEY` / `CLOUDFLARE_EMAIL` / `WRANGLER_API_TOKEN` | **all unset**                    |
| `wrangler whoami`                                                                                                                    | **"You are not authenticated."** |

**Outcome: no Cloudflare credentials are available in this environment, so external verification
was NOT performed.** No account-side resource, secret, or DNS record has been confirmed. Per the
Phase 3C rules, no Cloudflare verification is fabricated — every item below stays
**external-verification-required** and is a **hard go-live blocker** an operator must clear.

What _was_ verified is the **local configuration only** (see `npm run cf:verify -- --bundle`:
**10 verified locally, 4 external, 0 blockers**) — binding names, OpenNext↔wrangler consistency,
no-KV invariant, and a non-mutating `wrangler deploy --dry-run` bundle. That proves the repo is
deploy-shaped; it does **not** prove the account resources exist.

## Operator checklist (run when signed in to the target Cloudflare account)

All commands are **read-only** unless explicitly marked. Record each result; **never paste secret
values** into the repo or logs.

| #   | Item                                       | Read-only command                                                       | Expected                                                                                                             | Status                                       |
| --- | ------------------------------------------ | ----------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------- | -------------------------------------------- |
| 1   | R2 bucket `iw-inc-cache` exists            | `npx wrangler r2 bucket list`                                           | includes `iw-inc-cache`                                                                                              | **NOT VERIFIED** (no creds)                  |
| 2   | D1 database `iw-tag-cache` + **real id**   | `npx wrangler d1 list`                                                  | includes `iw-tag-cache`; copy its real id into `wrangler.jsonc` (shipped id `29042ec8-…` is a **local placeholder**) | **NOT VERIFIED** — hard blocker              |
| 3   | Rate-limit rule `namespace_id 1001` unique | account Rate Limiting rules                                             | `1001` does not collide                                                                                              | **NOT VERIFIED**                             |
| 4   | `ASSETS` binding                           | resolved from `.open-next/assets` at build                              | present in bundle (local)                                                                                            | verified-locally                             |
| 5   | Worker secrets set                         | `npx wrangler secret list` (names only)                                 | `TURNSTILE_SECRET_KEY`, `FORMSPREE_CONTACT_ID`, `FORMSPREE_GROWTH_PLAN_ID` present                                   | **NOT VERIFIED** — hard blocker              |
| 6   | Runtime vars set                           | Worker settings                                                         | `APP_ENV=production`, `NEXT_PUBLIC_SITE_URL`, `NEXT_PUBLIC_TURNSTILE_SITE_KEY` set                                   | **NOT VERIFIED** — hard blocker              |
| 7   | Turnstile hostnames                        | Turnstile widget config + `TURNSTILE_ALLOWED_HOSTNAMES` (optional)      | match the production origin                                                                                          | **NOT VERIFIED**                             |
| 8   | `FORMS_ALLOW_INSECURE_BYPASS` **NOT** set  | Worker settings                                                         | absent (fail-closed)                                                                                                 | **NOT VERIFIED**                             |
| 9   | Formspree ids are server-only              | already enforced in code (`config.server.ts`, non-`NEXT_PUBLIC_` names) | not in client bundle                                                                                                 | verified-locally (`config-boundary.test.ts`) |
| 10  | Domain / DNS points to the Worker          | `dig`/registrar + Workers route/custom domain                           | resolves to the Worker                                                                                               | **NOT VERIFIED**                             |

## Rule

Any change to the above (creating the R2 bucket, setting the real D1 id, putting secrets, binding the
domain) is a **mutation** and requires **explicit owner authorization** — it is out of scope for this
read-only step. See `docs/operations/cloudflare-production-readiness.md` §3 for the full runbook.
