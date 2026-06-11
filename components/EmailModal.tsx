import type { Email } from "@/types/email";
import { useEffect } from "react";

interface Props {
  email: Email | null;
  onClose: () => void;
}

function formatDate(date: Date): string {
  return date.toLocaleString("en-US", {
    weekday: "short", year: "numeric", month: "short",
    day: "numeric", hour: "2-digit", minute: "2-digit",
  });
}

export default function EmailModal({ email, onClose }: Props) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  if (!email) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fade-in"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[85vh] flex flex-col overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
          <h2 className="font-semibold text-slate-900 text-base truncate pr-4">{email.subject}</h2>
          <button onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="px-6 py-3 bg-slate-50 border-b border-slate-200 space-y-1">
          <div className="flex items-center gap-2 text-sm">
            <span className="text-slate-500 w-12">From</span>
            <span className="font-medium text-slate-800">{email.from}</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <span className="text-slate-500 w-12">Date</span>
            <span className="text-slate-700">{formatDate(email.receivedAt)}</span>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto px-6 py-5">
          <pre className="font-sans text-sm text-slate-700 whitespace-pre-wrap leading-relaxed">
            {email.body}
          </pre>
        </div>
        <div className="px-6 py-3 border-t border-slate-100 flex justify-end">
          <button onClick={onClose}
            className="text-sm text-slate-500 hover:text-slate-800 px-4 py-2 rounded-lg hover:bg-slate-100">
            Close
          </button>
        </div>
      </div>
    </div>
  );
}