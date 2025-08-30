import { launchBrowser } from "./utils/browser";
import { checkPageLoad } from "./tests/pageLoad.test";
import { checkProductImage } from "./tests/productImage.test";
import { handlePasswordPage } from "./utils/handlePasswordPage";
import { checkAddToCartButton } from "./tests/addToCart.test";
import { captureConsoleAndNetworkErrors } from "./utils/consoleAndNetwork";
import { checkVariants } from "./tests/productVariants.test";
import { checkProductAvailability } from "./tests/productAvailability.test";
import { checkCriticalElements } from "./tests/productPage.test";
import { checkMetaInfo } from "./tests/productMeta.test";
import { logger } from "./utils/logger";
import { Profiler } from "./utils/profiler";
import { v4 as uuidv4 } from "uuid";
import { ProcessProductPageInput, ProductCheckResult } from "./types";
import { chunk } from "lodash";

/**
 * Process a single product page: all checks
 */
async function processProductPage(
  input: ProcessProductPageInput
): Promise<ProductCheckResult> {
  const { browser, url, password } = input;
  const reqId = uuidv4().split("-")[0];
  const profiler = new Profiler();
  logger.info(`${reqId} Processing product page: ${url}`);

  const page = await browser.newPage();

  const { consoleErrors, consoleWarnings, networkFailures, securityIssues } =
    captureConsoleAndNetworkErrors(page);

  try {
    // Step 1: Handle password page
    profiler.start("passwordPage");
    await handlePasswordPage(page, url, password, reqId);
    logger.info(
      `${reqId} Password page handled in ${profiler.end("passwordPage")}`
    );

    // Step 2: Page load
    profiler.start("pageLoad");
    const pageLoad = await checkPageLoad(page, url);
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
      images: [image],
      consoleErrors,
      consoleWarnings,
      networkFailures,
      securityIssues,
    };
  } catch (err: any) {
    logger.error(` ${reqId} Error processing ${url}: ${err.message}`);
    throw err;
  } finally {
    await page.close();
  }
}

/**
 * Main function
 */
export async function executeProductCheck(input: {
  urls: string[];
  password?: string;
}): Promise<{ success: boolean; data: ProductCheckResult[] }> {
  const { browser } = await launchBrowser();
  const results: ProductCheckResult[] = [];
  const concurrency = 5;

  const { urls = [], password } = input;
  const urlChunks = chunk(urls, concurrency);

  try {
    for (const chunk of urlChunks) {
      const chunkResults = await Promise.allSettled(
        chunk.map((url) => processProductPage({ browser, url, password }))
      );

      results.push(
        ...chunkResults
          .filter(
            (r): r is PromiseFulfilledResult<ProductCheckResult> =>
              r.status === "fulfilled"
          )
          .map((r) => r.value)
      );
    }

    return { success: true, data: results };
  } catch (error: any) {
    logger.error(`Error in executeProductCheck: ${error.message}`);
    return { success: false, data: [] };
  } finally {
    await browser.close();
  }
}
