import { useQuery } from "@tanstack/react-query";
import { getUserByFid } from "../lib/neynar";
import {
  getWalletProfitability,
  getWalletNetWorth,
  getWalletChains,
  getProfitabilitySummary,
  getNetWorth,
  getWalletTokenBalances,
  getWalletStats, // Added this import
  type MoralisTokenBalance,
} from "../lib/moralis";
import { getWarpletNFT } from "../lib/alchemy";
import type {
  MoralisTokenProfitability,
  MoralisProfitabilitySummaryResponse,
} from "../types/moralis";

// --- INTERFACES ---

export interface IncomeBreakdown {
  staking: number;
  lending: number;
  liquidity: number;
  airdrop: number;
  total: number;
  details: Array<{ category: string; symbol: string; value: number; logo: string | null }>;
}

export interface WarpletMetrics {
  totalProfitLoss: number;
  biggestWin: {
    token: MoralisTokenProfitability;
    profitUsd: number;
  } | null;
  biggestLoss: {
    token: MoralisTokenProfitability;
    profitUsd: number;
  } | null;
  mostTradedToken: {
    token: MoralisTokenProfitability;
    tradeCount: number;
  } | null;
  archetype: string;
  winRate: number;
  totalTrades: number;
  totalTokenTransfers: number;
  totalNFTCollections: number;
  totalTradeVolume: number;
  totalBuys: number;
  totalSells: number;
  totalBoughtVolume: number;
  totalSoldVolume: number;
  firstTransactionDate: string | null;
  currentNetWorth: number;
  warpletNft: {
    image: {
      originalUrl: string;
      thumbnailUrl: string;
      pngUrl: string;
    };
    name: string;
    tokenId: string;
  } | null;

  // NEW FIELDS
  holdings: MoralisTokenBalance[];
  income: IncomeBreakdown; // Updated type
  roi: {
    bestAsset: MoralisTokenBalance | null;
    worstAsset: MoralisTokenBalance | null;
    averageRoi: number;
  };
}

// --- HELPER FUNCTIONS ---

function classifyToken(token: MoralisTokenBalance, profitStats: MoralisTokenProfitability | undefined): string {
  const symbol = token.symbol.toUpperCase();
  const name = token.name.toUpperCase();
  
  // Airdrop Logic: Zero buy price but we have it, OR massive ROI (>1000%)
  const isAirdrop = profitStats && (
    (parseFloat(profitStats.avg_buy_price_usd) === 0 && profitStats.total_buys === 0) || 
    profitStats.realized_profit_percentage > 1000
  );
  if (isAirdrop) return "Airdrop";

  // Staking Logic (Liquid Staking Tokens)
  if (['STETH', 'RETH', 'CBETH', 'WSTETH', 'SFRXETH', 'RPL', 'EIGEN'].some(s => symbol.includes(s))) return "Staking";
  
  // Lending/Borrowing Logic (Aave aTokens, Compound cTokens)
  if (/^A[A-Z]+/.test(token.symbol) || /^C[A-Z]+/.test(token.symbol)) return "Lending";

  // Liquidity / Yield Farming Logic
  if (name.includes("LP") || name.includes("UNISWAP") || name.includes("CURVE") || name.includes("BALANCER") || symbol.includes("V2") || symbol.includes("SLP")) {
    return "Liquidity";
  }

  return "Holding"; 
}

function calculateMetrics(
  tokens: MoralisTokenProfitability[],
  holdings: MoralisTokenBalance[],
  statsData?: { token_transfers: { total: string }; collections: string },
  summaryData?: MoralisProfitabilitySummaryResponse,
  chainsData?: {
    active_chains: Array<{
      first_transaction: { block_timestamp: string };
    }>;
  },
  netWorthData?: { total_networth_usd: string },
  warpletNft?: any
): WarpletMetrics {
  
  // 1. Filter out tokens with no sells
  const tradedTokens = tokens.filter((t) => t.total_sells > 0);

  // 2. Initialize Income Breakdown
  const incomeBreakdown: IncomeBreakdown = {
    staking: 0,
    lending: 0,
    liquidity: 0,
    airdrop: 0,
    total: 0,
    details: []
  };

  // 3. Process Holdings for Income & Classification
  holdings.forEach(h => {
    // Find profit stats for this holding to check cost basis
    const profitStats = tokens.find(t => t.token_address.toLowerCase() === h.token_address.toLowerCase());
    const category = classifyToken(h, profitStats);
    
    if (category !== "Holding") {
      const val = h.usd_value;
      
      if (category === "Staking") incomeBreakdown.staking += val;
      if (category === "Lending") incomeBreakdown.lending += val;
      if (category === "Liquidity") incomeBreakdown.liquidity += val;
      if (category === "Airdrop") incomeBreakdown.airdrop += val;

      incomeBreakdown.details.push({
        category,
        symbol: h.symbol,
        value: val,
        logo: h.thumbnail || h.logo
      });
    }
  });

  incomeBreakdown.total = incomeBreakdown.staking + incomeBreakdown.lending + incomeBreakdown.liquidity + incomeBreakdown.airdrop;

  // 4. Calculate P/L
  const totalProfitLoss = tradedTokens.reduce((sum, token) => {
    return sum + Number.parseFloat(token.realized_profit_usd);
  }, 0);

  // 5. Find Biggest Win
  let biggestWin: WarpletMetrics["biggestWin"] = null;
  let maxProfit = -Infinity;
  for (const token of tradedTokens) {
    const profit = Number.parseFloat(token.realized_profit_usd);
    if (profit > maxProfit) {
      maxProfit = profit;
      biggestWin = { token, profitUsd: profit };
    }
  }

  // 6. Find Biggest Loss
  let biggestLoss: WarpletMetrics["biggestLoss"] = null;
  let minProfit = Infinity;
  for (const token of tradedTokens) {
    const profit = Number.parseFloat(token.realized_profit_usd);
    if (profit < minProfit) {
      minProfit = profit;
      biggestLoss = { token, profitUsd: profit };
    }
  }

  // 7. Find Most Traded
  let mostTradedToken: WarpletMetrics["mostTradedToken"] = null;
  let maxTrades = 0;
  for (const token of tokens) {
    if (token.count_of_trades > maxTrades) {
      maxTrades = token.count_of_trades;
      mostTradedToken = { token, tradeCount: token.count_of_trades };
    }
  }

  // 8. Calculate Win Rate
  const profitableTokens = tradedTokens.filter(
    (t) => Number.parseFloat(t.realized_profit_usd) > 0
  );
  const winRate =
    tradedTokens.length > 0
      ? (profitableTokens.length / tradedTokens.length) * 100
      : 0;
      
  const currentNetWorth = netWorthData?.total_networth_usd
      ? Number.parseFloat(netWorthData.total_networth_usd)
      : 0;

  const totalTrades = tokens.reduce(
    (sum, token) => sum + token.count_of_trades,
    0
  );

  // 9. Determine Archetype (Gamification)
  let archetype = "Base Explorer 🧭";
  
  if (currentNetWorth > 50000) {
    archetype = "Based Whale 🐋";
  } else if (totalProfitLoss < -500 && totalTrades > 100) {
    archetype = "Diamond Handed Degen 💎"; // Lost money but trades a lot
  } else if (winRate > 65 && totalTrades > 20) {
    archetype = "Alpha Hunter 🎯";
  } else if (holdings.length > 0 && holdings[0].portfolio_percentage > 70) {
    archetype = "Maximalist 🦁"; // All in on one coin
  } else if (statsData?.collections && parseInt(statsData.collections) > 30) {
    archetype = "JPEG Collector 🖼️";
  }

  // 10. Calculate ROI for Holdings
  let totalInvested = 0;
  let totalCurrentValue = 0;

  const holdingsWithRoi = holdings.map((holding) => {
    const profitStats = tokens.find(
      (t) => t.token_address.toLowerCase() === holding.token_address.toLowerCase()
    );
    
    // Heuristic: Cost Basis
    let costBasis = 0;
    if (profitStats && Number(profitStats.avg_buy_price_usd) > 0) {
       const balanceNum = parseFloat(holding.balance) / (10 ** holding.decimals);
       costBasis = parseFloat(profitStats.avg_buy_price_usd) * balanceNum;
    }

    const roi =
      costBasis > 0 ? ((holding.usd_value - costBasis) / costBasis) * 100 : 0;

    totalInvested += costBasis;
    totalCurrentValue += holding.usd_value;

    return { ...holding, roi, costBasis };
  });

  const averageRoi =
    totalInvested > 0
      ? ((totalCurrentValue - totalInvested) / totalInvested) * 100
      : 0;

  return {
    totalProfitLoss,
    currentNetWorth,
    archetype,
    biggestWin,
    biggestLoss,
    mostTradedToken,
    winRate,
    totalTrades,
    
    totalTokenTransfers: statsData?.token_transfers?.total
      ? Number.parseInt(statsData.token_transfers.total)
      : 0,
    totalNFTCollections: statsData?.collections
      ? Number.parseInt(statsData.collections)
      : 0,
    totalTradeVolume: summaryData
      ? Number.parseFloat(summaryData.total_trade_volume)
      : 0,
    totalBuys: summaryData ? summaryData.total_buys : 0,
    totalSells: summaryData ? summaryData.total_sells : 0,
    totalBoughtVolume: summaryData
      ? Number.parseFloat(summaryData.total_bought_volume_usd)
      : 0,
    totalSoldVolume: summaryData
      ? Number.parseFloat(summaryData.total_sold_volume_usd)
      : 0,
    firstTransactionDate:
      chainsData?.active_chains?.[0]?.first_transaction?.block_timestamp ||
      null,
    
    warpletNft: warpletNft || null,

    holdings: holdingsWithRoi,
    income: incomeBreakdown,
    roi: {
      bestAsset:
        holdingsWithRoi.length > 0
          ? holdingsWithRoi.sort((a, b) => b.roi - a.roi)[0]
          : null,
      worstAsset:
        holdingsWithRoi.length > 0
          ? holdingsWithRoi.sort((a, b) => a.roi - b.roi)[0]
          : null,
      averageRoi,
    },
  };
}

// --- MAIN HOOK ---

export function useWarpletData(fid: number | null, chain: string = "base")  {
  // Fetch user data from Neynar
  const {
    data: userData,
    isLoading: isLoadingUser,
    error: userError,
  } = useQuery({
    queryKey: ["neynar-user", fid],
    queryFn: async () => {
      if (!fid) throw new Error("No FID provided");
      return getUserByFid(fid);
    },
    enabled: !!fid,
  });

  const walletAddress =
    userData?.users[0]?.verified_addresses?.primary?.eth_address ||
    userData?.users[0]?.custody_address;

  // 1. Fetch Profitability (PASSING CHAIN)
  const {
    data: profitabilityData,
    isLoading: isLoadingProfitability,
    error: profitabilityError,
  } = useQuery({
    queryKey: ["moralis-profitability", walletAddress, chain],
    queryFn: async () => {
      if (!walletAddress) throw new Error("No wallet address found");
      // Fix: Pass chain argument
      return getWalletProfitability(walletAddress, chain);
    },
    enabled: !!walletAddress,
    staleTime: 1000 * 60 * 60,
    gcTime: 1000 * 60 * 60 * 24,
  });

  // 2. Fetch Token Balances (PASSING CHAIN)
  const {
    data: holdingsData,
    isLoading: isLoadingHoldings,
  } = useQuery({
    queryKey: ["moralis-balances", walletAddress, chain],
    queryFn: async () => {
      if (!walletAddress) throw new Error("No wallet address found");
      // Fix: Pass chain argument
      return getWalletTokenBalances(walletAddress, chain);
    },
    enabled: !!walletAddress,
    staleTime: 1000 * 60 * 5,
  });

  // 3. Fetch Wallet Stats (PASSING CHAIN)
  const {
    data: statsData,
    isLoading: isLoadingStats,
    error: statsError,
  } = useQuery({
    queryKey: ["moralis-stats", walletAddress, chain],
    queryFn: async () => {
      if (!walletAddress) throw new Error("No wallet address found");
      // Fix: Use getWalletStats and pass chain argument
      return getWalletStats(walletAddress, chain);
    },
    enabled: !!walletAddress,
    staleTime: 1000 * 60 * 60,
    gcTime: 1000 * 60 * 60 * 24,
  });

  // 4. Fetch Chains Data (No chain param needed usually, but logic kept same)
  const {
    data: chainsData,
    isLoading: isLoadingChains,
    error: chainsError,
  } = useQuery({
    queryKey: ["moralis-chains", walletAddress],
    queryFn: async () => {
      if (!walletAddress) throw new Error("No wallet address found");
      return getWalletChains(walletAddress);
    },
    enabled: !!walletAddress,
    staleTime: 1000 * 60 * 60,
    gcTime: 1000 * 60 * 60 * 24,
  });

  // 5. Fetch Summary (PASSING CHAIN)
  const {
    data: summaryData,
    isLoading: isLoadingSummary,
    error: summaryError,
  } = useQuery({
    queryKey: ["moralis-summary", walletAddress, chain],
    queryFn: async () => {
      if (!walletAddress) throw new Error("No wallet address found");
      // Fix: Pass chain argument
      return getProfitabilitySummary(walletAddress, chain);
    },
    enabled: !!walletAddress,
    staleTime: 1000 * 60 * 60,
    gcTime: 1000 * 60 * 60 * 24,
  });

  // 6. Fetch Net Worth (PASSING CHAIN)
  const {
    data: netWorthData,
    isLoading: isLoadingNetWorth,
    error: netWorthError,
  } = useQuery({
    queryKey: ["moralis-networth", walletAddress, chain],
    queryFn: async () => {
      if (!walletAddress) throw new Error("No wallet address found");
      // Fix: Pass chain argument
      const data = await getNetWorth(walletAddress, [chain]);
      return data;
    },
    enabled: !!walletAddress,
    staleTime: 1000 * 60 * 60,
    gcTime: 1000 * 60 * 60 * 24,
  });

  // 7. Fetch Warplet NFT (Alchemy - Specific to Base, so no dynamic chain)
  const { data: warpletNft, isLoading: isLoadingNft } = useQuery({
    queryKey: ["alchemy-warplet-nft", walletAddress],
    queryFn: async () => {
      if (!walletAddress) return null;
      return getWarpletNFT(walletAddress);
    },
    enabled: !!walletAddress,
    staleTime: 1000 * 60 * 60,
    gcTime: 1000 * 60 * 60 * 24,
  });

  const metrics =
    profitabilityData && holdingsData
      ? calculateMetrics(
          profitabilityData.result,
          holdingsData,
          statsData,
          summaryData,
          chainsData,
          netWorthData,
          warpletNft
        )
      : null;

  return {
    user: userData?.users[0],
    walletAddress,
    metrics,
    isLoading:
      isLoadingUser ||
      isLoadingProfitability ||
      isLoadingHoldings ||
      isLoadingStats ||
      isLoadingChains ||
      isLoadingSummary ||
      isLoadingNetWorth ||
      isLoadingNft,
    error:
      userError ||
      profitabilityError ||
      statsError ||
      chainsError ||
      summaryError ||
      netWorthError,
  };
}