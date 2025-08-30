import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import { executeProductCheck } from "./index";

const app = express();
app.use(bodyParser.json());
app.use(cors());

app.post("/api/runProductChecks", async (req, res) => {
  const { urls, password } = req.body;
  if (!urls || !Array.isArray(urls)) {
    return res.status(400).json({ error: "urls must be an array" });
  }

  try {
    const results = await executeProductCheck({ urls, password });
    return res.json(results);
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
