// @vitest-environment jsdom
import { describe, it, expect, afterEach } from "vitest";
import { render, screen, cleanup, within } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";
import { TroubleshooterReasonCard } from "@/components/cards/TroubleshooterReasonCard";
import { TroubleshooterChecklist } from "@/components/routes/TroubleshooterChecklist";

afterEach(cleanup);

describe("TroubleshooterReasonCard", () => {
  it("is a static article card (no link, no button) with an H3 title and the full body", () => {
    const { container } = render(
      <TroubleshooterReasonCard
        title="Unclear offer"
        body="Visitors do not instantly see what you sell or why it matters to them."
        icon="help-circle"
        tone="var(--pink)"
      />,
    );
    const article = container.querySelector("article");
    expect(article, "renders an article").not.toBeNull();
    expect(within(article as HTMLElement).getByRole("heading", { level: 3, name: "Unclear offer" })).toBeInTheDocument();
    expect(
      screen.getByText("Visitors do not instantly see what you sell or why it matters to them."),
    ).toBeInTheDocument();
    expect(container.querySelector("a"), "no link").toBeNull();
    expect(container.querySelector("button"), "no button").toBeNull();
    // A decorative icon is rendered (aria-hidden svg).
    expect(container.querySelector("svg")).not.toBeNull();
  });

  it("maps the tone through the domain bridge to a V2 ink accent (never a raw/legacy colour)", () => {
    const { container } = render(
      <TroubleshooterReasonCard title="T" body="B" icon="shield" tone="var(--pink)" />,
    );
    const article = container.querySelector("article") as HTMLElement;
    // --pink → convert; the mapped ink is a V2 token, not the legacy input.
    expect(article.style.getPropertyValue("--card-accent")).toBe("var(--v2-domain-convert-ink)");
  });
});

describe("TroubleshooterChecklist", () => {
  const checks = [
    "Test the full purchase journey on your own phone, start to finish.",
    "Check whether visitors actually reach the checkout, and where they drop off.",
    "Read your key pages as a first-time buyer — is the message clear and simple?",
  ];

  it("renders a semantic ordered list with every check, in source order, with a visible number", () => {
    const { container } = render(<TroubleshooterChecklist checks={checks} tone="var(--pink)" />);
    const ol = container.querySelector("ol");
    expect(ol, "is an <ol>").not.toBeNull();
    const items = container.querySelectorAll("ol > li");
    expect(items).toHaveLength(3);
    items.forEach((li, i) => {
      expect(li).toHaveTextContent(String(i + 1)); // visible sequence number
      expect(li).toHaveTextContent(checks[i]); // full check text, in source order
    });
  });

  it("is purely informational — no checkbox, no interaction, no completion/progress state", () => {
    const { container } = render(<TroubleshooterChecklist checks={checks} />);
    expect(container.querySelector("input"), "no checkbox/input").toBeNull();
    expect(container.querySelector("button"), "no button").toBeNull();
    expect(container.querySelector('[role="progressbar"]')).toBeNull();
    expect(container.textContent ?? "").not.toMatch(/\bdone\b|\bcompleted?\b|\bin progress\b/i);
  });
});
