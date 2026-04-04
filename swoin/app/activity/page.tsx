"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import AppShell from "../components/AppShell";
import { useToast } from "../components/ToastProvider";
import { useSession } from "../hooks/useSession";

type Transaction = {
  id: number;
  sender_id: number;
  receiver_id: number;
  sender_email: string;
  receiver_email: string;
  amount: string;
  created_at: string;
};

type Withdrawal = {
  id: number;
  method_label: string;
  amount: string;
  created_at: string;
};

type ActivityItem = {
  key: string;
  type: "sent" | "received" | "cashout";
  label: string;
  amount: string;
  date: string;
  icon: string;
};

export default function ActivityPage() {
  const toast = useToast();
  const router = useRouter();
  const { error } = useSession();
  const [items, setItems] = useState<ActivityItem[]>([]);
  const [filter, setFilter] = useState<"all" | "sent" | "received" | "cashout">("all");
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (error === "Not authenticated") {
      router.replace("/login?next=/activity");
    }
  }, [error, router]);

  useEffect(() => {
    fetch("/api/transactions")
      .then((res) => (res.ok ? res.json() : { transactions: [], withdrawals: [], userId: null }))
      .then((data: { transactions: Transaction[]; withdrawals: Withdrawal[]; userId: number | null }) => {
        const uid = data.userId;
        const txItems: ActivityItem[] = (data.transactions ?? []).map((t) => {
          const isSender = t.sender_id === uid;
          return {
            key: `tx-${t.id}`,
            type: isSender ? "sent" : "received",
            label: isSender ? t.receiver_email : t.sender_email,
            amount: `${isSender ? "-" : "+"}${Number(t.amount).toLocaleString()} USDM`,
            date: t.created_at,
            icon: isSender ? "north_east" : "south_west",
          };
        });
        const wItems: ActivityItem[] = (data.withdrawals ?? []).map((w) => ({
          key: `wd-${w.id}`,
          type: "cashout",
          label: w.method_label,
          amount: `-${Number(w.amount).toLocaleString()} USDM`,
          date: w.created_at,
          icon: "account_balance",
        }));
        const all = [...txItems, ...wItems].sort(
          (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
        );
        setItems(all);
        setLoaded(true);
      })
      .catch(() => setLoaded(true));
  }, []);

  const filtered = items.filter((i) => filter === "all" || i.type === filter);

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) +
      " \u00b7 " +
      d.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
  };

  const typeLabel = (t: ActivityItem["type"]) =>
    t === "sent" ? "Sent" : t === "received" ? "Received" : "Cash Out";

  const typeColor = (t: ActivityItem["type"]) =>
    t === "received" ? "text-tertiary" : "text-on-background";

  const badgeClass = (t: ActivityItem["type"]) =>
    t === "received"
      ? "bg-tertiary/10 text-on-tertiary-fixed-variant"
      : t === "cashout"
      ? "bg-orange-100 text-orange-700"
      : "bg-primary/10 text-primary";

  const iconBg = (t: ActivityItem["type"]) =>
    t === "received" ? "bg-tertiary/10" : t === "cashout" ? "bg-orange-100" : "bg-primary/10";

  const iconColor = (t: ActivityItem["type"]) =>
    t === "received" ? "text-tertiary" : t === "cashout" ? "text-orange-600" : "text-primary";

  return (
    <AppShell>
      <div className="max-w-5xl mx-auto px-6 lg:px-12 py-8">
        <header className="mb-8 animate-fade-in-up">
          <div className="flex items-center gap-4 mb-2 lg:hidden">
            <Link href="/dashboard" className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-surface-container-highest transition-all active:scale-90">
              <span className="material-symbols-outlined text-primary">arrow_back</span>
            </Link>
            <h1 className="text-3xl font-bold font-headline tracking-tight text-on-background">Activity</h1>
          </div>
          <div className="hidden lg:block">
            <h2 className="text-4xl font-headline font-extrabold tracking-tight text-on-background mb-2">Transaction History</h2>
            <p className="text-on-surface-variant">All your USDM activity in one place.</p>
          </div>
        </header>

        {/* Filter tabs */}
        <div className="flex gap-2 mb-8 flex-wrap animate-fade-in-up delay-100">
          {(["all", "sent", "received", "cashout"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-5 py-2 rounded-full font-bold text-sm transition-all capitalize ${
                filter === f
                  ? "bg-primary text-white shadow-md"
                  : "bg-surface-container-low text-secondary hover:bg-surface-container-high active:scale-95"
              }`}
            >
              {f === "cashout" ? "Cash Out" : f}
            </button>
          ))}
        </div>

        {!loaded ? (
          <div className="text-center py-16">
            <span className="material-symbols-outlined text-4xl text-outline-variant animate-spin">progress_activity</span>
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20 animate-fade-in-up delay-200">
            <span className="material-symbols-outlined text-6xl text-outline-variant mb-4">receipt_long</span>
            <p className="text-on-surface-variant font-medium text-lg">No activity yet</p>
            <p className="text-sm text-outline mt-2 mb-8">
              {filter === "all"
                ? "Send, receive, or cash out USDM to see your activity here."
                : filter === "cashout"
                ? "You haven't made any withdrawals yet."
                : filter === "sent"
                ? "You haven't sent any USDM yet."
                : "You haven't received any USDM yet."}
            </p>
            <Link
              href={filter === "cashout" ? "/cashout" : "/send"}
              className="inline-flex items-center gap-2 primary-gradient text-white px-6 py-3 rounded-xl font-bold active:scale-95 transition-all"
            >
              <span className="material-symbols-outlined text-sm">{filter === "cashout" ? "swap_horiz" : "send"}</span>
              {filter === "cashout" ? "Cash Out" : "Send Payment"}
            </Link>
          </div>
        ) : (
          <div className="space-y-4 animate-fade-in-up delay-200">
            {filtered.map((item, i) => (
              <div
                key={item.key}
                className="bg-surface-container-lowest rounded-2xl p-5 flex items-center justify-between hover:bg-surface-container-low transition-colors cursor-pointer animate-fade-in-up"
                style={{ animationDelay: `${(i + 1) * 60}ms` }}
                onClick={() => toast(`Transaction ${item.key}`)}
              >
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${iconBg(item.type)}`}>
                    <span className={`material-symbols-outlined ${iconColor(item.type)}`}>{item.icon}</span>
                  </div>
                  <div>
                    <p className="font-bold text-on-background">{item.label}</p>
                    <p className="text-xs text-on-surface-variant">{formatDate(item.date)}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`font-bold text-lg ${typeColor(item.type)}`}>{item.amount}</p>
                  <span className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full ${badgeClass(item.type)}`}>
                    {typeLabel(item.type)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </AppShell>
  );
}
