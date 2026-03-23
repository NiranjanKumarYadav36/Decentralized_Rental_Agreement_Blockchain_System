/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ethers } from "ethers";
import { Button } from "@/components/ui/button";
import { getProperties } from "@/services/api";
import { useAuth } from "@/context/AuthContext";
import { getTenantAgreements, updateAgreementStatus } from "@/services/api";

import contractDataRaw from "@/contracts/RentalAgreement.json";
const contractData = contractDataRaw as any;
const CONTRACT_ADDRESS = contractData.address || "";
const CONTRACT_ABI = contractData.abi;

export default function TenantDashboard() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    // Properties
    const [properties, setProperties] = useState<any[]>([]);
    const [loadingProps, setLoadingProps] = useState(true);

    // Blockchain
    const [account, setAccount] = useState("");
    const [contract, setContract] = useState<any>(null);
    const [details, setDetails] = useState<any>(null);
    const [role, setRole] = useState("");
    const [loading, setLoading] = useState("");
    const [txHash, setTxHash] = useState("");
    const [error, setError] = useState("");
    const [disputeReason, setDisputeReason] = useState("");
    const [disputeText, setDisputeText] = useState("");
    const [activeTab, setActiveTab] = useState<"browse" | "agreements" | "agreement">("browse");

    const [myAgreements, setMyAgreements] = useState<any[]>([]);
    const [loadingAgreements, setLoadingAgreements] = useState(false);
    const [approvedAgreement, setApprovedAgreement] = useState<any>(null);

    // Load properties
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

    // Connect wallet
    const connectWallet = async () => {
        try {
            setError("");
            if (!window.ethereum) {
                setError("MetaMask not found!");
                return;
            }

            // Check if there is an approved agreement
            if (!approvedAgreement?.contractAddress) {
                setError("No approved agreement found! Wait for landlord to approve.");
                return;
            }

            const accounts = await window.ethereum.request({
                method: "eth_requestAccounts",
            });
            const userAccount = accounts[0].toLowerCase();
            setAccount(userAccount);

            const provider = new ethers.BrowserProvider(window.ethereum);
            const signer = await provider.getSigner();

            // Use DYNAMIC contract address from approved agreement
            const c = new ethers.Contract(
                approvedAgreement.contractAddress,
                CONTRACT_ABI,
                signer
            );
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

            // Find approved agreement with contract address
            const approved = res.data.find(
                (a: any) => (a.status === "approved" || a.status === "active") && a.contractAddress
            );
            if (approved) {
                setApprovedAgreement(approved);
            } else {
                setApprovedAgreement(null); // ← ADD THIS
            }

            setLoadingAgreements(false);
        } catch {
            setLoadingAgreements(false);
        }
    };

    useEffect(() => {
        fetchMyAgreements();
    }, []);


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

            // ✅ Auto update status to active in backend
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
    const fmtDate = (val: any) =>
        new Date(Number(val) * 1000).toLocaleDateString();
    const short = (addr: string) =>
        addr ? addr.slice(0, 6) + "..." + addr.slice(-4) : "";

    const handleLogout = () => {
        logout();
        navigate("/login");
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">

            {/* NAVBAR */}
            <nav className="border-b border-white/10 px-6 py-4 flex items-center justify-between">
                <h1
                    className="text-white font-bold text-xl cursor-pointer"
                    onClick={() => navigate("/properties")}
                >
                    🏠 RentalChain
                </h1>
                <div className="flex items-center gap-3">
                    <span className="text-purple-300 text-sm">
                        👋 {user?.name}
                    </span>
                    <Button
                        onClick={() => navigate("/properties")}
                        className="bg-white/10 hover:bg-white/20 text-white rounded-xl"
                    >
                        Browse
                    </Button>
                    <Button
                        onClick={handleLogout}
                        className="bg-red-600/20 hover:bg-red-600/40 text-red-300 rounded-xl"
                    >
                        Logout
                    </Button>
                </div>
            </nav>

            <div className="max-w-6xl mx-auto px-4 py-10">

                {/* HEADER */}
                <div className="mb-8">
                    <h2 className="text-3xl font-bold text-white">
                        🏡 Tenant Dashboard
                    </h2>
                    <p className="text-purple-300 mt-1">
                        Browse properties and manage your rental agreement
                    </p>
                </div>

                {/* TABS */}
                <div className="flex gap-2 mb-8">
                    <button
                        onClick={() => setActiveTab("browse")}
                        className={`px-6 py-3 rounded-xl font-semibold transition-all ${activeTab === "browse"
                            ? "bg-purple-600 text-white"
                            : "bg-white/10 text-purple-300 hover:bg-white/20"
                            }`}
                    >
                        🏠 Browse Properties
                    </button>
                    <button
                        onClick={() => setActiveTab("agreements")}
                        className={`px-6 py-3 rounded-xl font-semibold transition-all ${activeTab === "agreements"
                            ? "bg-green-600 text-white"
                            : "bg-white/10 text-purple-300 hover:bg-white/20"
                            }`}
                    >
                        📋 My Requests
                    </button>
                    <button
                        onClick={() => setActiveTab("agreement")}
                        className={`px-6 py-3 rounded-xl font-semibold transition-all ${activeTab === "agreement"
                            ? "bg-purple-600 text-white"
                            : "bg-white/10 text-purple-300 hover:bg-white/20"
                            }`}
                    >
                        ⛓️ My Agreement
                    </button>
                </div>

                {/* BROWSE TAB */}
                {activeTab === "browse" && (
                    <div>
                        <h3 className="text-xl font-bold text-white mb-4">
                            Available Properties
                        </h3>
                        {loadingProps ? (
                            <p className="text-purple-300 animate-pulse">
                                Loading properties...
                            </p>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {properties.map((property) => (
                                    <div
                                        key={property._id}
                                        className="bg-white/10 backdrop-blur rounded-2xl border border-white/20 overflow-hidden hover:border-purple-400 transition-all cursor-pointer"
                                        onClick={() => navigate(`/property/${property._id}`)}
                                    >
                                        <div className="h-40 bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center">
                                            <span className="text-5xl">🏠</span>
                                        </div>
                                        <div className="p-4">
                                            <div className="flex items-center justify-between mb-2">
                                                <span className="bg-purple-500/20 text-purple-300 text-xs px-2 py-1 rounded-full">
                                                    {property.roomType}
                                                </span>
                                                <span className={`text-xs px-2 py-1 rounded-full ${property.isAvailable
                                                    ? "bg-green-500/20 text-green-300"
                                                    : "bg-red-500/20 text-red-300"
                                                    }`}>
                                                    {property.isAvailable ? "✅ Available" : "❌ Taken"}
                                                </span>
                                            </div>
                                            <h3 className="text-white font-bold mb-1">
                                                {property.title}
                                            </h3>
                                            <p className="text-purple-300 text-sm mb-3">
                                                📍 {property.location}
                                            </p>
                                            <div className="flex justify-between">
                                                <div>
                                                    <p className="text-purple-300 text-xs">Rent</p>
                                                    <p className="text-white font-bold">
                                                        ₹{property.rentAmount.toLocaleString()}
                                                    </p>
                                                </div>
                                                <div>
                                                    <p className="text-purple-300 text-xs">Deposit</p>
                                                    <p className="text-white font-bold">
                                                        ₹{property.depositAmount.toLocaleString()}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* MY REQUESTS TAB */}
                {activeTab === "agreements" && (
                    <div className="space-y-6">
                        <div className="flex items-center justify-between">
                            <h3 className="text-xl font-bold text-white">
                                📋 My Agreement Requests
                            </h3>
                            <Button
                                onClick={fetchMyAgreements}
                                className="bg-white/10 hover:bg-white/20 text-white rounded-xl text-sm"
                            >
                                🔄 Refresh
                            </Button>
                        </div>

                        {loadingAgreements ? (
                            <p className="text-purple-300 animate-pulse">Loading...</p>
                        ) : myAgreements.length === 0 ? (
                            <div className="bg-white/10 backdrop-blur rounded-2xl p-10 border border-white/20 text-center">
                                <p className="text-4xl mb-4">📋</p>
                                <p className="text-white font-bold mb-2">No requests yet</p>
                                <p className="text-purple-300 text-sm mb-6">
                                    Browse properties and request an agreement
                                </p>
                                <Button
                                    onClick={() => setActiveTab("browse")}
                                    className="bg-purple-600 hover:bg-purple-700 text-white rounded-xl"
                                >
                                    Browse Properties
                                </Button>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {myAgreements.map((agreement) => (
                                    <div
                                        key={agreement._id}
                                        className="bg-white/10 backdrop-blur rounded-2xl p-6 border border-white/20"
                                    >
                                        <div className="flex gap-2 mb-3">
                                            <span className={`px-3 py-1 rounded-full text-xs font-bold ${agreement.status === "pending"
                                                ? "bg-yellow-500/20 text-yellow-300"
                                                : agreement.status === "approved"
                                                    ? "bg-blue-500/20 text-blue-300"
                                                    : agreement.status === "active"
                                                        ? "bg-green-500/20 text-green-300"
                                                        : "bg-red-500/20 text-red-300"
                                                }`}>
                                                {agreement.status === "pending" ? "⏳ Pending Approval"
                                                    : agreement.status === "approved" ? "✅ Approved — Sign Now!"
                                                        : agreement.status === "active" ? "🟢 Active"
                                                            : "❌ " + agreement.status}
                                            </span>
                                        </div>

                                        <h4 className="text-white font-bold text-lg mb-1">
                                            🏠 {agreement.property?.title}
                                        </h4>
                                        <p className="text-purple-300 text-sm mb-3">
                                            📍 {agreement.property?.location}
                                        </p>

                                        <div className="flex gap-4 mb-3">
                                            <div>
                                                <p className="text-purple-300 text-xs">Rent</p>
                                                <p className="text-white font-bold">
                                                    ₹{agreement.rentAmount?.toLocaleString()}
                                                </p>
                                            </div>
                                            <div>
                                                <p className="text-purple-300 text-xs">Deposit</p>
                                                <p className="text-white font-bold">
                                                    ₹{agreement.depositAmount?.toLocaleString()}
                                                </p>
                                            </div>
                                            <div>
                                                <p className="text-purple-300 text-xs">Duration</p>
                                                <p className="text-white font-bold">
                                                    {agreement.durationDays} days
                                                </p>
                                            </div>
                                        </div>

                                        {/* If approved show contract address and sign button */}
                                        {agreement.status === "approved" && agreement.contractAddress && (
                                            <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4">
                                                <p className="text-blue-300 text-sm font-semibold mb-2">
                                                    🎉 Approved! Sign on blockchain now
                                                </p>
                                                <p className="text-white font-mono text-xs break-all mb-3">
                                                    Contract: {agreement.contractAddress}
                                                </p>
                                                <Button
                                                    onClick={() => {
                                                        setActiveTab("agreement");
                                                    }}
                                                    className="w-full bg-green-600 hover:bg-green-700 text-white rounded-xl"
                                                >
                                                    ⛓️ Go to My Agreement Tab to Sign
                                                </Button>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* AGREEMENT TAB */}
                {activeTab === "agreement" && (
                    <div className="space-y-6">

                        {/* CONNECT WALLET */}
                        {!account ? (
                            <div className="bg-white/10 backdrop-blur rounded-2xl p-10 text-center border border-white/20">
                                <div className="text-6xl mb-4">🦊</div>
                                <h3 className="text-2xl font-bold text-white mb-2">
                                    Connect MetaMask
                                </h3>

                                {approvedAgreement ? (
                                    <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-4 mb-6 text-left">
                                        <p className="text-green-300 font-semibold mb-2">
                                            ✅ Agreement Approved!
                                        </p>
                                        <p className="text-white text-sm mb-1">
                                            🏠 {approvedAgreement.property?.title}
                                        </p>
                                        <p className="text-purple-300 text-xs font-mono break-all">
                                            Contract: {approvedAgreement.contractAddress}
                                        </p>
                                    </div>
                                ) : (
                                    <p className="text-purple-200 mb-6">
                                        Connect your wallet to view and manage your rental agreement
                                    </p>
                                )}

                                <Button
                                    onClick={connectWallet}
                                    disabled={!approvedAgreement}
                                    className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-3 rounded-xl text-lg disabled:opacity-50"
                                >
                                    {approvedAgreement
                                        ? "Connect MetaMask to Sign"
                                        : "No Approved Agreement Yet"}
                                </Button>

                                {!approvedAgreement && (
                                    <p className="text-purple-300 text-sm mt-4">
                                        Request an agreement from a property and wait for landlord approval
                                    </p>
                                )}

                                {error && <p className="text-red-400 mt-4">{error}</p>}
                            </div>
                        ) : (
                            <div className="space-y-6">

                                {/* WALLET BADGE */}
                                <div className="bg-white/10 backdrop-blur rounded-2xl p-4 border border-white/20 flex items-center justify-between">
                                    <div>
                                        <p className="text-purple-300 text-sm">
                                            Connected Wallet
                                        </p>
                                        <p className="text-white font-mono">{short(account)}</p>
                                    </div>
                                    <div className={`px-4 py-2 rounded-full text-sm font-bold border ${role === "tenant"
                                        ? "bg-green-500/20 text-green-300 border-green-500/30"
                                        : role === "landlord"
                                            ? "bg-blue-500/20 text-blue-300 border-blue-500/30"
                                            : "bg-red-500/20 text-red-300 border-red-500/30"
                                        }`}>
                                        {role === "tenant" ? "🏡 Tenant"
                                            : role === "landlord" ? "👔 Landlord"
                                                : "⚠️ Unknown Role"}
                                    </div>
                                </div>

                                {/* AGREEMENT DETAILS */}
                                {details && (
                                    <div className="bg-white/10 backdrop-blur rounded-2xl p-6 border border-white/20">
                                        <h3 className="text-xl font-bold text-white mb-4">
                                            📋 Agreement Details
                                        </h3>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="bg-white/5 rounded-xl p-3 border border-white/10">
                                                <p className="text-purple-300 text-xs mb-1">Landlord</p>
                                                <p className="text-white font-semibold">
                                                    {short(details.landlord)}
                                                </p>
                                            </div>
                                            <div className="bg-white/5 rounded-xl p-3 border border-white/10">
                                                <p className="text-purple-300 text-xs mb-1">Tenant</p>
                                                <p className="text-white font-semibold">
                                                    {short(details.tenant)}
                                                </p>
                                            </div>
                                            <div className="bg-white/5 rounded-xl p-3 border border-white/10">
                                                <p className="text-purple-300 text-xs mb-1">
                                                    Monthly Rent
                                                </p>
                                                <p className="text-white font-semibold">
                                                    {fmt(details.rentAmount)}
                                                </p>
                                            </div>
                                            <div className="bg-white/5 rounded-xl p-3 border border-white/10">
                                                <p className="text-purple-300 text-xs mb-1">Deposit</p>
                                                <p className="text-white font-semibold">
                                                    {fmt(details.depositAmount)}
                                                </p>
                                            </div>
                                            <div className="bg-white/5 rounded-xl p-3 border border-white/10">
                                                <p className="text-purple-300 text-xs mb-1">Ends On</p>
                                                <p className="text-white font-semibold">
                                                    {fmtDate(details.agreementEnd)}
                                                </p>
                                            </div>
                                            <div className="bg-white/5 rounded-xl p-3 border border-white/10">
                                                <p className="text-purple-300 text-xs mb-1">
                                                    Total Rent Paid
                                                </p>
                                                <p className="text-white font-semibold">
                                                    {fmt(details.totalRentPaid)}
                                                </p>
                                            </div>
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
                                        <h3 className="text-xl font-bold text-white mb-4">
                                            🏡 Actions
                                        </h3>
                                        <div className="space-y-3">

                                            {/* Sign Agreement */}
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

                                            {/* Pay Rent */}
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

                                            {/* Raise Dispute */}
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

                                            {/* Active Dispute Info */}
                                            {details.disputeActive && disputeText && (
                                                <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-4">
                                                    <p className="text-yellow-300 font-semibold mb-1">
                                                        ⚠️ Active Dispute
                                                    </p>
                                                    <p className="text-white text-sm">{disputeText}</p>
                                                    <p className="text-yellow-200 text-xs mt-2">
                                                        Waiting for landlord to resolve...
                                                    </p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}

                                {/* LOADING */}
                                {loading && (
                                    <div className="bg-purple-500/20 border border-purple-500/30 rounded-2xl p-4 text-center">
                                        <p className="text-purple-200 animate-pulse">
                                            ⏳ {loading}
                                        </p>
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
                                        <p className="text-green-300 text-sm mb-1">
                                            ✅ Transaction Successful!
                                        </p>
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

                                {/* ETHERSCAN LINK */}
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
                )}
            </div>
        </div>
    );
}