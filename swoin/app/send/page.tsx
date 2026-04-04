"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import AppShell from "../components/AppShell";
import { useToast } from "../components/ToastProvider";
import { useSession } from "../hooks/useSession";

type SearchResult = { id: number; email: string };

const keys = ["1", "2", "3", "4", "5", "6", "7", "8", "9", ".", "0", "backspace"];

export default function SendPage() {
  const toast = useToast();
  const router = useRouter();
  const { user, error: sessionError } = useSession();

  const [amount, setAmount] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [selectedRecipient, setSelectedRecipient] = useState<SearchResult | null>(null);
  const [searching, setSearching] = useState(false);
  const [noteOpen, setNoteOpen] = useState(false);
  const [note, setNote] = useState("");

  useEffect(() => {
    if (sessionError === "Not authenticated") {
      router.replace("/login?next=/send");
    }
  }, [sessionError, router]);

  // Search users by email
  useEffect(() => {
    if (searchQuery.length < 2) {
      setSearchResults([]);
      return;
    }
    const controller = new AbortController();
    setSearching(true);
    fetch(`/api/users/search?q=${encodeURIComponent(searchQuery)}`, {
      signal: controller.signal,
    })
      .then((res) => res.json())
      .then((data: { users?: SearchResult[] }) => {
        setSearchResults(data.users ?? []);
      })
      .catch(() => {})
      .finally(() => setSearching(false));
    return () => controller.abort();
  }, [searchQuery]);

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

  const displayAmount = amount
    ? `${amount.startsWith(".") ? "0" + amount : amount}`
    : "0.00";

  const parsedAmount = parseFloat(amount);
  const normalizedAmount = Number.isFinite(parsedAmount) ? parsedAmount : 0;
  const balanceNum = parseFloat(user?.balance ?? "0");
  const canContinue = normalizedAmount > 0 && selectedRecipient && normalizedAmount <= balanceNum;

  const reviewParams = new URLSearchParams({
    amount: normalizedAmount.toFixed(2),
    recipientId: String(selectedRecipient?.id ?? ""),
    recipient: selectedRecipient?.email ?? "",
  });
  if (note.trim()) {
    reviewParams.set("note", note.trim());
  }
  const reviewQuery = reviewParams.toString();

  const selectRecipient = (r: SearchResult) => {
    setSelectedRecipient(r);
    setSearchQuery(r.email);
    setSearchResults([]);
  };

  const clearRecipient = () => {
    setSelectedRecipient(null);
    setSearchQuery("");
    setSearchResults([]);
  };

  return (
    <AppShell>
      <div className="max-w-6xl mx-auto px-6 lg:px-12 py-8">
        {/* Page Header */}
        <header className="mb-8 lg:mb-12 animate-fade-in-up">
          <div className="flex items-center gap-4 mb-2 lg:hidden">
            <Link href="/dashboard" className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-surface-container-highest transition-all active:scale-90">
              <span className="material-symbols-outlined text-primary">arrow_back</span>
            </Link>
            <div>
              <h1 className="text-3xl font-bold font-headline tracking-tight text-on-background">Send Payment</h1>
              <span className="text-sm font-medium text-secondary">Step 1 of 2</span>
            </div>
          </div>
          <div className="hidden lg:block">
            <h2 className="text-4xl font-headline font-extrabold tracking-tight text-on-background mb-2">Send Payment</h2>
            <p className="text-on-surface-variant">Move USDM across borders instantly with Swoin.</p>
          </div>
        </header>

        <div className="grid grid-cols-12 gap-8 items-start">
          {/* Left: Recipient */}
          <section className="col-span-12 lg:col-span-7 space-y-8 animate-fade-in-up delay-100">
            <div className="bg-surface-container-low rounded-[2rem] p-6 lg:p-8">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-headline font-bold text-on-background">Recipient</h3>
              </div>

              {/* Search by email */}
              <div className="relative mb-4">
                <input
                  className="w-full bg-surface-container-lowest border-none rounded-xl py-4 pl-4 pr-12 text-on-background focus:ring-2 focus:ring-primary/20 transition-all"
                  placeholder="Search by email address..."
                  type="email"
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    if (selectedRecipient) setSelectedRecipient(null);
                  }}
                />
                <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-outline">
                  {searching ? "progress_activity" : "person_search"}
                </span>
              </div>

              {/* Search results */}
              {searchResults.length > 0 && !selectedRecipient && (
                <div className="bg-surface-container-lowest rounded-2xl overflow-hidden border border-outline-variant/10 mb-4 animate-fade-in-up">
                  {searchResults.map((r) => (
                    <button
                      key={r.id}
                      onClick={() => selectRecipient(r)}
                      className="w-full flex items-center gap-4 p-4 hover:bg-surface-container-low transition-colors text-left"
                    >
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <span className="material-symbols-outlined text-primary">person</span>
                      </div>
                      <div>
                        <p className="font-bold text-on-background">{r.email}</p>
                        <p className="text-xs text-on-surface-variant">Swoin User</p>
                      </div>
                    </button>
                  ))}
                </div>
              )}

              {searchQuery.length >= 2 && searchResults.length === 0 && !searching && !selectedRecipient && (
                <p className="text-sm text-on-surface-variant px-2 mb-4">No users found matching &ldquo;{searchQuery}&rdquo;</p>
              )}

              {/* Selected recipient */}
              {selectedRecipient && (
                <div className="bg-primary/5 border-2 border-primary rounded-2xl p-5 flex items-center justify-between animate-scale-in">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                      <span className="material-symbols-outlined text-primary text-2xl">person</span>
                    </div>
                    <div>
                      <p className="font-headline font-bold text-primary">{selectedRecipient.email}</p>
                      <p className="text-xs text-on-surface-variant">Verified Swoin User</p>
                    </div>
                  </div>
                  <button
                    onClick={clearRecipient}
                    className="text-secondary hover:text-error transition-colors active:scale-90"
                  >
                    <span className="material-symbols-outlined">close</span>
                  </button>
                </div>
              )}
            </div>

            {/* Promo Card — desktop only */}
            <div className="hidden lg:flex relative overflow-hidden bg-on-background text-white rounded-[2rem] p-8 items-center justify-between animate-fade-in-up delay-300">
              <div className="z-10 max-w-[60%]">
                <h4 className="text-xl font-headline font-bold mb-2">Borderless Transfers</h4>
                <p className="text-sm text-outline-variant leading-relaxed">Funds are settled on-ledger in under 30 seconds. No hidden clearing fees.</p>
              </div>
              <div className="absolute -right-10 -bottom-10 w-48 h-48 bg-primary opacity-20 rounded-full blur-3xl" />
              <span className="material-symbols-outlined text-6xl text-primary/30 rotate-12">language</span>
            </div>
          </section>

          {/* Right: Amount */}
          <section className="col-span-12 lg:col-span-5 space-y-6 animate-slide-in-right delay-200">
            <div className="bg-surface-container-lowest rounded-[2.5rem] p-8 lg:p-10 shadow-xl shadow-on-background/5 border border-outline-variant/10">
              <div className="text-center mb-8">
                <p className="text-xs font-bold text-outline uppercase tracking-widest mb-4">Amount to Send</p>
                <div className="flex items-center justify-center gap-3">
                  <span
                    className={`text-5xl font-headline font-extrabold tracking-tighter transition-colors duration-200 ${
                      parseFloat(amount) > 0 ? "text-on-background" : "text-outline-variant"
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
                  Available Balance:{" "}
                  <span className="font-bold text-tertiary">
                    {user?.balance ? `${parseFloat(user.balance).toLocaleString(undefined, { minimumFractionDigits: 2 })} USDM` : "Loading..."}
                  </span>
                </p>
                {normalizedAmount > balanceNum && normalizedAmount > 0 && (
                  <p className="mt-2 text-sm text-error font-semibold">Insufficient balance</p>
                )}
              </div>

              {/* Keypad */}
              <div className="grid grid-cols-3 gap-3 mb-10">
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

              {/* Note area */}
              {noteOpen && (
                <div className="mb-4 animate-fade-in-up">
                  <textarea
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    placeholder="Add a note for the recipient..."
                    className="w-full bg-surface-container-low border-none rounded-xl p-4 text-sm text-on-background focus:ring-2 focus:ring-primary/20 resize-none h-20 transition-all"
                  />
                </div>
              )}

              {/* CTA */}
              <div className="space-y-4">
                {canContinue ? (
                  <Link
                    href={`/review?${reviewQuery}`}
                    className="block w-full primary-gradient text-white py-5 rounded-2xl font-headline font-extrabold text-lg shadow-lg shadow-primary/30 transition-all active:scale-[0.98] text-center btn-press"
                  >
                    Continue to Review
                  </Link>
                ) : (
                  <button
                    disabled
                    className="block w-full bg-outline-variant/30 text-outline py-5 rounded-2xl font-headline font-extrabold text-lg cursor-not-allowed"
                  >
                    {!selectedRecipient ? "Select a recipient" : normalizedAmount <= 0 ? "Enter an amount" : "Insufficient balance"}
                  </button>
                )}
                <button
                  onClick={() => setNoteOpen(!noteOpen)}
                  className={`w-full py-2 font-headline text-sm font-bold transition-colors ${
                    noteOpen ? "text-primary" : "text-secondary hover:text-primary"
                  }`}
                >
                  {noteOpen ? "Hide Note" : "Add a Note"}
                </button>
              </div>
            </div>

            {/* Trust Module */}
            <div className="flex items-center gap-4 px-6 animate-fade-in delay-500">
              <div className="w-10 h-10 rounded-full bg-tertiary/10 flex items-center justify-center text-tertiary">
                <span className="material-symbols-outlined">verified_user</span>
              </div>
              <div>
                <p className="text-xs font-bold text-on-background">Swoin Protected</p>
                <p className="text-[10px] text-outline">Encrypted via multi-sig architecture</p>
              </div>
            </div>
          </section>
        </div>
      </div>
    </AppShell>
  );
}
