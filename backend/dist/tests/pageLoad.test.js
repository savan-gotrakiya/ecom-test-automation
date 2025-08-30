"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkPageLoad = checkPageLoad;
async function checkPageLoad(page, url, timeout = 30000) {
    const result = { status: "PASS", issues: [] };
    try {
        const response = await page.goto(url, {
            waitUntil: "domcontentloaded",
            timeout,
        });
        if (!response || response.status() >= 400) {
            result.status = "FAIL";
            result.issues.push(`Page returned status code ${response ? response.status() : "No response"}`);
        }
        // Check if 404 page
        const content = await page.content();
        if (content.includes("Page not found") ||
            content.includes("Sorry, this page is unavailable")) {
            result.status = "FAIL";
            result.issues.push("Page Not Found - 404");
        }
    }
    catch (e) {
        result.status = "FAIL";
        result.issues.push("Page did not load within timeout or invalid URL");
    }
    return result;
}
