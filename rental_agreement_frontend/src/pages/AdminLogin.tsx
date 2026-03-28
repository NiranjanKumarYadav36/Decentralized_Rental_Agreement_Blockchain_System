import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAdminAuth } from "@/context/AdminAuthContext";
import { adminLoginApi } from "@/services/adminApi";

export default function AdminLogin() {
  const navigate = useNavigate();
  const { adminLogin } = useAdminAuth();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await adminLoginApi(form);
      adminLogin(res.data);
      navigate("/admin/dashboard");
    } catch (err: any) {
      setError(err.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;600;700&family=Inter:wght@300;400;500;600&display=swap');

        * { box-sizing: border-box; margin: 0; padding: 0; }

        .al-root {
          min-height: 100vh;
          background: #060612;
          display: flex;
          align-items: center;
          justify-content: center;
          font-family: 'Inter', sans-serif;
          position: relative;
          overflow: hidden;
        }

        /* Animated grid background */
        .al-grid {
          position: absolute;
          inset: 0;
          background-image:
            linear-gradient(rgba(124,58,237,0.07) 1px, transparent 1px),
            linear-gradient(90deg, rgba(124,58,237,0.07) 1px, transparent 1px);
          background-size: 48px 48px;
          animation: gridPan 20s linear infinite;
        }
        @keyframes gridPan {
          0%   { background-position: 0 0; }
          100% { background-position: 48px 48px; }
        }

        /* Glowing orbs */
        .al-orb {
          position: absolute;
          border-radius: 50%;
          filter: blur(80px);
          opacity: 0.18;
          animation: orbFloat 8s ease-in-out infinite alternate;
        }
        .al-orb-1 { width: 400px; height: 400px; background: #7c3aed; top: -100px; left: -100px; }
        .al-orb-2 { width: 300px; height: 300px; background: #06b6d4; bottom: -80px; right: -80px; animation-delay: -4s; }
        @keyframes orbFloat {
          from { transform: translate(0,0) scale(1); }
          to   { transform: translate(20px,20px) scale(1.1); }
        }

        .al-card {
          position: relative;
          z-index: 10;
          width: 440px;
          background: rgba(13, 13, 26, 0.85);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(124,58,237,0.3);
          border-radius: 20px;
          padding: 48px 40px;
          box-shadow: 0 0 60px rgba(124,58,237,0.15), 0 24px 48px rgba(0,0,0,0.6);
        }

        .al-badge {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          background: rgba(124,58,237,0.15);
          border: 1px solid rgba(124,58,237,0.4);
          border-radius: 100px;
          padding: 6px 14px;
          font-family: 'JetBrains Mono', monospace;
          font-size: 11px;
          color: #a78bfa;
          letter-spacing: 0.08em;
          margin-bottom: 24px;
        }
        .al-badge-dot {
          width: 6px; height: 6px;
          background: #7c3aed;
          border-radius: 50%;
          animation: pulse 2s ease-in-out infinite;
        }
        @keyframes pulse {
          0%,100% { opacity: 1; transform: scale(1); }
          50%      { opacity: 0.4; transform: scale(0.7); }
        }

        .al-title {
          font-family: 'JetBrains Mono', monospace;
          font-size: 28px;
          font-weight: 700;
          color: #fff;
          margin-bottom: 6px;
        }
        .al-sub {
          font-size: 14px;
          color: #6b7280;
          margin-bottom: 36px;
        }

        .al-label {
          display: block;
          font-size: 12px;
          font-weight: 500;
          color: #9ca3af;
          letter-spacing: 0.06em;
          text-transform: uppercase;
          margin-bottom: 8px;
        }
        .al-field-wrap {
          position: relative;
          margin-bottom: 20px;
        }
        .al-input {
          width: 100%;
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(124,58,237,0.2);
          border-radius: 10px;
          padding: 13px 16px;
          color: #e5e7eb;
          font-size: 14px;
          font-family: 'Inter', sans-serif;
          outline: none;
          transition: border-color 0.2s, box-shadow 0.2s;
        }
        .al-input:focus {
          border-color: #7c3aed;
          box-shadow: 0 0 0 3px rgba(124,58,237,0.15);
        }
        .al-input::placeholder { color: #4b5563; }

        .al-eye-btn {
          position: absolute;
          right: 14px; top: 50%; transform: translateY(-50%);
          background: none; border: none; cursor: pointer;
          color: #6b7280; font-size: 16px; line-height: 1;
          transition: color 0.2s;
        }
        .al-eye-btn:hover { color: #a78bfa; }

        .al-error {
          background: rgba(239,68,68,0.1);
          border: 1px solid rgba(239,68,68,0.3);
          border-radius: 8px;
          padding: 10px 14px;
          color: #f87171;
          font-size: 13px;
          margin-bottom: 20px;
        }

        .al-btn {
          width: 100%;
          padding: 14px;
          background: linear-gradient(135deg, #7c3aed, #5b21b6);
          border: none;
          border-radius: 10px;
          color: #fff;
          font-size: 15px;
          font-weight: 600;
          cursor: pointer;
          letter-spacing: 0.03em;
          transition: opacity 0.2s, transform 0.15s, box-shadow 0.2s;
          box-shadow: 0 4px 20px rgba(124,58,237,0.35);
        }
        .al-btn:hover:not(:disabled) {
          opacity: 0.9;
          transform: translateY(-1px);
          box-shadow: 0 6px 28px rgba(124,58,237,0.5);
        }
        .al-btn:active:not(:disabled) { transform: translateY(0); }
        .al-btn:disabled { opacity: 0.55; cursor: not-allowed; }

        .al-divider {
          border: none;
          border-top: 1px solid rgba(124,58,237,0.1);
          margin: 28px 0 16px;
        }
        .al-hint {
          font-size: 12px;
          color: #374151;
          text-align: center;
          font-family: 'JetBrains Mono', monospace;
        }
        .al-spinner {
          display: inline-block;
          width: 16px; height: 16px;
          border: 2px solid rgba(255,255,255,0.3);
          border-top-color: #fff;
          border-radius: 50%;
          animation: spin 0.7s linear infinite;
          vertical-align: middle;
          margin-right: 8px;
        }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>

      <div className="al-root">
        <div className="al-grid" />
        <div className="al-orb al-orb-1" />
        <div className="al-orb al-orb-2" />

        <div className="al-card">
          <div className="al-badge">
            <span className="al-badge-dot" />
            ADMIN PORTAL
          </div>

          <h1 className="al-title">Control Centre</h1>
          <p className="al-sub">Restricted access — authorised personnel only</p>

          <form onSubmit={handleSubmit}>
            <div className="al-field-wrap">
              <label className="al-label">Admin Email</label>
              <input
                id="admin-email"
                className="al-input"
                type="email"
                placeholder="admin@rentalapp.com"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                required
                autoComplete="username"
              />
            </div>

            <div className="al-field-wrap">
              <label className="al-label">Password</label>
              <input
                id="admin-password"
                className="al-input"
                type={showPass ? "text" : "password"}
                placeholder="••••••••"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                required
                autoComplete="current-password"
                style={{ paddingRight: "44px" }}
              />
              <button
                type="button"
                className="al-eye-btn"
                onClick={() => setShowPass(!showPass)}
                aria-label="Toggle password"
              >
                {showPass ? "🙈" : "👁️"}
              </button>
            </div>

            {error && <div className="al-error">⚠ {error}</div>}

            <button id="admin-login-btn" className="al-btn" type="submit" disabled={loading}>
              {loading && <span className="al-spinner" />}
              {loading ? "Authenticating..." : "Access Dashboard"}
            </button>
          </form>

          <hr className="al-divider" />
          <p className="al-hint">🔐 admin@rentalapp.com · Admin@1234</p>
        </div>
      </div>
    </>
  );
}
