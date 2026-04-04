import Link from "next/link";
import { CHAINS } from "./data/chains";

const FEATURES = [
  {
    icon: "⚡",
    title: "Fast",
    desc: "Transfers complete in 1–5 minutes, not days. No waiting for bank wires.",
  },
  {
    icon: "💸",
    title: "Cheap",
    desc: "Bridge fees as low as 0.03%. Send $1,000 for less than 50 cents.",
  },
  {
    icon: "🔒",
    title: "Secure",
    desc: "Only audited, battle-tested bridges. Your funds, your keys.",
  },
  {
    icon: "🌐",
    title: "Any Chain",
    desc: "Ethereum, Solana, Polygon, Arbitrum and more — all in one interface.",
  },
];

const STEPS = [
  { num: "01", title: "Choose Chains", desc: "Pick your source and destination blockchain networks." },
  { num: "02", title: "Pick a Stablecoin", desc: "Select USDC, USDT, DAI, EURC or PYUSD for your transfer." },
  { num: "03", title: "We Find the Best Bridge", desc: "Swoin compares routes by fee, speed and security automatically." },
  { num: "04", title: "Send & Track", desc: "Confirm and watch real-time progress as your funds arrive." },
];

const FAQS = [
  {
    q: "Is Swoin custodial?",
    a: "No. Swoin is a routing interface — it never holds your funds. Transactions go directly through the selected bridge protocol.",
  },
  {
    q: "Which stablecoins are supported?",
    a: "USDC, USDT, DAI, EURC, and PYUSD, depending on the chains selected.",
  },
  {
    q: "How long do transfers take?",
    a: "Most routes complete in 1–5 minutes. The exact time is shown before you confirm.",
  },
  {
    q: "Are the fees fixed?",
    a: "Fees depend on the bridge chosen. Swoin always surfaces the cheapest option first.",
  },
];

export default function Home() {
  return (
    <main style={{ backgroundColor: "#0a0a0f" }} className="min-h-screen text-white">
      {/* Hero */}
      <section className="relative overflow-hidden px-4 pt-24 pb-32 text-center">
        <div
          className="pointer-events-none absolute inset-0 opacity-30"
          style={{
            background:
              "radial-gradient(ellipse 80% 50% at 50% 0%, #7c3aed 0%, transparent 70%)",
          }}
        />
        <div className="relative max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 mb-6 px-4 py-2 rounded-full text-sm font-medium border border-purple-500/30 text-purple-300"
            style={{ backgroundColor: "rgba(124,58,237,0.15)" }}>
            <span>✨</span> Cross-border payments, reimagined
          </div>
          <h1 className="text-5xl md:text-6xl font-extrabold leading-tight mb-6">
            Send Money Across{" "}
            <span
              className="bg-clip-text text-transparent"
              style={{ backgroundImage: "linear-gradient(135deg, #a78bfa, #60a5fa)" }}
            >
              Borders.
            </span>{" "}
            Instantly.
          </h1>
          <p className="text-lg md:text-xl text-slate-400 max-w-xl mx-auto mb-10">
            Use stablecoins and blockchain bridges to send value anywhere in the world — fast,
            cheap, and without a bank.
          </p>
          <Link
            href="/send"
            className="inline-flex items-center gap-2 px-8 py-4 rounded-xl text-base font-bold text-white shadow-lg transition-all hover:scale-105 hover:shadow-purple-500/30"
            style={{ background: "linear-gradient(135deg, #7c3aed, #2563eb)" }}
          >
            Start Sending <span>→</span>
          </Link>
        </div>
      </section>

      {/* Features */}
      <section className="px-4 py-20 max-w-6xl mx-auto">
        <h2 className="text-3xl font-bold text-center mb-12">Why Swoin?</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {FEATURES.map((f) => (
            <div
              key={f.title}
              className="p-6 rounded-2xl border border-white/10 hover:border-purple-500/40 transition-colors"
              style={{ backgroundColor: "rgba(255,255,255,0.03)" }}
            >
              <div className="text-3xl mb-4">{f.icon}</div>
              <h3 className="text-lg font-semibold mb-2">{f.title}</h3>
              <p className="text-slate-400 text-sm">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="px-4 py-20" style={{ backgroundColor: "rgba(255,255,255,0.02)" }}>
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">How It Works</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {STEPS.map((s) => (
              <div key={s.num} className="flex gap-5 items-start">
                <div
                  className="flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center text-lg font-bold"
                  style={{ background: "linear-gradient(135deg, #7c3aed, #2563eb)" }}
                >
                  {s.num}
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-1">{s.title}</h3>
                  <p className="text-slate-400 text-sm">{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Supported Chains */}
      <section className="px-4 py-20 max-w-6xl mx-auto">
        <h2 className="text-3xl font-bold text-center mb-4">Supported Networks</h2>
        <p className="text-center text-slate-400 mb-10 text-sm">
          Swoin routes across 8 major blockchains
        </p>
        <div className="flex flex-wrap justify-center gap-4">
          {CHAINS.map((chain) => (
            <div
              key={chain.id}
              className="flex items-center gap-2 px-5 py-3 rounded-full border border-white/10 hover:border-purple-500/40 transition-colors text-sm font-medium"
              style={{ backgroundColor: "rgba(255,255,255,0.04)" }}
            >
              <span className="text-xl">{chain.logo}</span>
              <span>{chain.name}</span>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="px-4 py-20" style={{ backgroundColor: "rgba(255,255,255,0.02)" }}>
        <div className="max-w-2xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">FAQ</h2>
          <div className="space-y-4">
            {FAQS.map((item) => (
              <div
                key={item.q}
                className="p-6 rounded-2xl border border-white/10"
                style={{ backgroundColor: "rgba(255,255,255,0.03)" }}
              >
                <h3 className="font-semibold text-white mb-2">{item.q}</h3>
                <p className="text-slate-400 text-sm">{item.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/10 text-center py-8 text-slate-500 text-sm">
        Swoin © 2025 — Cross-Border Stablecoin Payments
      </footer>
    </main>
  );
}
