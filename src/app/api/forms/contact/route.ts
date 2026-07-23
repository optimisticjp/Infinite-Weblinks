import { NextResponse } from "next/server";
import { contactSchema } from "@/lib/validation/forms";
import { verifyTurnstile } from "@/lib/forms/turnstile";
import { forwardToFormspree } from "@/lib/forms/formspree";
import { clientIpFromHeaders } from "@/lib/forms/rate-limit";
import { rateLimit } from "@/lib/forms/rate-limit-adapter";
import { deliveryEnabled } from "@/lib/forms/config.server";
import { supportEmail } from "@/lib/forms/config.public";

/**
 * POST /api/forms/contact — Contact form submission ("Send us your goals"). The visitor
 * sends their details and message, with optional business-type / stage / goal context to
 * help us tailor the reply. Same defence-in-depth flow as the Growth Plan route
 * (contracts/forms-and-email.md); never claims success when nothing was actually delivered.
 */

const MIN_HUMAN_MS = 1500;

const DELIVERY_UNAVAILABLE_MESSAGE = `Form delivery isn't set up on this preview yet. Please email ${supportEmail} and we'll pick it up.`;

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
    return NextResponse.json(
      {
        ok: false,
        code: "delivery-failed",
        message: `We couldn't send your message just now. Please email ${supportEmail} directly and we'll pick it up.`,
      },
      { status: 502 },
    );
  }

  return NextResponse.json({ ok: true });
}
