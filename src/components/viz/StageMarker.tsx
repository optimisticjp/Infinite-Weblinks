import styles from "./StageMarker.module.css";

export type MarkerStage = { slug: string; name: string };

type StageMarkerProps = {
  stages: MarkerStage[];
  activeSlug: string;
  hue: string;
  className?: string;
};

/**
 * StageMarker — a compact "where this sits" indicator: the eight growth-journey stages as a
 * dotted connector with the current domain's stage lit in its hue. The dots are decorative
 * (aria-hidden); the text label carries the meaning ("Stage N of 8 ... <stage name>"), so
 * the context is available to screen readers without depending on colour.
 */
export function StageMarker({ stages, activeSlug, hue, className }: StageMarkerProps) {
  const index = stages.findIndex((s) => s.slug === activeSlug);
  const active = index >= 0 ? stages[index] : undefined;

  return (
    <div className={[styles.marker, className].filter(Boolean).join(" ")} style={{ ["--marker-hue" as string]: hue }}>
      <p className={styles.label}>
        <span className={styles.labelKey}>Where this sits</span>
        {active ? (
          <span>
            Stage {index + 1} of {stages.length} in the growth journey:{" "}
            <span className={styles.activeName}>{active.name}</span>
          </span>
        ) : (
          <span>Part of the growth journey</span>
        )}
      </p>
      <ol className={styles.dots} aria-hidden="true">
        {stages.map((s, i) => (
          <li
            key={s.slug}
            className={[styles.dot, i === index ? styles.active : i < index ? styles.done : ""]
              .filter(Boolean)
              .join(" ")}
          />
        ))}
      </ol>
    </div>
  );
}
