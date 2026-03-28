/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ethers } from "ethers";
import { getProperties } from "@/services/api";
import { useAuth } from "@/context/AuthContext";
import { getTenantAgreements, updateAgreementStatus, updateWallet } from "@/services/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { AlertCircle, RefreshCw, Wallet, CheckCircle2, Copy, ExternalLink, Star } from "lucide-react";
import contractDataRaw from "@/contracts/RentalAgreement.json";
import DownloadAgreementButton from "@/components/DownloadAgreementButton";
import BlockchainAgreement from "@/components/BlockchainAgreement";
import NavBar from "@/components/NavBar";

const contractData = contractDataRaw as any;
const CONTRACT_ADDRESS = contractData.address || "";
const CONTRACT_ABI = contractData.abi;

export default function TenantDashboard() {
    const { user } = useAuth();
    const navigate = useNavigate();

    const [properties, setProperties] = useState<any[]>([]);
    const [loadingProps, setLoadingProps] = useState(true);

    const [account, setAccount] = useState("");
    const [contract, setContract] = useState<any>(null);
    const [details, setDetails] = useState<any>(null);
    const [role, setRole] = useState("");
    const [loading, setLoading] = useState("");
    const [txHash, setTxHash] = useState("");
    const [error, setError] = useState("");
    const [disputeReason, setDisputeReason] = useState("");
    const [disputeText, setDisputeText] = useState("");
    const [activeTab, setActiveTab] = useState<"browse" | "agreements" | "agreement" | "profile">("browse");

    const [myAgreements, setMyAgreements] = useState<any[]>([]);
    const [loadingAgreements, setLoadingAgreements] = useState(false);
    const [approvedAgreement, setApprovedAgreement] = useState<any>(null);

    // Wallet update
    const [walletInput, setWalletInput] = useState(user?.walletAddress || "");
    const [walletSaving, setWalletSaving] = useState(false);
    const [walletSuccess, setWalletSuccess] = useState("");
    const [walletError, setWalletError] = useState("");
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        const fetch = async () => {
            try {
                const res = await getProperties({});
                setProperties(res.data);
                setLoadingProps(false);
            } catch {
                setLoadingProps(false);
            }
        };
        fetch();
    }, []);

    const connectWallet = async () => {
        try {
            setError("");
            if (!window.ethereum) { setError("MetaMask not found!"); return; }
            if (!approvedAgreement?.contractAddress) {
                setError("No approved agreement found! Wait for landlord to approve.");
                return;
            }
            const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
            const userAccount = accounts[0].toLowerCase();
            setAccount(userAccount);
            const provider = new ethers.BrowserProvider(window.ethereum);
            const signer = await provider.getSigner();
            const c = new ethers.Contract(approvedAgreement.contractAddress, CONTRACT_ABI, signer);
            setContract(c);
            await loadDetails(c, userAccount);
            setActiveTab("agreement");
        } catch {
            setError("Failed to connect wallet.");
        }
    };

    const loadDetails = async (c: any, currentAccount?: string) => {
        try {
            const d = await c.getAgreementDetails();
            const agreementData = {
                landlord: d[0], tenant: d[1], rentAmount: d[2],
                depositAmount: d[3], agreementEnd: d[4], isActive: d[5],
                totalRentPaid: d[6], disputeActive: d[7],
            };
            setDetails(agreementData);
            const acc = currentAccount || account;
            if (acc === agreementData.landlord.toLowerCase()) setRole("landlord");
            else if (acc === agreementData.tenant.toLowerCase()) setRole("tenant");
            else setRole("unknown");
            const reason = await c.disputeReason();
            setDisputeText(reason);
        } catch {
            setError("Failed to load agreement details.");
        }
    };

    const fetchMyAgreements = async () => {
        try {
            setLoadingAgreements(true);
            const res = await getTenantAgreements();
            setMyAgreements(res.data);
            const approved = res.data.find(
                (a: any) => (a.status === "approved" || a.status === "active") && a.contractAddress
            );
            setApprovedAgreement(approved || null);
            setLoadingAgreements(false);
        } catch {
            setLoadingAgreements(false);
        }
    };

    useEffect(() => { fetchMyAgreements(); }, []);

    const signAgreement = async () => {
        if (!contract || !details) return;
        try {
            setLoading("Signing agreement...");
            setError("");
            const tx = await contract.signAgreement({ value: details.depositAmount });
            setTxHash(tx.hash);
            await tx.wait();
            setLoading("");
            await loadDetails(contract);
            if (approvedAgreement?._id) {
                await updateAgreementStatus(approvedAgreement._id, { status: "active" });
                await fetchMyAgreements();
            }
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

    const fmt = (val: any) => ethers.formatEther(val) + " ETH";
    const short = (addr: string) => addr ? addr.slice(0, 6) + "..." + addr.slice(-4) : "";



    const handleSaveWallet = async () => {
        try {
            setWalletSaving(true);
            setWalletError("");
            setWalletSuccess("");
            if (!walletInput.startsWith("0x") || walletInput.length !== 42) {
                setWalletError("Invalid wallet address. Must start with 0x and be 42 characters.");
                setWalletSaving(false);
                return;
            }
            await updateWallet({ walletAddress: walletInput });
            setWalletSuccess("Wallet address updated successfully!");
            setWalletSaving(false);
        } catch (err: any) {
            setWalletError(err.response?.data?.message || "Failed to update wallet.");
            setWalletSaving(false);
        }
    };

    const handleAutoFillFromMetaMask = async () => {
        try {
            if (!window.ethereum) { setWalletError("MetaMask not found!"); return; }
            const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
            setWalletInput(accounts[0]);
            setWalletError("");
        } catch {
            setWalletError("Could not connect to MetaMask.");
        }
    };

    const handleCopy = () => {
        if (!walletInput) return;
        navigator.clipboard.writeText(walletInput);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const tabs = [
        { id: "browse", label: "🏠 Browse Properties", activeColor: "bg-purple-600" },
        { id: "agreements", label: "📋 My Requests", activeColor: "bg-green-600" },
        { id: "agreement", label: "⛓️ My Agreement", activeColor: "bg-purple-600" },
        { id: "profile", label: "👤 Profile", activeColor: "bg-violet-600" },
    ] as const;

    const statusBadge = (status: string) => {
        const map: Record<string, string> = {
            pending: "bg-yellow-500/20 text-yellow-300 border-yellow-500/30",
            approved: "bg-blue-500/20 text-blue-300 border-blue-500/30",
            active: "bg-green-500/20 text-green-300 border-green-500/30",
        };
        const label: Record<string, string> = {
            pending: "⏳ Pending Approval",
            approved: "✅ Approved — Sign Now!",
            active: "🟢 Active",
        };
        const cls = map[status] || "bg-red-500/20 text-red-300 border-red-500/30";
        return (
            <span className={`px-3 py-1 rounded-full text-xs font-bold border ${cls}`}>
                {label[status] || "❌ " + status}
            </span>
        );
    };

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

            <NavBar />

            <div className="relative z-10 max-w-6xl mx-auto px-6 py-10 mt-12">

                {/* HEADER */}
                <div className="mb-8">
                    <h2 className="text-3xl font-bold text-white tracking-tight">Tenant Dashboard</h2>
                    <p className="text-purple-300 mt-1">Browse properties and manage your rental agreement</p>
                </div>

                {/* TABS */}
                <div className="flex gap-2 mb-8">
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`px-6 py-2.5 rounded-xl font-semibold text-sm transition-all duration-200 ${activeTab === tab.id
                                ? `${tab.activeColor} text-white shadow-lg`
                                : "bg-white/5 border border-white/10 text-purple-300 hover:bg-white/10 hover:text-white"
                                }`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* ── BROWSE TAB ── */}
                {activeTab === "browse" && (
                    <div>
                        <div className="flex items-center justify-between mb-6">
                            <div>
                                <h3 className="text-xl font-bold text-white">Available Properties</h3>
                                <p className="text-purple-300 text-sm mt-0.5">A quick look at the latest listings</p>
                            </div>
                        </div>

                        {loadingProps ? (
                            <p className="text-purple-300 animate-pulse">Loading properties...</p>
                        ) : (
                            <>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {properties.slice(0, 3).map((property) => (
                                        <Card
                                            key={property._id}
                                            onClick={() => navigate(`/property/${property._id}`)}
                                            className="bg-white/5 border-white/10 overflow-hidden hover:border-purple-500/40 hover:bg-purple-500/5 hover:-translate-y-1 transition-all duration-300 cursor-pointer group"
                                        >
                                            {/* IMAGE */}
                                            <div className="h-48 bg-gradient-to-br from-purple-600/60 to-blue-600/60 overflow-hidden">
                                                {property.images?.length > 0 ? (
                                                    <img
                                                        src={property.images[0]}
                                                        alt={property.title}
                                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                                    />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center">
                                                        <span className="text-6xl group-hover:scale-110 transition-transform duration-300">🏠</span>
                                                    </div>
                                                )}
                                            </div>
                                            <CardContent className="p-4">
                                                <div className="flex items-center justify-between mb-3">
                                                    <Badge variant="outline" className="border-purple-500/40 text-purple-300 bg-purple-500/10 text-xs">
                                                        {property.roomType}
                                                    </Badge>
                                                    <Badge
                                                        variant="outline"
                                                        className={`text-xs ${property.isAvailable
                                                            ? "border-green-500/40 text-green-300 bg-green-500/10"
                                                            : "border-red-500/40 text-red-300 bg-red-500/10"
                                                            }`}
                                                    >
                                                        {property.isAvailable ? "✅ Available" : "❌ Taken"}
                                                    </Badge>
                                                </div>
                                                <h3 className="text-white font-bold mb-1">{property.title}</h3>
                                                <p className="text-purple-300 text-sm mb-4">📍 {property.location}</p>
                                                <Separator className="bg-white/10 mb-4" />
                                                <div className="flex justify-between">
                                                    <div>
                                                        <p className="text-purple-300 text-xs mb-0.5">Rent</p>
                                                        <p className="text-white font-bold">₹{property.rentAmount.toLocaleString()}</p>
                                                    </div>
                                                    <div className="text-right">
                                                        <p className="text-purple-300 text-xs mb-0.5">Deposit</p>
                                                        <p className="text-white font-bold">₹{property.depositAmount.toLocaleString()}</p>
                                                    </div>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    ))}
                                </div>

                                {/* VIEW ALL BANNER */}
                                {properties.length > 3 && (
                                    <Card
                                        onClick={() => navigate("/properties")}
                                        className="mt-6 bg-gradient-to-r from-purple-900/30 to-blue-900/30 border-purple-500/20 hover:border-purple-500/40 cursor-pointer transition-all duration-300 group"
                                    >
                                        <CardContent className="py-6 flex items-center justify-between px-6">
                                            <div>
                                                <p className="text-white font-semibold">
                                                    Browse all {properties.length} available properties
                                                </p>
                                                <p className="text-purple-300 text-sm">
                                                    Filter by location, room type and more
                                                </p>
                                            </div>
                                            <Button
                                                className="bg-purple-600 hover:bg-purple-700 text-white rounded-xl px-6 shadow-lg shadow-purple-900/40 group-hover:-translate-x-0 transition-all duration-200"
                                                onClick={() => navigate("/properties")}
                                            >
                                                View All →
                                            </Button>
                                        </CardContent>
                                    </Card>
                                )}
                            </>
                        )}
                    </div>
                )}

                {/* ── MY REQUESTS TAB ── */}
                {activeTab === "agreements" && (
                    <div className="space-y-6">
                        <div className="flex items-center justify-between">
                            <h3 className="text-xl font-bold text-white">📋 My Agreement Requests</h3>
                            <Button
                                onClick={fetchMyAgreements}
                                variant="ghost"
                                className="border border-white/15 hover:border-white/30 hover:bg-white/10 text-white rounded-xl text-sm transition-all duration-200"
                            >
                                <RefreshCw className="h-4 w-4 mr-2" />
                                Refresh
                            </Button>
                        </div>

                        {loadingAgreements ? (
                            <p className="text-purple-300 animate-pulse">Loading...</p>
                        ) : myAgreements.length === 0 ? (
                            <Card className="bg-white/5 border-white/10 text-center">
                                <CardContent className="py-16">
                                    <p className="text-4xl mb-4">📋</p>
                                    <p className="text-white font-bold mb-2">No requests yet</p>
                                    <p className="text-purple-300 text-sm mb-6">Browse properties and request an agreement</p>
                                    <Button
                                        onClick={() => setActiveTab("browse")}
                                        className="bg-purple-600 hover:bg-purple-700 text-white rounded-xl shadow-lg shadow-purple-900/30"
                                    >
                                        Browse Properties
                                    </Button>
                                </CardContent>
                            </Card>
                        ) : (
                            <div className="space-y-4">
                                {myAgreements.map((agreement) => (
                                    <Card key={agreement._id} className="bg-white/5 border-white/10">
                                        <CardContent className="p-6">
                                            <div className="mb-3">{statusBadge(agreement.status)}</div>

                                            <h4 className="text-white font-bold text-lg mb-1">🏠 {agreement.property?.title}</h4>
                                            <p className="text-purple-300 text-sm mb-4">📍 {agreement.property?.location}</p>

                                            <div className="grid grid-cols-3 gap-4 mb-4">
                                                {[
                                                    { label: "Rent", value: `₹${agreement.rentAmount?.toLocaleString()}` },
                                                    { label: "Deposit", value: `₹${agreement.depositAmount?.toLocaleString()}` },
                                                    { label: "Duration", value: `${agreement.durationDays} days` },
                                                ].map(({ label, value }) => (
                                                    <div key={label} className="bg-white/5 border border-white/10 rounded-xl p-3">
                                                        <p className="text-purple-300 text-xs mb-1">{label}</p>
                                                        <p className="text-white font-bold text-sm">{value}</p>
                                                    </div>
                                                ))}
                                            </div>
                                            {(agreement.status === "approved" || agreement.status === "active" || agreement.status === "expired" || agreement.status === "terminated") && (
                                                <div className="flex flex-wrap gap-2 mt-2">
                                                    <DownloadAgreementButton
                                                        agreementId={agreement._id}
                                                        variant="ghost"
                                                        details={details}
                                                        className="text-red-400 border-red-400/20 hover:bg-red-400/10"
                                                    />
                                                    
                                                    {["active", "expired", "terminated"].includes(agreement.status) && (
                                                        <Button
                                                            onClick={() => navigate(`/property/${agreement.property?._id}`)}
                                                            variant="outline"
                                                            className="border-yellow-500/40 text-yellow-500 hover:bg-yellow-500/10 rounded-xl"
                                                        >
                                                            <Star className="h-4 w-4 mr-2 fill-yellow-500" />
                                                            Rate & Review
                                                        </Button>
                                                    )}
                                                </div>
                                            )}
                                            {agreement.status === "approved" && agreement.contractAddress && (
                                                <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4">
                                                    <p className="text-blue-300 text-sm font-semibold mb-2">
                                                        🎉 Approved! Sign on blockchain now
                                                    </p>
                                                    <p className="text-white font-mono text-xs break-all mb-3">
                                                        Contract: {agreement.contractAddress}
                                                    </p>
                                                    <Button
                                                        onClick={() => setActiveTab("agreement")}
                                                        className="w-full bg-green-600 hover:bg-green-700 text-white rounded-xl"
                                                    >
                                                        ⛓️ Go to My Agreement Tab to Sign
                                                    </Button>
                                                </div>
                                            )}
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* ── AGREEMENT TAB ── */}
                {activeTab === "agreement" && (
                    <div className="space-y-6">

                        {!account ? (
                            <Card className="bg-white/5 border-white/10 text-center">
                                <CardContent className="py-16 px-8">
                                    <div className="text-6xl mb-4">🦊</div>
                                    <h3 className="text-2xl font-bold text-white mb-2">Connect MetaMask</h3>

                                    {approvedAgreement ? (
                                        <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-4 mb-6 text-left">
                                            <p className="text-green-300 font-semibold mb-2">✅ Agreement Approved!</p>
                                            <p className="text-white text-sm mb-1">🏠 {approvedAgreement.property?.title}</p>
                                            <p className="text-purple-300 text-xs font-mono break-all">
                                                Contract: {approvedAgreement.contractAddress}
                                            </p>
                                        </div>
                                    ) : (
                                        <p className="text-purple-300 mb-6">
                                            Connect your wallet to view and manage your rental agreement
                                        </p>
                                    )}

                                    <Button
                                        onClick={connectWallet}
                                        disabled={!approvedAgreement}
                                        className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-3 rounded-xl text-base font-semibold shadow-lg shadow-purple-900/30 disabled:opacity-50 transition-all duration-200"
                                    >
                                        {approvedAgreement ? "Connect MetaMask to Sign" : "No Approved Agreement Yet"}
                                    </Button>



                                    {!approvedAgreement && (
                                        <p className="text-purple-300 text-sm mt-4">
                                            Request an agreement from a property and wait for landlord approval
                                        </p>
                                    )}

                                    {error && (
                                        <Alert variant="destructive" className="bg-red-500/10 border-red-500/30 mt-4 text-left">
                                            <AlertCircle className="h-4 w-4 text-red-400" />
                                            <AlertDescription className="text-red-300 text-sm">{error}</AlertDescription>
                                        </Alert>
                                    )}
                                </CardContent>
                            </Card>
                        ) : (
                            <div className="space-y-6">

                                {/* WALLET BADGE */}
                                <Card className="bg-white/5 border-white/10">
                                    <CardContent className="p-4 flex items-center justify-between">
                                        <div>
                                            <p className="text-purple-300 text-xs mb-1">Connected Wallet</p>
                                            <p className="text-white font-mono font-semibold">{short(account)}</p>
                                        </div>
                                        <Badge
                                            variant="outline"
                                            className={`px-4 py-1.5 text-sm font-bold ${role === "tenant" ? "border-green-500/30 text-green-300 bg-green-500/10"
                                                : role === "landlord" ? "border-blue-500/30 text-blue-300 bg-blue-500/10"
                                                    : "border-red-500/30 text-red-300 bg-red-500/10"
                                                }`}
                                        >
                                            {role === "tenant" ? "🏡 Tenant" : role === "landlord" ? "👔 Landlord" : "⚠️ Unknown Role"}
                                        </Badge>
                                    </CardContent>
                                </Card>

                                {/* AGREEMENT DETAILS */}
                                {details && approvedAgreement && (
                                    <BlockchainAgreement 
                                        agreement={approvedAgreement} 
                                        details={details} 
                                    />
                                )}

                                {/* TENANT ACTIONS */}
                                {role === "tenant" && details && (
                                    <Card className="bg-white/5 border-white/10">
                                        <CardHeader className="pb-2">
                                            <CardTitle className="text-white text-lg">🏡 Actions</CardTitle>
                                        </CardHeader>
                                        <CardContent className="space-y-3">

                                            {!details.isActive && (
                                                <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                                                    <p className="text-purple-200 text-sm mb-3">
                                                        Sign agreement and pay deposit:{" "}
                                                        <span className="text-white font-bold">{fmt(details.depositAmount)}</span>
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
                                                <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                                                    <p className="text-purple-200 text-sm mb-3">
                                                        Pay monthly rent:{" "}
                                                        <span className="text-white font-bold">{fmt(details.rentAmount)}</span>
                                                    </p>
                                                    <Button
                                                        onClick={payRent}
                                                        disabled={!!loading || details.disputeActive}
                                                        className="w-full bg-purple-600 hover:bg-purple-700 text-white rounded-xl shadow-lg shadow-purple-900/30"
                                                    >
                                                        💸 Pay Rent
                                                    </Button>
                                                </div>
                                            )}

                                            {details.isActive && !details.disputeActive && (
                                                <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                                                    <p className="text-purple-200 text-sm mb-3">Raise a dispute with landlord</p>
                                                    <Input
                                                        value={disputeReason}
                                                        onChange={(e) => setDisputeReason(e.target.value)}
                                                        placeholder="Describe your dispute..."
                                                        className="bg-white/10 border-white/20 text-white placeholder:text-purple-300/50 focus-visible:ring-purple-500 rounded-xl mb-3"
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

                                            {details.disputeActive && disputeText && (
                                                <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-4">
                                                    <p className="text-yellow-300 font-semibold mb-1">⚠️ Active Dispute</p>
                                                    <p className="text-white text-sm">{disputeText}</p>
                                                    <p className="text-yellow-200 text-xs mt-2">Waiting for landlord to resolve...</p>
                                                </div>
                                            )}
                                        </CardContent>
                                    </Card>
                                )}

                                {/* LOADING */}
                                {loading && (
                                    <div className="bg-purple-500/10 border border-purple-500/20 rounded-2xl p-4 text-center">
                                        <p className="text-purple-300 animate-pulse">⏳ {loading}</p>
                                    </div>
                                )}

                                {/* ERROR */}
                                {error && (
                                    <Alert variant="destructive" className="bg-red-500/10 border-red-500/30">
                                        <AlertCircle className="h-4 w-4 text-red-400" />
                                        <AlertDescription className="text-red-300 text-sm">{error}</AlertDescription>
                                    </Alert>
                                )}

                                {/* TX HASH */}
                                {txHash && (
                                    <div className="bg-green-500/10 border border-green-500/20 rounded-2xl p-4">
                                        <p className="text-green-300 text-sm font-semibold mb-1">✅ Transaction Successful!</p>
                                        <a
                                            href={"https://sepolia.etherscan.io/tx/" + txHash}
                                            target="_blank"
                                            rel="noreferrer"
                                            className="text-blue-300 underline text-sm font-mono break-all hover:text-blue-200 transition-colors"
                                        >
                                            View on Etherscan →
                                        </a>
                                    </div>
                                )}

                                {/* ETHERSCAN LINK */}
                                <div className="text-center">
                                    <a
                                        href={"https://sepolia.etherscan.io/address/" + CONTRACT_ADDRESS}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="text-purple-400 hover:text-purple-300 text-sm underline underline-offset-4 transition-colors"
                                    >
                                        🔍 View Contract on Etherscan
                                    </a>
                                </div>

                            </div>
                        )}
                    </div>
                )}

                {/* ── PROFILE TAB ── */}
                {activeTab === "profile" && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl">

                        {/* USER INFO CARD */}
                        <Card className="bg-white/5 border-white/10">
                            <CardHeader className="pb-2">
                                <CardTitle className="text-white text-lg">👤 Account Details</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3 pt-0">
                                {[
                                    { label: "Name", value: user?.name },
                                    { label: "Email", value: user?.email },
                                    { label: "Role", value: user?.role === "tenant" ? "🏡 Tenant" : user?.role },
                                ].map(({ label, value }) => (
                                    <div key={label} className="bg-white/5 border border-white/10 rounded-xl p-3 relative overflow-hidden">
                                        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-purple-500/40 to-transparent" />
                                        <p className="text-purple-300 text-xs mb-1">{label}</p>
                                        <p className="text-white font-semibold text-sm">{value}</p>
                                    </div>
                                ))}
                            </CardContent>
                        </Card>

                        {/* WALLET UPDATE CARD */}
                        <Card className="bg-white/5 border-white/10">
                            <CardHeader className="pb-2">
                                <CardTitle className="text-white text-lg flex items-center gap-2">
                                    <Wallet className="h-5 w-5 text-purple-400" />
                                    MetaMask Wallet Address
                                </CardTitle>
                                <p className="text-purple-300/80 text-sm">
                                    Your wallet is required to sign agreements on the blockchain.
                                    {user?.walletAddress
                                        ? " You can update it anytime below."
                                        : " You skipped this during registration — add it now."}
                                </p>
                            </CardHeader>
                            <CardContent className="space-y-4 pt-0">

                                {/* Current wallet display */}
                                {user?.walletAddress && (
                                    <div className="bg-white/5 border border-white/10 rounded-xl p-3 relative overflow-hidden">
                                        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-green-500/40 to-transparent" />
                                        <p className="text-purple-300 text-xs mb-1">Current Wallet</p>
                                        <div className="flex items-center justify-between gap-2">
                                            <p className="text-green-300 font-mono text-xs break-all">{user.walletAddress}</p>
                                            <button
                                                onClick={handleCopy}
                                                className="shrink-0 text-purple-400 hover:text-white transition-colors"
                                                title="Copy address"
                                            >
                                                {copied
                                                    ? <CheckCircle2 className="h-4 w-4 text-green-400" />
                                                    : <Copy className="h-4 w-4" />
                                                }
                                            </button>
                                        </div>
                                    </div>
                                )}

                                {/* Input + auto-fill */}
                                <div className="space-y-2">
                                    <div className="flex gap-2">
                                        <Input
                                            value={walletInput}
                                            onChange={(e) => { setWalletInput(e.target.value); setWalletSuccess(""); setWalletError(""); }}
                                            placeholder="0x..."
                                            className="flex-1 bg-white/10 border-white/20 text-white placeholder:text-purple-300/50 focus-visible:ring-purple-500 rounded-xl font-mono text-sm"
                                        />
                                        <Button
                                            onClick={handleAutoFillFromMetaMask}
                                            variant="ghost"
                                            className="border border-purple-500/30 hover:border-purple-500/60 hover:bg-purple-500/10 text-purple-300 hover:text-white rounded-xl px-4 shrink-0 transition-all duration-200"
                                            title="Auto-fill from MetaMask"
                                        >
                                            🦊 Auto-fill
                                        </Button>
                                    </div>
                                    <p className="text-purple-400 text-xs">
                                        Click <span className="text-purple-300 font-medium">Auto-fill</span> to import directly from MetaMask, or paste manually.
                                    </p>
                                </div>

                                {/* Alerts */}
                                {walletError && (
                                    <Alert variant="destructive" className="bg-red-500/10 border-red-500/30">
                                        <AlertCircle className="h-4 w-4 text-red-400" />
                                        <AlertDescription className="text-red-300 text-sm">{walletError}</AlertDescription>
                                    </Alert>
                                )}
                                {walletSuccess && (
                                    <Alert className="bg-green-500/10 border-green-500/30">
                                        <CheckCircle2 className="h-4 w-4 text-green-400" />
                                        <AlertDescription className="text-green-300 text-sm">{walletSuccess}</AlertDescription>
                                    </Alert>
                                )}

                                <Separator className="bg-white/10" />

                                <Button
                                    onClick={handleSaveWallet}
                                    disabled={walletSaving || !walletInput}
                                    className="w-full bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-semibold shadow-lg shadow-purple-900/30 transition-all duration-200 disabled:opacity-50"
                                >
                                    {walletSaving ? (
                                        <><RefreshCw className="h-4 w-4 mr-2 animate-spin" />Saving...</>
                                    ) : (
                                        <><Wallet className="h-4 w-4 mr-2" />Save Wallet Address</>
                                    )}
                                </Button>

                                {/* Etherscan shortcut */}
                                {walletInput && walletInput.startsWith("0x") && walletInput.length === 42 && (
                                    <a
                                        href={`https://sepolia.etherscan.io/address/${walletInput}`}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="flex items-center justify-center gap-1.5 text-purple-400 hover:text-purple-300 text-xs underline underline-offset-4 transition-colors"
                                    >
                                        <ExternalLink className="h-3 w-3" />
                                        View on Sepolia Etherscan
                                    </a>
                                )}
                            </CardContent>
                        </Card>

                    </div>
                )}
            </div>
        </div>
    );
}