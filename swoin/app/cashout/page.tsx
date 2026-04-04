"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import AppShell from "../components/AppShell";
import { useToast } from "../components/ToastProvider";
import { useSession } from "../hooks/useSession";

type PaymentMethod = {
  id: number;
  type: string;
  label: string;
  details: string;
};

const typeIcons: Record<string, string> = {
  bank: "account_balance",
  card: "credit_card",
  wallet: "payments",
};

const keys = ["1", "2", "3", "4", "5", "6", "7", "8", "9", ".", "0", "backspace"];

export default function CashoutPage() {
  const toast = useToast();
  const router = useRouter();
  const { user, error } = useSession();
  const [amount, setAmount] = useState("");
  const [selectedMethod, setSelectedMethod] = useState<number | null>(null);
  const [processing, setProcessing] = useState(false);
  const [methods, setMethods] = useState<PaymentMethod[]>([]);
  const [loadingMethods, setLoadingMethods] = useState(true);

  useEffect(() => {
    if (error === "Not authenticated") {
      router.replace("/login?next=/cashout");
    }
  }, [error, router]);

  useEffect(() => {
    fetch("/api/payment-methods")
      .then((res) => (res.ok ? res.json() : { methods: [] }))
      .then((data: { methods: PaymentMethod[] }) => setMethods(data.methods ?? []))
      .catch(() => {})
      .finally(() => setLoadingMethods(false));
  }, []);

  const balanceNum = Number(user?.balance ?? 0);
  const parsedAmount = parseFloat(amount);
  const normalizedAmount = Number.isFinite(parsedAmount) ? parsedAmount : 0;
  const canCashout = normalizedAmount > 0 && selectedMethod && normalizedAmount <= balanceNum;

  const displayAmount = amount
    ? `${amount.startsWith(".") ? "0" + amount : amount}`
    : "0.00";

  const formattedBalance = useMemo(() => {
    return balanceNum.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }, [balanceNum]);

  const handleKey = (key: string) => {
    if (key === "backspace") {
      setAmount((prev) => prev.slice(0, -1));
    } else if (key === ".") {
      if (!amount.includes(".")) setAmount((prev) => prev + ".");
    } else {
      const parts = amount.split(".");
      if (parts[1] && parts[1].length >= 2) return;
      if (amount.replace(".", "").length >= 8) return;
      setAmount((prev) => prev + key);
    }
  };

  const handleCashout = () => {
    const method = methods.find((m) => m.id === selectedMethod);
    if (!method) return;
    const params = new URLSearchParams({
      amount: normalizedAmount.toFixed(2),
      methodId: String(method.id),
      methodLabel: method.label,
      methodType: method.type,
    });
    router.push(`/cashout/review?${params.toString()}`);
  };

  return (
    <AppShell>
      <div className="max-w-4xl mx-auto px-6 lg:px-12 py-8">
        <header className="mb-8 animate-fade-in-up">
          <div className="flex items-center gap-4 mb-2 lg:hidden">
            <Link href="/dashboard" className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-surface-container-highest transition-all active:scale-90">
              <span className="material-symbols-outlined text-primary">arrow_back</span>
            </Link>
            <h1 className="text-3xl font-bold font-headline tracking-tight text-on-background">Cash Out</h1>
          </div>
          <div className="hidden lg:block">
            <h2 className="text-4xl font-headline font-extrabold tracking-tight text-on-background mb-2">Cash Out USDM</h2>
            <p className="text-on-surface-variant">Withdraw USDM to one of your linked payment methods.</p>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left: Payment method selection */}
          <section className="space-y-6 animate-fade-in-up delay-100">
            <div className="bg-surface-container-low rounded-[2rem] p-6 lg:p-8">
              <h3 className="text-lg font-headline font-bold text-on-background mb-6">Withdraw to</h3>

              {loadingMethods ? (
                <div className="text-center py-8">
                  <span className="material-symbols-outlined text-3xl text-outline-variant animate-spin">progress_activity</span>
                </div>
              ) : methods.length === 0 ? (
                <div className="text-center py-8">
                  <span className="material-symbols-outlined text-4xl text-outline-variant mb-3">credit_card_off</span>
                  <p className="text-on-surface-variant font-medium">No payment methods linked</p>
                  <p className="text-sm text-outline mt-1 mb-6">Connect a bank account or card first.</p>
                  <Link
                    href="/cards"
                    className="inline-flex items-center gap-2 primary-gradient text-white px-5 py-3 rounded-xl font-bold active:scale-95"
                  >
                    <span className="material-symbols-outlined text-sm">add</span>
                    Add Payment Method
                  </Link>
                </div>
              ) : (
                <div className="space-y-3">
                  {methods.map((method) => {
                    const isSelected = selectedMethod === method.id;
                    return (
                      <button
                        key={method.id}
                        onClick={() => setSelectedMethod(isSelected ? null : method.id)}
                        className={`w-full flex items-center gap-4 p-4 rounded-2xl transition-all text-left active:scale-[0.98] ${
                          isSelected
                            ? "bg-primary/10 ring-2 ring-primary"
                            : "bg-surface-container-lowest hover:bg-surface-container-high"
                        }`}
                      >
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${isSelected ? "bg-primary/20" : "bg-surface-container-highest"}`}>
                          <span className={`material-symbols-outlined ${isSelected ? "text-primary" : "text-secondary"}`}>
                            {typeIcons[method.type] ?? "payments"}
                          </span>
                        </div>
                        <div className="flex-1">
                          <p className={`font-bold ${isSelected ? "text-primary" : "text-on-background"}`}>{method.label}</p>
                          <p className="text-xs text-on-surface-variant capitalize">{method.type}</p>
                        </div>
                        {isSelected && (
                          <span className="material-symbols-outlined text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                        )}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="flex items-center gap-4 px-4 animate-fade-in delay-400">
              <div className="w-10 h-10 rounded-full bg-tertiary/10 flex items-center justify-center text-tertiary">
                <span className="material-symbols-outlined">info</span>
              </div>
              <div>
                <p className="text-xs font-bold text-on-background">Processing Time</p>
                <p className="text-[10px] text-outline">Bank transfers: 1-3 business days. Cards: instant.</p>
              </div>
            </div>
          </section>

          {/* Right: Amount */}
          <section className="animate-slide-in-right delay-200">
            <div className="bg-surface-container-lowest rounded-[2.5rem] p-8 lg:p-10 shadow-xl shadow-on-background/5 border border-outline-variant/10">
              <div className="text-center mb-8">
                <p className="text-xs font-bold text-outline uppercase tracking-widest mb-4">Amount to Withdraw</p>
                <div className="flex items-center justify-center gap-3">
                  <span
                    className={`text-5xl font-headline font-extrabold tracking-tighter transition-colors duration-200 ${
                      normalizedAmount > 0 ? "text-on-background" : "text-outline-variant"
                    }`}
                  >
                    {displayAmount}
                  </span>
                  <div className="bg-surface-container-high px-3 py-1 rounded-full flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-primary-container flex items-center justify-center text-[10px] font-bold text-white">S</span>
                    <span className="text-sm font-bold text-on-background">USDM</span>
                  </div>
                </div>
                <p className="mt-4 text-sm text-on-surface-variant">
                  Available: <span className="font-bold text-tertiary">{formattedBalance} USDM</span>
                </p>
                {normalizedAmount > balanceNum && normalizedAmount > 0 && (
                  <p className="mt-2 text-sm text-error font-semibold">Insufficient balance</p>
                )}
              </div>

              <div className="grid grid-cols-3 gap-3 mb-8">
                {keys.map((k) => (
                  <button
                    key={k}
                    onClick={() => handleKey(k)}
                    className="keypad-btn aspect-square flex items-center justify-center text-xl font-headline font-bold text-on-background hover:bg-surface-container-low rounded-2xl select-none"
                  >
                    {k === "backspace" ? (
                      <span className="material-symbols-outlined">backspace</span>
                    ) : (
                      k
                    )}
                  </button>
                ))}
              </div>

              {canCashout ? (
                <button
                  onClick={handleCashout}
                  disabled={processing}
                  className="w-full primary-gradient text-white py-5 rounded-2xl font-headline font-extrabold text-lg shadow-lg shadow-primary/30 transition-all active:scale-[0.98] btn-press disabled:opacity-60"
                >
                  {processing ? "Processing..." : "Withdraw"}
                </button>
              ) : (
                <button
                  disabled
                  className="w-full bg-outline-variant/30 text-outline py-5 rounded-2xl font-headline font-extrabold text-lg cursor-not-allowed"
                >
                  {methods.length === 0 ? "No payment method" : !selectedMethod ? "Select a method" : normalizedAmount <= 0 ? "Enter an amount" : "Insufficient balance"}
                </button>
              )}
            </div>
          </section>
        </div>
      </div>
    </AppShell>
  );
}
