import { NextRequest, NextResponse } from "next/server";

const BASE = "https://api.mail.tm";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const action = searchParams.get("action");
  const token  = searchParams.get("token") ?? "";

  try {
    if (action === "domains") {
      const res = await fetch(`${BASE}/domains?page=1`);
      const data = await res.json();
      return NextResponse.json(data);
    }

    if (action === "messages") {
      const res = await fetch(`${BASE}/messages?page=1`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      return NextResponse.json(data);
    }

    if (action === "message") {
      const id = searchParams.get("id") ?? "";
      const res = await fetch(`${BASE}/messages/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      return NextResponse.json(data);
    }

    return NextResponse.json({ error: "Unknown action" }, { status: 400 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Proxy error" }, { status: 502 });
  }
}

export async function POST(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const action = searchParams.get("action");
  const body   = await req.json().catch(() => ({}));

  try {
    if (action === "register") {
      const res = await fetch(`${BASE}/accounts`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      return NextResponse.json(data, { status: res.status });
    }

    if (action === "token") {
      const res = await fetch(`${BASE}/token`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      return NextResponse.json(data, { status: res.status });
    }

    if (action === "delete") {
      const token = searchParams.get("token") ?? "";
      const id    = searchParams.get("id") ?? "";
      await fetch(`${BASE}/accounts/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      return NextResponse.json({ ok: true });
    }

    return NextResponse.json({ error: "Unknown action" }, { status: 400 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Proxy error" }, { status: 502 });
  }
}