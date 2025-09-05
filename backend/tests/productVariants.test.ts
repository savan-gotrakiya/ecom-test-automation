import { Page } from "playwright-core";
import { CheckResult } from "../types";
import { logger } from "../utils/logger";

export async function checkVariants(page: Page): Promise<CheckResult> {
  const result: CheckResult = {
    status: "PASS",
    issues: [],
  };

  try {
    await page
      .waitForSelector(
        ".product-swatches, fieldset.variant-option, variant-picker",
        {
          timeout: 15000,
          state: "attached",
        }
      )
      .catch(() => null);

    await page.waitForTimeout(1000); // wait for lazy JS to render

    // Try common variant containers
    const containers = await page.$$(
      "fieldset.variant-option, variant-picker form.variant-picker__form, .product-swatches, .product-variants"
    );

    if (containers && containers?.length > 0) {
      const variants: string[] = [];

      for (const container of containers) {
        // Look for clickable option elements inside the container
        const options = await container.$$eval(
          "label, button, span, div",
          (els: Element[]) =>
            els
              .map(
                (el) =>
                  el.textContent?.trim() ||
                  el.getAttribute("data-product-swatch") ||
                  ""
              )
              .filter((text) => text.length > 0)
        );
        if (options && options?.length > 0) {
          variants.push(...options);
        }
      }

      if (variants.length === 0) {
        result.status = "FAIL";
        result.issues.push("No variant containers found");
      }
    }
  } catch (err: any) {
    logger.error(`Error in checkVariants`, err);
    return { status: "FAIL", issues: ["Failed to check variants"] };
  }

  return result;
}
