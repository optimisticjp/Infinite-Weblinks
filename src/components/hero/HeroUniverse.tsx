"use client";

import { useLayoutEffect, useRef } from "react";
import {
  Activity,
  Megaphone,
  Monitor,
  Send,
  ShoppingBag,
  Sparkles,
  TrendingUp,
  Users,
  Workflow,
  type LucideIcon,
} from "lucide-react";
import type { HeroArea } from "@/lib/content/types";
import { loadGsap, prefersReducedMotion } from "@/lib/motion/motion";
import styles from "./HeroUniverse.module.css";

const ICONS: Record<string, LucideIcon> = {
  monitor: Monitor,
  megaphone: Megaphone,
  users: Users,
  workflow: Workflow,
  trending: TrendingUp,
};

/**
 * Scene geometry in the SVG/overlay coordinate space (0–100). The universe box is a
 * square at every breakpoint, so these coordinates map linearly onto the HTML nodes'
 * `left`/`top` percentages — SVG paths and DOM nodes stay in lock-step.
 *
 * The centre of the mark (C) sits on the Signature Crossover — the pixel where one
 * strand passes under the other. Every connection curve and the travelling signal
 * pass through it, so light always travels through the point where two things connect.
 */
const C = { x: 50, y: 50 };
type Geo = { pos: { x: number; y: number }; d: string; dot: { x: number; y: number } };
const GEO: Record<string, Geo> = {
  website: { pos: { x: 50, y: 13 }, d: "M50 50 C 47 38 48 24 50 13", dot: { x: 48.6, y: 27 } },
  marketing: { pos: { x: 13, y: 37 }, d: "M50 50 C 38 44 24 39 13 37", dot: { x: 31, y: 41 } },
  customer: { pos: { x: 87, y: 37 }, d: "M50 50 C 62 44 76 39 87 37", dot: { x: 69, y: 41 } },
  automation: { pos: { x: 74, y: 80 }, d: "M50 50 C 58 61 67 72 74 80", dot: { x: 62, y: 66 } },
  analytics: { pos: { x: 26, y: 80 }, d: "M50 50 C 42 61 33 72 26 80", dot: { x: 38, y: 66 } },
};

// One light signal threads a meaningful sequence, passing back through the crossover (C)
// between every hop: promote → build → connect customers → measure.
const JOURNEY = [
  GEO.marketing.pos,
  C,
  GEO.website.pos,
  C,
  GEO.customer.pos,
  C,
  GEO.analytics.pos,
  C,
];

export function HeroUniverse({ areas }: { areas: HeroArea[] }) {
  const rootRef = useRef<HTMLDivElement | null>(null);

  useLayoutEffect(() => {
    const root = rootRef.current;
    if (!root || prefersReducedMotion()) return; // keep the complete static state

    const lines = Array.from(root.querySelectorAll<SVGPathElement>("[data-line], [data-line-m]"));
    const nodes = Array.from(root.querySelectorAll<HTMLElement>("[data-node], [data-ai]"));
    const cards = Array.from(root.querySelectorAll<HTMLElement>("[data-card]"));
    const pulse = root.querySelector<SVGCircleElement>("[data-pulse]");
    const mark = root.querySelector<SVGGElement>("[data-mark]");

    // Set the start state synchronously (before paint) so the scene never flashes complete
    // before the intro runs. Nodes and cards reveal via TRANSFORM only — never a text-opacity
    // fade: an accessibility scan samples a single frame, and compositing a mid-fade label's
    // colour dips it under 4.5:1. A transform reveal keeps every decorative label at full
    // contrast throughout.
    lines.forEach((l) => (l.style.strokeDashoffset = "1"));
    nodes.forEach((n) => (n.style.transform = "translateY(16px) scale(0.85)"));
    cards.forEach((c) => (c.style.transform = "translateY(12px)"));
    if (mark) mark.style.opacity = "0";

    // The complete static end-state — used when GSAP is absent OR fails to load, so a
    // chunk/network failure never leaves the decorative scene stuck mid-reveal.
    const revealStatic = () => {
      lines.forEach((l) => (l.style.strokeDashoffset = "0"));
      nodes.forEach((n) => (n.style.transform = ""));
      cards.forEach((c) => (c.style.transform = ""));
      if (mark) mark.style.opacity = "";
    };

    let cancelled = false;
    let cleanup: (() => void) | undefined;

    loadGsap()
      .then((mod) => {
        if (cancelled) return;
        if (!mod) {
          revealStatic();
          return;
        }
        const { gsap } = mod;
        const ambient: gsap.core.Animation[] = [];
        let visible = true;

        const ctx = gsap.context(() => {
          // Sequence: mark resolves → paths draw outward → nodes appear → cards settle.
          gsap.set("[data-mark]", { scale: 0.55, svgOrigin: "50 25" });
          const tl = gsap.timeline();
          tl.to("[data-mark]", { opacity: 1, scale: 1, svgOrigin: "50 25", duration: 0.8, ease: "power2.out" })
            .to(lines, { strokeDashoffset: 0, duration: 0.85, stagger: 0.07, ease: "power2.out" }, "-=0.35")
            .to(nodes, { y: 0, scale: 1, duration: 0.55, stagger: 0.06, ease: "power2.out" }, "-=0.5")
            .to(cards, { y: 0, duration: 0.5, stagger: 0.12, ease: "power2.out" }, "-=0.25")
            // Settle into ONE background ambient loop — the vortex. Foreground nodes and
            // cards stay put: ambient belongs in the background, and not every node pulses.
            .add(() => {
              const vortex = gsap.to("[data-vortex]", {
                rotation: 360,
                svgOrigin: "50 50",
                duration: 120,
                ease: "none",
                repeat: -1,
              });
              if (!visible) vortex.pause();
              ambient.push(vortex);
            });

          // The one signature motion: a light signal through the crossover. It animates a
          // transform (not cx/cy) so no filtered geometry re-rasterises per frame.
          if (pulse) {
            const pt = gsap.timeline({ repeat: -1, repeatDelay: 2.2, delay: 1.4 });
            pt.set(pulse, { opacity: 0, x: 0, y: 0 });
            JOURNEY.forEach((p, i) => {
              pt.to(
                pulse,
                { opacity: i === JOURNEY.length - 1 ? 0 : 0.95, duration: 0.22 },
                i === 0 ? 0 : "<",
              ).to(pulse, { x: p.x - C.x, y: p.y - C.y, duration: 0.5, ease: "power1.inOut" });
            });
            if (!visible) pt.pause();
            ambient.push(pt);
          }
        }, root);

        // Pause ambient loops while the hero is off-screen (they are the only expensive
        // repeating work). The intro is a one-shot and is left alone.
        const io = new IntersectionObserver(
          ([entry]) => {
            visible = entry.isIntersecting;
            ambient.forEach((t) => (visible ? t.resume() : t.pause()));
          },
          { threshold: 0 },
        );
        io.observe(root);

        cleanup = () => {
          io.disconnect();
          // The vortex loop is created inside a timeline .add() callback, which fires
          // after gsap.context() stops capturing — so ctx.revert() alone can't see it.
          // Kill every collected ambient tween explicitly (killing the in-context pulse
          // twice is a harmless no-op) so nothing keeps ticking on the unmounted subtree.
          ambient.forEach((t) => t.kill());
          ctx.revert();
        };
      })
      .catch(() => {
        // GSAP chunk failed to load → show the complete static scene, never a blank one.
        if (!cancelled) revealStatic();
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
          <radialGradient id="heroVortex" cx="50%" cy="50%" r="50%">
            <stop offset="0" stopColor="rgba(168,85,247,0.30)" />
            <stop offset="55%" stopColor="rgba(109,40,217,0.10)" />
            <stop offset="100%" stopColor="rgba(10,7,21,0)" />
          </radialGradient>
          <radialGradient id="heroCross" cx="50%" cy="50%" r="50%">
            <stop offset="0" stopColor="rgba(255,255,255,0.92)" />
            <stop offset="42%" stopColor="rgba(255,120,180,0.5)" />
            <stop offset="100%" stopColor="rgba(255,120,180,0)" />
          </radialGradient>
          <radialGradient id="heroEarth" cx="34%" cy="30%" r="82%">
            <stop offset="0" stopColor="rgba(59,130,246,0.42)" />
            <stop offset="45%" stopColor="rgba(30,58,138,0.30)" />
            <stop offset="100%" stopColor="rgba(7,5,15,0)" />
          </radialGradient>
          <radialGradient id="heroPulse" cx="50%" cy="50%" r="50%">
            <stop offset="0" stopColor="rgba(255,255,255,0.95)" />
            <stop offset="45%" stopColor="rgba(255,120,180,0.55)" />
            <stop offset="100%" stopColor="rgba(255,120,180,0)" />
          </radialGradient>
          {/* One bloom pass around the mark (the section's only glow filter). */}
          <filter id="heroBloom" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="2.6" />
          </filter>
        </defs>

        {/* Central vortex (behind the mark). */}
        <g className={styles.vortex}>
          <circle cx="50" cy="50" r="34" fill="url(#heroVortex)" />
          <g data-vortex className={styles.vortexRings}>
            <ellipse cx="50" cy="50" rx="9" ry="8" />
            <ellipse cx="50" cy="50" rx="16" ry="14" />
            <ellipse cx="50" cy="50" rx="23" ry="20" />
            <ellipse cx="50" cy="50" rx="30" ry="26" />
          </g>
        </g>

        {/* Restrained Earth horizon, lower-right (clipped by the square). */}
        <g className={styles.earth}>
          <circle cx="98" cy="115" r="44" fill="url(#heroEarth)" />
          <path className={styles.earthRim} d="M55 85 A44 44 0 0 1 85 55" />
        </g>

        {/* Dotted orbit paths. */}
        <g className={styles.orbits}>
          <ellipse className={styles.orbit} cx="50" cy="50" rx="38" ry="35" />
          <ellipse className={`${styles.orbit} ${styles.orbitInner}`} cx="50" cy="50" rx="24" ry="22" />
        </g>

        {/* Desktop network — curved connections, connector points, AI links. */}
        <g className={styles.desktopNet}>
          {areas.map((a) =>
            GEO[a.key] ? (
              <path key={a.key} data-line className={styles.line} d={GEO[a.key].d} pathLength={1} />
            ) : null,
          )}
          {areas.map((a) =>
            GEO[a.key] ? (
              <circle
                key={`${a.key}-dot`}
                className={styles.connDot}
                cx={GEO[a.key].dot.x}
                cy={GEO[a.key].dot.y}
                r="0.9"
              />
            ) : null,
          )}
          {/* AI joins as a secondary connection between automation and analytics. */}
          <path className={styles.aiLink} d="M74 80 C 65 86 58 88 50 88" />
          <path className={styles.aiLink} d="M26 80 C 35 86 42 88 50 88" />
        </g>

        {/* Mobile network — one simple path sequence. */}
        <g className={styles.mobileNet}>
          <path data-line-m className={styles.line} d="M50 50 C 49 38 49 24 50 12" pathLength={1} />
          <path data-line-m className={styles.line} d="M50 50 C 42 60 32 72 24 80" pathLength={1} />
          <path data-line-m className={styles.line} d="M50 50 C 58 60 68 72 76 80" pathLength={1} />
        </g>

        {/* Crossover core glow — sits BEHIND the mark so the mask's cut reveals it: the
            crossover literally glows through the point where the strands connect. */}
        <circle className={styles.crossGlow} cx="50" cy="50" r="7" fill="url(#heroCross)" />

        {/* The Signature Crossover mark (reused from the global BrandSprite symbol), with
            a single bloom pass so it owns the brightest value in the section. */}
        <g transform="translate(15 32.5) scale(0.7)">
          <g data-mark className={styles.mark}>
            <use href="#iw-infinity" width="100" height="50" className={styles.markBloom} />
            <use href="#iw-infinity" width="100" height="50" className={styles.markSharp} />
          </g>
        </g>

        {/* Travelling signal — a soft gradient dot (no filter, so moving it never
            re-rasterises a blur). */}
        <circle data-pulse className={styles.pulse} cx="50" cy="50" r="2.4" fill="url(#heroPulse)" />
      </svg>

      {/* Domain nodes (decorative; the five names are real text in the hero copy). Labels
          are real HTML — never baked into an image. */}
      {areas.map((area) => {
        if (!GEO[area.key]) return null;
        const Icon = ICONS[area.icon] ?? Sparkles;
        return (
          <div
            key={area.key}
            className={`${styles.node} ${styles[area.key] ?? ""}`}
            style={{ ["--node-color" as string]: area.color }}
          >
            <span className={styles.nodeInner} data-node>
              <span className={styles.nodeTile}>
                <Icon className={styles.nodeIcon} aria-hidden="true" />
              </span>
              <span className={styles.nodeLabel}>{area.label}</span>
            </span>
          </div>
        );
      })}

      {/* AI — a secondary connection, not a sixth bright node. */}
      <div className={`${styles.node} ${styles.ai}`}>
        <span className={styles.aiInner} data-ai>
          <span className={styles.aiTile}>
            <Sparkles className={styles.aiIcon} aria-hidden="true" />
          </span>
          <span className={styles.aiLabel}>AI</span>
        </span>
      </div>

      {/* Two floating interface cards — generic system states, never business metrics. */}
      <div className={`${styles.card} ${styles.cardTop}`} data-card>
        <Send className={styles.cardIcon} aria-hidden="true" />
        <span className={styles.cardText}>Campaign ready</span>
      </div>
      <div className={`${styles.card} ${styles.cardBottom}`} data-card>
        <Activity className={styles.cardIcon} aria-hidden="true" />
        <span className={styles.cardText}>Tracking active</span>
      </div>
      <div className={`${styles.card} ${styles.cardMid}`} data-card>
        <ShoppingBag className={styles.cardIcon} aria-hidden="true" />
        <span className={styles.cardText}>Order synced</span>
      </div>
    </div>
  );
}
