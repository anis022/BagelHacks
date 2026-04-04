import { NextResponse } from "next/server";
import { createUser } from "@/lib/db";
import { hashPassword, validateCredentials } from "@/lib/auth";
import { createSessionToken, getSessionCookieName, getSessionCookieOptions } from "@/lib/session";

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

    const passwordHash = await hashPassword(validation.password);
    const user = await createUser(validation.email, passwordHash);

    const token = createSessionToken(user.id);
    const response = NextResponse.json({ user: { id: user.id, email: user.email } }, { status: 201 });

    const options = getSessionCookieOptions();
    response.cookies.set(options.name, token, options);

    return response;
  } catch (error: unknown) {
    if (typeof error === "object" && error && "code" in error && error.code === "23505") {
      return NextResponse.json({ error: "Email already registered" }, { status: 409 });
    }

    return NextResponse.json({ error: "Failed to create account" }, { status: 500 });
  }
}
