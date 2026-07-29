import type { CSSProperties, ReactNode } from "react";
import styles from "./FloatingCard.module.css";

type FloatingCardProps = {
  children: ReactNode;
  /** Root element. Default "div"; use "aside" when it's a complementary annotation beside a Panel. */
  as?: "div" | "aside";
  className?: string;
  style?: CSSProperties;
};

/**
 * FloatingCard — a small card that overlaps a Panel at a HIGHER depth.
 *
 * It reads as floating above the panel because it sits on a lighter surface (`--surface-raised-2`,
 * one step up from the Panel's `--surface-raised`) with a deeper shadow and the `--edge-top`
 * highlight. On dark, lighter + a bigger shadow reads as closer — that layered-depth cue is what
 * makes a composition feel like a real interface rather than a stack of flat cards.
 *
 * It renders only the card; POSITIONING is the caller's job — place it absolutely inside a
 * `position: relative` Panel wrapper, offset past an edge, to get the overlap. Semantic tokens only
 * (with hue-free box-shadow fallbacks), so it re-themes and stays valid off a V3 surface.
 */
export function FloatingCard({ children, as: Tag = "div", className, style }: FloatingCardProps) {
  return (
    <Tag className={[styles.floatingCard, className].filter(Boolean).join(" ")} style={style}>
      {children}
    </Tag>
  );
}
