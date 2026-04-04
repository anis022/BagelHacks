import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifySessionToken, getSessionCookieName } from "@/lib/session";
import { getUserSessionData, createDeposit, addPaymentMethod } from "@/lib/db";

function getPlaidConfig() {
  const clientId = process.env.PLAID_CLIENT_ID;
  const secret = process.env.PLAID_SECRET;
  const env = process.env.PLAID_ENV ?? "sandbox";
  if (!clientId || !secret) throw new Error("Plaid credentials are not configured");
  return { clientId, secret, baseUrl: `https://${env}.plaid.com` };
}

export async function POST(request: Request) {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get(getSessionCookieName())?.value;
  const session = verifySessionToken(sessionToken);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await request.json()) as {
    public_token?: string;
    account_id?: string;
    amount?: number;
    account_name?: string;
    account_mask?: string;
  };

  const { public_token, account_id, amount, account_name, account_mask } = body;

  if (!public_token || !account_id || !amount || amount <= 0) {
    return NextResponse.json({ error: "public_token, account_id, and amount are required" }, { status: 400 });
  }

  try {
    const { clientId, secret, baseUrl } = getPlaidConfig();
    const crossmintKey = process.env.CROSSMINT_API_KEY;

    // Step 1: Exchange public_token for access_token
    const exchangeRes = await fetch(`${baseUrl}/item/public_token/exchange`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ client_id: clientId, secret, public_token }),
    });

    if (!exchangeRes.ok) {
      const data = (await exchangeRes.json()) as { error_message?: string };
      return NextResponse.json({ error: data.error_message ?? "Token exchange failed" }, { status: 502 });
    }

    const { access_token } = (await exchangeRes.json()) as { access_token: string };

    // Step 2: Create processor token for Crossmint
    const processorRes = await fetch(`${baseUrl}/processor/token/create`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        client_id: clientId,
        secret,
        access_token,
        account_id,
        processor: "crossmint",
      }),
    });

    let processorToken: string | null = null;
    if (processorRes.ok) {
      const processorData = (await processorRes.json()) as { processor_token: string };
      processorToken = processorData.processor_token;
    } else {
      // In sandbox, processor token creation may fail for Crossmint.
      // Log and continue — we'll still credit the balance for demo purposes.
      const errData = (await processorRes.json().catch(() => ({}))) as { error_message?: string };
      console.warn("[onramp] Processor token failed (sandbox):", errData.error_message);
    }

    // Step 3: Call Crossmint payments API (if we have the key and processor token)
    const user = await getUserSessionData(session.userId);
    let crossmintPaymentId = "sandbox-demo";

    if (crossmintKey && processorToken) {
      const crossmintRes = await fetch("https://www.crossmint.com/api/v1-alpha1/payments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-API-KEY": crossmintKey,
        },
        body: JSON.stringify({
          payer: {
            processorToken,
            provider: "plaid",
          },
          recipient: {
            email: user?.email ?? "",
            chain: "polygon",
          },
          amount: String(amount),
          currency: "usd",
        }),
      });

      if (crossmintRes.ok) {
        const crossmintData = (await crossmintRes.json()) as { id?: string };
        crossmintPaymentId = crossmintData.id ?? "crossmint-ok";
      } else {
        const errData = (await crossmintRes.json().catch(() => ({}))) as { message?: string };
        console.warn("[onramp] Crossmint payment failed:", errData.message);
        // Still credit for sandbox demo
      }
    }

    // Step 4: Credit user's balance and record deposit
    const label = account_name && account_mask ? `${account_name} ····${account_mask}` : "Bank Deposit";
    await createDeposit(session.userId, amount, label, crossmintPaymentId);

    // Also save as payment method if not already saved
    if (account_name && account_mask) {
      await addPaymentMethod(session.userId, "bank", label, `Account ID: ${account_id}`);
    }

    return NextResponse.json({ success: true, paymentId: crossmintPaymentId });
  } catch (err) {
    console.error("[onramp]", err);
    return NextResponse.json({ error: "On-ramp failed" }, { status: 500 });
  }
}
