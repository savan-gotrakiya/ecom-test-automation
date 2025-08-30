"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const body_parser_1 = __importDefault(require("body-parser"));
const index_1 = require("./index");
const app = (0, express_1.default)();
app.use(body_parser_1.default.json());
app.use((0, cors_1.default)());
app.post("/api/runProductChecks", async (req, res) => {
    const { urls, password } = req.body;
    if (!urls || !Array.isArray(urls)) {
        return res.status(400).json({ error: "urls must be an array" });
    }
    try {
        const results = await (0, index_1.executeProductCheck)({ urls, password });
        return res.json(results);
    }
    catch (err) {
        return res.status(500).json({ error: err.message });
    }
});
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
    console.log(`🚀 Server running at http://localhost:${PORT}`);
});
