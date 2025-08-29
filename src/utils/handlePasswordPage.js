import { logger } from "./logger.js";

export async function handlePasswordPage(page, url, password) {
  try {
    await page.goto(url, {
      waitUntil: "domcontentloaded",
    });

    const isPasswordPage = await page
      .locator('form[action="/password"]')
      .count();

    if (isPasswordPage > 0) {
      logger.info("Password page detected. Entering password...");

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

      logger.info("Password entered. Page unlocked!");
    }
  } catch (error) {
    logger.error("Error in handlePasswordPage: ", error);
  }
}
