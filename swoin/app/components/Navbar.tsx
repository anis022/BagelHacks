import Link from "next/link";

export default function Navbar() {
  return (
    <nav className="sticky top-0 z-50 border-b border-white/10 backdrop-blur-md" style={{ backgroundColor: "rgba(10,10,15,0.85)" }}>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-2 text-xl font-bold text-white hover:text-purple-400 transition-colors">
            <span>🌉</span>
            <span>Swoin</span>
          </Link>

          <div className="hidden md:flex items-center gap-8">
            <Link href="/send" className="text-slate-300 hover:text-white transition-colors text-sm font-medium">
              Send
            </Link>
            <Link href="/#how-it-works" className="text-slate-300 hover:text-white transition-colors text-sm font-medium">
              How It Works
            </Link>
            <Link href="/#faq" className="text-slate-300 hover:text-white transition-colors text-sm font-medium">
              FAQ
            </Link>
          </div>

          <Link
            href="/send"
            className="px-4 py-2 rounded-lg text-sm font-semibold text-white transition-all hover:scale-105"
            style={{ background: "linear-gradient(135deg, #7c3aed, #2563eb)" }}
          >
            Launch App
          </Link>
        </div>
      </div>
    </nav>
  );
}
