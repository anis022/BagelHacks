import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getSessionCookieName, verifySessionToken } from "@/lib/session";
import { getPaymentMethods, addPaymentMethod, deletePaymentMethod } from "@/lib/db";

export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(getSessionCookieName())?.value;
    const session = verifySessionToken(token);
    if (!session) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const methods = await getPaymentMethods(session.userId);
    return NextResponse.json({ methods });
  } catch {
    return NextResponse.json({ error: "Failed to fetch payment methods" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(getSessionCookieName())?.value;
    const session = verifySessionToken(token);
    if (!session) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const { type, label, details } = (await request.json()) as {
      type?: string;
      label?: string;
      details?: string;
    };

    if (!type || !label) {
      return NextResponse.json({ error: "Type and label are required" }, { status: 400 });
    }

    const method = await addPaymentMethod(session.userId, type, label, details ?? "");
    return NextResponse.json({ method }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Failed to add payment method" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(getSessionCookieName())?.value;
    const session = verifySessionToken(token);
    if (!session) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const { id } = (await request.json()) as { id?: number };
    if (!id) {
      return NextResponse.json({ error: "Method ID is required" }, { status: 400 });
    }

    const deleted = await deletePaymentMethod(session.userId, id);
    if (!deleted) {
      return NextResponse.json({ error: "Payment method not found" }, { status: 404 });
    }

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Failed to delete payment method" }, { status: 500 });
  }
}
