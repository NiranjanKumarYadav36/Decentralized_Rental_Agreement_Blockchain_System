/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { requestAgreement } from "@/services/api";

export default function RequestAgreementButton({ property, user }: any) {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [duration, setDuration] = useState(30);

  const handleRequest = async () => {
    try {
      setLoading(true);
      setError("");

      if (!user.walletAddress) {
        setError("Please add your wallet address in profile first!");
        setLoading(false);
        return;
      }

      await requestAgreement({
        propertyId: property._id,
        durationDays: duration
      });

      setSuccess(true);
      setLoading(false);
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to request agreement");
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="bg-green-500/20 border border-green-500/30 rounded-xl p-4 mt-4 text-center">
        <p className="text-2xl mb-2">🎉</p>
        <p className="text-green-300 font-bold mb-1">
          Request Sent!
        </p>
        <p className="text-green-200 text-sm">
          Landlord will review and approve your request.
          Check your dashboard for updates.
        </p>
      </div>
    );
  }

  return (
    <div className="mt-6 space-y-4 bg-white/5 border border-white/10 rounded-2xl p-6 relative overflow-hidden group">
      <div className="absolute top-0 left-0 w-1 h-full bg-purple-600/30 group-hover:bg-purple-600 transition-colors" />
      
      <div>
        <label className="text-purple-300 text-xs font-bold uppercase tracking-wider mb-2 block">
          Rental Duration
        </label>
        <div className="relative">
          <select
            value={duration}
            onChange={(e) => setDuration(Number(e.target.value))}
            className="w-full bg-[#151520] border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-purple-500/50 appearance-none transition-all cursor-pointer"
          >
            <option value={30}>1 Month (Standard)</option>
            <option value={90}>3 Months (Short Term)</option>
            <option value={180}>6 Months (Mid Term)</option>
            <option value={365}>12 Months (Long Term)</option>
          </select>
          <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-purple-400">
            ▼
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-3">
          <p className="text-red-400 text-xs text-center">❌ {error}</p>
        </div>
      )}

      <Button
        onClick={handleRequest}
        disabled={loading}
        className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white py-6 rounded-xl text-md font-bold shadow-lg shadow-purple-900/30 transition-all hover:scale-[1.02] active:scale-[0.98]"
      >
        {loading ? "Initializing..." : "🤝 Propose Agreement"}
      </Button>

      <div className="flex items-center justify-center gap-2 mt-2">
        <span className="w-1 h-1 bg-purple-500 rounded-full animate-pulse" />
        <p className="text-purple-300/60 text-[10px] font-mono uppercase tracking-tighter">
          Smart Contract Automated Execution
        </p>
      </div>
    </div>
  );
}