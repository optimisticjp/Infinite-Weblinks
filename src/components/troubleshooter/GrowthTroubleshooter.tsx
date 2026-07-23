"use client";

import type { CSSProperties } from "react";
import { useState } from "react";
import { Check } from "lucide-react";
import { SectionShell } from "@/components/sections/SectionShell";
import { CardGrid } from "@/components/primitives/CardGrid";
import { IconTile } from "@/components/primitives/IconTile";
import { Icon } from "@/components/primitives/Icon";
import { Button } from "@/components/primitives/Button";
import { TroubleshooterReasonCard } from "@/components/cards/TroubleshooterReasonCard";
import { TroubleshooterChecklist } from "@/components/routes/TroubleshooterChecklist";
import { domainInk, domainTint } from "@/lib/design/domainColor";
import type { TroubleshooterProblem } from "@/lib/content/types";
import styles from "./GrowthTroubleshooter.module.css";

const RESULT_ID = "troubleshooter-result";
const ACTIVE_HEADING_ID = "troubleshooter-active-heading";

/**
 * GrowthTroubleshooter (ref 06) — the interactive troubleshooter on the V2 light-first system, and
 * the route's single Client Component. Pick a problem → the active guidance region updates with a
 * plain explanation, the common reasons, and things to check.
 *
 * Selection is CLICK/keyboard-driven (native buttons with aria-pressed), never hover, so there is no
 * hover state to desync and it is fully keyboard operable. Exactly one problem is active (the first is
 * selected initially, with a first-problem fallback). Selection lives in React state only — nothing is
 * persisted, no URL query or hash encodes it, and no form/API request is made.
 *
 * Rendering contract: every selector CHOICE is always present in the DOM; only the ACTIVE problem's
 * detailed guidance is rendered, and switching selection updates that guidance. Nothing is gated
 * behind hover or motion; a concise polite live status announces the change.
 */
export function GrowthTroubleshooter({ problems }: { problems: TroubleshooterProblem[] }) {
  const [activeSlug, setActiveSlug] = useState(problems[0]?.slug);
  const active = problems.find((p) => p.slug === activeSlug) ?? problems[0];
  if (!active) return null;

  const activeInk = domainInk(active.color);

  return (
    <>
      {/* ============ Selector ============ */}
      <SectionShell
        surface="alt"
        id="diagnose"
        title="What is stopping your growth?"
        lead="Choose the problem that best describes your situation."
        align="start"
        spacing="tight"
      >
        <ul className={styles.problemsList} role="list">
          {problems.map((p) => {
            const selected = p.slug === active.slug;
            const ink = domainInk(p.color);
            const tint = domainTint(p.color);
            return (
              <li key={p.slug}>
                <button
                  type="button"
                  data-problem-slug={p.slug}
                  className={[styles.problem, selected ? styles.problemActive : ""].filter(Boolean).join(" ")}
                  style={{ ["--btn-ink" as string]: ink, ["--btn-tint" as string]: tint } as CSSProperties}
                  aria-pressed={selected}
                  aria-controls={RESULT_ID}
                  onClick={() => setActiveSlug(p.slug)}
                >
                  <IconTile color={ink} size="sm" className={styles.problemTile}>
                    <Icon name={p.icon} />
                  </IconTile>
                  <span className={styles.problemLabel}>{p.label}</span>
                  {selected ? (
                    <span className={styles.problemMark} aria-hidden="true">
                      <Check size={16} strokeWidth={3} />
                    </span>
                  ) : null}
                </button>
              </li>
            );
          })}
        </ul>
      </SectionShell>

      {/* ============ Active guidance ============ */}
      <SectionShell surface="light" id="diagnosis" ariaLabel="Guidance for the selected problem" spacing="tight">
        {/* Concise polite status — announces the change without wrapping the long result in a live
            region. Visually hidden (the active heading already shows the label on screen). */}
        <p className="iw-visually-hidden" aria-live="polite">
          Showing guidance for: {active.label}
        </p>

        <div
          id={RESULT_ID}
          role="region"
          aria-labelledby={ACTIVE_HEADING_ID}
          className={styles.result}
          style={{ ["--active-ink" as string]: activeInk } as CSSProperties}
        >
          <div className={styles.activeHead}>
            <h2 id={ACTIVE_HEADING_ID} className={styles.activeTitle}>
              {active.label}
            </h2>
            <p className={styles.activeExplanation}>{active.explanation}</p>
          </div>

          <section className={styles.block} aria-labelledby="troubleshooter-reasons-heading">
            <h3 id="troubleshooter-reasons-heading" className={styles.blockHeading}>
              Why this may be happening
            </h3>
            <CardGrid layout="equal" aria-label="Common reasons this may be happening">
              {active.reasons.map((r) => (
                <TroubleshooterReasonCard key={r.title} title={r.title} body={r.body} icon={r.icon} tone={active.color} />
              ))}
            </CardGrid>
          </section>

          <section className={styles.block} aria-labelledby="troubleshooter-checks-heading">
            <h3 id="troubleshooter-checks-heading" className={styles.blockHeading}>
              Things you can check today
            </h3>
            <TroubleshooterChecklist checks={active.checks} tone={active.color} />
          </section>

          {/* Focus first — a restrained panel, not a dark hero. A sensible place to start plus the two
              contextual next steps (the guided plan + the connected stage). No "only fix" or
              guaranteed-result claim; the stage destination is exact (integrity-tested). */}
          <section className={styles.focusFirst} aria-labelledby="troubleshooter-focus-eyebrow">
            <p id="troubleshooter-focus-eyebrow" className={styles.focusEyebrow}>
              Focus first
            </p>
            <p className={styles.focusText}>{active.focusFirst}</p>
            <div className={styles.focusActions}>
              <Button href="/growth-plan" variant="primary">
                Build my growth plan
              </Button>
              <Button href={`/how-it-works#${active.recommendedStageSlug}`} variant="secondary">
                See the connected stage
              </Button>
            </div>
          </section>
        </div>
      </SectionShell>
    </>
  );
}
