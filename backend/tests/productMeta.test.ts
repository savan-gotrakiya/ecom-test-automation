import { Page } from "playwright-core";
import { CheckResult } from "../types";
import { logger } from "../utils/logger";

export async function checkMetaInfo(page: Page): Promise<CheckResult> {
  const result: CheckResult = {
    status: "PASS",
    issues: [],
  };
  try {
    const issues: string[] = [];

    const title: string | null = (await page.title())?.trim() || null;

    const description: string | null = await page
      .$eval('meta[name="description"]', (el: HTMLMetaElement) =>
        el.content?.trim()
      )
      .catch(() => null);

    if (!title) issues.push("Page title missing or empty");
    if (!description) issues.push("Meta description missing or empty");

    return {
      status: issues.length ? "FAIL" : "PASS",
      issues,
    };
  } catch (err: any) {
    logger.error(`Error in checkMetaInfo`, err.message);
    return result;
  }
}
