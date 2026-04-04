/**
 * OptiRoute — Server-side routing engine for cashout optimization
 * Finds the cheapest path to convert USDM (treated as USDC) to target fiat
 * via crypto exchanges, DEXs, and FX rails.
 */

export const CURRENCIES = ["CAD", "USD", "BRL", "EUR", "USDC", "USDT", "BTC", "ETH", "SOL"] as const;
export type Currency = (typeof CURRENCIES)[number];

type LogEntry = { time: string; type: string; msg: string };
let _logs: LogEntry[] = [];
function log(type: string, msg: string) {
  _logs.push({ time: new Date().toISOString().split("T")[1].split(".")[0], type, msg });
}

interface RateInfo {
  exchange: string;
  from: string;
  to: string;
  bid: number;
  ask: number;
  mid: number;
  spread: number;
  fee: number;
  settlementMin: number;
  settlementMax: number;
  available: boolean;
}

// ─── CONNECTOR: Kraken ────────────────────────────────────
async function fetchKraken(): Promise<Record<string, RateInfo>> {
  log("fetch", "Kraken: fetching BTC, ETH, SOL, USDC, USDT vs USD...");
  try {
    const pairs: Record<string, [string, string]> = {
      XXBTZUSD: ["BTC", "USD"], XETHZUSD: ["ETH", "USD"],
      USDCUSD: ["USDC", "USD"], USDTZUSD: ["USDT", "USD"], SOLUSD: ["SOL", "USD"],
    };
    const res = await fetch("https://api.kraken.com/0/public/Ticker?pair=" + Object.keys(pairs).join(","));
    const data = (await res.json()) as { result?: Record<string, { b: string[]; a: string[] }> };
    const out: Record<string, RateInfo> = {};
    if (data?.result) {
      for (const [k, info] of Object.entries(data.result)) {
        const p = pairs[k];
        if (p) {
          const bid = parseFloat(info.b[0]), ask = parseFloat(info.a[0]);
          out[`${p[0]}_${p[1]}`] = { exchange: "kraken", from: p[0], to: p[1], bid, ask, mid: (bid + ask) / 2, spread: ((ask - bid) / ask) * 100, fee: 0.26, settlementMin: 1, settlementMax: 5, available: true };
        }
      }
    }
    log("ok", `Kraken: ${Object.keys(out).length} pairs loaded`);
    return out;
  } catch (e) { log("error", `Kraken FAILED: ${e instanceof Error ? e.message : "unknown"}`); return {}; }
}

// ─── CONNECTOR: Binance ───────────────────────────────────
async function fetchBinance(): Promise<Record<string, RateInfo>> {
  log("fetch", "Binance: fetching BTC, ETH, SOL, USDC vs USDT/USDC...");
  try {
    const pairs = [
      { s: "BTCUSDT", f: "BTC", t: "USDT" }, { s: "ETHUSDT", f: "ETH", t: "USDT" },
      { s: "SOLUSDT", f: "SOL", t: "USDT" }, { s: "USDCUSDT", f: "USDC", t: "USDT" },
      { s: "BTCUSDC", f: "BTC", t: "USDC" }, { s: "ETHUSDC", f: "ETH", t: "USDC" },
    ];
    const symbols = JSON.stringify(pairs.map((p) => p.s));
    const res = await fetch("https://api.binance.com/api/v3/ticker/bookTicker?symbols=" + symbols);
    const data = (await res.json()) as Array<{ symbol: string; bidPrice: string; askPrice: string }>;
    const out: Record<string, RateInfo> = {};
    if (Array.isArray(data)) {
      for (const tk of data) {
        const p = pairs.find((x) => x.s === tk.symbol);
        if (p) {
          const bid = parseFloat(tk.bidPrice), ask = parseFloat(tk.askPrice);
          out[`${p.f}_${p.t}`] = { exchange: "binance", from: p.f, to: p.t, bid, ask, mid: (bid + ask) / 2, spread: ((ask - bid) / ask) * 100, fee: 0.10, settlementMin: 1, settlementMax: 3, available: true };
        }
      }
    }
    log("ok", `Binance: ${Object.keys(out).length} pairs loaded`);
    return out;
  } catch (e) { log("error", `Binance FAILED: ${e instanceof Error ? e.message : "unknown"}`); return {}; }
}

// ─── CONNECTOR: Coinbase ──────────────────────────────────
async function fetchCoinbase(): Promise<Record<string, RateInfo>> {
  log("fetch", "Coinbase: fetching BTC, ETH, SOL, USDC vs USD...");
  try {
    const pairs = [
      { id: "BTC-USD", f: "BTC", t: "USD" }, { id: "ETH-USD", f: "ETH", t: "USD" },
      { id: "SOL-USD", f: "SOL", t: "USD" }, { id: "USDC-USD", f: "USDC", t: "USD" },
    ];
    const results = await Promise.allSettled(
      pairs.map((p) => fetch("https://api.coinbase.com/v2/prices/" + p.id + "/spot").then((r) => r.json()).then((d) => ({ p, d }))),
    );
    const out: Record<string, RateInfo> = {};
    for (const r of results) {
      if (r.status === "fulfilled") {
        const val = r.value as { p: { f: string; t: string }; d: { data?: { amount?: string } } };
        if (val.d?.data?.amount) {
          const mid = parseFloat(val.d.data.amount), p = val.p;
          out[`${p.f}_${p.t}`] = { exchange: "coinbase", from: p.f, to: p.t, bid: mid * 0.9995, ask: mid * 1.0005, mid, spread: 0.10, fee: 0.60, settlementMin: 1, settlementMax: 5, available: true };
        }
      }
    }
    log("ok", `Coinbase: ${Object.keys(out).length} pairs loaded`);
    return out;
  } catch (e) { log("error", `Coinbase FAILED: ${e instanceof Error ? e.message : "unknown"}`); return {}; }
}

// ─── CONNECTOR: Raydium (Solana DEX, static) ────────────
function fetchRaydium(): Record<string, RateInfo> {
  log("fetch", "Raydium: adding USDC/USDT Solana DEX rate...");
  return {
    USDC_USDT: { exchange: "raydium", from: "USDC", to: "USDT", mid: 1.0001, bid: 0.9999, ask: 1.0003, spread: 0.04, fee: 0.25, settlementMin: 0.1, settlementMax: 1, available: true },
  };
}

// ─── Baseline FX ─────────────────────────────────────────
const BASELINE_FX: Record<string, number> = {
  USD_CAD: 1.365, CAD_USD: 0.733,
  USD_BRL: 4.97, BRL_USD: 0.201,
  USD_EUR: 0.921, EUR_USD: 1.086,
  CAD_BRL: 3.642, BRL_CAD: 0.2745,
};

// ─── Fetch all rates ─────────────────────────────────────
async function fetchAllRates(): Promise<Record<string, RateInfo>> {
  log("info", "=== Fetching rates from all exchanges ===");
  const results = await Promise.allSettled([fetchKraken(), fetchBinance(), fetchCoinbase()]);
  const all: Record<string, RateInfo> = {};

  for (const r of results) {
    if (r.status === "fulfilled") {
      for (const [k, rate] of Object.entries(r.value)) {
        if (!all[k] || rate.fee < all[k].fee) all[k] = rate;
      }
    }
  }

  // Static connectors
  for (const [k, rate] of Object.entries(fetchRaydium())) {
    if (!all[k] || rate.fee < all[k].fee) all[k] = rate;
  }

  // Baseline FX
  for (const [key, mid] of Object.entries(BASELINE_FX)) {
    const [f, t] = key.split("_");
    if (!all[key]) {
      all[key] = { exchange: "fx_baseline", from: f, to: t, mid, bid: mid * 0.999, ask: mid * 1.001, spread: 0.20, fee: 0.50, settlementMin: 1440, settlementMax: 4320, available: true };
    }
  }

  // Reverse pairs
  for (const [, rate] of Object.entries({ ...all })) {
    const rev = `${rate.to}_${rate.from}`;
    if (!all[rev] && rate.mid) {
      all[rev] = { ...rate, from: rate.to, to: rate.from, mid: 1 / rate.mid, bid: 1 / rate.ask, ask: 1 / rate.bid };
    }
  }

  log("ok", `=== Total: ${Object.keys(all).length} rates ready ===`);
  return all;
}

// ─── Graph builder ───────────────────────────────────────
interface GraphEdge {
  to: string;
  edge: RateInfo;
  costPct: number;
  timeMin: number;
}

function buildGraph(rates: Record<string, RateInfo>): Record<string, GraphEdge[]> {
  const graph: Record<string, GraphEdge[]> = {};
  for (const rate of Object.values(rates)) {
    if (!rate.available || !rate.mid) continue;
    if (!graph[rate.from]) graph[rate.from] = [];
    graph[rate.from].push({
      to: rate.to,
      edge: rate,
      costPct: (rate.fee || 0) + (rate.spread || 0) / 2,
      timeMin: ((rate.settlementMin || 0) + (rate.settlementMax || 5)) / 2,
    });
  }
  return graph;
}

// ─── Cost function ───────────────────────────────────────
function edgeCost(hop: GraphEdge, mode: string): number {
  const feeCost = hop.costPct / 100;
  const timeScore = Math.min(hop.timeMin / 4320, 1);
  if (mode === "cost") return feeCost;
  if (mode === "speed") return timeScore * 0.8 + feeCost * 0.2;
  return feeCost * 0.5 + timeScore * 0.5;
}

// ─── Dijkstra pathfinder ─────────────────────────────────
export interface RouteHop {
  from: string;
  to: string;
  exchange: string;
  rate: number;
  feePct: number;
  spreadPct: number;
  settlementMin: number;
  settlementMax: number;
  amountIn: number;
  amountOut: number;
  feeAmount: number;
}

export interface EnrichedRoute {
  rank: number;
  path: RouteHop[];
  pathStr: string;
  exchanges: string[];
  hops: number;
  fromCurrency: string;
  toCurrency: string;
  amountIn: number;
  amountOut: number;
  totalFeesPct: number;
  totalFeesAmount: number;
  savingsVsTraditional: number;
  totalTimeMin: number;
  totalTimeStr: string;
  mode: string;
  isBest: boolean;
}

export interface OptimizeResult {
  routes: EnrichedRoute[];
  fetchedAt: string;
  latencyMs: number;
  ratesCount: number;
  graphNodes: number;
  logs: LogEntry[];
}

function findRoutes(graph: Record<string, GraphEdge[]>, from: string, to: string, mode: string, maxHops: number, topK: number) {
  const queue: Array<{ cost: number; path: Array<{ from: string; to: string; exchange: string; rate: number; feePct: number; spreadPct: number; settlementMin: number; settlementMax: number }>; currency: string; frac: number; visited: Set<string> }> = [];
  queue.push({ cost: 0, path: [], currency: from, frac: 1.0, visited: new Set([from]) });
  const routes: Array<{ path: typeof queue[0]["path"]; totalCostPct: number; frac: number; hops: number }> = [];
  const bestCosts = new Map<string, number>();

  while (queue.length > 0 && routes.length < topK * 3) {
    queue.sort((a, b) => a.cost - b.cost);
    const cur = queue.shift()!;

    if (cur.path.length > maxHops) continue;

    if (cur.currency === to && cur.path.length > 0) {
      routes.push({ path: cur.path, totalCostPct: cur.cost * 100, frac: cur.frac, hops: cur.path.length });
      if (routes.length >= topK) break;
      continue;
    }

    const vk = cur.currency + "_" + cur.path.length;
    if (bestCosts.has(vk) && bestCosts.get(vk)! < cur.cost - 0.0001) continue;
    bestCosts.set(vk, cur.cost);

    for (const hop of graph[cur.currency] || []) {
      if (hop.to !== to && cur.visited.has(hop.to)) continue;
      const hc = edgeCost(hop, mode);
      const newVisited = new Set(cur.visited);
      newVisited.add(hop.to);
      queue.push({
        cost: cur.cost + hc,
        path: [...cur.path, {
          from: cur.currency, to: hop.to, exchange: hop.edge.exchange,
          rate: hop.edge.mid, feePct: hop.edge.fee, spreadPct: hop.edge.spread,
          settlementMin: hop.edge.settlementMin, settlementMax: hop.edge.settlementMax,
        }],
        currency: hop.to,
        frac: cur.frac * (1 - hc),
        visited: newVisited,
      });
    }
  }

  return routes.slice(0, topK);
}

function fmtTime(m: number): string {
  if (m < 1) return "< 1 min";
  if (m < 60) return Math.round(m) + " min";
  if (m < 1440) return Math.round(m / 60) + " hr";
  return Math.round(m / 1440) + " day" + (Math.round(m / 1440) > 1 ? "s" : "");
}

// ─── Main optimizer ──────────────────────────────────────
export async function optimize({
  fromCurrency,
  toCurrency,
  amount,
  mode = "balanced",
  maxHops = 4,
  topK = 5,
}: {
  fromCurrency: string;
  toCurrency: string;
  amount: number;
  mode?: string;
  maxHops?: number;
  topK?: number;
}): Promise<OptimizeResult> {
  _logs = [];
  log("info", `=== OPTIROUTE: ${amount} ${fromCurrency} -> ${toCurrency} ===`);

  const t0 = Date.now();
  const rates = await fetchAllRates();
  const graph = buildGraph(rates);
  const rawRoutes = findRoutes(graph, fromCurrency, toCurrency, mode, maxHops, topK);

  const enriched: EnrichedRoute[] = rawRoutes.map((route, idx) => {
    const totalTimeMin = route.path.reduce((sum, h) => sum + ((h.settlementMin + h.settlementMax) / 2), 0);
    const pathStr = [fromCurrency, ...route.path.map((h) => h.to)].join(" -> ");

    let runningAmount = amount;
    const hopsWithAmounts: RouteHop[] = route.path.map((h) => {
      const feeHit = runningAmount * ((h.feePct + (h.spreadPct || 0) / 2) / 100);
      const amountAfterFee = runningAmount - feeHit;
      const converted = h.rate ? amountAfterFee * h.rate : amountAfterFee;
      const hop: RouteHop = { ...h, amountIn: runningAmount, amountOut: converted, feeAmount: feeHit };
      runningAmount = converted;
      return hop;
    });

    return {
      rank: idx + 1,
      path: hopsWithAmounts,
      pathStr,
      exchanges: [...new Set(route.path.map((h) => h.exchange))],
      hops: route.hops,
      fromCurrency,
      toCurrency,
      amountIn: amount,
      amountOut: amount * route.frac,
      totalFeesPct: route.totalCostPct,
      totalFeesAmount: amount * (route.totalCostPct / 100),
      savingsVsTraditional: amount * 0.05 - amount * (route.totalCostPct / 100),
      totalTimeMin,
      totalTimeStr: fmtTime(totalTimeMin),
      mode,
      isBest: idx === 0,
    };
  });

  const latency = Date.now() - t0;
  log("ok", `=== Done in ${latency}ms: ${enriched.length} routes returned ===`);

  return { routes: enriched, fetchedAt: new Date().toISOString(), latencyMs: latency, ratesCount: Object.keys(rates).length, graphNodes: Object.keys(graph).length, logs: [..._logs] };
}
