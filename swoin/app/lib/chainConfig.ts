export type ChainConfig = {
  lifiChainId: number | string;
  tokens: Record<string, string>;
};

export const CHAIN_CONFIG: Record<string, ChainConfig> = {
  ethereum: {
    lifiChainId: 1,
    tokens: {
      USDC: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
      USDT: "0xdAC17F958D2ee523a2206206994597C13D831ec7",
      DAI: "0x6B175474E89094C44Da98b954EedeAC495271d0F",
      EURC: "0x1aBaEA1f7C830bD89Acc67eC4af516284b1bC33c",
      PYUSD: "0x6c3ea9036406852006290770BEdFcAbA0e23A0e8",
    },
  },
  base: {
    lifiChainId: 8453,
    tokens: {
      USDC: "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913",
      DAI: "0x50c5725949A6F0c72E6C4a641F24049A917DB0Cb",
      EURC: "0x60a3E35Cc302bFA44Cb288Bc5a4F316Fdb1adb42",
    },
  },
  polygon: {
    lifiChainId: 137,
    tokens: {
      USDC: "0x3c499c542cEF5E3811e1192ce70d8cC03d5c3359",
      USDT: "0xc2132D05D31c914a87C6611C10748AEb04B58e8F",
      DAI: "0x8f3Cf7ad23Cd3CaDbD9735AFf958023239c6A063",
    },
  },
  arbitrum: {
    lifiChainId: 42161,
    tokens: {
      USDC: "0xaf88d065e77c8cC2239327C5EDb3A432268e5831",
      USDT: "0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9",
      DAI: "0xDA10009cBd5D07dd0CeCc66161FC93D7c9000da1",
    },
  },
  optimism: {
    lifiChainId: 10,
    tokens: {
      USDC: "0x0b2C639c533813f4Aa9D7837CAf62653d097Ff85",
      USDT: "0x94b008aA00579c1307B0EF2c499aD98a8ce58e58",
      DAI: "0xDA10009cBd5D07dd0CeCc66161FC93D7c9000da1",
    },
  },
  avalanche: {
    lifiChainId: 43114,
    tokens: {
      USDC: "0xB97EF9Ef8734C71904D8002F8b6Bc66Dd9c48a6E",
      USDT: "0x9702230A8Ea53601f5cD2dc00fDBc13d4dF4A8c7",
      DAI: "0xd586E7F844cEa2F87f50152665BCbc2C279D8d70",
      EURC: "0xC891EB4cbdEFf6e073e859e987815Ed1505c2ACD",
    },
  },
  bnb: {
    lifiChainId: 56,
    tokens: {
      USDT: "0x55d398326f99059fF775485246999027B3197955",
      DAI: "0x1AF3F329e8BE154074D8769D1FFa4eE058B1DBc3",
    },
  },
  solana: {
    lifiChainId: "SOL",
    tokens: {
      USDC: "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
      USDT: "Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB",
      EURC: "HzwqbKZw8HxMN6bF2yFZNrht3c2iXXzpKcFu7uBEDKtr",
      PYUSD: "2b1kV6DkPAnxd5ixfnxCpjxmKwqjjaYmCZfHsFu24GXo",
    },
  },
};
