import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { describe, it, expect } from "vitest";

/**
 * Phase 3B §G — the search-intent distinctness contract. Every indexable hub route has a UNIQUE title
 * and a UNIQUE H1, so no two routes compete for the same query with the same signals. The two noindex
 * conversion utilities (/growth-plan, /troubleshooter) are excluded by design. Canonicals are NOT
 * asserted here beyond "unchanged" (each route self-canonicalises via pageMetadata) — this test adds
 * no schema and changes no routing.
 */

const read = (rel: string) => readFileSync(fileURLToPath(new URL(rel, import.meta.url)), "utf8");

/** file = page source; title = pageMetadata title (root default when titleInFile:false); h1 = the H1
 *  text (h1InFile:false when the H1 is server-rendered from a section/seed, not the page file). */
const ROUTES: {
  route: string;
  file: string;
  title: string;
  h1: string;
  titleInFile?: boolean;
  h1InFile?: boolean;
}[] = [
  {
    route: "/",
    file: "../../src/app/(marketing)/page.tsx",
    title: "Infinite Weblinks — Digital growth, built around your goals",
    h1: "A smarter way to plan and grow your business online.",
    titleInFile: false,
    h1InFile: false,
  },
  {
    route: "/goals",
    file: "../../src/app/(marketing)/goals/page.tsx",
    title: "Your goal",
    h1: "What do you want to achieve right now?",
  },
  {
    route: "/how-it-works",
    file: "../../src/app/(marketing)/how-it-works/page.tsx",
    title: "How It Works",
    h1: "One connected system, built around your growth",
  },
  {
    route: "/connected-growth",
    file: "../../src/app/(marketing)/connected-growth/page.tsx",
    title: "Connected growth",
    h1: "Simple combinations that compound",
  },
  {
    route: "/services",
    file: "../../src/app/(marketing)/services/page.tsx",
    title: "Services",
    h1: "Everything your business needs, connected around your goals",
  },
  {
    route: "/tools",
    file: "../../src/app/(marketing)/tools/page.tsx",
    title: "Tools",
    h1: "Tools we help you choose, configure and connect",
  },
  {
    route: "/roadmaps",
    file: "../../src/app/(marketing)/roadmaps/page.tsx",
    title: "Roadmaps",
    h1: "Suggested roadmaps for common situations",
  },
  {
    route: "/learn",
    file: "../../src/app/(marketing)/learn/page.tsx",
    title: "Learn",
    h1: "Understand how it all fits together",
  },
  {
    route: "/resources",
    file: "../../src/app/(marketing)/resources/page.tsx",
    title: "Resources",
    h1: "Understand your options before you spend a thing",
  },
  {
    route: "/case-studies",
    file: "../../src/app/(marketing)/case-studies/page.tsx",
    title: "Case studies",
    h1: "How a connected system fits together",
  },
  {
    route: "/pricing",
    file: "../../src/app/(marketing)/pricing/page.tsx",
    title: "How pricing works",
    h1: "How pricing works",
  },
  {
    route: "/about",
    file: "../../src/app/(marketing)/about/page.tsx",
    title: "About",
    h1: "Your digital growth partner",
  },
  {
    route: "/account-ownership",
    file: "../../src/app/(marketing)/account-ownership/page.tsx",
    title: "Account ownership",
    h1: "Your business is built in your name",
  },
  {
    route: "/contact",
    file: "../../src/app/(convert)/contact/page.tsx",
    title: "Contact us",
    h1: "Let's plan your next connected step.",
  },
  {
    route: "/faq",
    file: "../../src/app/(marketing)/faq/page.tsx",
    title: "FAQ",
    h1: "Questions, answered plainly",
  },
];

describe("indexable routes have distinct titles and H1s", () => {
  it("every title is unique across routes", () => {
    const titles = ROUTES.map((r) => r.title);
    expect(new Set(titles).size, "duplicate titles").toBe(titles.length);
  });

  it("every H1 is unique across routes", () => {
    const h1s = ROUTES.map((r) => r.h1);
    expect(new Set(h1s).size, "duplicate H1s").toBe(h1s.length);
  });

  it("each route's page source declares its documented title and H1 (map matches source)", () => {
    for (const r of ROUTES) {
      const src = read(r.file);
      if (r.titleInFile !== false) {
        expect(src, `${r.route} title`).toContain(`title: "${r.title}"`);
      }
      if (r.h1InFile !== false) {
        expect(src, `${r.route} H1`).toContain(r.h1);
      }
    }
  });
});

describe("the search-intent map documents every indexable route", () => {
  const map = read("../../docs/content/search-intent-map.md");
  it("lists each route and its title", () => {
    for (const r of ROUTES) {
      expect(map, `${r.route} listed`).toContain(`\`${r.route}\``);
    }
    // The closest-pair decision is recorded.
    expect(map).toContain("how-it-works ⇄ /connected-growth");
  });
});
