import { describe, it, expect } from "vitest";
import {
  serviceCategories,
  services,
  goals,
  stages,
} from "@/lib/content/data";
import { getServiceDomainConfig, serviceDomainConfigs } from "@/lib/services/domains";
import { serviceRedirects } from "@/lib/seo/service-redirects";
import { domainKeyFromToken } from "@/lib/design/domainColor";
import { DELIVERY_MODEL_KEYS } from "@/lib/design/deliveryModel";

/**
 * Phase 2M §B — the service-domain content graph, proven before the presentation is rebuilt. Any
 * seed/config defect must fail here rather than being silently repaired by editing content.
 */

const isRenderable = (s: { status: string }) => s.status === "verified" || s.status === "readyToPublish";
const renderableCategories = serviceCategories.filter(isRenderable);
const renderableServices = services.filter(isRenderable);
const renderableGoals = goals.filter(isRenderable);
const renderableStages = stages.filter(isRenderable);

const categoryBySlug = new Map(renderableCategories.map((c) => [c.slug, c] as const));
const serviceBySlug = new Map(renderableServices.map((s) => [s.slug, s] as const));

describe("category ↔ config coverage", () => {
  it("has exactly 16 renderable categories in stable source order", () => {
    expect(renderableCategories).toHaveLength(16);
    const orders = renderableCategories.map((c) => c.order);
    expect(orders).toEqual([...orders].sort((a, b) => a - b)); // ascending, stable
    expect(new Set(renderableCategories.map((c) => c.slug)).size).toBe(16); // unique slugs
  });

  it("every renderable category slug has exactly one DomainConfig", () => {
    for (const c of renderableCategories) {
      const config = getServiceDomainConfig(c.slug);
      expect(config, `${c.slug} has a config`).toBeDefined();
      expect(config?.slug).toBe(c.slug);
    }
  });

  it("every DomainConfig resolves to exactly one renderable category (no orphan, no duplicate)", () => {
    expect(serviceDomainConfigs).toHaveLength(16);
    const slugs = serviceDomainConfigs.map((c) => c.slug);
    expect(new Set(slugs).size, "no duplicate config slug").toBe(slugs.length);
    for (const config of serviceDomainConfigs) {
      expect(categoryBySlug.has(config.slug), `config ${config.slug} maps to a real category`).toBe(true);
    }
  });
});

describe("services", () => {
  it("has 70 renderable services, each resolving to a renderable category", () => {
    expect(renderableServices).toHaveLength(70);
    for (const s of renderableServices) {
      expect(categoryBySlug.has(s.categorySlug), `${s.slug} → real category`).toBe(true);
    }
  });

  it("every renderable category contains at least one service", () => {
    for (const c of renderableCategories) {
      const count = renderableServices.filter((s) => s.categorySlug === c.slug).length;
      expect(count, `${c.slug} has services`).toBeGreaterThan(0);
    }
  });

  it("every service delivery model is one of the four canonical keys, and every slug is unique", () => {
    const slugs = renderableServices.map((s) => s.slug);
    expect(new Set(slugs).size, "unique service slugs").toBe(slugs.length);
    for (const s of renderableServices) {
      expect(DELIVERY_MODEL_KEYS, `${s.slug} delivery key`).toContain(s.deliveryModel);
    }
  });
});

describe("clusters (per config)", () => {
  for (const config of serviceDomainConfigs) {
    describe(config.slug, () => {
      const categoryServices = renderableServices.filter((s) => s.categorySlug === config.slug);
      const clustered = config.clusters.flatMap((c) => c.serviceSlugs);

      it("every configured cluster service resolves and belongs to this category", () => {
        for (const slug of clustered) {
          const svc = serviceBySlug.get(slug);
          expect(svc, `${slug} resolves`).toBeDefined();
          expect(svc?.categorySlug, `${slug} belongs to ${config.slug}`).toBe(config.slug);
        }
      });

      it("no service appears twice across configured clusters", () => {
        expect(new Set(clustered).size, "no duplicate across clusters").toBe(clustered.length);
      });

      it("covers every category service exactly once (clustered + stable leftover, none omitted)", () => {
        const placed = new Set(clustered);
        const leftover = categoryServices.filter((s) => !placed.has(s.slug));
        const covered = new Set([...clustered, ...leftover.map((s) => s.slug)]);
        expect(covered.size, "every service covered once").toBe(categoryServices.length);
        for (const s of categoryServices) expect(covered.has(s.slug), `${s.slug} not omitted`).toBe(true);
      });

      it("every serviceCopy key resolves to a service in this category (no cross-category copy)", () => {
        for (const key of Object.keys(config.serviceCopy ?? {})) {
          const svc = serviceBySlug.get(key);
          expect(svc, `serviceCopy key ${key} resolves`).toBeDefined();
          expect(svc?.categorySlug, `serviceCopy ${key} in ${config.slug}`).toBe(config.slug);
        }
      });
    });
  }
});

describe("stage, next and connectsTo relationships (per config)", () => {
  const stageSlugs = new Set(renderableStages.map((s) => s.slug));
  for (const config of serviceDomainConfigs) {
    it(`${config.slug}: stageSlug, next and connectsTo all resolve`, () => {
      expect(stageSlugs.has(config.stageSlug), `${config.slug} stage ${config.stageSlug}`).toBe(true);

      const nextCategory = categoryBySlug.get(config.next.slug);
      expect(nextCategory, `${config.slug} next ${config.next.slug} resolves`).toBeDefined();
      expect(config.next.name, `${config.slug} next name matches category`).toBe(nextCategory?.name);

      for (const c of config.connectsTo) {
        expect(c.label.trim().length, "connectsTo label").toBeGreaterThan(0);
        expect(c.body.trim().length, "connectsTo body").toBeGreaterThan(0);
        expect(c.icon.trim().length, "connectsTo icon").toBeGreaterThan(0);
        expect(domainKeyFromToken(c.hue), `connectsTo tone ${c.hue} recognised`).not.toBeNull();
      }
    });
  }
});

describe("related-goal resolution", () => {
  it("every goal referenced by a service resolves to a renderable goal", () => {
    const goalSlugs = new Set(renderableGoals.map((g) => g.slug));
    for (const s of renderableServices) {
      for (const gs of s.goalSlugs) {
        expect(goalSlugs.has(gs), `service ${s.slug} references real goal ${gs}`).toBe(true);
      }
    }
  });
});

describe("service → category-anchor redirects", () => {
  it("has exactly one rule per renderable service (70), with unique sources and destinations", () => {
    expect(serviceRedirects).toHaveLength(renderableServices.length);
    expect(renderableServices).toHaveLength(70);
    const sources = serviceRedirects.map((r) => r.source);
    const destinations = serviceRedirects.map((r) => r.destination);
    expect(new Set(sources).size, "unique sources").toBe(sources.length);
    expect(new Set(destinations).size, "unique destinations").toBe(destinations.length);
  });

  it("every rule is a permanent /services/<slug> → /services/<category>#<slug> with a real target", () => {
    for (const rule of serviceRedirects) {
      expect(rule.permanent, `${rule.source} permanent (308)`).toBe(true);
      const sourceSlug = rule.source.replace(/^\/services\//, "");
      expect(serviceBySlug.has(sourceSlug), `${rule.source} is a real service`).toBe(true);
      const [, categorySlug, anchor] = rule.destination.match(/^\/services\/([^#]+)#(.+)$/) ?? [];
      expect(categoryBySlug.has(categorySlug), `${rule.destination} category exists`).toBe(true);
      expect(anchor, `${rule.destination} anchor matches source`).toBe(sourceSlug);
      expect(serviceBySlug.get(sourceSlug)?.categorySlug, `${sourceSlug} belongs to ${categorySlug}`).toBe(categorySlug);
      expect(categoryBySlug.has(sourceSlug), `${rule.source} does not shadow a category`).toBe(false);
    }
  });
});
