"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { usePlaidLink } from "react-plaid-link";
import AppShell from "../components/AppShell";
import { useToast } from "../components/ToastProvider";
import { useSession } from "../hooks/useSession";

const keys = ["1", "2", "3", "4", "5", "6", "7", "8", "9", ".", "0", "backspace"];

export default function DepositPage() {
  const toast = useToast();
  const router = useRouter();
  const { user, error: sessionError } = useSession();
  const [amount, setAmount] = useState("");
  const [linkToken, setLinkToken] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    if (sessionError === "Not authenticated") {
      router.replace("/login?next=/deposit");
    }
  }, [sessionError, router]);

  // Fetch Plaid link token on mount
  useEffect(() => {
    fetch("/api/plaid/link-token", { method: "POST" })
      .then((res) => (res.ok ? res.json() : null))
      .then((data: { link_token?: string } | null) => {
        if (data?.link_token) setLinkToken(data.link_token);
      })
      .catch(() => {});
  }, []);

  const parsedAmount = parseFloat(amount);
  const normalizedAmount = Number.isFinite(parsedAmount) ? parsedAmount : 0;

  const displayAmount = amount
    ? `${amount.startsWith(".") ? "0" + amount : amount}`
    : "0.00";

  const balanceNum = Number(user?.balance ?? 0);
  const formattedBalance = useMemo(() => {
    return balanceNum.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }, [balanceNum]);

  const onPlaidSuccess = useCallback(
    async (publicToken: string, metadata: { accounts?: Array<{ id: string; name: string; mask: string }> }) => {
      if (normalizedAmount <= 0) {
        toast("Enter an amount first");
        return;
      }
      setProcessing(true);
      const account = metadata.accounts?.[0];
      try {
        const res = await fetch("/api/onramp", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            public_token: publicToken,
            account_id: account?.id ?? "",
            amount: normalizedAmount,
            account_name: account?.name ?? "",
            account_mask: account?.mask ?? "",
          }),
        });
        if (!res.ok) {
          const data = (await res.json().catch(() => ({}))) as { error?: string };
          toast(data.error ?? "Deposit failed");
          setProcessing(false);
          return;
        }
        const label = account?.name && account?.mask
          ? `${account.name} ····${account.mask}`
          : "Bank Account";
        const params = new URLSearchParams({
          amount: `${normalizedAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })} USDM`,
          method: label,
        });
        router.push(`/deposit/success?${params.toString()}`);
      } catch {
        toast("Network error, please try again");
        setProcessing(false);
      }
    },
    [normalizedAmount, router, toast],
  );

  const { open, ready } = usePlaidLink({
    token: linkToken,
    onSuccess: onPlaidSuccess,
    onExit: () => {},
  });

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

  const canDeposit = normalizedAmount > 0 && ready && linkToken && !processing;

  return (
    <AppShell>
      <div className="max-w-2xl mx-auto px-6 lg:px-12 py-8">
        <header className="mb-8 animate-fade-in-up">
          <div className="flex items-center gap-4 mb-2 lg:hidden">
            <Link href="/dashboard" className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-surface-container-highest transition-all active:scale-90">
              <span className="material-symbols-outlined text-primary">arrow_back</span>
            </Link>
            <h1 className="text-3xl font-bold font-headline tracking-tight text-on-background">Deposit</h1>
          </div>
          <div className="hidden lg:block text-center">
            <h2 className="text-4xl font-headline font-extrabold tracking-tight text-on-background mb-2">Add Funds</h2>
            <p className="text-on-surface-variant">Deposit from your bank account into your USDM wallet.</p>
          </div>
        </header>

        <div className="flex flex-col items-center gap-8">
          <div className="bg-surface-container-lowest rounded-[2.5rem] p-8 lg:p-10 shadow-xl shadow-on-background/5 border border-outline-variant/10 w-full animate-fade-in-up delay-100">
            <div className="text-center mb-8">
              <p className="text-xs font-bold text-outline uppercase tracking-widest mb-4">Amount to Deposit</p>
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
                Current Balance: <span className="font-bold text-tertiary">{formattedBalance} USDM</span>
              </p>
            </div>

            {/* Keypad */}
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

            {/* CTA */}
            {canDeposit ? (
              <button
                onClick={() => open()}
                disabled={processing}
                className="w-full primary-gradient text-white py-5 rounded-2xl font-headline font-extrabold text-lg shadow-lg shadow-primary/30 transition-all active:scale-[0.98] btn-press disabled:opacity-60"
              >
                {processing ? "Processing Deposit..." : "Connect Bank & Deposit"}
              </button>
            ) : (
              <button
                disabled
                className="w-full bg-outline-variant/30 text-outline py-5 rounded-2xl font-headline font-extrabold text-lg cursor-not-allowed"
              >
                {!linkToken ? "Loading..." : normalizedAmount <= 0 ? "Enter an amount" : "Processing..."}
              </button>
            )}
          </div>

          {/* How it works */}
          <div className="bg-surface-container-low rounded-[2rem] p-6 w-full space-y-4 animate-fade-in-up delay-200">
            <h3 className="font-headline font-bold text-on-background">How deposits work</h3>
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0 text-primary font-bold text-sm">1</div>
              <p className="text-sm text-on-surface-variant">Enter the amount of USDM you want to add</p>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0 text-primary font-bold text-sm">2</div>
              <p className="text-sm text-on-surface-variant">Connect your bank account securely via Plaid</p>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0 text-primary font-bold text-sm">3</div>
              <p className="text-sm text-on-surface-variant">Funds are converted to USDM and added to your wallet instantly</p>
            </div>
          </div>

          {/* Trust */}
          <div className="flex items-center gap-4 px-6 animate-fade-in delay-300">
            <div className="w-10 h-10 rounded-full bg-tertiary/10 flex items-center justify-center text-tertiary">
              <span className="material-symbols-outlined">verified_user</span>
            </div>
            <div>
              <p className="text-xs font-bold text-on-background">Secured by Plaid &amp; Crossmint</p>
              <p className="text-[10px] text-outline">Your bank credentials are never stored on our servers.</p>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
