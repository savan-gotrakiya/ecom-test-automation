"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.launchBrowser = launchBrowser;
const playwright_core_1 = require("playwright-core");
const chromium_1 = __importDefault(require("@sparticuz/chromium"));
const logger_1 = require("./logger");
const isServerless = !!process.env.VERCEL; // true on Vercel
async function launchBrowser() {
    try {
        let executablePath;
        let args = [];
        if (isServerless) {
            // Use sparticuz Chromium on Vercel (Linux serverless)
            executablePath = await chromium_1.default.executablePath();
            args = chromium_1.default.args;
        }
        else {
            // Use normal Playwright Chromium locally
            const { chromium } = await Promise.resolve().then(() => __importStar(require("playwright-chromium")));
            executablePath = undefined; // use default
            args = ["--no-sandbox", "--disable-setuid-sandbox"];
        }
        const browser = await playwright_core_1.chromium.launch({
            headless: true,
            executablePath,
            args,
        });
        const context = await browser.newContext();
        const page = await context.newPage();
        return { browser, page };
    }
    catch (error) {
        logger_1.logger.error("Error in launchBrowser", error);
        throw error;
    }
}
