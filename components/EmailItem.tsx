import type { Email } from "@/types/email";

interface Props {
  email: Email;
  onClick: (email: Email) => void;
}

function timeAgo(date: Date): string {
  const diff = Math.floor((Date.now() - date.getTime()) / 1000);
  if (diff < 60) return `${diff}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

export default function EmailItem({ email, onClick }: Props) {
  return (
    <div
      onClick={() => onClick(email)}
      className={`flex items-start gap-3 px-5 py-4 cursor-pointer hover:bg-slate-50 transition-colors border-b border-slate-100 last:border-0 ${
        !email.read ? "border-l-2 border-l-blue-500" : "border-l-2 border-l-transparent"
      }`}
    >
      <div className="w-9 h-9 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-semibold text-sm flex-shrink-0 mt-0.5">
        {email.from.charAt(0).toUpperCase()}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2 mb-0.5">
          <span className={`text-sm truncate ${!email.read ? "font-semibold text-slate-900" : "text-slate-700"}`}>
            {email.from}
          </span>
          <span className="text-xs text-slate-400 flex-shrink-0">{timeAgo(email.receivedAt)}</span>
        </div>
        <div className={`text-sm truncate ${!email.read ? "text-slate-800 font-medium" : "text-slate-500"}`}>
          {email.subject}
        </div>
      </div>
      {!email.read && <div className="w-2 h-2 rounded-full bg-blue-500 flex-shrink-0 mt-2" />}
    </div>
  );
}