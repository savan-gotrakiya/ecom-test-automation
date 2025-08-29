import chromium from "@sparticuz/chromium";
import { chromium as pwChromium } from "playwright-core";
import { logger } from "./logger.js";

export async function launchBrowser() {
  try {
    const browser = await pwChromium.launch({
      headless: true,
      executablePath: await chromium.executablePath(),
      args: chromium.args,
    });

    const context = await browser.newContext();
    const page = await context.newPage();
    return { browser, page };
  } catch (error) {
    logger.error("Error in launchBrowser", error);
    throw error;
  }
}
