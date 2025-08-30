import { ApiResponse } from "../types";

export async function runProductCheck(
  urls: string[],
  password?: string
): Promise<ApiResponse> {
  const res = await fetch(
    "https://ecom-test-automation-backend.vercel.app/api/runProductChecks",
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ urls, password }),
    }
  );

  const response = await res.json();
  return response;
}
