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
    const update = () => {
      const doc = document.documentElement;
      const max = doc.scrollHeight - window.innerHeight;
      const p = max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0;
      if (fillRef.current) fillRef.current.style.transform = `scaleY(${p})`;
    };
    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
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
