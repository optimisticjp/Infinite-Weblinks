import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { NodeOrb } from "@/components/primitives/NodeOrb";
import { Icon } from "@/components/primitives/Icon";
import { ConnectorPath } from "./ConnectorPath";
import styles from "./RailBar.module.css";

type RailBarProps = {
  icon: string;
  label: string;
  description?: string;
  hue?: string;
  href?: string;
  className?: string;
};

/**
 * RailBar — a wide pill for a cross-cutting rail that runs through the whole journey: a
 * domain-tinted node orb, a label + one-line description, a wavy connector that runs the
 * width of the bar, and a trailing arrow. Renders as a link when `href` is set. The connector
 * is decorative; the label carries the meaning.
 */
export function RailBar({ icon, label, description, hue = "var(--domain-ai)", href, className }: RailBarProps) {
  const inner = (
    <>
      <NodeOrb hue={hue} size={44}>
        <Icon name={icon} />
      </NodeOrb>
      <span className={styles.text}>
        <span className={styles.label}>{label}</span>
        {description ? <span className={styles.desc}>{description}</span> : null}
      </span>
      <ConnectorPath
        className={styles.wave}
        from={hue}
        via={hue}
        to={hue}
        dots={1}
        d="M0 12 C 18 4, 34 20, 52 12 S 84 6, 100 12"
      />
      {href ? (
        <span className={styles.arrow} aria-hidden="true">
          <ArrowRight size={18} />
        </span>
      ) : null}
    </>
  );

  const style = { ["--rail-hue" as string]: hue };

  return href ? (
    <Link href={href} className={[styles.rail, styles.link, className].filter(Boolean).join(" ")} style={style}>
      {inner}
    </Link>
  ) : (
    <div className={[styles.rail, className].filter(Boolean).join(" ")} style={style}>
      {inner}
    </div>
  );
}
