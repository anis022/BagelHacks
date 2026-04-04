"use client";

import Link from "next/link";
import { useState } from "react";
import AppShell from "../components/AppShell";
import { useToast } from "../components/ToastProvider";

export default function SettingsPage() {
  const toast = useToast();
  const [notifications, setNotifications] = useState(true);
  const [biometrics, setBiometrics] = useState(true);

  return (
    <AppShell>
      <div className="max-w-5xl mx-auto px-6 lg:px-12 py-8 space-y-8">
        <section>
          <p className="text-xs font-bold uppercase tracking-widest text-secondary">Settings</p>
          <h1 className="text-4xl font-headline font-extrabold tracking-tight">Preferences & Security</h1>
        </section>

        <section className="bg-surface-container-low rounded-[2rem] p-6 lg:p-8 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-bold text-lg">Push Notifications</h2>
              <p className="text-sm text-on-surface-variant">Receive transfer, card, and security updates.</p>
            </div>
            <button
              onClick={() => setNotifications((v) => !v)}
              role="switch"
              aria-checked={notifications}
              aria-label="Toggle push notifications"
              className={`px-4 py-2 rounded-xl font-bold ${notifications ? "bg-tertiary/10 text-on-tertiary-fixed-variant" : "bg-surface-container-high text-secondary"}`}
            >
              {notifications ? "Enabled" : "Disabled"}
            </button>
          </div>

          <div className="h-px bg-outline-variant/20" />

          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-bold text-lg">Biometric Sign-in</h2>
              <p className="text-sm text-on-surface-variant">Require biometrics for payment confirmation.</p>
            </div>
            <button
              onClick={() => setBiometrics((v) => !v)}
              role="switch"
              aria-checked={biometrics}
              aria-label="Toggle biometric sign-in"
              className={`px-4 py-2 rounded-xl font-bold ${biometrics ? "bg-tertiary/10 text-on-tertiary-fixed-variant" : "bg-surface-container-high text-secondary"}`}
            >
              {biometrics ? "Enabled" : "Disabled"}
            </button>
          </div>

          <div className="h-px bg-outline-variant/20" />

          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-bold text-lg">Two-factor Recovery</h2>
              <p className="text-sm text-on-surface-variant">Manage your backup verification methods.</p>
            </div>
            <button
              onClick={() => toast("Recovery methods updated")}
              className="px-4 py-2 rounded-xl bg-surface-container-high font-bold active:scale-95"
            >
              Configure
            </button>
          </div>
        </section>

        <section className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <Link href="/cards" className="bg-surface-container-lowest rounded-2xl p-5 hover:bg-surface-container-low transition-colors">
            <p className="font-bold">Manage payment methods</p>
            <p className="text-sm text-on-surface-variant mt-1">Freeze cards, limits, and spending controls.</p>
          </Link>
          <Link href="/profile" className="bg-surface-container-lowest rounded-2xl p-5 hover:bg-surface-container-low transition-colors">
            <p className="font-bold">Profile Details</p>
            <p className="text-sm text-on-surface-variant mt-1">Personal data, account identity, and preferences.</p>
          </Link>
        </section>
      </div>
    </AppShell>
  );
}
