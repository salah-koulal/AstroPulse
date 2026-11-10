import { chromium } from "@playwright/test";
const browser = await chromium.launch({
  executablePath: process.env.CHROMIUM_PATH,
  args: [
    "--no-sandbox",
    "--use-angle=swiftshader",
    "--enable-unsafe-swiftshader",
  ],
});
const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
page.on("pageerror", (error) => console.error(error));
await page.goto("http://127.0.0.1:5177");
await page.waitForFunction(
  () =>
    document
      .querySelector('[data-testid="model-stage"]')
      ?.getAttribute("data-status") === "ready",
);
await page.waitForTimeout(1000);
await page.screenshot({ path: "/tmp/astropulse-suit.png", fullPage: true });
await page.getByRole("button", { name: "Cardiovascular", exact: true }).click();
await page.waitForFunction(
  () =>
    document
      .querySelector('[data-testid="model-stage"]')
      ?.getAttribute("data-status") === "ready",
);
await page.waitForTimeout(1000);
await page.screenshot({ path: "/tmp/astropulse-anatomy.png", fullPage: true });
console.log(
  await page.locator('[data-testid="model-stage"]').evaluate((el) => ({
    camera: el.dataset.camera,
    status: el.dataset.status,
  })),
);
await page.getByRole("button", { name: "AI Agent", exact: true }).click();
await page.screenshot({ path: "/tmp/astropulse-agent.png", fullPage: true });
await page.setViewportSize({ width: 390, height: 844 });
await page.screenshot({ path: "/tmp/astropulse-mobile.png", fullPage: true });
await browser.close();
