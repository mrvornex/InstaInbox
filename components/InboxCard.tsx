"use client";
import { useState, useEffect, useCallback, useRef } from "react";
import type { Email } from "@/types/email";
import {
  getEmailAddress,
  setEmailUser,
  checkEmail,
  getEmailList,
  fetchEmailBody,
  type GuerrillaSession,
} from "@/lib/guerrilla";
import { formatTimeLeft, getProgressPercent } from "@/lib/emailGenerator";
import EmailItem from "./EmailItem";
import EmailModal from "./EmailModal";

const POLL_INTERVAL = 15000;

export default function InboxCard() {
  const [session, setSession]             = useState<GuerrillaSession | null>(null);
  const [emails, setEmails]               = useState<Email[]>([]);
  const [selectedEmail, setSelectedEmail] = useState<Email | null>(null);
  const [loading, setLoading]             = useState(true);
  const [refreshing, setRefreshing]       = useState(false);
  const [toast, setToast]                 = useState<string | null>(null);
  const [copied, setCopied]               = useState(false);
  const [timeLeft, setTimeLeft]           = useState("01:00:00");
  const [progress, setProgress]           = useState(100);
  const [editUser, setEditUser]           = useState("");
  const [savingUser, setSavingUser]       = useState(false);

  const sessionRef = useRef<GuerrillaSession | null>(null);
  const timerRef   = useRef<ReturnType<typeof setInterval> | null>(null);
  const pollRef    = useRef<ReturnType<typeof setInterval> | null>(null);
  const expiresRef = useRef<Date>(new Date());

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2500);
  };

  const startTimer = useCallback((exp: Date) => {
    expiresRef.current = exp;
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setTimeLeft(formatTimeLeft(expiresRef.current));
      setProgress(getProgressPercent(expiresRef.current));
    }, 1000);
  }, []);

  const startPolling = useCallback(() => {
    if (pollRef.current) clearInterval(pollRef.current);
    pollRef.current = setInterval(async () => {
      if (!sessionRef.current) return;
      try {
        const { emails: newMails, newSeq } = await checkEmail(
          sessionRef.current.sid,
          sessionRef.current.seq
        );
        if (newMails.length > 0) {
          sessionRef.current = { ...sessionRef.current, seq: newSeq };
          setEmails((prev) => {
            const existingIds = new Set(prev.map((e) => e.id));
            const fresh = newMails.filter((m) => !existingIds.has(m.id));
            if (fresh.length > 0) {
              showToast(`📬 ${fresh.length} new email${fresh.length > 1 ? "s" : ""}!`);
              return [...fresh, ...prev];
            }
            return prev;
          });
        }
      } catch {
        // silent network blip
      }
    }, POLL_INTERVAL);
  }, []);

  const initSession = useCallback(async () => {
    setLoading(true);
    setEmails([]);
    try {
      const sess = await getEmailAddress();
      sessionRef.current = sess;
      setSession(sess);
      setEditUser(sess.emailUser);
      const exp = new Date(Date.now() + 60 * 60 * 1000);
      startTimer(exp);
      const list = await getEmailList(sess.sid);
      setEmails(list);
      startPolling();
    } catch {
      showToast("⚠️ Could not connect. Retrying...");
      setTimeout(initSession, 3000);
    } finally {
      setLoading(false);
    }
  }, [startTimer, startPolling]);

  useEffect(() => {
    initSession();
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (pollRef.current)  clearInterval(pollRef.current);
    };
  }, [initSession]);

  const handleRefresh = async () => {
    if (!sessionRef.current) return;
    setRefreshing(true);
    try {
      const list = await getEmailList(sessionRef.current.sid);
      setEmails(list);
      showToast(
        list.length > 0
          ? `Refreshed — ${list.length} email${list.length !== 1 ? "s" : ""}`
          : "Inbox is empty ✓"
      );
    } catch {
      showToast("⚠️ Refresh failed. Try again.");
    } finally {
      setRefreshing(false);
    }
  };

  const handleNewAddress = async () => {
    if (pollRef.current)  clearInterval(pollRef.current);
    if (timerRef.current) clearInterval(timerRef.current);
    await initSession();
    showToast("✦ New address generated!");
  };

  const handleSaveUser = async () => {
    if (!sessionRef.current || !editUser.trim()) return;
    setSavingUser(true);
    try {
      const updated = await setEmailUser(sessionRef.current.sid, editUser.trim());
      sessionRef.current = { ...sessionRef.current, ...updated };
      setSession(updated);
      setEmails([]);
      showToast("✓ Username updated!");
    } catch {
      showToast("⚠️ Could not update username.");
    } finally {
      setSavingUser(false);
    }
  };

  const handleCopy = async () => {
    const addr = session?.emailAddr ?? "";
    try {
      await navigator.clipboard.writeText(addr);
      setCopied(true);
      showToast("📋 Copied to clipboard!");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      showToast(addr);
    }
  };

  const handleOpenEmail = async (email: Email) => {
    setEmails((prev) =>
      prev.map((e) => (e.id === email.id ? { ...e, read: true } : e))
    );
    setSelectedEmail({ ...email, read: true });
    if (sessionRef.current && email.body.length < 200) {
      try {
        const fullBody = await fetchEmailBody(sessionRef.current.sid, email.id);
        setSelectedEmail((prev) =>
          prev?.id === email.id ? { ...prev, body: fullBody } : prev
        );
      } catch {
        // keep excerpt
      }
    }
  };

  const unreadCount = emails.filter((e) => !e.read).length;
  const emailAddr   = session?.emailAddr ?? "Loading...";

  return (
    <>
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 bg-slate-50 border-b border-slate-200">
          <div className="flex items-center gap-2.5">
            <span className={`w-2 h-2 rounded-full ${loading ? "bg-amber-400" : "bg-green-500"} animate-pulse-dot`} />
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              {loading ? "Connecting..." : "Active Inbox — Real Emails"}
            </span>
          </div>
          {!loading && (
            <span className="text-xs bg-green-100 text-green-700 font-semibold px-2.5 py-0.5 rounded-full">
              ✓ Live
            </span>
          )}
        </div>

        {/* Email address */}
        <div className="px-5 pt-5 pb-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={handleCopy}
              disabled={loading}
              className="flex-1 flex items-center gap-3 bg-slate-50 border border-slate-200 hover:border-blue-400 hover:bg-blue-50 rounded-xl px-4 py-3 transition-all group text-left disabled:opacity-60"
            >
              <svg className="w-4 h-4 text-blue-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              <span className="font-mono text-sm text-slate-800 flex-1 truncate">
                {loading ? "Generating address..." : emailAddr}
              </span>
              <span className="text-xs text-slate-400 group-hover:text-blue-500 flex-shrink-0">
                {copied ? "Copied!" : "Copy"}
              </span>
            </button>
            <div className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-3 text-sm text-slate-600 font-medium flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-green-400" />
              guerrillamail.com
            </div>
          </div>

          {/* Custom username */}
          <div className="mt-3 flex items-center gap-2">
            <span className="text-xs text-slate-500 flex-shrink-0">Custom username:</span>
            <input
              type="text"
              value={editUser}
              onChange={(e) => setEditUser(e.target.value.toLowerCase().replace(/[^a-z0-9._-]/g, ""))}
              onKeyDown={(e) => e.key === "Enter" && handleSaveUser()}
              className="flex-1 bg-transparent border-b border-slate-200 focus:border-blue-400 text-sm font-mono text-slate-700 py-0.5 focus:outline-none transition-colors"
              placeholder="your username"
              maxLength={30}
              disabled={loading}
            />
            <button
              onClick={handleSaveUser}
              disabled={savingUser || loading}
              className="text-xs bg-blue-600 hover:bg-blue-700 text-white font-semibold px-3 py-1 rounded-lg transition-colors disabled:opacity-50 flex-shrink-0"
            >
              {savingUser ? "..." : "Set"}
            </button>
          </div>

          {!loading && (
            <p className="mt-2 text-xs text-slate-400">
              💡 Real inbox — emails sent to{" "}
              <span className="font-mono text-blue-500">{emailAddr}</span>{" "}
              will appear here within seconds.
            </p>
          )}
        </div>

        {/* Buttons */}
        <div className="px-5 pb-5 flex flex-wrap gap-2">
          <button
            onClick={handleRefresh}
            disabled={refreshing || loading}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition-colors disabled:opacity-60"
          >
            <svg className={`w-4 h-4 ${refreshing ? "animate-spin-icon" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            {refreshing ? "Checking..." : "Refresh Inbox"}
          </button>
          <button
            onClick={handleNewAddress}
            disabled={loading}
            className="flex items-center gap-2 bg-white border border-slate-200 hover:border-blue-400 hover:text-blue-600 text-slate-700 text-sm font-semibold px-4 py-2.5 rounded-xl transition-colors disabled:opacity-60"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            New Address
          </button>
          <button
            onClick={handleCopy}
            disabled={loading}
            className="flex items-center gap-2 bg-white border border-slate-200 hover:border-slate-300 text-slate-700 text-sm font-semibold px-4 py-2.5 rounded-xl transition-colors disabled:opacity-60"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
            Copy Email
          </button>
        </div>

        {/* Timer */}
        <div className="px-5 py-3 bg-slate-50 border-t border-slate-100 flex items-center gap-3">
          <span className="text-xs text-slate-500 flex-shrink-0">Session expires in</span>
          <div className="flex-1 h-1.5 bg-slate-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-blue-500 to-blue-400 rounded-full transition-all duration-1000"
              style={{ width: `${progress}%` }}
            />
          </div>
          <span className="font-mono text-xs text-blue-600 font-semibold flex-shrink-0">{timeLeft}</span>
        </div>

        {/* Inbox list */}
        <div className="border-t border-slate-200">
          <div className="flex items-center justify-between px-5 py-3">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Inbox</span>
              {unreadCount > 0 && (
                <span className="bg-blue-600 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                  {unreadCount}
                </span>
              )}
            </div>
            <span className="text-xs text-slate-400">
              {loading ? "Loading..." : `${emails.length} message${emails.length !== 1 ? "s" : ""}`}
            </span>
          </div>

          {loading ? (
            <div className="text-center py-12 px-5">
              <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin-icon mx-auto mb-3" />
              <p className="text-sm text-slate-500">Connecting to mail server...</p>
            </div>
          ) : emails.length === 0 ? (
            <div className="text-center py-12 px-5">
              <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <svg className="w-6 h-6 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                </svg>
              </div>
              <p className="text-sm text-slate-500 font-medium">Inbox is empty</p>
              <p className="text-xs text-slate-400 mt-1">
                Send an email to <span className="font-mono text-blue-500">{emailAddr}</span>
              </p>
              <p className="text-xs text-slate-400 mt-0.5">Auto-checks every 15 seconds.</p>
            </div>
          ) : (
            emails.map((email) => (
              <EmailItem key={email.id} email={email} onClick={handleOpenEmail} />
            ))
          )}
        </div>
      </div>

      {selectedEmail && (
        <EmailModal email={selectedEmail} onClose={() => setSelectedEmail(null)} />
      )}

      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-sm font-medium px-5 py-3 rounded-full shadow-lg z-50 animate-fade-up whitespace-nowrap">
          {toast}
        </div>
      )}
    </>
  );
}