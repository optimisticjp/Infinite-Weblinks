"use client";

import { useEffect, useId, useRef } from "react";
import { prefersReducedMotion } from "@/lib/motion/motion";
import styles from "./ConnectorPath.module.css";

type ConnectorPathProps = {
  /** SVG path drawn in the given viewBox. Defaults to a gentle horizontal wave. */
  d?: string;
  /** viewBox dimensions. Height is small for a thin connector. */
  width?: number;
  height?: number;
  /** Stroke gradient stops (domain hues). `via` is optional. */
  from?: string;
  via?: string;
  to?: string;
  /** Number of travelling light sparks (0 disables them). */
  dots?: number;
  strokeWidth?: number;
  /** Draw the lit path in on scroll (default true). Resting state is always fully drawn. */
  draw?: boolean;
  className?: string;
};

/**
 * ConnectorPath — the recurring "everything connects" device: a faint track with a lit
 * gradient path that draws in when it scrolls into view, plus travelling light sparks that
 * run along it. Purely decorative (aria-hidden). Guards that keep it honest and cheap:
 *  - the resting state is the fully-drawn path, so reduced-motion and no-JS both show the
 *    completed connection (only the draw-in and the sparks are gated behind a motion pref);
 *  - the draw-in triggers once, when the element first enters the viewport, and stays drawn;
 *  - the travelling spark (an animated dashoffset on a single stroked path) only runs while
 *    the connector is on-screen — the observer stays live and pauses it when scrolled away,
 *    so nothing keeps repainting off-screen.
 */
export function ConnectorPath({
  d = "M0 12 C 22 2, 40 22, 62 12 S 92 8, 100 12",
  width = 100,
  height = 24,
  from = "var(--domain-strategy)",
  via = "var(--domain-convert)",
  to = "var(--domain-operate)",
  dots = 2,
  strokeWidth = 1.4,
  draw = true,
  className,
}: ConnectorPathProps) {
  const gradId = useId().replace(/:/g, "");
  const rootRef = useRef<HTMLSpanElement | null>(null);

  useEffect(() => {
    const el = rootRef.current;
    if (!el || !draw || prefersReducedMotion()) return;
    // Stay observing for the life of the element: the draw-in fires once (data-drawn, never
    // unset), while the travelling spark only runs (data-running) while on-screen, so its
    // per-frame dashoffset repaint is paused the moment the connector scrolls out of view.
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.dataset.drawn = "true";
          el.dataset.running = "true";
        } else {
          delete el.dataset.running;
        }
      },
      { threshold: 0.2 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [draw]);

  // Sparks: N short dashes evenly spaced along a pathLength of 1, animated by translating
  // dashoffset one slot so the pattern loops seamlessly.
  const slot = dots > 0 ? 1 / dots : 1;
  const sparkLen = 0.02;
  const sparkStyle =
    dots > 0
      ? ({
          strokeDasharray: `${sparkLen} ${slot - sparkLen}`,
          // Negative one-slot shift so the dash pattern loops seamlessly.
          ["--spark-shift" as string]: `${-slot}`,
        } as React.CSSProperties)
      : undefined;

  return (
    <span
      ref={rootRef}
      className={[styles.wrap, className].filter(Boolean).join(" ")}
      aria-hidden="true"
    >
      <svg
        className={styles.svg}
        viewBox={`0 0 ${width} ${height}`}
        preserveAspectRatio="none"
        fill="none"
      >
        <defs>
          <linearGradient
            id={`conn-${gradId}`}
            x1="0"
            y1="0"
            x2={width}
            y2="0"
            gradientUnits="userSpaceOnUse"
          >
            <stop offset="0" stopColor={from} />
            {via ? <stop offset="0.5" stopColor={via} /> : null}
            <stop offset="1" stopColor={to} />
          </linearGradient>
        </defs>
        <path className={styles.track} d={d} strokeWidth={strokeWidth} strokeLinecap="round" />
        <path
          className={styles.lit}
          d={d}
          stroke={`url(#conn-${gradId})`}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          pathLength={1}
        />
        {dots > 0 ? (
          <path
            className={styles.spark}
            d={d}
            strokeWidth={strokeWidth + 0.6}
            strokeLinecap="round"
            pathLength={1}
            style={sparkStyle}
          />
        ) : null}
      </svg>
    </span>
  );
}
