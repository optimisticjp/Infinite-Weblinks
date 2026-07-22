import { ArrowRight } from "lucide-react";
import { Card } from "@/components/primitives/Card";
import { Badge } from "@/components/primitives/Badge";
import { Icon } from "@/components/primitives/Icon";
import { domainInk } from "@/lib/design/domainColor";
import styles from "./RoadmapCard.module.css";

/** How many phase titles preview inline before collapsing the rest into a "+N more" line. */
const MAX_PHASES = 3;

type RoadmapCardProps = {
  /** Roadmap title — rendered as the card's <h3>. */
  title: string;
  /** Short intro to the suggested sequence. */
  intro: string;
  /** Internal destination — the WHOLE card is this single link. */
  href: string;
  /** Real business-type name (visible text). */
  businessTypeLabel: string;
  /** Wayfinding colour token for the business type (legacy or V2); mapped to a V2 ink. */
  businessTypeTone?: string;
  /** Business-type icon name (rendered in the badge). */
  businessTypeIcon: string;
  /** The roadmap's real phases (only their titles are previewed). */
  phases: { title: string }[];
  className?: string;
};

/**
 * RoadmapCard — a planning card for the Roadmaps hub, led by its suggested SEQUENCE. A
 * business-type badge, an H3 title, a short intro, the real phase count, and an ordered
 * preview of the first phase titles with compact numbered markers (a truthful "+N more
 * phase(s)" line when there are more). It reads as a suggested sequence, never project
 * progress: no durations, completion percentages, progress bars, or any claim the plan is
 * fixed or guaranteed. Whole-card link, H3 title, softly-tinted + accent-railed planning
 * surface — visually distinct from ToolCard, ArticleCard, CaseStudyCard and BentoCard. Server
 * Component.
 */
export function RoadmapCard({
  title,
  intro,
  href,
  businessTypeLabel,
  businessTypeTone,
  businessTypeIcon,
  phases,
  className,
}: RoadmapCardProps) {
  const ink = domainInk(businessTypeTone);
  const count = phases.length;
  const shown = phases.slice(0, MAX_PHASES);
  const overflow = count - shown.length;

  return (
    <Card
      href={href}
      variant="tinted"
      railed
      accent={ink}
      className={[styles.card, className].filter(Boolean).join(" ")}
    >
      <span className={styles.head}>
        <Badge tone="domain" color={ink} icon={<Icon name={businessTypeIcon} />}>
          For {businessTypeLabel}
        </Badge>
        <span className={styles.count}>
          {count} {count === 1 ? "phase" : "phases"}
        </span>
      </span>

      <h3 className={styles.title}>{title}</h3>
      <p className={styles.intro}>{intro}</p>

      <p className={styles.seqLabel}>Suggested sequence</p>
      <ol className={styles.phases}>
        {shown.map((phase, i) => (
          <li key={phase.title} className={styles.phase}>
            <span className={styles.marker} aria-hidden="true">
              {String(i + 1).padStart(2, "0")}
            </span>
            <span className={styles.phaseTitle}>{phase.title}</span>
          </li>
        ))}
      </ol>
      {overflow > 0 ? (
        <p className={styles.morePhases}>
          +{overflow} more {overflow === 1 ? "phase" : "phases"}
        </p>
      ) : null}

      <span className={styles.more} aria-hidden="true">
        See the roadmap
        <ArrowRight className={styles.moreIcon} />
      </span>
    </Card>
  );
}
