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
        console.log("⚠️ Add to Cart button exists but is disabled");
      } else {
        console.log("✅ Add to Cart button exists and is enabled");
      }
    } else {
      result.status = "FAIL";
      result.issues.push("Add to Cart button does NOT exist on the page");
      console.log("❌ Add to Cart button does NOT exist on the page");
    }
  } catch (err) {
    result.status = "FAIL";
    result.issues.push("Error checking Add to Cart button");
    console.log("Error in checkAddToCartButton:", err);
  }

  return result;
}
