/**
 * Motion helpers. Motion is a presentation layer only: the static state is always
 * complete first, and reduced-motion users get that static state with no animation.
 */

/** True when the user has asked for reduced motion (client-only; false during SSR). */
export function prefersReducedMotion(): boolean {
  if (typeof window === "undefined" || !window.matchMedia) return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/**
 * Lazily load GSAP + ScrollTrigger on the client, only where a timeline is used,
 * so it never sits on the critical path. Returns null under reduced motion so the
 * caller simply skips animating (the static end-state is already rendered).
 */
export async function loadGsap() {
  if (typeof window === "undefined" || prefersReducedMotion()) return null;
  const [{ gsap }, { ScrollTrigger }] = await Promise.all([
    import("gsap"),
    import("gsap/ScrollTrigger"),
  ]);
  gsap.registerPlugin(ScrollTrigger);
  return { gsap, ScrollTrigger };
}
