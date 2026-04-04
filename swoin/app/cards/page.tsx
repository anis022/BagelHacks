"use client";

import Link from "next/link";
import AppShell from "../components/AppShell";
import { useToast } from "../components/ToastProvider";

const cards = [
  { name: "Sovereign Black", type: "Virtual · USDC", number: "•••• 4821", status: "Active", limit: "$25,000" },
  { name: "Travel Companion", type: "Physical · Multi-currency", number: "•••• 1974", status: "Frozen", limit: "$8,000" },
];

export default function CardsPage() {
  const toast = useToast();

  return (
    <AppShell>
      <div className="max-w-6xl mx-auto px-6 lg:px-12 py-8 space-y-8">
        <section className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-secondary">Payment methods</p>
            <h1 className="text-4xl font-headline font-extrabold tracking-tight">Your Payment methods</h1>
          </div>
          <button
            onClick={() => toast("New card request submitted")}
            className="primary-gradient text-white px-6 py-3 rounded-xl font-bold w-fit active:scale-95"
          >
            Request New Card
          </button>
        </section>

        <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {cards.map((card, idx) => (
            <div key={card.number} className="bg-surface-container-low rounded-[2rem] p-8 ambient-shadow animate-fade-in-up" style={{ animationDelay: `${(idx + 1) * 120}ms` }}>
              <div className="flex items-center justify-between mb-10">
                <p className="font-headline font-bold text-xl">{card.name}</p>
                <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${card.status === "Active" ? "bg-tertiary/10 text-on-tertiary-fixed-variant" : "bg-primary/10 text-primary"}`}>
                  {card.status}
                </span>
              </div>
              <p className="text-2xl font-headline font-bold tracking-[0.12em] mb-2">{card.number}</p>
              <p className="text-sm text-on-surface-variant">{card.type}</p>
              <div className="mt-8 flex items-center justify-between">
                <p className="text-xs uppercase tracking-widest text-secondary">Monthly Limit</p>
                <p className="font-bold">{card.limit}</p>
              </div>
              <div className="mt-6 flex gap-3">
                <button onClick={() => toast(`${card.name} controls opened`)} className="px-4 py-2 rounded-xl bg-surface-container-high text-sm font-bold active:scale-95">
                  Manage
                </button>
                <Link href="/settings" className="px-4 py-2 rounded-xl bg-surface-container-high text-sm font-bold active:scale-95">
                  Security
                </Link>
              </div>
            </div>
          ))}
        </section>

        <section className="bg-surface-container-lowest rounded-[2rem] p-6 lg:p-8 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <p className="text-on-surface-variant">Need to update spending controls, personal details, or card delivery preferences?</p>
          <div className="flex flex-wrap gap-3">
            <Link href="/settings" className="px-4 py-2 rounded-xl bg-surface-container-high font-bold">Open Settings</Link>
            <Link href="/profile" className="px-4 py-2 rounded-xl bg-surface-container-high font-bold">View Profile</Link>
          </div>
        </section>
      </div>
    </AppShell>
  );
}
