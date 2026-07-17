import { Button } from "@/components/primitives/Button";
import { Icon } from "@/components/primitives/Icon";
import { IconTile } from "@/components/primitives/IconTile";
import { SectionHeader } from "@/components/primitives/SectionHeader";
import { getValueProps } from "@/lib/content";
import styles from "./WhyInfiniteWeblinksSection.module.css";

/**
 * WhyInfiniteWeblinksSection — "A partner for your long-term growth" (theme-dark, ref 11).
 * A restrained, icon-led grid: the six value props read as a clean point-by-point argument,
 * not a glowing SaaS feature wall. No invented awards, stats or client counts — only what
 * the value props actually say.
 */
export async function WhyInfiniteWeblinksSection({ anchorId }: { anchorId?: string }) {
  const valueProps = await getValueProps();
  if (valueProps.length === 0) return null;

  return (
    <section
      id={anchorId}
      className="theme-dark iw-section"
      aria-labelledby="why-us-heading"
    >
      <div className="iw-container">
        <SectionHeader
          id="why-us-heading"
          eyebrow="Why Infinite Weblinks"
          title="A partner for your long-term growth"
          intro="Not a longer feature list — a different way of thinking about the work, so every part is built to support the next."
          aside={
            <Button href="/about" variant="secondary" size="sm">
              About Infinite Weblinks
            </Button>
          }
        />

        <ul className={styles.grid}>
          {valueProps.map((vp) => (
            <li key={vp.title} className={styles.item}>
              <IconTile color={vp.color} variant="outline" size={48}>
                <Icon name={vp.icon} />
              </IconTile>
              <h3 className={styles.title}>{vp.title}</h3>
              <p className={styles.body}>{vp.body}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
