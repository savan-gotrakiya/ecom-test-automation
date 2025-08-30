export interface NetworkFailure {
  url: string;
  reason?: string;
  type?: string;
  status?: number;
}

export interface SecurityIssue {
  type: string;
  message?: string;
  url?: string;
}

export interface ConsoleNetworkResult {
  consoleErrors: string[];
  consoleWarnings: string[];
  networkFailures: NetworkFailure[];
  securityIssues: SecurityIssue[];
}
