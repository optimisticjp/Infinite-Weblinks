// @vitest-environment jsdom
import { describe, it, expect, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";
import {
  DELIVERY_MODEL_KEYS,
  DELIVERY_MODEL_META,
  deliveryModelMeta,
  type DeliveryModelKey,
} from "@/lib/design/deliveryModel";
import { deliveryModels } from "@/lib/content/data";
import { DeliveryModelBadge } from "@/components/primitives/DeliveryModelBadge";

afterEach(cleanup);

describe("central delivery-model metadata", () => {
  it("is exhaustive over exactly the four locked keys", () => {
    expect([...DELIVERY_MODEL_KEYS]).toEqual(["we-do", "we-expert", "we-run", "you-run"]);
    expect(Object.keys(DELIVERY_MODEL_META).sort()).toEqual(
      ["we-do", "we-expert", "we-run", "you-run"].sort(),
    );
  });

  it("carries exactly the locked labels from the delivery-models seed", () => {
    const seedByKey = new Map(deliveryModels.map((m) => [m.key, m.name] as const));
    for (const key of DELIVERY_MODEL_KEYS) {
      expect(DELIVERY_MODEL_META[key].label, key).toBe(seedByKey.get(key));
    }
    // No extra or missing keys versus the seed.
    expect(deliveryModels.map((m) => m.key).sort()).toEqual([...DELIVERY_MODEL_KEYS].sort());
  });

  it("gives each key exactly one icon and one V2 ink token", () => {
    for (const key of DELIVERY_MODEL_KEYS) {
      const meta = DELIVERY_MODEL_META[key];
      expect(meta.icon, `${key} icon`).toMatch(/^[a-z0-9-]+$/);
      expect(meta.ink, `${key} ink`).toMatch(/^var\(--v2-[a-z0-9-]+\)$/);
    }
    // Inks are distinct per key (no two models share an ink).
    const inks = DELIVERY_MODEL_KEYS.map((k) => DELIVERY_MODEL_META[k].ink);
    expect(new Set(inks).size).toBe(inks.length);
  });

  it("throws on an unknown key rather than silently inventing a model", () => {
    expect(() => deliveryModelMeta("not-a-model" as DeliveryModelKey)).toThrow(/Unknown delivery model key/);
  });

  it("is the source DeliveryModelBadge renders from", () => {
    for (const key of DELIVERY_MODEL_KEYS) {
      const { unmount } = render(<DeliveryModelBadge model={key} />);
      expect(screen.getByText(DELIVERY_MODEL_META[key].label)).toBeVisible();
      unmount();
    }
  });
});
