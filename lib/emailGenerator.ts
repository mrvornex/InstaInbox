import { DOMAINS, type Domain } from "@/types/email";

const adjectives = [
  "swift","dark","cool","lazy","brave","wild","calm","fast",
  "sharp","blue","quiet","epic","deep","free","bold","clean",
  "smart","neat","pure","keen",
];

const nouns = [
  "fox","hawk","wolf","byte","pixel","node","echo","nova",
  "spark","flux","pulse","dash","bolt","storm","cloud","draft",
  "signal","trace","frame","scope",
];

export function generateUsername(): string {
  const adj = adjectives[Math.floor(Math.random() * adjectives.length)];
  const noun = nouns[Math.floor(Math.random() * nouns.length)];
  const num = Math.floor(Math.random() * 900) + 100;
  return `${adj}${noun}${num}`;
}

export function buildEmail(username: string, domain: Domain): string {
  return `${username}@${domain}`;
}

export function getRandomDomain(): Domain {
  return DOMAINS[Math.floor(Math.random() * DOMAINS.length)];
}

export function formatTimeLeft(expiresAt: Date): string {
  const diff = Math.max(0, expiresAt.getTime() - Date.now());
  const h = Math.floor(diff / 3600000);
  const m = Math.floor((diff % 3600000) / 60000);
  const s = Math.floor((diff % 60000) / 1000);
  return `${String(h).padStart(2,"0")}:${String(m).padStart(2,"0")}:${String(s).padStart(2,"0")}`;
}

export function getProgressPercent(expiresAt: Date): number {
  const total = 48 * 3600 * 1000;
  const remaining = Math.max(0, expiresAt.getTime() - Date.now());
  return (remaining / total) * 100;
}

export const DEMO_EMAILS = [
  {
    id: "1",
    from: "verify@github.com",
    subject: "Verify your GitHub email address",
    body: `Hi there,\n\nPlease verify your email address:\nhttps://github.com/verify/abc123xyz456\n\nThis link expires in 24 hours.\n\nThanks,\nThe GitHub Team`,
    receivedAt: new Date(Date.now() - 2 * 60 * 1000),
    read: false,
  },
  {
    id: "2",
    from: "noreply@notion.so",
    subject: "Welcome to Notion — Your workspace is ready",
    body: `Hey there 👋\n\nWelcome to Notion! Your workspace is ready.\n\n• Create your first page\n• Invite your team\n• Import notes\n\nThe Notion Team`,
    receivedAt: new Date(Date.now() - 15 * 60 * 1000),
    read: false,
  },
  {
    id: "3",
    from: "support@discord.com",
    subject: "Discord — Confirm your email address",
    body: `Hi,\n\nConfirm your Discord email:\nhttps://discord.com/verify/token789xyz\n\nValid for 10 minutes.\n\nDiscord Support`,
    receivedAt: new Date(Date.now() - 60 * 60 * 1000),
    read: true,
  },
];