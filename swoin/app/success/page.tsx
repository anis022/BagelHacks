"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { useToast } from "../components/ToastProvider";

function SuccessPageContent() {
  const toast = useToast();
  const searchParams = useSearchParams();
  const amount = searchParams.get("amount") || "$2,450.00";
  const recipient = searchParams.get("recipient") || "Julian Schmidt";
  const handle = searchParams.get("handle") || "@julian.schmidt";

  const copyTxId = async () => {
    try {
      await navigator.clipboard.writeText("SV-9824-LX02");
      toast("Transaction ID copied!");
    } catch {
      toast("SV-9824-LX02");
    }
  };

  const shareReceipt = async () => {
    const shareData = {
      title: "Sovereign Payment Receipt",
      text: `Payment of ${amount} to ${recipient} (${handle}) — Transaction ID: SV-9824-LX02`,
    };
    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(shareData.text);
        toast("Receipt copied to clipboard!");
      }
    } catch {
      // User cancelled share
    }
  };

  return (
    <div className="bg-background min-h-screen flex flex-col items-center justify-center relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute top-20 right-20 w-96 h-96 bg-primary/5 rounded-full blur-[100px]" />
      <div className="absolute bottom-10 left-10 w-64 h-64 bg-tertiary/5 rounded-full blur-[80px]" />
      <div className="fixed top-[-10%] right-[-5%] w-[400px] h-[400px] bg-primary-fixed opacity-10 rounded-full blur-[100px] pointer-events-none" />
      <div className="fixed bottom-[-5%] left-[-10%] w-[300px] h-[300px] bg-tertiary-fixed-dim opacity-5 rounded-full blur-[80px] pointer-events-none" />

      <div className="max-w-2xl w-full px-8 py-12 flex flex-col items-center text-center">
        {/* Success Icon */}
        <div className="mb-10 relative animate-bounce-in">
          <div className="w-32 h-32 rounded-full bg-tertiary/10 flex items-center justify-center">
            <div className="w-24 h-24 rounded-full bg-tertiary flex items-center justify-center shadow-lg shadow-tertiary/20">
              <span
                className="material-symbols-outlined text-white text-6xl"
                style={{ fontVariationSettings: "'FILL' 1, 'wght' 700" }}
              >
                check_circle
              </span>
            </div>
          </div>
          <div className="absolute -top-4 -right-4 w-12 h-12 rounded-xl border border-white/40 flex items-center justify-center text-tertiary shadow-sm bg-white/70 backdrop-blur-xl animate-scale-in delay-300">
            <span className="material-symbols-outlined text-2xl">verified</span>
          </div>
        </div>

        <h2 className="text-4xl lg:text-5xl font-headline font-extrabold tracking-tight text-on-background mb-4 animate-fade-in-up delay-200">
          Payment Sent!
        </h2>
        <p className="text-on-surface-variant text-lg mb-12 max-w-md mx-auto animate-fade-in-up delay-300">
          Your transfer has been successfully processed and is on its way to the recipient.
        </p>

        {/* Transaction Summary */}
        <div className="w-full bg-surface-container-low rounded-[2rem] p-8 mb-12 text-left relative overflow-hidden animate-fade-in-up delay-400">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-50" />
          <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
            <div>
              <span className="text-xs font-bold uppercase tracking-widest text-on-surface-variant/60 block mb-2">Amount Sent</span>
              <h3 className="text-4xl font-headline font-bold text-on-background">{amount}</h3>
            </div>
            <div className="flex items-center gap-4">
              <img
                className="w-12 h-12 rounded-full object-cover"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuBfbDq_20FBw-kwA2XFwPuhD_wvNIfglsWBoSqfneEKzloM3ouBnzLmm6EltNA32kDGY5rjQ2qCx4fKuqM1CsV2ZlDhlZ6sGZvwiKD184ajNrpD0wRHqNWZ7W5J5S2mkd2TIdjZGHbsFxUkTj5CkgrSon5hBccuYb-GoGB6i3qEN3t3f7g_7OKiYYUlhNpaM93uU8s26BbtfsO_e1auW3RJOf1-QXEG75M3TYw-ieTNDSUeHcI5Pp38qdAZFWeUPeu54ker1-yjkxM"
                alt={recipient}
              />
              <div>
                <span className="text-xs font-bold uppercase tracking-widest text-on-surface-variant/60 block mb-1">Recipient</span>
                <p className="font-headline font-bold text-lg">{recipient}</p>
                <p className="text-sm text-on-surface-variant">{handle}</p>
              </div>
            </div>
          </div>

          <div className="h-px bg-outline-variant/20 my-8" />

          <div className="relative z-10 flex flex-col md:flex-row justify-between gap-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-tertiary-container/30 flex items-center justify-center text-tertiary">
                <span className="material-symbols-outlined">task_alt</span>
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant/60 block">Status</span>
                <p className="text-tertiary font-bold">Completed</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-surface-container-highest flex items-center justify-center text-primary">
                <span className="material-symbols-outlined">fingerprint</span>
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant/60 block">Transaction ID</span>
                <div className="flex items-center gap-2">
                  <p className="text-on-background font-mono text-sm">SV-9824-LX02</p>
                  <button
                    onClick={copyTxId}
                    className="text-primary hover:bg-primary/10 p-1 rounded-md transition-colors active:scale-90"
                  >
                    <span className="material-symbols-outlined text-lg">content_copy</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row items-center gap-6 w-full max-w-sm animate-fade-in-up delay-500">
          <Link
            href="/dashboard"
            className="w-full primary-gradient text-on-primary font-headline font-bold py-4 rounded-xl shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all text-center btn-press"
          >
            Done
          </Link>
          <button
            onClick={shareReceipt}
            className="w-full text-primary font-headline font-bold py-4 rounded-xl flex items-center justify-center gap-2 hover:bg-surface-container-high transition-colors active:scale-95"
          >
            <span className="material-symbols-outlined text-xl">ios_share</span>
            Share Receipt
          </button>
        </div>

        <p className="mt-12 text-on-surface-variant/60 text-xs font-medium max-w-xs mx-auto animate-fade-in delay-700">
          A confirmation email has been sent to your registered address. Funds typically arrive within 2-24 hours.
        </p>
      </div>
    </div>
  );
}

export default function SuccessPage() {
  return (
    <Suspense fallback={<div className="bg-background min-h-screen" />}>
      <SuccessPageContent />
    </Suspense>
  );
}
