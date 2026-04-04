"use client";

import Link from "next/link";
import { useState } from "react";
import AppShell from "../components/AppShell";
import { useToast } from "../components/ToastProvider";

const contacts = [
  {
    name: "Marcus",
    handle: "@m_foster",
    avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuAkv46aZy9pXiaUNOxa_iqoxoCx0Li3OBrEOxR6fEVqYu1adGmyq3HWK1iQ3clKCAqpZhpIE8NissWqbUf8WP7PAU0t1jTWUEX6yPw3fqLhLZx2vbzDKJqu1mCDs7aXxPR7_GGjWfKdSo0urXZpAUZFIgprt1LRu1pJGfDuntmKLmpwxY7cuc5TRMh4XyrDuC54GcZrLc317wiQ0zqGEBtMRcULKzBaTRCAY9hOg-qnzZQPg9uJQlEGXO_ZPID7_IT4wj2_zGw_p64",
    online: true,
  },
  {
    name: "Elena",
    handle: "@elenas_vault",
    avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuCOOLQFsFFZr9VLMwSBNr0E1gp39HMqKiYkIdVtfW6rbJk1QBlfPJ_q-xmcQTQxbyxiqSsptf2kjEVdr9cFK7DDgJYJ3ls3BZ4QBPy14Bp6moZJroSRKTf4vW_RqhCZnkcA7cK3T7jwE89iNYtTQG1CM8M7RmNaQg0nfOe_5Y_YcaOXg2qyvHNpEn1PAsFeNtB1SaQwGua9w8dmBhzcHR3xpQQX5q6ng0zWRDFdJHBan5OyCPFLo_QzBc82338_fddv2Ncc9AfvzWw",
    online: false,
  },
  {
    name: "Soren",
    handle: "@s_nordic",
    avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuBV4tmGBNUcu5cGY6P3DFK5IeF-RsM75lGgtayGiyYT9uaGx4EHLVlwllBe1CbTFkMBqeAobUhHVWYyzfz_ffKmLhtUWcYHyIUYwrP-iF0IBaQf7lxgFzB5bqSvVYX0bvGBQ2FkCiagTVZp3QMIiXTks7bJTzjVd6JZC8s3uAdeXOruwTpmWLMfR3T70q5sUhhPQktmBB4AJQiBfsMDueLzCXb1mw0V0IBwPcyj5a1L2SjdfayFeQikD6RTA3DY-vWqGMBiXxVwVuo",
    online: false,
  },
];

const keys = ["1", "2", "3", "4", "5", "6", "7", "8", "9", ".", "0", "backspace"];

export default function SendPage() {
  const toast = useToast();
  const [amount, setAmount] = useState("");
  const [selectedContact, setSelectedContact] = useState<string | null>(null);
  const [noteOpen, setNoteOpen] = useState(false);
  const [note, setNote] = useState("");

  const handleKey = (key: string) => {
    if (key === "backspace") {
      setAmount((prev) => prev.slice(0, -1));
    } else if (key === ".") {
      if (!amount.includes(".")) setAmount((prev) => prev + ".");
    } else {
      // Max 2 decimal places
      const parts = amount.split(".");
      if (parts[1] && parts[1].length >= 2) return;
      // Max reasonable length
      if (amount.replace(".", "").length >= 8) return;
      setAmount((prev) => prev + key);
    }
  };

  const displayAmount = amount
    ? `$${amount.startsWith(".") ? "0" + amount : amount}`
    : "$0.00";

  const canContinue = parseFloat(amount) > 0 && selectedContact;

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
            <p className="text-on-surface-variant">Move assets across borders instantly with Sovereign Fluidity.</p>
          </div>
        </header>

        <div className="grid grid-cols-12 gap-8 items-start">
          {/* Left: Recipient */}
          <section className="col-span-12 lg:col-span-7 space-y-8 animate-fade-in-up delay-100">
            <div className="bg-surface-container-low rounded-[2rem] p-6 lg:p-8">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-headline font-bold text-on-background">Recipient</h3>
                <button
                  onClick={() => toast("Add a recipient by selecting New")}
                  className="text-primary font-headline font-bold text-sm hover:underline active:scale-95 transition-transform"
                >
                  New Contact
                </button>
              </div>

              {/* Search */}
              <div className="relative mb-8">
                <input
                  className="w-full bg-surface-container-lowest border-none rounded-xl py-4 pl-4 pr-12 text-on-background focus:ring-2 focus:ring-primary/20 transition-all"
                  placeholder="Name, @handle, or wallet address"
                  type="text"
                  value={selectedContact ? contacts.find(c => c.name === selectedContact)?.handle || "" : ""}
                  readOnly
                />
                <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-outline">person_search</span>
              </div>

              {/* Contacts */}
              <div className="space-y-4">
                <p className="text-xs font-bold uppercase tracking-widest text-outline ml-1">Recent Contacts</p>
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-4">
                  {contacts.map((c, i) => {
                    const isSelected = selectedContact === c.name;
                    return (
                      <button
                        key={c.name}
                        onClick={() => setSelectedContact(isSelected ? null : c.name)}
                        className={`group p-4 rounded-2xl transition-all text-left flex flex-col items-center gap-3 animate-fade-in-up active:scale-95 ${
                          isSelected
                            ? "bg-primary/10 ring-2 ring-primary"
                            : "bg-surface-container-lowest hover:bg-surface-container-high"
                        }`}
                        style={{ animationDelay: `${(i + 2) * 80}ms` }}
                      >
                        <div className="relative">
                          <div className={`w-14 lg:w-16 h-14 lg:h-16 rounded-full overflow-hidden ring-2 transition-all ${
                            isSelected ? "ring-primary" : "ring-transparent group-hover:ring-primary/50"
                          }`}>
                            <img className="w-full h-full object-cover" src={c.avatar} alt={c.name} />
                          </div>
                          {c.online && (
                            <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-tertiary-fixed-dim rounded-full border-4 border-surface-container-lowest" />
                          )}
                        </div>
                        <div className="text-center">
                          <p className={`font-headline font-bold ${isSelected ? "text-primary" : "text-on-background"}`}>{c.name}</p>
                          <p className="text-[10px] text-outline font-medium">{c.handle}</p>
                        </div>
                      </button>
                    );
                  })}
                  <button
                    onClick={() => toast("New recipient flow opened")}
                    className="group bg-surface-container-low hover:bg-surface-container-high p-4 rounded-2xl transition-all border-2 border-dashed border-outline-variant/30 flex flex-col items-center gap-3 active:scale-95 animate-fade-in-up delay-400"
                  >
                    <div className="w-14 lg:w-16 h-14 lg:h-16 rounded-full flex items-center justify-center bg-surface-container-highest">
                      <span className="material-symbols-outlined text-primary">add</span>
                    </div>
                    <span className="text-xs font-bold text-on-surface">New</span>
                  </button>
                </div>
              </div>
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
                    <span className="text-sm font-bold text-on-background">USDC</span>
                  </div>
                </div>
                <p className="mt-4 text-sm text-on-surface-variant">
                  Available Balance: <span className="font-bold text-tertiary">24,500.00 USDC</span>
                </p>
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
                    href="/review"
                    className="block w-full primary-gradient text-white py-5 rounded-2xl font-headline font-extrabold text-lg shadow-lg shadow-primary/30 transition-all active:scale-[0.98] text-center btn-press"
                  >
                    Continue to Review
                  </Link>
                ) : (
                  <button
                    disabled
                    className="block w-full bg-outline-variant/30 text-outline py-5 rounded-2xl font-headline font-extrabold text-lg cursor-not-allowed"
                  >
                    {!selectedContact ? "Select a recipient" : "Enter an amount"}
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
                <p className="text-xs font-bold text-on-background">Sovereign Protected</p>
                <p className="text-[10px] text-outline">Encrypted via multi-sig architecture</p>
              </div>
            </div>
          </section>
        </div>
      </div>
    </AppShell>
  );
}
