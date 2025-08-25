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
  const page = await browser.newPage();

  // Attach console & network listeners
  const { consoleErrors, consoleWarnings, networkFailures, securityIssues } =
    await captureConsoleAndNetworkErrors(page);

  // Step 1: Handle password page
  await handlePasswordPage(page, url, config.storePassword);

  // Step 2: Page load
  const pageLoad = await checkPageLoad(page, url, config.timeout);

  // Step 3: Critical elements
  const elements = await checkCriticalElements(page);

  // Step 4: Add to cart
  const addToCartBtn = await checkAddToCartButton(page);

  // Step 5: Variants
  const variants = await checkVariants(page);

  // Step 6: Availability
  const availability = await checkProductAvailability(page);

  // Step 7: Meta info
  const metaInfo = await checkMetaInfo(page);

  // Step 8: Images
  const image = await checkProductImage(page, url);

  await page.close();

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
}

/**
 * Main function
 */
(async () => {
  const { browser } = await launchBrowser();
  const results = [];
  const concurrency = 5;

  const urlChunks = chunkArray(config.productUrls, concurrency);

  // Process URLs in chunks (5 at a time)
  for (const chunk of urlChunks) {
    const chunkResults = await Promise.allSettled(
      chunk.map((url) => processProductPage(browser, url, config))
    );
    results.push(...chunkResults.map((doc) => doc.value));
  }

  await browser.close();
  saveReport(results);
})();
