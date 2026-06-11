import { NextRequest, NextResponse } from "next/server";

const BASE = "https://api.guerrillamail.com/ajax.php";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const f = searchParams.get("f");
  const sid = searchParams.get("sid_token") ?? "";
  const seq = searchParams.get("seq") ?? "0";

  if (!f) {
    return NextResponse.json({ error: "Missing function param" }, { status: 400 });
  }

  let url = `${BASE}?f=${f}`;

  if (f === "get_email_address") {
    url += `&lang=en&site=guerrillamail.com&acct=&zone=&ip=127.0.0.1&agent=Mozilla_foo`;
    if (sid) url += `&sid_token=${sid}`;
  } else if (f === "set_email_user") {
    const emailUser = searchParams.get("email_user") ?? "";
    url += `&email_user=${encodeURIComponent(emailUser)}&lang=en&sid_token=${sid}`;
  } else if (f === "check_email") {
    url += `&seq=${seq}&sid_token=${sid}`;
  } else if (f === "get_email_list") {
    const offset = searchParams.get("offset") ?? "0";
    url += `&offset=${offset}&sid_token=${sid}`;
  } else if (f === "fetch_email") {
    const emailId = searchParams.get("email_id") ?? "";
    url += `&email_id=${emailId}&sid_token=${sid}`;
  } else if (f === "forget_me") {
    url += `&sid_token=${sid}`;
  }

  try {
    const res = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible)",
        "Accept": "application/json",
      },
      signal: AbortSignal.timeout(8000),
    });

    if (!res.ok) {
      return NextResponse.json(
        { error: `Upstream error: ${res.status}` },
        { status: 502 }
      );
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch (err) {
    console.error("Guerrilla API error:", err);
    return NextResponse.json(
      { error: "Failed to reach Guerrilla Mail API" },
      { status: 502 }
    );
  }
}