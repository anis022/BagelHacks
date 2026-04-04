import { CHAIN_CONFIG } from "./chainConfig";
import { BRIDGES } from "../data/bridges";
import { STABLECOINS } from "../data/stablecoins";
import { findBridges, calculateFee, calculateReceiveAmount } from "../utils/bridgeUtils";

export type QuoteRequest = {
  fromChain: string;
  toChain: string;
  token: string;
  amount: string;
  fromAddress?: string;
  toAddress?: string;
};

export type QuoteResult = {
  bridgeId: string;
  bridgeName: string;
  fromChain: string;
  toChain: string;
  token: string;
  fromAmount: string;
  toAmount: string;
  estimatedTime: number;
  gasCostUSD: string;
  feeCostUSD: string;
  totalCostUSD: string;
  feePercent: number;
  tool: string;
  toolDetails: {
    name: string;
    logoURI: string;
  };
};

export type TxStatus = {
  txHash: string;
  status: "PENDING" | "DONE" | "FAILED" | "NOT_FOUND";
  substatus?: string;
  substatusMessage?: string;
  fromChain: string;
  toChain: string;
  token: string;
  fromAmount: string;
  toAmount?: string;
  receivingTxHash?: string;
};

const LIFI_BASE_URL = "https://li.quest/v1";

function getLifiChainId(chainId: string): string {
  const config = CHAIN_CONFIG[chainId];
  if (!config) throw new Error(`Unknown chain: ${chainId}`);
  return String(config.lifiChainId);
}

function getTokenAddress(chainId: string, token: string): string {
  const config = CHAIN_CONFIG[chainId];
  if (!config) throw new Error(`Unknown chain: ${chainId}`);
  const address = config.tokens[token];
  if (!address) throw new Error(`Token ${token} not available on chain ${chainId}`);
  return address;
}

function buildHeaders(): Record<string, string> {
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (process.env.LIFI_API_KEY) {
    headers["Authorization"] = `Bearer ${process.env.LIFI_API_KEY}`;
  }
  return headers;
}

function estimatedTimeToSeconds(str: string): number {
  const match = str.match(/(\d+)/);
  if (!match) return 180;
  return parseInt(match[1]) * 60;
}

function getTokenDecimals(token: string): number {
  return STABLECOINS.find((stablecoin) => stablecoin.symbol === token)?.decimals ?? 6;
}

function buildMockQuotes(req: QuoteRequest): QuoteResult[] {
  const bridges = findBridges(req.fromChain, req.toChain, req.token);
  const amountNum = parseFloat(req.amount);

  return bridges.map((bridge) => {
    const fee = calculateFee(amountNum, bridge.feePercent);
    const receiveAmount = calculateReceiveAmount(amountNum, fee);
    const gasCostUSD = (Math.random() * 2 + 0.5).toFixed(2);
    const feeCostUSD = fee.toFixed(2);
    const totalCostUSD = (parseFloat(gasCostUSD) + parseFloat(feeCostUSD)).toFixed(2);

    return {
      bridgeId: bridge.id,
      bridgeName: bridge.name,
      fromChain: req.fromChain,
      toChain: req.toChain,
      token: req.token,
      fromAmount: req.amount,
      toAmount: receiveAmount.toFixed(6),
      estimatedTime: estimatedTimeToSeconds(bridge.estimatedTime),
      gasCostUSD,
      feeCostUSD,
      totalCostUSD,
      feePercent: bridge.feePercent,
      tool: bridge.id,
      toolDetails: {
        name: bridge.name,
        logoURI: "",
      },
    };
  });
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapRouteToQuoteResult(route: any, req: QuoteRequest): QuoteResult {
  const step = route.steps?.[0];
  const tool = step?.tool ?? "unknown";
  const toolDetails = step?.toolDetails ?? { name: tool, logoURI: "" };

  const gasCostUSD = (route.gasCostUSD ?? "0").toString();
  const feeCostUSD =
    route.steps
      ?.flatMap((s: { estimate?: { feeCosts?: { amountUSD?: string }[] } }) => s.estimate?.feeCosts ?? [])
      .reduce(
        (acc: number, fc: { amountUSD?: string }) => acc + parseFloat(fc.amountUSD ?? "0"),
        0
      )
      .toFixed(4) ?? "0";
  const totalCostUSD = (parseFloat(gasCostUSD) + parseFloat(feeCostUSD)).toFixed(4);

  const fromAmountDecimal = (
    parseFloat(route.fromAmount ?? req.amount) /
    Math.pow(10, route.fromToken?.decimals ?? 6)
  ).toFixed(6);

  const toAmountDecimal = (
    parseFloat(route.toAmount ?? "0") /
    Math.pow(10, route.toToken?.decimals ?? 6)
  ).toFixed(6);

  const feePercent =
    parseFloat(fromAmountDecimal) > 0
      ? ((parseFloat(fromAmountDecimal) - parseFloat(toAmountDecimal)) /
          parseFloat(fromAmountDecimal)) *
        100
      : 0;

  const bridgeId =
    BRIDGES.find((b) => b.name.toLowerCase().includes(tool.toLowerCase()))?.id ?? tool;
  const bridgeName =
    BRIDGES.find((b) => b.id === bridgeId)?.name ?? toolDetails.name ?? tool;

  return {
    bridgeId,
    bridgeName,
    fromChain: req.fromChain,
    toChain: req.toChain,
    token: req.token,
    fromAmount: fromAmountDecimal,
    toAmount: toAmountDecimal,
    estimatedTime: route.steps?.reduce(
      (acc: number, s: { estimate?: { executionDuration?: number } }) =>
        acc + (s.estimate?.executionDuration ?? 60),
      0
    ) ?? 180,
    gasCostUSD,
    feeCostUSD,
    totalCostUSD,
    feePercent: parseFloat(feePercent.toFixed(4)),
    tool,
    toolDetails: {
      name: toolDetails.name ?? tool,
      logoURI: toolDetails.logoURI ?? "",
    },
  };
}

export async function getQuotes(req: QuoteRequest): Promise<QuoteResult[]> {
  if (!process.env.LIFI_API_KEY) {
    return buildMockQuotes(req);
  }

  try {
    const fromChainId = getLifiChainId(req.fromChain);
    const toChainId = getLifiChainId(req.toChain);
    const fromTokenAddress = getTokenAddress(req.fromChain, req.token);
    const toTokenAddress = getTokenAddress(req.toChain, req.token);

    const decimals = getTokenDecimals(req.token);
    const fromAmount = BigInt(
      Math.round(parseFloat(req.amount) * Math.pow(10, decimals))
    ).toString();

    const params = new URLSearchParams({
      fromChainId,
      toChainId,
      fromTokenAddress,
      toTokenAddress,
      fromAmount,
      "options.order": "CHEAPEST",
    });

    const res = await fetch(`${LIFI_BASE_URL}/routes?${params}`, {
      headers: buildHeaders(),
      next: { revalidate: 30 },
    });

    if (!res.ok) {
      console.error(`LI.FI /routes error ${res.status}: ${await res.text()}`);
      return buildMockQuotes(req);
    }

    const data = await res.json();
    const routes: unknown[] = data.routes ?? [];

    if (routes.length === 0) return buildMockQuotes(req);

    return routes.map((route) => mapRouteToQuoteResult(route, req));
  } catch (err) {
    console.error("LI.FI getQuotes failed:", err);
    return buildMockQuotes(req);
  }
}

export async function getTxStatus(
  txHash: string,
  bridge: string,
  fromChain: string,
  toChain: string
): Promise<TxStatus> {
  const token = "USDC"; // default fallback — actual token tracked via DB

  if (!process.env.LIFI_API_KEY) {
    return {
      txHash,
      status: "PENDING",
      fromChain,
      toChain,
      token,
      fromAmount: "0",
    };
  }

  try {
    const fromChainId = getLifiChainId(fromChain);
    const toChainId = getLifiChainId(toChain);

    const params = new URLSearchParams({
      txHash,
      bridge,
      fromChain: fromChainId,
      toChain: toChainId,
    });

    const res = await fetch(`${LIFI_BASE_URL}/status?${params}`, {
      headers: buildHeaders(),
    });

    if (res.status === 404) {
      return {
        txHash,
        status: "NOT_FOUND",
        fromChain,
        toChain,
        token,
        fromAmount: "0",
      };
    }

    if (!res.ok) {
      throw new Error(`LI.FI /status error ${res.status}: ${await res.text()}`);
    }

    const data = await res.json();

    const lifiStatus = data.status as string;
    let status: TxStatus["status"] = "PENDING";
    if (lifiStatus === "DONE") status = "DONE";
    else if (lifiStatus === "FAILED") status = "FAILED";
    else if (lifiStatus === "NOT_FOUND") status = "NOT_FOUND";

    return {
      txHash,
      status,
      substatus: data.substatus,
      substatusMessage: data.substatusMessage,
      fromChain,
      toChain,
      token: data.sending?.token?.symbol ?? token,
      fromAmount: data.sending?.amount ?? "0",
      toAmount: data.receiving?.amount,
      receivingTxHash: data.receiving?.txHash,
    };
  } catch (err) {
    console.error("LI.FI getTxStatus failed:", err);
    throw new Error(
      `Failed to get transaction status: ${err instanceof Error ? err.message : String(err)}`
    );
  }
}
