"use client";

import { useMemo, useState } from "react";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/primitives/Button";
import { Icon } from "@/components/primitives/Icon";
import { IconTile } from "@/components/primitives/IconTile";
import styles from "./GoalExplorerFilter.module.css";

export interface GoalCardVM {
  slug: string;
  title: string;
  audienceHint?: string;
  whatYouNeed: string;
  howWeHelp: string;
  outcome: string;
  exampleTools: string[];
  icon: string;
  color: string;
  stageSlugs: string[];
  stageNames: string[];
}

export interface StageFilter {
  slug: string;
  name: string;
}

/**
 * Client filter island for the Goal Explorer. Renders every goal by default (the
 * "All goals" state), so the full content is in the DOM before hydration — the
 * stage chips only narrow what's shown, they never gate access to it. Plain
 * `<button>` elements keep every chip and card link independently keyboard-
 * reachable; nothing here depends on hover.
 */
export function GoalExplorerFilter({
  goals,
  stageFilters,
}: {
  goals: GoalCardVM[];
  stageFilters: StageFilter[];
}) {
  const [activeStage, setActiveStage] = useState<string | null>(null);

  const visible = useMemo(
    () => (activeStage ? goals.filter((g) => g.stageSlugs.includes(activeStage)) : goals),
    [goals, activeStage],
  );

  return (
    <div className={styles.wrap}>
      {stageFilters.length > 1 && (
        <div className={styles.filters} role="group" aria-label="Filter goals by growth stage">
          <button
            type="button"
            className={styles.chip}
            aria-pressed={activeStage === null}
            onClick={() => setActiveStage(null)}
          >
            All goals
          </button>
          {stageFilters.map((s) => (
            <button
              key={s.slug}
              type="button"
              className={styles.chip}
              aria-pressed={activeStage === s.slug}
              onClick={() => setActiveStage(s.slug)}
            >
              {s.name}
            </button>
          ))}
        </div>
      )}

      <p className={styles.count} aria-live="polite">
        {visible.length} goal{visible.length === 1 ? "" : "s"} shown
      </p>

      <ul className={styles.grid}>
        {visible.map((g) => (
          <li key={g.slug} className={styles.card}>
            <IconTile color={g.color} variant="filled" size={52}>
              <Icon name={g.icon} />
            </IconTile>
            <h3 className={styles.title}>{g.title}</h3>
            {g.audienceHint && <p className={styles.hint}>{g.audienceHint}</p>}

            <dl className={styles.facts}>
              <div className={styles.fact}>
                <dt className={styles.factLabel}>What you need</dt>
                <dd className={styles.factValue}>{g.whatYouNeed}</dd>
              </div>
              <div className={styles.fact}>
                <dt className={styles.factLabel}>How we help</dt>
                <dd className={styles.factValue}>{g.howWeHelp}</dd>
              </div>
            </dl>

            <p className={styles.outcome}>
              <span className={styles.outcomeLabel}>Outcome</span>
              {g.outcome}
            </p>

            {g.exampleTools.length > 0 && (
              <p className={styles.tools}>Tools we might use: {g.exampleTools.join(", ")}</p>
            )}

            <Button
              href={`/growth-plan?goal=${g.slug}`}
              variant="text"
              size="sm"
              iconRight={<ArrowRight aria-hidden="true" size={16} />}
            >
              Build a plan for this goal
            </Button>
          </li>
        ))}
      </ul>
    </div>
  );
}
