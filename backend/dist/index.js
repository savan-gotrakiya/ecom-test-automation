"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.executeProductCheck = executeProductCheck;
const browser_1 = require("./utils/browser");
const pageLoad_test_1 = require("./tests/pageLoad.test");
const productImage_test_1 = require("./tests/productImage.test");
const handlePasswordPage_1 = require("./utils/handlePasswordPage");
const addToCart_test_1 = require("./tests/addToCart.test");
const consoleAndNetwork_1 = require("./utils/consoleAndNetwork");
const productVariants_test_1 = require("./tests/productVariants.test");
const productAvailability_test_1 = require("./tests/productAvailability.test");
const productPage_test_1 = require("./tests/productPage.test");
const productMeta_test_1 = require("./tests/productMeta.test");
const logger_1 = require("./utils/logger");
const profiler_1 = require("./utils/profiler");
const uuid_1 = require("uuid");
const lodash_1 = require("lodash");
/**
 * Process a single product page: all checks
 */
async function processProductPage(input) {
    const { browser, url, password } = input;
    const reqId = (0, uuid_1.v4)().split("-")[0];
    const profiler = new profiler_1.Profiler();
    logger_1.logger.info(`${reqId} Processing product page: ${url}`);
    const page = await browser.newPage();
    const { consoleErrors, consoleWarnings, networkFailures, securityIssues } = (0, consoleAndNetwork_1.captureConsoleAndNetworkErrors)(page);
    try {
        // Step 1: Handle password page
        profiler.start("passwordPage");
        await (0, handlePasswordPage_1.handlePasswordPage)(page, url, password, reqId);
        logger_1.logger.info(`${reqId} Password page handled in ${profiler.end("passwordPage")}`);
        // Step 2: Page load
        profiler.start("pageLoad");
        const pageLoad = await (0, pageLoad_test_1.checkPageLoad)(page, url);
        logger_1.logger.info(`${reqId} Page load check done in ${profiler.end("pageLoad")}`);
        // Step 3: Critical elements
        profiler.start("criticalElements");
        const elements = await (0, productPage_test_1.checkCriticalElements)(page);
        logger_1.logger.info(`${reqId} Critical elements checked in ${profiler.end("criticalElements")}`);
        // Step 4: Add to cart
        profiler.start("addToCart");
        const addToCartBtn = await (0, addToCart_test_1.checkAddToCartButton)(page);
        logger_1.logger.info(`${reqId} Add to cart check done in ${profiler.end("addToCart")}`);
        // Step 5: Variants
        profiler.start("variants");
        const variants = await (0, productVariants_test_1.checkVariants)(page);
        logger_1.logger.info(`${reqId} Variants check done in ${profiler.end("variants")}`);
        // Step 6: Availability
        profiler.start("availability");
        const availability = await (0, productAvailability_test_1.checkProductAvailability)(page);
        logger_1.logger.info(`${reqId} Availability check done in ${profiler.end("availability")}`);
        // Step 7: Meta info
        profiler.start("metaInfo");
        const metaInfo = await (0, productMeta_test_1.checkMetaInfo)(page);
        logger_1.logger.info(`${reqId} Meta info check done in ${profiler.end("metaInfo")}`);
        // Step 8: Images
        profiler.start("images");
        const image = await (0, productImage_test_1.checkProductImage)(page, url);
        logger_1.logger.info(`${reqId} Image check done in ${profiler.end("images")}`);
        return {
            url,
            pageLoad,
            elements,
            addToCartBtn,
            variants,
            availability,
            metaInfo,
            images: [image],
            consoleErrors,
            consoleWarnings,
            networkFailures,
            securityIssues,
        };
    }
    catch (err) {
        logger_1.logger.error(` ${reqId} Error processing ${url}: ${err.message}`);
        throw err;
    }
    finally {
        await page.close();
    }
}
/**
 * Main function
 */
async function executeProductCheck(input) {
    const { browser } = await (0, browser_1.launchBrowser)();
    const results = [];
    const concurrency = 5;
    const { urls = [], password } = input;
    const urlChunks = (0, lodash_1.chunk)(urls, concurrency);
    try {
        for (const chunk of urlChunks) {
            const chunkResults = await Promise.allSettled(chunk.map((url) => processProductPage({ browser, url, password })));
            results.push(...chunkResults
                .filter((r) => r.status === "fulfilled")
                .map((r) => r.value));
        }
        return { success: true, data: results };
    }
    catch (error) {
        logger_1.logger.error(`Error in executeProductCheck: ${error.message}`);
        return { success: false, data: [] };
    }
    finally {
        await browser.close();
    }
}
