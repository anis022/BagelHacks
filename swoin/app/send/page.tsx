"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { CHAINS } from "../data/chains";
import { STABLECOINS } from "../data/stablecoins";
import { findBridges } from "../utils/bridgeUtils";
import { calculateFee, calculateReceiveAmount } from "../utils/bridgeUtils";
import type { Bridge } from "../data/bridges";

export default function SendPage() {
  const router = useRouter();

  const [fromChain, setFromChain] = useState("ethereum");
  const [toChain, setToChain] = useState("polygon");
  const [token, setToken] = useState("USDC");
  const [amount, setAmount] = useState("");
  const [recipient, setRecipient] = useState("");
  const [selectedBridgeId, setSelectedBridgeId] = useState<string>("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  const availableTokens = useMemo(() => {
    return STABLECOINS.filter(
      (s) => s.chains.includes(fromChain) && s.chains.includes(toChain)
    );
  }, [fromChain, toChain]);

  const bridges = useMemo(() => {
    return findBridges(fromChain, toChain, token);
  }, [fromChain, toChain, token]);

  const selectedBridge: Bridge | undefined = useMemo(() => {
    if (selectedBridgeId) return bridges.find((b) => b.id === selectedBridgeId);
    return bridges[0];
  }, [bridges, selectedBridgeId]);

  const numAmount = parseFloat(amount) || 0;
  const fee = selectedBridge ? calculateFee(numAmount, selectedBridge.feePercent) : 0;
  const receiveAmount = calculateReceiveAmount(numAmount, fee);

  // When token changes due to chain swap, reset to first available
  const handleFromChain = (val: string) => {
    setFromChain(val);
    setSelectedBridgeId("");
  };
  const handleToChain = (val: string) => {
    setToChain(val);
    setSelectedBridgeId("");
  };
  const handleToken = (val: string) => {
    setToken(val);
    setSelectedBridgeId("");
  };

  function validate() {
    const e: Record<string, string> = {};
    if (!fromChain) e.fromChain = "Required";
    if (!toChain) e.toChain = "Required";
    if (fromChain === toChain) e.toChain = "Must differ from source chain";
    if (!token) e.token = "Required";
    if (!amount || numAmount <= 0) e.amount = "Enter a valid amount";
    if (!recipient.trim()) e.recipient = "Recipient address is required";
    if (!selectedBridge) e.bridge = "No bridge available for this route";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  function handleSend() {
    if (!validate()) return;
    const bridge = selectedBridge!;
    const params = new URLSearchParams({
      fromChain,
      toChain,
      token,
      amount,
      recipient: recipient.trim(),
      bridge: bridge.id,
      bridgeName: bridge.name,
      fee: fee.toString(),
      receive: receiveAmount.toString(),
    });
    router.push(`/send/status?${params.toString()}`);
  }

  const securityColor: Record<string, string> = {
    high: "text-emerald-400 bg-emerald-400/10 border-emerald-400/30",
    medium: "text-yellow-400 bg-yellow-400/10 border-yellow-400/30",
    low: "text-red-400 bg-red-400/10 border-red-400/30",
  };

  return (
    <main style={{ backgroundColor: "#0a0a0f" }} className="min-h-screen text-white px-4 py-12">
      <div className="max-w-xl mx-auto">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-extrabold mb-2">Send Stablecoins</h1>
          <p className="text-slate-400 text-sm">Cross-border in minutes, not days.</p>
        </div>

        <div
          className="rounded-2xl border border-white/10 p-6 space-y-6"
          style={{ backgroundColor: "rgba(255,255,255,0.03)" }}
        >
          {/* From / To Chains */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-2">From Chain</label>
              <select
                value={fromChain}
                onChange={(e) => handleFromChain(e.target.value)}
                className="w-full rounded-xl border border-white/10 text-white px-3 py-2.5 text-sm focus:outline-none focus:border-purple-500 transition-colors"
                style={{ backgroundColor: "rgba(255,255,255,0.06)" }}
              >
                {CHAINS.map((c) => (
                  <option key={c.id} value={c.id} style={{ backgroundColor: "#1a1a2e" }}>
                    {c.logo} {c.name}
                  </option>
                ))}
              </select>
              {errors.fromChain && <p className="text-red-400 text-xs mt-1">{errors.fromChain}</p>}
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-2">To Chain</label>
              <select
                value={toChain}
                onChange={(e) => handleToChain(e.target.value)}
                className="w-full rounded-xl border border-white/10 text-white px-3 py-2.5 text-sm focus:outline-none focus:border-purple-500 transition-colors"
                style={{ backgroundColor: "rgba(255,255,255,0.06)" }}
              >
                {CHAINS.map((c) => (
                  <option key={c.id} value={c.id} style={{ backgroundColor: "#1a1a2e" }}>
                    {c.logo} {c.name}
                  </option>
                ))}
              </select>
              {errors.toChain && <p className="text-red-400 text-xs mt-1">{errors.toChain}</p>}
            </div>
          </div>

          {/* Stablecoin */}
          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-2">Stablecoin</label>
            {availableTokens.length === 0 ? (
              <p className="text-yellow-400 text-sm p-3 rounded-xl border border-yellow-400/20" style={{ backgroundColor: "rgba(250,204,21,0.05)" }}>
                No shared stablecoins on these two chains. Try different networks.
              </p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {availableTokens.map((s) => (
                  <button
                    key={s.symbol}
                    onClick={() => handleToken(s.symbol)}
                    className={`flex items-center gap-1.5 px-4 py-2 rounded-lg border text-sm font-medium transition-all ${
                      token === s.symbol
                        ? "border-purple-500 text-white"
                        : "border-white/10 text-slate-300 hover:border-white/30"
                    }`}
                    style={
                      token === s.symbol
                        ? { backgroundColor: "rgba(124,58,237,0.2)" }
                        : { backgroundColor: "rgba(255,255,255,0.04)" }
                    }
                  >
                    <span>{s.logo}</span>
                    <span>{s.symbol}</span>
                  </button>
                ))}
              </div>
            )}
            {errors.token && <p className="text-red-400 text-xs mt-1">{errors.token}</p>}
          </div>

          {/* Amount */}
          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-2">Amount</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-semibold">$</span>
              <input
                type="number"
                min="0"
                step="any"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                className="w-full rounded-xl border border-white/10 text-white pl-7 pr-4 py-2.5 text-sm focus:outline-none focus:border-purple-500 transition-colors"
                style={{ backgroundColor: "rgba(255,255,255,0.06)" }}
              />
            </div>
            {numAmount > 0 && (
              <p className="text-slate-500 text-xs mt-1">
                ≈ ${numAmount.toLocaleString(undefined, { maximumFractionDigits: 2 })} USD
              </p>
            )}
            {errors.amount && <p className="text-red-400 text-xs mt-1">{errors.amount}</p>}
          </div>

          {/* Recipient */}
          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-2">Recipient Address</label>
            <input
              type="text"
              value={recipient}
              onChange={(e) => setRecipient(e.target.value)}
              placeholder="0x... or wallet address"
              className="w-full rounded-xl border border-white/10 text-white px-3 py-2.5 text-sm focus:outline-none focus:border-purple-500 transition-colors font-mono"
              style={{ backgroundColor: "rgba(255,255,255,0.06)" }}
            />
            {errors.recipient && <p className="text-red-400 text-xs mt-1">{errors.recipient}</p>}
          </div>

          {/* Bridge Picker */}
          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-2">
              Available Bridges
              {bridges.length > 0 && (
                <span className="ml-2 text-purple-400">— cheapest pre-selected</span>
              )}
            </label>
            {bridges.length === 0 ? (
              <p className="text-yellow-400 text-sm p-3 rounded-xl border border-yellow-400/20" style={{ backgroundColor: "rgba(250,204,21,0.05)" }}>
                No bridges support this route. Try a different chain or token combination.
              </p>
            ) : (
              <div className="space-y-2">
                {bridges.map((bridge, idx) => {
                  const isSelected = selectedBridge?.id === bridge.id;
                  return (
                    <button
                      key={bridge.id}
                      onClick={() => setSelectedBridgeId(bridge.id)}
                      className={`w-full flex items-center justify-between p-3 rounded-xl border text-left transition-all ${
                        isSelected
                          ? "border-purple-500"
                          : "border-white/10 hover:border-white/30"
                      }`}
                      style={
                        isSelected
                          ? { backgroundColor: "rgba(124,58,237,0.15)" }
                          : { backgroundColor: "rgba(255,255,255,0.03)" }
                      }
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-xl">{bridge.logo}</span>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-semibold">{bridge.name}</span>
                            {idx === 0 && (
                              <span className="text-xs px-2 py-0.5 rounded-full text-purple-300 border border-purple-500/30"
                                style={{ backgroundColor: "rgba(124,58,237,0.2)" }}>
                                Best
                              </span>
                            )}
                          </div>
                          <span className="text-xs text-slate-400">{bridge.estimatedTime}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 text-right">
                        <span className="text-sm font-semibold text-white">{bridge.feePercent}%</span>
                        <span
                          className={`text-xs px-2 py-0.5 rounded-full border font-medium ${securityColor[bridge.security]}`}
                        >
                          {bridge.security}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
            {errors.bridge && <p className="text-red-400 text-xs mt-1">{errors.bridge}</p>}
          </div>

          {/* You Receive */}
          {numAmount > 0 && selectedBridge && (
            <div
              className="rounded-xl p-4 border border-emerald-500/20"
              style={{ backgroundColor: "rgba(16,185,129,0.05)" }}
            >
              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-400">Fee ({selectedBridge.feePercent}%)</span>
                <span className="text-slate-300">
                  −{fee.toFixed(4)} {token}
                </span>
              </div>
              <div className="flex justify-between items-center mt-2">
                <span className="font-semibold text-white">You receive</span>
                <span className="text-lg font-bold text-emerald-400">
                  {receiveAmount.toFixed(4)} {token}
                </span>
              </div>
            </div>
          )}

          {/* Send Button */}
          <button
            onClick={handleSend}
            disabled={availableTokens.length === 0 || bridges.length === 0}
            className="w-full py-4 rounded-xl font-bold text-white text-base transition-all hover:scale-[1.02] disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100"
            style={{ background: "linear-gradient(135deg, #7c3aed, #2563eb)" }}
          >
            Send {token} →
          </button>
        </div>
      </div>
    </main>
  );
}
