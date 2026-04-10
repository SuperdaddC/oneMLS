import Link from "next/link";
import PublicNav from "@/components/PublicNav";
import Footer from "@/components/Footer";
import HeroSearch from "@/components/HeroSearch";
import { getPublicStats } from "@/lib/queries";

export default async function Home() {
  const stats = await getPublicStats();

  const totalListings = stats.totalListings || 12_480;
  const totalStates = stats.totalStates || 28;
  const totalAgents = stats.totalAgents || 3_250;

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white">
      <PublicNav />

      {/* ===== HERO ===== */}
      <section
        className="relative flex items-center justify-center text-center px-4"
        style={{ minHeight: "100vh" }}
      >
        {/* Background gradient */}
        <div
          className="absolute inset-0 -z-10"
          style={{
            background:
              "radial-gradient(ellipse 80% 60% at 50% 40%, rgba(30,58,95,0.5) 0%, #0a0a0f 70%), linear-gradient(to bottom, #0f172a 0%, #0a0a0f 100%)",
          }}
        />

        <div className="max-w-4xl mx-auto animate-fade-in">
          {/* Pill badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-[#c9a962]/30 bg-[#c9a962]/10 text-[#c9a962] text-sm font-medium mb-8">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            </svg>
            Independent of NAR
          </div>

          {/* Headline */}
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight leading-[1.1] mb-6">
            The National MLS
          </h1>

          {/* Subtitle */}
          <p className="text-lg sm:text-xl text-[#94a3b8] max-w-2xl mx-auto mb-10 leading-relaxed">
            One platform. Every state. No barriers. No board fees.
            <br className="hidden sm:block" />
            Just real estate, the way it should be.
          </p>

          {/* Search bar */}
          <HeroSearch />

          {/* CTAs */}
          <div className="flex flex-wrap items-center justify-center gap-4 mt-8">
            <Link
              href="/register"
              className="btn btn-accent btn-lg font-semibold text-base"
            >
              Join as Agent
            </Link>
            <Link
              href="/register?type=seller"
              className="btn btn-outline btn-lg font-semibold text-base border-[#2a2a3a] hover:border-[#c9a962] hover:text-[#c9a962]"
            >
              List Your Property
            </Link>
          </div>
        </div>

        {/* Bottom fade */}
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-b from-transparent to-[#0a0a0f] pointer-events-none" />
      </section>

      {/* ===== STATS BAR ===== */}
      <section className="relative bg-[#161620] border-y border-[#2a2a3a]">
        <div className="max-w-5xl mx-auto px-4 py-12 sm:py-16">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 sm:gap-0 sm:divide-x sm:divide-[#2a2a3a] text-center">
            <div className="animate-fade-in">
              <p className="text-4xl sm:text-5xl font-bold text-[#c9a962]">
                {totalListings.toLocaleString()}
              </p>
              <p className="text-sm text-[#94a3b8] mt-1 tracking-wide uppercase">
                Active Listings
              </p>
            </div>
            <div className="animate-fade-in" style={{ animationDelay: "0.1s" }}>
              <p className="text-4xl sm:text-5xl font-bold text-[#c9a962]">
                {totalStates}
              </p>
              <p className="text-sm text-[#94a3b8] mt-1 tracking-wide uppercase">
                States
              </p>
            </div>
            <div className="animate-fade-in" style={{ animationDelay: "0.2s" }}>
              <p className="text-4xl sm:text-5xl font-bold text-[#c9a962]">
                {totalAgents.toLocaleString()}
              </p>
              <p className="text-sm text-[#94a3b8] mt-1 tracking-wide uppercase">
                Agents
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ===== WHY ONEMLS ===== */}
      <section className="py-24 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16 animate-fade-in">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              Why Agents Choose OneMLS
            </h2>
            <div className="w-16 h-1 bg-[#c9a962] mx-auto rounded-full" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Card 1 - Globe */}
            <div className="bg-[#161620] border border-[#2a2a3a] rounded-xl p-8 hover:border-[#c9a962]/30 transition-colors animate-fade-in">
              <div className="w-12 h-12 rounded-full bg-[#c9a962]/10 border border-[#c9a962]/20 flex items-center justify-center mb-5">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#c9a962" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10" />
                  <ellipse cx="12" cy="12" rx="4" ry="10" />
                  <path d="M2 12h20" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold mb-2">List Anywhere</h3>
              <p className="text-[#94a3b8] text-sm leading-relaxed">
                No territory restrictions. One login, every state.
              </p>
            </div>

            {/* Card 2 - Shield */}
            <div className="bg-[#161620] border border-[#2a2a3a] rounded-xl p-8 hover:border-[#c9a962]/30 transition-colors animate-fade-in" style={{ animationDelay: "0.05s" }}>
              <div className="w-12 h-12 rounded-full bg-[#c9a962]/10 border border-[#c9a962]/20 flex items-center justify-center mb-5">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#c9a962" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold mb-2">Your Listings, Your Leads</h3>
              <p className="text-[#94a3b8] text-sm leading-relaxed">
                We never sell your listing space to competing agents.
              </p>
            </div>

            {/* Card 3 - Megaphone */}
            <div className="bg-[#161620] border border-[#2a2a3a] rounded-xl p-8 hover:border-[#c9a962]/30 transition-colors animate-fade-in" style={{ animationDelay: "0.1s" }}>
              <div className="w-12 h-12 rounded-full bg-[#c9a962]/10 border border-[#c9a962]/20 flex items-center justify-center mb-5">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#c9a962" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="m3 11 18-5v12L3 13v-2z" />
                  <path d="M11.6 16.8a3 3 0 1 1-5.8-1.6" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold mb-2">Marketing Toolkit</h3>
              <p className="text-[#94a3b8] text-sm leading-relaxed">
                Social cards, PDF flyers, property websites &mdash; all auto-generated.
              </p>
            </div>

            {/* Card 4 - Eye */}
            <div className="bg-[#161620] border border-[#2a2a3a] rounded-xl p-8 hover:border-[#c9a962]/30 transition-colors animate-fade-in" style={{ animationDelay: "0.15s" }}>
              <div className="w-12 h-12 rounded-full bg-[#c9a962]/10 border border-[#c9a962]/20 flex items-center justify-center mb-5">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#c9a962" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                  <circle cx="12" cy="12" r="3" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold mb-2">Transparent Commissions</h3>
              <p className="text-[#94a3b8] text-sm leading-relaxed">
                Clear compensation. Buyers see what&apos;s offered. No hidden fees.
              </p>
            </div>

            {/* Card 5 - Unlock */}
            <div className="bg-[#161620] border border-[#2a2a3a] rounded-xl p-8 hover:border-[#c9a962]/30 transition-colors animate-fade-in" style={{ animationDelay: "0.2s" }}>
              <div className="w-12 h-12 rounded-full bg-[#c9a962]/10 border border-[#c9a962]/20 flex items-center justify-center mb-5">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#c9a962" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                  <path d="M7 11V7a5 5 0 0 1 9.9-1" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold mb-2">No NAR Required</h3>
              <p className="text-[#94a3b8] text-sm leading-relaxed">
                Licensed agent? You&apos;re in. No board membership, no association dues.
              </p>
            </div>

            {/* Card 6 - Document */}
            <div className="bg-[#161620] border border-[#2a2a3a] rounded-xl p-8 hover:border-[#c9a962]/30 transition-colors animate-fade-in" style={{ animationDelay: "0.25s" }}>
              <div className="w-12 h-12 rounded-full bg-[#c9a962]/10 border border-[#c9a962]/20 flex items-center justify-center mb-5">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#c9a962" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                  <polyline points="14 2 14 8 20 8" />
                  <line x1="16" y1="13" x2="8" y2="13" />
                  <line x1="16" y1="17" x2="8" y2="17" />
                  <polyline points="10 9 9 9 8 9" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold mb-2">E-Contracts &amp; Showings</h3>
              <p className="text-[#94a3b8] text-sm leading-relaxed">
                Digital contracts, showing management, and lockbox access.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ===== HOW IT WORKS ===== */}
      <section className="py-24 px-4 bg-[#161620]/50">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16 animate-fade-in">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              Get Started in Minutes
            </h2>
            <div className="w-16 h-1 bg-[#c9a962] mx-auto rounded-full" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-4 relative">
            {/* Connecting line (desktop) */}
            <div className="hidden md:block absolute top-10 left-[20%] right-[20%] h-px bg-gradient-to-r from-[#c9a962]/40 via-[#c9a962]/20 to-[#c9a962]/40" />

            {/* Step 1 */}
            <div className="text-center animate-fade-in">
              <div className="relative inline-flex items-center justify-center w-20 h-20 rounded-full border-2 border-[#c9a962]/30 bg-[#0a0a0f] text-[#c9a962] text-3xl font-bold mb-6 mx-auto">
                1
              </div>
              <h3 className="text-lg font-semibold mb-2">Create Your Account</h3>
              <p className="text-[#94a3b8] text-sm leading-relaxed">
                Sign up as an agent or FSBO seller. Free to start.
              </p>
            </div>

            {/* Step 2 */}
            <div className="text-center animate-fade-in" style={{ animationDelay: "0.1s" }}>
              <div className="relative inline-flex items-center justify-center w-20 h-20 rounded-full border-2 border-[#c9a962]/30 bg-[#0a0a0f] text-[#c9a962] text-3xl font-bold mb-6 mx-auto">
                2
              </div>
              <h3 className="text-lg font-semibold mb-2">List Your Properties</h3>
              <p className="text-[#94a3b8] text-sm leading-relaxed">
                Add photos, details, and pricing. We handle the rest.
              </p>
            </div>

            {/* Step 3 */}
            <div className="text-center animate-fade-in" style={{ animationDelay: "0.2s" }}>
              <div className="relative inline-flex items-center justify-center w-20 h-20 rounded-full border-2 border-[#c9a962]/30 bg-[#0a0a0f] text-[#c9a962] text-3xl font-bold mb-6 mx-auto">
                3
              </div>
              <h3 className="text-lg font-semibold mb-2">Close More Deals</h3>
              <p className="text-[#94a3b8] text-sm leading-relaxed">
                Marketing tools, showing management, and e-contracts at your fingertips.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ===== PRICING ===== */}
      <section className="py-24 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16 animate-fade-in">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              Simple, Fair Pricing
            </h2>
            <p className="text-[#94a3b8] text-lg">
              No board fees. No hidden costs. Cancel anytime.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {/* Free */}
            <div className="bg-[#161620] border border-[#2a2a3a] rounded-xl p-8 flex flex-col animate-fade-in">
              <h3 className="text-xl font-semibold mb-1">Free</h3>
              <div className="mb-6">
                <span className="text-4xl font-bold">$0</span>
                <span className="text-[#94a3b8] text-sm">/mo</span>
              </div>
              <ul className="space-y-3 mb-8 flex-1">
                <li className="flex items-start gap-2 text-sm text-[#94a3b8]">
                  <svg className="shrink-0 mt-0.5 text-[#c9a962]" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
                  1 active listing
                </li>
                <li className="flex items-start gap-2 text-sm text-[#94a3b8]">
                  <svg className="shrink-0 mt-0.5 text-[#c9a962]" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
                  Search the MLS
                </li>
                <li className="flex items-start gap-2 text-sm text-[#94a3b8]">
                  <svg className="shrink-0 mt-0.5 text-[#c9a962]" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
                  Basic agent profile
                </li>
              </ul>
              <Link
                href="/register"
                className="btn btn-outline btn-lg w-full justify-center font-semibold"
              >
                Get Started
              </Link>
            </div>

            {/* Pro - Recommended */}
            <div className="bg-[#161620] border-2 border-[#c9a962] rounded-xl p-8 flex flex-col relative animate-fade-in" style={{ animationDelay: "0.1s" }}>
              <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 bg-[#c9a962] text-[#0f172a] text-xs font-bold uppercase tracking-wider rounded-full">
                Recommended
              </div>
              <h3 className="text-xl font-semibold mb-1">Pro</h3>
              <div className="mb-6">
                <span className="text-4xl font-bold">$29</span>
                <span className="text-[#94a3b8] text-sm">/mo</span>
              </div>
              <ul className="space-y-3 mb-8 flex-1">
                <li className="flex items-start gap-2 text-sm text-[#94a3b8]">
                  <svg className="shrink-0 mt-0.5 text-[#c9a962]" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
                  Unlimited listings
                </li>
                <li className="flex items-start gap-2 text-sm text-[#94a3b8]">
                  <svg className="shrink-0 mt-0.5 text-[#c9a962]" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
                  Marketing toolkit
                </li>
                <li className="flex items-start gap-2 text-sm text-[#94a3b8]">
                  <svg className="shrink-0 mt-0.5 text-[#c9a962]" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
                  CMA reports
                </li>
                <li className="flex items-start gap-2 text-sm text-[#94a3b8]">
                  <svg className="shrink-0 mt-0.5 text-[#c9a962]" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
                  E-contracts
                </li>
                <li className="flex items-start gap-2 text-sm text-[#94a3b8]">
                  <svg className="shrink-0 mt-0.5 text-[#c9a962]" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
                  Showing service
                </li>
              </ul>
              <Link
                href="/register?plan=pro"
                className="btn btn-accent btn-lg w-full justify-center font-semibold"
              >
                Start Free Trial
              </Link>
            </div>

            {/* Enterprise */}
            <div className="bg-[#161620] border border-[#2a2a3a] rounded-xl p-8 flex flex-col animate-fade-in" style={{ animationDelay: "0.2s" }}>
              <h3 className="text-xl font-semibold mb-1">Enterprise</h3>
              <div className="mb-6">
                <span className="text-4xl font-bold">$99</span>
                <span className="text-[#94a3b8] text-sm">/mo</span>
              </div>
              <ul className="space-y-3 mb-8 flex-1">
                <li className="flex items-start gap-2 text-sm text-[#94a3b8]">
                  <svg className="shrink-0 mt-0.5 text-[#c9a962]" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
                  Everything in Pro
                </li>
                <li className="flex items-start gap-2 text-sm text-[#94a3b8]">
                  <svg className="shrink-0 mt-0.5 text-[#c9a962]" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
                  API access
                </li>
                <li className="flex items-start gap-2 text-sm text-[#94a3b8]">
                  <svg className="shrink-0 mt-0.5 text-[#c9a962]" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
                  Lead purchasing
                </li>
                <li className="flex items-start gap-2 text-sm text-[#94a3b8]">
                  <svg className="shrink-0 mt-0.5 text-[#c9a962]" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
                  Priority support
                </li>
                <li className="flex items-start gap-2 text-sm text-[#94a3b8]">
                  <svg className="shrink-0 mt-0.5 text-[#c9a962]" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
                  Custom branding
                </li>
              </ul>
              <Link
                href="/contact"
                className="btn btn-outline btn-lg w-full justify-center font-semibold"
              >
                Contact Sales
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ===== FINAL CTA ===== */}
      <section className="py-24 px-4 relative overflow-hidden">
        <div
          className="absolute inset-0 -z-10"
          style={{
            background:
              "radial-gradient(ellipse 70% 50% at 50% 60%, rgba(30,58,95,0.4) 0%, #0a0a0f 70%)",
          }}
        />
        <div className="max-w-3xl mx-auto text-center animate-fade-in">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">
            Ready to join the future of real estate?
          </h2>
          <p className="text-[#94a3b8] text-lg mb-10 leading-relaxed">
            Join thousands of agents who are done paying MLS monopoly fees.
          </p>
          <Link
            href="/register"
            className="btn btn-accent btn-lg font-semibold text-base px-10"
          >
            Create Free Account
          </Link>
        </div>
      </section>

      {/* ===== FOOTER ===== */}
      <Footer />
    </div>
  );
}
