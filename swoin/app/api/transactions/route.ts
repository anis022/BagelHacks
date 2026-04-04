import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getSessionCookieName, verifySessionToken } from "@/lib/session";
import { getTransactions, getWithdrawals } from "@/lib/db";

export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(getSessionCookieName())?.value;
    const session = verifySessionToken(token);
    if (!session) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const [transactions, withdrawals] = await Promise.all([
      getTransactions(session.userId),
      getWithdrawals(session.userId),
    ]);

    return NextResponse.json({ transactions, withdrawals, userId: session.userId });
  } catch {
    return NextResponse.json({ error: "Failed to fetch transactions" }, { status: 500 });
  }
}
