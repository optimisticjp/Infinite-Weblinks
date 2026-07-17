import { NextResponse } from "next/server";
import { contactSchema } from "@/lib/validation/forms";
import { verifyTurnstile } from "@/lib/forms/turnstile";
import { forwardToFormspree } from "@/lib/forms/formspree";
import { clientIpFromHeaders } from "@/lib/forms/rate-limit";
import { rateLimit } from "@/lib/forms/rate-limit-adapter";
import { deliveryEnabled, supportEmail } from "@/lib/forms/config";

/**
 * POST /api/forms/contact — Contact form submission ("Ask Our Team" / "Send Us Your
 * Goals", including the `?subject=growth-goals` deep link). Same defence-in-depth flow
 * as the Growth Plan route (contracts/forms-and-email.md); never claims success when
 * nothing was actually delivered.
 */

const MIN_HUMAN_MS = 1500;

const DELIVERY_UNAVAILABLE_MESSAGE = `Form delivery isn't configured on this preview yet — please email ${supportEmail} and we'll pick it up.`;

export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { ok: false, code: "invalid-json", message: "The request body must be valid JSON." },
      { status: 400 },
    );
  }

  const parsed = contactSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      {
        ok: false,
        code: "validation-error",
        message: "Please check the highlighted fields and try again.",
        fieldErrors: parsed.error.flatten().fieldErrors,
      },
      { status: 400 },
    );
  }
  const values = parsed.data;

  if (values._gotcha) {
    return NextResponse.json({ ok: true });
  }
  if (typeof values.elapsedMs === "number" && values.elapsedMs < MIN_HUMAN_MS) {
    return NextResponse.json({ ok: true });
  }

  const ip = clientIpFromHeaders(req.headers);
  const rate = await rateLimit(`contact:${ip}`);
  if (!rate.allowed) {
    return NextResponse.json(
      {
        ok: false,
        code: "rate-limited",
        message: "Please wait a moment before trying again.",
      },
      { status: 429 },
    );
  }

  const turnstile = await verifyTurnstile(values.turnstileToken, ip);
  if (!turnstile.success) {
    return NextResponse.json(
      {
        ok: false,
        code: "turnstile-failed",
        message: "We couldn't verify you're human. Please try again.",
      },
      { status: 400 },
    );
  }

  if (!deliveryEnabled("contact")) {
    return NextResponse.json(
      { ok: false, code: "delivery-unavailable", message: DELIVERY_UNAVAILABLE_MESSAGE },
      { status: 503 },
    );
  }

  const delivery = await forwardToFormspree("contact", {
    formName: "Contact",
    subject: `New contact — ${values.subject}`,
    subjectSlug: values.subject,
    name: values.name,
    email: values.email,
    replyTo: values.email,
    company: values.company ?? "",
    website: values.website ?? "",
    message: values.message,
  });

  if (!delivery.delivered) {
    return NextResponse.json(
      {
        ok: false,
        code: "delivery-failed",
        message: `We couldn't send your message just now — please email ${supportEmail} directly and we'll pick it up.`,
      },
      { status: 502 },
    );
  }

  return NextResponse.json({ ok: true });
}
