export type Stablecoin = {
  symbol: string;
  name: string;
  logo: string;
  peg: string;
  chains: string[];
};

export const STABLECOINS: Stablecoin[] = [
  {
    symbol: "USDC",
    name: "USD Coin",
    logo: "🔵",
    peg: "USD",
    chains: ["ethereum", "base", "polygon", "arbitrum", "optimism", "avalanche", "solana"],
  },
  {
    symbol: "USDT",
    name: "Tether USD",
    logo: "💚",
    peg: "USD",
    chains: ["ethereum", "polygon", "arbitrum", "optimism", "avalanche", "solana", "bnb"],
  },
  {
    symbol: "PYUSD",
    name: "PayPal USD",
    logo: "🅿️",
    peg: "USD",
    chains: ["ethereum", "solana"],
  },
  {
    symbol: "EURC",
    name: "Euro Coin",
    logo: "🇪🇺",
    peg: "EUR",
    chains: ["ethereum", "base", "avalanche", "solana"],
  },
  {
    symbol: "DAI",
    name: "Dai Stablecoin",
    logo: "🟡",
    peg: "USD",
    chains: ["ethereum", "base", "polygon", "arbitrum", "optimism", "avalanche", "bnb"],
  },
];
