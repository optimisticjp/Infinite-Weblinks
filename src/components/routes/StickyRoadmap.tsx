import type { CSSProperties } from "react";
import { Route } from "lucide-react";
import { Panel } from "@/components/primitives/Panel";
import { IconTile } from "@/components/primitives/IconTile";
import { domainInk } from "@/lib/design/domainColor";
import { roadmaps } from "@/lib/content/data/roadmaps";
import { stages } from "@/lib/content/data/stages";
import { RoadmapSync } from "./RoadmapSync";
import styles from "./StickyRoadmap.module.css";

/**
 * StickyRoadmap — a product-surface mockup of a Growth Roadmap. Wired to the real roadmap content
 * (src/lib/content/data/roadmaps): one representative roadmap's phases, each resolved to its growth
 * stage (for the stage name and wayfinding colour) from the stages data — never hard-coded, so it
 * stays correct as the roadmap content changes.
 *
 * The sticky pattern: on desktop the node panel PINS with `position: sticky` while the stage text
 * scrolls past, and the node matching the centred stage lights up (driven by IntersectionObserver in
 * the thin <RoadmapSync> client wrapper). No scroll-hijack library, so it survives keyboard nav and
 * reduced motion for free, and it degrades to a normal stacked layout when the viewport is too short
 * to pin against. Below ~960px the panel does not pin — it sits above the stages as a static element.
 * Server Component; only the active-stage sync is client.
 */

const ROADMAP = roadmaps.find((r) => r.slug === "ecommerce") ?? roadmaps[0];
const STAGE_BY_SLUG = new Map(stages.map((s) => [s.slug, s] as const));

const PHASES = ROADMAP.phases.map((phase, index) => {
  const stage = STAGE_BY_SLUG.get(phase.stageSlug);
  return {
    index,
    title: phase.title,
    summary: phase.summary,
    stageName: stage?.name ?? phase.title,
    ink: domainInk(stage?.color ?? "var(--domain-strategy)"),
  };
});

export function StickyRoadmap() {
  return (
    <div className={styles.section}>
      <RoadmapSync className={styles.roadmap}>
        {/* Left column: the section heading fills the top, then the node panel PINS below it — so
            the column is no longer mostly-empty beside the tall stage list. */}
        <div className={styles.panelCol}>
          <header className={styles.intro}>
            <p className={styles.eyebrow}>How it works</p>
            <h2 className={styles.name}>{ROADMAP.name}</h2>
            <p className={styles.lead}>{ROADMAP.intro}</p>
          </header>
          <div className={styles.sticky}>
            <Panel className={styles.panel}>
              <div className={styles.panelHead}>
                <IconTile color="var(--v2-brand-strong)" size="sm">
                  <Route aria-hidden="true" />
                </IconTile>
                <h3 className={styles.panelTitle}>Connected roadmap</h3>
                <span className={styles.panelTag}>{PHASES.length} stages</span>
              </div>
              <ol className={styles.nodes}>
                {PHASES.map((p) => (
                  <li
                    key={p.index}
                    className={styles.node}
                    data-roadmap-node={p.index}
                    style={{ ["--node-ink" as string]: p.ink } as CSSProperties}
                  >
                    <span className={styles.nodeRail} aria-hidden="true">
                      <span className={styles.nodeDot} />
                    </span>
                    <span className={styles.nodeBody}>
                      <span className={styles.nodeName}>{p.stageName}</span>
                      <span className={styles.nodeDesc}>{p.title}</span>
                    </span>
                    <span className={styles.nodeStage}>Stage {p.index + 1}</span>
                  </li>
                ))}
              </ol>
            </Panel>
          </div>
        </div>

        <ol className={styles.blocks}>
          {PHASES.map((p) => (
            <li
              key={p.index}
              className={styles.block}
              data-roadmap-block={p.index}
              style={{ ["--block-ink" as string]: p.ink } as CSSProperties}
            >
              <p className={styles.blockKicker}>
                Stage {p.index + 1} · {p.stageName}
              </p>
              <h3 className={styles.blockTitle}>{p.title}</h3>
              <p className={styles.blockBody}>{p.summary}</p>
            </li>
          ))}
        </ol>
      </RoadmapSync>
    </div>
  );
}
