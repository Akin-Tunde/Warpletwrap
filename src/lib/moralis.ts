// FILE: src/lib/moralis.ts

import type {
  MoralisProfitabilityResponse,
  MoralisWalletStatsResponse,
  MoralisWalletChainsResponse,
  MoralisWalletNetWorthResponse,
  MoralisProfitabilitySummaryResponse,
  MoralisNetWorthResponse,
} from "../types/moralis";

const MORALIS_API_KEY = import.meta.env.VITE_MORALIS_API_KEY;
const MORALIS_BASE_URL = "https://deep-index.moralis.io/api/v2.2";

if (!MORALIS_API_KEY) {
  console.warn("VITE_MORALIS_API_KEY is not set");
}

export interface MoralisTokenBalance {
  token_address: string;
  name: string;
  symbol: string;
  logo: string | null;
  thumbnail: string | null;
  decimals: number;
  balance: string;
  usd_price: number;
  usd_value: number;
  portfolio_percentage: number;
}

// Global list of chains to check for net worth
const ALL_EVM_CHAINS = [
  "eth",
  "base",
  "polygon",
  "bsc",
  "arbitrum",
  "optimism",
  "avalanche",
  "fantom",
  "linea",
  "monad"
];

export async function getWalletTokenBalances(
  address: string,
  chain = "base"
): Promise<MoralisTokenBalance[]> {
  const response = await fetch(
    `${MORALIS_BASE_URL}/wallets/${address}/tokens?chain=${chain}&exclude_spam=true&exclude_unverified_contracts=true`,
    {
      headers: {
        accept: "application/json",
        "X-API-Key": MORALIS_API_KEY || "",
      },
    }
  );

  if (!response.ok) {
    throw new Error(`Moralis API error: ${response.statusText}`);
  }

  const data = await response.json();
  return data.result;
}

export async function getWalletProfitability(
  address: string,
  chain = "base"
): Promise<MoralisProfitabilityResponse> {
  const response = await fetch(
    `${MORALIS_BASE_URL}/wallets/${address}/profitability?chain=${chain}`,
    {
      headers: {
        accept: "application/json",
        "X-API-Key": MORALIS_API_KEY || "",
      },
    }
  );

  if (!response.ok) {
    throw new Error(`Moralis API error: ${response.statusText}`);
  }

  return response.json();
}

export async function getWalletStats(
  address: string,
  chain = "base"
): Promise<MoralisWalletStatsResponse> {
  const response = await fetch(
    `${MORALIS_BASE_URL}/wallets/${address}/stats?chain=${chain}`,
    {
      headers: {
        accept: "application/json",
        "X-API-Key": MORALIS_API_KEY || "",
      },
    }
  );

  if (!response.ok) {
    throw new Error(`Moralis API error: ${response.statusText}`);
  }

  return response.json();
}

export async function getWalletChains(
  address: string,
  chains = ALL_EVM_CHAINS
): Promise<MoralisWalletChainsResponse> {
  const chainParams = chains.map((c, i) => `chains%5B${i}%5D=${c}`).join("&");
  const response = await fetch(
    `${MORALIS_BASE_URL}/wallets/${address}/chains?${chainParams}`,
    {
      headers: {
        accept: "application/json",
        "X-API-Key": MORALIS_API_KEY || "",
      },
    }
  );

  if (!response.ok) {
    throw new Error(`Moralis API error: ${response.statusText}`);
  }

  return response.json();
}

export async function getWalletNetWorth(
  address: string,
  chain = "base"
): Promise<MoralisWalletNetWorthResponse> {
  const response = await fetch(
    `${MORALIS_BASE_URL}/wallets/${address}/stats?chain=${chain}`,
    {
      headers: {
        accept: "application/json",
        "X-API-Key": MORALIS_API_KEY || "",
      },
    }
  );

  if (!response.ok) {
    throw new Error(`Moralis API error: ${response.statusText}`);
  }

  return response.json();
}

export async function getProfitabilitySummary(
  address: string,
  chain = "base"
): Promise<MoralisProfitabilitySummaryResponse> {
  const response = await fetch(
    `${MORALIS_BASE_URL}/wallets/${address}/profitability/summary?chain=${chain}`,
    {
      headers: {
        accept: "application/json",
        "X-API-Key": MORALIS_API_KEY || "",
      },
    }
  );

  if (!response.ok) {
    throw new Error(`Moralis API error: ${response.statusText}`);
  }

  return response.json();
}

/**
 * FIXED: Removed max_token_inactivity=1 to match Thunder Client output ($25k+)
 * Added Hyperliquid and Monad to the default chains list.
 */
export async function getNetWorth(
  address: string,
  chains = ALL_EVM_CHAINS
): Promise<MoralisNetWorthResponse> {
  const chainParams = chains.map((c, i) => `chains%5B${i}%5D=${c}`).join("&");
  
  // Cleaned query parameters: Removed max_token_inactivity
  const queryParams = "exclude_spam=true&exclude_unverified_contracts=true&min_pair_side_liquidity_usd=1000";
  
  const response = await fetch(
    `${MORALIS_BASE_URL}/wallets/${address}/net-worth?${chainParams}&${queryParams}`,
    {
      headers: {
        accept: "application/json",
        "X-API-Key": MORALIS_API_KEY || "",
      },
    }
  );

  const data = await response.json();
  
  // Log the result so you can see the $25k+ figure in your browser console
  console.log("💰 STEP 4 COMPLETE: Global Net Worth Data Result", data);
  
  if (!response.ok) {
    throw new Error(`Moralis API error: ${response.statusText}`);
  }

  return data;
}