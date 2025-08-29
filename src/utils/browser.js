import { chromium } from "playwright-chromium";
import { logger } from "./logger.js";

export async function launchBrowser() {
  try {
    // Launch headless Chromium
    const browser = await chromium.launch({
      headless: true,
      args: ["--no-sandbox", "--disable-setuid-sandbox"], // required for serverless
    });
    const context = await browser.newContext();
    const page = await context.newPage();
    return { browser, page };
  } catch (error) {
    logger.error("Error in launchBrowser", error);
    throw error;
  }
}
