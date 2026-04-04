export type Stablecoin = {
  symbol: string;
  name: string;
  logo: string;
  peg: string;
  decimals: number;
  chains: string[];
};

export const STABLECOINS: Stablecoin[] = [
  {
    symbol: "USDC",
    name: "USD Coin",
    logo: "🔵",
    peg: "USD",
    decimals: 6,
    chains: ["ethereum", "base", "polygon", "arbitrum", "optimism", "avalanche", "solana"],
  },
  {
    symbol: "USDT",
    name: "Tether USD",
    logo: "💚",
    peg: "USD",
    decimals: 6,
    chains: ["ethereum", "polygon", "arbitrum", "optimism", "avalanche", "solana", "bnb"],
  },
  {
    symbol: "PYUSD",
    name: "PayPal USD",
    logo: "🅿️",
    peg: "USD",
    decimals: 6,
    chains: ["ethereum", "solana"],
  },
  {
    symbol: "EURC",
    name: "Euro Coin",
    logo: "🇪🇺",
    peg: "EUR",
    decimals: 6,
    chains: ["ethereum", "base", "avalanche", "solana"],
  },
  {
    symbol: "DAI",
    name: "Dai Stablecoin",
    logo: "🟡",
    peg: "USD",
    decimals: 18,
    chains: ["ethereum", "base", "polygon", "arbitrum", "optimism", "avalanche", "bnb"],
  },
];
