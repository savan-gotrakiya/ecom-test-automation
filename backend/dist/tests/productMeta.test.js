"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkMetaInfo = checkMetaInfo;
async function checkMetaInfo(page) {
    const issues = [];
    const title = (await page.title())?.trim() || null;
    const description = await page
        .$eval('meta[name="description"]', (el) => el.content?.trim())
        .catch(() => null);
    if (!title)
        issues.push("Page title missing or empty");
    if (!description)
        issues.push("Meta description missing or empty");
    return {
        status: issues.length ? "FAIL" : "PASS",
        issues,
    };
}
