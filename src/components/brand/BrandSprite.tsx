/**
 * Global brand SVG sprite — rendered once in the root layout.
 *
 * Holds the approved "Signature Crossover" infinity mark as a <symbol> plus its
 * gradient and crossover mask, so any number of <Logo /> instances can reference
 * it via <use href="#iw-infinity"> without duplicating <defs> ids in the DOM.
 * Rebuilt cleanly from the approved handoff vector (not copied artifact code);
 * the wordmark is rendered as real text by <Logo />, not baked into this mark.
 */
export function BrandSprite() {
  return (
    <svg
      aria-hidden="true"
      focusable="false"
      width="0"
      height="0"
      style={{ position: "absolute", width: 0, height: 0, overflow: "hidden" }}
    >
      <defs>
        <linearGradient id="iw-grad" x1="4" y1="42" x2="96" y2="8" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#22D3EE" />
          <stop offset=".28" stopColor="#3B82F6" />
          <stop offset=".55" stopColor="#A855F7" />
          <stop offset=".8" stopColor="#F5197E" />
          <stop offset="1" stopColor="#FF7A18" />
        </linearGradient>
        <mask id="iw-cut" maskUnits="userSpaceOnUse" x="0" y="0" width="100" height="50">
          <rect width="100" height="50" fill="#fff" />
          {/* Cut the centre crossover so one strand reads as passing under the other. */}
          <path d="M55 20 Q50 25 45 30" fill="none" stroke="#000" strokeWidth="12" strokeLinecap="butt" />
        </mask>
        <symbol id="iw-infinity" viewBox="0 0 100 50">
          <g mask="url(#iw-cut)">
            <path
              d="M50 25 C62 6 96 6 96 25 C96 44 62 44 50 25 C38 6 4 6 4 25 C4 44 38 44 50 25 Z"
              fill="none"
              stroke="url(#iw-grad)"
              strokeWidth="8"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </g>
          {/* The over-strand redrawn on top through the crossover. */}
          <path
            d="M59 16 Q50 25 41 34"
            fill="none"
            stroke="url(#iw-grad)"
            strokeWidth="8"
            strokeLinecap="round"
          />
        </symbol>
      </defs>
    </svg>
  );
}
