"use client";

import Link from "next/link";
import { useToast } from "./components/ToastProvider";

export default function LandingPage() {
  const toast = useToast();

  const quickAction = (label: string) => () => toast(`${label} opened`);

  return (
    <div className="bg-background font-body text-on-background overflow-x-hidden">
      {/* TopNav */}
      <nav className="flex justify-between items-center px-6 lg:px-12 w-full z-40 fixed top-0 left-0 right-0 h-16 bg-background/80 backdrop-blur-xl">
        <div className="flex items-center gap-2">
          <span className="text-2xl font-bold tracking-tighter text-on-background font-headline">
            Sovereign
          </span>
          <span className="text-primary text-xs font-semibold px-2 py-0.5 bg-surface-container-high rounded-full">
            FLUIDITY
          </span>
        </div>
        <div className="hidden md:flex items-center gap-8 text-sm font-headline font-medium">
          <a className="text-primary font-bold" href="#hero">Home</a>
          <button onClick={quickAction("Solutions")} className="text-secondary hover:text-primary transition-colors">Solutions</button>
          <button onClick={quickAction("Pricing")} className="text-secondary hover:text-primary transition-colors">Pricing</button>
          <button onClick={() => { document.getElementById("features")?.scrollIntoView({ behavior: "smooth" }); }} className="text-secondary hover:text-primary transition-colors">About</button>
        </div>
        <div className="flex items-center gap-4">
          <div className="hidden lg:flex items-center gap-2 text-on-surface-variant">
            <span className="material-symbols-outlined text-lg">public</span>
            <span className="text-xs font-medium">Global Network: Online</span>
          </div>
          <Link href="/login" className="text-primary font-bold text-sm px-4 py-2 hover:bg-surface-container-high transition-all rounded-xl active:scale-95">
            Log In
          </Link>
          <Link href="/login" className="primary-gradient text-white px-6 py-2.5 rounded-xl text-sm font-bold ambient-shadow active:scale-95 transition-all hidden sm:block">
            Get Started
          </Link>
        </div>
      </nav>

      <main className="pt-28 pb-20 px-6 md:px-12 lg:px-24 max-w-[1440px] mx-auto">
        {/* Hero */}
        <div id="hero" className="grid lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-7 space-y-10 animate-fade-in-up">
            <div className="inline-flex items-center gap-2 bg-surface-container-low px-4 py-2 rounded-full">
              <span className="flex h-2 w-2 rounded-full bg-tertiary animate-pulse" />
              <span className="text-xs font-semibold tracking-wide uppercase text-on-surface-variant">
                Available in 180+ Countries
              </span>
            </div>

            <h1 className="text-5xl lg:text-7xl font-headline font-extrabold tracking-tight leading-[1.1] text-on-background">
              Borderless Payments.
              <br />
              <span className="text-gradient">Zero Hassle.</span>
            </h1>

            <p className="text-xl text-on-surface-variant max-w-xl leading-relaxed">
              Experience the fluidity of a global ledger designed for the modern
              era. Move capital at the speed of light with institutional-grade
              security.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <Link
                href="/login"
                className="primary-gradient text-on-primary px-10 py-5 rounded-xl font-headline font-bold text-lg ambient-shadow hover:opacity-90 active:scale-[0.98] transition-all flex items-center justify-center gap-2 btn-press"
              >
                Get Started
                <span className="material-symbols-outlined">arrow_forward</span>
              </Link>
              <Link
                href="/login"
                className="bg-surface-container-lowest text-on-background px-10 py-5 rounded-xl font-headline font-bold text-lg border border-outline-variant/20 ambient-shadow hover:bg-surface-container-low transition-all text-center active:scale-[0.98]"
              >
                Log In
              </Link>
            </div>

            {/* Social Proof */}
            <div className="flex items-center gap-8 pt-8">
              <div className="flex -space-x-3">
                <img className="w-12 h-12 rounded-full border-4 border-surface object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAAwVEBiKt-hu7tWFHKQ9ERubhkeLNV2SzKPvFoaC_lrdTqleB7R8rxZI25sg5wQCGQ7OacNg3A1gsT1H1Xc91C3-ha1Fnb9MsHO2Gedgd0zDx2dhhQVY4aVW-UkaOFFe5V4A1Sk-iSWwwSAfn-ulOLcAV1DWK8kdwaAYaDPtbcu6nvNVXvoUCz13fr7ES8GQZkWmnc9FEfy1WvMbced_hsDsnupb5RbsiblsYQTRue1SutzEPlRbSk1wX0DvJAz7cmvpX63kgzolE" alt="" />
                <img className="w-12 h-12 rounded-full border-4 border-surface object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDNSNuWwU5y2Frn2R0PmlJgfiFvro-hWm7qX6Hjf9_G_2gLauZiDws0yXdc_oKzaveS41tqvxYeEVcGgH8dWlHszUgQUhT7KBKHgAWEFJSHs1dmj4aeW5uCaA7l1RGA1f1P_ztaECFvlgOnFxbdo18VCxyt8oGJSCKqJPnAuGdFtcRSDUe2e4jx35Vi7jsO5B51rEHy-qoAb95z3JAY4XugtSKyt-1wZMBG-hHGqog8zZvWIE_ucZ0L04Ay3phgWwoVTqGvi9v09oE" alt="" />
                <img className="w-12 h-12 rounded-full border-4 border-surface object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDbNeOVOGR2jcdcyELmxCfIEFoHkewviLLTN7UPeMZSKaogtMPm9JDPTN1zIxdPMiOuqZGmsq-vcfxmRiR2DTNIkT9l6p3pFpxXdaITJu6QTv8X2HeM76jVRwW_lpM7Bxu4HsF7PEFIQvYyJ4g2ppW_lOPYCVrIJOt9dPrR9hmdX4ZLjYjLNZVA7GFi0foCyYORwiyUtGLpGLsTyj3XdtyI9lOQ_rzDKK8fjv9TAPJVbEsXklm_CRdP5zmJyPvLaRb4T45FhyduVRE" alt="" />
                <div className="w-12 h-12 rounded-full border-4 border-surface bg-surface-container-highest flex items-center justify-center text-xs font-bold text-primary">
                  2M+
                </div>
              </div>
              <div>
                <div className="text-on-background font-bold">2M+ Active Users</div>
                <div className="text-on-surface-variant text-sm">Trusting Sovereign for global liquidity.</div>
              </div>
            </div>
          </div>

          {/* Right: Visual */}
          <div className="lg:col-span-5 relative animate-slide-in-right delay-200">
            <div className="relative z-10 bg-surface-container-low rounded-[2.5rem] p-4 lg:p-8 ambient-shadow overflow-hidden">
              <div className="absolute top-0 right-0 p-8 opacity-10">
                <span className="material-symbols-outlined text-[12rem]">language</span>
              </div>

              <div className="bg-surface-container-lowest rounded-3xl p-6 ambient-shadow mb-6 relative z-20">
                <div className="flex justify-between items-start mb-8">
                  <div>
                    <span className="text-xs font-bold text-secondary uppercase tracking-widest">Active Transaction</span>
                    <h3 className="text-2xl font-headline font-bold mt-1">€12,450.00</h3>
                  </div>
                  <div className="bg-tertiary-container/10 text-tertiary px-3 py-1 rounded-full flex items-center gap-1">
                    <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                    <span className="text-xs font-bold">Verified</span>
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-surface-container-high flex items-center justify-center">
                      <span className="material-symbols-outlined text-primary">account_balance</span>
                    </div>
                    <div className="flex-1">
                      <div className="text-xs text-on-surface-variant font-medium">From: Paris, France</div>
                      <div className="text-sm font-bold">Institutional Euro Ledger</div>
                    </div>
                  </div>
                  <div className="ml-5 h-8 border-l-2 border-dashed border-outline-variant/30" />
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full primary-gradient flex items-center justify-center">
                      <span className="material-symbols-outlined text-white">payments</span>
                    </div>
                    <div className="flex-1">
                      <div className="text-xs text-on-surface-variant font-medium">To: Singapore</div>
                      <div className="text-sm font-bold">Digital SGD Hub</div>
                    </div>
                    <div className="text-right text-tertiary font-bold">Success</div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white/40 glass-card rounded-2xl p-4">
                  <div className="text-[10px] uppercase font-bold text-secondary tracking-widest mb-1">Exchange Rate</div>
                  <div className="text-lg font-bold font-headline">1.482 SGD</div>
                  <div className="text-[10px] text-tertiary font-semibold">+0.04% vs Market</div>
                </div>
                <div className="bg-white/40 glass-card rounded-2xl p-4">
                  <div className="text-[10px] uppercase font-bold text-secondary tracking-widest mb-1">Settlement</div>
                  <div className="text-lg font-bold font-headline">Instant</div>
                  <div className="text-[10px] text-on-surface-variant font-semibold">T+0 Protocol</div>
                </div>
              </div>
            </div>

            <div className="absolute -top-12 -right-12 w-64 h-64 bg-primary/5 rounded-full blur-3xl" />
            <div className="absolute -bottom-12 -left-12 w-48 h-48 bg-tertiary/5 rounded-full blur-3xl" />
          </div>
        </div>

        {/* Features */}
        <div id="features" className="mt-32 grid md:grid-cols-3 gap-8">
          {[
            { icon: "security", title: "Vault Security", desc: "Multi-signature authentication and cold-storage integration for absolute peace of mind." },
            { icon: "speed", title: "Real-time Rails", desc: "Bypass traditional banking delays with our proprietary fluid liquidity network." },
            { icon: "monitoring", title: "Advanced Analytics", desc: "Deep insights into your cash flow and currency exposure across multiple jurisdictions." },
          ].map((f, i) => (
            <button
              key={f.title}
              onClick={quickAction(f.title)}
              className={`bg-surface-container-low rounded-3xl p-8 space-y-4 hover:bg-surface-container-high hover:-translate-y-1 transition-all duration-300 text-left animate-fade-in-up`}
              style={{ animationDelay: `${(i + 1) * 150}ms` }}
            >
              <span className="material-symbols-outlined text-primary text-4xl">{f.icon}</span>
              <h4 className="text-xl font-headline font-bold">{f.title}</h4>
              <p className="text-on-surface-variant text-sm leading-relaxed">{f.desc}</p>
            </button>
          ))}
        </div>

        {/* Global Visualization */}
        <div className="mt-32 relative h-[400px] w-full rounded-[3rem] overflow-hidden bg-on-background group">
          <div className="absolute inset-0 opacity-40 group-hover:opacity-50 transition-opacity duration-700">
            <img className="w-full h-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDrNQxU-Ys1GTIC3uh4q3Ec0llxOB7xrRFlhm2kPQxT_EiIv9Udrs2-w0bJEh__8gj3U7fXZK276inRULUjg5PtGkuaIel0DB8NgbrK4KXwumo0Xt8Jr_t4wL_SYcOyHBt76wUJfYPpo8uzOxlf0DcvvLyaeWOxvZ1bFGCrMBwu2yPNcsSH96S-jTxBMWSmoq8wEQreXo675VWeRIKMcXPvbZxrmJoSp4EKDBn14oGp0M9SKdGtXKRAffBrkuTcj4ZDmnqlmggZIN0" alt="Global network" />
          </div>
          <div className="absolute inset-0 bg-gradient-to-t from-on-background via-transparent to-transparent" />
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-6">
            <h2 className="text-white text-3xl lg:text-5xl font-headline font-bold mb-4">Connecting the World&apos;s Economy</h2>
            <p className="text-on-primary-container/80 max-w-2xl text-lg">One unified ledger. Thousands of endpoints. Seamless fluidity.</p>
            <div className="mt-8 flex gap-4">
              <div className="flex items-center gap-2 bg-white/10 backdrop-blur-md border border-white/20 px-4 py-2 rounded-full">
                <span className="text-white font-bold text-sm tracking-tighter">NY</span>
                <span className="w-8 h-px bg-white/30" />
                <span className="text-white font-bold text-sm tracking-tighter">LDN</span>
                <span className="w-8 h-px bg-white/30" />
                <span className="text-white font-bold text-sm tracking-tighter">TYO</span>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-surface-container-low py-16 px-6 md:px-12 lg:px-24">
        <div className="max-w-[1440px] mx-auto grid md:grid-cols-4 gap-12">
          <div className="space-y-6">
            <span className="text-xl font-bold tracking-tighter text-on-background font-headline">Sovereign</span>
            <p className="text-on-surface-variant text-sm leading-relaxed">The premium standard for cross-border financial architecture.</p>
          </div>
          <div>
            <h5 className="font-headline font-bold mb-6">Product</h5>
            <ul className="space-y-4 text-sm text-on-surface-variant">
               <li><button onClick={quickAction("Business Accounts")} className="hover:text-primary transition-colors">Business Accounts</button></li>
              <li><Link href="/send" className="hover:text-primary transition-colors">Global Transfers</Link></li>
               <li><button onClick={quickAction("API Documentation")} className="hover:text-primary transition-colors">API Documentation</button></li>
            </ul>
          </div>
          <div>
            <h5 className="font-headline font-bold mb-6">Company</h5>
            <ul className="space-y-4 text-sm text-on-surface-variant">
               <li><button onClick={quickAction("About Us")} className="hover:text-primary transition-colors">About Us</button></li>
               <li><button onClick={quickAction("Careers")} className="hover:text-primary transition-colors">Careers</button></li>
               <li><button onClick={quickAction("Newsroom")} className="hover:text-primary transition-colors">Newsroom</button></li>
            </ul>
          </div>
          <div>
            <h5 className="font-headline font-bold mb-6">Support</h5>
            <ul className="space-y-4 text-sm text-on-surface-variant">
               <li><button onClick={quickAction("Help Center")} className="hover:text-primary transition-colors">Help Center</button></li>
               <li><button onClick={quickAction("Contact Sales")} className="hover:text-primary transition-colors">Contact Sales</button></li>
               <li><button onClick={quickAction("Privacy Policy")} className="hover:text-primary transition-colors">Privacy Policy</button></li>
            </ul>
          </div>
        </div>
        <div className="max-w-[1440px] mx-auto pt-16 mt-16 border-t border-outline-variant/10 flex flex-col md:flex-row justify-between items-center gap-4 text-xs font-medium text-outline">
          <div>&copy; 2024 Sovereign Fluidity Framework. All rights reserved.</div>
          <div className="flex gap-8">
            <button onClick={quickAction("Terms of Service")} className="hover:text-on-surface transition-colors">Terms of Service</button>
            <button onClick={quickAction("Compliance")} className="hover:text-on-surface transition-colors">Compliance</button>
          </div>
        </div>
      </footer>
    </div>
  );
}
