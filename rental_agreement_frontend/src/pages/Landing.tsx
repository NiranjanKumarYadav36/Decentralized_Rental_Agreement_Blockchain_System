/* eslint-disable @typescript-eslint/no-explicit-any */
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import NavBar from "@/components/NavBar";

export default function Landing() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const features = [
    { icon: "⛓️", title: "Blockchain Secured",    desc: "Every agreement is stored on Ethereum blockchain — tamper proof and permanent.", color: "#7c3aed" },
    { icon: "🤝", title: "No Middlemen",           desc: "Smart contracts handle rent, deposits and disputes automatically without lawyers.", color: "#06b6d4" },
    { icon: "💸", title: "Auto Payments",          desc: "Rent payments go directly to landlord. Deposits locked and returned automatically.", color: "#10b981" },
    { icon: "⚖️", title: "Dispute Resolution",     desc: "Raise and resolve disputes transparently on blockchain with full audit trail.", color: "#f59e0b" },
    { icon: "🔐", title: "MetaMask Login",         desc: "Login with MetaMask. Your identity is your wallet — no passwords needed.", color: "#ec4899" },
    { icon: "📋", title: "Digital Agreements",     desc: "Sign rental agreements digitally on blockchain. Legally verifiable anytime.", color: "#8b5cf6" },
  ];

  const steps = [
    { num: "01", title: "Register",  desc: "Create your account as landlord or tenant", icon: "👤" },
    { num: "02", title: "Browse",    desc: "Tenants browse available properties",        icon: "🔍" },
    { num: "03", title: "Connect",   desc: "Connect MetaMask wallet to the platform",   icon: "🦊" },
    { num: "04", title: "Sign",      desc: "Sign agreement and pay deposit on-chain",   icon: "✍️" },
    { num: "05", title: "Pay Rent",  desc: "Pay monthly rent directly via smart contract", icon: "💰" },
    { num: "06", title: "Exit",      desc: "Terminate and get deposit back automatically", icon: "🔓" },
  ];

  const stats = [
    { value: "100%", label: "Transparent",  icon: "🔍", color: "#7c3aed" },
    { value: "0",    label: "Middlemen",    icon: "🚫", color: "#06b6d4" },
    { value: "ETH",  label: "Powered",      icon: "⚡", color: "#10b981" },
    { value: "∞",    label: "Trustless",    icon: "🔐", color: "#f59e0b" },
  ];

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&family=Space+Grotesk:wght@400;500;600;700&display=swap');

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        .lp-root {
          min-height: 100vh;
          background: #07070f;
          color: #fff;
          font-family: 'Inter', sans-serif;
          overflow-x: hidden;
        }


        /* ── Background ── */
        .lp-bg {
          position: fixed; inset: 0; pointer-events: none; z-index: 0; overflow: hidden;
        }
        .lp-bg-orb {
          position: absolute; border-radius: 50%; filter: blur(100px); opacity: 0.15;
          animation: orbDrift 12s ease-in-out infinite alternate;
        }
        .lp-bg-orb-1 { width: 600px; height: 600px; background: #7c3aed; top: -200px; left: -100px; }
        .lp-bg-orb-2 { width: 400px; height: 400px; background: #06b6d4; top: 30%; right: -150px; animation-delay: -6s; }
        .lp-bg-orb-3 { width: 350px; height: 350px; background: #4f46e5; bottom: 10%; left: 20%; animation-delay: -3s; }
        @keyframes orbDrift { from { transform: translate(0,0); } to { transform: translate(30px, 20px); } }
        .lp-bg-grid {
          position: absolute; inset: 0;
          background-image: linear-gradient(rgba(124,58,237,0.05) 1px, transparent 1px),
                            linear-gradient(90deg, rgba(124,58,237,0.05) 1px, transparent 1px);
          background-size: 72px 72px;
        }

        /* ── Hero ── */
        .lp-hero {
          position: relative; z-index: 10;
          min-height: 100vh;
          display: flex; flex-direction: column; align-items: center; justify-content: center;
          text-align: center; padding: 120px 24px 80px;
        }
        .lp-hero-badge {
          display: inline-flex; align-items: center; gap: 8px;
          background: rgba(124,58,237,0.12); border: 1px solid rgba(124,58,237,0.3);
          border-radius: 100px; padding: 6px 16px; margin-bottom: 32px;
          font-size: 13px; color: #c4b5fd; letter-spacing: 0.03em;
        }
        .lp-hero-badge-dot {
          width: 7px; height: 7px; background: #10b981; border-radius: 50%;
          animation: livePulse 2s ease-in-out infinite;
          box-shadow: 0 0 8px #10b981;
        }
        @keyframes livePulse { 0%,100%{opacity:1; transform:scale(1);} 50%{opacity:0.4; transform:scale(0.7);} }

        .lp-hero-title {
          font-family: 'Space Grotesk', sans-serif;
          font-size: clamp(48px, 7vw, 88px);
          font-weight: 700; line-height: 1.05; letter-spacing: -0.03em;
          color: #fff; margin-bottom: 24px; max-width: 900px;
        }
        .lp-hero-title-gradient {
          background: linear-gradient(135deg, #a78bfa 0%, #818cf8 40%, #67e8f9 100%);
          -webkit-background-clip: text; -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        .lp-hero-sub {
          font-size: 19px; color: #9ca3af; max-width: 560px; line-height: 1.7;
          margin-bottom: 40px; font-weight: 400;
        }
        .lp-hero-btns { display: flex; align-items: center; gap: 14px; flex-wrap: wrap; justify-content: center; margin-bottom: 72px; }
        .lp-btn-primary {
          display: inline-flex; align-items: center; gap: 8px;
          padding: 14px 32px; border-radius: 12px; font-size: 16px; font-weight: 600;
          background: linear-gradient(135deg, #7c3aed, #4f46e5);
          color: #fff; border: none; cursor: pointer; font-family: 'Inter', sans-serif;
          box-shadow: 0 8px 32px rgba(124,58,237,0.4);
          transition: all 0.2s;
        }
        .lp-btn-primary:hover { transform: translateY(-2px); box-shadow: 0 12px 40px rgba(124,58,237,0.5); }
        .lp-btn-secondary {
          display: inline-flex; align-items: center; gap: 8px;
          padding: 14px 32px; border-radius: 12px; font-size: 16px; font-weight: 500;
          background: rgba(255,255,255,0.05); color: #fff;
          border: 1px solid rgba(255,255,255,0.12); cursor: pointer; font-family: 'Inter', sans-serif;
          transition: all 0.2s;
        }
        .lp-btn-secondary:hover { background: rgba(255,255,255,0.09); border-color: rgba(255,255,255,0.2); }

        /* ── Stats ── */
        .lp-stats {
          display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px;
          width: 100%; max-width: 760px;
        }
        .lp-stat {
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 16px; padding: 20px 16px; text-align: center;
          position: relative; overflow: hidden; transition: all 0.3s;
        }
        .lp-stat:hover { border-color: rgba(124,58,237,0.3); transform: translateY(-3px); }
        .lp-stat::before {
          content: ''; position: absolute; top: 0; left: 0; right: 0; height: 2px;
          background: var(--sc); opacity: 0.8;
        }
        .lp-stat-icon { font-size: 20px; margin-bottom: 8px; }
        .lp-stat-value { font-family: 'Space Grotesk', sans-serif; font-size: 28px; font-weight: 700; }
        .lp-stat-label { font-size: 12px; color: #6b7280; margin-top: 4px; }

        /* ── Section ── */
        .lp-section { position: relative; z-index: 10; padding: 96px 24px; }
        .lp-section-inner { max-width: 1160px; margin: 0 auto; }
        .lp-section-head { text-align: center; margin-bottom: 60px; }
        .lp-section-eyebrow {
          display: inline-flex; align-items: center; gap: 8px;
          font-size: 12px; font-weight: 600; letter-spacing: 0.1em;
          text-transform: uppercase; color: #7c3aed;
          background: rgba(124,58,237,0.1); border: 1px solid rgba(124,58,237,0.2);
          border-radius: 100px; padding: 5px 14px; margin-bottom: 20px;
        }
        .lp-section-title {
          font-family: 'Space Grotesk', sans-serif;
          font-size: clamp(32px, 4vw, 48px); font-weight: 700;
          letter-spacing: -0.02em; color: #fff; margin-bottom: 16px;
        }
        .lp-section-sub { font-size: 17px; color: #6b7280; max-width: 500px; margin: 0 auto; line-height: 1.65; }

        /* ── Feature cards ── */
        .lp-features-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 18px; }
        @media(max-width: 900px) { .lp-features-grid { grid-template-columns: 1fr 1fr; } .lp-stats { grid-template-columns: repeat(2, 1fr); } }
        @media(max-width: 600px) { .lp-features-grid { grid-template-columns: 1fr; } .lp-stats { grid-template-columns: repeat(2,1fr); } }

        .lp-feat-card {
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.07);
          border-radius: 18px; padding: 28px;
          position: relative; overflow: hidden;
          transition: all 0.3s; cursor: default;
        }
        .lp-feat-card:hover {
          border-color: rgba(124,58,237,0.3);
          background: rgba(124,58,237,0.05);
          transform: translateY(-4px);
          box-shadow: 0 20px 40px rgba(0,0,0,0.3);
        }
        .lp-feat-card::after {
          content: '';
          position: absolute; top: -60px; right: -60px;
          width: 120px; height: 120px; border-radius: 50%;
          background: var(--fc); opacity: 0;
          filter: blur(40px); transition: opacity 0.3s;
        }
        .lp-feat-card:hover::after { opacity: 0.15; }
        .lp-feat-icon-wrap {
          width: 48px; height: 48px; border-radius: 12px;
          background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.08);
          display: flex; align-items: center; justify-content: center;
          font-size: 22px; margin-bottom: 18px;
          transition: border-color 0.3s;
        }
        .lp-feat-card:hover .lp-feat-icon-wrap { border-color: var(--fc); }
        .lp-feat-title { font-size: 16px; font-weight: 700; color: #f1f5f9; margin-bottom: 10px; }
        .lp-feat-desc { font-size: 14px; color: #6b7280; line-height: 1.7; }

        /* ── How it works ── */
        .lp-steps-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 18px; }
        @media(max-width: 900px) { .lp-steps-grid { grid-template-columns: repeat(2,1fr); } }
        @media(max-width: 600px) { .lp-steps-grid { grid-template-columns: 1fr; } }

        .lp-step-card {
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.07);
          border-radius: 18px; padding: 28px;
          position: relative; overflow: hidden;
          transition: all 0.3s;
        }
        .lp-step-card:hover {
          border-color: rgba(124,58,237,0.3);
          transform: translateY(-3px);
        }
        .lp-step-num-bg {
          position: absolute; bottom: -12px; right: 12px;
          font-family: 'Space Grotesk', sans-serif;
          font-size: 80px; font-weight: 700;
          color: rgba(255,255,255,0.03); line-height: 1;
          user-select: none; transition: color 0.3s;
        }
        .lp-step-card:hover .lp-step-num-bg { color: rgba(124,58,237,0.07); }
        .lp-step-chip {
          display: inline-flex; align-items: center; gap: 6px;
          background: rgba(124,58,237,0.1); border: 1px solid rgba(124,58,237,0.25);
          border-radius: 100px; padding: 4px 12px;
          font-size: 11px; font-weight: 600; color: #a78bfa;
          letter-spacing: 0.06em; margin-bottom: 16px;
          font-family: 'Space Grotesk', sans-serif;
        }
        .lp-step-icon { font-size: 22px; margin-bottom: 12px; }
        .lp-step-title { font-size: 17px; font-weight: 700; color: #f1f5f9; margin-bottom: 8px; }
        .lp-step-desc { font-size: 13.5px; color: #6b7280; line-height: 1.65; }

        /* ── Divider ── */
        .lp-divider {
          position: relative; z-index: 10; height: 1px;
          background: linear-gradient(90deg, transparent, rgba(124,58,237,0.3), transparent);
          max-width: 1160px; margin: 0 auto;
        }

        /* ── CTA ── */
        .lp-cta-section { position: relative; z-index: 10; padding: 80px 24px; }
        .lp-cta-box {
          max-width: 860px; margin: 0 auto;
          background: linear-gradient(135deg, rgba(124,58,237,0.15), rgba(79,70,229,0.1));
          border: 1px solid rgba(124,58,237,0.25);
          border-radius: 28px; padding: 72px 48px;
          text-align: center; position: relative; overflow: hidden;
        }
        .lp-cta-box::before {
          content: '';
          position: absolute; top: 0; left: 50%; transform: translateX(-50%);
          width: 60%; height: 1px;
          background: linear-gradient(90deg, transparent, rgba(167,139,250,0.6), transparent);
        }
        .lp-cta-box::after {
          content: '';
          position: absolute; inset: 0;
          background-image: linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px),
                            linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px);
          background-size: 40px 40px;
          border-radius: 28px;
        }
        .lp-cta-inner { position: relative; z-index: 2; }
        .lp-cta-title { font-family: 'Space Grotesk', sans-serif; font-size: clamp(28px, 4vw, 44px); font-weight: 700; letter-spacing: -0.02em; color: #fff; margin-bottom: 16px; }
        .lp-cta-sub { font-size: 17px; color: #9ca3af; margin-bottom: 36px; max-width: 480px; margin-left: auto; margin-right: auto; line-height: 1.65; }

        /* ── Footer ── */
        .lp-footer {
          position: relative; z-index: 10;
          border-top: 1px solid rgba(255,255,255,0.05);
          padding: 32px 48px;
        }
        .lp-footer-inner { max-width: 1160px; margin: 0 auto; display: flex; align-items: center; justify-content: space-between; gap: 16px; flex-wrap: wrap; }
        .lp-footer-brand { display: flex; align-items: center; gap: 10px; }
        .lp-footer-brand-icon { width: 28px; height: 28px; border-radius: 8px; background: linear-gradient(135deg,#7c3aed,#4f46e5); display: flex; align-items: center; justify-content: center; font-size: 14px; }
        .lp-footer-brand-name { font-family: 'Space Grotesk', sans-serif; font-size: 15px; font-weight: 700; color: #fff; }
        .lp-footer-center { font-size: 12px; color: #374151; text-align: center; line-height: 1.7; }
        .lp-footer-links { display: flex; gap: 20px; }
        .lp-footer-link { font-size: 13px; color: #6b7280; background: none; border: none; cursor: pointer; transition: color 0.2s; font-family: 'Inter', sans-serif; }
        .lp-footer-link:hover { color: #fff; }
      `}</style>

      <div className="lp-root">

        {/* ── Background ── */}
        <div className="lp-bg">
          <div className="lp-bg-grid" />
          <div className="lp-bg-orb lp-bg-orb-1" />
          <div className="lp-bg-orb lp-bg-orb-2" />
          <div className="lp-bg-orb lp-bg-orb-3" />
        </div>

        {/* ── Navbar ── */}
        <NavBar />

        {/* ── Hero ── */}
        <section className="lp-hero">
          <div className="lp-hero-badge">
            <span className="lp-hero-badge-dot" />
            Live on Ethereum Sepolia Testnet
          </div>

          <h1 className="lp-hero-title">
            Rental Agreements,{" "}
            <span className="lp-hero-title-gradient">Secured on Chain</span>
          </h1>

          <p className="lp-hero-sub">
            The first decentralized rental platform where agreements, payments and disputes are handled by smart contracts — no middlemen, no fraud.
          </p>

          <div className="lp-hero-btns">
            {user ? (
              <>
                <button className="lp-btn-primary" onClick={() => navigate(`/dashboard/${user.role}`)}>
                  Go to Dashboard →
                </button>
                <button className="lp-btn-secondary" onClick={logout}>Logout</button>
              </>
            ) : (
              <>
                <button id="hero-get-started" className="lp-btn-primary" onClick={() => navigate("/register")}>
                  Start For Free →
                </button>
                <button id="hero-browse" className="lp-btn-secondary" onClick={() => navigate("/properties")}>
                  Browse Properties
                </button>
              </>
            )}
          </div>

          {/* Stats */}
          <div className="lp-stats">
            {stats.map((s) => (
              <div className="lp-stat" key={s.label} style={{ "--sc": s.color } as any}>
                <div className="lp-stat-icon">{s.icon}</div>
                <div className="lp-stat-value" style={{ color: s.color }}>{s.value}</div>
                <div className="lp-stat-label">{s.label}</div>
              </div>
            ))}
          </div>
        </section>

        <div className="lp-divider" />

        {/* ── Features ── */}
        <section className="lp-section">
          <div className="lp-section-inner">
            <div className="lp-section-head">
              <div className="lp-section-eyebrow">✦ Why RentalChain</div>
              <h2 className="lp-section-title">Built for Trust &amp; Transparency</h2>
              <p className="lp-section-sub">Powered by Ethereum smart contracts — every action is on-chain, verifiable, and permanent.</p>
            </div>
            <div className="lp-features-grid">
              {features.map((f) => (
                <div className="lp-feat-card" key={f.title} style={{ "--fc": f.color } as any}>
                  <div className="lp-feat-icon-wrap" style={{ borderColor: `${f.color}30` }}>
                    {f.icon}
                  </div>
                  <div className="lp-feat-title">{f.title}</div>
                  <div className="lp-feat-desc">{f.desc}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <div className="lp-divider" />

        {/* ── How It Works ── */}
        <section className="lp-section">
          <div className="lp-section-inner">
            <div className="lp-section-head">
              <div className="lp-section-eyebrow">✦ The Process</div>
              <h2 className="lp-section-title">How It Works</h2>
              <p className="lp-section-sub">Six simple steps from registration to a fully on-chain rental agreement.</p>
            </div>
            <div className="lp-steps-grid">
              {steps.map((step) => (
                <div className="lp-step-card" key={step.num}>
                  <span className="lp-step-num-bg">{step.num}</span>
                  <div className="lp-step-chip">STEP {step.num}</div>
                  <div className="lp-step-icon">{step.icon}</div>
                  <div className="lp-step-title">{step.title}</div>
                  <div className="lp-step-desc">{step.desc}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <div className="lp-divider" />

        {/* ── CTA ── */}
        <section className="lp-cta-section">
          <div className="lp-cta-box">
            <div className="lp-cta-inner">
              <h2 className="lp-cta-title">Ready to Rent on Blockchain?</h2>
              <p className="lp-cta-sub">Join RentalChain today and experience the future of legally-binding, trustless rental agreements.</p>
              <div className="lp-hero-btns">
                {user ? (
                  <>
                    <button className="lp-btn-primary" onClick={() => navigate(`/dashboard/${user.role}`)}>Go to Dashboard →</button>
                    <button className="lp-btn-secondary" onClick={logout}>Logout</button>
                  </>
                ) : (
                  <>
                    <button id="cta-start" className="lp-btn-primary" onClick={() => navigate("/register")}>Start For Free →</button>
                    <button id="cta-browse" className="lp-btn-secondary" onClick={() => navigate("/properties")}>Browse Properties</button>
                  </>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* ── Footer ── */}
        <footer className="lp-footer">
          <div className="lp-footer-inner">
            <div className="lp-footer-brand">
              <div className="lp-footer-brand-icon">🏠</div>
              <span className="lp-footer-brand-name">RentalChain</span>
            </div>
            <div className="lp-footer-center">
              <div>Built on Ethereum Blockchain · Sepolia Testnet</div>
              <div style={{ color: "#1f2937", marginTop: 2 }}>Don Bosco Institute of Technology · Sem 8 Project</div>
            </div>
            <div className="lp-footer-links">
              <button className="lp-footer-link" onClick={() => navigate("/properties")}>Browse</button>
              {user ? (
                <button className="lp-footer-link" onClick={logout}>Logout</button>
              ) : (
                <>
                  <button className="lp-footer-link" onClick={() => navigate("/login")}>Login</button>
                  <button className="lp-footer-link" onClick={() => navigate("/register")}>Register</button>
                </>
              )}
              <button className="lp-footer-link" onClick={() => navigate("/admin/login")}>Admin</button>
            </div>
          </div>
        </footer>

      </div>
    </>
  );
}