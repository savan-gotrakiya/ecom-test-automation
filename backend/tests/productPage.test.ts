// src/tests/productPage.test.ts
import { Page, ElementHandle } from "playwright-core";
import { CheckResult } from "../types";
import { logger } from "../utils/logger";

async function detectProductPrice(
  page: Page
): Promise<string | null | undefined> {
  try {
    const selectors = [".price-container", ".product-price", ".price"];

    // Wait for whichever selector appears first
    const priceElement = await Promise.race(
      selectors.map((sel) =>
        page.waitForSelector(sel, { timeout: 2000 }).catch(() => null)
      )
    );

    let priceText: string | null = null;

    if (priceElement) {
      priceText = await priceElement.textContent();
    } else {
      // Fallback: Search entire page HTML with regex
      const html = await page.content();
      const match = html.match(
        /(Rs\.?|INR|₹|\$|€|¥)\s?\d{1,3}(,\d{3})*(\.\d{1,2})?/
      );
      if (match) {
        priceText = match[0];
      }
    }

    return priceText;
  } catch (error: any) {
    logger.error(`Error processing detectProductPrice`, error.message);
    return null;
  }
}

async function detectProductTitle(
  page: Page
): Promise<string | null | undefined> {
  try {
    const titleElement: ElementHandle<Element> | null = await page.$(
      "h1, h2, .product-title, div[class*='product_title'] p"
    );

    let title: string | null = null;

    if (titleElement) {
      title = (await titleElement.textContent())?.trim() || null;
    } else {
      // Fallback: find largest heading
      const headings = await page.$$eval("h1, h2, h3", (nodes) =>
        nodes.map((n) => ({
          text: n.textContent?.trim() || "",
          size: parseInt(window.getComputedStyle(n).fontSize),
        }))
      );
      if (headings.length > 0) {
        title = headings.sort((a, b) => b.size - a.size)[0].text;
      }
    }

    return title;
  } catch (error: any) {
    logger.error(`Error processing detectProductTitle`, error.message);
  }
}

export async function detectProductDescription(
  page: Page
): Promise<string | null | undefined> {
  try {
    // 1. Meta description (SEO)
    const metaDesc = await page
      .$eval('meta[name="description"]', (el) =>
        (el as HTMLMetaElement).content.trim()
      )
      .catch(() => null);
    if (metaDesc) return metaDesc;

    // 2. Common description selectors
    const selectors = [
      "#description",
      ".product-description",
      ".description",
      "[aria-label*='description' i]",
      "[id*='description' i]",
      "[class*='description' i]",
    ];

    for (const selector of selectors) {
      const desc = await page
        .$eval(selector, (el) => el.textContent?.trim() || "")
        .catch(() => null);
      if (desc) return desc;
    }

    // 3. Fallback: longest paragraph on the page
    const paragraphs = await page.$$eval("p", (els) =>
      els.map((el) => el.innerText.trim()).filter(Boolean)
    );
    if (paragraphs.length > 0) {
      return paragraphs.sort((a, b) => b.length - a.length)[0]; // pick longest
    }

    return null;
  } catch (error: any) {
    logger.error(`Error processing detectProductDescription`, error.message);
  }
}

export async function checkCriticalElements(page: Page): Promise<CheckResult> {
  try {
    const issues: string[] = [];

    const [title, price, description] = await Promise.allSettled([
      detectProductTitle(page),
      detectProductPrice(page),
      detectProductDescription(page),
    ]);

    if (!title) issues.push("Title missing");
    if (!price) issues.push("Price missing");
    if (!description) issues.push("Description missing");

    return { status: issues.length ? "FAIL" : "PASS", issues };
  } catch (err: any) {
    logger.error(`Error processing checkCriticalElements`, err.message);
    return { status: "FAIL", issues: ["Failed to check critical elements"] };
  }
}
