"use client";

import { useState } from "react";
import Link from "next/link";
import AppShell from "../components/AppShell";
import { useToast } from "../components/ToastProvider";
import PlaidLink from "../components/PlaidLink";

const cards = [
  { name: "Chase Bank", type: "Bank Account", number: "•••• 9021", status: "Linked", limit: "ACH Transfer" },
  { name: "Visa Debit", type: "Debit Card", number: "•••• 1974", status: "Linked", limit: "Instant Top-up" },
];

export default function CardsPage() {
  const toast = useToast();
  const [showPlaid, setShowPlaid] = useState(false);

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
              className="absolute right-4 top-4 rounded-full p-1 text-on-surface-variant hover:bg-surface-container-high transition-colors"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <PlaidLink />
          </div>
        </div>
      )}

      <div className="max-w-6xl mx-auto px-6 lg:px-12 py-8 space-y-8">
        <section className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-secondary">Payment methods</p>
            <h1 className="text-4xl font-headline font-extrabold tracking-tight">Your payment methods</h1>
          </div>
          <button
            onClick={() => setShowPlaid(true)}
            className="primary-gradient text-white px-6 py-3 rounded-xl font-bold w-fit active:scale-95"
          >
            Connect Method
          </button>
        </section>

        <section className="bg-surface-container-lowest rounded-[2rem] p-6 lg:p-8">
          <p className="text-xs font-bold uppercase tracking-widest text-secondary mb-3">How it works</p>
          <p className="text-on-surface-variant">Connect card/bank account → add money to balance → use balance to send people → cash out when needed.</p>
        </section>

        <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {cards.map((card, idx) => (
            <div key={card.number} className="bg-surface-container-low rounded-[2rem] p-8 ambient-shadow animate-fade-in-up" style={{ animationDelay: `${(idx + 1) * 120}ms` }}>
              <div className="flex items-center justify-between mb-10">
                <p className="font-headline font-bold text-xl">{card.name}</p>
                <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${card.status === "Linked" ? "bg-tertiary/10 text-on-tertiary-fixed-variant" : "bg-primary/10 text-primary"}`}>
                  {card.status}
                </span>
              </div>
              <p className="text-2xl font-headline font-bold tracking-[0.12em] mb-2">{card.number}</p>
              <p className="text-sm text-on-surface-variant">{card.type}</p>
              <div className="mt-8 flex items-center justify-between">
                <p className="text-xs uppercase tracking-widest text-secondary">Use Case</p>
                <p className="font-bold">{card.limit}</p>
              </div>
              <div className="mt-6 flex gap-3">
                <button onClick={() => toast(`${card.name} controls opened`)} className="px-4 py-2 rounded-xl bg-surface-container-high text-sm font-bold active:scale-95">
                  Manage
                </button>
                <button onClick={() => toast("Add funds to balance — Coming soon")} className="px-4 py-2 rounded-xl bg-surface-container-high text-sm font-bold active:scale-95">Add Money</button>
               </div>
            </div>
          ))}
        </section>

        <section className="bg-surface-container-lowest rounded-[2rem] p-6 lg:p-8 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <p className="text-on-surface-variant">Need funds in your bank? Cash out from your balance at any time.</p>
          <div className="flex flex-wrap gap-3">
            <button onClick={() => toast("Cash out flow — Coming soon")} className="px-4 py-2 rounded-xl bg-surface-container-high font-bold">Cash Out</button>
            <Link href="/settings" className="px-4 py-2 rounded-xl bg-surface-container-high font-bold">Open Settings</Link>
          </div>
        </section>
      </div>
    </AppShell>
  );
}
