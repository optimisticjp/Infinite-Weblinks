// @vitest-environment jsdom
import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, cleanup, within } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";
import { Card } from "@/components/primitives/Card";
import { CardGrid } from "@/components/primitives/CardGrid";
import { ArticleCard } from "@/components/cards/ArticleCard";
import { CaseStudyCard } from "@/components/cards/CaseStudyCard";

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

describe("Card — optional href (link root)", () => {
  it("without href renders a non-link div by default", () => {
    const { container } = render(<Card variant="raised">plain card</Card>);
    const root = container.firstElementChild!;
    expect(root.tagName).toBe("DIV");
    expect(container.querySelector("a")).toBeNull();
  });

  it("without href honours `as` (li / article)", () => {
    const { container, rerender } = render(
      <Card as="li" variant="plain">
        item
      </Card>,
    );
    expect(container.firstElementChild!.tagName).toBe("LI");
    rerender(
      <Card as="article" variant="raised">
        art
      </Card>,
    );
    expect(container.firstElementChild!.tagName).toBe("ARTICLE");
  });

  it("with href renders a SINGLE anchor as the root (whole card is the link, no nested link)", () => {
    const { container } = render(
      <Card href="/learn/example" variant="raised">
        <span>Read the guide</span>
      </Card>,
    );
    const root = container.firstElementChild!;
    expect(root.tagName).toBe("A");
    expect(root).toHaveAttribute("href", "/learn/example");
    // exactly one anchor in the whole card — no nested link
    expect(container.querySelectorAll("a")).toHaveLength(1);
    expect(screen.getByRole("link", { name: "Read the guide" })).toBe(root);
  });

  it("with href is auto-interactive and preserves className, style and accent", () => {
    const { container } = render(
      <Card href="/x" accent="var(--v2-domain-convert-ink)" className="myCard" style={{ marginTop: 4 }}>
        c
      </Card>,
    );
    const root = container.firstElementChild as HTMLElement;
    // non-scoped CSS-module class names in tests
    expect(root.className).toContain("interactive");
    expect(root.className).toContain("card");
    expect(root.className).toContain("myCard");
    expect(root.style.marginTop).toBe("4px");
    expect(root.style.getPropertyValue("--card-accent")).toBe("var(--v2-domain-convert-ink)");
  });

  it("renders the ordinal index badge aria-hidden regardless of link/static", () => {
    const { container } = render(
      <Card href="/x" index="01">
        c
      </Card>,
    );
    const badge = container.querySelector('[aria-hidden="true"]');
    expect(badge).not.toBeNull();
    expect(badge).toHaveTextContent("01");
  });
});

describe("CardGrid", () => {
  it("is a semantic list: a <ul> with one <li> per child", () => {
    const { container } = render(
      <CardGrid>
        <div>a</div>
        <div>b</div>
        <div>c</div>
      </CardGrid>,
    );
    const ul = container.querySelector("ul")!;
    expect(ul).not.toBeNull();
    expect(ul.querySelectorAll(":scope > li")).toHaveLength(3);
  });

  it("applies the requested layout class (equal / editorial)", () => {
    const eq = render(
      <CardGrid layout="equal">
        <div>a</div>
      </CardGrid>,
    );
    expect(eq.container.querySelector("ul")!.className).toContain("equal");
    eq.unmount();
    const ed = render(
      <CardGrid layout="editorial">
        <div>a</div>
      </CardGrid>,
    );
    expect(ed.container.querySelector("ul")!.className).toContain("editorial");
  });

  it("emphasises ONLY an explicitly-featured item, and only in the editorial layout", () => {
    // editorial: the featured child's cell spans; a non-featured (incl. index 0) does not.
    const ed = render(
      <CardGrid layout="editorial">
        <ArticleCard href="/a" title="A" excerpt="x" goalLabel="Guide" />
        <ArticleCard href="/b" title="B" excerpt="x" goalLabel="Guide" featured />
      </CardGrid>,
    );
    const items = ed.container.querySelectorAll("ul > li");
    expect(items[0].className).toContain("cell");
    expect(items[0].className).not.toContain("featuredCell");
    expect(items[1].className).toContain("featuredCell");
    ed.unmount();

    // equal: featured is ignored (uniform grid, no spanning cell).
    const eq = render(
      <CardGrid layout="equal">
        <ArticleCard href="/b" title="B" excerpt="x" goalLabel="Guide" featured />
      </CardGrid>,
    );
    expect(eq.container.querySelector("ul > li")!.className).not.toContain("featuredCell");
  });
});

describe("ArticleCard", () => {
  it("is one link with an <h3> title and visible goal label + reading time", () => {
    render(
      <ArticleCard
        href="/learn/foundations"
        title="How the pieces connect"
        excerpt="A short, plain-English read."
        goalLabel="Get found on Google"
        goalTone="var(--cyan)"
        readingTime="5 min read"
        icon="book-open"
      />,
    );
    const link = screen.getByRole("link");
    expect(link).toHaveAttribute("href", "/learn/foundations");
    const h3 = screen.getByRole("heading", { level: 3, name: "How the pieces connect" });
    expect(link).toContainElement(h3);
    expect(screen.getByText("Get found on Google")).toBeVisible();
    expect(screen.getByText("5 min read")).toBeVisible();
  });

  it("maps the goal tone to an accessible V2 ink (never a raw colour)", () => {
    const { container } = render(
      <ArticleCard href="/x" title="T" excerpt="e" goalLabel="Guide" goalTone="var(--cyan)" />,
    );
    const link = container.querySelector("a") as HTMLElement;
    expect(link.style.getPropertyValue("--card-accent")).toBe("var(--v2-domain-discover-ink)");
  });

  it("renders no image, author or date placeholder", () => {
    const { container } = render(
      <ArticleCard href="/x" title="T" excerpt="e" goalLabel="Guide" readingTime="3 min read" />,
    );
    expect(container.querySelector("img")).toBeNull();
    expect(container.textContent).not.toMatch(/by\s|author|202\d/i);
  });
});

describe("CaseStudyCard", () => {
  it("every illustrative card visibly declares itself an example (on the card, not just the page)", () => {
    render(
      <CaseStudyCard
        href="/case-studies/ecommerce"
        title="Turning browsers into buyers"
        forWho="An online store"
        summary="Fix the store, tracking and follow-up together."
        tone="var(--domain-convert)"
      />,
    );
    const link = screen.getByRole("link");
    expect(within(link).getByText("Illustrative example")).toBeVisible();
    expect(screen.getByRole("heading", { level: 3, name: "Turning browsers into buyers" })).toBeInTheDocument();
    expect(screen.getByText("An online store")).toBeVisible();
  });

  it("shows a real status badge and supports a future verified status without inventing content", () => {
    const { rerender } = render(
      <CaseStudyCard href="/x" title="T" forWho="w" summary="s" status="illustrative" />,
    );
    expect(screen.getByText("Illustrative example")).toBeInTheDocument();
    expect(screen.queryByText(/verified/i)).toBeNull();
    rerender(<CaseStudyCard href="/x" title="T" forWho="w" summary="s" status="verified" />);
    expect(screen.getByText("Verified case study")).toBeInTheDocument();
    expect(screen.queryByText("Illustrative example")).toBeNull();
  });

  it("renders no numeric result, client name, logo or testimonial", () => {
    const { container } = render(
      <CaseStudyCard href="/x" title="T" forWho="A local service business" summary="Get found and capture leads." />,
    );
    expect(container.querySelector("img")).toBeNull();
    // no digits presented as an outcome metric
    expect(container.textContent).not.toMatch(/\d+%|\d+x/i);
  });
});
