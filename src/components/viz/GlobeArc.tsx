import styles from "./GlobeArc.module.css";

/**
 * GlobeArc — the restrained lit-Earth horizon that hugs the bottom of the dark cosmic
 * sections (refs 02, 07, 12, 15, 19). Pure decorative SVG: a gradient rim + a scattered
 * grid of city-light points, faked with gradients rather than photography (no stock, no
 * space-for-its-own-sake). Sits behind content, aria-hidden, never the section's brightest
 * element.
 */
export function GlobeArc({ className }: { className?: string }) {
  return (
    <div className={[styles.globe, className].filter(Boolean).join(" ")} aria-hidden="true">
      <svg viewBox="0 0 1200 300" preserveAspectRatio="xMidYMax slice" className={styles.svg}>
        <defs>
          <radialGradient id="globeGlow" cx="50%" cy="100%" r="75%">
            <stop offset="0" stopColor="rgba(59,130,246,0.34)" />
            <stop offset="40%" stopColor="rgba(109,40,217,0.18)" />
            <stop offset="100%" stopColor="rgba(7,5,15,0)" />
          </radialGradient>
          <linearGradient id="globeRim" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stopColor="rgba(34,211,238,0.9)" />
            <stop offset="50%" stopColor="rgba(168,85,247,0.9)" />
            <stop offset="100%" stopColor="rgba(255,122,24,0.9)" />
          </linearGradient>
        </defs>
        <ellipse cx="600" cy="470" rx="720" ry="360" fill="url(#globeGlow)" />
        <path
          d="M-40 300 Q 600 96 1240 300"
          fill="none"
          stroke="url(#globeRim)"
          strokeWidth="2.5"
          opacity="0.8"
        />
        <path
          d="M-40 316 Q 600 118 1240 316"
          fill="none"
          stroke="rgba(255,255,255,0.14)"
          strokeWidth="1"
        />
      </svg>
    </div>
  );
}
