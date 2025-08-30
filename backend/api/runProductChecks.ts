import { executeProductCheck } from "../index";
import { Request, Response } from "express";

export default async function handler(req: Request, res: Response) {
  // Allow CORS
  res.setHeader(
    "Access-Control-Allow-Origin",
    "https://ecom-test-automation.vercel.app"
  );
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

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
    const results = await executeProductCheck({ urls, password });
    res.status(200).json({ success: true, data: results });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
}
