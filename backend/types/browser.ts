import { Browser, Page } from "playwright-core";

export interface BrowserInstance {
  browser: Browser;
  page?: Page;
}
