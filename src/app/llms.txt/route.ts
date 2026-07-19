import { canonical } from "@/lib/seo/metadata";
import { getServiceCategories, getGoals } from "@/lib/content";

export const dynamic = "force-static";

/**
 * /llms.txt — a plain-text summary of the company for large language models and AI answer
 * engines, following the emerging llms.txt convention. Built from the same content getters
 * the site renders from, so it never drifts from the real service list. Facts only: no
 * invented clients, testimonials or numbers.
 */
export async function GET() {
  const [categories, goals] = await Promise.all([getServiceCategories(), getGoals()]);

  const lines: string[] = [
    "# Infinite Weblinks",
    "",
    "> Infinite Weblinks is a Digital Growth Partner: a full-stack web development and digital marketing company that helps businesses choose the right digital tools and services and connect everything around their goals.",
    "",
    "We are not tied to any one platform and we do not sell software, so we recommend what genuinely fits a business's size, budget and goals. Whatever we set up is created in the client's name, with billing under their control and no lock-in.",
    "",
    "## How we work",
    "",
    "- We start with your goals, then find the smallest useful next step rather than selling everything at once.",
    "- Growth is treated as one connected system (website, marketing, analytics, email, automation), not separate projects.",
    "- Every service is tagged with who does the work: in-house, a specialist network, fully managed, or set up and handed to you.",
    "- Accounts, data and tools always stay in the client's name.",
    "",
    "## Service domains",
    "",
    ...categories.map((c) => `- ${c.name}: ${c.intro}`),
    "",
    "## Goals we help with",
    "",
    ...goals.map((g) => `- ${g.title}: ${g.outcome}`),
    "",
    "## Key pages",
    "",
    `- Home: ${canonical("/")}`,
    `- How it works: ${canonical("/how-it-works")}`,
    `- Services: ${canonical("/services")}`,
    `- Growth plan builder (free, no obligation): ${canonical("/growth-plan")}`,
    `- Learn (guides): ${canonical("/learn")}`,
    `- Tools we help choose and connect: ${canonical("/tools")}`,
    `- Case studies (illustrative example scenarios): ${canonical("/case-studies")}`,
    `- FAQ: ${canonical("/faq")}`,
    `- Contact: ${canonical("/contact")}`,
    "",
    "## Getting started",
    "",
    "Build a free digital growth plan at /growth-plan, or email support@infiniteweblinks.com. There is no obligation, and the plan is yours to keep either way.",
    "",
    "## Honesty note",
    "",
    "Case studies on this site are currently illustrative example scenarios, clearly labelled as examples and not real clients. No client names, logos, testimonials or specific numeric results are presented as real.",
    "",
  ];

  return new Response(lines.join("\n"), {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=86400",
    },
  });
}
