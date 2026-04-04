import { NextResponse } from "next/server";
import { getTransfer, updateTransfer } from "../../../../lib/db";
import { getTxStatus } from "../../../../lib/lifi";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    const transfer = await getTransfer(id);

    if (!transfer) {
      return NextResponse.json({ error: "Transfer not found" }, { status: 404 });
    }

    if (!transfer.txHash) {
      return NextResponse.json({ transfer });
    }

    try {
      const liveStatus = await getTxStatus(
        transfer.txHash,
        transfer.bridge,
        transfer.fromChain,
        transfer.toChain
      );

      // Sync DB status with live status
      let dbStatus = transfer.status;
      if (liveStatus.status === "DONE") dbStatus = "complete";
      else if (liveStatus.status === "FAILED") dbStatus = "failed";
      else if (liveStatus.status === "PENDING") dbStatus = "processing";

      if (dbStatus !== transfer.status) {
        await updateTransfer(id, { status: dbStatus });
        transfer.status = dbStatus;
      }

      return NextResponse.json({ transfer, liveStatus });
    } catch (statusErr) {
      // Return transfer even if live status fails
      console.error("getTxStatus failed:", statusErr);
      return NextResponse.json({ transfer });
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
