/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ethers } from "ethers";
import { useAuth } from "@/context/AuthContext";
import { getTenantAgreements, getLandlordAgreements } from "@/services/api";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  AlertCircle, RefreshCw, ExternalLink, ArrowUpRight,
  ArrowDownLeft, FileText, Shield, XCircle, Copy, CheckCircle2
} from "lucide-react";
import Navbar from "@/components/Navbar";

import contractDataRaw from "@/contracts/RentalAgreement.json";
const contractData = contractDataRaw as any;
const CONTRACT_ABI = contractData.abi;

// ── Types ────────────────────────────────────────────────────────────────────
interface TxRecord {
  hash: string;
  type: "sign_agreement" | "pay_rent" | "raise_dispute" | "resolve_dispute" | "terminate" | "deploy";
  description: string;
  property: string;
  value?: string;       // ETH value
  timestamp?: number;
  blockNumber?: number;
  status: "success" | "pending" | "failed";
  contractAddress: string;
}

// ── Helpers ───────────────────────────────────────────────────────────────────
const short = (addr: string) => addr ? addr.slice(0, 8) + "..." + addr.slice(-6) : "—";

const TX_TYPE_META: Record<TxRecord["type"], { label: string; icon: any; color: string; bg: string }> = {
  sign_agreement:   { label: "Signed Agreement",  icon: FileText,      color: "text-green-300",  bg: "bg-green-500/10 border-green-500/30"   },
  pay_rent:         { label: "Rent Payment",       icon: ArrowUpRight,  color: "text-blue-300",   bg: "bg-blue-500/10 border-blue-500/30"     },
  raise_dispute:    { label: "Raised Dispute",     icon: AlertCircle,   color: "text-yellow-300", bg: "bg-yellow-500/10 border-yellow-500/30" },
  resolve_dispute:  { label: "Dispute Resolved",   icon: CheckCircle2,  color: "text-purple-300", bg: "bg-purple-500/10 border-purple-500/30" },
  terminate:        { label: "Terminated",         icon: XCircle,       color: "text-red-300",    bg: "bg-red-500/10 border-red-500/30"       },
  deploy:           { label: "Contract Deployed",  icon: Shield,        color: "text-violet-300", bg: "bg-violet-500/10 border-violet-500/30" },
};

export default function TransactionHistory() {
  const { user } = useAuth();

  const [transactions, setTransactions] = useState<TxRecord[]>([]);
  const [loading, setLoading]           = useState(true);
  const [error, setError]               = useState("");
  const [walletAddress, setWalletAddress] = useState("");
  const [ethBalance, setEthBalance]     = useState("");
  const [totalRentPaid, setTotalRentPaid] = useState("0");
  const [copied, setCopied]             = useState("");
  const [filter, setFilter]             = useState<TxRecord["type"] | "all">("all");

  // ── Fetch wallet info ──────────────────────────────────────────────────────
  const fetchWallet = async () => {
    if (!window.ethereum) return;
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const accounts = await provider.listAccounts();
      if (!accounts.length) return;
      const addr = await accounts[0].getAddress();
      setWalletAddress(addr);
      const bal = await provider.getBalance(addr);
      setEthBalance(parseFloat(ethers.formatEther(bal)).toFixed(4));
    } catch { /* silent */ }
  };

  // ── Fetch all on-chain events from agreements ─────────────────────────────
  const fetchTransactions = async () => {
    try {
      setLoading(true);
      setError("");

      if (!window.ethereum) {
        setError("MetaMask not connected. Please connect your wallet to view transactions.");
        setLoading(false);
        return;
      }

      const provider  = new ethers.BrowserProvider(window.ethereum);
      const accounts  = await provider.listAccounts();
      if (!accounts.length) {
        setError("No MetaMask account connected.");
        setLoading(false);
        return;
      }
      const myAddress = (await accounts[0].getAddress()).toLowerCase();

      // Get all agreements for this user from the DB
      const agreementsRes = user?.role === "landlord"
        ? await getLandlordAgreements()
        : await getTenantAgreements();

      const agreements = agreementsRes.data.filter(
        (a: any) => a.contractAddress && (a.status === "active" || a.status === "approved")
      );

      const allTxs: TxRecord[] = [];
      let totalRent = BigInt(0);

      for (const agreement of agreements) {
        try {
          const contract = new ethers.Contract(agreement.contractAddress, CONTRACT_ABI, provider);
          const propertyName = agreement.property?.title || "Unknown Property";

          // ── AgreementSigned ──────────────────────────────────────────────
          const signedFilter = contract.filters.AgreementSigned();
          const signedEvents = await contract.queryFilter(signedFilter);
          for (const ev of signedEvents) {
            const block = await ev.getBlock();
            allTxs.push({
              hash:            ev.transactionHash,
              type:            "sign_agreement",
              description:     `Signed rental agreement`,
              property:        propertyName,
              value:           ethers.formatEther((ev as any).args?.depositAmount || 0) + " ETH",
              timestamp:       block.timestamp,
              blockNumber:     ev.blockNumber,
              status:          "success",
              contractAddress: agreement.contractAddress,
            });
          }

          // ── RentPaid ─────────────────────────────────────────────────────
          const rentFilter = contract.filters.RentPaid();
          const rentEvents = await contract.queryFilter(rentFilter);
          for (const ev of rentEvents) {
            const args   = (ev as any).args;
            const block  = await ev.getBlock();
            const amount = args?.amount || BigInt(0);
            // Only show if this user paid/received rent
            if (
              args?.tenant?.toLowerCase() === myAddress ||
              user?.role === "landlord"
            ) {
              totalRent += amount;
              allTxs.push({
                hash:            ev.transactionHash,
                type:            "pay_rent",
                description:     user?.role === "tenant" ? "Paid monthly rent" : "Received rent payment",
                property:        propertyName,
                value:           ethers.formatEther(amount) + " ETH",
                timestamp:       block.timestamp,
                blockNumber:     ev.blockNumber,
                status:          "success",
                contractAddress: agreement.contractAddress,
              });
            }
          }

          // ── DisputeRaised ────────────────────────────────────────────────
          try {
            const dispFilter  = contract.filters.DisputeRaised?.();
            if (dispFilter) {
              const dispEvents  = await contract.queryFilter(dispFilter);
              for (const ev of dispEvents) {
                const block = await ev.getBlock();
                allTxs.push({
                  hash:            ev.transactionHash,
                  type:            "raise_dispute",
                  description:     "Raised a dispute",
                  property:        propertyName,
                  timestamp:       block.timestamp,
                  blockNumber:     ev.blockNumber,
                  status:          "success",
                  contractAddress: agreement.contractAddress,
                });
              }
            }
          } catch { /* event may not exist in all contract versions */ }

          // ── DisputeResolved ──────────────────────────────────────────────
          try {
            const resFilter  = contract.filters.DisputeResolved?.();
            if (resFilter) {
              const resEvents  = await contract.queryFilter(resFilter);
              for (const ev of resEvents) {
                const block = await ev.getBlock();
                allTxs.push({
                  hash:            ev.transactionHash,
                  type:            "resolve_dispute",
                  description:     "Dispute resolved",
                  property:        propertyName,
                  timestamp:       block.timestamp,
                  blockNumber:     ev.blockNumber,
                  status:          "success",
                  contractAddress: agreement.contractAddress,
                });
              }
            }
          } catch { /* silent */ }

          // ── AgreementTerminated ──────────────────────────────────────────
          try {
            const termFilter = contract.filters.AgreementTerminated?.();
            if (termFilter) {
              const termEvents = await contract.queryFilter(termFilter);
              for (const ev of termEvents) {
                const block = await ev.getBlock();
                allTxs.push({
                  hash:            ev.transactionHash,
                  type:            "terminate",
                  description:     "Agreement terminated",
                  property:        propertyName,
                  timestamp:       block.timestamp,
                  blockNumber:     ev.blockNumber,
                  status:          "success",
                  contractAddress: agreement.contractAddress,
                });
              }
            }
          } catch { /* silent */ }

        } catch { /* skip this contract if it fails */ }
      }

      // Sort by timestamp descending (newest first)
      allTxs.sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));

      setTransactions(allTxs);
      setTotalRentPaid(parseFloat(ethers.formatEther(totalRent)).toFixed(4));
      setLoading(false);
    } catch (err: any) {
      setError(err.message || "Failed to load transactions.");
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWallet();
    fetchTransactions();
  }, []);

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopied(key);
    setTimeout(() => setCopied(""), 2000);
  };

  const filtered = filter === "all" ? transactions : transactions.filter(t => t.type === filter);

  const fmtDate = (ts?: number) => {
    if (!ts) return "—";
    return new Date(ts * 1000).toLocaleString("en-IN", {
      day: "2-digit", month: "short", year: "numeric",
      hour: "2-digit", minute: "2-digit"
    });
  };

  // ── Stats ─────────────────────────────────────────────────────────────────
  const stats = [
    {
      label: "Total Transactions",
      value: transactions.length,
      icon: "📋",
      color: "via-purple-500/40",
    },
    {
      label: user?.role === "tenant" ? "Total Rent Paid" : "Total Rent Received",
      value: totalRentPaid + " ETH",
      icon: "💸",
      color: "via-blue-500/40",
    },
    {
      label: "Wallet Balance",
      value: ethBalance ? ethBalance + " ETH" : "—",
      icon: "🦊",
      color: "via-green-500/40",
    },
  ];

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white overflow-x-hidden">

      {/* BACKGROUND */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl" />
        <div className="absolute top-1/3 right-1/4 w-80 h-80 bg-blue-600/15 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 left-1/3 w-72 h-72 bg-violet-600/10 rounded-full blur-3xl" />
        <div className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px),
                              linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)`,
            backgroundSize: "64px 64px",
          }}
        />
      </div>

      <Navbar />

      <div className="relative z-10 max-w-5xl mx-auto px-6 py-10">

        {/* HEADER */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-3xl font-bold text-white tracking-tight">📊 Transaction History</h2>
            <p className="text-purple-300 mt-1">All your on-chain activity across rental agreements</p>
          </div>
          <Button
            onClick={() => { fetchWallet(); fetchTransactions(); }}
            variant="ghost"
            disabled={loading}
            className="border border-white/15 hover:border-white/30 hover:bg-white/10 text-white rounded-xl px-5 transition-all duration-200"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        </div>

        {/* WALLET INFO */}
        {walletAddress && (
          <Card className="bg-white/5 border-white/10 mb-6">
            <CardContent className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-purple-600 to-violet-700 flex items-center justify-center text-lg">
                  🦊
                </div>
                <div>
                  <p className="text-purple-300 text-xs mb-0.5">Connected Wallet</p>
                  <p className="text-white font-mono text-sm">{short(walletAddress)}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="text-right">
                  <p className="text-purple-300 text-xs mb-0.5">Sepolia Balance</p>
                  <p className="text-white font-bold">{ethBalance} ETH</p>
                </div>
                <button
                  onClick={() => handleCopy(walletAddress, "wallet")}
                  className="text-purple-400 hover:text-white transition-colors"
                  title="Copy address"
                >
                  {copied === "wallet"
                    ? <CheckCircle2 className="h-4 w-4 text-green-400" />
                    : <Copy className="h-4 w-4" />
                  }
                </button>
                <a
                  href={`https://sepolia.etherscan.io/address/${walletAddress}`}
                  target="_blank" rel="noreferrer"
                  className="text-purple-400 hover:text-white transition-colors"
                  title="View on Etherscan"
                >
                  <ExternalLink className="h-4 w-4" />
                </a>
              </div>
            </CardContent>
          </Card>
        )}

        {/* STATS */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          {stats.map((stat) => (
            <Card key={stat.label} className="bg-white/5 border-white/10 text-center relative overflow-hidden">
              <div className={`absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent ${stat.color} to-transparent`} />
              <CardContent className="py-5">
                <div className="text-3xl mb-1">{stat.icon}</div>
                <div className="text-2xl font-bold text-white">{stat.value}</div>
                <div className="text-purple-300 text-xs mt-1">{stat.label}</div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* ERROR */}
        {error && (
          <Alert variant="destructive" className="bg-red-500/10 border-red-500/30 mb-6">
            <AlertCircle className="h-4 w-4 text-red-400" />
            <AlertDescription className="text-red-300">{error}</AlertDescription>
          </Alert>
        )}

        {/* FILTER TABS */}
        {!loading && transactions.length > 0 && (
          <div className="flex gap-2 flex-wrap mb-6">
            {(["all", "sign_agreement", "pay_rent", "raise_dispute", "resolve_dispute", "terminate"] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-4 py-1.5 rounded-xl text-xs font-semibold transition-all duration-200 ${
                  filter === f
                    ? "bg-purple-600 text-white shadow-lg"
                    : "bg-white/5 border border-white/10 text-purple-300 hover:bg-white/10 hover:text-white"
                }`}
              >
                {f === "all" ? `All (${transactions.length})` : TX_TYPE_META[f].label}
              </button>
            ))}
          </div>
        )}

        {/* TRANSACTIONS LIST */}
        {loading ? (
          <Card className="bg-white/5 border-white/10">
            <CardContent className="py-20 text-center">
              <RefreshCw className="h-8 w-8 text-purple-400 animate-spin mx-auto mb-4" />
              <p className="text-purple-300">Fetching on-chain events...</p>
              <p className="text-purple-400 text-xs mt-2">This may take a few seconds</p>
            </CardContent>
          </Card>
        ) : filtered.length === 0 ? (
          <Card className="bg-white/5 border-white/10 text-center">
            <CardContent className="py-20">
              <p className="text-5xl mb-4">📭</p>
              <p className="text-white font-bold text-lg mb-2">No transactions found</p>
              <p className="text-purple-300 text-sm">
                {transactions.length === 0
                  ? "Your on-chain transactions will appear here once you sign an agreement or pay rent."
                  : "No transactions match the selected filter."}
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {filtered.map((tx, i) => {
              const meta = TX_TYPE_META[tx.type];
              const Icon = meta.icon;
              return (
                <Card key={`${tx.hash}-${i}`} className="bg-white/5 border-white/10 hover:border-purple-500/30 transition-all duration-200">
                  <CardContent className="p-5">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-start gap-3 flex-1 min-w-0">

                        {/* Icon */}
                        <div className={`w-10 h-10 rounded-xl border flex items-center justify-center shrink-0 ${meta.bg}`}>
                          <Icon className={`h-4 w-4 ${meta.color}`} />
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1 flex-wrap">
                            <span className="text-white font-semibold text-sm">{tx.description}</span>
                            <Badge variant="outline" className={`text-xs border ${meta.bg} ${meta.color}`}>
                              {meta.label}
                            </Badge>
                          </div>

                          <p className="text-purple-300 text-xs mb-2">🏠 {tx.property}</p>

                          <Separator className="bg-white/10 mb-2" />

                          {/* TX Hash */}
                          <div className="flex items-center gap-2">
                            <span className="text-purple-400 text-xs">Tx:</span>
                            <span className="text-white font-mono text-xs">{short(tx.hash)}</span>
                            <button
                              onClick={() => handleCopy(tx.hash, tx.hash)}
                              className="text-purple-400 hover:text-white transition-colors"
                            >
                              {copied === tx.hash
                                ? <CheckCircle2 className="h-3 w-3 text-green-400" />
                                : <Copy className="h-3 w-3" />
                              }
                            </button>
                            <a
                              href={`https://sepolia.etherscan.io/tx/${tx.hash}`}
                              target="_blank" rel="noreferrer"
                              className="text-purple-400 hover:text-white transition-colors"
                              title="View on Etherscan"
                            >
                              <ExternalLink className="h-3 w-3" />
                            </a>
                          </div>
                        </div>
                      </div>

                      {/* Right side */}
                      <div className="text-right shrink-0">
                        {tx.value && (
                          <div className={`flex items-center gap-1 justify-end mb-1 ${
                            tx.type === "pay_rent" && user?.role === "tenant" ? "text-red-300" : "text-green-300"
                          }`}>
                            {tx.type === "pay_rent" && user?.role === "tenant"
                              ? <ArrowUpRight className="h-3.5 w-3.5" />
                              : <ArrowDownLeft className="h-3.5 w-3.5" />
                            }
                            <span className="font-bold text-sm">{tx.value}</span>
                          </div>
                        )}
                        <p className="text-purple-400 text-xs">{fmtDate(tx.timestamp)}</p>
                        {tx.blockNumber && (
                          <p className="text-purple-500 text-[10px] mt-0.5">Block #{tx.blockNumber}</p>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        {/* FOOTER NOTE */}
        {!loading && transactions.length > 0 && (
          <p className="text-center text-purple-500 text-xs mt-6">
            All transactions are sourced directly from the Ethereum Sepolia blockchain •{" "}
            <a
              href={`https://sepolia.etherscan.io/address/${walletAddress}`}
              target="_blank" rel="noreferrer"
              className="text-purple-400 hover:text-white underline underline-offset-4 transition-colors"
            >
              View all on Etherscan →
            </a>
          </p>
        )}
      </div>
    </div>
  );
}