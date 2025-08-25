# E-Commerce Test Automation

Automated testing framework for e-commerce product pages. The framework checks critical product page elements, product variants, images, add-to-cart functionality, console errors, network issues, and overall page health.

---

## Features

- **Page Load Validation** – Ensures the product page loads correctly.  
- **Critical Element Checks** – Validates presence of title, description, price, and other key elements.  
- **Add to Cart Button Validation** – Checks if the "Add to Cart" button exists and is enabled.  
- **Product Variant Checks** – Detects available variants (size, color) and their availability.  
- **Product Availability** – Confirms if the product is in stock or sold out.  
- **Meta Information Validation** – Validates meta title, description, and SEO tags.  
- **Product Image Validation** – Checks primary and gallery images, alt-text, dimensions, broken images.  
- **Console & Network Error Capture** – Detects JS console errors, failed network requests, CORS issues, third-party script failures, security issues, and performance warnings.  

---

## Approach

The tool uses **Playwright** for browser automation. For each product URL, the framework:

1. Opens the page (handles password-protected pages if required).  
2. Validates page load and critical elements.  
3. Detects and validates product variants dynamically.  
4. Checks add-to-cart button and product availability.  
5. Captures console errors, network failures, and third-party script issues.  
6. Validates images: ensures proper loading, alt-text, and dimensions.  
7. Generates a JSON report capturing pass/fail status for each check.

**Trade-offs:**  

- Designed for **Shopify-like pages**; highly customized stores may require additional selectors.  
- Image validation uses lazy-loading detection, which may increase execution time.  
- Network and console error detection captures all errors, including non-critical third-party scripts.

---

## Prerequisites

- Node.js
- Yarn or npm  
- Chromium/Firefox/WebKit (Playwright bundled)  

---

## Setup & Local Execution

1. **Clone the repository**

```bash
git clone <your-repo-url>
cd ecom-test-automation
```

2. **Install dependencies**

num install
# or
yarn install


3. **Install Playwright browsers**

npx playwright install


4. **Update configuration**

-> Edit config/config.json:
{
  "storePassword": "your_store_password_if_any",
  "timeout": 30000,
  "productUrls": [
    "https://example.com/product-1",
    "https://example.com/product-2"
  ],
  "parallelLimit": 5
}

Note: A sample config/config.json file is already provided in the repo. You can use it as-is to run the tests or modify it to include your product URLs and store password.

3. **Run tests locally**

node src/index.js