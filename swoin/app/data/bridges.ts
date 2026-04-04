export type Bridge = {
  id: string;
  name: string;
  logo: string;
  supportedChains: string[];
  supportedTokens: string[];
  estimatedTime: string;
  feePercent: number;
  security: "high" | "medium" | "low";
  url: string;
};

export const BRIDGES: Bridge[] = [
  {
    id: "wormhole",
    name: "Wormhole",
    logo: "🌀",
    supportedChains: ["ethereum", "base", "polygon", "arbitrum", "optimism", "avalanche", "solana", "bnb"],
    supportedTokens: ["USDC", "USDT", "DAI"],
    estimatedTime: "~2 min",
    feePercent: 0.05,
    security: "high",
    url: "https://wormhole.com",
  },
  {
    id: "stargate",
    name: "Stargate Finance",
    logo: "⭐",
    supportedChains: ["ethereum", "base", "polygon", "arbitrum", "optimism", "avalanche", "bnb"],
    supportedTokens: ["USDC", "USDT"],
    estimatedTime: "~3 min",
    feePercent: 0.06,
    security: "high",
    url: "https://stargate.finance",
  },
  {
    id: "across",
    name: "Across Protocol",
    logo: "🔀",
    supportedChains: ["ethereum", "base", "polygon", "arbitrum", "optimism"],
    supportedTokens: ["USDC", "USDT", "DAI"],
    estimatedTime: "~1 min",
    feePercent: 0.04,
    security: "high",
    url: "https://across.to",
  },
  {
    id: "hop",
    name: "Hop Protocol",
    logo: "🐇",
    supportedChains: ["ethereum", "polygon", "arbitrum", "optimism", "base"],
    supportedTokens: ["USDC", "USDT", "DAI"],
    estimatedTime: "~5 min",
    feePercent: 0.03,
    security: "medium",
    url: "https://hop.exchange",
  },
  {
    id: "debridge",
    name: "deBridge",
    logo: "🌉",
    supportedChains: ["ethereum", "polygon", "arbitrum", "avalanche", "bnb", "solana"],
    supportedTokens: ["USDC", "USDT", "PYUSD", "EURC"],
    estimatedTime: "~4 min",
    feePercent: 0.07,
    security: "medium",
    url: "https://debridge.finance",
  },
];
