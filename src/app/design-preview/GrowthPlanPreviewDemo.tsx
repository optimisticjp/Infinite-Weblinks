"use client";

import { useState } from "react";
import { Check } from "lucide-react";
import { OptionCards } from "@/components/primitives/OptionCards";
import { TextField } from "@/components/forms/fields/TextField";
import { IconTile } from "@/components/primitives/IconTile";
import builder from "@/components/builder/PlanBuilder.module.css";

/**
 * Preview-only demo of the Growth Plan Builder's interactive pieces: the V2 OptionCards (a selected
 * group and an error group), the V2 follow-up controls, and the review-request success and
 * delivery-unavailable panels. Uses preview ids/names (never the production builder ids) and makes no
 * API call — it exists so the V2 selection look, the invalid-control state and the truthful
 * review/delivery panels can be seen without mounting the real PlanBuilder. Not the real builder.
 */
const OPTIONS = [
  { value: "solo", label: "Just me", description: "A one-person business or a side project." },
  { value: "small", label: "A small team", description: "A handful of people, wearing many hats." },
  { value: "growing", label: "A growing company", description: "Established and adding people or products." },
];

export function GrowthPlanPreviewDemo() {
  const [choice, setChoice] = useState<string | undefined>("small");
  const [name, setName] = useState("");

  return (
    <div style={{ display: "grid", gap: "var(--space-7)" }}>
      <OptionCards
        legend="Which best describes you? (preview — one selected)"
        name="preview-gp-options"
        columns={3}
        options={OPTIONS}
        value={choice}
        onChange={setChoice}
      />
      <OptionCards
        legend="The same group in its error state (preview)"
        name="preview-gp-options-error"
        columns={3}
        options={OPTIONS}
        value={undefined}
        onChange={() => {}}
        error="Please choose the option that fits best."
      />

      <div style={{ display: "grid", gap: "var(--space-4)", maxWidth: "26rem" }}>
        <TextField
          id="preview-gp-name"
          appearance="v2"
          label="Your name"
          required
          value={name}
          onChange={setName}
          placeholder="Your name"
        />
        <TextField
          id="preview-gp-email-err"
          appearance="v2"
          label="Email"
          type="email"
          value=""
          onChange={() => {}}
          placeholder="you@yourbusiness.com"
          error="Please enter a valid email address."
        />
      </div>

      {/* Review-request success panel (flat IconTile, truthful copy — the plan was sent for review) */}
      <div className={builder.success}>
        <span className={builder.successMark}>
          <IconTile color="var(--v2-success)" size="lg">
            <Check aria-hidden="true" />
          </IconTile>
        </span>
        <h3 className={builder.successTitle}>Thanks, your plan was sent to our team.</h3>
        <p className={builder.successBody}>
          A real person will review it and reply by email with a practical next step. The plan above
          remains available on screen.
        </p>
      </div>

      {/* Delivery-unavailable notice (truthful, points at the email fallback) */}
      <div className={builder.notice}>
        Form delivery isn&apos;t set up on this preview yet. Please email support@infiniteweblinks.com
        and we&apos;ll pick it up.
      </div>
    </div>
  );
}
