# Security and Privacy Plan — Infinite Weblinks

**Feature**: 001-infinite-weblinks-website
**Status**: Planning (no code)
**Related**: `design/environment.md` (secret/public variable inventory), Constitution Principle IX (Security Is Part of the Build), Locked Brief §4, §14, §22

This plan defines how the marketing site protects secrets, forms, headers, the CMS, dependencies, and visitor privacy. It is decision-focused and implementation-ready; it does not contain legal advice.

---

## 1. Secrets Management

**Rule**: no credential, API key, token, or dataset write-token is ever committed to Git. All secrets live in Cloudflare's secret storage for the Worker (`wrangler secret put`, or the Cloudflare dashboard equivalent), scoped per environment (preview vs production).

### 1.1 Where secrets live

| Location | Purpose | Contains secrets? |
|---|---|---|
| `.env.example` (committed) | Documents every variable name with a placeholder value | No — placeholders only, e.g. `sanity_project_id_here` |
| `.env.local` (gitignored, local dev only) | Local developer values | Yes — never committed |
| Cloudflare Workers secrets (`wrangler secret put`) | Production and preview runtime secrets | Yes |
| Cloudflare Pages/Workers dashboard environment variables | Public build-time values (non-secret) | No |
| GitHub Actions encrypted secrets | CI-time values needed for build/deploy/audit jobs | Yes |
| Sanity project settings (API tokens) | CMS write tokens, webhook secrets | Yes |

`.gitignore` MUST include `.env`, `.env.local`, `.env*.local`, and any `*.pem`/`*.key` files. A pre-commit or CI secret-scan step (see §5.2) is the backstop, not the primary control.

### 1.2 Secret vs public — cross-reference

The authoritative variable list lives in `design/environment.md`. This plan restates the security-relevant split so it is not duplicated by hand later. Any variable not classified there as "public/build-time" MUST be treated as secret by default.

**Secret (Worker/CI secret storage only, never in client bundle or repo):**
- Sanity API write/deploy token (used only in CI or server-side revalidation routes, never shipped to the browser)
- Sanity webhook signature secret (validates incoming revalidation webhooks)
- Formspree form endpoint ID if the project treats it as sensitive (see note below) — otherwise public
- Cloudflare Turnstile **secret key** (server-side verification only)
- Cloudflare API token used by CI/Wrangler for deploys
- Any future Sanity Presentation/Draft Mode preview secret token

**Public (safe to ship to the browser or commit as a placeholder-documented variable):**
- Sanity **project ID** and **dataset name** (public by Sanity's own design — read access is governed by dataset visibility, not by hiding the ID)
- Cloudflare Turnstile **site key** (designed to be public; it is rendered in the widget)
- Formspree **form endpoint URL** (public by design — Formspree's abuse protection, not URL secrecy, is the control; see §2.3)
- Cloudflare Web Analytics **beacon token** (public by design, cookieless, no PII)
- Canonical site URL, feature flags, non-sensitive config

**Note on Formspree endpoint**: Formspree endpoints are meant to be embedded in client-side HTML, so listing the form ID as "public" is correct and matches Formspree's own security model — spam control happens via Turnstile + Formspree's server-side checks (§2.3), not by hiding the URL.

### 1.3 `.env.example` conventions

- Every variable the app reads MUST have a corresponding entry in `.env.example` with a placeholder (`NEXT_PUBLIC_SANITY_PROJECT_ID=your_project_id`, `TURNSTILE_SECRET_KEY=changeme`), never a real value.
- `NEXT_PUBLIC_*` prefix is reserved strictly for values that are intentionally public (per Next.js convention, anything with this prefix is bundled into client JS). Secret values MUST NOT use this prefix.
- A short comment above each secret variable in `.env.example` states where the real value is stored (e.g. `# set via: wrangler secret put SANITY_API_TOKEN`).

---

## 2. Form Security (Growth Plan Builder + Contact)

**Threat model**: automated spam submissions, scraped-bot abuse, injection of malicious content into the email body/headers that the team reads, and enumeration/DoS of the form endpoint.

### 2.1 Server-side validation and sanitisation

- Every field the Growth Plan Builder and contact form collect (business type, current stage, main goal, existing setup, engagement preference, timeline, name, email, message) is validated server-side with a schema library (zod or equivalent) inside the Worker/Route Handler **before** the payload is forwarded to Formspree. Client-side validation is a UX convenience only — it MUST NOT be the only line of defence.
- Validation rules per field type:
  - Email: format-checked (RFC-compatible pattern) and length-capped.
  - Enum fields (business type, engagement range, timeline, etc.): validated against the fixed set of allowed values from the CMS-managed option list — any value outside the enum is rejected, not silently passed through.
  - Free-text fields (message, "existing setup" notes): length-capped (for example 2,000 characters), stripped of control characters, and HTML-escaped before it is ever rendered anywhere (including in the confirmation UI) to prevent stored/reflected XSS.
- **Email header injection**: reject any field value containing `\r`, `\n`, or the sequences `Content-Type:`/`Bcc:`/`To:` — these are classic header-injection payloads used to hijack a mail-relay form. This check runs server-side regardless of what the client sends.
- No form field is ever interpolated into a raw SQL, shell, or template-eval context — there is no database write path for form data (Formspree is the sink), so injection surface is limited to the email body/headers and to Sanity if a future feature stores submissions as CMS content (out of scope at launch).

### 2.2 Cloudflare Turnstile

- Turnstile widget renders client-side using the **public site key**.
- The Turnstile token is **verified server-side** (Worker route or Next.js Route Handler calling Cloudflare's `siteverify` endpoint with the **secret key**) before the submission is forwarded to Formspree. A form submitted without a valid, unexpired, single-use Turnstile token is rejected with a generic error — never forwarded.
- Turnstile failure and Formspree failure are handled as distinct, user-safe error states (see accessibility/error-copy work in the forms plan) without leaking internal details (no stack traces, no "Formspree returned 422" language) to the visitor.

### 2.3 Formspree spam controls

- Formspree's own reCAPTCHA/Turnstile integration and spam-filtering (Akismet-style heuristics) are enabled at the Formspree project level as a second layer behind the Worker-side Turnstile check.
- Formspree project settings restrict allowed submitting origins to `https://infiniteweblinks.com` (and the Cloudflare preview subdomain during QA) to reduce off-site abuse of the endpoint.

### 2.4 Honeypot field

- A hidden, non-labelled field (e.g. `company_website` or similar innocuous name, styled off-screen rather than `display:none` to avoid some bots' CSS-aware detection, and excluded from the accessibility tree via `aria-hidden` + `tabindex="-1"` + `autocomplete="off"`) is added to both forms. Any submission with this field populated is silently rejected (or accepted and dropped server-side) without informing the bot which check failed.

### 2.5 Rate limiting at the Worker edge

- The Worker route that proxies to Formspree applies a rate limit keyed on IP + form type (for example, Cloudflare's native Rate Limiting rules, or a small counter in a Durable Object / the D1 tag-cache database — **not** Workers KV, which this project does not use): a practical starting point is 5 submissions per IP per 10 minutes per form, tunable after real traffic data. Requests over the limit receive a generic 429-style response with a friendly retry message, not a technical error.
- This defends against both spam floods and accidental double-submits, and is cheap to implement given the Worker already sits in the request path (needed anyway for Turnstile verification and validation).

### 2.6 Delivery rules (locked)

- Submissions are delivered **only** to `support@infiniteweblinks.com` via Formspree.
- **No automatic visitor confirmation/auto-reply email at launch** (locked brief §4) — the on-screen success state is the only confirmation the visitor receives. This is a product decision, not a technical limitation; it can be revisited post-launch.
- The visible fallback email address (`support@infiniteweblinks.com`) is never removed from the page even when the form is present — it is a fallback contact method, not the primary CTA (locked brief §4).

### 2.7 Accessible error handling

- Validation and Turnstile/Formspree failures surface as accessible, inline error messages (associated via `aria-describedby`, announced via `aria-live="polite"` region) — this is a security *and* accessibility requirement: silent failures push users toward retrying blindly or abandoning, and inaccessible errors are a WCAG 2.2 AA gap.

---

## 3. HTTP Security Headers

Headers are set at the edge — either in the Cloudflare Worker's response (via `@opennextjs/cloudflare`'s middleware/response hook) or in `next.config` headers, whichever the implementation phase confirms is not stripped by the OpenNext adapter. Both are documented here so implementation picks the one that survives the Cloudflare Workers runtime; a smoke test during Milestone 2 (repository foundation) confirms which layer actually delivers the header in production.

### 3.1 Content-Security-Policy (CSP)

The site loads: Sanity's content/image CDN + content API (reads and Draft Mode preview), Formspree (form POST), Cloudflare Turnstile (script + iframe), Cloudflare Web Analytics (beacon script), and Google Fonts (Sora, Plus Jakarta Sans, JetBrains Mono) unless self-hosted. The Studio itself is **not** hosted here — it runs **separately at `*.sanity.studio`** (owner decision) — but that hosted Studio embeds the site's **preview** routes in an iframe (Sanity Presentation), so preview responses must permit framing by the Studio origin (see `frame-ancestors` below).

A representative starting policy (tightened during implementation once exact Sanity/Turnstile hostnames are confirmed):

```
default-src 'self';
script-src 'self' https://challenges.cloudflare.com https://static.cloudflareinsights.com;
style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
font-src 'self' https://fonts.gstatic.com;
img-src 'self' data: https://cdn.sanity.io;
connect-src 'self' https://*.sanity.io https://formspree.io https://challenges.cloudflare.com https://cloudflareinsights.com;
frame-src https://challenges.cloudflare.com;
frame-ancestors 'none';   /* public routes; preview/Draft-Mode responses relax to: frame-ancestors 'self' https://*.sanity.studio */
object-src 'none';
base-uri 'self';
form-action 'self' https://formspree.io;
upgrade-insecure-requests;
```

Notes:
- `'unsafe-inline'` on `style-src` is a pragmatic allowance for Google Fonts' generated `<link>`/CSS and for any inline critical CSS Next.js emits; if implementation adopts nonce-based or hashed styles instead, tighten this and drop `'unsafe-inline'`.
- `script-src` intentionally does **not** include `'unsafe-inline'` or `'unsafe-eval'` — GSAP, Motion, and app code all ship as bundled `<script>` files from `'self'`, so no inline script execution should be required. If a third-party snippet later needs inline execution, use a per-request nonce, not a blanket allowance.
- Self-hosting Google Fonts (downloading the woff2 files into the repo/build and serving from `'self'`) removes the `fonts.googleapis.com`/`fonts.gstatic.com` allowances entirely and is the stronger option from both a CSP and privacy (no third-party font request) standpoint — flag as an implementation-phase decision.
- **Studio is deployed separately** (hosted at `*.sanity.studio`, owner decision), so the site never serves the Studio shell and needs no Studio-specific `script-src`. But Sanity's **Presentation** tool embeds the site's **preview** routes inside the hosted Studio, so those preview/Draft-Mode responses relax `frame-ancestors` to `'self' https://*.sanity.studio` while all public, non-preview routes keep `frame-ancestors 'none'`. `connect-src` already covers Sanity via `https://*.sanity.io`.
- Consider `report-uri`/`report-to` pointing at a lightweight logging endpoint once the policy is stable, to catch violations without breaking the page (start in `Content-Security-Policy-Report-Only` during QA, promote to enforcing before launch).

### 3.2 Other headers

| Header | Value | Purpose |
|---|---|---|
| `Strict-Transport-Security` | `max-age=63072000; includeSubDomains; preload` | Forces HTTPS for two years, including `www` redirect target; safe once the canonical domain is fully HTTPS (it is, via Cloudflare) |
| `X-Content-Type-Options` | `nosniff` | Stops MIME-sniffing attacks on served assets |
| `Referrer-Policy` | `strict-origin-when-cross-origin` | Limits referrer leakage to third parties (Formspree, fonts) while keeping same-origin analytics useful |
| `X-Frame-Options` | `DENY` on public routes; **omitted on preview/Draft-Mode responses** (X-Frame-Options cannot allowlist an external origin, so CSP `frame-ancestors https://*.sanity.studio` is the control there) | Prevents clickjacking on public routes while still letting Sanity Presentation embed preview routes |
| `Permissions-Policy` | `camera=(), microphone=(), geolocation=(), payment=(), usb=()` (deny-by-default; no feature on this site needs any of these) | Reduces attack surface from embedded/third-party content |
| `X-XSS-Protection` | Omit or `0` | Deprecated header; modern CSP supersedes it, do not rely on it |

### 3.3 Where headers are set

- Primary: Worker response headers via the OpenNext Cloudflare adapter's middleware, so headers apply uniformly to every route (including API/Route Handlers), with the `frame-ancestors`/X-Frame-Options relaxation scoped to preview/Draft-Mode responses only, before any Next.js-level header config that might only apply to specific route types.
- Fallback/duplicate: `next.config.ts` `headers()` function as a second layer for local `next dev`/`next start` parity so headers are visible in local testing too. If both layers are present, the Worker layer is the source of truth for production; keep the two in sync manually and note the duplication in code comments to avoid drift.
- Preview deployments carry the **same** header set as production — no relaxed CSP "for testing," since that is exactly when a misconfiguration would go unnoticed.

---

## 4. CMS Security (Sanity)

### 4.1 Least-privilege roles for the two admins

- Both admin users are Sanity **Administrator**-equivalent only if both genuinely need full content + schema + settings control. If one of the two is content-only (no schema changes, no member management), assign the **Editor** role instead and reserve **Administrator** for the person who also maintains the Studio codebase/schema.
- No third account, service integration, or "viewer" link is granted write access. API tokens used by CI/build (for `next-sanity` fetches or ISR revalidation) are scoped to **read-only** unless a specific server route needs write access (none identified at launch — the Growth Plan Builder writes to Formspree, not Sanity).
- Any future write-capable token (e.g., a webhook that programmatically updates content) is scoped to the minimum dataset and document types it needs, not project-wide admin rights.

### 4.2 Studio access (separate Sanity-hosted deploy)

- The Studio is **deployed separately via Sanity hosting** at a `*.sanity.studio` URL (owner decision) — it is **not** a Next.js route in this app, so there is no public `/studio` surface on `infiniteweblinks.com` to protect. Its source lives in the same repo under `studio/` and is published with `sanity deploy`.
- Access control is Sanity's own authentication and project membership — only the two invited project members can authenticate into the Studio at all; Sanity serves it over HTTPS.
- Because the Studio is not on the Worker, **Cloudflare Access does not apply** to it; the equivalent gate would be Sanity's own organisation/SSO controls if the team later wants a second step. A custom admin domain (e.g. `admin.infiniteweblinks.com`) is an optional later step.
- The only Studio-related surfaces on the site are the secret-gated preview/revalidation Route Handlers (`/api/draft-mode/enable|disable`, `/api/revalidate`) — see §4.3.

### 4.3 Draft/preview protection — no public draft leakage

- Sanity's **Draft Mode** (Next.js Draft Mode + `next-sanity`'s preview helpers) is the mechanism for previewing unpublished content. Draft Mode is enabled only via a signed, time-limited request to a preview-enable Route Handler that checks a **preview secret token** (stored as a Worker secret, never public) before setting the Draft Mode cookie.
- Without a valid Draft Mode session, all page renders query the **published** dataset only — draft documents (including anything with status `Draft`, `Placeholder`, or `Approval Required` per the content-status model in locked brief §14) are never fetched or rendered on the public, unauthenticated path.
- This is the technical enforcement layer behind the product rule in §6 of the brief ("no public placeholders"): the content-status field controls what an editor *intends* to publish, and Draft Mode + published-dataset-only queries is what actually prevents unpublished/placeholder content reaching anonymous visitors, even if a status field were mis-set.
- Preview links generated for editors expire or are re-issued per session rather than being long-lived static URLs that could leak.

### 4.4 Dataset visibility

- The Sanity dataset is created with **private** or restricted read visibility rather than the default-public dataset visibility, since the site's Draft Mode and content-status model already assume that "not fetched via the app's published-only query" is the safety boundary — a private dataset adds a second boundary in case a token or query is ever misconfigured. Public dataset visibility is acceptable only if the team explicitly decides all *published* content is fine to be directly queryable via Sanity's API by anyone with the project ID (which is itself public) — recommend private-by-default and grant the Next.js app's read token explicit access.

### 4.5 CORS origins

- Sanity project CORS settings allow only: the production origin (`https://infiniteweblinks.com`), the **hosted Studio origin** (`https://<project>.sanity.studio`), the Cloudflare preview deployment origin(s), and `http://localhost:3000` (or the equivalent local dev port) for local development. No wildcard (`*`) origin is added.
- Because the Studio is a **separate** Sanity-hosted deployment (not embedded), its `*.sanity.studio` origin is an explicit CORS entry above — it is not covered by the site origins. The site's **preview** routes additionally allow being framed by that Studio origin via CSP `frame-ancestors` (§3.1) so Presentation live-editing works.

---

## 5. Dependency and Supply-Chain Security

### 5.1 Pinned versions and lockfile

- All dependencies are pinned to exact versions in `package.json` (no unpinned `^`/`~` ranges for the core stack listed in the facts pack — Next.js 16.2.10, React 19.2.7, `@opennextjs/cloudflare` 1.20.1, `wrangler` 4.110.0, `sanity`/`next-sanity` 6.4.0/13.1.1, GSAP 3.15.0, Motion 12.42.2, Playwright 1.61.1) so a `npm install` on a fresh machine reproduces the same dependency tree.
- `package-lock.json` (or the equivalent for whichever package manager the implementation phase selects) is committed and treated as the source of truth; CI installs with `npm ci` (or equivalent frozen-lockfile install), never a bare `install` that could silently bump versions.
- Exact patch versions are re-verified at install time per the facts pack's own flag (versions were observed on the npm registry on 2026-07-14 and may have moved by implementation time) — re-check before locking `package.json`.

### 5.2 CI checks

- `npm audit` (or `npm audit --production` for the deploy-relevant subset) runs in CI on every PR and on a scheduled weekly job, failing the build on new **high/critical** advisories so they can't merge silently; moderate/low findings are logged, not blocking, to avoid CI churn on low-impact transitive issues.
- GitHub's **Dependency Review** action (or Dependabot alerts, already native to GitHub) is enabled on the repository to flag newly introduced vulnerable dependencies directly on the PR diff.
- A secret-scanning step (GitHub's native secret scanning, enabled by default on public repos, plus push protection) is confirmed **on** for this public repository as a backstop against an accidentally committed key.
- Dependabot (or Renovate) version-update PRs are enabled for at least security patches, reviewed by one of the two admins/maintainers before merge — not auto-merged, since this is a small two-person team and an unreviewed auto-merge could break the build silently.

### 5.3 Third-party script review

Only three third-party script/embed sources are approved for this site, matching the CSP allowlist in §3.1:

| Script | Purpose | Loaded how |
|---|---|---|
| Cloudflare Turnstile | Bot/spam verification on forms | Official `@marsidev/react-turnstile` wrapper, loaded only on pages with a form (`/growth-plan`, `/contact`), not site-wide |
| Cloudflare Web Analytics | Cookieless traffic analytics | Official Cloudflare beacon snippet, loaded site-wide, deferred/async |
| Google Fonts | Sora, Plus Jakarta Sans, JetBrains Mono | Either via `next/font` (self-hosted at build time, **preferred** — removes the external request and the CSP allowance entirely) or via `<link>` to `fonts.googleapis.com`/`fonts.gstatic.com` if self-hosting isn't feasible |

No other analytics, chat widgets, ad pixels, session-replay tools, or marketing tags are added at launch — this keeps the CSP tight and matches §6's "no non-essential marketing scripts at launch" rule. Any future addition (e.g., a chat widget) must re-open this document's CSP and consent sections before it ships.

### 5.4 Subresource Integrity (SRI)

- Where a third-party script is loaded via a static `<script src>` tag rather than an npm package (this applies to Cloudflare's Web Analytics beacon and, if not using the React wrapper, Turnstile's script), add a Subresource Integrity `integrity` hash and `crossorigin="anonymous"` attribute if the vendor publishes stable, hash-pinnable URLs. In practice, Cloudflare's beacon and Turnstile scripts are served from URLs that Cloudflare may update without a version-pinned path, which makes SRI hashes brittle (the hash would break on Cloudflare's own updates) — where SRI isn't practical for a vendor's rolling script, rely on CSP source-restriction (§3.1) plus loading strictly over HTTPS from the vendor's known domain as the compensating control, and note this trade-off rather than silently skipping SRI.
- npm-packaged dependencies (GSAP, Motion, the Turnstile React wrapper) are bundled by the build, so SRI does not apply to them — the lockfile (§5.1) is the integrity control for those.

---

## 6. Privacy and Consent

### 6.1 Cloudflare Web Analytics — no consent banner required for it

- Cloudflare Web Analytics is cookieless and does not use client-side state to track users across visits or sites, so it does not require a cookie-consent banner under typical GDPR/UK-GDPR/ePrivacy guidance for non-cookie, non-tracking analytics. This plan does **not** assert a definitive legal conclusion — the "mark for professional review" rule in §6.6 applies here too, but the architecture proceeds on the working assumption that no consent gate is needed for this single, cookieless, first-party analytics tool.

### 6.2 Consent management architecture — ready, not active

- No consent banner ships at launch, because no non-essential/marketing script (ad pixels, remarketing tags, session replay, third-party cookies) is loaded at launch (§5.3).
- The architecture still reserves a clean insertion point for a consent-management layer: any future non-essential script is added behind a small consent-gate utility (loaded only after explicit opt-in, category-based — e.g., "marketing" vs "analytics" vs "essential") rather than being wired directly into the layout. This keeps the current zero-consent-banner state honest while avoiding a rebuild if a marketing pixel is added post-launch.
- Turnstile and Formspree are treated as **essential** (required to submit the form the visitor is actively using) and Cloudflare Web Analytics as essential-adjacent per §6.1 — neither sits behind the future consent gate.

### 6.3 Required legal/policy pages

Per the route list, four legal/policy pages exist: `/privacy`, `/cookies`, `/terms`, `/accessibility`. Each is CMS-editable (so updates don't require a redeploy) and each carries a visible "last updated" date. Structural content for each (per this plan's remit, not final legal wording):

- **`/privacy`**: what's collected (form fields, cookieless analytics events), why, where it's sent (Formspree, Sanity for CMS content, Cloudflare for analytics/hosting), retention posture, visitor rights (access/deletion requests), and the contact channel (`support@infiniteweblinks.com`) for privacy requests.
- **`/cookies`**: states that Cloudflare Web Analytics is cookieless; lists any strictly-necessary cookies actually set (Draft Mode session cookie for editors, any Turnstile cookie) with purpose and duration; explains there are no marketing/advertising cookies at launch.
- **`/terms`**: standard site-usage terms — placeholder structure only, content is legal-review territory.
- **`/accessibility`**: states the WCAG 2.2 AA target, known limitations if any, and a contact path for accessibility feedback.

### 6.4 GDPR / UK-GDPR posture

Given primary client markets include the UK and Europe, and the business processes personal data (names, emails, business details) from EU/UK visitors through the forms:

- Treat form submissions as personal data under GDPR/UK-GDPR from day one, regardless of where the business is based (India) — processing data *about* EU/UK data subjects brings extraterritorial GDPR obligations into scope.
- Identify the legal basis for processing (most likely **legitimate interest** or **consent**, depending on final legal review) for both the Growth Plan Builder and the contact form — this plan flags the need, it does not select the basis.
- Identify sub-processors: Formspree (form delivery/storage), Sanity (CMS content, not visitor PII in the current model), Cloudflare (hosting, analytics, Turnstile). A sub-processor list on `/privacy` is standard practice for GDPR transparency — confirm each vendor's own DPA/data-processing terms during legal review rather than assuming.
- This plan does **not** assert DPA coverage, lawful-basis correctness, or full compliance — those are legal-review items per §6.6.

### 6.5 Data handling for form submissions

| Question | Answer (as architected) |
|---|---|
| What is collected | Growth Plan Builder: business type, current stage, main goal, existing setup, engagement preference, timeline, name, email (contact details). Contact form: name, email, subject, message. |
| Where it's sent | Directly from the validated, Turnstile-checked Worker route to Formspree's API; Formspree relays to `support@infiniteweblinks.com`. |
| Is it stored elsewhere | Formspree retains submissions per its own plan/retention settings (visible in the Formspree dashboard) in addition to email delivery; the site itself does not persist submissions in Sanity or any first-party database at launch. |
| Retention | Governed by Formspree's account-level retention settings and the team's own mailbox retention — no separate first-party retention policy is needed at launch since there's no first-party datastore for submissions. Document the Formspree plan's retention window on `/privacy` once confirmed. |
| Who can access it | The two admins, via `support@infiniteweblinks.com` and the Formspree project dashboard (access to the Formspree account itself should also be limited to the same two people). |

### 6.6 Legal text — professional review required

Per the locked brief and Constitution Principle IX, this plan does **not** invent legal assurances. The following are explicitly flagged for professional legal review before launch, not drafted here as final copy:
- Final wording of `/privacy`, `/terms`, `/cookies`.
- The specific GDPR/UK-GDPR lawful basis claimed for each form.
- Any data-subject-rights process (access, deletion, portability) beyond "email support@infiniteweblinks.com."
- Sub-processor DPA confirmations (Formspree, Sanity, Cloudflare).
- Whether India-based data processing of EU/UK personal data needs an additional transfer mechanism under UK-GDPR/EU-GDPR (e.g., SCCs) — this is a legal determination, not an engineering one.

---

## 7. OWASP Top 10 Mapping (mostly-static marketing site)

| OWASP category | Relevance here | Mitigation in this plan |
|---|---|---|
| A01 Broken Access Control | Studio access, draft content, preview links | Sanity project-membership auth + least-privilege roles (§4.1), Draft Mode gated by secret token (§4.3), private dataset (§4.4) |
| A02 Cryptographic Failures | Secrets in transit/at rest, HTTPS enforcement | HSTS (§3.2), Cloudflare-terminated TLS everywhere, secrets never in repo (§1) |
| A03 Injection | Email header injection via form fields; stored/reflected XSS from unescaped form text | Server-side schema validation, header-injection character rejection, HTML-escaping of any echoed input (§2.1) |
| A04 Insecure Design | Public draft/placeholder leakage; unrestricted AI-driven recommendation logic | Content-status model + Draft Mode as two independent layers (§4.3); Growth Plan Builder logic is reviewed rule-based data, not a free-form AI decision path (locked brief §15) |
| A05 Security Misconfiguration | Missing headers, permissive CSP, public dataset, default Formspree settings | Explicit header set (§3), CSP allowlist scoped to the 3 approved third parties (§3.1, §5.3), dataset visibility (§4.4), same headers on preview and production (§3.3) |
| A06 Vulnerable and Outdated Components | Stale/vulnerable npm packages, GSAP/Motion/Sanity version drift | Pinned versions + lockfile, `npm audit`/Dependency Review in CI (§5.1–5.2) |
| A07 Identification and Authentication Failures | Studio login, preview-token handling | Sanity's own auth for the two admins (§4.1–4.2), time-limited/secret-gated preview tokens (§4.3) |
| A08 Software and Data Integrity Failures | Tampered third-party scripts, unverified CI artifacts | SRI where practical, CSP source restriction as the compensating control (§5.4), frozen-lockfile CI installs (§5.1) |
| A09 Security Logging and Monitoring Failures | No visibility into form abuse, header/CSP violations, Worker errors | Cloudflare's built-in Worker request logging/analytics as the baseline; CSP `report-to` once policy is stable (§3.1); rate-limit hits and Turnstile failures are worth logging (without storing raw PII) for abuse-pattern review |
| A10 Server-Side Request Forgery (SSRF) | Worker fetches to Formspree, Turnstile `siteverify`, Sanity API | All server-side `fetch` targets are fixed, hardcoded vendor URLs (Formspree endpoint, `challenges.cloudflare.com/turnstile/v0/siteverify`, `api.sanity.io`) — never a user-supplied or dynamically constructed URL, which removes the SSRF vector entirely for this site's request pattern |

---

## 8. Pre-Launch Security Checklist

- [ ] No secrets present in the Git history (fresh repo per locked brief — confirm at first commit and again before launch)
- [ ] `.env.example` lists every required variable with placeholder values only; no real value committed
- [ ] All production/preview secrets set via Cloudflare Workers secret storage, not dashboard plaintext env vars where a secret-capable field exists
- [ ] Growth Plan Builder and contact form: server-side schema validation live, header-injection characters rejected, honeypot field present, Turnstile server-side verification live, Formspree spam settings configured, Worker-level rate limiting active
- [ ] No visitor auto-reply configured; submissions deliver only to `support@infiniteweblinks.com`; fallback email visible on both form pages
- [ ] Security headers (CSP, HSTS, X-Content-Type-Options, Referrer-Policy, X-Frame-Options/`frame-ancestors`, Permissions-Policy) present on production **and** preview responses, verified with a live header-inspection check, not just code review
- [ ] CSP allowlist contains only Sanity, Formspree, Turnstile, Cloudflare Analytics, and (if not self-hosted) Google Fonts — no stray domains from copy-pasted boilerplate
- [ ] Sanity roles reviewed: each of the two admins has the least-privilege role their actual duties require; no unused service tokens with write access
- [ ] Studio (separate `*.sanity.studio` deploy) reachable only after a valid Sanity login; site has **no** public `/studio` route; Sanity CORS allowlist contains only known origins (site, `*.sanity.studio`, previews, localhost); preview routes framable only by `*.sanity.studio`
- [ ] Draft Mode requires a valid secret token; unauthenticated requests never receive draft/placeholder content; dataset visibility set to private/restricted
- [ ] Sanity CORS origins limited to production, preview, and local-dev origins — no wildcard
- [ ] Dependencies pinned, lockfile committed, `npm audit` and Dependency Review passing in CI, GitHub secret scanning + push protection enabled
- [ ] Only the three approved third-party scripts are present in the shipped page; no untracked analytics/chat/ad scripts
- [ ] `/privacy`, `/cookies`, `/terms`, `/accessibility` pages exist, are CMS-editable, and are flagged to the client for legal review before go-live
- [ ] No consent banner is falsely implying tracking that doesn't happen; no non-essential script loads without the (currently dormant) consent-gate utility
- [ ] OWASP Top 10 table above reviewed line-by-line against the as-built implementation, not just this plan
- [ ] Rollback plan confirmed (see deployment/environment plan) in case a post-launch security fix needs a fast revert
