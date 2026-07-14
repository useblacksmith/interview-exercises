// Minimal example: launch a browser, visit the target app, save a screenshot.
// This is the only agent code provided — the loop is yours to design.
import { chromium } from "playwright";
import { mkdirSync } from "fs";

const BASE_URL = process.env.TARGET_URL || "http://localhost:3000";

mkdirSync("report", { recursive: true });

const browser = await chromium.launch();
const page = await browser.newPage();
await page.goto(BASE_URL);
await page.screenshot({ path: "report/home.png", fullPage: true });
console.log(`Visited ${BASE_URL} (${await page.title()}) — screenshot saved to report/home.png`);
await browser.close();
