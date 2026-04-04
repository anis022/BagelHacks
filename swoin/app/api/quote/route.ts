import { NextResponse } from "next/server";
import { getQuotes } from "../../lib/lifi";
import type { QuoteRequest } from "../../lib/lifi";

export async function POST(request: Request) {
  let body: Partial<QuoteRequest>;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { fromChain, toChain, token, amount, fromAddress, toAddress } = body;

  if (!fromChain || !toChain || !token || !amount) {
    return NextResponse.json(
      { error: "Missing required fields: fromChain, toChain, token, amount" },
      { status: 400 }
    );
  }

  try {
    const quotes = await getQuotes({
      fromChain,
      toChain,
      token,
      amount,
      fromAddress,
      toAddress,
    });
    return NextResponse.json({ quotes });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
