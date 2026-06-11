export interface Email {
  id: string;
  from: string;
  subject: string;
  body: string;
  receivedAt: Date;
  read: boolean;
}

export interface InboxState {
  emailAddress: string;
  username: string;
  domain: string;
  emails: Email[];
  expiresAt: Date;
}

export const DOMAINS = [
  "dropmail.io",
  "tmpbox.net",
  "throwit.dev",
  "fakeinbox.xyz",
] as const;

export type Domain = (typeof DOMAINS)[number];