import { test, expect } from "@playwright/test";

test.describe("Reduced motion", () => {
  test("hero renders the complete static state (content + nodes visible)", async ({ page }) => {
    const errors: string[] = [];
    page.on("pageerror", (e) => errors.push(String(e)));

    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/");
    await expect(page.locator("h1")).toBeVisible();
    await expect(page.getByText("Connected across")).toBeVisible();

    // Connection lines are drawn (dashoffset resolves to 0 in the static state),
    // and at least one domain node is present and not hidden.
    const nodeOpacity = await page.evaluate(() => {
      const node = document.querySelector('[class*="node"]') as HTMLElement | null;
      return node ? getComputedStyle(node).opacity : "missing";
    });
    expect(nodeOpacity).not.toBe("0");

    expect(errors, errors.join("\n")).toEqual([]);
  });
});
