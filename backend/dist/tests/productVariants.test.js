"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkVariants = checkVariants;
const logger_1 = require("../utils/logger");
async function checkVariants(page) {
    const result = {
        status: "PASS",
        issues: [],
    };
    try {
        await page.waitForSelector(".product-swatches, fieldset.variant-option, variant-picker", {
            timeout: 15000,
            state: "attached",
        });
        await page.waitForTimeout(1000); // wait for lazy JS to render
        // Try common variant containers
        const containers = await page.$$("fieldset.variant-option, variant-picker form.variant-picker__form, .product-swatches, .product-variants");
        if (!containers || containers.length === 0) {
            result.status = "FAIL";
            result.issues.push("No variant containers found on the page");
            return result;
        }
        const variants = [];
        for (const container of containers) {
            // Look for clickable option elements inside the container
            const options = await container.$$eval("label, button, span, div", (els) => els
                .map((el) => el.textContent?.trim() ||
                el.getAttribute("data-product-swatch") ||
                "")
                .filter((text) => text.length > 0));
            variants.push(...options);
        }
        if (variants.length === 0) {
            result.status = "FAIL";
            result.issues.push("No variant options found inside containers");
        }
    }
    catch (err) {
        logger_1.logger.error(`Error in checkVariants`, err.message);
        return { status: "FAIL", issues: ["Failed to check variants"] };
    }
    return result;
}
