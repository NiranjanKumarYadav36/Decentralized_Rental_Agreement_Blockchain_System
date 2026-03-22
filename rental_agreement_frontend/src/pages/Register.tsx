/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { registerUser } from "@/services/api";
import { useAuth } from "@/context/AuthContext";

export default function Register() {
  const [form, setForm] = useState({
    name: "", email: "", password: "",
    phone: "", role: "tenant", walletAddress: ""
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e: any) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleRegister = async () => {
    try {
      setLoading(true);
      setError("");
      const res = await registerUser(form);
      login(res.data);
      if (res.data.role === "landlord") {
        navigate("/dashboard/landlord");
      } else {
        navigate("/dashboard/tenant");
      }
    } catch (err: any) {
      setError(err.response?.data?.message || "Registration failed");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white">🏠 Create Account</h1>
          <p className="text-purple-300 mt-2">Join the rental platform</p>
        </div>
        <div className="bg-white/10 backdrop-blur rounded-2xl p-8 border border-white/20">
          <div className="space-y-4">
            {[
              { label: "Full Name", name: "name", type: "text", placeholder: "John Doe" },
              { label: "Email", name: "email", type: "email", placeholder: "john@gmail.com" },
              { label: "Password", name: "password", type: "password", placeholder: "••••••••" },
              { label: "Phone", name: "phone", type: "text", placeholder: "9876543210" },
              { label: "Wallet Address (optional)", name: "walletAddress", type: "text", placeholder: "0x..." },
            ].map((field) => (
              <div key={field.name}>
                <label className="text-purple-200 text-sm mb-1 block">{field.label}</label>
                <input
                  type={field.type}
                  name={field.name}
                  value={(form as any)[field.name]}
                  onChange={handleChange}
                  placeholder={field.placeholder}
                  className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-purple-300 outline-none focus:border-purple-400"
                />
              </div>
            ))}
            <div>
              <label className="text-purple-200 text-sm mb-1 block">Role</label>
              <select
                name="role"
                value={form.role}
                onChange={handleChange}
                className="w-full bg-slate-800 border border-white/20 rounded-xl px-4 py-3 text-white outline-none"
              >
                <option value="tenant">🏡 Tenant</option>
                <option value="landlord">👔 Landlord</option>
              </select>
            </div>
            {error && <p className="text-red-400 text-sm">❌ {error}</p>}
            <Button
              onClick={handleRegister}
              disabled={loading}
              className="w-full bg-purple-600 hover:bg-purple-700 text-white py-3 rounded-xl text-lg"
            >
              {loading ? "Creating account..." : "Register"}
            </Button>
            <p className="text-center text-purple-300 text-sm">
              Already have an account?{" "}
              <Link to="/login" className="text-purple-400 underline hover:text-white">
                Login here
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}