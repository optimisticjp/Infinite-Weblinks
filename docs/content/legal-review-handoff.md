# Legal Review Handoff

A factual brief for the owner and a qualified legal professional. It describes **only what the
repository actually implements** — no legal advice, no invented entity details, retention periods, or
jurisdictions. The five legal pages (`/privacy`, `/cookies`, `/terms`, `/refunds`, `/accessibility`)
are **code-authoritative drafts** carrying `legalReviewStatus: "draft"` and a visible review notice;
**none is professionally reviewed**, and that status must only change with owner-supplied confirmation.

> **Not legal advice.** This document is an engineering description of data flows to brief a
> professional review. It does not assert compliance and answers none of the open questions below.

---

## 1. What the site actually does (from the code)

### Data collected

- **Contact form** (`/contact`): name, email, message (required); optional business name, website,
  business-type / stage / goal context.
- **Growth Plan form** (`/growth-plan`): name, email (required); optional business name, website,
  message; plus the answers used to compute the plan (business type, goal, existing setup, engagement,
  timeline). The server recomputes the plan recommendation and includes a summary + internal matched
  rule id in the email **to the team only** (never returned to the visitor).
- **Anti-abuse signals**: a honeypot field, a client-side timing value, the visitor IP (from
  `cf-connecting-ip`), and a Cloudflare Turnstile token — used only to gate submission.

### How it flows

1. The browser POSTs **same-origin** to `/api/forms/*` as JSON (bounded to 16 KiB).
2. The server validates (Zod), applies honeypot + human-timing + rate-limit + Turnstile gates.
3. On success it forwards the fields to **Formspree** (`https://formspree.io/f/<id>`), **server-to-
   server** — Formspree is the only email transport. Formspree is configured (in its own dashboard,
   not in this repo) to deliver to **support@infiniteweblinks.com** only.
4. Every response carries an `X-Request-ID` (a random UUID). The server emits **PII-free** structured
   log lines per lifecycle step, correlated by that id — no names, emails, message bodies, tokens, or
   IPs are logged.

### What the site does NOT do

- **No user accounts, no login, no customer database, no site checkout / payments.**
- **No automatic copy of the growth plan to the visitor** — the plan is shown on screen only; there is
  no email-to-visitor and no download.
- **No advertising or marketing cookies, no cross-site tracking pixels** are implemented.
- The public site renders **reviewed local seed content by default**; live Sanity CMS reads are
  flag-gated and **off** by default (`NEXT_PUBLIC_SANITY_LIVE_CONTENT_ENABLED=false`). Sanity is an
  **editorial** store, not a visitor-data store.

### Third parties in the request path

- **Cloudflare** — hosting (Workers), Turnstile (bot check on forms), and **Cloudflare Web Analytics**
  (cookieless; **only active when `NEXT_PUBLIC_CLOUDFLARE_ANALYTICS_TOKEN` is set — currently unset**).
- **Formspree** — email delivery of form submissions (server-to-server).
- **Sanity** — editorial CMS (flag-gated; not visitor data).

### How the current legal copy maps to the above

- **Privacy** — describes form data → Formspree, cookieless Cloudflare Web Analytics, Turnstile,
  Sanity as editorial only, and the support email. Consistent with the implementation, **except**
  the analytics section is written in the present tense while analytics is currently **inactive** (an
  owner activation decision — see §2). No wording was changed in this pass to avoid legal judgement.
- **Cookies** — "cookieless analytics", "no marketing/advertising cookies", Turnstile technical data.
  Consistent with the implementation (no cookie-setting analytics; Turnstile).
- **Terms** — "no guaranteed results"; site content is informational; paid work governed by a separate
  agreement. Consistent (no checkout on site).
- **Refunds** — "no payments on this site"; the free growth plan; paid-work refunds governed by the
  separate agreement. Consistent (no checkout, plan is free).
- **Accessibility** — targets WCAG 2.2 AA; ongoing; contact route for issues. Consistent with the a11y
  test posture, though the WCAG **conformance level is a claim the owner should confirm** (see §2).

---

## 2. Open questions for the owner / legal professional

Answer these before launch. **Do not guess any of these — they are not derivable from the code.**

**Entity & governance**

- Legal entity / data-controller identity and trading name.
- Registered address and jurisdiction/governing law.
- Company registration details (if to be shown).

**Data protection**

- Lawful basis for processing form submissions.
- **Retention periods** for form submissions (held in Formspree + the support inbox).
- The process for data **access / deletion** requests, and who handles them.
- **International data transfers** (Formspree and Cloudflare processing locations) and the mechanism.
- Processor terms / DPAs with **Formspree** and **Cloudflare**.
- Whether a formal privacy contact / DPO should be named.

**Commercial**

- Service-contract jurisdiction and the terms of the "separate written agreement".
- **Cancellation / deposit / refund** specifics for paid work.
- Any deposits, recurring fees, or minimum commitments that must be disclosed (see the pricing register).

**Site**

- **Analytics activation decision** — turn Cloudflare Web Analytics on (set the beacon token) or amend
  the privacy/cookies copy to reflect that it is inactive.
- **Accessibility conformance** — confirm the WCAG 2.2 AA target and the complaint/resolution process.

---

## 3. Rules honoured in this pass

- Only factual, non-judgemental descriptions were written; **no legal wording was changed** (the only
  legal-file change was adding the explicit `legalReviewStatus: "draft"` field — a status marker, not
  copy).
- No legal approval was invented; no page was marked professionally reviewed; every draft keeps its
  visible review notice.
- Any future legal wording change must be listed in the Phase 3B implementation report.
