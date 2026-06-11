import InboxCard from "@/components/InboxCard";

const features = [
  {
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
          d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    title: "Auto Expiration",
    desc: "Emails deleted after 48 hours. Zero footprint.",
  },
  {
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
          d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
    ),
    title: "Instant Setup",
    desc: "One click. No signup, no verification.",
  },
  {
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
          d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
      </svg>
    ),
    title: "Privacy First",
    desc: "Your real email stays hidden always.",
  },
];

export default function HomePage() {
  return (
    <div>
      {/* Hero */}
      <section className="bg-gradient-to-b from-blue-50 to-slate-50 border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-2 bg-blue-100 text-blue-700 text-xs font-semibold px-4 py-1.5 rounded-full mb-5 animate-fade-up">
              <span className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse-dot" />
              100% Free — No Signup Required
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-slate-900 leading-tight mb-4 animate-fade-up delay-100">
              Free Temporary &{" "}
              <span className="text-blue-600">Disposable Email</span>
            </h1>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed animate-fade-up delay-200">
              Instant disposable email addresses. Protect your privacy, avoid spam,
              and receive anonymous emails — no registration, completely free.
            </p>
          </div>

          <div className="max-w-2xl mx-auto animate-fade-up delay-300">
            <InboxCard />
          </div>

          <div className="mt-10 grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-2xl mx-auto animate-fade-up delay-400">
            {features.map((f) => (
              <div key={f.title} className="flex items-center gap-3 bg-white rounded-xl border border-slate-200 px-4 py-3">
                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600 flex-shrink-0">
                  {f.icon}
                </div>
                <div>
                  <div className="text-sm font-semibold text-slate-800">{f.title}</div>
                  <div className="text-xs text-slate-500">{f.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="bg-white border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 text-center">
            {[
              { value: "2M+", label: "Emails Generated" },
              { value: "850K+", label: "Users Worldwide" },
              { value: "4", label: "Domains Available" },
              { value: "48h", label: "Auto Expiry" },
            ].map((s) => (
              <div key={s.label}>
                <div className="text-2xl font-bold text-blue-600">{s.value}</div>
                <div className="text-sm text-slate-500 mt-1">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-slate-900 mb-3">How DropMail Works</h2>
          <p className="text-slate-500 max-w-xl mx-auto">Three simple steps to protect your inbox.</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
          {[
            { step: "01", title: "Get Your Address", desc: "Visit DropMail and instantly receive a random disposable email. No forms, no signup." },
            { step: "02", title: "Use It Anywhere", desc: "Use your temp address to sign up for websites, trials, or any online form." },
            { step: "03", title: "Receive & Read", desc: "Emails appear in your inbox in real time. After 48 hours, everything auto-deletes." },
          ].map((item) => (
            <div key={item.step}>
              <div className="text-5xl font-bold text-blue-100 mb-3">{item.step}</div>
              <h3 className="text-lg font-semibold text-slate-900 mb-2">{item.title}</h3>
              <p className="text-slate-500 text-sm leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}