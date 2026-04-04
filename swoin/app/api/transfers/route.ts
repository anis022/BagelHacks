import { NextResponse } from "next/server";
import { createTransfer, listTransfers } from "../../lib/db";
import type { Transfer } from "../../lib/db";

type CreateBody = Omit<Transfer, "id" | "createdAt" | "status"> & { status?: Transfer["status"] };

export async function POST(request: Request) {
  let body: Partial<CreateBody>;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { fromChain, toChain, token, amount, recipient, bridge, bridgeName, fee, receiveAmount } =
    body;

  if (
    !fromChain ||
    !toChain ||
    !token ||
    !amount ||
    !recipient ||
    !bridge ||
    !bridgeName ||
    !fee ||
    !receiveAmount
  ) {
    return NextResponse.json(
      {
        error:
          "Missing required fields: fromChain, toChain, token, amount, recipient, bridge, bridgeName, fee, receiveAmount",
      },
      { status: 400 }
    );
  }

  try {
    const transfer = await createTransfer({
      fromChain,
      toChain,
      token,
      amount,
      recipient,
      bridge,
      bridgeName,
      fee,
      receiveAmount,
      txHash: body.txHash,
      status: body.status ?? "pending",
    });
    return NextResponse.json({ transfer }, { status: 201 });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function GET() {
  try {
    const transfers = await listTransfers();
    return NextResponse.json({ transfers });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
