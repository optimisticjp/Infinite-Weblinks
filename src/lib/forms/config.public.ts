/**
 * CLIENT-SAFE form configuration. Everything in this module is intentionally public and safe to ship
 * in the browser bundle: the Turnstile SITE key (public by design) and the public support email. It
 * contains NO server secret and NO Formspree form id — those live in `config.server.ts`
 * (`import "server-only"`), which a Client Component cannot import.
 *
 * Client Components (e.g. Turnstile.tsx, ContactForm.tsx, PlanBuilder.tsx) import ONLY from here.
 */

/** Public support address — shown to visitors as the honest fallback when delivery is unavailable. */
export const supportEmail = "support@infiniteweblinks.com";

/**
 * Cloudflare Turnstile SITE key. Public by design (it is rendered into the widget in the browser).
 * `NEXT_PUBLIC_*` so Next inlines it into the client bundle. Absent ⇒ the widget doesn't render and
 * the server decides enforcement (see config.server.ts / turnstile.ts).
 */
export const turnstileSiteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;
