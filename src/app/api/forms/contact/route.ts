import { NextResponse } from "next/server";
import { contactSchema } from "@/lib/validation/forms";
import { verifyTurnstile } from "@/lib/forms/turnstile";
import { forwardToFormspree } from "@/lib/forms/formspree";
import { clientIpFromHeaders } from "@/lib/forms/rate-limit";
import { rateLimit } from "@/lib/forms/rate-limit-adapter";
import { deliveryEnabled } from "@/lib/forms/config.server";
import { supportEmail } from "@/lib/forms/config.public";
import { readJsonBody, newRequestId } from "@/lib/forms/request";

/**
 * POST /api/forms/contact — Contact form submission ("Send us your goals"). The visitor
 * sends their details and message, with optional business-type / stage / goal context to
 * help us tailor the reply. Same defence-in-depth flow as the Growth Plan route; never
 * claims success when nothing was actually delivered. Every response carries an X-Request-ID
 * for safe log correlation (no visitor data in it).
 */

const MIN_HUMAN_MS = 1500;

const DELIVERY_UNAVAILABLE_MESSAGE = `Form delivery isn't set up on this preview yet. Please email ${supportEmail} and we'll pick it up.`;
const SECURITY_UNAVAILABLE_MESSAGE = `We couldn't run the security check just now. Please try again shortly, or email ${supportEmail} and we'll pick it up.`;
const RATE_LIMIT_UNAVAILABLE_MESSAGE = `We couldn't process your message just now. Please try again shortly, or email ${supportEmail} and we'll pick it up.`;

export async function POST(req: Request) {
  const requestId = newRequestId();
  const respond = (body: Record<string, unknown>, status = 200, headers: Record<string, string> = {}) =>
    NextResponse.json(body, { status, headers: { "X-Request-ID": requestId, ...headers } });

  // Bounded request read: application/json only, small size cap, streamed-safe (§C).
  const read = await readJsonBody(req);
  if (!read.ok) {
    if (read.kind === "unsupported-media-type") {
      return respond(
        { ok: false, code: "unsupported-media-type", message: "Please send this form as application/json." },
        415,
      );
    }
    if (read.kind === "payload-too-large") {
      return respond({ ok: false, code: "payload-too-large", message: "That request was too large." }, 413);
    }
    return respond({ ok: false, code: "invalid-json", message: "The request body must be valid JSON." }, 400);
  }

  const parsed = contactSchema.safeParse(read.data);
  if (!parsed.success) {
    return respond(
      {
        ok: false,
        code: "validation-error",
        message: "Please check the highlighted fields and try again.",
        fieldErrors: parsed.error.flatten().fieldErrors,
      },
      400,
    );
  }
  const values = parsed.data;

  if (values._gotcha) {
    return respond({ ok: true });
  }
  if (typeof values.elapsedMs === "number" && values.elapsedMs < MIN_HUMAN_MS) {
    return respond({ ok: true });
  }

  const ip = clientIpFromHeaders(req.headers);
  const rate = await rateLimit(`contact:${ip}`);
  if (rate.disposition === "unavailable") {
    // The required rate limiter couldn't run — fail closed rather than accept unlimited traffic.
    return respond(
      { ok: false, code: "rate-limit-unavailable", message: RATE_LIMIT_UNAVAILABLE_MESSAGE },
      503,
      { "Retry-After": String(rate.retryAfterSeconds) },
    );
  }
  if (rate.disposition === "limited") {
    return respond(
      { ok: false, code: "rate-limited", message: "Please wait a moment before trying again." },
      429,
      { "Retry-After": String(rate.retryAfterSeconds) },
    );
  }

  const turnstile = await verifyTurnstile(values.turnstileToken, { expectedAction: "contact", ip });
  if (turnstile.disposition === "unavailable") {
    // The human check couldn't run (missing keys or Cloudflare unreachable) — fail closed, never deliver.
    return respond(
      { ok: false, code: "security-unavailable", message: SECURITY_UNAVAILABLE_MESSAGE },
      503,
    );
  }
  if (turnstile.disposition !== "pass") {
    return respond(
      { ok: false, code: "turnstile-failed", message: "We couldn't verify you're human. Please try again." },
      400,
    );
  }

  if (!deliveryEnabled("contact")) {
    return respond({ ok: false, code: "delivery-unavailable", message: DELIVERY_UNAVAILABLE_MESSAGE }, 503);
  }

  const delivery = await forwardToFormspree("contact", {
    formName: "Contact",
    subject: values.mainGoal ? `New contact enquiry: ${values.mainGoal}` : "New contact enquiry",
    name: values.name,
    email: values.email,
    replyTo: values.email,
    company: values.company ?? "",
    website: values.website ?? "",
    businessType: values.businessType ?? "",
    currentStage: values.currentStage ?? "",
    mainGoal: values.mainGoal ?? "",
    message: values.message,
  });

  if (!delivery.delivered) {
    return respond(
      {
        ok: false,
        code: "delivery-failed",
        message: `We couldn't send your message just now. Please email ${supportEmail} directly and we'll pick it up.`,
      },
      502,
    );
  }

  return respond({ ok: true });
}
