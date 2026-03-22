/* eslint-disable @typescript-eslint/no-explicit-any */
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";

export default function Landing() {
  const navigate = useNavigate();
  const { user } = useAuth();

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

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white overflow-x-hidden">

      {/* BACKGROUND EFFECTS */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl" />
        <div className="absolute top-1/3 right-1/4 w-80 h-80 bg-blue-600/15 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 left-1/3 w-72 h-72 bg-violet-600/10 rounded-full blur-3xl" />
      </div>

      {/* NAVBAR */}
      <nav className="relative z-10 flex items-center justify-between px-8 py-6 border-b border-white/5">
        <div className="flex items-center gap-2">
          <span className="text-2xl">🏠</span>
          <span className="text-xl font-bold text-white">RentalChain</span>
        </div>
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate("/properties")}
            className="text-purple-300 hover:text-white transition-colors text-sm"
          >
            Browse Properties
          </button>
          {user ? (
            <Button
              onClick={() => navigate(
                user.role === "landlord"
                  ? "/dashboard/landlord"
                  : "/dashboard/tenant"
              )}
              className="bg-purple-600 hover:bg-purple-700 text-white rounded-xl px-6"
            >
              Dashboard
            </Button>
          ) : (
            <div className="flex gap-3">
              <Button
                onClick={() => navigate("/login")}
                className="bg-white/10 hover:bg-white/20 text-white rounded-xl px-6"
              >
                Login
              </Button>
              <Button
                onClick={() => navigate("/register")}
                className="bg-purple-600 hover:bg-purple-700 text-white rounded-xl px-6"
              >
                Get Started
              </Button>
            </div>
          )}
        </div>
      </nav>

      {/* HERO */}
      <section className="relative z-10 max-w-6xl mx-auto px-8 pt-24 pb-32 text-center">
        <div className="inline-flex items-center gap-2 bg-purple-500/10 border border-purple-500/20 rounded-full px-4 py-2 mb-8">
          <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
          <span className="text-purple-300 text-sm">
            Live on Ethereum Sepolia Testnet
          </span>
        </div>

        <h1 className="text-6xl md:text-7xl font-black mb-6 leading-tight">
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
            className="bg-purple-600 hover:bg-purple-700 text-white px-10 py-4 rounded-2xl text-lg font-semibold"
          >
            Start For Free →
          </Button>
          <Button
            onClick={() => navigate("/properties")}
            className="bg-white/10 hover:bg-white/20 text-white px-10 py-4 rounded-2xl text-lg"
          >
            Browse Properties
          </Button>
        </div>

        {/* STATS */}
        <div className="grid grid-cols-3 gap-6 max-w-2xl mx-auto mt-20">
          {[
            { value: "100%", label: "Transparent" },
            { value: "0", label: "Middlemen" },
            { value: "ETH", label: "Powered" },
          ].map((stat) => (
            <div
              key={stat.label}
              className="bg-white/5 border border-white/10 rounded-2xl p-6"
            >
              <p className="text-3xl font-black text-purple-400 mb-1">
                {stat.value}
              </p>
              <p className="text-gray-400 text-sm">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* FEATURES */}
      <section className="relative z-10 max-w-6xl mx-auto px-8 py-24">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-black mb-4">
            Why Choose RentalChain?
          </h2>
          <p className="text-gray-400 text-lg">
            Built on blockchain for maximum trust and transparency
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="bg-white/5 border border-white/10 rounded-2xl p-6 hover:border-purple-500/40 hover:bg-purple-500/5 transition-all"
            >
              <div className="text-4xl mb-4">{feature.icon}</div>
              <h3 className="text-lg font-bold text-white mb-2">
                {feature.title}
              </h3>
              <p className="text-gray-400 text-sm leading-relaxed">
                {feature.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="relative z-10 max-w-6xl mx-auto px-8 py-24">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-black mb-4">How It Works</h2>
          <p className="text-gray-400 text-lg">
            Simple 6 step process to get started
          </p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
          {steps.map((step) => (
            <div
              key={step.num}
              className="bg-white/5 border border-white/10 rounded-2xl p-6 relative overflow-hidden"
            >
              <span className="text-6xl font-black text-white/5 absolute top-2 right-4">
                {step.num}
              </span>
              <p className="text-purple-400 font-mono text-sm mb-2">
                STEP {step.num}
              </p>
              <h3 className="text-lg font-bold text-white mb-2">
                {step.title}
              </h3>
              <p className="text-gray-400 text-sm">{step.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="relative z-10 max-w-4xl mx-auto px-8 py-24 text-center">
        <div className="bg-gradient-to-br from-purple-900/40 to-blue-900/40 border border-purple-500/20 rounded-3xl p-16">
          <h2 className="text-4xl font-black mb-4">
            Ready to Rent on Blockchain?
          </h2>
          <p className="text-gray-400 text-lg mb-8">
            Join RentalChain today and experience the future of rental agreements
          </p>
          <div className="flex gap-4 justify-center">
            <Button
              onClick={() => navigate("/register")}
              className="bg-purple-600 hover:bg-purple-700 text-white px-10 py-4 rounded-2xl text-lg font-semibold"
            >
              Create Account →
            </Button>
            <Button
              onClick={() => navigate("/properties")}
              className="bg-white/10 hover:bg-white/20 text-white px-10 py-4 rounded-2xl text-lg"
            >
              View Properties
            </Button>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="relative z-10 border-t border-white/5 px-8 py-8">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xl">🏠</span>
            <span className="font-bold text-white">RentalChain</span>
          </div>
          <p className="text-gray-500 text-sm">
            Built on Ethereum Blockchain • Don Bosco Institute of Technology
          </p>
          <div className="flex gap-4 text-gray-500 text-sm">
            <button onClick={() => navigate("/properties")} className="hover:text-white transition-colors">
              Browse
            </button>
            <button onClick={() => navigate("/login")} className="hover:text-white transition-colors">
              Login
            </button>
            <button onClick={() => navigate("/register")} className="hover:text-white transition-colors">
              Register
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}