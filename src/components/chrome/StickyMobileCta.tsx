"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import styles from "./StickyMobileCta.module.css";

/**
 * Sticky mobile CTA (brief §P1-03, review §6/§11).
 *
 * A persistent "Build My Growth Plan" affordance for the long mobile scroll. Behaviour:
 *  - Appears only after the hero/first viewport has scrolled away (not on first paint).
 *  - Hides again when the final CTA banner or the footer is in view, so it never doubles up
 *    with the closing CTA or covers the footer legal links.
 *  - Mobile only — CSS hides it at the header's desktop breakpoint (≥1160px).
 *  - Rendered as a layout sibling OUTSIDE any backdrop-filter ancestor (the header/nav create
 *    containing blocks that would trap a fixed element), and only in the (marketing) group —
 *    the convert routes (builder/contact/troubleshooter) already *are* the conversion surface.
 *  - Reduced-motion: the slide is a transform transition, which the global reduced-motion rule
 *    collapses to an instant show; the CTA is always fully opaque (no faded text).
 *  - a11y: when hidden it is `inert` + aria-hidden (out of tab order and the AT tree) and does
 *    not intercept taps (`pointer-events: none`).
 */
export function StickyMobileCta() {
  const [visible, setVisible] = useState(false);

  const pastHero = useRef(false);
  const bottomInView = useRef(false);

  useEffect(() => {
    const update = () => setVisible(pastHero.current && !bottomInView.current);

    const onScroll = () => {
      // "after the hero CTA has left the viewport" — a viewport-ish of scroll clears it.
      pastHero.current = window.scrollY > Math.min(window.innerHeight * 0.8, 620);
      update();
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });

    // Hide near the closing CTA / footer.
    const bottoms = [
      document.getElementById("get-started"),
      document.querySelector("footer"),
    ].filter(Boolean) as Element[];

    const intersecting = new Set<Element>();
    const io = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) intersecting.add(entry.target);
        else intersecting.delete(entry.target);
      }
      bottomInView.current = intersecting.size > 0;
      update();
    });
    bottoms.forEach((el) => io.observe(el));

    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      io.disconnect();
    };
  }, []);

  return (
    <div
      className={[styles.bar, visible ? styles.visible : ""].filter(Boolean).join(" ")}
      inert={!visible}
      aria-hidden={!visible}
    >
      <Link href="/growth-plan" className={styles.cta}>
        Build My Growth Plan
        <ArrowRight aria-hidden="true" className={styles.icon} />
      </Link>
    </div>
  );
}
