import type { Email } from "@/types/email";

const PROXY = "/api/guerrilla";

export interface GuerrillaSession {
  sid: string;
  emailUser: string;
  emailDomain: string;
  emailAddr: string;
  alias: string;
  ts: number;
  seq: number;
}

function apiUrl(params: Record<string, string>): string {
  const sp = new URLSearchParams(params);
  return `${PROXY}?${sp.toString()}`;
}

export async function getEmailAddress(
  existingSid?: string
): Promise<GuerrillaSession> {
  const params: Record<string, string> = { f: "get_email_address" };
  if (existingSid) params.sid_token = existingSid;

  const res = await fetch(apiUrl(params));
  if (!res.ok) throw new Error("get_email_address failed");
  const data = await res.json();

  return {
    sid: data.sid_token,
    emailUser: data.email_addr?.split("@")[0] ?? "",
    emailDomain: data.email_addr?.split("@")[1] ?? "guerrillamail.com",
    emailAddr: data.email_addr ?? "",
    alias: data.alias ?? "",
    ts: data.email_timestamp ?? Date.now() / 1000,
    seq: 0,
  };
}

export async function setEmailUser(
  sid: string,
  emailUser: string
): Promise<GuerrillaSession> {
  const res = await fetch(
    apiUrl({ f: "set_email_user", sid_token: sid, email_user: emailUser })
  );
  if (!res.ok) throw new Error("set_email_user failed");
  const data = await res.json();

  return {
    sid: data.sid_token ?? sid,
    emailUser: data.email_addr?.split("@")[0] ?? emailUser,
    emailDomain: data.email_addr?.split("@")[1] ?? "guerrillamail.com",
    emailAddr: data.email_addr ?? `${emailUser}@guerrillamail.com`,
    alias: data.alias ?? "",
    ts: data.email_timestamp ?? Date.now() / 1000,
    seq: 0,
  };
}

export async function checkEmail(
  sid: string,
  seq: number
): Promise<{ emails: Email[]; newSeq: number }> {
  const res = await fetch(
    apiUrl({ f: "check_email", sid_token: sid, seq: String(seq) })
  );
  if (!res.ok) throw new Error("check_email failed");
  const data = await res.json();

  const list: Email[] = (data.list ?? [])
    .filter((m: GuerrillaRawMail) => m.mail_id !== "0")
    .map(parseRawMail);

  return {
    emails: list,
    newSeq: data.count ?? seq,
  };
}

export async function getEmailList(
  sid: string,
  offset = 0
): Promise<Email[]> {
  const res = await fetch(
    apiUrl({ f: "get_email_list", sid_token: sid, offset: String(offset) })
  );
  if (!res.ok) throw new Error("get_email_list failed");
  const data = await res.json();

  return (data.list ?? [])
    .filter((m: GuerrillaRawMail) => m.mail_id !== "0")
    .map(parseRawMail);
}

export async function fetchEmailBody(
  sid: string,
  emailId: string
): Promise<string> {
  const res = await fetch(
    apiUrl({ f: "fetch_email", sid_token: sid, email_id: emailId })
  );
  if (!res.ok) throw new Error("fetch_email failed");
  const data = await res.json();

  if (data.mail_body) return stripHtml(data.mail_body);
  if (data.mail_excerpt) return data.mail_excerpt;
  return "(No content)";
}

export async function forgetMe(sid: string): Promise<void> {
  await fetch(apiUrl({ f: "forget_me", sid_token: sid }));
}

interface GuerrillaRawMail {
  mail_id: string;
  mail_from: string;
  mail_subject: string;
  mail_excerpt: string;
  mail_timestamp: string;
  mail_read: string;
}

function parseRawMail(m: GuerrillaRawMail): Email {
  return {
    id: m.mail_id,
    from: m.mail_from ?? "unknown",
    subject: m.mail_subject || "(No Subject)",
    body: m.mail_excerpt ?? "",
    receivedAt: new Date(Number(m.mail_timestamp) * 1000),
    read: m.mail_read === "1",
  };
}

function stripHtml(html: string): string {
  return html
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "")
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "")
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/p>/gi, "\n\n")
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}