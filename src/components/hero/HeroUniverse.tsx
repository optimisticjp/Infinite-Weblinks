"use client";

import { useLayoutEffect, useRef } from "react";
import { Megaphone, Monitor, Share2, Sparkles, TrendingUp, Users, type LucideIcon } from "lucide-react";
import type { HeroArea } from "@/lib/content/types";
import { loadGsap, prefersReducedMotion } from "@/lib/motion/motion";
import styles from "./HeroUniverse.module.css";

const ICONS: Record<string, LucideIcon> = {
  monitor: Monitor,
  megaphone: Megaphone,
  share: Share2,
  users: Users,
  trending: TrendingUp,
  sparkles: Sparkles,
};

// Node anchor positions in the SVG/overlay coordinate space (0–100), index-aligned
// to the six areas. Center of the infinity is (50, 52).
const POS = [
  { x: 19, y: 23 },
  { x: 81, y: 19 },
  { x: 8, y: 54 },
  { x: 92, y: 52 },
  { x: 27, y: 83 },
  { x: 73, y: 85 },
];
const C = { x: 50, y: 52 };

export function HeroUniverse({ areas }: { areas: HeroArea[] }) {
  const rootRef = useRef<HTMLDivElement | null>(null);

  useLayoutEffect(() => {
    const root = rootRef.current;
    if (!root || prefersReducedMotion()) return; // keep the complete static state

    const lines = Array.from(root.querySelectorAll<SVGPathElement>("[data-line]"));
    const nodes = Array.from(root.querySelectorAll<HTMLElement>("[data-node]"));
    const pulse = root.querySelector<SVGCircleElement>("[data-pulse]");

    // Hide the start state synchronously (before paint) so there is no flash of the
    // complete state before the intro animation runs.
    lines.forEach((l) => (l.style.strokeDashoffset = "1"));
    nodes.forEach((n) => (n.style.opacity = "0"));
    if (pulse) pulse.style.opacity = "0";

    let cancelled = false;
    let cleanup: (() => void) | undefined;

    loadGsap().then((mod) => {
      if (cancelled) return;
      if (!mod) {
        // No GSAP → reveal the complete state.
        lines.forEach((l) => (l.style.strokeDashoffset = "0"));
        nodes.forEach((n) => (n.style.opacity = ""));
        return;
      }
      const { gsap } = mod;
      const ctx = gsap.context(() => {
        const tl = gsap.timeline();
        // 2. Connection: draw the lines, then reveal the nodes.
        tl.to(lines, { strokeDashoffset: 0, duration: 0.9, stagger: 0.08, ease: "power2.out" })
          .to(nodes, { opacity: 1, duration: 0.5, stagger: 0.07, ease: "power1.out" }, "-=0.5")
          // 4. Rest: a calm ambient float on the nodes.
          .add(() => {
            gsap.to(nodes, {
              y: -6,
              duration: 3.2,
              ease: "sine.inOut",
              yoyo: true,
              repeat: -1,
              stagger: { each: 0.35, from: "random" },
            });
          });

        // 3. Activity: one light pulse travels a meaningful journey, one hop at a time.
        if (pulse) {
          const journey = [POS[1], C, POS[0], C, POS[4], C, POS[3], C]; // social→site→analytics→customer
          const pt = gsap.timeline({ repeat: -1, repeatDelay: 2.4, delay: 1.4 });
          pt.set(pulse, { opacity: 0, attr: { cx: C.x, cy: C.y } });
          journey.forEach((p, i) => {
            pt.to(pulse, { opacity: i === journey.length - 1 ? 0 : 0.95, duration: 0.25 }, i === 0 ? 0 : "<")
              .to(pulse, { attr: { cx: p.x, cy: p.y }, duration: 0.55, ease: "power1.inOut" });
          });
        }
      }, root);
      cleanup = () => ctx.revert();
    });

    return () => {
      cancelled = true;
      cleanup?.();
    };
  }, []);

  return (
    <div className={styles.universe} ref={rootRef} aria-hidden="true">
      <svg className={styles.svg} viewBox="0 0 100 100" preserveAspectRatio="xMidYMid meet">
        <defs>
          <linearGradient id="heroInf" x1="20" y1="70" x2="80" y2="34" gradientUnits="userSpaceOnUse">
            <stop offset="0" stopColor="#22D3EE" />
            <stop offset=".3" stopColor="#3B82F6" />
            <stop offset=".55" stopColor="#A855F7" />
            <stop offset=".8" stopColor="#F5197E" />
            <stop offset="1" stopColor="#FF7A18" />
          </linearGradient>
          <filter id="heroBlur" x="-60%" y="-60%" width="220%" height="220%">
            <feGaussianBlur stdDeviation="1.8" />
          </filter>
        </defs>

        {/* Connection lines from the centre to each area. */}
        <g className={styles.lines}>
          {POS.map((p, i) => (
            <path
              key={i}
              data-line
              d={`M${C.x} ${C.y} L${p.x} ${p.y}`}
              pathLength={1}
              className={styles.line}
            />
          ))}
        </g>

        {/* Glowing infinity (expressive hero interpretation of the mark). */}
        <g transform="translate(50 52) scale(0.66) translate(-50 -25)">
          <path
            d="M50 25 C62 6 96 6 96 25 C96 44 62 44 50 25 C38 6 4 6 4 25 C4 44 38 44 50 25 Z"
            fill="none"
            stroke="url(#heroInf)"
            strokeWidth="7"
            strokeLinecap="round"
            strokeLinejoin="round"
            filter="url(#heroBlur)"
            opacity="0.65"
          />
          <path
            d="M50 25 C62 6 96 6 96 25 C96 44 62 44 50 25 C38 6 4 6 4 25 C4 44 38 44 50 25 Z"
            fill="none"
            stroke="url(#heroInf)"
            strokeWidth="4.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </g>

        {/* Travelling signal. */}
        <circle data-pulse className={styles.pulse} cx={C.x} cy={C.y} r="1.5" />
      </svg>

      {/* Domain nodes (decorative; the six names are real text in the hero copy). */}
      {areas.map((area, i) => {
        const Icon = ICONS[area.icon] ?? Sparkles;
        return (
          <span
            key={area.key}
            data-node
            className={styles.node}
            style={{
              left: `${POS[i].x}%`,
              top: `${POS[i].y}%`,
              ["--node-color" as string]: area.color,
            }}
          >
            <Icon className={styles.nodeIcon} aria-hidden="true" />
          </span>
        );
      })}
    </div>
  );
}
