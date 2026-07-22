// @vitest-environment jsdom
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, cleanup, within } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";
import { GrowthPlanPreview } from "@/components/routes/GrowthPlanPreview";
import { HomepageHeroSection } from "@/components/sections/home/HomepageHeroSection";
import { HomepageProblemSection } from "@/components/sections/home/HomepageProblemSection";
import { HomepageGoalRouterSection } from "@/components/sections/home/HomepageGoalRouterSection";
import { HomepageConnectedSystemSection } from "@/components/sections/home/HomepageConnectedSystemSection";
import { HomepageTrustSection } from "@/components/sections/home/HomepageTrustSection";
import { HomepageLearningSection } from "@/components/sections/home/HomepageLearningSection";
import { DeliveryModelsExplainerSection } from "@/components/sections/DeliveryModelsExplainerSection";
import { getHomepageOpening, getGoals, getLearnArticles, getAccountOwnership } from "@/lib/content";
import { honestExpectationsWont, honestExpectationsPromise } from "@/lib/content/data/honest-expectations";

/**
 * Phase 2K — the V2 homepage spine components. These render from the real seed getters (no Sanity
 * with the flag off) and assert: the exact approved copy renders, no fabricated proof/plan data
 * appears, the fragments live on real content, and no cosmic/animated decoration is reintroduced.
 */

vi.mock("next/link", () => ({
  default: ({ href, children, prefetch: _p, ...rest }: { href: unknown; children: unknown; prefetch?: unknown }) => {
    void _p;
    return (
      <a href={typeof href === "string" ? href : "#"} {...(rest as Record<string, unknown>)}>
        {children as never}
      </a>
    );
  },
}));

afterEach(cleanup);

const read = (rel: string) => readFileSync(fileURLToPath(new URL(rel, import.meta.url)), "utf8");
/** Source with block/line/JSX comments stripped, so a regex checks real code, not a doc comment
 *  that legitimately names the very thing it promises NOT to render. */
const readCode = (rel: string) =>
  read(rel)
    .replace(/\/\*[\s\S]*?\*\//g, "")
    .replace(/(^|[^:])\/\/.*$/gm, "$1");

// ------------------------------------------------------------------ GrowthPlanPreview

describe("GrowthPlanPreview — truthful static structure", () => {
  it("labels the preview and shows the real inputs + three ordering buckets", () => {
    render(<GrowthPlanPreview />);
    expect(screen.getByRole("group", { name: /preview: how your growth plan is organised/i })).toBeInTheDocument();
    expect(screen.getByText("Your growth plan")).toBeVisible();
    for (const ctx of ["Your business", "Your goal", "Your current setup"]) {
      expect(screen.getByText(ctx)).toBeVisible();
    }
    for (const bucket of ["Start here", "Connect next", "Add later"]) {
      expect(screen.getByText(bucket)).toBeVisible();
    }
    expect(screen.getByText(/tailored to your business during discovery/i)).toBeVisible();
    expect(screen.getByText(/you keep your accounts, data and tools/i)).toBeVisible();
  });

  it("fabricates NOTHING — no form controls, business name, percentage, price, date or email", () => {
    const { container } = render(<GrowthPlanPreview />);
    expect(container.querySelector("input, textarea, select, button, form")).toBeNull();
    expect(container.querySelector('[type="radio"], [role="radio"], [aria-checked]')).toBeNull();
    const text = container.textContent ?? "";
    expect(text).not.toMatch(/%/); // no completion percentage
    expect(text).not.toMatch(/[£$€]\s?\d/); // no price
    expect(text).not.toMatch(/\b\d{4}\b/); // no year/date
    expect(text).not.toMatch(/@/); // no email
    expect(text).not.toMatch(/loading|generating|generated/i); // no generated/loading state
  });

  it("maps each bucket tone to an accessible V2 domain ink (never a raw colour or fallback)", () => {
    const { container } = render(<GrowthPlanPreview />);
    const buckets = container.querySelectorAll("ol > li");
    expect(buckets).toHaveLength(3);
    const inks = [...buckets].map((li) => (li as HTMLElement).style.getPropertyValue("--bucket-ink"));
    expect(inks).toEqual([
      "var(--v2-domain-strategy-ink)",
      "var(--v2-domain-discover-ink)",
      "var(--v2-domain-operate-ink)",
    ]);
  });

  it("is a static composition — no client boundary, canvas, orb or fixed height in source", () => {
    const src = readCode("../../src/components/routes/GrowthPlanPreview.tsx");
    const css = read("../../src/components/routes/GrowthPlanPreview.module.css");
    expect(src).not.toContain('"use client"');
    expect(src).not.toMatch(/NodeOrb|ConnectorPath|canvas|useState|useEffect/);
    expect(css).not.toMatch(/height:\s*(100vh|100dvh)|min-height:\s*(100vh|100dvh)/);
    expect(css).not.toMatch(/@keyframes|animation:/);
  });
});

// ------------------------------------------------------------------ HomepageHeroSection

describe("HomepageHeroSection — server hero from seed HeroContent", () => {
  it("renders exactly one H1 with the complete headline in original word order", async () => {
    const { hero } = await getHomepageOpening();
    render(<HomepageHeroSection hero={hero} />);
    const h1 = screen.getByRole("heading", { level: 1 });
    expect(h1).toHaveAttribute("id", "hero-heading");
    const expected = `${hero.headline.pre}${hero.headline.accent}${hero.headline.post}`;
    expect(h1.textContent).toBe(expected);
  });

  it("renders the eyebrow, slogan, support, reassurance, both CTAs and all five areas", async () => {
    const { hero } = await getHomepageOpening();
    render(<HomepageHeroSection hero={hero} />);
    expect(screen.getByText(hero.eyebrow)).toBeVisible();
    expect(screen.getByText(hero.slogan)).toBeVisible();
    expect(screen.getByText(hero.support)).toBeVisible();
    expect(screen.getByText(hero.reassurance)).toBeVisible();
    expect(screen.getByRole("link", { name: hero.primaryCta.label })).toHaveAttribute("href", hero.primaryCta.route);
    expect(screen.getByRole("link", { name: hero.secondaryCta.label })).toHaveAttribute(
      "href",
      hero.secondaryCta.route,
    );
    for (const area of hero.areas) {
      expect(screen.getByText(area.label)).toBeVisible();
    }
  });

  it("renders the works-with rail with the neutral label, clarification and every brand logo", async () => {
    const { hero } = await getHomepageOpening();
    const { container } = render(<HomepageHeroSection hero={hero} />);
    expect(screen.getByText("Works with the tools your business already uses.")).toBeVisible();
    expect(screen.getByText("Examples only. No partnership or endorsement implied.")).toBeVisible();
    const logos = container.querySelectorAll('ul[aria-label="Example tools we can connect"] img');
    expect(logos).toHaveLength(hero.platforms.length);
    // Each logo carries its brand name (not decorative) — accessible.
    hero.platforms.forEach((p, i) => expect(logos[i]).toHaveAttribute("alt", p.name));
  });

  it("uses a light surface with a solid accent span (no gradient H1) and no canvas", async () => {
    const { hero } = await getHomepageOpening();
    const { container } = render(<HomepageHeroSection hero={hero} />);
    expect(container.querySelector("section")).toHaveClass("theme-light");
    expect(container.querySelector("canvas")).toBeNull();
    // The accent is a plain <span> inside the H1, not a gradient-text node.
    const h1 = screen.getByRole("heading", { level: 1 });
    expect(within(h1).getByText(hero.headline.accent)).toBeInTheDocument();
    const css = read("../../src/components/sections/home/HomepageHeroSection.module.css");
    expect(css).not.toMatch(/-webkit-background-clip|background-clip:\s*text/);
    expect(css).not.toMatch(/min-height:\s*(100vh|100dvh)/);
  });

  it("renders the static GrowthPlanPreview alongside the copy (copy first in the DOM)", async () => {
    const { hero } = await getHomepageOpening();
    const { container } = render(<HomepageHeroSection hero={hero} />);
    expect(screen.getByRole("group", { name: /preview: how your growth plan is organised/i })).toBeInTheDocument();
    const html = container.innerHTML;
    expect(html.indexOf("hero-heading")).toBeLessThan(html.indexOf("how your growth plan is organised"));
  });
});

// ------------------------------------------------------------------ HomepageProblemSection

describe("HomepageProblemSection — editorial verbatim on an alt surface", () => {
  it("renders the eyebrow, the full plain heading and every body paragraph in order", async () => {
    const { editorial } = await getHomepageOpening();
    const { container } = render(<HomepageProblemSection data={editorial} />);
    const heading = `${editorial.heading.pre}${editorial.heading.accent}${editorial.heading.post}`;
    expect(screen.getByRole("heading", { level: 2 })).toHaveTextContent(heading);
    for (const para of editorial.body) {
      expect(screen.getByText(para)).toBeVisible();
    }
    // Plain heading — no gradient-word span.
    const css = read("../../src/components/sections/home/HomepageProblemSection.module.css");
    expect(css).not.toMatch(/background-clip:\s*text/);
    void container;
  });

  it("renders each point as an article Card with an <h3> and a mapped ink (no featured first)", async () => {
    const { editorial } = await getHomepageOpening();
    const { container } = render(<HomepageProblemSection data={editorial} />);
    const points = editorial.points ?? [];
    expect(points.length).toBeGreaterThan(0);
    const articles = container.querySelectorAll("article");
    expect(articles).toHaveLength(points.length);
    for (const point of points) {
      expect(screen.getByRole("heading", { level: 3, name: point.title })).toBeInTheDocument();
    }
    // Every card carries a resolved V2 ink accent (never a raw colour).
    articles.forEach((a) => {
      const accent = (a as HTMLElement).style.getPropertyValue("--card-accent");
      expect(accent).toMatch(/^var\(--v2-/);
    });
  });
});

// ------------------------------------------------------------------ HomepageGoalRouterSection

describe("HomepageGoalRouterSection — every goal into the plan builder", () => {
  it("renders id=goals and one plan-builder link per goal in source order", async () => {
    const goals = await getGoals();
    const { container } = render(await HomepageGoalRouterSection());
    expect(container.querySelector("section#goals")).not.toBeNull();
    const goalLinks = [...container.querySelectorAll('a[href^="/growth-plan?goal="]')];
    expect(goalLinks).toHaveLength(goals.length);
    goalLinks.forEach((a, i) => expect(a).toHaveAttribute("href", `/growth-plan?goal=${goals[i].slug}`));
  });

  it("offers the not-sure catch-all (/growth-plan) and browse-all (/goals), no featured goal", async () => {
    const { container } = render(await HomepageGoalRouterSection());
    expect(container.querySelector('a[href="/growth-plan"]')).not.toBeNull();
    expect(container.querySelector('a[href="/goals"]')).not.toBeNull();
    expect(container.querySelector('[class*="featured"], [class*="Bento"]')).toBeNull();
  });
});

// ------------------------------------------------------------------ HomepageConnectedSystemSection

describe("HomepageConnectedSystemSection — one system + three onward bridges", () => {
  it("renders id=how-it-connects, a CTA to /how-it-works and the three fragment bridge cards", () => {
    const { container } = render(<HomepageConnectedSystemSection />);
    expect(container.querySelector("section#how-it-connects")).not.toBeNull();
    expect(container.querySelector('a[href="/how-it-works"]')).not.toBeNull();
    expect(container.querySelector('a#growth-journey[href="/how-it-works#growth-journey"]')).not.toBeNull();
    expect(container.querySelector('a#customer-journey[href="/connected-growth"]')).not.toBeNull();
    expect(container.querySelector('a#services[href="/services"]')).not.toBeNull();
  });

  it("does not render a fake phone strip or a services constellation", () => {
    const { container } = render(<HomepageConnectedSystemSection />);
    expect(container.querySelector('[class*="PhoneFrame"], [class*="Constellation"]')).toBeNull();
    const src = readCode("../../src/components/sections/home/HomepageConnectedSystemSection.tsx");
    expect(src).not.toMatch(/PhoneFrame|ServicesConstellation|GrowthJourneyList|StageTimeline/);
  });
});

// ------------------------------------------------------------------ delivery reuse (homepage config)

describe("DeliveryModelsExplainerSection — homepage configuration", () => {
  it("uses the homepage id, an alt surface, hides ownership and renders NO delivery fragment targets", async () => {
    const { container } = render(
      await DeliveryModelsExplainerSection({
        id: "ways-of-working",
        surface: "alt",
        showOwnership: false,
        cardFragmentTargets: false,
      }),
    );
    expect(container.querySelector("section#ways-of-working")).not.toBeNull();
    // The four models still render (in order, "Our default" on we-do), but WITHOUT delivery-* ids
    // — those belong to /how-it-works, not the homepage.
    expect(container.querySelectorAll("article")).toHaveLength(4);
    expect(container.querySelector('[id^="delivery-"]'), "no delivery fragment target on the homepage").toBeNull();
    expect(screen.getByText("Our default")).toBeInTheDocument();
    // Ownership reassurance must NOT be repeated here (the trust section owns it).
    expect(container.textContent).not.toMatch(/owned and controlled by you/i);
  });

  it("keeps all four delivery fragment targets by default (the /how-it-works contract)", async () => {
    const { container } = render(await DeliveryModelsExplainerSection({}));
    expect(container.querySelector("section#delivery")).not.toBeNull();
    for (const id of ["delivery-we-do", "delivery-we-expert", "delivery-we-run", "delivery-you-run"]) {
      expect(container.querySelector(`[id="${id}"]`), `${id} present by default`).not.toBeNull();
    }
  });
});

// ------------------------------------------------------------------ HomepageTrustSection

describe("HomepageTrustSection — ownership + honest expectations merged", () => {
  it("renders the real ownership content on id=ownership with a plain H2", async () => {
    const own = await getAccountOwnership();
    const { container } = render(await HomepageTrustSection({}));
    expect(container.querySelector("section#ownership")).not.toBeNull();
    const heading = `${own.heading.pre}${own.heading.accent}${own.heading.post}`;
    expect(screen.getByRole("heading", { level: 2 })).toHaveTextContent(heading);
    expect(screen.getByText(own.vaultLabel)).toBeVisible();
    expect(screen.getByText("Owned and controlled by you")).toBeVisible();
    for (const asset of own.assets) expect(screen.getByText(asset.label)).toBeVisible();
    for (const g of own.guarantees) {
      expect(screen.getByRole("heading", { level: 3, name: g.title })).toBeInTheDocument();
    }
    const closing = `${own.closing.pre}${own.closing.accent}${own.closing.post}`;
    expect(screen.getByText(closing)).toBeVisible();
  });

  it("renders the honest subsection (id=honest) with both columns and every item in order", async () => {
    const { container } = render(await HomepageTrustSection({}));
    const honest = container.querySelector("#honest");
    expect(honest).not.toBeNull();
    const scope = within(honest as HTMLElement);
    expect(scope.getByRole("heading", { level: 3, name: "Honest expectations" })).toBeInTheDocument();
    expect(scope.getByRole("heading", { level: 4, name: "What we won't do" })).toBeInTheDocument();
    expect(scope.getByRole("heading", { level: 4, name: "What we do promise" })).toBeInTheDocument();
    for (const item of honestExpectationsWont) expect(scope.getByText(item.title)).toBeVisible();
    for (const item of honestExpectationsPromise) expect(scope.getByText(item.title)).toBeVisible();
  });

  it("does NOT repeat the account-ownership CTA button pair", async () => {
    const own = await getAccountOwnership();
    const { container } = render(await HomepageTrustSection({}));
    // The section owns no links: the final CTA follows separately.
    expect(container.querySelector(`a[href="${own.secondaryCta.route}"]`)).toBeNull();
    expect(container.querySelectorAll("a")).toHaveLength(0);
  });
});

// ------------------------------------------------------------------ HomepageLearningSection

describe("HomepageLearningSection — compact learn preview", () => {
  it("renders the first three articles as cards with real goal labels and a CTA to /learn", async () => {
    const [articles, goals] = await Promise.all([getLearnArticles(), getGoals()]);
    const preview = articles.slice(0, 3);
    const { container } = render(await HomepageLearningSection({}));
    expect(container.querySelector("section#learn")).not.toBeNull();
    for (const article of preview) {
      expect(screen.getByRole("heading", { name: article.title })).toBeInTheDocument();
    }
    // A real related-goal label is used (or the neutral "Guide"), never a positional glyph.
    const firstGoalSlug = preview[0]?.relatedGoalSlugs?.[0];
    const firstGoal = goals.find((g) => g.slug === firstGoalSlug);
    if (firstGoal) expect(screen.getAllByText(firstGoal.title).length).toBeGreaterThan(0);
    expect(container.querySelector('a[href="/learn"]')).not.toBeNull();
    // No invented author or date.
    expect(container.textContent).not.toMatch(/\bby\s+[A-Z][a-z]+\s+[A-Z][a-z]+/);
  });
});

// ------------------------------------------------------------------ honest-expectations centralisation

describe("honest-expectations is the single shared source", () => {
  it("carries the exact approved titles in source order for both columns", () => {
    expect(honestExpectationsWont.map((w) => w.title)).toEqual([
      "No overnight results",
      "No guaranteed rankings",
      "No invented numbers",
      "No lock-in",
    ]);
    expect(honestExpectationsPromise.map((p) => p.title)).toEqual([
      "A clear plan",
      "Work done properly",
      "Honest reporting",
      "Steady improvement",
    ]);
  });

  it("is consumed by BOTH the legacy /about section and the new homepage trust section", () => {
    const legacy = read("../../src/components/sections/home/HonestExpectationsSection.tsx");
    const trust = read("../../src/components/sections/home/HomepageTrustSection.tsx");
    for (const src of [legacy, trust]) {
      expect(src).toMatch(/from "@\/lib\/content\/data\/honest-expectations"/);
      expect(src).not.toMatch(/const WONT\s*[:=]\s*\[/); // no re-declared local arrays
    }
  });
});

// ------------------------------------------------------------------ legacy safety (source-level)

describe("legacy homepage components are left intact for their other routes", () => {
  it("/about still renders the legacy honest + delivery sections", () => {
    const about = read("../../src/app/(marketing)/about/page.tsx");
    for (const legacy of ["HonestExpectationsSection", "DeliveryModelsSection"]) {
      expect(about, `/about keeps ${legacy}`).toContain(legacy);
    }
  });

  it("/account-ownership still renders the legacy AccountOwnershipSection", () => {
    const page = read("../../src/app/(marketing)/account-ownership/page.tsx");
    expect(page).toContain("AccountOwnershipSection");
  });

  it("the legacy CustomerJourneySection and ServicesConstellationSection still exist", () => {
    expect(() => read("../../src/components/sections/home/ServicesConstellationSection.tsx")).not.toThrow();
    expect(() => read("../../src/components/sections/CustomerJourneySection.tsx")).not.toThrow();
  });
});
