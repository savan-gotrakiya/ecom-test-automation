"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkProductAvailability = checkProductAvailability;
async function checkProductAvailability(page) {
    try {
        const addToCartButton = await page.$("button.add-to-cart-button");
        if (!addToCartButton) {
            return {
                status: "FAIL",
                issues: ["Add to Cart button not found — Product availability unknown"],
            };
        }
        const isDisabled = await addToCartButton.evaluate((btn) => btn.disabled);
        if (isDisabled) {
            return { status: "FAIL", issues: ["Product is sold out / unavailable"] };
        }
        return { status: "PASS", issues: [] };
    }
    catch (error) {
        return {
            status: "FAIL",
            issues: [
                "Error checking product availability",
                error instanceof Error ? error.message : String(error),
            ],
        };
    }
}
