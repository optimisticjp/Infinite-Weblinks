/**
 * Shared route-matching helper for navigation "current" state.
 *
 * One source of truth for how the header, mega triggers and mobile drawer decide whether a
 * link or a section is the current location, so every surface marks wayfinding the same way:
 *
 *   - EXACT match      → aria-current="page"      (this link IS the current page)
 *   - ANCESTOR/section → aria-current="location"  (the current page lives under this link)
 *   - unrelated        → no aria-current
 *
 * Pure and server-safe (string in, string out) — no DOM, no computed style — so it works in
 * Server Components, the client chrome, and unit tests alike. Trailing slashes are normalised
 * so "/services" and "/services/" behave identically. Hash/query are ignored for matching
 * (they don't change which route is current).
 */

export type CurrentState = "page" | "location" | false;

/** Strip a trailing slash (except the root) and any hash/query, leaving a bare pathname. */
function normalizePath(value: string): string {
  const path = value.split(/[?#]/, 1)[0];
  if (path.length > 1 && path.endsWith("/")) return path.slice(0, -1);
  return path;
}

/**
 * The current-state of a single link `href` against the active `pathname`.
 * Exact match → "page"; an ancestor path (href is a parent of pathname) → "location".
 */
export function routeCurrentState(href: string, pathname: string): CurrentState {
  if (!href) return false;
  const h = normalizePath(href);
  const p = normalizePath(pathname);
  if (h === p) return "page";
  // "/" is an ancestor of everything, but the home link is only ever "current" when exact —
  // otherwise every page would mark Home as a location.
  if (h !== "/" && p.startsWith(`${h}/`)) return "location";
  return false;
}

/**
 * The current-state of a mega-menu section. The section is represented by its hub `hubHref`
 * plus every child link `childHrefs`. It is:
 *   - "page"     when the hub itself is the current page,
 *   - "location" when the current page is under the hub, or is one of the section's links,
 *   - false      otherwise.
 * The trigger is never "page" for a child route — only the child link is; the trigger is the
 * ancestor, so it reads as "location".
 */
export function sectionCurrentState(
  hubHref: string,
  childHrefs: readonly string[],
  pathname: string,
): CurrentState {
  const hub = routeCurrentState(hubHref, pathname);
  if (hub === "page") return "page";
  if (hub === "location") return "location";
  return childHrefs.some((href) => routeCurrentState(href, pathname) !== false) ? "location" : false;
}

/** Map a CurrentState to the aria-current attribute value (undefined when not current). */
export function ariaCurrent(state: CurrentState): "page" | "location" | undefined {
  return state === false ? undefined : state;
}

/** True when the link/section is the current location in any sense (page or ancestor). */
export function isCurrent(state: CurrentState): boolean {
  return state !== false;
}
