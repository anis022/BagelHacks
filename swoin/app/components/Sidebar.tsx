"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { href: "/dashboard", icon: "dashboard", label: "Home" },
  { href: "/review", icon: "receipt_long", label: "Activity" },
  { href: "/cards", icon: "credit_card", label: "Payment methods" },
  { href: "/settings", icon: "settings", label: "Settings" },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="h-screen w-64 fixed left-0 top-0 bg-surface-container-low flex-col py-8 px-4 z-50 hidden lg:flex">
      <Link href="/dashboard" className="mb-12 px-2 flex items-center gap-3 group">
        <div className="w-10 h-10 primary-gradient rounded-xl flex items-center justify-center text-white group-hover:shadow-lg group-hover:shadow-primary/30 transition-shadow">
          <span
            className="material-symbols-outlined"
            style={{ fontVariationSettings: "'FILL' 1" }}
          >
            account_balance_wallet
          </span>
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tighter text-on-background font-headline">
            Sovereign
          </h1>
          <p className="text-[10px] uppercase tracking-widest text-secondary font-bold opacity-60">
            Fluid Ledger
          </p>
        </div>
      </Link>

      <nav className="flex-1 space-y-2">
        {navItems.map((item) => {
          const isActive = item.href ? pathname === item.href || pathname.startsWith(item.href + "/") : false;
          const classes = `flex items-center gap-3 px-4 py-3 rounded-xl font-headline tracking-tight transition-all duration-200 ${
            isActive
              ? "text-primary font-bold border-r-4 border-primary bg-surface-container-highest"
              : "text-secondary font-semibold hover:bg-surface-container-highest hover:translate-x-1"
          }`;

          return (
            <Link key={item.label} href={item.href} className={classes}>
              <span
                className="material-symbols-outlined"
                style={isActive ? { fontVariationSettings: "'FILL' 1" } : undefined}
              >
                {item.icon}
              </span>
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto px-2">
        <Link
          href="/send"
          className="w-full primary-gradient text-on-primary py-4 rounded-xl font-headline font-bold text-sm tracking-tight transition-all shadow-lg shadow-primary/20 flex items-center justify-center gap-2 btn-press"
        >
          <span className="material-symbols-outlined text-sm">send</span>
          Send Payment
        </Link>
      </div>
    </aside>
  );
}
