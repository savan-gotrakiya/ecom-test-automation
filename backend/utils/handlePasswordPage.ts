// src/utils/handlePasswordPage.ts
import { Page } from "playwright-core";
import { logger } from "./logger";

export async function handlePasswordPage(
  page: Page,
  url: string,
  password?: string,
  reqId?: string
): Promise<void> {
  try {
    if (!password) return;

    await page.goto(url, { waitUntil: "domcontentloaded" });

    const isPasswordPage = await page
      .locator('form[action="/password"]')
      .count();

    if (isPasswordPage > 0) {
      logger.info(
        `${
          reqId ? `[${reqId}] ` : ""
        }Password page detected. Entering password...`
      );

      // If button to reveal password input exists, click it
      const showPasswordBtn = page.locator(
        'button:has-text("Enter using password"), a:has-text("Enter using password")'
      );

      if (await showPasswordBtn.count()) {
        await showPasswordBtn.click();
        await page.waitForTimeout(1000); // Wait for animation
      }

      // Fill password
      await page.fill("#Password", password);

      // Click submit and wait for navigation
      await Promise.all([
        page.waitForNavigation({ waitUntil: "domcontentloaded" }),
        page.click('button[name="commit"], button[type="submit"]'),
      ]);

      logger.info(
        `${reqId ? `[${reqId}] ` : ""}Password entered. Page unlocked!`
      );
    }
  } catch (error: unknown) {
    logger.error("Error in handlePasswordPage: ", error);
  }
}
