// Internal sanity check that the planted bugs are reproducible. Not part of the exercise.
import { chromium } from "playwright";
import { mkdirSync } from "fs";

mkdirSync("report", { recursive: true });
const browser = await chromium.launch();

// Bug 2: visual regression on /products
for (const [v, url] of [["v1", "http://localhost:3000"], ["v2", "http://localhost:3001"]]) {
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
  await page.goto(`${url}/products`);
  await page.screenshot({ path: `report/products-${v}.png`, fullPage: true });
  await page.close();
}
console.log("bug2: screenshots saved report/products-v{1,2}.png");

// Bug 4: console error + duplicate API call on product detail (v2)
for (const [v, url] of [["v1", "http://localhost:3000"], ["v2", "http://localhost:3001"]]) {
  const page = await browser.newPage();
  const errors = [];
  const reviewCalls = [];
  page.on("console", (m) => m.type() === "error" && errors.push(m.text()));
  page.on("pageerror", (e) => errors.push(String(e)));
  page.on("request", (r) => r.url().includes("/reviews") && reviewCalls.push(r.url()));
  await page.goto(`${url}/products/1`);
  await page.waitForTimeout(800);
  console.log(`bug4 ${v}: consoleErrors=${errors.length} reviewCalls=${reviewCalls.length}`);
  await page.close();
}

// Bug 5a: wizard state lost on refresh (v2)
for (const [v, url] of [["v1", "http://localhost:3000"], ["v2", "http://localhost:3001"]]) {
  const page = await browser.newPage();
  await page.goto(`${url}/checkout`);
  await page.click('[data-testid="to-shipping"]');
  await page.fill("#address", "1 Forge Lane");
  await page.click('[data-testid="to-confirm"]');
  await page.reload();
  const onConfirm = await page.isVisible("#step-3");
  console.log(`bug5a ${v}: still on confirm step after refresh = ${onConfirm}`);
  await page.close();
}

// Bug 5b: double-submit creates duplicate orders (v2)
for (const [v, url] of [["v1", "http://localhost:3000"], ["v2", "http://localhost:3001"]]) {
  const page = await browser.newPage();
  const before = (await (await fetch(`${url}/api/orders`)).json()).orders.length;
  await page.goto(`${url}/checkout`);
  await page.click('[data-testid="to-shipping"]');
  await page.fill("#address", "2 Hammer St");
  await page.click('[data-testid="to-confirm"]');
  await page.click('[data-testid="place-order"]');
  await page.click('[data-testid="place-order"]', { force: true }).catch(() => {});
  await page.waitForTimeout(1500);
  const after = (await (await fetch(`${url}/api/orders`)).json()).orders.length;
  console.log(`bug5b ${v}: orders created by one checkout = ${after - before}`);
  await page.close();
}

await browser.close();
