// src/tests/productPage.test.ts
import { Page, ElementHandle } from "playwright-core";
import { CheckResult } from "../types";


async function detectProductPrice(page: Page): Promise<string | null> {
  const selectors = [".price-container", ".product-price", ".price"];
  let priceText: string | null = null;

  for (const selector of selectors) {
    try {
      await page.waitForSelector(selector, { timeout: 10000 });
      priceText = await page.textContent(selector);
      if (priceText) break;
    } catch {
      // Ignore and try next selector
    }
  }

  if (!priceText) {
    // Fallback: Search entire page HTML with regex
    const html = await page.content();
    const match = html.match(
      /(Rs\.?|INR|₹|\$|€|¥)\s?\d{1,3}(,\d{3})*(\.\d{1,2})?/
    );
    if (match) priceText = match[0];
  }

  return priceText;
}

async function detectProductTitle(page: Page): Promise<string | null> {
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
}

export async function detectProductDescription(page: Page): Promise<string | null> {
  // 1. Meta description (SEO)
  const metaDesc = await page.$eval(
    'meta[name="description"]',
    el => (el as HTMLMetaElement).content.trim()
  ).catch(() => null);
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
    const desc = await page.$eval(selector, el => el.textContent?.trim() || "")
      .catch(() => null);
    if (desc) return desc;
  }

  // 3. Fallback: longest paragraph on the page
  const paragraphs = await page.$$eval("p", els =>
    els.map(el => el.innerText.trim()).filter(Boolean)
  );
  if (paragraphs.length > 0) {
    return paragraphs.sort((a, b) => b.length - a.length)[0]; // pick longest
  }

  return null;
}


export async function checkCriticalElements(page: Page): Promise<CheckResult> {
  const issues: string[] = [];

  const title = await detectProductTitle(page);
  const price = await detectProductPrice(page);
  const description = await detectProductDescription(page);
  console.log('title:', title)
  console.log('price:', price)
  console.log('description:', description)

  if (!title) issues.push("Title missing");
  if (!price) issues.push("Price missing");
  if (!description) issues.push("Description missing");

  return { status: issues.length ? "FAIL" : "PASS", issues };
}
