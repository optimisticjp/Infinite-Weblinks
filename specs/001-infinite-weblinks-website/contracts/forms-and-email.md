# Contract — Forms & Email-Delivery Architecture

Phase 1 contract. Defines how the site's two conversion forms — the **Growth Plan Builder** and the
**Contact** form — collect, validate, protect, submit and deliver enquiries. Email-led only; **no
calendar, no phone, no visitor auto-reply at launch** (brief §4).

## Principles
- **Email-led, team-only.** Submissions deliver **only** to `support@infiniteweblinks.com` via
  **Formspree**. The support email is a visible **fallback**, never the primary action.
- **Defence in depth.** Client validation (UX) + **server validation** (authority) + **Cloudflare
  Turnstile** (server-verified) + honeypot + edge rate-limiting.
- **Accessible by construction.** Real labels, `aria-describedby` errors, an error summary with focus
  management, `aria-live` status, keyboard-operable (WCAG 2.2 AA; see `design/accessibility.md`).
- **No secrets in the client.** Turnstile secret + any Formspree server token live server-side (see
  `design/environment.md`); `NEXT_PUBLIC_*` values are non-secret by definition.

## Forms in scope
| Form | Route | Purpose | Formspree endpoint (env) |
|---|---|---|---|
| Growth Plan Builder | `/growth-plan` | Guided multi-step → structured recommendation + enquiry | `NEXT_PUBLIC_FORMSPREE_GROWTH_PLAN_ID` |
| Contact | `/contact` (honours `?subject=growth-goals`) | "Ask Our Team" / "Send Us Your Goals" | `NEXT_PUBLIC_FORMSPREE_CONTACT_ID` |

## Submission flow (both forms)
```
Visitor fills form (client)
  → client-side Zod validation (inline, accessible errors)
  → Turnstile challenge solved (widget) → token
  → POST to internal Route Handler  /api/forms/[form]   (server, edge)
        1. Zod re-validate (server = source of truth)
        2. Turnstile siteverify (server secret) — reject on fail
        3. honeypot + timing + rate-limit checks (reject silently on bot)
        4. normalise + sanitise payload (strip control chars; block header-injection in any email-like field)
        5. forward to Formspree endpoint  (server-side fetch)
  → Formspree delivers email to support@infiniteweblinks.com only
  → Route Handler returns {ok} → client shows accessible success state
```
Rationale for routing through an **internal Route Handler** rather than posting the browser straight to
Formspree: it lets us verify Turnstile server-side, enforce rate-limiting at the Worker edge, keep the
payload shape controlled, and avoid exposing logic to tampering. (If a pure client→Formspree post is
later preferred, Turnstile must still be verified — the Route Handler is the recommended default.)

## Validation contract (Zod, shared client + server)

**Contact form**
| Field | Rule |
|---|---|
| `name` | required, 2–80 chars, no URLs |
| `email` | required, valid email, no newline/`,`/`;` (anti header-injection) |
| `subject` | enum incl. `growth-goals`, `general`, `services`; prefilled from query |
| `message` | required, 10–2000 chars |
| `company` | optional, ≤120 chars |
| `honeypot` (`_gotcha`) | must be empty |
| `turnstileToken` | required, verified server-side |

**Growth Plan Builder** (adds the guided inputs from `data-model.md`)
| Field | Rule |
|---|---|
| `businessType` | required, must match a known business type slug |
| `currentStage` | required, one of the 8 stage slugs |
| `mainGoal` | required, known goal slug |
| `existingSetup` | required, known option |
| `engagementPreference` | required, one of the 6 neutral ranges (no currency) |
| `timeline` | required, known option |
| `name`, `email` | as contact rules |
| `message` | optional, ≤2000 |
| `recommendationSummary` | server-attached (the computed `GrowthPlanResult`, so the team sees what the visitor saw) |
| `honeypot`, `turnstileToken` | as above |

Invalid submissions return field-level errors (400) rendered as an accessible error summary; the visitor
never loses entered data.

## Turnstile contract
- Client: `@marsidev/react-turnstile@1.5.3` widget with `NEXT_PUBLIC_TURNSTILE_SITE_KEY`; render
  accessibly (no cognitive puzzle — satisfies WCAG 3.3.8); support reduced-motion.
- Server: POST token + `TURNSTILE_SECRET_KEY` to Cloudflare `siteverify`; reject on failure or timeout;
  never trust the client result alone.

## Spam / abuse controls
- **Honeypot** hidden field (`_gotcha`), `aria-hidden`, off-screen, must stay empty.
- **Timing check**: reject submissions faster than a human minimum.
- **Rate limiting** at the Worker edge (per-IP window) — reject with a friendly retry message.
- **Formspree** native spam filtering as a backstop.
- Bot rejections are quiet (no detailed error that helps attackers).

## Email delivery contract
- **Recipient**: `support@infiniteweblinks.com` **only**. No CC/BCC to the visitor at launch.
- **Subject line**: form-specific, e.g. `New Growth Plan enquiry — {businessType} / {mainGoal}` and
  `New contact — {subject}`.
- **Body**: labelled, plain-text-safe summary of all fields + (for the builder) the recommendation the
  visitor received. No HTML injection from user fields.
- **Reply-to**: visitor email (so the team can reply directly), validated to prevent header injection.
- **Fallback**: the success state and the footer show `support@infiniteweblinks.com` as an alternative
  way to reach the team.

## States & UX
- **Loading**: submit disabled + `aria-busy`; no double submit.
- **Success**: accessible confirmation (focus moved to a status region, `role="status"`), clear "what
  happens next" copy, and the email fallback. Builder success also keeps the recommendation visible.
- **Error (validation)**: inline + summary, focus first invalid field.
- **Error (network/Formspree/Turnstile down)**: graceful message + email fallback; the page never
  hard-fails.

## Privacy
Collected data is limited to what the enquiry needs (name, email, business context, message). Handling,
retention and the privacy-policy linkage are covered in `design/security-privacy.md`; consent is not
required for these first-party functional submissions, but the privacy page discloses the flow.

## Testing hooks (see `design/testing.md`)
- Unit: Zod schemas (valid/invalid, header-injection, boundary lengths).
- E2E (Playwright): full builder happy path + submit (Formspree + Turnstile **mocked**), validation and
  error states, contact `?subject=growth-goals` prefill, keyboard-only completion, reduced-motion.
- Security: Turnstile-fail rejection, honeypot trip, rate-limit trip.

## Future (not in v1)
Optional visitor confirmation email (needs consent + template), CRM forwarding, or a Cloudflare Worker →
transactional-email route (MailChannels/Resend) replacing Formspree — all deferred; architecture keeps
the internal Route Handler as the single seam to swap transport without touching the UI.
