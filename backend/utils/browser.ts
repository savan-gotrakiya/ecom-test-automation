import { Page, Browser, chromium as pwChromium } from "playwright-core";
import chromiumServerless from "@sparticuz/chromium";
import { logger } from "./logger";
import { BrowserInstance } from "../types";

const isServerless = !!process.env.VERCEL; // true on Vercel

export async function launchBrowser(): Promise<BrowserInstance> {
  try {
    let executablePath: string | undefined;
    let args: string[] = [];

    if (isServerless) {
      // Use sparticuz Chromium on Vercel (Linux serverless)
      executablePath = await chromiumServerless.executablePath();
      args = chromiumServerless.args;
    } else {
      // Use normal Playwright Chromium locally
      const { chromium } = await import("playwright-chromium");
      executablePath = undefined; // use default
      args = ["--no-sandbox", "--disable-setuid-sandbox"];
    }

    const browser: Browser = await pwChromium.launch({
      headless: true,
      executablePath,
      args,
    });

    const context = await browser.newContext();
    const page: Page = await context.newPage();

    return { browser, page };
  } catch (error: unknown) {
    logger.error("Error in launchBrowser", error);
    throw error;
  }
}
