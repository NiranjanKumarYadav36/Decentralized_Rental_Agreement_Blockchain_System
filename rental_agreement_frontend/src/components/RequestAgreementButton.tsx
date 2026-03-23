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
    <div className="mt-4 space-y-3">
      <div>
        <label className="text-purple-200 text-xs mb-1 block">
          Duration (months)
        </label>
        <select
          value={duration}
          onChange={(e) => setDuration(Number(e.target.value))}
          className="w-full bg-slate-800 border border-white/20 rounded-xl px-4 py-2 text-white outline-none"
        >
          <option value={30}>1 Month</option>
          <option value={90}>3 Months</option>
          <option value={180}>6 Months</option>
          <option value={365}>12 Months</option>
        </select>
      </div>

      {error && (
        <p className="text-red-400 text-sm">❌ {error}</p>
      )}

      <Button
        onClick={handleRequest}
        disabled={loading}
        className="w-full bg-green-600 hover:bg-green-700 text-white py-3 rounded-xl text-lg"
      >
        {loading ? "Sending Request..." : "🤝 Request Agreement"}
      </Button>

      <p className="text-purple-300 text-xs text-center">
        ⛓️ Agreement will be secured on Ethereum blockchain
      </p>
    </div>
  );
}