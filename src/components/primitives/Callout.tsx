import type { CSSProperties, ReactNode } from "react";
import { Info, TriangleAlert } from "lucide-react";
import styles from "./Callout.module.css";

type Tone = "neutral" | "information" | "warning";

type CalloutProps = {
  children: ReactNode;
  /** Meaning tone. Colour is only a reinforcement — the icon and the copy carry the meaning. */
  tone?: Tone;
  /** Optional bold lead line above the body. */
  title?: ReactNode;
  /** Override the default per-tone icon (decorative). Pass null to omit the icon entirely. */
  icon?: ReactNode;
  /**
   * ARIA role. Defaults to `note` — a passive aside, NOT an alert. Only pass `alert`/`status`
   * when the message is a genuine live region the user must be told about immediately.
   */
  role?: string;
  className?: string;
  style?: CSSProperties;
};

const DEFAULT_ICON: Record<Tone, ReactNode> = {
  neutral: <Info aria-hidden="true" />,
  information: <Info aria-hidden="true" />,
  warning: <TriangleAlert aria-hidden="true" />,
};

/**
 * Callout — a restrained inline notice for context, information or a caution. It reads as a
 * passive note by default (role="note", never an alert), with meaning carried by its icon and
 * copy, not colour alone. Tones map to the V2 semantic tokens (a soft tint + accessible ink);
 * no raw colours, no glow, no oversized illustration. The icon and text wrap cleanly on narrow
 * screens.
 */
export function Callout({
  children,
  tone = "neutral",
  title,
  icon,
  role = "note",
  className,
  style,
}: CalloutProps) {
  const glyph = icon === undefined ? DEFAULT_ICON[tone] : icon;
  return (
    <div role={role} className={[styles.callout, styles[tone], className].filter(Boolean).join(" ")} style={style}>
      {glyph ? (
        <span className={styles.icon} aria-hidden="true">
          {glyph}
        </span>
      ) : null}
      <div className={styles.body}>
        {title ? <p className={styles.title}>{title}</p> : null}
        <div className={styles.content}>{children}</div>
      </div>
    </div>
  );
}
