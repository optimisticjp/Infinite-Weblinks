import Link from "next/link";
import type { CSSProperties } from "react";
import { ArrowUpRight } from "lucide-react";
import { IconTile } from "@/components/primitives/IconTile";
import { Icon } from "@/components/primitives/Icon";
import { domainInk } from "@/lib/design/domainColor";
import styles from "./ContactPathCard.module.css";

type ContactPathCardProps = {
  /** The path name (verbatim). */
  title: string;
  /** The plain body (verbatim). */
  body: string;
  /** Destination — an internal path or a mailto: URL. */
  href: string;
  /** Shared icon name. */
  icon: string;
  /** Wayfinding tone (legacy or V2 token); mapped to an accessible V2 ink. */
  tone: string;
  /** True for an off-site / mailto destination (renders a plain anchor, not a router Link). */
  external?: boolean;
  className?: string;
};

/**
 * ContactPathCard — a WHOLE-CARD link for one alternative way to get in touch (email / growth plan).
 * The entire card is a single link (one tab stop, no nested link): a flat IconTile, an H3 title, the
 * body, and a visible destination affordance (an arrow, plus the email address for a mailto path). An
 * external/mailto href renders a plain `<a>`; an internal path renders a Next `<Link>`. No fabricated
 * availability, phone, calendar, live-chat or featured-first emphasis. Server Component.
 */
export function ContactPathCard({ title, body, href, icon, tone, external, className }: ContactPathCardProps) {
  const ink = domainInk(tone);
  const cls = [styles.card, className].filter(Boolean).join(" ");
  const style = { ["--card-accent" as string]: ink } as CSSProperties;
  const destination = external ? href.replace(/^mailto:/, "") : null;

  const inner = (
    <>
      <span className={styles.head}>
        <IconTile color={ink} size="md">
          <Icon name={icon} />
        </IconTile>
        <ArrowUpRight className={styles.arrow} size={18} aria-hidden="true" />
      </span>
      <h3 className={styles.title}>{title}</h3>
      <p className={styles.body}>{body}</p>
      {destination ? <span className={styles.destination}>{destination}</span> : null}
    </>
  );

  return external ? (
    <a href={href} className={cls} style={style}>
      {inner}
    </a>
  ) : (
    <Link href={href} className={cls} style={style}>
      {inner}
    </Link>
  );
}
