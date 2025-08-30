import { Browser } from "playwright-core";

export interface Config {
  storePassword: string;
  productUrls: string[];
  timeout: number;
}

export interface CheckResult {
  status: "PASS" | "FAIL";
  issues: string[] | any[];
}

export interface ProductCheckResult {
  url?: string;
  images?: any[];
  variants?: any;
  pageLoad?: any;
  elements?: any;
  addToCartBtn?: any;
  availability?: any;
  metaInfo?: any;
  consoleErrors?: string[];
  consoleWarnings?: string[];
  networkFailures?: any[];
  securityIssues?: any[];
}

export interface ImageInfo {
  src: string | null;
  alt: string | null;
  srcset: string | null;
  width?: number;
  height?: number;
}

export interface ProcessProductPageInput {
  browser: Browser;
  url: string;
  password?: string;
}
