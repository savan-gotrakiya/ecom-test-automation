"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkAddToCartButton = checkAddToCartButton;
const logger_1 = require("../utils/logger");
async function deepSearchShadow(el) {
    try {
        // Get the shadowRoot handle
        const shadowRootHandle = await el.evaluateHandle((e) => e.shadowRoot);
        const shadowRoot = await shadowRootHandle.jsonValue();
        if (!shadowRoot) {
            await shadowRootHandle.dispose(); // clean up memory
            return null;
        }
        // Now safely evaluate inside the shadow root
        const foundHandle = await shadowRootHandle.evaluateHandle((root) => {
            if (!root)
                return null;
            const allEls = Array.from(root.querySelectorAll("*"));
            for (const el of allEls) {
                const text = (el.textContent || "").toLowerCase();
                const tag = el.tagName.toLowerCase();
                const role = el.getAttribute("role");
                const clickable = ["button", "a", "input"].includes(tag) ||
                    role === "button" ||
                    window.getComputedStyle(el).cursor === "pointer";
                if (clickable &&
                    /add\s*to\s*cart|add\s*to\s*bag|buy\s*now|checkout/.test(text)) {
                    return el;
                }
            }
            return null;
        });
        await shadowRootHandle.dispose(); // always clean up
        if ((await foundHandle.jsonValue()) !== null) {
            return foundHandle.asElement();
        }
        await foundHandle.dispose();
        return null;
    }
    catch (error) {
        logger_1.logger.error("Error in deepSearchShadow:", error);
        return null;
    }
}
async function findAddToCartInFrame(frame) {
    try {
        // 1. Try known selectors first (fast path)
        const selectors = [
            "button.addtocart",
            "button.btn-atc",
            "[data-add-to-cart]",
            "[data-product-form-submit]",
        ];
        for (const sel of selectors) {
            const btn = await frame.$(sel);
            if (btn)
                return btn;
        }
        // 2. Generic search - limit number of elements to avoid performance issues
        const allEls = await frame.$$("body *");
        const limitedEls = allEls.slice(0, 500); // Prevent infinite search
        for (const el of limitedEls) {
            try {
                // Safely get tagName
                const tag = await el.evaluate((e) => e.tagName.toLowerCase());
                // Skip elements that can't be clickable
                if (!tag)
                    continue;
                // Safely get innerText (only if it's an HTMLElement)
                const text = await el.evaluate((node) => node instanceof HTMLElement ? node.innerText.toLowerCase() : "");
                // Safely get role attribute
                const role = await el.evaluate((e) => e.getAttribute("role"));
                // Check if clickable
                const clickable = ["button", "a", "input"].includes(tag) ||
                    role === "button" ||
                    (await el.evaluate((e) => window.getComputedStyle(e).cursor === "pointer"));
                if (clickable &&
                    /add\s*to\s*cart|add\s*to\s*bag|buy\s*now|checkout/.test(text)) {
                    return el;
                }
                // 3. Check shadow DOM safely
                const shadowBtn = await deepSearchShadow(el);
                if (shadowBtn)
                    return shadowBtn;
            }
            catch (innerError) {
                // Log once per element if needed
                logger_1.logger.warn("Skipping element due to error:", innerError);
                continue;
            }
        }
        return null;
    }
    catch (error) {
        logger_1.logger.error("Error in findAddToCartInFrame:", error);
        return null;
    }
}
async function checkAddToCartButton(page) {
    try {
        let addToCartButton = null;
        const frames = [page.mainFrame(), ...page.frames()];
        for (const frame of frames) {
            addToCartButton = await findAddToCartInFrame(frame);
            if (addToCartButton)
                break;
        }
        if (addToCartButton) {
            // Check if button is disabled via attribute
            const isDisabledAttr = await addToCartButton.evaluate((btn) => btn.disabled || btn.getAttribute("aria-disabled") === "true");
            let isClickable = false;
            try {
                // Wait for the button to be visible and enabled
                await addToCartButton.waitForElementState("visible", { timeout: 1000 });
                await addToCartButton.waitForElementState("enabled", { timeout: 1000 });
                // Try a trial click to confirm
                await addToCartButton.click({ trial: true });
                isClickable = true;
            }
            catch {
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
    }
    catch (err) {
        logger_1.logger.error("Error in checkAddToCartButton:", err);
        return { status: "FAIL", issues: ["Failed to check checkAddToCartButton"] };
    }
}
