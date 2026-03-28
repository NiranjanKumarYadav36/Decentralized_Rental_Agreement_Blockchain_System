/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { loginUser } from "@/services/api";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { AlertCircle, Loader2, LogIn } from "lucide-react";
import NavBar from "@/components/NavBar";


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

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleLogin();
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

      {/* LOGIN CARD */}
      <div className="relative z-10 flex items-center justify-center px-4 pt-20 pb-16">
        <div className="w-full max-w-md">

          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-white tracking-tight">Welcome Back</h1>
            <p className="text-purple-300 mt-2 text-sm">Login to your RentalChain account</p>
          </div>

          <Card className="bg-white/5 border-white/10 text-white shadow-2xl shadow-purple-900/20 backdrop-blur-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-white text-lg">Sign in</CardTitle>
              <CardDescription className="text-purple-300/80">
                Enter your credentials to access your dashboard
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-5 pt-2">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-purple-200 text-sm">
                  Email address
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="your@email.com"
                  className="bg-white/10 border-white/20 text-white placeholder:text-purple-300/50 focus-visible:ring-purple-500 focus-visible:border-purple-400 rounded-xl"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-purple-200 text-sm">
                  Password
                </Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="••••••••"
                  className="bg-white/10 border-white/20 text-white placeholder:text-purple-300/50 focus-visible:ring-purple-500 focus-visible:border-purple-400 rounded-xl"
                />
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
                onClick={handleLogin}
                disabled={loading}
                className="w-full bg-purple-600 hover:bg-purple-700 text-white py-3 rounded-xl text-base font-semibold transition-all duration-200"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Logging in...
                  </>
                ) : (
                  <>
                    <LogIn className="mr-2 h-4 w-4" />
                    Login
                  </>
                )}
              </Button>
            </CardContent>

            <CardFooter className="flex flex-col gap-4 pt-0">
              <Separator className="bg-white/10" />
              <p className="text-center text-purple-300 text-sm w-full">
                Don't have an account?{" "}
                <Link
                  to="/register"
                  className="text-purple-400 underline underline-offset-4 hover:text-white transition-colors"
                >
                  Register here
                </Link>
              </p>
            </CardFooter>
          </Card>

        </div>
      </div>
    </div>
  );
}