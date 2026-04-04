"use client";

import Link from "next/link";
import { useState } from "react";
import { useToast } from "./ToastProvider";

export default function TopBar() {
  const [notifOpen, setNotifOpen] = useState(false);
  const toast = useToast();

  return (
    <header className="fixed top-0 right-0 w-full lg:w-[calc(100%-16rem)] h-16 bg-background flex justify-between items-center px-6 lg:px-12 z-40">
      {/* Mobile: Logo */}
      <Link href="/dashboard" className="flex items-center gap-4 lg:hidden">
        <div className="w-10 h-10 rounded-full overflow-hidden bg-surface-container-high">
          <img
            alt="User profile"
            className="w-full h-full object-cover"
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuAG-z5Ofa2W5sEHuCng6phtzLMCh-uvZ5aFlFFvljbWuj52ps06Vw5qZoAzQk3l3p8rLziNXuY3DbNNelq5pWITsS-23cTthCd14tLTtoFsaNVUOtELHXL6tTTNTBN5RVyDFKzVyqyCGfQGfPuvtoPf47xT2c3EfW6ciB9wb1UGCI8JgK1Vgy3ka_zItOFtJgwRMmkX-Camh9-GD1Z5OqWMACzb-X4kEoDRjJ3uhLRbmGDeKlf-gM6pGmlFyxpM83awq9UJ6h04_bo"
          />
        </div>
        <h1 className="text-xl font-bold text-on-background font-headline">Sovereign</h1>
      </Link>

      {/* Desktop: Search */}
      <div className="hidden lg:flex items-center gap-4 bg-surface-container-low px-4 py-2 rounded-full w-96 group focus-within:ring-2 focus-within:ring-primary/20 transition-all">
        <span className="material-symbols-outlined text-secondary">search</span>
        <input
          className="bg-transparent border-none focus:ring-0 focus:outline-none text-sm font-medium w-full placeholder:text-secondary/60"
          placeholder="Search transactions, assets..."
          type="text"
          onKeyDown={(e) => {
            if (e.key === "Enter") toast("Search — Coming soon");
          }}
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
              <span className="absolute top-0 right-0 w-2 h-2 bg-error rounded-full animate-pulse" />
            </button>

            {/* Notification dropdown */}
            {notifOpen && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setNotifOpen(false)} />
                <div className="absolute right-0 top-12 w-80 bg-surface-container-lowest rounded-2xl shadow-2xl border border-outline-variant/10 z-50 animate-scale-in overflow-hidden">
                  <div className="p-4 border-b border-surface-container-low">
                    <h3 className="font-headline font-bold text-sm">Notifications</h3>
                  </div>
                  <div className="divide-y divide-surface-container-low">
                    <div className="p-4 hover:bg-surface-container-low transition-colors cursor-pointer">
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 rounded-full bg-tertiary/10 flex items-center justify-center shrink-0 mt-0.5">
                          <span className="material-symbols-outlined text-tertiary text-sm">check_circle</span>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-on-surface">Payment received</p>
                          <p className="text-xs text-on-surface-variant">+$450.00 from Sarah Mitchell</p>
                          <p className="text-[10px] text-outline mt-1">2 hours ago</p>
                        </div>
                      </div>
                    </div>
                    <div className="p-4 hover:bg-surface-container-low transition-colors cursor-pointer">
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                          <span className="material-symbols-outlined text-primary text-sm">currency_exchange</span>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-on-surface">Exchange rate alert</p>
                          <p className="text-xs text-on-surface-variant">EUR/USDC is up +0.12% today</p>
                          <p className="text-[10px] text-outline mt-1">5 hours ago</p>
                        </div>
                      </div>
                    </div>
                    <div className="p-4 hover:bg-surface-container-low transition-colors cursor-pointer">
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 rounded-full bg-surface-container-highest flex items-center justify-center shrink-0 mt-0.5">
                          <span className="material-symbols-outlined text-secondary text-sm">security</span>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-on-surface">Security update</p>
                          <p className="text-xs text-on-surface-variant">2FA has been enabled on your account</p>
                          <p className="text-[10px] text-outline mt-1">1 day ago</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="p-3 border-t border-surface-container-low">
                    <button
                      onClick={() => { setNotifOpen(false); toast("All notifications — Coming soon"); }}
                      className="w-full text-center text-primary text-xs font-bold hover:underline"
                    >
                      View all notifications
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
          <button
            onClick={() => toast("Help center — Coming soon")}
            className="hidden lg:block text-secondary hover:text-primary transition-colors"
          >
            <span className="material-symbols-outlined">help_outline</span>
          </button>
        </div>
        <div className="hidden lg:block h-8 w-px bg-outline-variant/30" />
        <Link
          href="/profile"
          className="hidden lg:flex items-center gap-3 group"
        >
          <span className="text-sm font-headline font-bold text-secondary group-hover:text-primary transition-colors">
            Profile
          </span>
          <img
            alt="User profile photo"
            className="w-8 h-8 rounded-full object-cover ring-2 ring-transparent group-hover:ring-primary/30 transition-all"
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuD7laqlxI9qFopTzyzkoehzFB4QZPEbcnSs9PIcAFaL0qTYaqBqN1s-yPWGT_cVzalJ_EgmB4je9ozTl3icEegg0q-KYqs3V1mZMk0q2L80p961O9s5DRtwU4O91JSYZTEoIzYMuFP0uZ1sYChDhKjY1Q0axYJZ3-_N2qNIKOX61wF4Nd5-j6ow9hA8MxAqut3g0w4Q84FWzcAS4HTZ1sWM4dxjcz_FT1keyWhvnz1hfUD9JRNOyje0pLpIAjFYwOU6ZfDmKO_oFYU"
          />
        </Link>
      </div>
    </header>
  );
}
