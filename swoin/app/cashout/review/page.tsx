"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import AppShell from "../../components/AppShell";
import { useToast } from "../../components/ToastProvider";

const typeIcons: Record<string, string> = {
  bank: "account_balance",
  card: "credit_card",
  wallet: "payments",
};

function CashoutReviewContent() {
  const toast = useToast();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [submitting, setSubmitting] = useState(false);

  const amount = searchParams.get("amount") || "0.00";
  const methodId = searchParams.get("methodId") || "";
  const methodLabel = searchParams.get("methodLabel") || "";
  const methodType = searchParams.get("methodType") || "bank";
  const parsedAmount = parseFloat(amount);
  const baseAmount = Number.isFinite(parsedAmount) && parsedAmount > 0 ? parsedAmount : 0;
  const formatted = baseAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });

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
      const successParams = new URLSearchParams({
        amount: formatted + " USDM",
        methodLabel,
        methodType,
      });
      router.push(`/cashout/success?${successParams.toString()}`);
    } catch {
      toast("Network error, please try again");
      setSubmitting(false);
    }
  };

  return (
    <AppShell>
      <div className="max-w-6xl mx-auto px-6 lg:px-12 py-8">
        {/* Mobile Header */}
        <div className="flex items-center gap-4 mb-6 lg:hidden animate-fade-in-up">
          <Link href="/cashout" className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-surface-container-highest transition-all active:scale-90">
            <span className="material-symbols-outlined text-primary">arrow_back</span>
          </Link>
          <h1 className="text-3xl font-bold font-headline tracking-tight text-on-background">Review</h1>
        </div>

        {/* Desktop Header */}
        <div className="hidden lg:block mb-10 text-center animate-fade-in-up">
          <h2 className="text-4xl font-extrabold font-headline tracking-tighter text-on-background mb-2">Review Withdrawal</h2>
          <p className="text-on-surface-variant font-medium">Verify your cash out details before confirming.</p>
        </div>

        {/* Mobile flow */}
        <div className="lg:hidden space-y-8 max-w-xl mx-auto">
          <section className="space-y-2 animate-fade-in-up delay-100">
            <p className="text-on-surface-variant font-medium tracking-wide uppercase text-[11px]">Confirm Withdrawal</p>
            <h2 className="text-4xl font-extrabold font-headline tracking-tighter text-on-surface">Review Cash Out</h2>
          </section>

          {/* Summary */}
          <div className="relative animate-scale-in delay-200">
            <div className="absolute -top-6 -right-6 w-32 h-32 bg-primary/5 rounded-full blur-3xl" />
            <div className="relative bg-surface-container-lowest rounded-[2rem] p-8 shadow-[0px_24px_48px_-12px_rgba(11,28,48,0.06)] border border-white/40">
              <div className="space-y-6">
                <div className="flex justify-between items-end">
                  <div>
                    <p className="text-on-surface-variant text-sm font-medium">Withdrawal Amount</p>
                    <h3 className="text-4xl font-bold font-headline mt-1">
                      {formatted} <span className="text-lg font-medium text-secondary">USDM</span>
                    </h3>
                  </div>
                  <div className="bg-surface-container-high px-3 py-1 rounded-full flex items-center gap-2">
                    <span className="material-symbols-outlined text-[18px]" style={{ fontVariationSettings: "'FILL' 1" }}>account_balance_wallet</span>
                    <span className="text-xs font-bold">USDM Wallet</span>
                  </div>
                </div>
                <div className="pt-6 space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-on-surface-variant text-sm">Processing Fee</span>
                    <span className="text-tertiary font-semibold">0.00 USDM</span>
                  </div>
                  <div className="pt-4 border-t border-surface-container-high flex justify-between items-center">
                    <span className="text-on-surface font-bold text-lg font-headline">Total to be Deducted</span>
                    <span className="text-primary font-extrabold text-2xl font-headline">{formatted} USDM</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Destination */}
          <div className="bg-surface-container-low rounded-[2rem] p-6 flex items-center justify-between animate-fade-in-up delay-300">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center">
                <span className="material-symbols-outlined text-primary text-3xl">{typeIcons[methodType] ?? "payments"}</span>
              </div>
              <div>
                <p className="text-on-surface-variant text-xs font-medium uppercase tracking-widest">Withdrawing to</p>
                <p className="text-on-surface font-bold text-lg font-headline">{methodLabel}</p>
                <p className="text-xs text-on-surface-variant capitalize">{methodType}</p>
              </div>
            </div>
            <Link href="/cashout" className="text-primary font-bold text-sm hover:underline active:scale-95 transition-transform">
              Edit
            </Link>
          </div>

          {/* Confirm mobile */}
          <div className="fixed bottom-32 left-0 w-full px-6 max-w-xl mx-auto left-1/2 -translate-x-1/2 lg:hidden">
            <button onClick={confirmCashout} disabled={submitting} className="block w-full">
              <div className="relative bg-surface-container-highest/50 backdrop-blur-xl h-[72px] rounded-full p-2 flex items-center overflow-hidden group">
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <span className="text-on-secondary-container font-bold tracking-wide uppercase text-xs">
                    {submitting ? "Processing..." : "Tap to Confirm Withdrawal"}
                  </span>
                </div>
                <div className="h-14 w-14 bg-gradient-to-br from-primary to-primary-container rounded-full flex items-center justify-center text-white shadow-xl cursor-pointer group-hover:scale-110 group-active:scale-95 transition-all z-10">
                  <span className="material-symbols-outlined">chevron_right</span>
                </div>
              </div>
            </button>
          </div>
        </div>

        {/* Desktop card */}
        <div className="hidden lg:block max-w-xl mx-auto space-y-6">
          <section className="bg-surface-container-lowest rounded-3xl p-8 ambient-shadow animate-scale-in delay-100">
            <div className="flex flex-col items-center mb-8">
              <span className="text-xs font-bold uppercase tracking-widest text-secondary mb-4">Withdrawal Amount</span>
              <h3 className="text-5xl font-extrabold font-headline tracking-tight text-primary">{formatted}</h3>
              <p className="text-secondary font-medium mt-1">USDM</p>
            </div>

            <div className="bg-surface-container-low rounded-2xl p-5 mb-8 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-surface-container-lowest rounded-xl flex items-center justify-center">
                  <span className="material-symbols-outlined text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>wallet</span>
                </div>
                <div>
                  <p className="text-xs font-bold text-secondary uppercase tracking-tight">From</p>
                  <p className="font-bold text-on-background">USDM Primary Wallet</p>
                </div>
              </div>
            </div>

            <div className="space-y-4 pt-4">
              <div className="flex justify-between items-center px-2">
                <span className="text-on-surface-variant font-medium">Processing Fee</span>
                <span className="font-bold text-tertiary">FREE</span>
              </div>
              <div className="h-px bg-surface-container-low w-full my-4" />
              <div className="flex justify-between items-center px-2">
                <span className="text-on-background font-bold">Total to be Deducted</span>
                <span className="text-xl font-bold font-headline text-on-background">{formatted} USDM</span>
              </div>
            </div>
          </section>

          {/* Destination */}
          <section className="bg-surface-container-low rounded-3xl p-6 flex items-center gap-5 animate-fade-in-up delay-200">
            <div className="relative">
              <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center">
                <span className="material-symbols-outlined text-primary text-3xl">{typeIcons[methodType] ?? "payments"}</span>
              </div>
            </div>
            <div className="flex-grow">
              <p className="text-xs font-bold text-secondary uppercase tracking-tight mb-0.5">Withdrawing to</p>
              <h4 className="text-lg font-bold font-headline text-on-background">{methodLabel}</h4>
              <p className="text-sm text-on-surface-variant capitalize">{methodType}</p>
            </div>
            <Link href="/cashout" className="bg-surface-container-highest/50 px-3 py-1.5 rounded-full hover:bg-surface-container-highest transition-colors active:scale-95">
              <span className="text-xs font-bold text-primary">Change</span>
            </Link>
          </section>

          {/* Confirm desktop */}
          <div className="pt-4 px-4 animate-fade-in-up delay-300">
            <button
              onClick={confirmCashout}
              disabled={submitting}
              className="block w-full primary-gradient py-6 rounded-2xl text-white font-headline font-bold text-xl tracking-tight shadow-xl shadow-primary/30 transition-all hover:scale-[1.02] active:scale-[0.98] text-center btn-press disabled:opacity-60"
            >
              {submitting ? "Processing..." : "Confirm Withdrawal"}
            </button>
            <p className="mt-4 text-center text-[11px] text-on-surface-variant font-medium max-w-[80%] mx-auto leading-relaxed">
              By confirming, you authorize Swoin to withdraw USDM from your wallet and transfer to your selected payment method.
            </p>
            <Link href="/cashout" className="block w-full mt-6 py-4 text-secondary font-headline font-bold hover:text-on-background transition-colors text-center active:scale-95">
              Cancel &amp; Return
            </Link>
          </div>
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
