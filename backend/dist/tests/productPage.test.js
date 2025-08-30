"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.detectProductDescription = detectProductDescription;
exports.checkCriticalElements = checkCriticalElements;
const logger_1 = require("../utils/logger");
async function detectProductPrice(page) {
    try {
        const selectors = [".price-container", ".product-price", ".price"];
        let priceText = null;
        for (const selector of selectors) {
            try {
                await page.waitForSelector(selector, { timeout: 10000 });
                priceText = await page.textContent(selector);
                if (priceText)
                    break;
            }
            catch {
                // Ignore and try next selector
            }
        }
        if (!priceText) {
            // Fallback: Search entire page HTML with regex
            const html = await page.content();
            const match = html.match(/(Rs\.?|INR|₹|\$|€|¥)\s?\d{1,3}(,\d{3})*(\.\d{1,2})?/);
            if (match)
                priceText = match[0];
        }
        return priceText;
    }
    catch (error) {
        logger_1.logger.error(`Error processing detectProductPrice`, error.message);
    }
}
async function detectProductTitle(page) {
    try {
        const titleElement = await page.$("h1, h2, .product-title, div[class*='product_title'] p");
        let title = null;
        if (titleElement) {
            title = (await titleElement.textContent())?.trim() || null;
        }
        else {
            // Fallback: find largest heading
            const headings = await page.$$eval("h1, h2, h3", (nodes) => nodes.map((n) => ({
                text: n.textContent?.trim() || "",
                size: parseInt(window.getComputedStyle(n).fontSize),
            })));
            if (headings.length > 0) {
                title = headings.sort((a, b) => b.size - a.size)[0].text;
            }
        }
        return title;
    }
    catch (error) {
        logger_1.logger.error(`Error processing detectProductTitle`, error.message);
    }
}
async function detectProductDescription(page) {
    try {
        // 1. Meta description (SEO)
        const metaDesc = await page
            .$eval('meta[name="description"]', (el) => el.content.trim())
            .catch(() => null);
        if (metaDesc)
            return metaDesc;
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
            if (desc)
                return desc;
        }
        // 3. Fallback: longest paragraph on the page
        const paragraphs = await page.$$eval("p", (els) => els.map((el) => el.innerText.trim()).filter(Boolean));
        if (paragraphs.length > 0) {
            return paragraphs.sort((a, b) => b.length - a.length)[0]; // pick longest
        }
        return null;
    }
    catch (error) {
        logger_1.logger.error(`Error processing detectProductDescription`, error.message);
    }
}
async function checkCriticalElements(page) {
    try {
        const issues = [];
        const title = await detectProductTitle(page);
        const price = await detectProductPrice(page);
        const description = await detectProductDescription(page);
        if (!title)
            issues.push("Title missing");
        if (!price)
            issues.push("Price missing");
        if (!description)
            issues.push("Description missing");
        return { status: issues.length ? "FAIL" : "PASS", issues };
    }
    catch (err) {
        logger_1.logger.error(`Error processing checkCriticalElements`, err.message);
        return { status: "FAIL", issues: ["Failed to check critical elements"] };
    }
}
