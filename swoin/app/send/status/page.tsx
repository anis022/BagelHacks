"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { CHAINS } from "../../data/chains";

const STAGES = [
  { label: "Initiating", icon: "🔄", desc: "Preparing your transaction on the source chain..." },
  { label: "Bridge Processing", icon: "🌉", desc: "Bridge is locking and routing your funds..." },
  { label: "Confirming", icon: "✅", desc: "Waiting for destination chain confirmation..." },
  { label: "Complete", icon: "🎉", desc: "Funds delivered to recipient!" },
];

function StatusContent() {
  const params = useSearchParams();
  const [stageIndex, setStageIndex] = useState(0);
  const [done, setDone] = useState(false);

  const fromChainId = params.get("fromChain") ?? "";
  const toChainId = params.get("toChain") ?? "";
  const token = params.get("token") ?? "";
  const amount = params.get("amount") ?? "";
  const recipient = params.get("recipient") ?? "";
  const bridgeName = params.get("bridgeName") ?? "";
  const fee = params.get("fee") ?? "0";
  const receive = params.get("receive") ?? amount;

  const fromChain = CHAINS.find((c) => c.id === fromChainId);
  const toChain = CHAINS.find((c) => c.id === toChainId);

  useEffect(() => {
    if (stageIndex >= STAGES.length - 1) {
      const t = setTimeout(() => setDone(true), 0);
      return () => clearTimeout(t);
    }
    const delay = stageIndex === 0 ? 1500 : stageIndex === 1 ? 2500 : 2000;
    const t = setTimeout(() => setStageIndex((s) => s + 1), delay);
    return () => clearTimeout(t);
  }, [stageIndex]);

  return (
    <main style={{ backgroundColor: "#0a0a0f" }} className="min-h-screen text-white px-4 py-12">
      <div className="max-w-lg mx-auto">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-extrabold mb-2">
            {done ? "Transfer Complete! 🎉" : "Transfer in Progress..."}
          </h1>
          <p className="text-slate-400 text-sm">
            {done ? "Your stablecoins have been delivered." : "Sit tight — this won't take long."}
          </p>
        </div>

        {/* Transaction Details */}
        <div
          className="rounded-2xl border border-white/10 p-5 mb-6 space-y-3"
          style={{ backgroundColor: "rgba(255,255,255,0.03)" }}
        >
          <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wide mb-3">
            Transaction Details
          </h2>
          <DetailRow label="From" value={fromChain ? `${fromChain.logo} ${fromChain.name}` : fromChainId} />
          <DetailRow label="To" value={toChain ? `${toChain.logo} ${toChain.name}` : toChainId} />
          <DetailRow label="Token" value={token} />
          <DetailRow label="Amount" value={`$${amount} ${token}`} />
          <DetailRow label="Fee" value={`${fee} ${token}`} />
          <DetailRow label="You Receive" value={`${receive} ${token}`} highlight />
          <DetailRow label="Bridge" value={bridgeName} />
          <div className="flex justify-between items-start gap-4 py-1">
            <span className="text-slate-400 text-sm flex-shrink-0">Recipient</span>
            <span className="text-white text-sm font-mono text-right break-all">{recipient}</span>
          </div>
        </div>

        {/* Progress Stages */}
        <div
          className="rounded-2xl border border-white/10 p-5 mb-6"
          style={{ backgroundColor: "rgba(255,255,255,0.03)" }}
        >
          <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wide mb-4">
            Progress
          </h2>
          <div className="space-y-3">
            {STAGES.map((stage, idx) => {
              const isActive = idx === stageIndex;
              const isComplete = idx < stageIndex || done;

              return (
                <div key={stage.label} className="flex items-center gap-4">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center text-lg flex-shrink-0 transition-all duration-500 ${
                      isComplete
                        ? "bg-emerald-500/20 border border-emerald-500/40"
                        : isActive
                        ? "border border-purple-500/60 animate-pulse"
                        : "border border-white/10"
                    }`}
                    style={
                      isActive && !isComplete
                        ? { backgroundColor: "rgba(124,58,237,0.2)" }
                        : {}
                    }
                  >
                    {isComplete ? "✅" : isActive ? stage.icon : "⏳"}
                  </div>
                  <div className="flex-1">
                    <p
                      className={`text-sm font-semibold ${
                        isComplete
                          ? "text-emerald-400"
                          : isActive
                          ? "text-purple-300"
                          : "text-slate-600"
                      }`}
                    >
                      {stage.label}
                    </p>
                    {isActive && (
                      <p className="text-xs text-slate-500 mt-0.5">{stage.desc}</p>
                    )}
                  </div>
                  {isActive && !isComplete && (
                    <div className="flex gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-bounce" style={{ animationDelay: "0ms" }} />
                      <span className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-bounce" style={{ animationDelay: "150ms" }} />
                      <span className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-bounce" style={{ animationDelay: "300ms" }} />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Success Banner */}
        {done && (
          <div
            className="rounded-2xl border border-emerald-500/30 p-6 mb-6 text-center"
            style={{ backgroundColor: "rgba(16,185,129,0.08)" }}
          >
            <div className="text-5xl mb-3">🎉</div>
            <p className="text-emerald-400 font-bold text-lg mb-1">Transfer Successful!</p>
            <p className="text-slate-400 text-sm">
              {receive} {token} has been delivered to the recipient on {toChain?.name ?? toChainId}.
            </p>
          </div>
        )}

        <Link
          href="/send"
          className="block w-full text-center py-4 rounded-xl font-bold text-white text-base transition-all hover:scale-[1.02]"
          style={{ background: "linear-gradient(135deg, #7c3aed, #2563eb)" }}
        >
          Send Another →
        </Link>
      </div>
    </main>
  );
}

function DetailRow({
  label,
  value,
  highlight,
}: {
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <div className="flex justify-between items-center py-1">
      <span className="text-slate-400 text-sm">{label}</span>
      <span className={`text-sm font-semibold ${highlight ? "text-emerald-400 text-base" : "text-white"}`}>
        {value}
      </span>
    </div>
  );
}

export default function StatusPage() {
  return (
    <Suspense fallback={
      <main style={{ backgroundColor: "#0a0a0f" }} className="min-h-screen text-white flex items-center justify-center">
        <p className="text-slate-400">Loading...</p>
      </main>
    }>
      <StatusContent />
    </Suspense>
  );
}
