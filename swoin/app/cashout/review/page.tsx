"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useCallback, useEffect, useState } from "react";
import AppShell from "../../components/AppShell";
import { useToast } from "../../components/ToastProvider";

const typeIcons: Record<string, string> = {
  bank: "account_balance",
  card: "credit_card",
  wallet: "payments",
};

const EX_COLORS: Record<string, string> = {
  kraken: "text-purple-500",
  binance: "text-yellow-500",
  coinbase: "text-blue-500",
  raydium: "text-purple-400",
  fx_baseline: "text-on-surface-variant",
};
const EX_NAMES: Record<string, string> = {
  kraken: "Kraken",
  binance: "Binance",
  coinbase: "Coinbase",
  raydium: "Raydium",
  fx_baseline: "FX Baseline",
};

type RouteHop = {
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
};

type OptiRoute = {
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
  isBest: boolean;
};

type RoutesResult = {
  routes: OptiRoute[];
  latencyMs: number;
  ratesCount: number;
  graphNodes: number;
};

function CashoutReviewContent() {
  const toast = useToast();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [submitting, setSubmitting] = useState(false);
  const [selectedMethod, setSelectedMethod] = useState<"crossmint" | "optiroute">("crossmint");
  const [selectedRouteIdx, setSelectedRouteIdx] = useState(0);
  const [expandedRoute, setExpandedRoute] = useState<number | null>(0);
  const [routesResult, setRoutesResult] = useState<RoutesResult | null>(null);
  const [loadingRoutes, setLoadingRoutes] = useState(false);
  const [routeMode, setRouteMode] = useState("balanced");

  const amount = searchParams.get("amount") || "0.00";
  const methodId = searchParams.get("methodId") || "";
  const methodLabel = searchParams.get("methodLabel") || "";
  const methodType = searchParams.get("methodType") || "bank";
  const parsedAmount = parseFloat(amount);
  const baseAmount = Number.isFinite(parsedAmount) && parsedAmount > 0 ? parsedAmount : 0;
  const formatted = baseAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  // Crossmint: 1:1 rate, 1% fee
  const crossmintFee = baseAmount * 0.01;
  const crossmintReceive = baseAmount - crossmintFee;

  const fetchRoutes = useCallback(async (mode: string) => {
    setLoadingRoutes(true);
    try {
      const res = await fetch("/api/cashout/routes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: baseAmount, toCurrency: "USD", mode }),
      });
      if (res.ok) {
        const data = (await res.json()) as RoutesResult;
        setRoutesResult(data);
        setSelectedRouteIdx(0);
        setExpandedRoute(0);
      }
    } catch {
      // Silently fail — user can still use Crossmint
    } finally {
      setLoadingRoutes(false);
    }
  }, [baseAmount]);

  useEffect(() => {
    if (baseAmount > 0) fetchRoutes(routeMode);
  }, [baseAmount, routeMode, fetchRoutes]);

  const confirmCashout = async () => {
    setSubmitting(true);
    try {
      const res = await fetch("/api/cashout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ methodId: Number(methodId), amount: baseAmount }),
      });
      if (!res.ok) {
        const data = (await res.json().catch(() => ({}))) as { error?: string };
        toast(data.error ?? "Withdrawal failed");
        setSubmitting(false);
        return;
      }

      const selectedRoute = selectedMethod === "optiroute" && routesResult?.routes[selectedRouteIdx];
      const receiveAmount = selectedRoute ? selectedRoute.amountOut.toFixed(2) : crossmintReceive.toFixed(2);

      const successParams = new URLSearchParams({
        amount: formatted + " USDM",
        receive: receiveAmount + " USD",
        methodLabel,
        methodType,
        via: selectedMethod === "optiroute" && selectedRoute ? selectedRoute.pathStr : "Crossmint Direct",
      });
      router.push(`/cashout/success?${successParams.toString()}`);
    } catch {
      toast("Network error, please try again");
      setSubmitting(false);
    }
  };

  const bestRoute = routesResult?.routes[0];

  return (
    <AppShell>
      <div className="max-w-6xl mx-auto px-6 lg:px-12 py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6 lg:hidden animate-fade-in-up">
          <Link href="/cashout" className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-surface-container-highest transition-all active:scale-90">
            <span className="material-symbols-outlined text-primary">arrow_back</span>
          </Link>
          <h1 className="text-3xl font-bold font-headline tracking-tight text-on-background">Review</h1>
        </div>
        <div className="hidden lg:block mb-10 text-center animate-fade-in-up">
          <h2 className="text-4xl font-extrabold font-headline tracking-tighter text-on-background mb-2">Choose Your Cash Out Method</h2>
          <p className="text-on-surface-variant font-medium">Compare routes to get the best rate for your withdrawal.</p>
        </div>

        {/* Amount + Destination summary */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8 animate-fade-in-up delay-100">
          <div className="flex-1 bg-surface-container-lowest rounded-2xl p-6 border border-outline-variant/10">
            <p className="text-xs font-bold uppercase tracking-widest text-on-surface-variant/60 mb-1">Withdrawing</p>
            <p className="text-3xl font-headline font-bold text-on-background">{formatted} <span className="text-lg text-secondary">USDM</span></p>
          </div>
          <div className="flex-1 bg-surface-container-low rounded-2xl p-6 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
              <span className="material-symbols-outlined text-primary text-2xl">{typeIcons[methodType] ?? "payments"}</span>
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-on-surface-variant/60">To</p>
              <p className="font-headline font-bold text-on-background">{methodLabel}</p>
              <p className="text-xs text-on-surface-variant capitalize">{methodType}</p>
            </div>
          </div>
        </div>

        {/* Two options */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Option 1: Crossmint Direct */}
          <button
            onClick={() => setSelectedMethod("crossmint")}
            className={`text-left rounded-[2rem] p-6 lg:p-8 transition-all border-2 ${
              selectedMethod === "crossmint"
                ? "border-primary bg-primary/5 shadow-lg shadow-primary/10"
                : "border-outline-variant/20 bg-surface-container-lowest hover:border-outline-variant/40"
            }`}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                  <span className="material-symbols-outlined text-primary">bolt</span>
                </div>
                <div>
                  <h3 className="font-headline font-bold text-on-background">Crossmint Direct</h3>
                  <p className="text-xs text-on-surface-variant">Simple, instant off-ramp</p>
                </div>
              </div>
              <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                selectedMethod === "crossmint" ? "border-primary bg-primary" : "border-outline-variant"
              }`}>
                {selectedMethod === "crossmint" && (
                  <span className="material-symbols-outlined text-white text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>check</span>
                )}
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-on-surface-variant">Exchange Rate</span>
                <span className="font-bold text-on-background">1 USDM = 1.00 USD</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-on-surface-variant">Processing Fee</span>
                <span className="font-bold text-error">-{crossmintFee.toFixed(2)} USD (1%)</span>
              </div>
              <div className="h-px bg-outline-variant/20" />
              <div className="flex justify-between text-sm">
                <span className="text-on-surface-variant">Settlement</span>
                <span className="font-bold text-on-background">Instant</span>
              </div>
              <div className="flex justify-between items-end">
                <span className="text-on-surface-variant text-sm">You Receive</span>
                <span className="text-2xl font-headline font-bold text-primary">${crossmintReceive.toFixed(2)}</span>
              </div>
            </div>
          </button>

          {/* Option 2: OptiRoute */}
          <button
            onClick={() => { if (routesResult?.routes.length) setSelectedMethod("optiroute"); }}
            className={`text-left rounded-[2rem] p-6 lg:p-8 transition-all border-2 ${
              selectedMethod === "optiroute"
                ? "border-tertiary bg-tertiary/5 shadow-lg shadow-tertiary/10"
                : "border-outline-variant/20 bg-surface-container-lowest hover:border-outline-variant/40"
            }`}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-tertiary/10 flex items-center justify-center">
                  <span className="material-symbols-outlined text-tertiary">route</span>
                </div>
                <div>
                  <h3 className="font-headline font-bold text-on-background">OptiRoute Algorithm</h3>
                  <p className="text-xs text-on-surface-variant">Multi-hop exchange routing</p>
                </div>
              </div>
              <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                selectedMethod === "optiroute" ? "border-tertiary bg-tertiary" : "border-outline-variant"
              }`}>
                {selectedMethod === "optiroute" && (
                  <span className="material-symbols-outlined text-white text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>check</span>
                )}
              </div>
            </div>

            {loadingRoutes ? (
              <div className="flex items-center justify-center gap-2 py-8">
                <span className="material-symbols-outlined text-tertiary animate-spin">progress_activity</span>
                <span className="text-sm text-on-surface-variant">Polling exchanges & building graph...</span>
              </div>
            ) : bestRoute ? (
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-on-surface-variant">Best Route</span>
                  <span className="font-bold text-on-background font-mono text-xs">{bestRoute.pathStr}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-on-surface-variant">Total Fees</span>
                  <span className="font-bold text-error">-{bestRoute.totalFeesPct.toFixed(2)}%</span>
                </div>
                <div className="h-px bg-outline-variant/20" />
                <div className="flex justify-between text-sm">
                  <span className="text-on-surface-variant">Settlement</span>
                  <span className="font-bold text-on-background">~{bestRoute.totalTimeStr}</span>
                </div>
                <div className="flex justify-between items-end">
                  <span className="text-on-surface-variant text-sm">You Receive</span>
                  <span className="text-2xl font-headline font-bold text-tertiary">${bestRoute.amountOut.toFixed(2)}</span>
                </div>
                {bestRoute.savingsVsTraditional > 0 && (
                  <div className="inline-block bg-tertiary/10 text-tertiary text-xs font-bold px-3 py-1 rounded-full">
                    Save ${bestRoute.savingsVsTraditional.toFixed(2)} vs wire transfer
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-sm text-on-surface-variant">No routes found for this pair</p>
              </div>
            )}
          </button>
        </div>

        {/* OptiRoute details — shown when selected */}
        {selectedMethod === "optiroute" && routesResult && routesResult.routes.length > 0 && (
          <div className="mb-8 animate-fade-in-up">
            {/* Mode selector */}
            <div className="flex items-center gap-3 mb-4">
              <span className="text-xs font-bold uppercase tracking-widest text-on-surface-variant">Optimize for:</span>
              {[
                { id: "cost", label: "Lowest Cost", icon: "savings" },
                { id: "balanced", label: "Balanced", icon: "balance" },
                { id: "speed", label: "Fastest", icon: "speed" },
              ].map((m) => (
                <button
                  key={m.id}
                  onClick={() => setRouteMode(m.id)}
                  className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-bold transition-all active:scale-95 ${
                    routeMode === m.id
                      ? "bg-tertiary text-white"
                      : "bg-surface-container-high text-on-surface-variant hover:bg-surface-container-highest"
                  }`}
                >
                  <span className="material-symbols-outlined text-base">{m.icon}</span>
                  {m.label}
                </button>
              ))}
            </div>

            {/* Stats bar */}
            <div className="grid grid-cols-4 gap-3 mb-4">
              <div className="bg-surface-container-low rounded-xl p-3 text-center">
                <p className="text-lg font-bold text-tertiary">{routesResult.routes.length}</p>
                <p className="text-[10px] text-on-surface-variant uppercase tracking-widest">Routes</p>
              </div>
              <div className="bg-surface-container-low rounded-xl p-3 text-center">
                <p className="text-lg font-bold text-primary">{routesResult.ratesCount}</p>
                <p className="text-[10px] text-on-surface-variant uppercase tracking-widest">Rates</p>
              </div>
              <div className="bg-surface-container-low rounded-xl p-3 text-center">
                <p className="text-lg font-bold text-secondary">{routesResult.graphNodes}</p>
                <p className="text-[10px] text-on-surface-variant uppercase tracking-widest">Nodes</p>
              </div>
              <div className="bg-surface-container-low rounded-xl p-3 text-center">
                <p className="text-lg font-bold text-on-background">{routesResult.latencyMs}ms</p>
                <p className="text-[10px] text-on-surface-variant uppercase tracking-widest">Latency</p>
              </div>
            </div>

            {/* Route cards */}
            <div className="space-y-3">
              {routesResult.routes.map((route, idx) => (
                <div
                  key={route.rank}
                  onClick={() => { setSelectedRouteIdx(idx); setExpandedRoute(expandedRoute === idx ? null : idx); }}
                  className={`rounded-2xl border-2 transition-all cursor-pointer overflow-hidden ${
                    selectedRouteIdx === idx
                      ? "border-tertiary bg-tertiary/5"
                      : "border-outline-variant/20 bg-surface-container-lowest hover:border-outline-variant/40"
                  }`}
                >
                  {/* Route header */}
                  <div className="p-5">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        {route.isBest && (
                          <span className="bg-tertiary text-white text-[10px] font-bold px-2 py-0.5 rounded-full uppercase">Best</span>
                        )}
                        <span className="text-sm text-on-surface-variant">Route #{route.rank}</span>
                        <span className="text-xs text-outline">{route.hops} hop{route.hops > 1 ? "s" : ""}</span>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className={`text-lg font-bold font-headline ${route.isBest ? "text-tertiary" : "text-on-background"}`}>
                          ${route.amountOut.toFixed(2)}
                        </span>
                        <span className="material-symbols-outlined text-outline text-sm">
                          {expandedRoute === idx ? "expand_less" : "expand_more"}
                        </span>
                      </div>
                    </div>

                    {/* Visual pipeline */}
                    <div className="flex items-center gap-1 overflow-x-auto pb-1">
                      <div className="flex-shrink-0 bg-surface-container-high rounded-lg px-3 py-1.5 text-center">
                        <p className="text-[10px] text-on-surface-variant">Send</p>
                        <p className="text-xs font-bold text-on-background">{route.amountIn} USDM</p>
                      </div>
                      {route.path.map((hop, i) => (
                        <div key={i} className="flex items-center flex-shrink-0">
                          <div className="flex flex-col items-center mx-1">
                            <span className={`text-[10px] font-bold ${EX_COLORS[hop.exchange] || "text-on-surface-variant"}`}>
                              {EX_NAMES[hop.exchange] || hop.exchange}
                            </span>
                            <span className="material-symbols-outlined text-outline text-xs">arrow_forward</span>
                            <span className="text-[10px] text-error">-{hop.feePct.toFixed(1)}%</span>
                          </div>
                          <div className={`bg-surface-container-high rounded-lg px-3 py-1.5 text-center ${
                            i === route.path.length - 1 ? "ring-1 ring-tertiary" : ""
                          }`}>
                            <p className="text-[10px] text-on-surface-variant">{i === route.path.length - 1 ? "Receive" : `Step ${i + 1}`}</p>
                            <p className={`text-xs font-bold ${i === route.path.length - 1 ? "text-tertiary" : "text-on-background"}`}>
                              {hop.amountOut.toFixed(2)} {hop.to}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Bottom stats */}
                    <div className="flex items-center gap-3 mt-3 text-xs">
                      <span className="text-error font-medium">-{route.totalFeesPct.toFixed(2)}% fees</span>
                      <span className="text-outline">|</span>
                      <span className="text-on-surface-variant">~{route.totalTimeStr}</span>
                      {route.savingsVsTraditional > 0 && (
                        <>
                          <span className="text-outline">|</span>
                          <span className="text-tertiary font-medium">Save ${route.savingsVsTraditional.toFixed(2)} vs wire</span>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Expanded hop details */}
                  {expandedRoute === idx && (
                    <div className="border-t border-outline-variant/20 p-5 bg-surface-container-low/50 space-y-2">
                      <p className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant mb-2">Hop-by-Hop Breakdown</p>
                      {route.path.map((hop, i) => (
                        <div key={i} className="bg-surface-container-lowest rounded-xl p-3 flex items-center gap-4">
                          <div className="w-14 flex-shrink-0">
                            <p className="text-[10px] text-on-surface-variant">Hop {i + 1}</p>
                            <p className={`text-xs font-bold ${EX_COLORS[hop.exchange] || "text-on-surface-variant"}`}>
                              {EX_NAMES[hop.exchange] || hop.exchange}
                            </p>
                          </div>
                          <div className="flex-1 grid grid-cols-5 gap-2 text-xs">
                            <div>
                              <p className="text-[10px] text-on-surface-variant">Pair</p>
                              <p className="font-mono text-on-background">{hop.from}/{hop.to}</p>
                            </div>
                            <div>
                              <p className="text-[10px] text-on-surface-variant">Rate</p>
                              <p className="font-mono text-on-background">{hop.rate?.toFixed(4) ?? "N/A"}</p>
                            </div>
                            <div>
                              <p className="text-[10px] text-on-surface-variant">Fee</p>
                              <p className="text-error">{hop.feePct.toFixed(2)}%</p>
                            </div>
                            <div>
                              <p className="text-[10px] text-on-surface-variant">In</p>
                              <p className="text-on-background">{hop.amountIn.toFixed(2)} {hop.from}</p>
                            </div>
                            <div>
                              <p className="text-[10px] text-on-surface-variant">Out</p>
                              <p className="text-tertiary">{hop.amountOut.toFixed(2)} {hop.to}</p>
                            </div>
                          </div>
                          <div className="text-[10px] text-on-surface-variant text-right w-16">
                            {hop.settlementMin}-{hop.settlementMax} min
                          </div>
                        </div>
                      ))}

                      <div className="grid grid-cols-3 gap-2 pt-2">
                        <div className="bg-surface-container-lowest rounded-xl p-3">
                          <p className="text-[10px] text-on-surface-variant">Total fees</p>
                          <p className="text-sm font-bold text-error">-{route.totalFeesPct.toFixed(3)}%</p>
                          <p className="text-[10px] text-on-surface-variant">-${route.totalFeesAmount.toFixed(2)}</p>
                        </div>
                        <div className="bg-surface-container-lowest rounded-xl p-3">
                          <p className="text-[10px] text-on-surface-variant">You receive</p>
                          <p className="text-sm font-bold text-tertiary">${route.amountOut.toFixed(2)}</p>
                        </div>
                        <div className="bg-surface-container-lowest rounded-xl p-3">
                          <p className="text-[10px] text-on-surface-variant">Settlement</p>
                          <p className="text-sm font-bold text-on-background">~{route.totalTimeStr}</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Confirm button */}
        <div className="max-w-xl mx-auto space-y-4 animate-fade-in-up delay-300">
          <button
            onClick={confirmCashout}
            disabled={submitting}
            className="block w-full primary-gradient py-6 rounded-2xl text-white font-headline font-bold text-xl tracking-tight shadow-xl shadow-primary/30 transition-all hover:scale-[1.02] active:scale-[0.98] text-center btn-press disabled:opacity-60"
          >
            {submitting
              ? "Processing..."
              : selectedMethod === "crossmint"
                ? `Withdraw $${crossmintReceive.toFixed(2)} via Crossmint`
                : `Withdraw $${routesResult?.routes[selectedRouteIdx]?.amountOut.toFixed(2) ?? "0.00"} via OptiRoute`
            }
          </button>
          <p className="text-center text-[11px] text-on-surface-variant font-medium max-w-[80%] mx-auto leading-relaxed">
            {selectedMethod === "crossmint"
              ? "Direct 1:1 USDM to USD conversion via Crossmint. Instant settlement."
              : "Your USDM will be routed through multiple exchanges for the best rate. Settlement times vary by route."
            }
          </p>
          <Link href="/cashout" className="block w-full py-4 text-secondary font-headline font-bold hover:text-on-background transition-colors text-center active:scale-95">
            Cancel &amp; Return
          </Link>
        </div>
      </div>
    </AppShell>
  );
}

export default function CashoutReviewPage() {
  return (
    <Suspense
      fallback={
        <AppShell>
          <div className="max-w-6xl mx-auto px-6 lg:px-12 py-8">Loading...</div>
        </AppShell>
      }
    >
      <CashoutReviewContent />
    </Suspense>
  );
}
