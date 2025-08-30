import { Page, Response } from "playwright-core";
import { CheckResult } from "../types";

export async function checkPageLoad(
  page: Page,
  url: string,
  timeout: number = 30000
): Promise<CheckResult> {
  const result: CheckResult= { status: "PASS", issues: [] };

  try {
    const response: Response | null = await page.goto(url, {
      waitUntil: "domcontentloaded",
      timeout,
    });

    if (!response || response.status() >= 400) {
      result.status = "FAIL";
      result.issues.push(
        `Page returned status code ${
          response ? response.status() : "No response"
        }`
      );
    }

    // Check if 404 page
    const content: string = await page.content();

    if (
      content.includes("Page not found") ||
      content.includes("Sorry, this page is unavailable")
    ) {
      result.status = "FAIL";
      result.issues.push("Page Not Found - 404");
    }
  } catch (e: unknown) {
    result.status = "FAIL";
    result.issues.push("Page did not load within timeout or invalid URL");
  }

  return result;
}
