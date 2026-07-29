import { SectionShell } from "@/components/sections/SectionShell";
import { StickyRoadmap } from "@/components/routes/StickyRoadmap";
import styles from "./HomepageConnectedSystemSection.module.css";

/**
 * HomepageConnectedSystemSection — the homepage "how it connects" slot (id="how-it-connects"), now
 * the V3 sticky Growth Roadmap. StickyRoadmap is the reused product-surface mockup wired to the real
 * roadmap content (src/lib/content/data/roadmaps): on desktop the node panel PINS with position:
 * sticky while the stage text scrolls past and the active stage lights up; below ~960px it degrades
 * to a static stacked layout. It replaces the old five-part flow + three onward bridge cards.
 *
 * The section owns the deep-alt band, the id anchor (with a scroll offset that clears the sticky
 * header) and the container; StickyRoadmap supplies its own intro heading and the pinned layout.
 * Server Component — only the active-stage sync inside StickyRoadmap is a thin client wrapper.
 */
export function HomepageConnectedSystemSection() {
  return (
    <SectionShell surface="alt" id="how-it-connects" ariaLabel="How your growth connects" className={styles.section}>
      <StickyRoadmap />
    </SectionShell>
  );
}
