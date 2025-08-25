async function detectProductPrice(page) {
  const selectors = [".price-container", ".product-price", ".price"];
  let priceText = null;

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

async function detectProductTitle(page) {
  const titleElement = await page.$("h1, h2, .product-title");
  let title = "";
  if (titleElement) {
    title = await page.textContent("h1, h2, .product-title");
  } else {
    // Fallback: find largest heading
    const headings = await page.$$eval("h1, h2, h3", (nodes) =>
      nodes.map((n) => ({
        text: n.textContent.trim(),
        size: parseInt(window.getComputedStyle(n).fontSize),
      }))
    );
    if (headings.length > 0) {
      title = headings.sort((a, b) => b.size - a.size)[0].text;
    }
  }
  return title;
}

async function detectProductDescription(page) {
  const description = await page
    .$eval("rte-formatter.text-block", (el) => el.innerText.trim())
    .catch(() => null);

  return description;
}

export async function checkCriticalElements(page) {
  const issues = [];

  const title = await detectProductTitle(page);
  const price = await detectProductPrice(page);
  const description = await detectProductDescription(page);

  if (!title) issues.push("Title missing");
  if (!price) issues.push("Price missing");
  if (!description) issues.push("Description missing");

  return { status: issues.length ? "FAIL" : "PASS", issues };
}
