"use client";

import { useEffect, useRef, type ReactNode } from "react";

/**
 * RoadmapSync — the thin client layer for the sticky roadmap. It keeps the SERVER-rendered markup
 * intact and only lights up the node matching whichever stage text block is centred in the viewport.
 *
 * The active stage is driven by IntersectionObserver on the `[data-roadmap-block]` text blocks — NOT
 * by scroll-position arithmetic, which breaks under browser zoom and on iOS as the address bar
 * collapses. A block is "active" while it sits in a thin band across the viewport centre (rootMargin
 * -45%/-45%); the observer toggles `data-active` on the matching `[data-roadmap-node]`, and the CSS
 * owns the treatment. Attributes are set imperatively on the ref subtree, so no React state and no
 * re-render — the whole roadmap stays a server component.
 *
 * prefers-reduced-motion: there is no scroll-driven progression to follow, so the observer is not
 * started; the CSS shows every node in its active treatment simultaneously.
 */
export function RoadmapSync({ children, className }: { children: ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = ref.current;
    if (!root) return;
    const blocks = Array.from(root.querySelectorAll<HTMLElement>("[data-roadmap-block]"));
    const nodes = Array.from(root.querySelectorAll<HTMLElement>("[data-roadmap-node]"));
    if (blocks.length === 0 || nodes.length === 0) return;

    const setActive = (index: number) => {
      for (const node of nodes) node.toggleAttribute("data-active", Number(node.dataset.roadmapNode) === index);
    };

    // Reduced motion (or no IO): the CSS shows every stage active at once — don't drive a progression.
    const reduced = typeof matchMedia !== "undefined" && matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced || typeof IntersectionObserver === "undefined") return;

    setActive(0); // first stage active until the reader scrolls into the next one

    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) setActive(Number((entry.target as HTMLElement).dataset.roadmapBlock));
        }
      },
      { rootMargin: "-45% 0px -45% 0px", threshold: 0 },
    );
    for (const block of blocks) io.observe(block);
    return () => io.disconnect();
  }, []);

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}
