"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useToast } from "./ToastProvider";

const navItems = [
  { href: "/dashboard", icon: "home", label: "Home" },
  { href: "/review", icon: "account_balance_wallet", label: "Activity" },
  { href: "/cards", icon: "credit_card", label: "Cards" },
  { href: "/settings", icon: "settings", label: "Settings" },
];

export default function BottomNav() {
  const pathname = usePathname();
  const toast = useToast();

  return (
    <nav className="fixed bottom-0 left-0 w-full z-50 flex justify-around items-center px-4 pb-8 pt-3 bg-white/20 backdrop-blur-3xl shadow-[0px_-8px_24px_rgba(11,28,48,0.05)] rounded-t-3xl lg:hidden">
      {navItems.map((item) => {
        const isActive = item.href ? pathname === item.href || pathname.startsWith(item.href + "/") : false;
        const classes = `flex flex-col items-center justify-center transition-all duration-200 ${
          isActive
            ? "text-primary bg-surface-container-highest rounded-xl px-4 py-1 animate-pulse-subtle"
            : "text-secondary opacity-60 hover:opacity-100 active:scale-90"
        }`;

        return (
          <Link key={item.label} href={item.href} className={classes}>
            <span
              className="material-symbols-outlined"
              style={isActive ? { fontVariationSettings: "'FILL' 1" } : undefined}
            >
              {item.icon}
            </span>
            <span className="font-label text-[10px] uppercase tracking-wider font-semibold mt-1">
              {item.label}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
