/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from "react";
import { ethers } from "ethers";
import { Button } from "@/components/ui/button";
import contractData from "@/contracts/RentalAgreement.json";

const CONTRACT_ADDRESS = contractData.address;
const CONTRACT_ABI = contractData.abi;

// const LANDLORD = "0x31d94a605c498fa39d7e323e03298835281472a6";
// const TENANT = "0x07ccac6b2baadadd3965e2588dc85166eaeeda70";

export default function App() {
  const [account, setAccount] = useState("");
  const [role, setRole] = useState("");
  const [contract, setContract] = useState<any>(null);
  const [details, setDetails] = useState<any>(null);
  const [loading, setLoading] = useState("");
  const [txHash, setTxHash] = useState("");
  const [disputeText, setDisputeText] = useState("");
  const [disputeReason, setDisputeReason] = useState("");
  const [error, setError] = useState("");

  const connectWallet = async () => {
    try {
      setError("");
      if (!window.ethereum) {
        setError("MetaMask not found! Please install it.");
        return;
      }
      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      });
      const userAccount = accounts[0].toLowerCase();

      // console.log("Connected:", userAccount);
      // console.log("Tenant constant:", TENANT);
      // console.log("Match:", userAccount === TENANT);
      setAccount(userAccount);

      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const c = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
      setContract(c);

      // if (userAccount === LANDLORD) setRole("landlord");
      // else if (userAccount === TENANT) setRole("tenant");
      // else setRole("unknown");
      // await loadDetails(c);

      await loadDetails(c, userAccount);

    } catch (err) {
      setError("Failed to connect wallet.");
    }
  };

  const loadDetails = async (c: any, currentAccount?: string) => {
    try {
      const d = await c.getAgreementDetails();
      const agreementData = {
        landlord: d[0],
        tenant: d[1],
        rentAmount: d[2],
        depositAmount: d[3],
        agreementEnd: d[4],
        isActive: d[5],
        totalRentPaid: d[6],
        disputeActive: d[7],
      };
      setDetails(agreementData);

      // Dynamically detect role from blockchain
      const acc = currentAccount || account;
      if (acc === agreementData.landlord.toLowerCase()) {
        setRole("landlord");
      } else if (acc === agreementData.tenant.toLowerCase()) {
        setRole("tenant");
      } else {
        setRole("unknown");
      }

      // Load dispute reason
      const reason = await c.disputeReason();
      setDisputeText(reason);

    } catch {
      setError("Failed to load details.");
    }
  };

  const signAgreement = async () => {
    if (!contract || !details) return;
    try {
      setLoading("Signing agreement & paying deposit...");
      setError("");
      const tx = await contract.signAgreement({ value: details.depositAmount });
      setTxHash(tx.hash);
      await tx.wait();
      setLoading("");
      await loadDetails(contract);
    } catch (err: any) {
      setError(err.reason || err.message || "Transaction failed.");
      setLoading("");
    }
  };

  const payRent = async () => {
    if (!contract || !details) return;
    try {
      setLoading("Paying rent...");
      setError("");
      const tx = await contract.payRent({ value: details.rentAmount });
      setTxHash(tx.hash);
      await tx.wait();
      setLoading("");
      await loadDetails(contract);
    } catch (err: any) {
      setError(err.reason || err.message || "Transaction failed.");
      setLoading("");
    }
  };

  const raiseDispute = async () => {
    if (!contract || !disputeReason) return;
    try {
      setLoading("Raising dispute...");
      setError("");
      const tx = await contract.raiseDispute(disputeReason);
      setTxHash(tx.hash);
      await tx.wait();
      setDisputeReason("");
      setLoading("");
      await loadDetails(contract);
    } catch (err: any) {
      setError(err.reason || err.message || "Transaction failed.");
      setLoading("");
    }
  };

  const resolveDispute = async (returnDeposit: boolean) => {
    if (!contract) return;
    try {
      setLoading("Resolving dispute...");
      setError("");
      const tx = await contract.resolveDispute(returnDeposit);
      setTxHash(tx.hash);
      await tx.wait();
      setLoading("");
      await loadDetails(contract);
    } catch (err: any) {
      setError(err.reason || err.message || "Transaction failed.");
      setLoading("");
    }
  };

  const terminateAgreement = async () => {
    if (!contract) return;
    try {
      setLoading("Terminating agreement...");
      setError("");
      const tx = await contract.terminateAgreement();
      setTxHash(tx.hash);
      await tx.wait();
      setLoading("");
      await loadDetails(contract);
    } catch (err: any) {
      setError(err.reason || err.message || "Transaction failed.");
      setLoading("");
    }
  };

  const fmt = (val: any) => ethers.formatEther(val) + " ETH";
  const fmtDate = (val: any) =>
    new Date(Number(val) * 1000).toLocaleDateString();
  const short = (addr: string) =>
    addr ? addr.slice(0, 6) + "..." + addr.slice(-4) : "";

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="max-w-4xl mx-auto px-4 py-10">

        {/* HEADER */}
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold text-white mb-2">
            🏠 Rental Agreement DApp
          </h1>
          <p className="text-purple-300">
            Decentralized Rental Management on Ethereum Sepolia
          </p>
        </div>

        {!account ? (
          /* CONNECT SCREEN */
          <div className="bg-white/10 backdrop-blur rounded-2xl p-10 text-center border border-white/20">
            <div className="text-6xl mb-4">🦊</div>
            <h2 className="text-2xl font-bold text-white mb-2">
              Connect Your Wallet
            </h2>
            <p className="text-purple-200 mb-6">
              Connect MetaMask to access the rental dashboard
            </p>
            <Button
              onClick={connectWallet}
              className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-3 text-lg rounded-xl"
            >
              Connect MetaMask
            </Button>
            {error && <p className="text-red-400 mt-4">{error}</p>}
          </div>
        ) : (
          <div className="space-y-6">

            {/* WALLET BADGE */}
            <div className="bg-white/10 backdrop-blur rounded-2xl p-4 border border-white/20 flex items-center justify-between">
              <div>
                <p className="text-purple-300 text-sm">Connected Wallet</p>
                <p className="text-white font-mono">{short(account)}</p>
              </div>
              <div className={`px-4 py-2 rounded-full text-sm font-bold border ${role === "landlord"
                ? "bg-blue-500/20 text-blue-300 border-blue-500/30"
                : role === "tenant"
                  ? "bg-green-500/20 text-green-300 border-green-500/30"
                  : "bg-red-500/20 text-red-300 border-red-500/30"
                }`}>
                {role === "landlord" ? "👔 Landlord"
                  : role === "tenant" ? "🏡 Tenant"
                    : "⚠️ Unknown Role"}
              </div>
            </div>

            {/* AGREEMENT DETAILS */}
            {details && (
              <div className="bg-white/10 backdrop-blur rounded-2xl p-6 border border-white/20">
                <h2 className="text-xl font-bold text-white mb-4">
                  📋 Agreement Details
                </h2>
                <div className="grid grid-cols-2 gap-4">
                  {[
                    { label: "Landlord", value: short(details.landlord) },
                    { label: "Tenant", value: short(details.tenant) },
                    { label: "Monthly Rent", value: fmt(details.rentAmount) },
                    { label: "Deposit", value: fmt(details.depositAmount) },
                    { label: "Ends On", value: fmtDate(details.agreementEnd) },
                    { label: "Total Rent Paid", value: fmt(details.totalRentPaid) },
                  ].map((item) => {
                    return (
                      <div
                        key={item.label}
                        className="bg-white/5 rounded-xl p-3 border border-white/10"
                      >
                        <p className="text-purple-300 text-xs mb-1">{item.label}</p>
                        <p className="text-white font-semibold">{item.value}</p>
                      </div>
                    );
                  })}
                </div>
                <div className="flex gap-3 mt-4">
                  <span className={`px-3 py-1 rounded-full text-xs font-bold ${details.isActive
                    ? "bg-green-500/20 text-green-300"
                    : "bg-red-500/20 text-red-300"
                    }`}>
                    {details.isActive ? "✅ Active" : "❌ Inactive"}
                  </span>
                  {details.disputeActive && (
                    <span className="px-3 py-1 rounded-full text-xs font-bold bg-yellow-500/20 text-yellow-300">
                      ⚠️ Dispute Active
                    </span>
                  )}
                </div>
              </div>
            )}

            {/* TENANT ACTIONS */}
            {role === "tenant" && details && (
              <div className="bg-white/10 backdrop-blur rounded-2xl p-6 border border-white/20">
                <h2 className="text-xl font-bold text-white mb-4">
                  🏡 Tenant Actions
                </h2>
                <div className="space-y-3">
                  {!details.isActive && (
                    <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                      <p className="text-purple-200 text-sm mb-3">
                        Sign agreement and pay deposit:{" "}
                        <span className="text-white font-bold">
                          {fmt(details.depositAmount)}
                        </span>
                      </p>
                      <Button
                        onClick={signAgreement}
                        disabled={!!loading}
                        className="w-full bg-green-600 hover:bg-green-700 text-white rounded-xl"
                      >
                        ✍️ Sign Agreement and Pay Deposit
                      </Button>
                    </div>
                  )}
                  {details.isActive && (
                    <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                      <p className="text-purple-200 text-sm mb-3">
                        Pay monthly rent:{" "}
                        <span className="text-white font-bold">
                          {fmt(details.rentAmount)}
                        </span>
                      </p>
                      <Button
                        onClick={payRent}
                        disabled={!!loading || details.disputeActive}
                        className="w-full bg-purple-600 hover:bg-purple-700 text-white rounded-xl"
                      >
                        💸 Pay Rent
                      </Button>
                    </div>
                  )}
                  {details.isActive && !details.disputeActive && (
                    <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                      <p className="text-purple-200 text-sm mb-3">
                        Raise a dispute with landlord
                      </p>
                      <input
                        type="text"
                        value={disputeReason}
                        onChange={(e) => setDisputeReason(e.target.value)}
                        placeholder="Describe your dispute..."
                        className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-2 text-white placeholder-purple-300 mb-3 outline-none"
                      />
                      <Button
                        onClick={raiseDispute}
                        disabled={!!loading || !disputeReason}
                        className="w-full bg-yellow-600 hover:bg-yellow-700 text-white rounded-xl"
                      >
                        ⚠️ Raise Dispute
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* LANDLORD ACTIONS */}
            {role === "landlord" && details && (
              <div className="bg-white/10 backdrop-blur rounded-2xl p-6 border border-white/20">
                <h2 className="text-xl font-bold text-white mb-4">
                  👔 Landlord Actions
                </h2>
                <div className="space-y-3">
                  {details.disputeActive && (
                    <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                      <p className="text-yellow-300 font-semibold mb-2">
                        ⚠️ Active Dispute — Choose Resolution
                      </p>
                      <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl px-4 py-3 mb-3">
                        <p className="text-yellow-200 text-xs mb-1">Dispute Reason:</p>
                        <p className="text-white text-sm font-medium">{disputeText}</p>
                      </div>
                      <div className="flex gap-3">
                        <Button
                          onClick={() => resolveDispute(true)}
                          disabled={!!loading}
                          className="flex-1 bg-green-600 hover:bg-green-700 text-white rounded-xl"
                        >
                          ✅ Return Deposit
                        </Button>
                        <Button
                          onClick={() => resolveDispute(false)}
                          disabled={!!loading}
                          className="flex-1 bg-red-600 hover:bg-red-700 text-white rounded-xl"
                        >
                          ❌ Keep Deposit
                        </Button>
                      </div>
                    </div>
                  )}
                  {details.isActive && (
                    <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                      <p className="text-purple-200 text-sm mb-3">
                        Terminate agreement after period ends
                      </p>
                      <Button
                        onClick={terminateAgreement}
                        disabled={!!loading}
                        className="w-full bg-red-600 hover:bg-red-700 text-white rounded-xl"
                      >
                        🔚 Terminate Agreement
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* LOADING */}
            {loading && (
              <div className="bg-purple-500/20 border border-purple-500/30 rounded-2xl p-4 text-center">
                <p className="text-purple-200 animate-pulse">⏳ {loading}</p>
              </div>
            )}

            {/* ERROR */}
            {error && (
              <div className="bg-red-500/20 border border-red-500/30 rounded-2xl p-4">
                <p className="text-red-300">❌ {error}</p>
              </div>
            )}

            {/* TX HASH */}
            {txHash && (
              <div className="bg-green-500/20 border border-green-500/30 rounded-2xl p-4">
                <p className="text-green-300 text-sm mb-1">✅ Transaction Successful!</p>
                <a
                  href={"https://sepolia.etherscan.io/tx/" + txHash}
                  target="_blank"
                  rel="noreferrer"
                  className="text-blue-300 underline text-sm font-mono break-all"
                >
                  View on Etherscan →
                </a>
              </div>
            )}

            {/* CONTRACT LINK */}
            <div className="text-center">
              <a
                href={"https://sepolia.etherscan.io/address/" + CONTRACT_ADDRESS}
                target="_blank"
                rel="noreferrer"
                className="text-purple-400 hover:text-purple-300 text-sm underline"
              >
                🔍 View Contract on Etherscan
              </a>
            </div>

          </div>
        )}
      </div>
    </div >
  );
}