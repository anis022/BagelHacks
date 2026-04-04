"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { useToast } from "../../components/ToastProvider";

const typeIcons: Record<string, string> = {
  bank: "account_balance",
  card: "credit_card",
  wallet: "payments",
};

function CashoutSuccessContent() {
  const toast = useToast();
  const searchParams = useSearchParams();
  const amount = searchParams.get("amount") || "0.00 USDM";
  const methodLabel = searchParams.get("methodLabel") || "Payment Method";
  const methodType = searchParams.get("methodType") || "bank";
  const txId = `SW-${Date.now().toString(36).toUpperCase().slice(-8)}`;

  const copyTxId = async () => {
    try {
      await navigator.clipboard.writeText(txId);
      toast("Transaction ID copied!");
    } catch {
      toast(txId);
    }
  };

  const shareReceipt = async () => {
    const shareData = {
      title: "Swoin Withdrawal Receipt",
      text: `Withdrawal of ${amount} to ${methodLabel} — Transaction ID: ${txId}`,
    };
    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(shareData.text);
        toast("Receipt copied to clipboard!");
      }
    } catch {
      // User cancelled
    }
  };

  return (
    <div className="bg-background min-h-screen flex flex-col items-center justify-center relative overflow-hidden">
      <div className="absolute top-20 right-20 w-96 h-96 bg-primary/5 rounded-full blur-[100px]" />
      <div className="absolute bottom-10 left-10 w-64 h-64 bg-tertiary/5 rounded-full blur-[80px]" />
      <div className="fixed top-[-10%] right-[-5%] w-[400px] h-[400px] bg-primary-fixed opacity-10 rounded-full blur-[100px] pointer-events-none" />
      <div className="fixed bottom-[-5%] left-[-10%] w-[300px] h-[300px] bg-tertiary-fixed-dim opacity-5 rounded-full blur-[80px] pointer-events-none" />

      <div className="max-w-2xl w-full px-8 py-12 flex flex-col items-center text-center">
        {/* Success Icon */}
        <div className="mb-10 relative animate-bounce-in">
          <div className="w-32 h-32 rounded-full bg-tertiary/10 flex items-center justify-center">
            <div className="w-24 h-24 rounded-full bg-tertiary flex items-center justify-center shadow-lg shadow-tertiary/20">
              <span
                className="material-symbols-outlined text-white text-6xl"
                style={{ fontVariationSettings: "'FILL' 1, 'wght' 700" }}
              >
                check_circle
              </span>
            </div>
          </div>
          <div className="absolute -top-4 -right-4 w-12 h-12 rounded-xl border border-white/40 flex items-center justify-center text-tertiary shadow-sm bg-white/70 backdrop-blur-xl animate-scale-in delay-300">
            <span className="material-symbols-outlined text-2xl">verified</span>
          </div>
        </div>

        <h2 className="text-4xl lg:text-5xl font-headline font-extrabold tracking-tight text-on-background mb-4 animate-fade-in-up delay-200">
          Withdrawal Sent!
        </h2>
        <p className="text-on-surface-variant text-lg mb-12 max-w-md mx-auto animate-fade-in-up delay-300">
          Your USDM has been withdrawn and is being transferred to your payment method.
        </p>

        {/* Receipt */}
        <div className="w-full bg-surface-container-low rounded-[2rem] p-8 mb-12 text-left relative overflow-hidden animate-fade-in-up delay-400">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-50" />
          <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
            <div>
              <span className="text-xs font-bold uppercase tracking-widest text-on-surface-variant/60 block mb-2">Amount Withdrawn</span>
              <h3 className="text-4xl font-headline font-bold text-on-background">{amount}</h3>
            </div>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                <span className="material-symbols-outlined text-primary text-2xl">{typeIcons[methodType] ?? "payments"}</span>
              </div>
              <div>
                <span className="text-xs font-bold uppercase tracking-widest text-on-surface-variant/60 block mb-1">Destination</span>
                <p className="font-headline font-bold text-lg">{methodLabel}</p>
                <p className="text-sm text-on-surface-variant capitalize">{methodType}</p>
              </div>
            </div>
          </div>

          <div className="h-px bg-outline-variant/20 my-8" />

          <div className="relative z-10 flex flex-col md:flex-row justify-between gap-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-tertiary-container/30 flex items-center justify-center text-tertiary">
                <span className="material-symbols-outlined">task_alt</span>
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant/60 block">Status</span>
                <p className="text-tertiary font-bold">Processing</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-surface-container-highest flex items-center justify-center text-primary">
                <span className="material-symbols-outlined">fingerprint</span>
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant/60 block">Transaction ID</span>
                <div className="flex items-center gap-2">
                  <p className="text-on-background font-mono text-sm">{txId}</p>
                  <button
                    onClick={copyTxId}
                    className="text-primary hover:bg-primary/10 p-1 rounded-md transition-colors active:scale-90"
                  >
                    <span className="material-symbols-outlined text-lg">content_copy</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row items-center gap-6 w-full max-w-sm animate-fade-in-up delay-500">
          <Link
            href="/dashboard"
            className="w-full primary-gradient text-on-primary font-headline font-bold py-4 rounded-xl shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all text-center btn-press"
          >
            Done
          </Link>
          <button
            onClick={shareReceipt}
            className="w-full text-primary font-headline font-bold py-4 rounded-xl flex items-center justify-center gap-2 hover:bg-surface-container-high transition-colors active:scale-95"
          >
            <span className="material-symbols-outlined text-xl">ios_share</span>
            Share Receipt
          </button>
        </div>

        <p className="mt-12 text-on-surface-variant/60 text-xs font-medium max-w-xs mx-auto animate-fade-in delay-700">
          Bank transfers typically arrive within 1-3 business days. Card withdrawals are processed instantly.
        </p>
      </div>
    </div>
  );
}

export default function CashoutSuccessPage() {
  return (
    <Suspense fallback={<div className="bg-background min-h-screen" />}>
      <CashoutSuccessContent />
    </Suspense>
  );
}
