"use client";

import { useState, useEffect, useCallback, useRef } from "react";

interface PlaidLinkOptions {
  token: string;
  onSuccess: (publicToken: string, metadata: unknown) => void;
  onExit: (err: PlaidExitError | null, metadata: unknown) => void;
  onEvent?: (eventName: string, metadata: unknown) => void;
}

interface PlaidLinkHandler {
  open: () => void;
  destroy: () => void;
}

interface PlaidExitError {
  display_message: string | null;
  error_code: string | null;
}

interface PlaidFactory {
  create: (config: PlaidLinkOptions) => PlaidLinkHandler;
}

function getPlaid(): PlaidFactory | undefined {
  return (window as unknown as { Plaid?: PlaidFactory }).Plaid;
}

type Status = "idle" | "script-loading" | "fetching-token" | "ready" | "connecting" | "saving" | "success" | "error";

const PLAID_SCRIPT_SRC = "https://cdn.plaid.com/link/v2/stable/link-initialize.js";

export default function PlaidLink({ onLinked }: { onLinked?: () => void }) {
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState<string | null>(null);
  const [linkedCount, setLinkedCount] = useState(0);
  const linkTokenRef = useRef<string | null>(null);
  const handlerRef = useRef<PlaidLinkHandler | null>(null);

  useEffect(() => {
    if (document.querySelector(`script[src="${PLAID_SCRIPT_SRC}"]`)) {
      setStatus("idle");
      return;
    }
    setStatus("script-loading");
    const script = document.createElement("script");
    script.src = PLAID_SCRIPT_SRC;
    script.async = true;
    script.onload = () => setStatus("idle");
    script.onerror = () => {
      setError("Failed to load Plaid Link. Check your network connection.");
      setStatus("error");
    };
    document.head.appendChild(script);

    return () => {
      handlerRef.current?.destroy();
    };
  }, []);

  const fetchLinkToken = useCallback(async () => {
    setStatus("fetching-token");
    setError(null);
    try {
      const res = await fetch("/api/plaid/link-token", { method: "POST" });
      const data = (await res.json()) as { link_token?: string; error?: string };
      if (!res.ok) throw new Error(data.error ?? "Failed to create link token");
      linkTokenRef.current = data.link_token!;
      setStatus("ready");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unexpected error");
      setStatus("error");
    }
  }, []);

  const openLink = useCallback(() => {
    const token = linkTokenRef.current;
    const plaid = getPlaid();
    if (!token || !plaid) return;

    handlerRef.current?.destroy();
    setStatus("connecting");

    const handler = plaid.create({
      token,
      onSuccess: async (publicToken) => {
        setStatus("saving");
        try {
          const res = await fetch("/api/plaid/exchange-token", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ public_token: publicToken }),
          });
          const data = (await res.json()) as { accounts?: unknown[]; error?: string };
          if (!res.ok) throw new Error(data.error ?? "Failed to link account");
          setLinkedCount(data.accounts?.length ?? 0);
          setStatus("success");
          onLinked?.();
        } catch (err) {
          setError(err instanceof Error ? err.message : "Unexpected error");
          setStatus("error");
        }
      },
      onExit: (err) => {
        if (err?.display_message) setError(err.display_message);
        setStatus(err?.error_code ? "error" : "ready");
      },
    });

    handlerRef.current = handler;
    handler.open();
  }, [onLinked]);

  const reset = useCallback(() => {
    handlerRef.current?.destroy();
    handlerRef.current = null;
    linkTokenRef.current = null;
    setLinkedCount(0);
    setError(null);
    setStatus("idle");
  }, []);

  const isScriptReady = status !== "script-loading" && status !== "error";

  return (
    <div className="max-w-lg mx-auto p-6 space-y-6">
      <div className="space-y-1">
        <h2 className="text-xl font-headline font-bold text-on-surface">Link Bank Account</h2>
        <p className="text-sm text-on-surface-variant">
          Securely connect your bank via Plaid to add it as a payment method.
        </p>
      </div>

      {error && (
        <div
          role="alert"
          className="flex items-start gap-3 rounded-xl border border-error/30 bg-error/10 px-4 py-3 text-sm text-error"
        >
          <span className="material-symbols-outlined text-lg mt-0.5">warning</span>
          <span>{error}</span>
        </div>
      )}

      {status === "success" ? (
        <div className="text-center py-6 space-y-4">
          <div className="w-16 h-16 rounded-full bg-tertiary/10 flex items-center justify-center mx-auto">
            <span className="material-symbols-outlined text-tertiary text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
          </div>
          <div>
            <p className="font-headline font-bold text-lg text-on-surface">
              {linkedCount} account{linkedCount !== 1 ? "s" : ""} linked!
            </p>
            <p className="text-sm text-on-surface-variant mt-1">
              Your payment method has been saved and is ready to use.
            </p>
          </div>
          <button
            onClick={reset}
            className="w-full rounded-xl border border-outline-variant py-3 text-sm font-semibold text-on-surface-variant hover:bg-surface-container-high transition-colors"
          >
            Link Another Account
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {status === "idle" && (
            <button
              onClick={fetchLinkToken}
              disabled={!isScriptReady}
              className="w-full rounded-xl bg-primary py-3.5 text-sm font-semibold text-on-primary shadow hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Connect Bank Account
            </button>
          )}

          {status === "script-loading" && (
            <div className="flex items-center justify-center gap-2 rounded-xl bg-surface-container py-3.5 text-sm text-on-surface-variant">
              <span className="material-symbols-outlined animate-spin text-lg">progress_activity</span>
              Loading Plaid Link...
            </div>
          )}

          {status === "fetching-token" && (
            <div className="flex items-center justify-center gap-2 rounded-xl bg-surface-container py-3.5 text-sm text-on-surface-variant">
              <span className="material-symbols-outlined animate-spin text-lg">progress_activity</span>
              Preparing secure connection...
            </div>
          )}

          {status === "ready" && (
            <button
              onClick={openLink}
              className="w-full rounded-xl bg-primary py-3.5 text-sm font-semibold text-on-primary shadow hover:bg-primary/90 transition-colors"
            >
              Open Plaid Link
            </button>
          )}

          {status === "connecting" && (
            <div className="flex items-center justify-center gap-2 rounded-xl bg-surface-container py-3.5 text-sm text-on-surface-variant">
              <span className="material-symbols-outlined animate-spin text-lg">progress_activity</span>
              Connecting...
            </div>
          )}

          {status === "saving" && (
            <div className="flex items-center justify-center gap-2 rounded-xl bg-surface-container py-3.5 text-sm text-on-surface-variant">
              <span className="material-symbols-outlined animate-spin text-lg">progress_activity</span>
              Saving payment method...
            </div>
          )}

          {status === "error" && (
            <button
              onClick={reset}
              className="w-full rounded-xl border border-outline-variant py-3.5 text-sm font-semibold text-on-surface-variant hover:bg-surface-container transition-colors"
            >
              Try Again
            </button>
          )}
        </div>
      )}

      <p className="text-center text-xs text-on-surface-variant">
        Your credentials are never stored. Powered by{" "}
        <span className="font-semibold">Plaid</span>.
      </p>
    </div>
  );
}
