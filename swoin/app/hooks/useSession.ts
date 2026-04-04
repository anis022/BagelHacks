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

  useEffect(() => {
    let active = true;
    fetch("/api/auth/session")
      .then(async (res) => {
        if (!res.ok) return null;
        const data = (await res.json()) as { user?: SessionUser };
        return data.user ?? null;
      })
      .then((nextUser) => {
        if (active) {
          setUser(nextUser);
          setError(null);
        }
      })
      .catch((err: unknown) => {
        if (active) {
          setUser(null);
          setError("Unable to verify session");
        }
        console.error("Session fetch failed", err);
      });
    return () => {
      active = false;
    };
  }, []);

  return { user, error };
}
