// src/tests/productImage.test.ts
import { Page, ElementHandle } from "playwright-core";
import { ImageInfo } from "../types";

export interface ImageCheckResult {
  status: "PASS" | "FAIL";
  issues: Array<{ src: string | null; issues: string[] }>;
  images: ImageInfo[];
}

export async function checkProductImage(
  page: Page,
  url: string
): Promise<ImageCheckResult> {
  const result: ImageCheckResult = { status: "PASS", issues: [], images: [] };

  try {
    await page.goto(url, { waitUntil: "domcontentloaded" });
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(2000); // wait for lazy-loaded images

    // Get all product images
    const images: ImageInfo[] = await page.$$eval(
      ".product-media img",
      (imgs) =>
        imgs.map((img: any) => ({
          src: img.getAttribute("src") || img.getAttribute("data-src"),
          alt: img.alt || null,
          srcset: img.getAttribute("srcset") || null,
        }))
    );

    // Remove duplicates based on src
    const uniqueImages = Array.from(
      new Map(images.map((img) => [img.src, img])).values()
    );

    // Wait for images to fully load and get dimensions
    for (const img of uniqueImages) {
      if (!img.src) continue;
      const imgHandle: ElementHandle<HTMLImageElement | any> | null =
        await page.$(`img[src="${img.src}"]`);
      if (imgHandle) {
        await imgHandle.evaluate((i) => {
          if (!i.complete) return new Promise((res) => (i.onload = res));
        });

        const dimensions = await imgHandle.evaluate((i) => ({
          width: i.naturalWidth,
          height: i.naturalHeight,
        }));

        img.width = dimensions.width;
        img.height = dimensions.height;

        const imgIssues: string[] = [];
        if (!img.src) imgIssues.push("Missing src");
        if (!img.alt) imgIssues.push("Missing alt text");
        if (!img.width || !img.height)
          imgIssues.push("Invalid image dimensions");

        if (imgIssues.length) {
          result.status = "FAIL";
          result.issues.push({ src: img.src, issues: imgIssues });
        }
      }
    }

    result.images = uniqueImages;
  } catch (error: unknown) {
    return result;
  }

  return result;
}
