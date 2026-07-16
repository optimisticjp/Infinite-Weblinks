import { Button } from "@/components/primitives/Button";
import { Icon } from "@/components/primitives/Icon";
import { IconTile } from "@/components/primitives/IconTile";
import { SectionHeader } from "@/components/primitives/SectionHeader";
import { getValueProps } from "@/lib/content";
import styles from "./WhyInfiniteWeblinksSection.module.css";

/**
 * WhyInfiniteWeblinksSection — differentiators (theme-dark).
 * Rendered as a plain editorial list rather than boxed equal cards, so it reads
 * as a point-by-point argument rather than a SaaS feature grid. No invented
 * awards, stats or client counts — only what the value props actually say.
 */
export async function WhyInfiniteWeblinksSection({ anchorId }: { anchorId?: string }) {
  const valueProps = await getValueProps();
  if (valueProps.length === 0) return null;

  return (
    <section
      id={anchorId}
      className={`theme-dark iw-section ${styles.section}`}
      aria-labelledby="why-us-heading"
    >
      <div className="iw-container">
        {/* One left edge (Phase 3): the deeper "who we are" read fills the aside, so this
            heading returns to the shared left line instead of the Phase-2 centring. */}
        <SectionHeader
          id="why-us-heading"
          eyebrow="Why Infinite Weblinks"
          title="What actually makes the difference"
          intro="Not a longer feature list — a different way of thinking about the work."
          aside={
            <Button href="/about" variant="secondary" size="sm">
              About Infinite Weblinks
            </Button>
          }
        />

        <ul className={styles.list}>
          {valueProps.map((vp) => (
            <li key={vp.title} className={styles.item}>
              <IconTile color={vp.color} variant="filled" size={52}>
                <Icon name={vp.icon} />
              </IconTile>
              <div>
                <h3 className={styles.title}>{vp.title}</h3>
                <p className={styles.body}>{vp.body}</p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
