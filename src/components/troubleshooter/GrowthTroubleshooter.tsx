"use client";

import { useId, useState } from "react";
import { ArrowRight, Check } from "lucide-react";
import { Button } from "@/components/primitives/Button";
import { Icon } from "@/components/primitives/Icon";
import type { TroubleshooterProblem } from "@/lib/content/types";
import styles from "./GrowthTroubleshooter.module.css";

/**
 * The interactive Growth Troubleshooter (ref 06). Pick a problem → see a plain
 * explanation, the common reasons, and a short list of things to check. Selection is
 * CLICK-driven (buttons with aria-pressed), never hover — so there is no hover-state to
 * desync, and it is fully keyboard operable. All content is always in the DOM; selecting
 * only switches which panel is shown, so nothing is gated behind motion.
 */
export function GrowthTroubleshooter({ problems }: { problems: TroubleshooterProblem[] }) {
  const [activeSlug, setActiveSlug] = useState(problems[0]?.slug);
  const panelId = useId();
  const active = problems.find((p) => p.slug === activeSlug) ?? problems[0];
  if (!active) return null;

  return (
    <div className={styles.root}>
      <section className={`theme-dark iw-section ${styles.selectorSection}`} aria-labelledby="ts-select-heading">
        <div className="iw-container iw-container--wide">
          <h2 id="ts-select-heading" className={styles.selectHeading}>
            What is stopping your growth?
          </h2>
          <p className={styles.selectIntro}>Choose the problem that best describes your situation.</p>

          <ul className={styles.grid} role="list">
            {problems.map((p) => {
              const selected = p.slug === active.slug;
              return (
                <li key={p.slug}>
                  <button
                    type="button"
                    className={`${styles.problem} ${selected ? styles.problemActive : ""}`}
                    style={{ ["--accent" as string]: p.color }}
                    aria-pressed={selected}
                    aria-controls={panelId}
                    onClick={() => setActiveSlug(p.slug)}
                  >
                    <span className={styles.problemIcon} aria-hidden="true">
                      <Icon name={p.icon} />
                    </span>
                    <span className={styles.problemLabel}>{p.label}</span>
                    {selected ? (
                      <span className={styles.problemTick} aria-hidden="true">
                        <Check />
                      </span>
                    ) : null}
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      </section>

      {/* Why this happens — dark. */}
      <section className={`theme-dark iw-section iw-section--tight ${styles.reasonsSection}`} id={panelId} aria-live="polite">
        <div className="iw-container iw-container--wide">
          <div className={styles.reasonsHead} style={{ ["--accent" as string]: active.color }}>
            <p className="iw-eyebrow">Why this happens</p>
            <h3 className={styles.reasonsHeading}>{active.label}</h3>
            <p className={styles.reasonsIntro}>{active.explanation}</p>
          </div>
          <ul className={styles.reasons}>
            {active.reasons.map((r) => (
              <li key={r.title} className={styles.reason} style={{ ["--accent" as string]: active.color }}>
                <span className={styles.reasonIcon} aria-hidden="true">
                  <Icon name={r.icon} />
                </span>
                <p className={styles.reasonTitle}>{r.title}</p>
                <p className={styles.reasonBody}>{r.body}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Things you can check today — daylight band. */}
      <section className={`theme-band-bright iw-section iw-section--tight ${styles.checksSection}`} aria-labelledby="ts-checks-heading">
        <div className="iw-container iw-container--wide">
          <h3 id="ts-checks-heading" className={styles.checksHeading}>
            Things you can check today
          </h3>
          <ol className={styles.checks}>
            {active.checks.map((c, i) => (
              <li key={c} className={styles.check} style={{ ["--accent" as string]: active.color }}>
                <span className={styles.checkNum} aria-hidden="true">
                  {i + 1}
                </span>
                <span className={styles.checkText}>{c}</span>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Focus first + next step — dark. */}
      <section className={`theme-dark iw-section iw-section--tight ${styles.focusSection}`} aria-labelledby="ts-focus-heading">
        <div className={`iw-container ${styles.focusInner}`}>
          <div>
            <p className="iw-eyebrow" id="ts-focus-heading">
              Focus first
            </p>
            <p className={styles.focusText}>{active.focusFirst}</p>
          </div>
          <div className={styles.focusCtas}>
            <Button href="/growth-plan" variant="primary" size="lg" iconRight={<ArrowRight aria-hidden="true" />}>
              Build my growth plan
            </Button>
            <Button href={`/how-it-works#${active.recommendedStageSlug}`} variant="text">
              See the connected stage →
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
