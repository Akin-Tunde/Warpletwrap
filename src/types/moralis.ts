export interface MoralisTokenProfitability {
  token_address: string;
  avg_buy_price_usd: string;
  avg_sell_price_usd: string;
  total_usd_invested: string;
  total_tokens_bought: string;
  total_tokens_sold: string;
  total_sold_usd: string;
  avg_cost_of_quantity_sold: string;
  count_of_trades: number;
  realized_profit_usd: string;
  realized_profit_percentage: number;
  total_buys: number;
  total_sells: number;
  name: string;
  symbol: string;
  decimals: string;
  logo: string;
  possible_spam: boolean;
}

export interface MoralisProfitabilityResponse {
  result: MoralisTokenProfitability[];
}

export interface MoralisWalletStatsResponse {
  nfts: string;
  collections: string;
  transactions: {
    total: string;
  };
  nft_transfers: {
    total: string;
  };
  token_transfers: {
    total: string;
  };
}

export interface MoralisWalletChainsResponse {
  address: string;
  active_chains: Array<{
    chain: string;
    chain_id: string;
    first_transaction: {
      block_number: string;
      block_timestamp: string;
      transaction_hash: string;
    };
    last_transaction: {
      block_number: string;
      block_timestamp: string;
      transaction_hash: string;
    };
  }>;
}

export interface MoralisWalletNetWorthResponse {
  nfts: string;
  collections: string;
  transactions: {
    total: string;
  };
  nft_transfers: {
    total: string;
  };
  token_transfers: {
    total: string;
  };
}

export interface MoralisNetWorthResponse {
  total_networth_usd: string;
  chains: Array<{
    chain: string;
    native_balance: string;
    native_balance_formatted: string;
    native_balance_usd: string;
    token_balance_usd: string;
    networth_usd: string;
  }>;
}

export interface MoralisProfitabilitySummaryResponse {
  total_count_of_trades: number;
  total_trade_volume: string;
  total_realized_profit_usd: string;
  total_realized_profit_percentage: number;
  total_buys: number;
  total_sells: number;
  total_sold_volume_usd: string;
  total_bought_volume_usd: string;
}
