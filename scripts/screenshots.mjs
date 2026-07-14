import { chromium } from "@playwright/test";

const BASE = process.env.BASE_URL ?? "http://127.0.0.1:3100";
const OUT = "artifacts/screenshots";
const wait = (ms) => new Promise((r) => setTimeout(r, ms));

const browser = await chromium.launch({
  executablePath: process.env.PW_CHROMIUM ?? "/opt/pw-browsers/chromium",
  headless: true,
});

async function shot(name, { width, height, reducedMotion, full = false, action } = {}) {
  const ctx = await browser.newContext({
    viewport: { width, height },
    deviceScaleFactor: 2,
    reducedMotion: reducedMotion ? "reduce" : "no-preference",
  });
  const page = await ctx.newPage();
  await page.goto(BASE, { waitUntil: "load", timeout: 20000 });
  await wait(reducedMotion ? 300 : 1900); // let the hero intro settle
  if (action) await action(page);
  await page.screenshot({ path: `${OUT}/${name}.png`, fullPage: full });
  await ctx.close();
  console.log("✓", name);
}

// Desktop
await shot("01-desktop-hero", { width: 1440, height: 900 });
await shot("02-desktop-home-full", { width: 1440, height: 900, full: true });
await shot("03-desktop-megamenu", {
  width: 1440,
  height: 900,
  action: async (page) => {
    await page.getByRole("button", { name: "How It Works" }).hover();
    await wait(450);
  },
});
await shot("04-desktop-reduced-motion", { width: 1440, height: 900, reducedMotion: true });

// Tablet
await shot("05-tablet-home-full", { width: 768, height: 1024, full: true });

// Mobile
await shot("06-mobile-home-full", { width: 390, height: 844, full: true });
await shot("07-mobile-nav-open", {
  width: 390,
  height: 844,
  action: async (page) => {
    await page.getByRole("button", { name: "Open menu" }).click();
    await wait(400);
  },
});

await browser.close();
console.log("done");
