"use client";

import { useEffect, useRef, type CSSProperties, type ReactNode } from "react";

/**
 * InView — a light client wrapper that reflects whether its content is on-screen, so
 * perpetual CSS animations inside can pause when scrolled away instead of repainting for the
 * life of the page. It renders a plain <div> and toggles `data-inview="true"/"false"` on it
 * via a single IntersectionObserver; style the animated children off that flag, e.g.
 * `.thing { animation-play-state: paused } [data-inview="true"] .thing { animation-play-state: running }`.
 *
 * It starts "false" (paused), so first paint and the no-JS case show the resting state (the
 * 0% keyframe), and reduced-motion is handled the usual way in CSS (`animation: none`).
 */
export function InView({
  className,
  style,
  children,
  ariaHidden,
  threshold = 0,
}: {
  className?: string;
  style?: CSSProperties;
  children: ReactNode;
  ariaHidden?: boolean;
  threshold?: number;
}) {
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        el.dataset.inview = entry.isIntersecting ? "true" : "false";
      },
      { threshold },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [threshold]);

  return (
    <div ref={ref} className={className} style={style} aria-hidden={ariaHidden} data-inview="false">
      {children}
    </div>
  );
}
