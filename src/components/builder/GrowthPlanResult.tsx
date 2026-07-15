import { Mail, RotateCcw } from "lucide-react";
import { Button } from "@/components/primitives/Button";
import { SectionHeader } from "@/components/primitives/SectionHeader";
import { Badge } from "@/components/primitives/Badge";
import type { GrowthPlanResult as GrowthPlanResultData } from "@/lib/growth-plan/types";
import { supportEmail } from "@/lib/forms/config";
import styles from "./GrowthPlanResult.module.css";

interface GrowthPlanResultProps {
  result: GrowthPlanResultData;
  /** Renders a "Build again" action when provided (resets the builder). */
  onBuildAgain?: () => void;
  className?: string;
}

type ListKey =
  | "startHere"
  | "connectNext"
  | "addLater"
  | "relevantCapabilities"
  | "exampleTools"
  | "expectedOutcomes";

const GROUPS: { key: ListKey; title: string; color: string }[] = [
  { key: "startHere", title: "Start here", color: "var(--violet)" },
  { key: "connectNext", title: "Connect next", color: "var(--cyan)" },
  { key: "addLater", title: "Add later", color: "var(--orange)" },
  { key: "relevantCapabilities", title: "Relevant capabilities", color: "var(--lime)" },
  { key: "exampleTools", title: "Example tools we can connect", color: "var(--blue)" },
  { key: "expectedOutcomes", title: "Expected outcomes", color: "var(--pink)" },
];

/**
 * Renders the structured Growth Plan recommendation (brief §15): Start here · Connect
 * next · Add later · Relevant capabilities · Example tools · Expected outcomes · How we
 * can help. Deliberately never renders `matchedRuleId` — that's internal traceability
 * only (contracts/growth-plan-rules.md), not visitor-facing.
 */
export function GrowthPlanResult({ result, onBuildAgain, className }: GrowthPlanResultProps) {
  return (
    <div className={[styles.wrap, className].filter(Boolean).join(" ")} data-testid="growth-plan-result">
      <SectionHeader
        eyebrow="Your growth plan"
        title="Here's where we'd start"
        intro="A guided first read of your situation — illustrative, not a guarantee. Talk it through with us any time."
      />

      <div className={styles.grid}>
        {GROUPS.map((group) => {
          const items = result[group.key];
          if (!items || items.length === 0) return null;
          return (
            <div key={group.key} className={styles.card}>
              <p className={styles.cardTitle}>{group.title}</p>
              <ul className={styles.list}>
                {items.map((item) => (
                  <li key={item}>
                    <Badge color={group.color} variant="soft">
                      {item}
                    </Badge>
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      </div>

      <div className={styles.howWeHelp}>
        <p className={styles.howWeHelpTitle}>How we can help</p>
        <p className={styles.howWeHelpBody}>{result.howWeHelp}</p>
      </div>

      <div className={styles.actions}>
        <Button href={`mailto:${supportEmail}`} variant="secondary" iconLeft={<Mail size={18} aria-hidden="true" />}>
          Email us about this plan
        </Button>
        {onBuildAgain ? (
          <Button
            type="button"
            variant="ghost"
            onClick={onBuildAgain}
            iconLeft={<RotateCcw size={18} aria-hidden="true" />}
          >
            Build again
          </Button>
        ) : null}
      </div>
    </div>
  );
}
