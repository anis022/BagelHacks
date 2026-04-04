import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getSessionCookieName, verifySessionToken } from "@/lib/session";
import { getPaymentMethodById, createDeposit } from "@/lib/db";

export async function POST(request: Request) {
  const cookieStore = await cookies();
  const token = cookieStore.get(getSessionCookieName())?.value;
  const session = verifySessionToken(token);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { methodId, amount } = (await request.json()) as {
    methodId?: number;
    amount?: number;
  };

  if (!methodId || !amount || amount <= 0) {
    return NextResponse.json({ error: "methodId and a positive amount are required" }, { status: 400 });
  }

  try {
    const method = await getPaymentMethodById(session.userId, methodId);
    if (!method) {
      return NextResponse.json({ error: "Payment method not found" }, { status: 404 });
    }

    // Directly credit the user's balance and global wallet (sandbox — no real charge)
    await createDeposit(session.userId, amount, method.label, "sandbox-deposit");

    return NextResponse.json({ success: true, paymentId: "sandbox-deposit" });
  } catch (err) {
    console.error("[deposit]", err);
    return NextResponse.json({ error: "Deposit failed" }, { status: 500 });
  }
}
