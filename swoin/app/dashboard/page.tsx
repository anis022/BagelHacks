"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import AppShell from "../components/AppShell";
import { useToast } from "../components/ToastProvider";

type SessionUser = {
  id: number;
  email: string;
  balance: string;
};

export default function DashboardPage() {
  const toast = useToast();
  const [user, setUser] = useState<SessionUser | null>(null);

  useEffect(() => {
    let active = true;
    fetch("/api/auth/session")
      .then(async (res) => {
        if (!res.ok) return null;
        const data = (await res.json()) as { user?: SessionUser };
        return data.user ?? null;
      })
      .then((nextUser) => {
        if (active) setUser(nextUser);
      })
      .catch(() => {
        if (active) setUser(null);
      });
    return () => {
      active = false;
    };
  }, []);

  const formattedBalance = useMemo(() => {
    const parsed = Number(user?.balance ?? 0);
    return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(parsed);
  }, [user?.balance]);

  return (
    <AppShell>
      <div className="max-w-7xl mx-auto px-6 lg:px-12 py-8 lg:py-12">
        {/* Hero Balance + Exchange Rates */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-12 animate-fade-in-up">
          {/* Balance Card */}
          <div className="lg:col-span-8 primary-gradient p-10 rounded-[2rem] text-white relative overflow-hidden shadow-[0px_24px_48px_-12px_rgba(11,28,48,0.08)]">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-20 -mt-20" />
            <div className="relative z-10">
              <p className="text-sm font-medium opacity-80 uppercase tracking-widest mb-2">
                Total Balance
              </p>
              <h2 className="text-5xl font-bold font-headline tracking-tight mb-2 animate-count-up">
                {formattedBalance}
              </h2>
              <p className="text-xs opacity-80 mb-4">{user?.email ?? "Loading account..."}</p>
              <span className="inline-flex items-center gap-1 text-sm font-semibold bg-white/20 px-2 py-1 rounded-lg mb-8">
                <span className="material-symbols-outlined text-sm">trending_up</span>
                +2.4%
              </span>
              <div className="flex flex-wrap gap-4 mt-4">
                <Link
                  href="/send"
                  className="flex-1 min-w-[120px] bg-white/20 backdrop-blur-lg hover:bg-white/30 transition-all py-4 rounded-xl flex items-center justify-center gap-2 font-semibold active:scale-95"
                >
                  <span className="material-symbols-outlined">north_east</span>
                  Send
                </Link>
                <button
                  onClick={() => toast("Receive details opened")}
                  className="flex-1 min-w-[120px] bg-white/20 backdrop-blur-lg hover:bg-white/30 transition-all py-4 rounded-xl flex items-center justify-center gap-2 font-semibold active:scale-95"
                >
                  <span className="material-symbols-outlined">south_west</span>
                  Receive
                </button>
                <button
                  onClick={() => toast("Swap opened")}
                  className="flex-1 min-w-[120px] bg-white/20 backdrop-blur-lg hover:bg-white/30 transition-all py-4 rounded-xl flex items-center justify-center gap-2 font-semibold active:scale-95"
                >
                  <span className="material-symbols-outlined">swap_horiz</span>
                  Swap
                </button>
              </div>
            </div>
          </div>

          {/* Exchange Rates */}
          <div className="lg:col-span-4 flex flex-col gap-6">
            <div className="bg-surface-container-low p-6 rounded-[2rem] hover:bg-surface-container-high transition-colors animate-fade-in-up delay-200">
              <div className="flex justify-between items-center mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-surface-container-lowest flex items-center justify-center text-primary font-bold">€</div>
                  <div>
                    <p className="text-sm font-headline font-bold">EUR / USDC</p>
                    <p className="text-xs text-secondary">Euro</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-headline font-bold">0.9242</p>
                  <p className="text-xs text-tertiary font-semibold">+0.04%</p>
                </div>
              </div>
              <div className="h-16 w-full opacity-40 bg-gradient-to-t from-primary/20 to-transparent rounded-b-xl relative">
                <div className="absolute inset-0 flex items-end">
                  <svg className="w-full h-full" preserveAspectRatio="none" viewBox="0 0 100 100">
                    <path className="text-primary" d="M0 80 Q 25 70, 50 85 T 100 60" fill="none" stroke="currentColor" strokeWidth="3" />
                  </svg>
                </div>
              </div>
            </div>
            <div className="bg-surface-container-low p-6 rounded-[2rem] hover:bg-surface-container-high transition-colors animate-fade-in-up delay-300">
              <div className="flex justify-between items-center mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-surface-container-lowest flex items-center justify-center text-primary font-bold">£</div>
                  <div>
                    <p className="text-sm font-headline font-bold">GBP / USDC</p>
                    <p className="text-xs text-secondary">British Pound</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-headline font-bold">0.7841</p>
                  <p className="text-xs text-error font-semibold">-0.12%</p>
                </div>
              </div>
              <div className="h-16 w-full opacity-40 bg-gradient-to-t from-error/10 to-transparent rounded-b-xl relative">
                <div className="absolute inset-0 flex items-end">
                  <svg className="w-full h-full" preserveAspectRatio="none" viewBox="0 0 100 100">
                    <path className="text-error" d="M0 40 Q 20 60, 40 45 T 70 80 T 100 90" fill="none" stroke="currentColor" strokeWidth="3" />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Recent Activity */}
        <section className="bg-surface-container-lowest rounded-[2rem] p-6 lg:p-8 ambient-shadow animate-fade-in-up delay-300">
          <div className="flex justify-between items-center mb-8 lg:mb-10">
            <h3 className="text-xl font-headline font-extrabold tracking-tight">Recent Activity</h3>
            <Link
              href="/review"
              className="text-primary text-sm font-headline font-bold flex items-center gap-1 hover:underline active:scale-95 transition-transform"
            >
              View All
              <span className="material-symbols-outlined text-sm">arrow_forward</span>
            </Link>
          </div>

          {/* Mobile list */}
          <div className="space-y-6 lg:hidden">
            {transactions.map((t, i) => (
              <div
                key={i}
                className="flex items-center justify-between animate-fade-in-up"
                style={{ animationDelay: `${(i + 1) * 100}ms` }}
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-surface-container-highest flex items-center justify-center">
                    <span className="material-symbols-outlined text-primary">{t.icon}</span>
                  </div>
                  <div>
                    <p className="font-bold text-on-surface">{t.name}</p>
                    <p className="text-xs text-on-surface-variant">{t.date}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`font-bold text-lg ${t.amount.startsWith("+") ? "text-tertiary" : "text-on-surface"}`}>
                    {t.amount}
                  </p>
                  <span className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full inline-block ${t.status === "Completed" || t.status === "Settled" ? "text-on-tertiary-fixed-variant bg-tertiary/10" : "text-primary bg-primary/10"}`}>
                    {t.status}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Desktop table */}
          <div className="hidden lg:block overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="text-on-surface-variant/60 font-label text-xs uppercase tracking-[0.15em]">
                  <th className="pb-6 px-4">Recipient / Asset</th>
                  <th className="pb-6 px-4">Date &amp; Time</th>
                  <th className="pb-6 px-4 text-right">Amount</th>
                  <th className="pb-6 px-4 text-center">Status</th>
                  <th className="pb-6 px-4" />
                </tr>
              </thead>
              <tbody className="text-sm">
                {transactions.map((t, i) => (
                  <tr
                    key={i}
                    className="tonal-shift hover:bg-surface-container-low group cursor-pointer animate-fade-in-up"
                    style={{ animationDelay: `${(i + 2) * 100}ms` }}
                    onClick={() => toast("Transaction details opened")}
                  >
                    <td className="py-5 px-4 rounded-l-2xl">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-surface-container flex items-center justify-center overflow-hidden">
                          {t.avatar ? (
                            <img alt="" className="w-full h-full object-cover" src={t.avatar} />
                          ) : (
                            <span className="material-symbols-outlined text-primary">{t.icon}</span>
                          )}
                        </div>
                        <div>
                          <p className="font-bold text-on-background">{t.name}</p>
                          <p className="text-xs text-on-surface-variant">{t.desc}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-5 px-4 text-on-surface-variant font-medium">{t.date}</td>
                    <td className="py-5 px-4 text-right">
                      <p className={`font-bold ${t.amount.startsWith("+") ? "text-tertiary" : "text-on-background"}`}>{t.amount}</p>
                      {t.converted && <p className="text-xs text-on-surface-variant">{t.converted}</p>}
                    </td>
                    <td className="py-5 px-4 text-center">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${t.status === "Processing" ? "bg-primary/10 text-primary" : "bg-tertiary/10 text-on-tertiary-fixed-variant"}`}>
                        {t.status}
                      </span>
                    </td>
                    <td className="py-5 px-4 rounded-r-2xl text-right">
                      <span className="material-symbols-outlined text-outline-variant group-hover:text-primary transition-colors">more_vert</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </AppShell>
  );
}

const transactions = [
  {
    name: "Alice Morgan",
    desc: "Cross-border USDC Transfer",
    icon: "person",
    avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuA13Y4-36pF81fjZWcAss4gKwI895cIJESN-4AYVo3MsVZj2Zt6J0lY1S0MGzFqyQMqHnGtpAvptMBqawLwKxX2JLwjKr2rug83sxVFstduXa1ADDA5xihCY7iAMcU9z924KdaIL8Q2q3NJMKaW4ssZeYXdcUnC_Gr6EpfsJayCYTWUgoTHgBImwzx7Mc8o6yZfvOH8h56PeJBRlkSTGdUk_Dd5dWyuO2hPmB_fQSDtzUc5Ne1di2lhzg85DZFD0EYIqlV9TWDwyaI",
    date: "Oct 24, 2023 · 14:20",
    amount: "-$4,200.00",
    converted: "3,852.14 EUR",
    status: "Completed",
  },
  {
    name: "Self Wallet Top-up",
    desc: "External Bank Wire",
    icon: "account_balance_wallet",
    avatar: "",
    date: "Oct 23, 2023 · 09:45",
    amount: "+$12,000.00",
    converted: "12,000.00 USDC",
    status: "Completed",
  },
  {
    name: "David Lawson",
    desc: "Consulting Fees",
    icon: "person",
    avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuCOOEWyV3HCIn1wexVlAjKUDbeb6_Jwe2DHwWvlCjODKoH_Vy6yJFNmcs8fXqVIcJib8Licw5Q6PiuwkjFCjMWfZsVl6_jK8Gw71dhMaGRPkK4SKGvlWq2X-YEOK3FjlQ1OyrzkSzafj2UoWV8GU7dT8MO3PsTa3-Yk4lx8CHNIrJmNWKXiuB9fvyLulhwKcSN-xyp-91IMndcqj4KI6bslIroxFPUtbySxxLWRUDTmQpwSAglH6QdFc3QTqyvt8Hr0sWnG50NyM0E",
    date: "Oct 22, 2023 · 18:12",
    amount: "-$850.00",
    converted: "668.21 GBP",
    status: "Processing",
  },
  {
    name: "USDC to EUR Swap",
    desc: "In-app conversion",
    icon: "currency_exchange",
    avatar: "",
    date: "Oct 21, 2023 · 11:30",
    amount: "-$1,500.00",
    converted: "1,385.50 EUR",
    status: "Completed",
  },
];
