/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { registerUser } from "@/services/api";
import { useAuth } from "@/context/AuthContext";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertCircle, Loader2, UserPlus } from "lucide-react";
import Navbar from "@/components/Navbar";

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
    <div className="min-h-screen bg-[#0a0a0f] text-white overflow-x-hidden">

      {/* BACKGROUND EFFECTS */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl" />
        <div className="absolute top-1/3 right-1/4 w-80 h-80 bg-blue-600/15 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 left-1/3 w-72 h-72 bg-violet-600/10 rounded-full blur-3xl" />
      </div>

      <Navbar />

      {/* REGISTER CARD */}
      <div className="relative z-10 flex items-center justify-center px-4 pt-12 pb-16">
        <div className="w-full max-w-md">

          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-white tracking-tight">Create Account</h1>
            <p className="text-purple-300 mt-2 text-sm">Join the decentralized rental platform</p>
          </div>

          <Card className="bg-white/5 border-white/10 text-white shadow-2xl shadow-purple-900/20 backdrop-blur-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-white text-lg">Register</CardTitle>
              <CardDescription className="text-purple-300/80">
                Fill in your details to get started
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-4 pt-2">
              {[
                { label: "Full Name", name: "name", type: "text", placeholder: "John Doe" },
                { label: "Email", name: "email", type: "email", placeholder: "john@gmail.com" },
                { label: "Password", name: "password", type: "password", placeholder: "••••••••" },
                { label: "Phone", name: "phone", type: "text", placeholder: "9876543210" },
                { label: "Wallet Address (optional)", name: "walletAddress", type: "text", placeholder: "0x..." },
              ].map((field) => (
                <div key={field.name} className="space-y-2">
                  <Label htmlFor={field.name} className="text-purple-200 text-sm">
                    {field.label}
                  </Label>
                  <Input
                    id={field.name}
                    type={field.type}
                    name={field.name}
                    value={(form as any)[field.name]}
                    onChange={handleChange}
                    placeholder={field.placeholder}
                    className="bg-white/10 border-white/20 text-white placeholder:text-purple-300/50 focus-visible:ring-purple-500 focus-visible:border-purple-400 rounded-xl"
                  />
                </div>
              ))}

              {/* Role Select */}
              <div className="space-y-2">
                <Label className="text-purple-200 text-sm">Role</Label>
                <Select
                  value={form.role}
                  onValueChange={(value) => setForm({ ...form, role: value })}
                >
                  <SelectTrigger className="bg-white/10 border-white/20 text-white focus:ring-purple-500 rounded-xl">
                    <SelectValue placeholder="Select your role" />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-900 border-white/20">
                    <SelectItem value="tenant" className="text-white focus:bg-purple-600/30 focus:text-white cursor-pointer">
                      🏡 Tenant
                    </SelectItem>
                    <SelectItem value="landlord" className="text-white focus:bg-purple-600/30 focus:text-white cursor-pointer">
                      👔 Landlord
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {error && (
                <Alert variant="destructive" className="bg-red-500/10 border-red-500/30 text-red-300">
                  <AlertCircle className="h-4 w-4 text-red-400" />
                  <AlertDescription className="text-red-300 text-sm">
                    {error}
                  </AlertDescription>
                </Alert>
              )}

              <Button
                onClick={handleRegister}
                disabled={loading}
                className="w-full bg-purple-600 hover:bg-purple-700 text-white py-3 rounded-xl text-base font-semibold transition-all duration-200"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating account...
                  </>
                ) : (
                  <>
                    <UserPlus className="mr-2 h-4 w-4" />
                    Register
                  </>
                )}
              </Button>
            </CardContent>

            <CardFooter className="flex flex-col gap-4 pt-0">
              <Separator className="bg-white/10" />
              <p className="text-center text-purple-300 text-sm w-full">
                Already have an account?{" "}
                <Link
                  to="/login"
                  className="text-purple-400 underline underline-offset-4 hover:text-white transition-colors"
                >
                  Login here
                </Link>
              </p>
            </CardFooter>
          </Card>

        </div>
      </div>
    </div>
  );
}