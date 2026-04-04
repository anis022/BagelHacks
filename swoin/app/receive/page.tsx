"use client";

import Link from "next/link";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import AppShell from "../components/AppShell";
import { useToast } from "../components/ToastProvider";
import { useSession } from "../hooks/useSession";

export default function ReceivePage() {
  const toast = useToast();
  const router = useRouter();
  const { user, error } = useSession();

  useEffect(() => {
    if (error === "Not authenticated") {
      router.replace("/login?next=/receive");
    }
  }, [error, router]);

  const copyEmail = async () => {
    if (!user?.email) return;
    try {
      await navigator.clipboard.writeText(user.email);
      toast("Wallet address copied!");
    } catch {
      toast(user.email);
    }
  };

  return (
    <AppShell>
      <div className="max-w-2xl mx-auto px-6 lg:px-12 py-8">
        <header className="mb-10 animate-fade-in-up">
          <div className="flex items-center gap-4 mb-2 lg:hidden">
            <Link href="/dashboard" className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-surface-container-highest transition-all active:scale-90">
              <span className="material-symbols-outlined text-primary">arrow_back</span>
            </Link>
            <h1 className="text-3xl font-bold font-headline tracking-tight text-on-background">Receive</h1>
          </div>
          <div className="hidden lg:block text-center">
            <h2 className="text-4xl font-headline font-extrabold tracking-tight text-on-background mb-2">Receive USDM</h2>
            <p className="text-on-surface-variant">Share your wallet address to receive payments from other Swoin users.</p>
          </div>
        </header>

        <div className="flex flex-col items-center gap-8">
          {/* Wallet icon */}
          <div className="w-28 h-28 rounded-full bg-tertiary/10 flex items-center justify-center animate-bounce-in">
            <div className="w-20 h-20 rounded-full bg-tertiary flex items-center justify-center shadow-lg shadow-tertiary/20">
              <span className="material-symbols-outlined text-white text-5xl" style={{ fontVariationSettings: "'FILL' 1" }}>
                account_balance_wallet
              </span>
            </div>
          </div>

          <div className="text-center animate-fade-in-up delay-100">
            <p className="text-xs font-bold uppercase tracking-widest text-secondary mb-3">Your Wallet Address</p>
            <p className="text-2xl font-headline font-bold text-on-background">{user?.email ?? "Loading..."}</p>
            <p className="text-sm text-on-surface-variant mt-2">Other users can send you USDM using this email.</p>
          </div>

          {/* Copy address */}
          <div className="bg-surface-container-low rounded-[2rem] p-6 w-full max-w-md animate-fade-in-up delay-200">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-primary">alternate_email</span>
                </div>
                <p className="font-mono text-sm text-on-background truncate">{user?.email ?? "..."}</p>
              </div>
              <button
                onClick={copyEmail}
                className="shrink-0 bg-primary/10 text-primary hover:bg-primary/20 px-4 py-2 rounded-xl font-bold text-sm transition-colors active:scale-95 flex items-center gap-2"
              >
                <span className="material-symbols-outlined text-lg">content_copy</span>
                Copy
              </button>
            </div>
          </div>

          {/* Instructions */}
          <div className="bg-surface-container-lowest rounded-[2rem] p-6 w-full max-w-md space-y-4 animate-fade-in-up delay-300">
            <h3 className="font-headline font-bold text-on-background">How to receive USDM</h3>
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0 text-primary font-bold text-sm">1</div>
              <p className="text-sm text-on-surface-variant">Share your email address with the sender</p>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0 text-primary font-bold text-sm">2</div>
              <p className="text-sm text-on-surface-variant">The sender searches your email on the Send page</p>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0 text-primary font-bold text-sm">3</div>
              <p className="text-sm text-on-surface-variant">USDM is delivered instantly to your wallet</p>
            </div>
          </div>

          <Link
            href="/dashboard"
            className="text-primary font-headline font-bold hover:underline active:scale-95 transition-all animate-fade-in delay-400"
          >
            Back to Dashboard
          </Link>
        </div>
      </div>
    </AppShell>
  );
}
