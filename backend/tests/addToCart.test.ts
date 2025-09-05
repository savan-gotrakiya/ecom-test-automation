import { Page, ElementHandle } from "playwright-core";
import { CheckResult } from "../types";
import { logger } from "../utils/logger";

async function deepSearchShadow(
  el: ElementHandle<Element>
): Promise<ElementHandle<Element> | null> {
  const shadowRootHandle = await el.evaluateHandle(
    (e) => (e as any).shadowRoot
  );
  if (!shadowRootHandle) return null;

  const foundHandle = await shadowRootHandle.evaluateHandle(
    (root: ShadowRoot) => {
      const allEls = Array.from(root.querySelectorAll("*"));
      for (const el of allEls) {
        const text = (el.textContent || "").toLowerCase();
        const tag = el.tagName.toLowerCase();
        const role = el.getAttribute("role");
        const clickable =
          ["button", "a", "input"].includes(tag) ||
          role === "button" ||
          window.getComputedStyle(el).cursor === "pointer";
        if (
          clickable &&
          /add\s*to\s*cart|add\s*to\s*bag|buy\s*now|checkout/.test(text)
        ) {
          return el;
        }
      }
      return null;
    }
  );

  if ((await foundHandle.jsonValue()) !== null) return foundHandle.asElement();
  return null;
}

async function findAddToCartInFrame(
  frame: any
): Promise<ElementHandle<Element> | null> {
  // Try known selectors first
  const selectors = [
    "button.addtocart",
    "button.btn-atc",
    "[data-add-to-cart]",
    "[data-product-form-submit]",
  ];

  for (const sel of selectors) {
    const btn = await frame.$(sel);
    if (btn) return btn;
  }

  // Generic search in DOM
  const allEls = await frame.$$("body *");
  for (const el of allEls) {
    const text = ((await el.innerText()) || "").toLowerCase();
    const tag = await el.evaluate((e: { tagName: string }) =>
      e.tagName.toLowerCase()
    );
    const role = await el.evaluate(
      (e: { getAttribute: (arg0: string) => any }) => e.getAttribute("role")
    );
    const clickable =
      ["button", "a", "input"].includes(tag) ||
      role === "button" ||
      (await el.evaluate(
        (e: Element) => window.getComputedStyle(e).cursor === "pointer"
      ));

    if (
      clickable &&
      /add\s*to\s*cart|add\s*to\s*bag|buy\s*now|checkout/.test(text)
    ) {
      return el;
    }

    // Check shadow DOM
    const shadowBtn = await deepSearchShadow(el);
    if (shadowBtn) return shadowBtn;
  }

  return null;
}

export async function checkAddToCartButton(page: Page): Promise<CheckResult> {
  try {
    let addToCartButton: ElementHandle<Element> | null = null;

    const frames = [page.mainFrame(), ...page.frames()];
    for (const frame of frames) {
      addToCartButton = await findAddToCartInFrame(frame);
      if (addToCartButton) break;
    }

    if (addToCartButton) {
      // Check if button is disabled via attribute
      const isDisabledAttr = await addToCartButton.evaluate(
        (btn: HTMLButtonElement) =>
          btn.disabled || btn.getAttribute("aria-disabled") === "true"
      );

      let isClickable = false;

      try {
        // Wait for the button to be visible and enabled
        await addToCartButton.waitForElementState("visible", { timeout: 1000 });
        await addToCartButton.waitForElementState("enabled", { timeout: 1000 });

        // Try a trial click to confirm
        await addToCartButton.click({ trial: true });
        isClickable = true;
      } catch {
        isClickable = false;
      }

      if (!isClickable && !isDisabledAttr) {
        return {
          status: "FAIL",
          issues: ["Add to Cart button not found or disabled"],
        };
      }
    }

    return { status: "PASS", issues: [] };
  } catch (err) {
    logger.error("Error in checkAddToCartButton:", err);
    return { status: "FAIL", issues: ["Failed to check checkAddToCartButton"] };
  }
}
