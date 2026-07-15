import type { CrossCuttingSystem } from "@/lib/content/types";

/**
 * The 3 cross-cutting systems (Growth Guide p.3). These run ACROSS the whole
 * 8-stage journey rather than sitting at one point in it. Names are locked exactly.
 */
export const systems: CrossCuttingSystem[] = [
  {
    key: "ai-automation",
    name: "AI & Automation",
    description:
      "Saves time and answers customers at every stage, not just at the end. Applied where it removes real repetitive work, not for its own sake.",
    color: "var(--pink)",
    icon: "zap",
  },
  {
    key: "analytics-data",
    name: "Analytics & Data",
    description:
      "Clean tracking from day one, so every decision across every stage is based on real numbers, not guesswork.",
    color: "var(--cyan)",
    icon: "bar-chart-3",
  },
  {
    key: "maintenance-scale",
    name: "Maintenance & Scale",
    description:
      "Security, updates, and support that protect everything after launch, so growth doesn't get undone by a preventable problem.",
    color: "var(--blue)",
    icon: "wrench",
  },
];
