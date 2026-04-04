import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getSessionCookieName, verifySessionToken } from "@/lib/session";
import { getPaymentMethods, createWithdrawal } from "@/lib/db";

export async function POST(request: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(getSessionCookieName())?.value;
    const session = verifySessionToken(token);
    if (!session) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const { methodId, amount } = (await request.json()) as {
      methodId?: number;
      amount?: number;
    };

    if (!methodId || !amount || amount <= 0) {
      return NextResponse.json({ error: "Invalid withdrawal" }, { status: 400 });
    }

    const methods = await getPaymentMethods(session.userId);
    const method = methods.find((m) => m.id === methodId);
    if (!method) {
      return NextResponse.json({ error: "Payment method not found" }, { status: 404 });
    }

    const result = await createWithdrawal(session.userId, methodId, method.label, amount);
    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Withdrawal failed" }, { status: 500 });
  }
}
