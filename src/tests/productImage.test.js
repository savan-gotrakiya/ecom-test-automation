export async function checkProductImage(page, url) {
  let result = { status: "PASS", issues: [], images: [] };

  try {
    await page.goto(url, { waitUntil: "domcontentloaded" });
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(2000); // lazy load

    // Get all product images
    const images = await page.$$eval(".product-media img", (imgs) =>
      imgs.map((img) => ({
        src: img.getAttribute("src") || img.getAttribute("data-src"),
        alt: img.alt || null,
        srcset: img.getAttribute("srcset") || null,
      }))
    );

    // Remove duplicates based on src
    const uniqueImages = Array.from(new Map(images.map(img => [img.src, img])).values());

    // Wait for images to fully load and get dimensions
    for (const img of uniqueImages) {
      const imgHandle = await page.$(`img[src="${img.src}"]`);
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

        const imgIssues = [];
        if (!img.src) imgIssues.push("Missing src");
        if (!img.alt) imgIssues.push("Missing alt text");
        if (!img.width || !img.height) imgIssues.push("Invalid image dimensions");

        if (imgIssues.length) {
          result.status = "FAIL";
          result.issues.push({ src: img.src, issues: imgIssues });
        }
      }
    }

    result.images = uniqueImages;

  } catch (error) {
    result.status = "FAIL";
    result.issues.push("Error checking images: " + error.message);
  }

  return result;
}
