import { ArrowRight, Mail } from "lucide-react";
import { Button } from "@/components/primitives/Button";
import { Icon } from "@/components/primitives/Icon";
import { InfinityMark } from "@/components/brand/InfinityMark";
import { GlobeArc } from "@/components/viz/GlobeArc";
import styles from "./FinalCtaBannerSection.module.css";

const SUPPORT_EMAIL = "support@infiniteweblinks.com";

/**
 * The service domains that radiate out of the mark — plain text labels, colour-coded
 * to the domain palette. Decorative reinforcement of "everything connects around one
 * centre"; the accessible message is carried entirely by the heading and CTA, so the
 * whole constellation is aria-hidden.
 * `--x`/`--y` place each node around the centred mark on desktop; on smaller screens
 * they are ignored and the nodes flow as centred chips below the mark.
 */
type OrbitNode = { label: string; icon: string; color: string; x: string; y: string };
const NODES: OrbitNode[] = [
  { label: "AI & Automation", icon: "zap", color: "var(--violet-bright)", x: "50%", y: "7%" },
  { label: "Audiences", icon: "users", color: "var(--violet)", x: "16%", y: "20%" },
  { label: "Analytics", icon: "bar-chart-3", color: "var(--cyan)", x: "84%", y: "20%" },
  { label: "Marketing", icon: "megaphone", color: "var(--pink)", x: "7%", y: "46%" },
  { label: "Customer tools", icon: "message-square", color: "var(--blue-bright)", x: "93%", y: "46%" },
  { label: "Websites", icon: "monitor", color: "var(--blue)", x: "13%", y: "72%" },
  { label: "Operations", icon: "settings", color: "var(--orange)", x: "87%", y: "72%" },
  { label: "Sales channels", icon: "shopping-bag", color: "var(--cyan)", x: "27%", y: "91%" },
  { label: "Customer loyalty", icon: "heart", color: "var(--orange-bright)", x: "73%", y: "91%" },
];

/**
 * FinalCtaBannerSection — the closing conversion banner (theme-dark, signature rhythm).
 * This is the SECOND and last place gradient text is allowed on the site (the hero H1 is
 * the first). The InfinityMark owns the section's single glow. Email-led conversion only:
 * the support email is a visible fallback beneath the primary action, never the primary
 * action itself (no "Book a Call", no phone number).
 */
export function FinalCtaBannerSection({ anchorId }: { anchorId?: string }) {
  return (
    <section
      id={anchorId}
      className={`theme-dark iw-section iw-section--loose ${styles.section}`}
      aria-labelledby="final-cta-heading"
    >
      <div className={styles.wash} aria-hidden="true" />
      <div className={`iw-container ${styles.inner}`}>
        <div className={styles.header}>
          <p className={`iw-eyebrow ${styles.eyebrow}`}>Ready to connect the next step?</p>
          <h2 id="final-cta-heading" className={styles.title}>
            Build your digital growth plan, one connected step{" "}
            <span className="iw-gradient-text">at a time.</span>
          </h2>
          <p className={styles.intro}>
            Tell us where you are and what you want to achieve. We&apos;ll help you find the right
            starting point, then map what to build first and what to connect next.
          </p>
        </div>

        <div className={styles.actions}>
          <Button
            href="/growth-plan"
            variant="primary"
            size="lg"
            iconRight={<ArrowRight aria-hidden="true" />}
          >
            Build my growth plan
          </Button>
          <a className={styles.email} href={`mailto:${SUPPORT_EMAIL}`}>
            <Mail aria-hidden="true" className={styles.emailIcon} />
            <span>
              Prefer email? <span className={styles.emailAddr}>{SUPPORT_EMAIL}</span>
            </span>
          </a>
        </div>

        <div className={styles.constellation} aria-hidden="true">
          <GlobeArc className={styles.globe} />
          <div className={styles.markWrap}>
            <InfinityMark size={280} glow className={styles.mark} />
          </div>
          <ul className={styles.orbit}>
            {NODES.map((n) => (
              <li
                key={n.label}
                className={styles.node}
                style={{
                  ["--x" as string]: n.x,
                  ["--y" as string]: n.y,
                  ["--node-accent" as string]: n.color,
                }}
              >
                <span className={styles.nodeIcon}>
                  <Icon name={n.icon} />
                </span>
                <span className={styles.nodeLabel}>{n.label}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
