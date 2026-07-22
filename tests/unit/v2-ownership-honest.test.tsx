// @vitest-environment jsdom
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { describe, it, expect, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";
import { OwnershipDetails } from "@/components/routes/OwnershipDetails";
import { HonestExpectationsPanel } from "@/components/routes/HonestExpectationsPanel";
import { accountOwnership } from "@/lib/content/data/account-ownership";
import { honestExpectationsWont, honestExpectationsPromise } from "@/lib/content/data/honest-expectations";

/**
 * Phase 2L — the two reusable ownership / honest-expectations building blocks extracted from the
 * homepage trust section, so /about and /account-ownership reuse the approved content verbatim.
 */

afterEach(cleanup);
const read = (rel: string) => readFileSync(fileURLToPath(new URL(rel, import.meta.url)), "utf8");
/** Source with block/line comments stripped, so a regex checks real code, not a doc comment
 *  that legitimately names the very thing it promises NOT to render. */
const readCode = (rel: string) =>
  read(rel)
    .replace(/\/\*[\s\S]*?\*\//g, "")
    .replace(/(^|[^:])\/\/.*$/gm, "$1");

describe("OwnershipDetails", () => {
  it("renders every asset, the full ordered flow, every guarantee and the complete closing", () => {
    const { container } = render(<OwnershipDetails data={accountOwnership} />);

    // The vault label + the ownership line + every asset in source order.
    expect(screen.getByText(accountOwnership.vaultLabel)).toBeVisible();
    expect(screen.getByText("Owned and controlled by you")).toBeVisible();
    const assetItems = [...container.querySelectorAll("ul li")].map((li) => li.textContent?.trim());
    for (const asset of accountOwnership.assets) {
      expect(screen.getByText(asset.label)).toBeVisible();
    }

    // The build flow is a semantic ordered list, in source order.
    const flowItems = [...container.querySelectorAll("ol li")].map((li) => li.textContent?.trim() ?? "");
    expect(flowItems).toEqual(accountOwnership.flow.map((f) => f.label));

    // Every guarantee title (H3) + body.
    for (const g of accountOwnership.guarantees) {
      expect(screen.getByRole("heading", { level: 3, name: g.title })).toBeInTheDocument();
      expect(screen.getByText(g.body)).toBeVisible();
    }

    // The complete closing statement.
    const closing = `${accountOwnership.closing.pre}${accountOwnership.closing.accent}${accountOwnership.closing.post}`;
    expect(screen.getByText(closing)).toBeVisible();

    // Sanity: asset labels are present among the rendered list items.
    for (const a of accountOwnership.assets) expect(assetItems).toContain(a.label);
  });

  it("has NO CTA, NO section root, and maps each flow tone to a V2 ink (no raw colour)", () => {
    const { container } = render(<OwnershipDetails data={accountOwnership} />);
    expect(container.querySelector("a"), "no link CTA").toBeNull();
    expect(container.querySelector("button"), "no button CTA").toBeNull();
    expect(container.querySelector("section"), "no section root").toBeNull();
    expect(container.querySelector("h1, h2"), "no H1/H2 (composed under a section heading)").toBeNull();
    const flowInks = [...container.querySelectorAll("ol li")].map((li) => (li as HTMLElement).style.getPropertyValue("--flow-ink"));
    flowInks.forEach((ink) => expect(ink).toMatch(/^var\(--v2-/));
  });

  it("is a static composition — no NodeOrb, tool constellation, glow or animation in source", () => {
    const src = readCode("../../src/components/routes/OwnershipDetails.tsx");
    const css = read("../../src/components/routes/OwnershipDetails.module.css");
    expect(src).not.toMatch(/NodeOrb|constellation|Starfield|useState|useEffect|"use client"/i);
    // The legacy "Set up and connected in your name" tool grid is not reproduced here.
    expect(src).not.toMatch(/Set up and connected in your name/);
    expect(css).not.toMatch(/@keyframes|animation:|box-shadow:[^;]*glow/i);
  });
});

describe("HonestExpectationsPanel", () => {
  it("renders both columns with every item in source order, as semantic lists", () => {
    const { container } = render(<HonestExpectationsPanel columnLevel={3} />);
    expect(screen.getByRole("heading", { level: 3, name: "What we won't do" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { level: 3, name: "What we do promise" })).toBeInTheDocument();

    const lists = container.querySelectorAll("ul");
    expect(lists.length).toBe(2);
    const wontTitles = [...lists[0].querySelectorAll("li")].map((li) => li.querySelector("span span")?.textContent);
    const promiseTitles = [...lists[1].querySelectorAll("li")].map((li) => li.querySelector("span span")?.textContent);
    expect(wontTitles).toEqual(honestExpectationsWont.map((w) => w.title));
    expect(promiseTitles).toEqual(honestExpectationsPromise.map((p) => p.title));

    // Visible textual status — meaning is not carried by colour alone.
    for (const item of [...honestExpectationsWont, ...honestExpectationsPromise]) {
      expect(screen.getByText(item.title)).toBeVisible();
      expect(screen.getByText(item.body)).toBeVisible();
    }
  });

  it("renders an optional heading/intro one level above the columns, and honours the id", () => {
    const { container } = render(
      <HonestExpectationsPanel id="honest" heading="Honest expectations" intro="Plain version." columnLevel={4} />,
    );
    expect(container.querySelector("#honest")).not.toBeNull();
    expect(screen.getByRole("heading", { level: 3, name: "Honest expectations" })).toBeInTheDocument();
    expect(screen.getByText("Plain version.")).toBeVisible();
    // Columns sit one level below the panel heading.
    expect(screen.getByRole("heading", { level: 4, name: "What we won't do" })).toBeInTheDocument();
  });

  it("has no section root, no NodeOrb and reads the centralised data (no local arrays)", () => {
    const { container } = render(<HonestExpectationsPanel />);
    expect(container.querySelector("section")).toBeNull();
    const src = readCode("../../src/components/routes/HonestExpectationsPanel.tsx");
    expect(src).toMatch(/from "@\/lib\/content\/data\/honest-expectations"/);
    expect(src).not.toMatch(/NodeOrb|"use client"/);
    expect(src).not.toMatch(/const\s+(WONT|PROMISE|wont|promise)\s*[:=]\s*\[/);
  });
});
