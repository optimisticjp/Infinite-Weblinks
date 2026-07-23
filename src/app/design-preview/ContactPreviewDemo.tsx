"use client";

import { useState } from "react";
import { Check } from "lucide-react";
import { TextField } from "@/components/forms/fields/TextField";
import { SelectField } from "@/components/forms/fields/SelectField";
import { TextAreaField } from "@/components/forms/fields/TextAreaField";
import { IconTile } from "@/components/primitives/IconTile";
import formStyles from "@/components/forms/ContactForm.module.css";

/**
 * Preview-only demo of the V2 form-control appearance and the ContactForm status sub-blocks. Uses
 * preview ids (never the production `contact-*` ids) and makes no API call — it exists so the V2
 * control look, a long wrapping error, and the success / delivery-unavailable panels can be seen
 * without rendering the real ContactForm (which would duplicate production ids). Not the real form.
 */
export function ContactPreviewDemo() {
  const [name, setName] = useState("");
  const [goal, setGoal] = useState("");
  const [message, setMessage] = useState("");

  return (
    <div style={{ display: "grid", gap: "var(--space-7)" }}>
      <div style={{ display: "grid", gap: "var(--space-5)", maxWidth: "26rem" }}>
        <TextField
          id="preview-contact-name"
          appearance="v2"
          label="Your name"
          required
          value={name}
          onChange={setName}
          placeholder="Your name"
        />
        <SelectField
          id="preview-contact-goal"
          appearance="v2"
          label="Your main goal"
          value={goal}
          onChange={setGoal}
          options={[{ value: "get-found-on-google", label: "Get found on Google" }]}
          placeholder="Select an option"
        />
        <TextAreaField
          id="preview-contact-message"
          appearance="v2"
          label="Your message"
          required
          value={message}
          onChange={setMessage}
          maxLength={200}
          placeholder="For example: our website and email tool aren't joined up…"
          error="Please add a little more detail (at least 10 characters). This is an example of a longer validation message, shown to check that it wraps cleanly within the field and never overflows its container."
        />
      </div>

      {/* Success panel (flat IconTile, no SVG gradient / InfinityMark) */}
      <div className={formStyles.success}>
        <span className={formStyles.successVisual} aria-hidden="true">
          <IconTile color="var(--v2-success)" size="lg">
            <Check />
          </IconTile>
        </span>
        <h3 className={formStyles.successTitle}>Thanks, your message is on its way.</h3>
        <p className={formStyles.successBody}>
          A real person will read it and reply by email with a practical next step.
        </p>
      </div>

      {/* Delivery-unavailable notice (truthful, points at the email fallback) */}
      <div className={formStyles.notice}>
        Form delivery isn&apos;t set up on this preview yet. Please email support@infiniteweblinks.com and
        we&apos;ll pick it up.
      </div>
    </div>
  );
}
