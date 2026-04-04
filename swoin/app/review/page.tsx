"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useMemo, useState } from "react";
import AppShell from "../components/AppShell";
import { useToast } from "../components/ToastProvider";

const currencies = ["USD", "EUR", "GBP"] as const;

function ReviewPageContent() {
  const toast = useToast();
  const searchParams = useSearchParams();
  const [activeCurrency, setActiveCurrency] = useState<typeof currencies[number]>("USD");

  const recipientName = searchParams.get("recipient") || "Julianne Sterling";
  const recipientHandle = searchParams.get("handle") || "@julianne.sterling";
  const note = searchParams.get("note") || "";
  const amount = searchParams.get("amount") || "2450.00";
  const parsedAmount = Number.parseFloat(amount);
  const baseUsdAmount = Number.isFinite(parsedAmount) && parsedAmount > 0 ? parsedAmount : 2450;
  const amounts = useMemo<Record<(typeof currencies)[number], string>>(() => ({
    USD: `$${baseUsdAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
    EUR: `€${(baseUsdAmount * 0.92).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
    GBP: `£${(baseUsdAmount * 0.789).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
  }), [baseUsdAmount]);

  const rates: Record<string, string> = {
    USD: "1 USD = 1.00 USD",
    EUR: "1 USD = 0.92 EUR",
    GBP: "1 USD = 0.789 GBP",
  };

  return (
    <AppShell>
      <div className="max-w-6xl mx-auto px-6 lg:px-12 py-8">
        {/* Mobile Header */}
        <div className="flex items-center gap-4 mb-6 lg:hidden animate-fade-in-up">
          <Link href="/send" className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-surface-container-highest transition-all active:scale-90">
            <span className="material-symbols-outlined text-primary">arrow_back</span>
          </Link>
          <h1 className="text-3xl font-bold font-headline tracking-tight text-on-background">Review</h1>
        </div>

        {/* Desktop Header */}
        <div className="hidden lg:block mb-10 text-center animate-fade-in-up">
          <h2 className="text-4xl font-extrabold font-headline tracking-tighter text-on-background mb-2">Review &amp; Send</h2>
          <p className="text-on-surface-variant font-medium">Verify your transaction details before final confirmation.</p>
        </div>

        {/* Mobile: Transaction flow */}
        <div className="lg:hidden space-y-8 max-w-xl mx-auto">
          <section className="space-y-2 animate-fade-in-up delay-100">
            <p className="text-on-surface-variant font-medium tracking-wide uppercase text-[11px]">Confirm Transaction</p>
            <h2 className="text-4xl font-extrabold font-headline tracking-tighter text-on-surface">Review &amp; Send</h2>
          </section>

          {/* Summary Card */}
          <div className="relative animate-scale-in delay-200">
            <div className="absolute -top-6 -right-6 w-32 h-32 bg-primary/5 rounded-full blur-3xl" />
            <div className="relative bg-surface-container-lowest rounded-[2rem] p-8 shadow-[0px_24px_48px_-12px_rgba(11,28,48,0.06)] border border-white/40">
              <div className="space-y-6">
                <div className="flex justify-between items-end">
                  <div>
                    <p className="text-on-surface-variant text-sm font-medium">Sending Amount</p>
                    <h3 className="text-4xl font-bold font-headline mt-1 transition-all duration-300">
                      {amounts[activeCurrency]} <span className="text-lg font-medium text-secondary">{activeCurrency}</span>
                    </h3>
                  </div>
                  <div className="bg-surface-container-high px-3 py-1 rounded-full flex items-center gap-2">
                    <span className="material-symbols-outlined text-[18px]" style={{ fontVariationSettings: "'FILL' 1" }}>account_balance_wallet</span>
                    <span className="text-xs font-bold">Personal Wallet</span>
                  </div>
                </div>
                <div className="pt-6 space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-on-surface-variant text-sm">Exchange Rate</span>
                    <span className="text-on-surface font-semibold transition-all">{rates[activeCurrency]}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-on-surface-variant text-sm">Network Fee</span>
                    <span className="text-tertiary font-semibold">$0.00</span>
                  </div>
                  <div className="pt-4 border-t border-surface-container-high flex justify-between items-center">
                    <span className="text-on-surface font-bold text-lg font-headline">Total to be Deducted</span>
                    <span className="text-primary font-extrabold text-2xl font-headline">{amounts[activeCurrency]}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Recipient */}
          <div className="bg-surface-container-low rounded-[2rem] p-6 flex items-center justify-between animate-fade-in-up delay-300">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center">
                <span className="material-symbols-outlined text-primary text-3xl">person</span>
              </div>
              <div>
                <p className="text-on-surface-variant text-xs font-medium uppercase tracking-widest">Recipient</p>
                <p className="text-on-surface font-bold text-lg font-headline">{recipientName}</p>
                <p className="text-on-surface-variant text-sm font-mono truncate max-w-[180px]">{recipientHandle}</p>
              </div>
            </div>
            <Link href="/send" className="text-primary font-bold text-sm hover:underline active:scale-95 transition-transform">
              Edit
            </Link>
          </div>

          {note && (
            <div className="bg-surface-container-low rounded-[2rem] p-5 animate-fade-in-up delay-350">
              <p className="text-on-surface-variant text-xs font-medium uppercase tracking-widest mb-2">Note</p>
              <p className="text-on-surface">{note}</p>
            </div>
          )}

          {/* Mobile currency toggle */}
          <div className="flex justify-center animate-fade-in-up delay-400">
            <div className="glass-panel rounded-full p-1.5 flex items-center gap-1 shadow-lg border border-white/20">
              {currencies.map((c) => (
                <button
                  key={c}
                  onClick={() => setActiveCurrency(c)}
                  className={`px-5 py-2 rounded-full font-bold text-sm transition-all duration-300 ${
                    activeCurrency === c
                      ? "bg-primary text-white shadow-md"
                      : "text-secondary hover:bg-surface-container-high active:scale-95"
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>

          {/* Links */}
          <div className="flex flex-col items-center gap-4 py-2 animate-fade-in delay-500">
            <div className="flex gap-6">
              <button onClick={() => toast("Fee breakdown — no hidden fees!")} className="text-on-surface-variant hover:text-primary text-sm font-medium transition-colors active:scale-95">
                Fee Breakdown
              </button>
              <button onClick={() => toast("Terms & Conditions — Coming soon")} className="text-on-surface-variant hover:text-primary text-sm font-medium transition-colors active:scale-95">
                Terms &amp; Conditions
              </button>
            </div>
          </div>

          {/* Slide to Confirm (mobile) */}
          <div className="fixed bottom-32 left-0 w-full px-6 max-w-xl mx-auto left-1/2 -translate-x-1/2 lg:hidden">
            <Link
              href={`/success?amount=${encodeURIComponent(amounts[activeCurrency])}&recipient=${encodeURIComponent(recipientName)}&handle=${encodeURIComponent(recipientHandle)}`}
              className="block"
            >
              <div className="relative bg-surface-container-highest/50 backdrop-blur-xl h-[72px] rounded-full p-2 flex items-center overflow-hidden group">
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <span className="text-on-secondary-container font-bold tracking-wide uppercase text-xs">Tap to Confirm Transaction</span>
                </div>
                <div className="h-14 w-14 bg-gradient-to-br from-primary to-primary-container rounded-full flex items-center justify-center text-white shadow-xl cursor-pointer group-hover:scale-110 group-active:scale-95 transition-all z-10">
                  <span className="material-symbols-outlined">chevron_right</span>
                </div>
              </div>
            </Link>
          </div>
        </div>

        {/* Desktop: centered card */}
        <div className="hidden lg:block max-w-xl mx-auto space-y-6">
          {/* Breakdown */}
          <section className="bg-surface-container-lowest rounded-3xl p-8 ambient-shadow animate-scale-in delay-100">
            <div className="flex flex-col items-center mb-8">
              <span className="text-xs font-bold uppercase tracking-widest text-secondary mb-4">Total Amount</span>
              <h3 className="text-5xl font-extrabold font-headline tracking-tight text-primary transition-all duration-300">
                {amounts[activeCurrency]}
              </h3>
              <p className="text-secondary font-medium mt-1">{activeCurrency}</p>
            </div>

            <div className="bg-surface-container-low rounded-2xl p-5 mb-8 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-surface-container-lowest rounded-xl flex items-center justify-center">
                  <span className="material-symbols-outlined text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>wallet</span>
                </div>
                <div>
                  <p className="text-xs font-bold text-secondary uppercase tracking-tight">From Wallet</p>
                  <p className="font-bold text-on-background">Primary Liquid Balance</p>
                </div>
              </div>
              <p className="text-xs font-medium text-secondary">Ending in •••• 9021</p>
            </div>

            <div className="space-y-4 pt-4">
              <div className="flex justify-between items-center px-2">
                <span className="text-on-surface-variant font-medium">Exchange Rate</span>
                <span className="font-bold text-on-background transition-all">{rates[activeCurrency]}</span>
              </div>
              <div className="flex justify-between items-center px-2">
                <span className="text-on-surface-variant font-medium">Network Fee</span>
                <span className="font-bold text-tertiary">FREE</span>
              </div>
              <div className="h-px bg-surface-container-low w-full my-4" />
              <div className="flex justify-between items-center px-2">
                <span className="text-on-background font-bold">Total to be Deducted</span>
                <span className="text-xl font-bold font-headline text-on-background transition-all">{amounts[activeCurrency]}</span>
              </div>
            </div>
          </section>

          {/* Recipient */}
          <section className="bg-surface-container-low rounded-3xl p-6 flex items-center gap-5 animate-fade-in-up delay-200">
            <div className="relative">
              <img
                alt="Julianne Sterling"
                className="w-16 h-16 rounded-2xl object-cover"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuAwq-Ld_trxmpEjLIhVg50tlHp4mwjFHXYw5maffjzFGo4ZaHujUKLTVRW_uuR8lE5lrKITIjrW3cMp1Q1sKfrr88uWbtQzwajUYqcvhdAq7c2ZyqtANYEuG-LHJVGyJlcKkivrZQ5iZDtm3e7kHkhvxbqKPBWPMxM1HVRAiDfzT5YSlQL_-J3NJ4ro63Wdq9I0LUqIHE_MiZBQ4fMtlw5kE3HKCP3U1zxXEKGsj_pxg2QrnWS8MY2iu76xQcZuX_emXSE8baf2_R4"
              />
              <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-tertiary rounded-full border-4 border-surface-container-low flex items-center justify-center">
                <span className="material-symbols-outlined text-white text-[12px] font-bold">verified</span>
              </div>
            </div>
            <div className="flex-grow">
              <p className="text-xs font-bold text-secondary uppercase tracking-tight mb-0.5">Sending to</p>
               <h4 className="text-lg font-bold font-headline text-on-background">{recipientName}</h4>
               <p className="text-sm text-on-surface-variant">{recipientHandle}</p>
             </div>
            <Link href="/send" className="bg-surface-container-highest/50 px-3 py-1.5 rounded-full hover:bg-surface-container-highest transition-colors active:scale-95">
              <span className="text-xs font-bold text-primary">Change</span>
            </Link>
          </section>

          {/* Confirm Button (desktop) */}
          <div className="pt-4 px-4 animate-fade-in-up delay-300">
            <Link
              href={`/success?amount=${encodeURIComponent(amounts[activeCurrency])}&recipient=${encodeURIComponent(recipientName)}&handle=${encodeURIComponent(recipientHandle)}`}
              className="block w-full primary-gradient py-6 rounded-2xl text-white font-headline font-bold text-xl tracking-tight shadow-xl shadow-primary/30 transition-all hover:scale-[1.02] active:scale-[0.98] text-center btn-press"
            >
              Confirm Transaction
            </Link>
            {note && (
              <div className="mt-5 bg-surface-container-low rounded-2xl p-4">
                <p className="text-on-surface-variant text-[11px] font-bold uppercase tracking-widest mb-1">Note</p>
                <p className="text-sm text-on-background">{note}</p>
              </div>
            )}
            <p className="mt-4 text-center text-[11px] text-on-surface-variant font-medium max-w-[80%] mx-auto leading-relaxed">
              By confirming, you authorize Sovereign Fluidity to process this transfer. Funds are usually delivered within minutes.
            </p>
            <Link href="/send" className="block w-full mt-6 py-4 text-secondary font-headline font-bold hover:text-on-background transition-colors text-center active:scale-95">
              Cancel &amp; Return
            </Link>
          </div>
        </div>

        {/* Desktop: Info modules */}
        <div className="hidden lg:grid mt-24 grid-cols-12 gap-8 animate-fade-in-up delay-500">
          <div className="col-span-7 bg-surface-container-low rounded-[40px] p-10 flex flex-col justify-between overflow-hidden relative">
            <div className="relative z-10">
              <span className="material-symbols-outlined text-primary text-4xl mb-6">shield_with_heart</span>
              <h4 className="text-2xl font-bold font-headline mb-4">Your security is our priority.</h4>
              <p className="text-on-surface-variant max-w-md">This transaction is protected by 256-bit AES encryption and multi-factor authentication protocols.</p>
            </div>
            <div className="absolute -right-20 -bottom-20 w-80 h-80 bg-primary/5 rounded-full blur-3xl" />
          </div>
          <div className="col-span-5 bg-on-background text-white rounded-[40px] p-10 flex flex-col justify-center">
            <h4 className="text-2xl font-bold font-headline leading-tight">Need help with this transfer?</h4>
            <p className="text-slate-400 mt-4 mb-8">Our concierge team is available 24/7 for premium sovereign accounts.</p>
            <button
              onClick={() => toast("Support chat — Coming soon")}
              className="inline-flex items-center gap-2 text-primary-fixed-dim font-bold hover:gap-4 transition-all w-fit"
            >
              Contact Architect Support
              <span className="material-symbols-outlined">arrow_forward</span>
            </button>
          </div>
        </div>

        {/* Currency Toggle (desktop) */}
        <div className="hidden lg:block fixed bottom-8 right-8 z-50">
          <div className="glass-panel rounded-full p-2 flex items-center gap-1 shadow-2xl border border-white/20">
            {currencies.map((c) => (
              <button
                key={c}
                onClick={() => setActiveCurrency(c)}
                className={`px-6 py-2 rounded-full font-bold text-sm transition-all duration-300 ${
                  activeCurrency === c
                    ? "bg-primary text-white shadow-md"
                    : "text-secondary hover:bg-surface-container-high active:scale-95"
                }`}
              >
                {c}
              </button>
            ))}
          </div>
        </div>
      </div>
    </AppShell>
  );
}

export default function ReviewPage() {
  return (
    <Suspense
      fallback={
        <AppShell>
          <div className="max-w-6xl mx-auto px-6 lg:px-12 py-8">Loading...</div>
        </AppShell>
      }
    >
      <ReviewPageContent />
    </Suspense>
  );
}
