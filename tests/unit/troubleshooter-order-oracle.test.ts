import { describe, it, expect } from "vitest";
import { troubleshooterProblems } from "@/lib/content/data/troubleshooter";

/**
 * Phase 2R (§A.2) — a FROZEN order oracle for the eight troubleshooter problems. The expected reason
 * titles and check strings below are hardcoded (NOT derived from `troubleshooterProblems`), so a
 * reorder, omission, duplicate or insertion in the source data fails clearly here. Reason/check COPY
 * is owned by the content; this test only freezes their exact set + source order.
 */

const ORACLE: Record<string, { reasons: string[]; checks: string[] }> = {
  "visit-no-buy": {
    reasons: ["Unclear offer", "Weak product page", "Limited trust", "Mobile friction", "Difficult checkout"],
    checks: [
      "Test the full purchase journey on your own phone, start to finish.",
      "Check whether visitors actually reach the checkout, and where they drop off.",
      "Read your key pages as a first-time buyer — is the message clear and simple?",
      "Look for unexpected friction: forms, fees or slow steps.",
      "Ask a few recent customers what nearly stopped them.",
    ],
  },
  "spend-no-clarity": {
    reasons: ["No clean tracking", "Scattered data", "Vanity metrics", "No single view"],
    checks: [
      "Confirm every important action (purchase, enquiry) is tracked in one place.",
      "Check that ad platforms and analytics agree on the same conversions.",
      "Map each channel to the enquiries or sales it actually produced.",
      "Pause one channel briefly and watch whether results change.",
      "Write down the one number that tells you a campaign worked.",
    ],
  },
  "slow-follow-up": {
    reasons: ["Manual handling", "No routing", "No reminders", "No record"],
    checks: [
      "Time how long a typical enquiry waits for a first reply.",
      "Check that every enquiry lands somewhere a person will see it fast.",
      "Set a clear owner and a target response time.",
      "Add a simple reminder for a second and third follow-up.",
      "Keep a short record of each conversation in one place.",
    ],
  },
  "few-enquiries": {
    reasons: ["Hard to find", "Wrong audience", "No clear next step", "Thin content"],
    checks: [
      "Search for what you sell and see whether you appear.",
      "Check that each key page has one obvious next step.",
      "Review who is arriving and whether they fit your ideal customer.",
      "Add content that answers real buyer questions.",
      "Make it easy to enquire from every important page.",
    ],
  },
  "buy-once-disappear": {
    reasons: ["No follow-up", "No reason to return", "Weak onboarding", "No memory"],
    checks: [
      "Check whether anything reaches a customer after their first order.",
      "Add a simple thank-you and helpful next-step message.",
      "Give a clear reason and reminder to buy again.",
      "Group customers so messages can fit what they bought.",
      "Ask lapsed customers what would bring them back.",
    ],
  },
  "tools-not-connected": {
    reasons: ["Data silos", "Manual re-entry", "No source of truth", "Gaps in the flow"],
    checks: [
      "List your tools and what each one is the source of truth for.",
      "Find any information you type into more than one place.",
      "Check where a customer record breaks between tools.",
      "Connect the two tools that would save the most time first.",
      "Agree which system wins when two disagree.",
    ],
  },
  "wasted-time": {
    reasons: ["Manual steps", "Copy and paste", "Unstable process", "No triggers"],
    checks: [
      "List the tasks your team repeats every week.",
      "Mark which of those follow the same steps every time.",
      "Stabilise one process so it is ready to automate.",
      "Automate the highest-volume repetitive task first.",
      "Check the automation with a person before trusting it fully.",
    ],
  },
  "unsure-priority": {
    reasons: ["Too many options", "No clear goal", "No full picture", "Fear of the wrong move"],
    checks: [
      "Write down the one goal that matters most this quarter.",
      "Map where you are on the growth journey today.",
      "Find the one step that unlocks the most that comes after it.",
      "Ignore anything that does not serve that goal for now.",
      "Commit to a single next step and a date.",
    ],
  },
};

describe("troubleshooter order oracle (frozen, not derived from the source)", () => {
  it("covers exactly the eight problem slugs in source order", () => {
    expect(troubleshooterProblems.map((p) => p.slug)).toEqual(Object.keys(ORACLE));
  });

  for (const [slug, expected] of Object.entries(ORACLE)) {
    it(`${slug}: reason titles match the oracle exactly, in order`, () => {
      const problem = troubleshooterProblems.find((p) => p.slug === slug)!;
      expect(problem.reasons.map((r) => r.title)).toEqual(expected.reasons);
    });
    it(`${slug}: checks match the oracle exactly, in order`, () => {
      const problem = troubleshooterProblems.find((p) => p.slug === slug)!;
      expect(problem.checks).toEqual(expected.checks);
    });
  }
});
