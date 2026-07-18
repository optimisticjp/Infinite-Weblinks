"use client";

import { useLayoutEffect, useRef, type ElementType, type ReactNode } from "react";
import { prefersReducedMotion } from "@/lib/motion/motion";
import styles from "./Reveal.module.css";

type RevealProps = {
  children: ReactNode;
  /** Element to render (default div). Use "li"/"section" etc. to keep semantics correct. */
  as?: ElementType;
  className?: string;
  /** Stagger delay in ms (for sequenced cards). */
  delay?: number;
  /** Vertical pre-reveal shift in px (transform only — never opacity, so text keeps full contrast). */
  shift?: number;
  /** Reveal once and stop observing (default true). */
  once?: boolean;
};

/**
 * Restrained scroll reveal (brief §P5-02/03/04, review §13.D).
 *
 * Design guarantees:
 *  - **Static-complete by default.** The server/no-JS/reduced-motion render shows the final
 *    state — no transform, no hidden content, fully indexable and readable.
 *  - **Transform only, never opacity on text.** Content is always fully opaque; it only
 *    translates a few px, so a single-frame axe/contrast scan can never catch a faded label
 *    (mirrors the HeroUniverse rule).
 *  - **Reduced-motion gated.** `prefersReducedMotion()` short-circuits to the complete state.
 *  - **Offscreen-cheap + cleaned up.** One IntersectionObserver per element, disconnected
 *    after the reveal; CSS transition does the work (no GSAP on the critical path).
 *  - **Mobile-simpler.** The CSS halves the shift/duration under 600px.
 */
export function Reveal({
  children,
  as,
  className,
  delay = 0,
  shift = 16,
  once = true,
}: RevealProps) {
  const Tag = (as ?? "div") as ElementType;
  const ref = useRef<HTMLElement | null>(null);

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el || prefersReducedMotion()) return;

    // Apply the pre-reveal state synchronously, before paint, so there is no flash of the
    // final position followed by a jump.
    el.style.setProperty("--reveal-shift", `${shift}px`);
    if (delay) el.style.setProperty("--reveal-delay", `${delay}ms`);
    el.dataset.animate = "true";

    let cancelled = false;
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            el.dataset.visible = "true";
            if (once) {
              observer.disconnect();
              return;
            }
          } else if (!once) {
            el.dataset.visible = "false";
          }
        }
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.08 },
    );

    // If it is already in view on mount, reveal on the next frame (avoids a 0-duration jump).
    requestAnimationFrame(() => {
      if (!cancelled) observer.observe(el);
    });

    return () => {
      cancelled = true;
      observer.disconnect();
    };
  }, [delay, shift, once]);

  return (
    <Tag ref={ref} className={[styles.reveal, className].filter(Boolean).join(" ")}>
      {children}
    </Tag>
  );
}
