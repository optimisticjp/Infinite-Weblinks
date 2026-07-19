"use client";

import { useEffect, useRef } from "react";
import styles from "./ScrollThread.module.css";

/**
 * ScrollThread — a thin page-long thread down the left edge that fills as the page scrolls,
 * tinted in the domain hue. Purely decorative (aria-hidden) and desktop-only, so it never
 * competes for space on a phone. It reflects the reader's own scroll position (not an
 * autonomous animation), and the fill follows instantly with no easing.
 */
export function ScrollThread({ hue, className }: { hue: string; className?: string }) {
  const fillRef = useRef<HTMLSpanElement | null>(null);

  useEffect(() => {
    // Desktop-only (the thread is display:none under 1024px). Attach the scroll work only
    // when the media query matches, so phones never pay for a listener driving a hidden node.
    const mq = window.matchMedia("(min-width: 1024px)");
    let raf = 0;
    let ticking = false;
    // Cache the scrollable range and recompute it on resize only, never inside the scroll
    // handler, so reading scrollHeight can't force a synchronous reflow on every scroll tick.
    let max = 0;

    const measure = () => {
      max = document.documentElement.scrollHeight - window.innerHeight;
    };
    const apply = () => {
      ticking = false;
      const p = max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0;
      if (fillRef.current) fillRef.current.style.transform = `scaleY(${p})`;
    };
    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      raf = requestAnimationFrame(apply);
    };
    const onResize = () => {
      measure();
      onScroll();
    };

    let attached = false;
    const attach = () => {
      if (attached) return;
      attached = true;
      measure();
      apply();
      window.addEventListener("scroll", onScroll, { passive: true });
      window.addEventListener("resize", onResize);
    };
    const detach = () => {
      if (!attached) return;
      attached = false;
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
      cancelAnimationFrame(raf);
    };

    const sync = () => (mq.matches ? attach() : detach());
    sync();
    mq.addEventListener("change", sync);
    return () => {
      mq.removeEventListener("change", sync);
      detach();
    };
  }, []);

  return (
    <div
      className={[styles.thread, className].filter(Boolean).join(" ")}
      style={{ ["--thread-hue" as string]: hue }}
      aria-hidden="true"
    >
      <span ref={fillRef} className={styles.fill} />
    </div>
  );
}
