"use client";

import { useEffect, useState } from "react";

export type SessionUser = {
  id: number;
  email: string;
  balance: string;
};

export function useSession() {
  const [user, setUser] = useState<SessionUser | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [fetchCount, setFetchCount] = useState(0);

  useEffect(() => {
    let active = true;
    fetch("/api/auth/session")
      .then(async (res) => {
        if (res.status === 401) {
          return { user: null, error: "Not authenticated" };
        }
        if (!res.ok) {
          return { user: null, error: "Session check failed" };
        }
        const data = (await res.json()) as { user?: SessionUser };
        return { user: data.user ?? null, error: null };
      })
      .then((result) => {
        if (active) {
          setUser(result.user);
          setError(result.error);
        }
      })
      .catch((err: unknown) => {
        if (active) {
          setUser(null);
          setError("Network error while checking session");
        }
        console.error("Session fetch failed", err);
      });
    return () => {
      active = false;
    };
  }, [fetchCount]);

  const refetch = () => setFetchCount((c) => c + 1);

  return { user, error, refetch };
}
