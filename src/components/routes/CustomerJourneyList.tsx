import type { CSSProperties } from "react";
import { IconTile } from "@/components/primitives/IconTile";
import { Icon } from "@/components/primitives/Icon";
import { domainInk } from "@/lib/design/domainColor";
import type { CustomerJourneyStep } from "@/lib/content/types";
import styles from "./CustomerJourneyList.module.css";

/** Screen-kind → a representative static glyph (decorative; the phase title carries the meaning). */
const KIND_ICON: Record<CustomerJourneyStep["screen"]["kind"], string> = {
  social: "megaphone",
  store: "monitor",
  product: "shopping-bag",
  message: "mail",
  confirmation: "check",
  loyalty: "heart",
};

/**
 * CustomerJourneyList — one illustrative customer's path across the connected system, as a
 * semantic ordered list of restrained light cards (NOT a horizontal phone strip). Each step shows
 * a compact sequence marker, a flat IconTile phase marker, the phase title (H3), the caption, and a
 * clearly-labelled illustrative touchpoint (a generic screen heading + its lines in source order).
 * No PhoneFrame, fake device chrome, active item, InfinityMark end marker, animated path, price,
 * metric, client logo or result. Vertical on mobile, two columns on wider screens where the full
 * content still reads; no horizontal scroller and no interaction required. Server-safe;
 * understandable with CSS disabled.
 */
export function CustomerJourneyList({ steps }: { steps: CustomerJourneyStep[] }) {
  return (
    <ol className={styles.list}>
      {steps.map((step) => {
        const ink = domainInk(step.color);
        return (
          <li
            key={step.order}
            className={styles.step}
            style={{ ["--step-ink" as string]: ink } as CSSProperties}
          >
            <div className={styles.head}>
              <span className={styles.marker} aria-hidden="true">
                {String(step.order).padStart(2, "0")}
              </span>
              <IconTile color={ink} size="md">
                <Icon name={KIND_ICON[step.screen.kind]} />
              </IconTile>
            </div>

            <h3 className={styles.phase}>{step.phase}</h3>
            <p className={styles.caption}>{step.caption}</p>

            <div className={styles.touchpoint}>
              <p className={styles.touchpointLabel}>Illustrative touchpoint</p>
              <p className={styles.screenHeading}>{step.screen.heading}</p>
              {step.screen.lines && step.screen.lines.length > 0 ? (
                <ul className={styles.screenLines}>
                  {step.screen.lines.map((line) => (
                    <li key={line} className={styles.screenLine}>
                      {line}
                    </li>
                  ))}
                </ul>
              ) : null}
            </div>
          </li>
        );
      })}
    </ol>
  );
}
