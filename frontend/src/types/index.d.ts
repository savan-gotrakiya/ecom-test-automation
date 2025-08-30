export interface ProductCheckResult {
  url: string;
  pageLoad?: any;
  elements?: any;
  images?: any;
  addToCartBtn?: any;
  variants?: any;
  availability?: any;
  metaInfo?: any;
  image?: any;
  consoleErrors?: any[];
  consoleWarnings?: any[];
  networkFailures?: any[];
  securityIssues?: any[];
  error?: string;
}

export interface ApiResponse {
  success: boolean;
  data?: ProductCheckResult[];
  error?: string;
}
