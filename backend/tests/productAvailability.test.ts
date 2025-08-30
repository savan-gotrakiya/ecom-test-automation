// src/tests/productAvailability.test.ts
import { Page, ElementHandle } from "playwright-core";
import { CheckResult } from "../types";


export async function checkProductAvailability(
  page: Page
): Promise<CheckResult> {
  try {
    const addToCartButton: ElementHandle<Element> | null = await page.$(
      "button.add-to-cart-button"
    );

    if (!addToCartButton) {
      return {
        status: "FAIL",
        issues: ["Add to Cart button not found — Product availability unknown"],
      };
    }

    const isDisabled: boolean = await addToCartButton.evaluate(
      (btn: HTMLButtonElement) => btn.disabled
    );

    if (isDisabled) {
      return { status: "FAIL", issues: ["Product is sold out / unavailable"] };
    }

    return { status: "PASS", issues: [] };
  } catch (error: unknown) {
    return {
      status: "FAIL",
      issues: [
        "Error checking product availability",
        error instanceof Error ? error.message : String(error),
      ],
    };
  }
}
