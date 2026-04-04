"use client";

import Link from "next/link";
import { useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import AppShell from "../components/AppShell";
import { useToast } from "../components/ToastProvider";
import { useSession } from "../hooks/useSession";

export default function ProfilePage() {
  const toast = useToast();
  const router = useRouter();
  const { user, error } = useSession();

  useEffect(() => {
    if (error === "Not authenticated") {
      router.replace("/login?next=/profile");
    }
  }, [error, router]);

  const displayName = useMemo(() => {
    const email = user?.email;
    if (!email) return "Account";
    return email.split("@")[0];
  }, [user?.email]);

  return (
    <AppShell>
      <div className="max-w-5xl mx-auto px-6 lg:px-12 py-8 space-y-8">
        <section className="flex items-center gap-5">
          <div className="w-20 h-20 rounded-3xl bg-primary/10 text-primary flex items-center justify-center">
            <span className="material-symbols-outlined text-4xl">person</span>
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-secondary">Profile</p>
            <h1 className="text-4xl font-headline font-extrabold tracking-tight">{displayName}</h1>
            <p className="text-on-surface-variant">Premium Swoin Account · Verified</p>
          </div>
        </section>

        <section className="bg-surface-container-low rounded-[2rem] p-6 lg:p-8 grid grid-cols-1 md:grid-cols-2 gap-6">
          <ProfileField label="Email" value={user?.email ?? "Loading..."} />
          <ProfileField label="Phone" value="+1 (415) 555-0192" />
          <ProfileField label="Country" value="United States" />
          <ProfileField label="Balance" value={user?.balance ? `${parseFloat(user.balance).toLocaleString(undefined, { minimumFractionDigits: 2 })} USDM` : "0 USDM"} />
        </section>
        {error ? (
          <p className="text-sm text-error font-semibold">{error}</p>
        ) : null}

        <section className="bg-surface-container-lowest rounded-[2rem] p-6 lg:p-8 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <p className="font-bold">Need to update account details?</p>
            <p className="text-sm text-on-surface-variant">Changes are securely reviewed before going live.</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => toast("Profile edit request submitted")}
              className="primary-gradient text-white px-5 py-3 rounded-xl font-bold active:scale-95"
            >
              Request Edit
            </button>
            <Link href="/settings" className="px-5 py-3 rounded-xl bg-surface-container-high font-bold">
              Security Settings
            </Link>
            <Link href="/cards" className="px-5 py-3 rounded-xl bg-surface-container-high font-bold">
              My payment methods
            </Link>
          </div>
        </section>
      </div>
    </AppShell>
  );
}

function ProfileField({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs font-bold uppercase tracking-widest text-secondary mb-2">{label}</p>
      <p className="font-semibold text-on-background">{value}</p>
    </div>
  );
}
