import { describe, it, expect } from "vitest";
import {
  contactTrustPoints,
  contactProcessSteps,
  contactAlternativePaths,
  contactClosingNote,
} from "@/lib/content/data/contact";
import { supportEmail } from "@/lib/forms/config.public";
import { hasIcon } from "@/components/primitives/Icon";

/**
 * Phase 2O — the centralised contact presentation content. Locks the exact copy, counts and source
 * order of the four trust points, three process steps and two alternative paths that were moved
 * verbatim out of the route, and guards that no decorative location-pin data was carried over and no
 * proof / response-time / phone claim was introduced.
 */

describe("contact trust points", () => {
  it("has exactly four, in source order, with the exact labels", () => {
    expect(contactTrustPoints.map((t) => t.label)).toEqual([
      "Clear, practical advice, not a sales pitch",
      "A real person reads every message",
      "Your details stay private, never sold",
      "No pressure and no obligation",
    ]);
  });

  it("each has a resolvable shared icon name and a wayfinding tone", () => {
    for (const t of contactTrustPoints) {
      expect(hasIcon(t.icon), `${t.icon} is a real Icon name`).toBe(true);
      expect(t.tone).toMatch(/^var\(--/);
    }
  });
});

describe("contact process steps", () => {
  it("has exactly three, in source order, with the exact titles and bodies", () => {
    expect(contactProcessSteps).toEqual([
      {
        order: 1,
        title: "You send a few details",
        body: "Your situation and what you'd like to achieve, in as much or as little detail as you like.",
        icon: "pen-tool",
      },
      {
        order: 2,
        title: "A person reviews it",
        body: "Someone here reads your message properly and looks at what you've described. Not a bot, not an auto-responder.",
        icon: "search",
      },
      {
        order: 3,
        title: "You get a practical reply",
        body: "One clear next step for your situation, by email. If we're not the right fit, we'll say so and point you somewhere better.",
        icon: "mail",
      },
    ]);
    for (const s of contactProcessSteps) expect(hasIcon(s.icon), `${s.icon} resolves`).toBe(true);
  });
});

describe("contact alternative paths", () => {
  it("has exactly two, in source order, with the exact copy and destinations", () => {
    expect(contactAlternativePaths).toEqual([
      {
        title: "Email us directly",
        body: "Prefer your own inbox? Write to us and the same real person will reply.",
        href: `mailto:${supportEmail}`,
        icon: "mail",
        tone: "var(--domain-operate)",
        external: true,
      },
      {
        title: "Build a growth plan",
        body: "Answer a few guided questions and get a structured starting point: what to do first, and what can wait.",
        href: "/growth-plan",
        icon: "compass",
        tone: "var(--domain-strategy)",
      },
    ]);
  });

  it("derives the email destination from supportEmail", () => {
    expect(contactAlternativePaths[0].href).toBe(`mailto:${supportEmail}`);
  });
});

describe("contact closing note", () => {
  it("preserves the exploratory-conversation statement verbatim", () => {
    expect(contactClosingNote).toBe(
      "The first conversation is exploratory. It's there to help you understand your options, not to sign you up to anything.",
    );
  });
});

describe("no invented claims or decorative pin data", () => {
  const allText = [
    ...contactTrustPoints.map((t) => t.label),
    ...contactProcessSteps.flatMap((s) => [s.title, s.body]),
    ...contactAlternativePaths.flatMap((p) => [p.title, p.body]),
    contactClosingNote,
  ].join(" ");

  it("makes no response-time, phone, rating, price or office-location claim", () => {
    expect(allText).not.toMatch(/within \d|\d+ hours|\bcall\b|\bphone\b|★|\brated\b|[£$€]\s?\d|\boffice\b|\bheadquarters\b/i);
  });

  it("carries no decorative location-pin / hub coordinate data", () => {
    // The old hero's PINS/HUB (country labels + x/y coordinates) are NOT part of the V2 content.
    const keys = new Set([
      ...contactTrustPoints.flatMap((t) => Object.keys(t)),
      ...contactProcessSteps.flatMap((s) => Object.keys(s)),
      ...contactAlternativePaths.flatMap((p) => Object.keys(p)),
    ]);
    for (const banned of ["x", "y", "lat", "lng", "pin", "hub"]) {
      expect(keys.has(banned), `no ${banned} coordinate key`).toBe(false);
    }
  });
});
