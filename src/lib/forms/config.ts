/**
 * Form delivery configuration — reads env at request time. NEVER hardcode values here;
 * an absent var means that delivery channel genuinely is not configured for this
 * environment (e.g. local dev or an early preview deploy before secrets are provisioned),
 * and every caller must degrade gracefully rather than pretending a submission was sent
 * (contracts/forms-and-email.md — "never fake a successful send").
 */

export const supportEmail = "support@infiniteweblinks.com";

export const turnstileSiteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;
export const turnstileSecretKey = process.env.TURNSTILE_SECRET_KEY;
export const formspreeGrowthPlanId = process.env.NEXT_PUBLIC_FORMSPREE_GROWTH_PLAN_ID;
export const formspreeContactId = process.env.NEXT_PUBLIC_FORMSPREE_CONTACT_ID;

/** True only when BOTH the public site key and the server secret are present — a site
 * key alone is not enough to trust client-reported results (never trust the client alone). */
export const turnstileConfigured = Boolean(turnstileSiteKey && turnstileSecretKey);

export const formspreeGrowthPlanConfigured = Boolean(formspreeGrowthPlanId);
export const formspreeContactConfigured = Boolean(formspreeContactId);

export type FormName = "growth-plan" | "contact";

/** The Formspree form id to forward a given form's submissions to, if configured. */
export function formspreeIdFor(form: FormName): string | undefined {
  return form === "growth-plan" ? formspreeGrowthPlanId : formspreeContactId;
}

/** Whether a submission for this form can actually be delivered right now. Routes must
 * check this BEFORE claiming success — an unconfigured form must return
 * `{ok:false, code:"delivery-unavailable"}`, never a fake `{ok:true}`. */
export function deliveryEnabled(form: FormName): boolean {
  return form === "growth-plan" ? formspreeGrowthPlanConfigured : formspreeContactConfigured;
}
