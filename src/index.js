import fs from "fs";
import path from "path";
import { launchBrowser } from "./utils/browser.js";
import { checkPageLoad } from "./tests/pageLoad.test.js";
import { checkProductImage } from "./tests/productImage.test.js";
import { handlePasswordPage } from "./utils/handlePasswordPage.js";
import { checkAddToCartButton } from "./tests/addToCart.test.js";
import { captureConsoleAndNetworkErrors } from "./utils/consoleAndNetwork.js";
import { checkVariants } from "./tests/productVariants.test.js";
import { checkProductAvailability } from "./tests/productAvailability.test.js";
import { checkCriticalElements } from "./tests/productPage.test.js";
import { checkMetaInfo } from "./tests/productMeta.test.js";
import { saveReport } from "./utils/saveReport.js";
import { logger } from "./utils/logger.js";
import { Profiler } from "./utils/profiler.js";
import { v4 as uuidv4 } from "uuid";

const configPath = path.resolve("./config/config.json");
const config = JSON.parse(fs.readFileSync(configPath, "utf-8"));

function chunkArray(array, chunkSize) {
  const chunks = [];
  for (let i = 0; i < array.length; i += chunkSize) {
    chunks.push(array.slice(i, i + chunkSize));
  }
  return chunks;
}

/**
 * Process a single product page: all checks
 */
async function processProductPage(browser, url, config) {
  const reqId = uuidv4().split("-")[0];

  const profiler = new Profiler();
  logger.info(`${reqId} Processing product page: ${url}`);

  const page = await browser.newPage();

  // Attach console & network listeners
  const { consoleErrors, consoleWarnings, networkFailures, securityIssues } =
    await captureConsoleAndNetworkErrors(page);

  try {
    // Step 1: Handle password page
    profiler.start("passwordPage");
    await handlePasswordPage(page, url, config.storePassword, reqId);
    logger.info(
      `${reqId} Password page handled in ${profiler.end("passwordPage")}`
    );

    // Step 2: Page load
    profiler.start("pageLoad");
    const pageLoad = await checkPageLoad(page, url, config.timeout);
    logger.info(`${reqId} Page load check done in ${profiler.end("pageLoad")}`);

    // Step 3: Critical elements
    profiler.start("criticalElements");
    const elements = await checkCriticalElements(page);
    logger.info(
      `${reqId} Critical elements checked in ${profiler.end(
        "criticalElements"
      )}`
    );

    // Step 4: Add to cart
    profiler.start("addToCart");
    const addToCartBtn = await checkAddToCartButton(page);
    logger.info(
      `${reqId} Add to cart check done in ${profiler.end("addToCart")}`
    );

    // Step 5: Variants
    profiler.start("variants");
    const variants = await checkVariants(page);
    logger.info(`${reqId} Variants check done in ${profiler.end("variants")}`);

    // Step 6: Availability
    profiler.start("availability");
    const availability = await checkProductAvailability(page);
    logger.info(
      `${reqId} Availability check done in ${profiler.end("availability")}`
    );

    // Step 7: Meta info
    profiler.start("metaInfo");
    const metaInfo = await checkMetaInfo(page);
    logger.info(`${reqId} Meta info check done in ${profiler.end("metaInfo")}`);

    // Step 8: Images
    profiler.start("images");
    const image = await checkProductImage(page, url);
    logger.info(`${reqId} Image check done in ${profiler.end("images")}`);

    return {
      url,
      pageLoad,
      elements,
      addToCartBtn,
      variants,
      availability,
      metaInfo,
      image,
      consoleErrors,
      consoleWarnings,
      networkFailures,
      securityIssues,
    };
  } catch (err) {
    logger.error(` ${reqId} Error processing ${url}: ${err.message}`);
    throw err;
  } finally {
    await page.close();
  }
}

/**
 * Main function
 */
export async function executeProductCheck(urls) {
  const { browser } = await launchBrowser();
  const results = [];
  const concurrency = 5;

  const urlChunks = chunkArray(urls, concurrency);

  // Process URLs in chunks (5 at a time)
  for (const chunk of urlChunks) {
    const chunkResults = await Promise.allSettled(
      chunk.map((url) => processProductPage(browser, url, config))
    );
    results.push(...chunkResults.map((doc) => doc.value));
  }

  await browser.close();

  logger.info("All product pages processed. Saving report...");
  saveReport(results);
  logger.info("Report saved successfully.");
  return results;
}

// URL:
// https://www.abbottlyon.com/products/made-mine-fine-name-necklace-gold
