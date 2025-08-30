"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.captureConsoleAndNetworkErrors = captureConsoleAndNetworkErrors;
function captureConsoleAndNetworkErrors(page) {
    const consoleErrors = [];
    const consoleWarnings = [];
    const networkFailures = [];
    const securityIssues = [];
    // Capture JS console errors & warnings
    page.on("console", (msg) => {
        const type = msg.type();
        const text = msg.text();
        if (type === "error") {
            consoleErrors.push(text);
            // Detect common CORS errors in console
            if (text.includes("CORS") || text.includes("cross-origin")) {
                securityIssues.push({ type: "CORS Error", message: text });
            }
            // Detect mixed content
            if (text.includes("Mixed Content")) {
                securityIssues.push({ type: "Mixed Content", message: text });
            }
        }
        else if (type === "warning") {
            consoleWarnings.push(text);
            // Page performance warnings
            if (text.toLowerCase().includes("performance")) {
                consoleWarnings.push(text);
            }
        }
    });
    // Capture failed network requests
    page.on("requestfailed", (request) => {
        const failure = request.failure();
        networkFailures.push({
            url: request.url(),
            reason: failure?.errorText || "Unknown",
            type: failure?.errorText?.includes("SSL")
                ? "Security Issue"
                : "Request Failed",
        });
        // Detect mixed content from failed requests
        if (request.url().startsWith("http:") && page.url().startsWith("https:")) {
            securityIssues.push({ type: "Mixed Content", url: request.url() });
        }
    });
    // Capture HTTP errors >= 400
    page.on("response", (response) => {
        if (response.status() >= 400) {
            networkFailures.push({ url: response.url(), status: response.status() });
        }
    });
    return {
        consoleErrors,
        consoleWarnings,
        networkFailures,
        securityIssues,
    };
}
