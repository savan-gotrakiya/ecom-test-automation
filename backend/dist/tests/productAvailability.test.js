"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkProductAvailability = checkProductAvailability;
async function checkProductAvailability(page) {
    try {
        const issues = [];
        // Check Add to Cart button
        const addToCartButton = await page.$("button.add-to-cart-button");
        if (addToCartButton) {
            const isDisabled = await addToCartButton.evaluate((btn) => btn.disabled || btn.getAttribute("aria-disabled") === "true");
            if (isDisabled)
                issues.push("Product is sold out / unavailable");
        }
        // Check for "Sold Out" text
        const soldOutTextSelectors = [
            ".product-status",
            ".sold-out",
            ".out-of-stock",
        ];
        for (const selector of soldOutTextSelectors) {
            const el = await page.$(selector);
            if (el) {
                const text = await el.evaluate((node) => node.textContent?.toLowerCase());
                if (text?.includes("sold out") || text?.includes("out of stock")) {
                    issues.push(`Product marked unavailable via text: "${text.trim()}"`);
                    break;
                }
            }
        }
        // Optional: Check variant dropdowns
        const variantSelect = await page.$("select#ProductSelect-product-template");
        if (variantSelect) {
            const options = await variantSelect.$$eval("option", (opts) => opts.map((o) => o.textContent?.toLowerCase() || ""));
            if (options.length &&
                options.every((o) => o.includes("sold out") || o.includes("unavailable"))) {
                issues.push("All product variants are sold out");
            }
        }
        return { status: issues.length > 0 ? "FAIL" : "PASS", issues };
    }
    catch (error) {
        return {
            status: "FAIL",
            issues: ["Unable to determine product availability"],
        };
    }
}
