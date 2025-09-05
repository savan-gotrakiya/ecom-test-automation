"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkMetaInfo = checkMetaInfo;
const logger_1 = require("../utils/logger");
async function checkMetaInfo(page) {
    const result = {
        status: "PASS",
        issues: [],
    };
    try {
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
    catch (err) {
        logger_1.logger.error(`Error in checkMetaInfo`, err.message);
        return result;
    }
}
