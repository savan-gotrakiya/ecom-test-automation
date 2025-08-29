import { logger } from "../utils/logger.js";

export async function checkAddToCartButton(page) {
  const result = {
    status: "PASS",
    issues: [],
  };

  try {
    const addToCartButton = await page.$("button.add-to-cart-button");

    if (addToCartButton) {
      // Check if button is enabled
      const isDisabled = await addToCartButton.evaluate((btn) => btn.disabled);

      if (isDisabled) {
        result.status = "FAIL";
        result.issues.push("Add to Cart button exists but is disabled");
      }
    } else {
      result.status = "FAIL";
      result.issues.push("Add to Cart button does NOT exist on the page");
    }
  } catch (err) {
    result.status = "FAIL";
    result.issues.push("Error checking Add to Cart button");
    logger.error("Error in checkAddToCartButton:", err);
  }

  return result;
}
