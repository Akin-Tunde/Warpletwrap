import type { NeynarUserBulkResponse } from "../types/neynar";

const NEYNAR_API_KEY = import.meta.env.VITE_NEYNAR_API_KEY;
const NEYNAR_BASE_URL = "https://api.neynar.com/v2/farcaster";

if (!NEYNAR_API_KEY) {
  console.warn("VITE_NEYNAR_API_KEY is not set");
}

export async function getUserByFid(
  fid: number
): Promise<NeynarUserBulkResponse> {
  const response = await fetch(`${NEYNAR_BASE_URL}/user/bulk?fids=${fid}`, {
    headers: {
      accept: "application/json",
      "x-api-key": NEYNAR_API_KEY || "",
    },
  });

  if (!response.ok) {
    throw new Error(`Neynar API error: ${response.statusText}`);
  }

  return response.json();
}


export async function getUserCasts(fid: number, limit = 1000) {
  const response = await fetch(
    `${NEYNAR_BASE_URL}/feed/user/casts?fid=${fid}&limit=${limit}&include_replies=true&include_recasts=true`,
    {
      headers: {
        accept: "application/json",
        "x-api-key": NEYNAR_API_KEY || "",
      },
    }
  );

  if (!response.ok) {
    throw new Error("Failed to fetch casts");
  }

  return response.json();
}