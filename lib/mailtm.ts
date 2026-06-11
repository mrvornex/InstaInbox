import type { Email } from "@/types/email";

const BASE = "https://api.mail.tm";

export interface MailTmSession {
  id: string;
  address: string;
  token: string;
  password: string;
  domain: string;
  createdAt: Date;
}

// ── 1. Get available domains ──────────────────────────
export async function getDomains(): Promise<string[]> {
  const res = await fetch(`${BASE}/domains?page=1`);
  if (!res.ok) throw new Error("getDomains failed");
  const data = await res.json();
  return (data["hydra:member"] ?? []).map((d: { domain: string }) => d.domain);
}

// ── 2. Create new account ─────────────────────────────
export async function createAccount(
  username?: string,
  customDomain?: string
): Promise<MailTmSession> {
  // Get a live domain
  const domains = await getDomains();
  if (domains.length === 0) throw new Error("No domains available");
  const domain = customDomain && domains.includes(customDomain)
    ? customDomain
    : domains[0];

  // Random username if not provided
  const user = username ?? randUser();
  const address = `${user}@${domain}`;
  const password = randPass();  

  // Register
  const regRes = await fetch(`${BASE}/accounts`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ address, password }),
  });

  if (!regRes.ok) {
    const err = await regRes.json().catch(() => ({}));
    throw new Error(err["hydra:description"] ?? "Account creation failed");
  }

  const account = await regRes.json();

  // Login to get token
  const tokenRes = await fetch(`${BASE}/token`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ address, password }),
  });

  if (!tokenRes.ok) throw new Error("Login failed");
  const tokenData = await tokenRes.json();

  return {
    id: account.id,
    address,
    token: tokenData.token,
    password,
    domain,
    createdAt: new Date(),
  };
}

// ── 3. Get messages list ──────────────────────────────
export async function getMessages(token: string): Promise<Email[]> {
  const res = await fetch(`${BASE}/messages?page=1`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error("getMessages failed");
  const data = await res.json();

  return (data["hydra:member"] ?? []).map(parseMessage);
}

// ── 4. Get full message body ──────────────────────────
export async function getMessage(
  token: string,
  messageId: string
): Promise<string> {
  const res = await fetch(`${BASE}/messages/${messageId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error("getMessage failed");
  const data = await res.json();

  // Prefer text, fallback to strip HTML
  if (data.text) return data.text.trim();
  if (data.html?.length) return stripHtml(data.html[0] ?? "");
  if (data.intro) return data.intro;
  return "(No content)";
}

// ── 5. Delete account ─────────────────────────────────
export async function deleteAccount(
  token: string,
  accountId: string
): Promise<void> {
  await fetch(`${BASE}/accounts/${accountId}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  });
}

// ── helpers ───────────────────────────────────────────
interface MailTmMessage {
  id: string;
  from: { address: string; name?: string };
  subject: string;
  intro: string;
  createdAt: string;
  seen: boolean;
}

function parseMessage(m: MailTmMessage): Email {
  return {
    id: m.id,
    from: m.from?.name
      ? `${m.from.name} <${m.from.address}>`
      : m.from?.address ?? "unknown",
    subject: m.subject || "(No Subject)",
    body: m.intro ?? "",
    receivedAt: new Date(m.createdAt),
    read: m.seen,
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

function randUser(): string {
  const adjs  = ["swift","dark","cool","calm","bold","neat","pure","keen","free","epic"];
  const nouns = ["fox","hawk","wolf","byte","node","echo","nova","pulse","bolt","flux"];
  const adj  = adjs[Math.floor(Math.random() * adjs.length)];
  const noun = nouns[Math.floor(Math.random() * nouns.length)];
  const num  = Math.floor(Math.random() * 9000) + 1000;
  return `${adj}${noun}${num}`;
}

function randPass(): string {
  return Math.random().toString(36).slice(2, 10) +
         Math.random().toString(36).slice(2, 10) + "X9!";
}