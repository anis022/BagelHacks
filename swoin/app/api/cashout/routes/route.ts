import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getSessionCookieName, verifySessionToken } from "@/lib/session";
import { optimize } from "@/lib/optimizer";

export async function POST(request: Request) {
  const cookieStore = await cookies();
  const token = cookieStore.get(getSessionCookieName())?.value;
  const session = verifySessionToken(token);
  if (!session) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const { amount, toCurrency = "USD", mode = "balanced" } = (await request.json()) as {
    amount?: number;
    toCurrency?: string;
    mode?: string;
  };

  if (!amount || amount <= 0) {
    return NextResponse.json({ error: "Invalid amount" }, { status: 400 });
  }

  try {
    // USDM is pegged 1:1 to USDC in Swoin's global wallet
    const result = await optimize({
      fromCurrency: "USDC",
      toCurrency,
      amount,
      mode,
      maxHops: 4,
      topK: 3,
    });

    return NextResponse.json(result);
  } catch (err) {
    console.error("[cashout/routes]", err);
    return NextResponse.json({ error: "Failed to find routes" }, { status: 500 });
  }
}
