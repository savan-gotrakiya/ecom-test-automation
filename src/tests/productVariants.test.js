export async function checkVariants(page) {
  const result = { status: "PASS", issues: [], variants: [] };

  try {
    // Wait for variant picker to render
    await page.waitForSelector("variant-picker form.variant-picker__form", {
      timeout: 30000,
    });

    // Get all variant fieldsets
    const fieldsets = await page.$$("fieldset.variant-option");

    if (!fieldsets || fieldsets.length === 0) {
      result.status = "FAIL";
      result.issues.push("No variants found");
      return result;
    }

    // Extract variant names
    const variants = [];
    for (const fs of fieldsets) {
      const labels = await fs.$$eval(
        "label.variant-option__button-label span.variant-option__button-label__text",
        (els) => els.map((el) => el.textContent.trim())
      );
      variants.push(...labels);
    }

    if (variants.length === 0) {
      result.status = "FAIL";
      result.issues.push("No variant options found inside fieldsets");
    }

    // Add detected variants to result
    result.variants = variants;

    console.log("Detected variants:", variants);
  } catch (err) {
    result.status = "FAIL";
    result.issues.push("No variants found");
  }

  return result;
}
