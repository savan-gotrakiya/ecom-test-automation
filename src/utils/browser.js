import { chromium } from "playwright";
import { logger } from "./logger.js";

export async function launchBrowser() {
  try {
    const browser = await chromium.launch({ headless: true });
    const context = await browser.newContext();
    const page = await context.newPage();
    return { browser, page };
  } catch (error) {
    logger.error("Error in launchBrowser", error);
    throw error;
  }
}
