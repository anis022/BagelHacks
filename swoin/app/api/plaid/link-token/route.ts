import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifySessionToken, getSessionCookieName } from "@/lib/session";

function getPlaidConfig() {
  const clientId = process.env.PLAID_CLIENT_ID;
  const secret = process.env.PLAID_SECRET;
  const env = process.env.PLAID_ENV ?? "sandbox";
  if (!clientId || !secret) {
    throw new Error("Plaid credentials are not configured");
  }
  return { clientId, secret, baseUrl: `https://${env}.plaid.com` };
}

export async function POST() {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get(getSessionCookieName())?.value;
  const session = verifySessionToken(sessionToken);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { clientId, secret, baseUrl } = getPlaidConfig();

    const res = await fetch(`${baseUrl}/link/token/create`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        client_id: clientId,
        secret,
        client_name: "Swoin",
        products: ["auth"],
        country_codes: ["US"],
        language: "en",
        user: { client_user_id: String(session.userId) },
      }),
    });

    if (!res.ok) {
      const data = (await res.json()) as { error_message?: string };
      return NextResponse.json(
        { error: data.error_message ?? "Plaid API error" },
        { status: 502 }
      );
    }

    const { link_token } = (await res.json()) as { link_token: string };
    return NextResponse.json({ link_token });
  } catch (err) {
    console.error("[plaid/link-token]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
