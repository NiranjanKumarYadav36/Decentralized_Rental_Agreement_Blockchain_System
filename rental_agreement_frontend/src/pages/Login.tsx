/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { loginUser } from "@/services/api";
import { useAuth } from "@/context/AuthContext";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async () => {
    try {
      setLoading(true);
      setError("");
      const res = await loginUser({ email, password });
      login(res.data);
      if (res.data.role === "landlord") {
        navigate("/dashboard/landlord");
      } else {
        navigate("/dashboard/tenant");
      }
    } catch (err: any) {
      setError(err.response?.data?.message || "Login failed");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white">🏠 Welcome Back</h1>
          <p className="text-purple-300 mt-2">Login to your rental account</p>
        </div>
        <div className="bg-white/10 backdrop-blur rounded-2xl p-8 border border-white/20">
          <div className="space-y-4">
            <div>
              <label className="text-purple-200 text-sm mb-1 block">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-purple-300 outline-none focus:border-purple-400"
              />
            </div>
            <div>
              <label className="text-purple-200 text-sm mb-1 block">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-purple-300 outline-none focus:border-purple-400"
              />
            </div>
            {error && (
              <p className="text-red-400 text-sm">❌ {error}</p>
            )}
            <Button
              onClick={handleLogin}
              disabled={loading}
              className="w-full bg-purple-600 hover:bg-purple-700 text-white py-3 rounded-xl text-lg"
            >
              {loading ? "Logging in..." : "Login"}
            </Button>
            <p className="text-center text-purple-300 text-sm">
              Don't have an account?{" "}
              <Link to="/register" className="text-purple-400 underline hover:text-white">
                Register here
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}