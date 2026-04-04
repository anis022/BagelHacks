"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "./ToastProvider";

type Transaction = {
  id: number;
  sender_id: number;
  receiver_id: number;
  sender_email: string;
  receiver_email: string;
  amount: string;
  created_at: string;
};

export default function TopBar() {
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifications, setNotifications] = useState<Transaction[]>([]);
  const [userId, setUserId] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const toast = useToast();
  const router = useRouter();

  useEffect(() => {
    fetch("/api/transactions")
      .then((res) => (res.ok ? res.json() : { transactions: [], userId: null }))
      .then((data: { transactions: Transaction[]; userId: number | null }) => {
        setNotifications((data.transactions ?? []).slice(0, 5));
        setUserId(data.userId);
      })
      .catch(() => {});
  }, []);

  const handleSignOut = async () => {
    try {
      const response = await fetch("/api/auth/signout", { method: "POST" });
      if (!response.ok) {
        toast("Sign out failed");
        return;
      }
      window.location.href = "/login";
    } catch {
      toast("Sign out failed");
    }
  };

  const handleSearch = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && searchQuery.trim()) {
      router.push(`/activity`);
      toast(`Searching: ${searchQuery}`);
    }
  };

  const formatNotifTime = (dateStr: string) => {
    const d = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays}d ago`;
  };

  const hasNotifs = notifications.length > 0;

  return (
    <header className="fixed top-0 right-0 w-full lg:w-[calc(100%-16rem)] h-16 bg-background flex justify-between items-center px-6 lg:px-12 z-40">
      {/* Mobile: Logo */}
      <Link href="/dashboard" className="flex items-center gap-4 lg:hidden">
        <div className="w-10 h-10 primary-gradient rounded-xl flex items-center justify-center text-white">
          <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>account_balance_wallet</span>
        </div>
        <h1 className="text-xl font-bold text-on-background font-headline">Swoin</h1>
      </Link>

      {/* Desktop: Search */}
      <div className="hidden lg:flex items-center gap-4 bg-surface-container-low px-4 py-2 rounded-full w-96 group focus-within:ring-2 focus-within:ring-primary/20 transition-all">
        <span className="material-symbols-outlined text-secondary">search</span>
        <input
          className="bg-transparent border-none focus:ring-0 focus:outline-none text-sm font-medium w-full placeholder:text-secondary/60"
          placeholder="Search transactions..."
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyDown={handleSearch}
        />
      </div>

      <div className="flex items-center gap-6">
        <div className="flex items-center gap-4">
          {/* Notification bell */}
          <div className="relative">
            <button
              onClick={() => setNotifOpen(!notifOpen)}
              className="text-secondary hover:text-primary transition-colors relative"
            >
              <span className="material-symbols-outlined">notifications</span>
              {hasNotifs && (
                <span className="absolute top-0 right-0 w-2 h-2 bg-error rounded-full animate-pulse" />
              )}
            </button>

            {/* Notification dropdown */}
            {notifOpen && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setNotifOpen(false)} />
                <div className="absolute right-0 top-12 w-80 bg-surface-container-lowest rounded-2xl shadow-2xl border border-outline-variant/10 z-50 animate-scale-in overflow-hidden">
                  <div className="p-4 border-b border-surface-container-low">
                    <h3 className="font-headline font-bold text-sm">Notifications</h3>
                  </div>
                  {notifications.length === 0 ? (
                    <div className="p-6 text-center">
                      <p className="text-sm text-on-surface-variant">No notifications yet</p>
                    </div>
                  ) : (
                    <div className="divide-y divide-surface-container-low max-h-80 overflow-y-auto">
                      {notifications.map((t) => {
                        const isSender = t.sender_id === userId;
                        const otherEmail = isSender ? t.receiver_email : t.sender_email;
                        const amountNum = Number(t.amount);

                        return (
                          <div key={t.id} className="p-4 hover:bg-surface-container-low transition-colors cursor-pointer">
                            <div className="flex items-start gap-3">
                              <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${isSender ? "bg-primary/10" : "bg-tertiary/10"}`}>
                                <span className={`material-symbols-outlined text-sm ${isSender ? "text-primary" : "text-tertiary"}`}>
                                  {isSender ? "north_east" : "south_west"}
                                </span>
                              </div>
                              <div>
                                <p className="text-sm font-medium text-on-surface">
                                  {isSender ? "Payment sent" : "Payment received"}
                                </p>
                                <p className="text-xs text-on-surface-variant">
                                  {isSender
                                    ? `-${amountNum.toLocaleString()} USDM to ${otherEmail}`
                                    : `+${amountNum.toLocaleString()} USDM from ${otherEmail}`}
                                </p>
                                <p className="text-[10px] text-outline mt-1">{formatNotifTime(t.created_at)}</p>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                  <div className="p-3 border-t border-surface-container-low">
                    <Link
                      href="/activity"
                      onClick={() => setNotifOpen(false)}
                      className="w-full text-center text-primary text-xs font-bold hover:underline block"
                    >
                      View all activity
                    </Link>
                  </div>
                </div>
              </>
            )}
          </div>
          <button
            onClick={() => toast("Help center opened")}
            className="hidden lg:block text-secondary hover:text-primary transition-colors"
          >
            <span className="material-symbols-outlined">help_outline</span>
          </button>
        </div>
        <div className="hidden lg:block h-8 w-px bg-outline-variant/30" />
        <div className="hidden lg:flex items-center gap-3 group">
          <button
            onClick={handleSignOut}
            className="text-xs font-bold text-secondary hover:text-primary transition-colors"
          >
            Sign out
          </button>
        </div>
        <Link href="/profile" className="hidden lg:flex items-center gap-3 group">
          <span className="text-sm font-headline font-bold text-secondary group-hover:text-primary transition-colors">
            Profile
          </span>
          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center ring-2 ring-transparent group-hover:ring-primary/30 transition-all">
            <span className="material-symbols-outlined text-primary text-lg">person</span>
          </div>
        </Link>
      </div>
    </header>
  );
}
