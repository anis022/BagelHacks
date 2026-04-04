import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifySessionToken, getSessionCookieName } from "@/lib/session";

interface PlaidAccount {
  account_id: string;
  name: string;
  mask: string;
  type: string;
  subtype: string;
}

interface PlaidAchNumber {
  account_id: string;
  routing: string;
  account: string;
  wire_routing: string | null;
}

interface PlaidAuthResponse {
  accounts: PlaidAccount[];
  numbers: { ach: PlaidAchNumber[] };
}

function getPlaidConfig() {
  const clientId = process.env.PLAID_CLIENT_ID;
  const secret = process.env.PLAID_SECRET;
  const env = process.env.PLAID_ENV ?? "sandbox";
  if (!clientId || !secret) {
    throw new Error("Plaid credentials are not configured");
  }
  return { clientId, secret, baseUrl: `https://${env}.plaid.com` };
}

export async function POST(request: Request) {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get(getSessionCookieName())?.value;
  const session = verifySessionToken(sessionToken);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let public_token: unknown;
  try {
    ({ public_token } = (await request.json()) as { public_token: unknown });
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  if (typeof public_token !== "string" || !public_token) {
    return NextResponse.json({ error: "public_token is required" }, { status: 400 });
  }

  try {
    const { clientId, secret, baseUrl } = getPlaidConfig();

    // Exchange public token for access token — access token stays server-side
    const exchangeRes = await fetch(`${baseUrl}/item/public_token/exchange`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ client_id: clientId, secret, public_token }),
    });

    if (!exchangeRes.ok) {
      const data = (await exchangeRes.json()) as { error_message?: string };
      return NextResponse.json(
        { error: data.error_message ?? "Token exchange failed" },
        { status: 502 }
      );
    }

    const { access_token } = (await exchangeRes.json()) as { access_token: string };

    // Fetch routing/account numbers using the access token
    const authRes = await fetch(`${baseUrl}/auth/get`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ client_id: clientId, secret, access_token }),
    });

    if (!authRes.ok) {
      const data = (await authRes.json()) as { error_message?: string };
      return NextResponse.json(
        { error: data.error_message ?? "Failed to fetch account data" },
        { status: 502 }
      );
    }

    const authData = (await authRes.json()) as PlaidAuthResponse;

    const achByAccountId = new Map(
      (authData.numbers?.ach ?? []).map((n) => [n.account_id, n])
    );

    const accounts = (authData.accounts ?? []).map((acc) => {
      const ach = achByAccountId.get(acc.account_id);
      return {
        accountId: acc.account_id,
        name: acc.name,
        mask: acc.mask,
        type: acc.type,
        subtype: acc.subtype,
        routing: ach?.routing ?? null,
        account: ach?.account ?? null,
        wireRouting: ach?.wire_routing ?? null,
      };
    });

    return NextResponse.json({ accounts });
  } catch (err) {
    console.error("[plaid/exchange-token]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
