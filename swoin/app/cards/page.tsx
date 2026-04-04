"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import AppShell from "../components/AppShell";
import { useToast } from "../components/ToastProvider";
import { useSession } from "../hooks/useSession";
import PlaidLink from "../components/PlaidLink";

type PaymentMethod = {
  id: number;
  type: string;
  label: string;
  details: string;
  created_at: string;
};

const typeIcons: Record<string, string> = {
  bank: "account_balance",
  card: "credit_card",
  wallet: "payments",
};

export default function CardsPage() {
  const toast = useToast();
  const router = useRouter();
  const { error: sessionError } = useSession();
  const [methods, setMethods] = useState<PaymentMethod[]>([]);
  const [loading, setLoading] = useState(true);
  const [showPlaid, setShowPlaid] = useState(false);

  useEffect(() => {
    if (sessionError === "Not authenticated") {
      router.replace("/login?next=/cards");
    }
  }, [sessionError, router]);

  const fetchMethods = () => {
    fetch("/api/payment-methods")
      .then((res) => (res.ok ? res.json() : { methods: [] }))
      .then((data: { methods: PaymentMethod[] }) => setMethods(data.methods ?? []))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchMethods();
  }, []);

  const deleteMethod = async (id: number) => {
    const res = await fetch("/api/payment-methods", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    if (res.ok) {
      setMethods((prev) => prev.filter((m) => m.id !== id));
      toast("Payment method removed");
    } else {
      toast("Failed to remove");
    }
  };

  return (
    <AppShell>
      {showPlaid && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          onClick={(e) => { if (e.target === e.currentTarget) setShowPlaid(false); }}
        >
          <div className="relative w-full max-w-lg rounded-3xl bg-surface p-2 ambient-shadow">
            <button
              onClick={() => setShowPlaid(false)}
              aria-label="Close"
              className="absolute right-4 top-4 rounded-full p-1 text-on-surface-variant hover:bg-surface-container-high transition-colors z-10"
            >
              <span className="material-symbols-outlined">close</span>
            </button>
            <PlaidLink onLinked={() => { fetchMethods(); }} />
          </div>
        </div>
      )}

      <div className="max-w-5xl mx-auto px-6 lg:px-12 py-8 space-y-8">
        <header className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4 animate-fade-in-up">
          <div>
            <div className="flex items-center gap-4 mb-2 lg:hidden">
              <Link href="/dashboard" className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-surface-container-highest transition-all active:scale-90">
                <span className="material-symbols-outlined text-primary">arrow_back</span>
              </Link>
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-secondary">Payment Methods</p>
                <h1 className="text-3xl font-headline font-extrabold tracking-tight">Your Methods</h1>
              </div>
            </div>
            <div className="hidden lg:block">
              <p className="text-xs font-bold uppercase tracking-widest text-secondary">Payment Methods</p>
              <h1 className="text-4xl font-headline font-extrabold tracking-tight">Your Payment Methods</h1>
            </div>
          </div>
          <button
            onClick={() => setShowPlaid(true)}
            className="primary-gradient text-white px-6 py-3 rounded-xl font-bold w-fit active:scale-95 flex items-center gap-2"
          >
            <span className="material-symbols-outlined text-sm">add</span>
            Connect Method
          </button>
        </header>

        {/* How it works */}
        <section className="bg-surface-container-lowest rounded-[2rem] p-6 lg:p-8 animate-fade-in-up delay-100">
          <p className="text-xs font-bold uppercase tracking-widest text-secondary mb-3">How it works</p>
          <p className="text-on-surface-variant">Connect a bank account or card, add money to your USDM balance, send to anyone on Swoin, and cash out when needed.</p>
        </section>

        {/* Methods list */}
        {loading ? (
          <div className="text-center py-16">
            <span className="material-symbols-outlined text-4xl text-outline-variant animate-spin">progress_activity</span>
          </div>
        ) : methods.length === 0 ? (
          <section className="text-center py-16 animate-fade-in-up delay-200">
            <span className="material-symbols-outlined text-6xl text-outline-variant mb-4">credit_card_off</span>
            <p className="text-on-surface-variant font-medium text-lg">No payment methods yet</p>
            <p className="text-sm text-outline mt-2 mb-8">Connect a bank account or card to start adding funds.</p>
            <button
              onClick={() => setShowPlaid(true)}
              className="inline-flex items-center gap-2 primary-gradient text-white px-6 py-3 rounded-xl font-bold active:scale-95 transition-all"
            >
              <span className="material-symbols-outlined text-sm">add</span>
              Connect Method
            </button>
          </section>
        ) : (
          <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {methods.map((method, idx) => (
              <div
                key={method.id}
                className="bg-surface-container-low rounded-[2rem] p-8 ambient-shadow animate-fade-in-up"
                style={{ animationDelay: `${(idx + 1) * 100}ms` }}
              >
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                      <span className="material-symbols-outlined text-primary">
                        {typeIcons[method.type] ?? "payments"}
                      </span>
                    </div>
                    <div>
                      <p className="font-headline font-bold text-lg">{method.label}</p>
                      <p className="text-xs text-on-surface-variant capitalize">{method.type}</p>
                    </div>
                  </div>
                  <span className="px-3 py-1 rounded-full text-xs font-bold uppercase bg-tertiary/10 text-on-tertiary-fixed-variant">
                    Linked
                  </span>
                </div>
                {method.details && (
                  <p className="text-sm text-on-surface-variant mb-6 font-mono">{method.details}</p>
                )}
                <div className="flex gap-3">
                  <button
                    onClick={() => deleteMethod(method.id)}
                    className="px-4 py-2 rounded-xl bg-error/10 text-error text-sm font-bold active:scale-95 transition-all"
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </section>
        )}

        {/* Cash out CTA */}
        <section className="bg-surface-container-lowest rounded-[2rem] p-6 lg:p-8 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 animate-fade-in-up delay-300">
          <p className="text-on-surface-variant">Need funds in your bank? Cash out from your USDM balance at any time.</p>
          <div className="flex flex-wrap gap-3">
            <Link href="/cashout" className="px-5 py-3 rounded-xl primary-gradient text-white font-bold active:scale-95">Cash Out</Link>
            <Link href="/settings" className="px-4 py-2 rounded-xl bg-surface-container-high font-bold">Open Settings</Link>
          </div>
        </section>
      </div>
    </AppShell>
  );
}
