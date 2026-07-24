import { ArrowRight, BadgeCheck, Info } from "lucide-react";
import { Card } from "@/components/primitives/Card";
import { Badge } from "@/components/primitives/Badge";
import { domainInk } from "@/lib/design/domainColor";
import styles from "./CaseStudyCard.module.css";

/**
 * Case-study status. `illustrative` (the default) is a worked EXAMPLE, not a real client —
 * every such card says so on its face. `verified` is reserved for a real, published client
 * case study and is a HARD contract: it cannot be used without truthful, visible verification
 * context, so a caller can never mint a "verified"-looking card from a bare status flag.
 */
export type CaseStudyStatus = "illustrative" | "verified";

/** Truthful, visible verification context — required whenever `status="verified"`. */
export type CaseStudyVerification = {
  /** The visible verification label shown on the card, e.g. "Verified with the client". */
  label: string;
  /** Optional truthful client name, or a confidentiality label e.g. "Client confidential". */
  client?: string;
};

type BaseProps = {
  /** Scenario/case title — rendered as the card's <h3>. */
  title: string;
  /** One-line summary of the connected system. */
  summary: string;
  /** Who the example/case is for, e.g. "A local service business". */
  forWho: string;
  /** Internal destination — the WHOLE card is this single link. */
  href: string;
  /** Wayfinding colour token (legacy or V2); mapped to an accessible V2 ink. */
  tone?: string;
  className?: string;
};

/** Illustrative form — the default. Verification context is NOT accepted here. */
type IllustrativeProps = BaseProps & {
  status?: "illustrative";
  verification?: never;
};

/** Verified form — requires truthful, visible verification context; it cannot compile without. */
type VerifiedProps = BaseProps & {
  status: "verified";
  verification: CaseStudyVerification;
};

export type CaseStudyCardProps = IllustrativeProps | VerifiedProps;

/**
 * CaseStudyCard — a proof/status-led card for the case-studies hub. Every illustrative card
 * visibly declares itself an **"Illustrative example"** via a real V2 Badge — carried on the
 * card, not just a page disclaimer — so no card can be mistaken for a real client. It shows the
 * situation, who it is for and the summary — never a client name, logo, testimonial or numeric
 * result — unless a caller supplies genuine, truthful `verification` context for a real,
 * published case study. The verified form is a hard type contract: `status="verified"` cannot
 * be written without visible verification context, so no bare flag can fabricate proof.
 * Whole-card link, H3 title, outlined + accent-railed. Server Component.
 */
export function CaseStudyCard(props: CaseStudyCardProps) {
  const { title, summary, forWho, href, tone, className } = props;
  const ink = domainInk(tone);
  const verified = props.status === "verified";

  return (
    <Card
      href={href}
      variant="outlined"
      railed
      accent={ink}
      className={[styles.card, className].filter(Boolean).join(" ")}
    >
      <span className={styles.head}>
        {verified ? (
          <>
            <Badge tone="success" icon={<BadgeCheck aria-hidden="true" />}>
              {props.verification.label}
            </Badge>
            {props.verification.client ? (
              <span className={styles.client}>{props.verification.client}</span>
            ) : null}
          </>
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
        {verified ? "Read the case study" : "See the example"}
        <ArrowRight className={styles.moreIcon} />
      </span>
    </Card>
  );
}
