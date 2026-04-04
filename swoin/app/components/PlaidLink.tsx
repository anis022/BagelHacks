"use client";

import { useState, useEffect, useCallback, useRef } from "react";

declare global {
  interface Window {
    Plaid: {
      create: (config: PlaidLinkOptions) => PlaidLinkHandler;
    };
  }
}

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

interface LinkedAccount {
  accountId: string;
  name: string;
  mask: string;
  type: string;
  subtype: string;
  routing: string | null;
  account: string | null;
  wireRouting: string | null;
}

type Status = "idle" | "script-loading" | "fetching-token" | "ready" | "connecting" | "success" | "error";

const PLAID_SCRIPT_SRC = "https://cdn.plaid.com/link/v2/stable/link-initialize.js";

export default function PlaidLink() {
  const [status, setStatus] = useState<Status>("idle");
  const [accounts, setAccounts] = useState<LinkedAccount[]>([]);
  const [error, setError] = useState<string | null>(null);
  const linkTokenRef = useRef<string | null>(null);
  const handlerRef = useRef<PlaidLinkHandler | null>(null);

  // Load Plaid Link SDK once on mount
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
    if (!token || !window.Plaid) return;

    handlerRef.current?.destroy();
    setStatus("connecting");

    const handler = window.Plaid.create({
      token,
      onSuccess: async (publicToken) => {
        try {
          const res = await fetch("/api/plaid/exchange-token", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ public_token: publicToken }),
          });
          const data = (await res.json()) as { accounts?: LinkedAccount[]; error?: string };
          if (!res.ok) throw new Error(data.error ?? "Failed to link account");
          setAccounts(data.accounts ?? []);
          setStatus("success");
        } catch (err) {
          setError(err instanceof Error ? err.message : "Unexpected error");
          setStatus("error");
        }
      },
      onExit: (err) => {
        if (err?.display_message) setError(err.display_message);
        // Return to ready if user just closed, error state if actual error
        setStatus(err?.error_code ? "error" : "ready");
      },
    });

    handlerRef.current = handler;
    handler.open();
  }, []);

  const reset = useCallback(() => {
    handlerRef.current?.destroy();
    handlerRef.current = null;
    linkTokenRef.current = null;
    setAccounts([]);
    setError(null);
    setStatus("idle");
  }, []);

  const isScriptReady = status !== "script-loading" && status !== "error";

  return (
    <div className="max-w-lg mx-auto p-6 space-y-6">
      <div className="space-y-1">
        <h2 className="text-xl font-headline font-bold text-on-surface">Link Bank Account</h2>
        <p className="text-sm text-on-surface-variant">
          Securely connect your bank via Plaid to retrieve your account and routing numbers.
        </p>
      </div>

      {error && (
        <div
          role="alert"
          className="flex items-start gap-3 rounded-xl border border-error/30 bg-error/10 px-4 py-3 text-sm text-error"
        >
          <svg
            aria-hidden="true"
            className="mt-0.5 h-4 w-4 shrink-0"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z"
            />
          </svg>
          <span>{error}</span>
        </div>
      )}

      {status === "success" && accounts.length > 0 ? (
        <div className="space-y-4">
          {accounts.map((acct) => (
            <div
              key={acct.accountId}
              className="rounded-2xl border border-outline-variant bg-surface-container p-5 space-y-4"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-headline font-semibold text-on-surface">{acct.name}</p>
                  <p className="text-xs text-on-surface-variant capitalize">
                    {acct.subtype} · ••••{acct.mask}
                  </p>
                </div>
                <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary capitalize">
                  {acct.type}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <AccountField label="Routing Number" value={acct.routing} />
                <AccountField label="Account Number" value={acct.account} />
                {acct.wireRouting && (
                  <AccountField label="Wire Routing" value={acct.wireRouting} />
                )}
              </div>
            </div>
          ))}

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
              <Spinner />
              Loading Plaid Link…
            </div>
          )}

          {status === "fetching-token" && (
            <div className="flex items-center justify-center gap-2 rounded-xl bg-surface-container py-3.5 text-sm text-on-surface-variant">
              <Spinner />
              Preparing secure connection…
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
              <Spinner />
              Connecting…
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

function AccountField({ label, value }: { label: string; value: string | null }) {
  const [revealed, setRevealed] = useState(false);

  if (!value) return null;

  return (
    <div className="rounded-xl bg-surface-container-high px-4 py-3 space-y-1">
      <p className="text-xs text-on-surface-variant">{label}</p>
      <div className="flex items-center justify-between gap-2">
        <p className="font-mono text-sm font-semibold text-on-surface tracking-wider">
          {revealed ? value : "•".repeat(value.length)}
        </p>
        <button
          onClick={() => setRevealed((r) => !r)}
          aria-label={revealed ? `Hide ${label}` : `Reveal ${label}`}
          className="shrink-0 text-on-surface-variant hover:text-on-surface transition-colors"
        >
          {revealed ? (
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 0 0 1.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.451 10.451 0 0 1 12 4.5c4.756 0 8.773 3.162 10.065 7.498a10.522 10.522 0 0 1-4.293 5.774M6.228 6.228 3 3m3.228 3.228 3.65 3.65m7.894 7.894L21 21m-3.228-3.228-3.65-3.65m0 0a3 3 0 1 0-4.243-4.243m4.242 4.242L9.88 9.88" />
            </svg>
          ) : (
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
            </svg>
          )}
        </button>
      </div>
    </div>
  );
}

function Spinner() {
  return (
    <svg
      aria-hidden="true"
      className="h-4 w-4 animate-spin"
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
      />
    </svg>
  );
}
