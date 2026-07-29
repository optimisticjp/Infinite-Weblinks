"use client";

import { useEffect, useRef, type ReactNode } from "react";

/**
 * RevealOnView — a thin client wrapper that drives a scroll-in reveal without owning any content.
 * The SERVER component supplies the markup (children marked with a `.revealItem` class); this only
 * sets two data attributes the consumer's CSS keys off, so the whole panel stays a server component.
 *
 * The attributes are presentation-only, so they are set imperatively on the ref (no React state, no
 * re-render). Progressive-enhancement + reduced-motion safe:
 *   - No JS: neither attribute is set, so the CSS default keeps every item VISIBLE.
 *   - JS on: `data-animate` is set on mount; if the block is already in view it reveals in the same
 *     tick (no flash), otherwise `data-revealed` is set once it scrolls into view.
 *   - prefers-reduced-motion: the consumer's CSS forces the visible static state regardless.
 */
export function RevealOnView({ children, className }: { children: ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    // Opt into the hide→reveal only once JS runs, so a no-JS render keeps content visible.
    el.setAttribute("data-animate", "");
    const reveal = () => el.setAttribute("data-revealed", "");

    const rect = el.getBoundingClientRect();
    const alreadyInView = rect.top < window.innerHeight && rect.bottom > 0;
    if (typeof IntersectionObserver === "undefined" || alreadyInView) {
      reveal(); // above the fold → reveal in the same tick, no hide flash
      return;
    }

    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            reveal();
            io.disconnect();
            break;
          }
        }
      },
      { threshold: 0.2, rootMargin: "0px 0px -8% 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}
