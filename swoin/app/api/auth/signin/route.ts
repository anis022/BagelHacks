import { NextResponse } from "next/server";
import { getUserByEmail } from "@/lib/db";
import { validateCredentials, verifyPassword } from "@/lib/auth";
import { createSessionToken, getSessionCookieOptions } from "@/lib/session";

export async function POST(request: Request) {
  try {
    const { email = "", password = "" } = (await request.json()) as {
      email?: string;
      password?: string;
    };

    const validation = validateCredentials(email, password);
    if (!validation.valid) {
      return NextResponse.json({ error: validation.message }, { status: 400 });
    }

    const user = await getUserByEmail(validation.email);
    if (!user) {
      return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
    }

    const ok = await verifyPassword(validation.password, user.password);
    if (!ok) {
      return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
    }

    const token = createSessionToken(user.id);
    const response = NextResponse.json({ user: { id: user.id, email: user.email } });

    const options = getSessionCookieOptions();
    response.cookies.set(options.name, token, options);

    return response;
  } catch {
    return NextResponse.json({ error: "Failed to sign in" }, { status: 500 });
  }
}
