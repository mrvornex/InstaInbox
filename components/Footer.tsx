import Link from "next/link";

const links = [
  { href: "/features", label: "Features" },
  { href: "/faq", label: "FAQ" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
  { href: "/privacy", label: "Privacy Policy" },
];

export default function Footer() {
  return (
    <footer className="bg-white border-t border-slate-200 mt-16">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start gap-2.5 mb-2">
              <div className="w-7 h-7 bg-blue-600 rounded-lg flex items-center justify-center text-white text-xs font-bold">D</div>
              <span className="font-bold text-lg text-slate-900">Drop<span className="text-blue-600">Mail</span></span>
            </div>
            <p className="text-sm text-slate-500">Free, anonymous & disposable email service.</p>
          </div>
          <div className="flex flex-wrap justify-center gap-x-6 gap-y-2">
            {links.map((l) => (
              <Link key={l.href} href={l.href}
                className="text-sm text-slate-500 hover:text-blue-600 transition-colors">
                {l.label}
              </Link>
            ))}
          </div>
        </div>
        <div className="mt-8 pt-6 border-t border-slate-100 text-center text-xs text-slate-400">
          © {new Date().getFullYear()} DropMail. All rights reserved.
        </div>
      </div>
    </footer>
  );
}