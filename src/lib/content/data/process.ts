import type { ProcessStep } from "@/lib/content/types";

/**
 * How we work, step by step — an education-first framing of the same steady
 * rhythm described in the Growth Guide (p.23: Discovery, Strategy, Setup,
 * Design & build, Launch, Track, Optimise, Grow), recast around understanding
 * before selling.
 */
export const processSteps: ProcessStep[] = [
  {
    order: 1,
    title: "Understand Your Goals",
    description: "We start by learning your business, your goals, and what's getting in the way, before talking about any service.",
    icon: "compass",
  },
  {
    order: 2,
    title: "Assess What You Already Have",
    description: "We look honestly at your current site, tools, and setup, so the plan builds on what's working rather than starting from scratch.",
    icon: "search",
  },
  {
    order: 3,
    title: "Identify Your Starting Point",
    description: "We work out where you actually are on the growth journey, and the smallest next step that moves you forward.",
    icon: "target",
  },
  {
    order: 4,
    title: "Build a Connected Plan",
    description: "We turn goals and gaps into a clear roadmap, scoped to your budget and timeline.",
    icon: "git-branch",
  },
  {
    order: 5,
    title: "Select the Right Tools & Services",
    description: "We choose the services and tools that fit your size and goals, tagged clearly by how we'd deliver each one.",
    icon: "layers",
  },
  {
    order: 6,
    title: "Build & Integrate",
    description: "We build the work and connect it properly, so every part feeds the next instead of sitting in a silo.",
    icon: "workflow",
  },
  {
    order: 7,
    title: "Measure & Improve",
    description: "We track what's actually happening, and use real numbers to fix weak points and improve what's working.",
    icon: "bar-chart-3",
  },
  {
    order: 8,
    title: "Support Future Growth",
    description: "We help you scale what pays back and add the next piece when you're ready, not before.",
    icon: "trending-up",
  },
];
