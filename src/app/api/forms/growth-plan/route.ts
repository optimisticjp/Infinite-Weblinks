import { NextResponse } from "next/server";
import { growthPlanSchema } from "@/lib/validation/forms";
import { verifyTurnstile } from "@/lib/forms/turnstile";
import { forwardToFormspree } from "@/lib/forms/formspree";
import { checkRateLimit, clientIpFromHeaders } from "@/lib/forms/rate-limit";
import { deliveryEnabled, supportEmail } from "@/lib/forms/config";
import { resolve } from "@/lib/growth-plan/engine";
import { growthPlanRuleSet } from "@/lib/growth-plan/rules";
import type { GrowthPlanResult } from "@/lib/growth-plan/types";

/**
 * POST /api/forms/growth-plan — Growth Plan Builder submission.
 *
 * Flow (contracts/forms-and-email.md): Zod re-validate (source of truth) → honeypot +
 * timing + rate-limit (reject bots quietly / 429) → Turnstile verify (server secret) →
 * recompute the deterministic recommendation → forward to Formspree → {ok:true}, or
 * {ok:false, code:"delivery-unavailable"} when delivery isn't configured. This route
 * NEVER claims success when nothing was actually delivered.
 */

/** Reject submissions completed faster than a human plausibly could. */
const MIN_HUMAN_MS = 1500;

const DELIVERY_UNAVAILABLE_MESSAGE = `Form delivery isn't configured on this preview yet — please email ${supportEmail} and we'll pick it up.`;

function formatRecommendationForEmail(result: GrowthPlanResult): string {
  const lines = [
    `Start here: ${result.startHere.join(", ") || "—"}`,
    `Connect next: ${result.connectNext.join(", ") || "—"}`,
    `Add later: ${result.addLater.join(", ") || "—"}`,
    `Relevant capabilities: ${result.relevantCapabilities.join(", ") || "—"}`,
    `Example tools: ${result.exampleTools.join(", ") || "—"}`,
    `Expected outcomes: ${result.expectedOutcomes.join(", ") || "—"}`,
    `How we can help: ${result.howWeHelp}`,
    `(matched rule: ${result.matchedRuleId})`,
  ];
  return lines.join("\n");
}

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

  const parsed = growthPlanSchema.safeParse(body);
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

  // Honeypot trip or too-fast submission: reject quietly, no signal to bots.
  if (values._gotcha) {
    return NextResponse.json({ ok: true });
  }
  if (typeof values.elapsedMs === "number" && values.elapsedMs < MIN_HUMAN_MS) {
    return NextResponse.json({ ok: true });
  }

  const ip = clientIpFromHeaders(req.headers);
  const rate = checkRateLimit(`growth-plan:${ip}`);
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

  // Recompute the same pure, deterministic recommendation the visitor already saw, so
  // the team receives exactly what was shown (never invented, never re-decided here).
  const result = resolve(
    {
      businessType: values.businessType,
      currentStage: values.currentStage,
      mainGoal: values.mainGoal,
      existingSetup: values.existingSetup,
    },
    growthPlanRuleSet,
  );

  if (!deliveryEnabled("growth-plan")) {
    return NextResponse.json(
      { ok: false, code: "delivery-unavailable", message: DELIVERY_UNAVAILABLE_MESSAGE },
      { status: 503 },
    );
  }

  const delivery = await forwardToFormspree("growth-plan", {
    formName: "Growth Plan Builder",
    subject: `New Growth Plan enquiry — ${values.businessType} / ${values.mainGoal}`,
    name: values.name,
    email: values.email,
    replyTo: values.email,
    businessType: values.businessType,
    currentStage: values.currentStage,
    mainGoal: values.mainGoal,
    existingSetup: values.existingSetup,
    engagement: values.engagement,
    timeline: values.timeline,
    message: values.message ?? "",
    recommendationSummary: formatRecommendationForEmail(result),
    matchedRuleId: result.matchedRuleId,
  });

  if (!delivery.delivered) {
    return NextResponse.json(
      {
        ok: false,
        code: "delivery-failed",
        message: `We couldn't send your enquiry just now — please email ${supportEmail} directly and we'll pick it up.`,
      },
      { status: 502 },
    );
  }

  return NextResponse.json({ ok: true });
}
