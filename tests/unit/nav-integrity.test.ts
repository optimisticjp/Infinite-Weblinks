import { describe, it, expect } from "vitest";
import { seedChrome } from "@/lib/content/seed";
import * as data from "@/lib/content/data";

/**
 * Nav link integrity — the cheap guards that would have caught Defect 1 on day one.
 *
 *   1. Within EVERY column of EVERY mega menu, every href is DISTINCT. This is the exact
 *      class of bug where a whole column shares one hub (Services 12→/services, By-goal
 *      4→/solutions, How-we-deliver 4→#delivery): click a named thing, land on that thing,
 *      not the same place as its siblings.
 *   2. EVERY href anywhere in seed.ts (nav, footer, legal, CTAs) RESOLVES to a real route,
 *      category, goal, slug or section anchor — so "make each link land on the thing it
 *      names" can't silently rot when the taxonomy shifts.
 *
 * Guard (1) is red on main (the three shared-href columns). Guard (2) is a rot-guard: it is
 * green on main too, because main's links, though duplicated, still point at live routes —
 * it goes load-bearing here, where links become specific. Stated honestly, not contrived red.
 */

type NavLink = { label: string; href: string };

const megaMenus = seedChrome.nav.primary
  .filter((i) => i.megaMenu)
  .map((i) => ({ menu: i.label, columns: i.megaMenu!.columns }));

const set = <T extends { slug: string }>(x: readonly T[]) => new Set(x.map((i) => i.slug));
const serviceCategorySlugs = set(data.serviceCategories);
const goalSlugs = set(data.goals);
const businessTypeSlugs = set(data.businessTypes);
const startingPointSlugs = set(data.startingPoints);
const stageSlugs = set(data.stages);
const systemKeys = new Set<string>(data.systems.map((s) => s.key));
const deliveryKeys = new Set<string>(data.deliveryModels.map((m) => m.key));

// Bare top-level marketing routes that are valid destinations on their own.
// /business-types and /starting-points are intentionally absent: their index URLs were
// retired in Phase 3 (they now 308 into /goals facets), so a bare link to either is a
// broken destination — only their /<slug> detail routes resolve, via the regex below.
const HUB_ROUTES = new Set([
  "/",
  "/goals",
  "/services",
  "/how-it-works",
  "/pricing",
  "/resources",
  "/learn",
  "/roadmaps",
  "/tools",
  "/faq",
  "/about",
  "/connected-growth",
  "/account-ownership",
  "/growth-plan",
  "/troubleshooter",
  "/contact",
  "/privacy",
  "/cookies",
  "/terms",
  "/refunds",
  "/accessibility",
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
    // Phase 4: /services/<x> is a category page now (services folded into it as anchors),
    // so a bare /services/<x> link resolves against the category slugs.
    const ok =
      (kind === "services" && serviceCategorySlugs.has(slug)) ||
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

/** Every href anywhere in the chrome (nav triggers, mega links, footer, legal, CTAs). */
function allChromeHrefs(): { where: string; href: string }[] {
  const out: { where: string; href: string }[] = [];
  for (const item of seedChrome.nav.primary) {
    out.push({ where: `nav:${item.label}`, href: item.href });
    if (item.megaMenu) {
      for (const col of item.megaMenu.columns) {
        for (const link of col.items) out.push({ where: `nav:${item.label}/${col.heading}`, href: link.href });
      }
      if (item.megaMenu.promo) out.push({ where: `nav:${item.label}/promo`, href: item.megaMenu.promo.cta.route });
    }
  }
  for (const col of seedChrome.footer.columns) {
    for (const link of col.links) out.push({ where: `footer:${col.heading}`, href: link.href });
  }
  for (const link of seedChrome.footer.legal) out.push({ where: "footer:legal", href: link.href });
  for (const cta of seedChrome.nav.ctas) out.push({ where: "nav:cta", href: cta.route });
  return out;
}

describe("mega-menu column integrity — every href distinct within its column", () => {
  for (const { menu, columns } of megaMenus) {
    for (const col of columns) {
      it(`${menu} › ${col.heading}: no two links share an href`, () => {
        const hrefs = (col.items as NavLink[]).map((l) => l.href);
        const dupes = [...new Set(hrefs.filter((h, i) => hrefs.indexOf(h) !== i))];
        expect(dupes, `duplicate hrefs in "${menu} › ${col.heading}": ${dupes.join(", ")}`).toEqual([]);
      });
    }
  }
});

describe("chrome link resolution — every href points at a real destination", () => {
  it("every href in seed.ts resolves", () => {
    const broken = allChromeHrefs()
      .map((h) => ({ ...h, reason: brokenReason(h.href) }))
      .filter((h) => h.reason);
    expect(broken, JSON.stringify(broken, null, 2)).toEqual([]);
  });
});
