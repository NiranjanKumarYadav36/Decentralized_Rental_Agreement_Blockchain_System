/* eslint-disable @typescript-eslint/no-explicit-any */
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Navbar from "@/components/Navbar";

export default function Landing() {
  const navigate = useNavigate();

  const features = [
    {
      icon: "⛓️",
      title: "Blockchain Secured",
      desc: "Every agreement is stored on Ethereum blockchain — tamper proof and permanent."
    },
    {
      icon: "🤝",
      title: "No Middlemen",
      desc: "Smart contracts handle rent, deposits and disputes automatically without lawyers."
    },
    {
      icon: "💸",
      title: "Auto Payments",
      desc: "Rent payments go directly to landlord. Deposits locked and returned automatically."
    },
    {
      icon: "⚖️",
      title: "Dispute Resolution",
      desc: "Raise and resolve disputes transparently on blockchain with full audit trail."
    },
    {
      icon: "🔐",
      title: "Wallet Login",
      desc: "Login with MetaMask. Your identity is your wallet — no passwords needed."
    },
    {
      icon: "📋",
      title: "Digital Agreements",
      desc: "Sign rental agreements digitally on blockchain. Legally verifiable anytime."
    },
  ];

  const steps = [
    { num: "01", title: "Register", desc: "Create your account as landlord or tenant" },
    { num: "02", title: "Browse", desc: "Tenants browse available properties" },
    { num: "03", title: "Connect", desc: "Connect MetaMask wallet to the platform" },
    { num: "04", title: "Sign", desc: "Sign agreement and pay deposit on blockchain" },
    { num: "05", title: "Pay Rent", desc: "Pay monthly rent directly via smart contract" },
    { num: "06", title: "Exit", desc: "Terminate agreement and get deposit back automatically" },
  ];

  const stats = [
    { value: "100%", label: "Transparent" },
    { value: "0", label: "Middlemen" },
    { value: "ETH", label: "Powered" },
  ];

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white overflow-x-hidden">

      {/* ── BACKGROUND EFFECTS ── */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl" />
        <div className="absolute top-1/3 right-1/4 w-80 h-80 bg-blue-600/15 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 left-1/3 w-72 h-72 bg-violet-600/10 rounded-full blur-3xl" />
        {/* subtle grid texture */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px),
                              linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)`,
            backgroundSize: "64px 64px",
          }}
        />
      </div>

      <Navbar />

      {/* ── HERO ── */}
      <section className="relative z-10 max-w-6xl mx-auto px-8 pt-24 pb-32 text-center">

        {/* Live badge */}
        <div className="inline-flex items-center gap-2 bg-purple-500/10 border border-purple-500/20 rounded-full px-4 py-2 mb-8 relative overflow-hidden">
          {/* shimmer sweep */}
          <span
            className="absolute inset-0 -translate-x-full animate-[shimmer_2.5s_infinite] bg-gradient-to-r from-transparent via-purple-400/10 to-transparent"
            style={{ animation: "shimmer 2.5s infinite" }}
          />
          <style>{`
            @keyframes shimmer {
              0%   { transform: translateX(-100%); }
              100% { transform: translateX(200%); }
            }
          `}</style>
          <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse relative z-10" />
          <span className="text-purple-300 text-sm relative z-10">
            Live on Ethereum Sepolia Testnet
          </span>
        </div>

        <h1 className="text-6xl md:text-7xl font-black mb-6 leading-tight tracking-tight">
          Rent Smarter with{" "}
          <span className="bg-gradient-to-r from-purple-400 via-violet-400 to-blue-400 bg-clip-text text-transparent">
            Blockchain
          </span>
        </h1>

        <p className="text-xl text-gray-400 max-w-2xl mx-auto mb-12 leading-relaxed">
          The first decentralized rental platform where agreements, payments
          and disputes are handled by smart contracts — no middlemen, no fraud.
        </p>

        <div className="flex items-center justify-center gap-4 flex-wrap">
          <Button
            onClick={() => navigate("/register")}
            className="bg-purple-600 hover:bg-purple-700 text-white px-10 py-4 rounded-2xl text-lg font-semibold shadow-xl shadow-purple-900/40 hover:shadow-purple-700/40 hover:-translate-y-0.5 transition-all duration-200"
          >
            Start For Free →
          </Button>
          <Button
            variant="ghost"
            onClick={() => navigate("/properties")}
            className="border border-white/15 hover:border-white/30 hover:bg-white/10 text-white px-10 py-4 rounded-2xl text-lg transition-all duration-200"
          >
            Browse Properties
          </Button>
        </div>

        {/* ── STATS ── */}
        <div className="grid grid-cols-3 gap-6 max-w-2xl mx-auto mt-20">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="bg-white/5 border border-white/10 rounded-2xl p-6 relative overflow-hidden group hover:border-purple-500/30 transition-all duration-300"
            >
              {/* top accent line */}
              <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-purple-500/60 to-transparent" />
              <p className="text-3xl font-black text-purple-400 mb-1">{stat.value}</p>
              <p className="text-gray-400 text-sm">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section className="relative z-10 max-w-6xl mx-auto px-8 py-24">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-black mb-4 tracking-tight">Why Choose RentalChain?</h2>
          <p className="text-gray-400 text-lg">Built on blockchain for maximum trust and transparency</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, i) => (
            <div
              key={feature.title}
              className="bg-white/5 border border-white/10 rounded-2xl p-6 hover:border-purple-500/40 hover:bg-purple-500/5 hover:-translate-y-1 transition-all duration-300 group relative overflow-hidden"
            >
              {/* subtle corner glow on hover */}
              <div className="absolute -top-10 -right-10 w-24 h-24 bg-purple-600/10 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

              {/* icon pill */}
              <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-2xl mb-4 group-hover:border-purple-500/30 transition-colors duration-300">
                {feature.icon}
              </div>

              <h3 className="text-lg font-bold text-white mb-2">{feature.title}</h3>
              <p className="text-gray-400 text-sm leading-relaxed">{feature.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section className="relative z-10 max-w-6xl mx-auto px-8 py-24">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-black mb-4 tracking-tight">How It Works</h2>
          <p className="text-gray-400 text-lg">Simple 6-step process to get started</p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
          {steps.map((step, i) => (
            <div
              key={step.num}
              className="bg-white/5 border border-white/10 rounded-2xl p-6 relative overflow-hidden hover:border-purple-500/30 hover:bg-purple-500/5 transition-all duration-300 group"
            >
              {/* large ghost step number */}
              <span className="text-7xl font-black text-white/[0.04] absolute -bottom-2 right-3 leading-none select-none group-hover:text-purple-400/10 transition-colors duration-300">
                {step.num}
              </span>

              {/* step badge */}
              <Badge
                variant="outline"
                className="border-purple-500/40 text-purple-400 font-mono text-xs mb-3 bg-purple-500/10"
              >
                STEP {step.num}
              </Badge>

              <h3 className="text-lg font-bold text-white mb-2">{step.title}</h3>
              <p className="text-gray-400 text-sm leading-relaxed">{step.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="relative z-10 max-w-4xl mx-auto px-8 py-24 text-center">
        <div className="bg-gradient-to-br from-purple-900/40 to-blue-900/40 border border-purple-500/20 rounded-3xl p-16 relative overflow-hidden">
          {/* grid texture inside CTA */}
          <div
            className="absolute inset-0 opacity-[0.04] rounded-3xl"
            style={{
              backgroundImage: `linear-gradient(rgba(255,255,255,0.8) 1px, transparent 1px),
                                linear-gradient(90deg, rgba(255,255,255,0.8) 1px, transparent 1px)`,
              backgroundSize: "40px 40px",
            }}
          />
          {/* top accent glow */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-px bg-gradient-to-r from-transparent via-purple-400/60 to-transparent" />

          <div className="relative z-10">
            <h2 className="text-4xl font-black mb-4 tracking-tight">
              Ready to Rent on Blockchain?
            </h2>
            <p className="text-gray-400 text-lg mb-8 max-w-xl mx-auto">
              Join RentalChain today and experience the future of rental agreements
            </p>
            <div className="flex gap-4 justify-center flex-wrap">
              <Button
                onClick={() => navigate("/register")}
                className="bg-purple-600 hover:bg-purple-700 text-white px-10 py-4 rounded-2xl text-lg font-semibold shadow-xl shadow-purple-900/40 hover:-translate-y-0.5 transition-all duration-200"
              >
                Create Account →
              </Button>
              <Button
                variant="ghost"
                onClick={() => navigate("/properties")}
                className="border border-white/20 hover:border-white/40 hover:bg-white/10 text-white px-10 py-4 rounded-2xl text-lg transition-all duration-200"
              >
                View Properties
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="relative z-10 border-t border-white/5 px-8 py-8">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xl">🏠</span>
            <span className="font-bold text-white tracking-tight">RentalChain</span>
          </div>

          <div className="text-center">
            <p className="text-gray-600 text-xs">Built on Ethereum Blockchain</p>
            <p className="text-gray-500 text-xs mt-0.5">Don Bosco Institute of Technology</p>
          </div>

          <div className="flex gap-4 text-gray-500 text-sm">
            <button onClick={() => navigate("/properties")} className="hover:text-white transition-colors duration-200">
              Browse
            </button>
            <button onClick={() => navigate("/login")} className="hover:text-white transition-colors duration-200">
              Login
            </button>
            <button onClick={() => navigate("/register")} className="hover:text-white transition-colors duration-200">
              Register
            </button>
          </div>
        </div>
      </footer>

    </div>
  );
}