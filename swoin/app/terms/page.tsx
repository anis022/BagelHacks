"use client";

import Link from "next/link";
import AppShell from "../components/AppShell";

export default function TermsPage() {
  return (
    <AppShell>
      <div className="max-w-4xl mx-auto px-6 lg:px-12 py-8 space-y-8">
        <section>
          <p className="text-xs font-bold uppercase tracking-widest text-secondary">Legal</p>
          <h1 className="text-4xl font-headline font-extrabold tracking-tight">Terms &amp; Conditions</h1>
          <p className="text-sm text-on-surface-variant mt-2">
            These terms govern use of Swoin payment services across supported regions.
          </p>
        </section>

        <section className="bg-surface-container-low rounded-[2rem] p-6 lg:p-8 space-y-5">
          <article>
            <h2 className="font-bold text-lg">Service scope</h2>
            <p className="text-sm text-on-surface-variant mt-1">
              You may use this account for lawful payments, transfers, and payment methods management.
            </p>
          </article>
          <article>
            <h2 className="font-bold text-lg">Security responsibilities</h2>
            <p className="text-sm text-on-surface-variant mt-1">
              Keep credentials private and notify support immediately for suspicious account activity.
            </p>
          </article>
          <article>
            <h2 className="font-bold text-lg">Fees and settlement</h2>
            <p className="text-sm text-on-surface-variant mt-1">
              Settlement times and fees may vary by corridor, network, and regulatory requirements.
            </p>
          </article>
          <article>
            <h2 className="font-bold text-lg">Compliance</h2>
            <p className="text-sm text-on-surface-variant mt-1">
              We may request additional verification to comply with applicable laws and sanctions controls.
            </p>
          </article>
        </section>

        <section className="flex flex-wrap gap-3">
          <Link href="/review" className="px-4 py-2 rounded-xl bg-surface-container-high font-bold">
            Back to review
          </Link>
          <Link href="/dashboard" className="px-4 py-2 rounded-xl bg-surface-container-high font-bold">
            Go to dashboard
          </Link>
        </section>
      </div>
    </AppShell>
  );
}
