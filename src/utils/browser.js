import { chromium } from "playwright";

export async function launchBrowser() {
  try {
    const browser = await chromium.launch({ headless: true });
    const context = await browser.newContext();
    const page = await context.newPage();
    return { browser, page };
  } catch (error) {
    console.log("Error in launchBrowser", error);
    throw error;
  }
}
