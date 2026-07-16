import { describe, it, expect } from "vitest";
import { seedChrome } from "@/lib/content/seed";
import * as data from "@/lib/content/data";

/**
 * Nav link integrity. Two invariants on the mega menus:
 *   1. Within a menu, every link's href is DISTINCT — the class of bug where a whole
 *      submenu points at one hub (12 Services links → /services, 4 Solutions "By goal"
 *      links → /solutions, 4 delivery links → #delivery). Click a named thing, arrive
 *      at *that* thing, not the same place as its siblings.
 *   2. Every link RESOLVES — its route/anchor maps to a real slug, category, goal or
 *      section id, so "make each link land on the thing it names" can't silently rot.
 */

type NavLink = { label: string; href: string };

const megaMenus = seedChrome.nav.primary
  .filter((i) => i.megaMenu)
  .map((i) => ({ menu: i.label, links: i.megaMenu!.columns.flatMap((c) => c.items) as NavLink[] }));

const set = <T extends { slug: string }>(x: readonly T[]) => new Set(x.map((i) => i.slug));
const serviceSlugs = set(data.services);
const serviceCategorySlugs = set(data.serviceCategories);
const goalSlugs = set(data.goals);
const businessTypeSlugs = set(data.businessTypes);
const startingPointSlugs = set(data.startingPoints);
const stageSlugs = set(data.stages);
const systemKeys = new Set<string>(data.systems.map((s) => s.key));
const deliveryKeys = new Set<string>(data.deliveryModels.map((m) => m.key));

// Bare top-level marketing routes that are valid destinations on their own.
const HUB_ROUTES = new Set([
  "/",
  "/services",
  "/solutions",
  "/how-it-works",
  "/resources",
  "/learn",
  "/roadmaps",
  "/tools",
  "/faq",
  "/about",
  "/growth-plan",
  "/contact",
]);
// Section ids on /how-it-works that aren't a stage/system/delivery key.
const HOW_IT_WORKS_SECTIONS = new Set(["journey", "systems", "process", "delivery"]);

/** Return a reason string if the internal href does not resolve to a real destination, else null. */
function brokenReason(href: string): string | null {
  const [path, hash] = href.split("#");

  if (path && !HUB_ROUTES.has(path)) {
    const m = path.match(/^\/(services|goals|business-types|starting-points)\/(.+)$/);
    if (!m) return `unknown route "${path}"`;
    const [, kind, slug] = m;
    const ok =
      (kind === "services" && serviceSlugs.has(slug)) ||
      (kind === "goals" && goalSlugs.has(slug)) ||
      (kind === "business-types" && businessTypeSlugs.has(slug)) ||
      (kind === "starting-points" && startingPointSlugs.has(slug));
    if (!ok) return `unknown ${kind} slug "${slug}"`;
  }

  if (hash) {
    if (path === "/services" && !serviceCategorySlugs.has(hash)) {
      return `unknown /services category anchor "#${hash}"`;
    }
    if (path === "/how-it-works") {
      const ok =
        stageSlugs.has(hash) ||
        systemKeys.has(hash) ||
        HOW_IT_WORKS_SECTIONS.has(hash) ||
        (hash.startsWith("delivery-") && deliveryKeys.has(hash.slice("delivery-".length)));
      if (!ok) return `unknown /how-it-works anchor "#${hash}"`;
    }
  }

  return null;
}

describe("mega-menu link integrity", () => {
  for (const { menu, links } of megaMenus) {
    it(`${menu}: every link href is distinct`, () => {
      const hrefs = links.map((l) => l.href);
      const dupes = [...new Set(hrefs.filter((h, i) => hrefs.indexOf(h) !== i))];
      expect(dupes, `duplicate hrefs in "${menu}": ${dupes.join(", ")}`).toEqual([]);
    });

    it(`${menu}: every link resolves to a real destination`, () => {
      const broken = links
        .map((l) => ({ label: l.label, href: l.href, reason: brokenReason(l.href) }))
        .filter((l) => l.reason);
      expect(broken, JSON.stringify(broken, null, 2)).toEqual([]);
    });
  }
});
