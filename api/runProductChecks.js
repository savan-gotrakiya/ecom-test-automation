import { executeProductCheck } from "../src/index.js";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res
      .status(405)
      .json({ success: false, error: "Method not allowed" });
  }

  const { urls, password } = req.body;
  if (!urls || !Array.isArray(urls)) {
    return res
      .status(400)
      .json({ success: false, error: "Invalid input, expected 'urls' array" });
  }

  try {
    const results = await executeProductCheck(urls);
    res.status(200).json({ success: true, data: results });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
}
