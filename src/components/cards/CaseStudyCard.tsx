import { ArrowRight, BadgeCheck, Info } from "lucide-react";
import { Card } from "@/components/primitives/Card";
import { Badge } from "@/components/primitives/Badge";
import { domainInk } from "@/lib/design/domainColor";
import styles from "./CaseStudyCard.module.css";

/**
 * Case-study status. `illustrative` (the default today) is a worked EXAMPLE, not a real
 * client — every such card says so on its face. `verified` is reserved for a future, published
 * client case study; the API accepts it now so the card can carry a real "Verified" badge
 * later, without inventing any client content today.
 */
export type CaseStudyStatus = "illustrative" | "verified";

type CaseStudyCardProps = {
  /** Scenario title, framed as a situation — rendered as the card's <h3>. */
  title: string;
  /** One-line summary of the connected system. */
  summary: string;
  /** Who the example is for, e.g. "A local service business". */
  forWho: string;
  /** Internal destination — the WHOLE card is this single link. */
  href: string;
  /** Defaults to `illustrative`; drives the on-card status badge. */
  status?: CaseStudyStatus;
  /** Wayfinding colour token (legacy or V2); mapped to an accessible V2 ink. */
  tone?: string;
  className?: string;
};

/**
 * CaseStudyCard — a worked-example card for the case-studies hub. Every illustrative card
 * visibly declares itself an "Illustrative example" (carried on the card, not only in a page
 * disclaimer), so no card can be mistaken for a real client. It shows the situation, who it is
 * for and the summary — never a client name, logo, testimonial or numeric result. The status
 * is a real V2 Badge. The whole card is one link. Visually distinct from ArticleCard: an
 * outlined, accent-railed panel led by its status. Server Component.
 */
export function CaseStudyCard({
  title,
  summary,
  forWho,
  href,
  status = "illustrative",
  tone,
  className,
}: CaseStudyCardProps) {
  const ink = domainInk(tone);
  return (
    <Card
      href={href}
      variant="outlined"
      railed
      accent={ink}
      className={[styles.card, className].filter(Boolean).join(" ")}
    >
      <span className={styles.head}>
        {status === "verified" ? (
          <Badge tone="success" icon={<BadgeCheck aria-hidden="true" />}>
            Verified case study
          </Badge>
        ) : (
          <Badge tone="information" icon={<Info aria-hidden="true" />}>
            Illustrative example
          </Badge>
        )}
      </span>
      <h3 className={styles.title}>{title}</h3>
      <p className={styles.forWho}>{forWho}</p>
      <p className={styles.summary}>{summary}</p>
      <span className={styles.more} aria-hidden="true">
        See the example
        <ArrowRight className={styles.moreIcon} />
      </span>
    </Card>
  );
}
