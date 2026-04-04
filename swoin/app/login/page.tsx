"use client";

import { FormEvent, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";

type Mode = "signin" | "signup";

type AuthResponse = {
  error?: string;
};

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const nextPath = useMemo(() => searchParams.get("next") || "/dashboard", [searchParams]);

  const [mode, setMode] = useState<Mode>("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setError("");

    const endpoint = mode === "signin" ? "/api/auth/signin" : "/api/auth/signup";

    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const payload = (await response.json().catch(() => ({}))) as AuthResponse;
        setError(payload.error ?? "Authentication failed");
        return;
      }

      router.push(nextPath);
      router.refresh();
    } catch {
      setError("Network error, please try again");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="min-h-screen bg-background text-on-background flex items-center justify-center px-6">
      <div className="w-full max-w-md bg-surface-container-low rounded-3xl p-8 ambient-shadow">
        <div className="mb-8">
          <Link href="/" className="text-sm text-primary font-bold hover:underline">
            ← Back
          </Link>
          <h1 className="text-3xl font-headline font-extrabold mt-4">
            {mode === "signin" ? "Log in" : "Create account"}
          </h1>
          <p className="text-sm text-on-surface-variant mt-2">Secure access with persistent session cookies.</p>
        </div>

        <div className="flex rounded-xl bg-surface-container-high p-1 mb-6">
          <button
            onClick={() => setMode("signin")}
            className={`flex-1 py-2 rounded-lg font-bold text-sm ${mode === "signin" ? "bg-primary text-white" : "text-secondary"}`}
            type="button"
          >
            Sign in
          </button>
          <button
            onClick={() => setMode("signup")}
            className={`flex-1 py-2 rounded-lg font-bold text-sm ${mode === "signup" ? "bg-primary text-white" : "text-secondary"}`}
            type="button"
          >
            Sign up
          </button>
        </div>

        <form className="space-y-4" onSubmit={onSubmit}>
          <label className="block">
            <span className="text-xs font-bold uppercase tracking-widest text-secondary">Email</span>
            <input
              autoComplete="email"
              className="mt-2 w-full rounded-xl bg-surface-container-lowest border border-outline-variant/20 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/20"
              onChange={(e) => setEmail(e.target.value)}
              required
              type="email"
              value={email}
            />
          </label>

          <label className="block">
            <span className="text-xs font-bold uppercase tracking-widest text-secondary">Password</span>
            <input
              autoComplete={mode === "signin" ? "current-password" : "new-password"}
              className="mt-2 w-full rounded-xl bg-surface-container-lowest border border-outline-variant/20 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/20"
              minLength={8}
              onChange={(e) => setPassword(e.target.value)}
              required
              type="password"
              value={password}
            />
          </label>

          {error ? <p className="text-sm text-error font-semibold">{error}</p> : null}

          <button
            className="w-full primary-gradient text-white py-3 rounded-xl font-bold disabled:opacity-60"
            disabled={submitting}
            type="submit"
          >
            {submitting ? "Please wait..." : mode === "signin" ? "Log in" : "Create account"}
          </button>
        </form>
      </div>
    </main>
  );
}
