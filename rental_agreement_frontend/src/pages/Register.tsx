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
import { AlertCircle, Loader2, UserPlus, ShieldCheck, Fingerprint } from "lucide-react";
import NavBar from "@/components/NavBar";
import ZkBadge from "@/components/ZkBadge";
import { verifyZkIdentity } from "@/services/api";


export default function Register() {
  const [form, setForm] = useState({
    name: "", email: "", password: "",
    phone: "", role: "tenant", walletAddress: ""
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [zkStatus, setZkStatus] = useState<"none" | "generating" | "verifying" | "success">("none");
  const [zkProofData, setZkProofData] = useState<any>(null);
  
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
      
      // If ZK proof was generated during registration, verify it now
      if (zkProofData) {
        setZkStatus("verifying");
        try {
          // Token is now in localStorage via login()
          await verifyZkIdentity({
            proof: zkProofData.proof,
            nullifier: zkProofData.nullifier
          });
          setZkStatus("success");
        } catch (err: any) {
          console.error("ZK Verification failed:", err);
          // Don't block registration if ZK fails, just notify
        }
      }

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

  const simulateZkProof = async () => {
    setZkStatus("generating");
    // Simulate complex proof generation (SnarkJS/Circom)
    await new Promise(r => setTimeout(r, 2000));
    
    const mockProof = "0x" + Math.random().toString(16).slice(2, 42);
    const mockNullifier = "null_" + Math.random().toString(36).slice(2, 10);
    
    setZkProofData({ proof: mockProof, nullifier: mockNullifier });
    setZkStatus("success");
  };

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white overflow-x-hidden">

      {/* BACKGROUND EFFECTS */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl" />
        <div className="absolute top-1/3 right-1/4 w-80 h-80 bg-blue-600/15 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 left-1/3 w-72 h-72 bg-violet-600/10 rounded-full blur-3xl" />
      </div>

      <NavBar />

      {/* REGISTER CARD */}
      <div className="relative z-10 flex items-center justify-center px-4 pt-12 pb-16">
        <div className="w-full max-w-md mt-10">

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

              {/* ZK Identity Verification Section */}
              <div className="pt-2 pb-2">
                <Separator className="bg-white/10 mb-4" />
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Fingerprint className="h-4 w-4 text-purple-400" />
                    <Label className="text-purple-200 text-sm font-semibold tracking-wide">ZK Identity</Label>
                  </div>
                  <ZkBadge verified={zkStatus === "success"} showText size="sm" />
                </div>
                
                {zkStatus === "none" ? (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={simulateZkProof}
                    className="w-full border-purple-500/30 bg-purple-500/5 hover:bg-purple-500/10 text-purple-300 rounded-xl text-xs h-9"
                  >
                    Generate Zero-Knowledge Proof
                  </Button>
                ) : zkStatus === "generating" ? (
                  <div className="text-center py-2 flex items-center justify-center gap-2 text-xs text-purple-400 font-mono">
                    <Loader2 className="h-3 w-3 animate-spin" />
                    Generating snark proof...
                  </div>
                ) : (
                  <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-3 flex items-center gap-3">
                    <ShieldCheck className="h-5 w-5 text-green-400 flex-shrink-0" />
                    <div>
                      <p className="text-[10px] text-green-300 font-bold uppercase tracking-widest">Proof Ready</p>
                      <p className="text-[11px] text-white/70 line-clamp-1 font-mono">{zkProofData?.proof}</p>
                    </div>
                  </div>
                )}
                <p className="text-[10px] text-purple-300/50 mt-2 leading-relaxed">
                  ZK-Proofs allow you to prove your identity without sharing your actual documents on-chain.
                </p>
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