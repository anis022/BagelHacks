export type Chain = {
  id: string;
  name: string;
  symbol: string;
  logo: string;
  color: string;
  nativeToken: string;
};

export const CHAINS: Chain[] = [
  {
    id: "ethereum",
    name: "Ethereum",
    symbol: "ETH",
    logo: "🔷",
    color: "bg-blue-900",
    nativeToken: "ETH",
  },
  {
    id: "base",
    name: "Base",
    symbol: "BASE",
    logo: "🔵",
    color: "bg-blue-700",
    nativeToken: "ETH",
  },
  {
    id: "polygon",
    name: "Polygon",
    symbol: "MATIC",
    logo: "🟣",
    color: "bg-purple-900",
    nativeToken: "MATIC",
  },
  {
    id: "arbitrum",
    name: "Arbitrum",
    symbol: "ARB",
    logo: "🔴",
    color: "bg-red-900",
    nativeToken: "ETH",
  },
  {
    id: "optimism",
    name: "Optimism",
    symbol: "OP",
    logo: "🔴",
    color: "bg-red-700",
    nativeToken: "ETH",
  },
  {
    id: "avalanche",
    name: "Avalanche",
    symbol: "AVAX",
    logo: "🔺",
    color: "bg-red-800",
    nativeToken: "AVAX",
  },
  {
    id: "solana",
    name: "Solana",
    symbol: "SOL",
    logo: "🟪",
    color: "bg-purple-700",
    nativeToken: "SOL",
  },
  {
    id: "bnb",
    name: "BNB Chain",
    symbol: "BNB",
    logo: "🟡",
    color: "bg-yellow-800",
    nativeToken: "BNB",
  },
];
