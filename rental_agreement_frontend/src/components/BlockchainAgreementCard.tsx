/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from "react";
import { ethers } from "ethers";
import { Button } from "@/components/ui/button";
import { updateAgreementStatus } from "@/services/api";

export default function BlockchainAgreementCard({
    agreement,
    CONTRACT_ABI,
    onSuccess
}: any) {
    const [details, setDetails] = useState<any>(null);
    const [disputeText, setDisputeText] = useState("");
    const [loading, setLoading] = useState("");
    const [error, setError] = useState("");
    const [txHash, setTxHash] = useState("");
    const [connected, setConnected] = useState(false);
    const [connectedWallet, setConnectedWallet] = useState("");
    const [isLandlord, setIsLandlord] = useState(false);

    const short = (addr: string) =>
        addr ? addr.slice(0, 6) + "..." + addr.slice(-4) : "";
    const fmt = (val: any) => ethers.formatEther(val) + " ETH";
    const fmtDate = (val: any) =>
        new Date(Number(val) * 1000).toLocaleDateString();

    const loadBlockchainDetails = async () => {
        try {
            if (!window.ethereum || !agreement.contractAddress) return;
            const provider = new ethers.BrowserProvider(window.ethereum);
            const signer = await provider.getSigner();
            const walletAddress = (await signer.getAddress()).toLowerCase();
            setConnectedWallet(walletAddress);

            const c = new ethers.Contract(
                agreement.contractAddress,
                CONTRACT_ABI,
                signer
            );
            const d = await c.getAgreementDetails();
            setDetails({
                landlord: d[0],
                tenant: d[1],
                rentAmount: d[2],
                depositAmount: d[3],
                agreementEnd: d[4],
                isActive: d[5],
                totalRentPaid: d[6],
                disputeActive: d[7],
                contract: c
            });

            // Check if connected wallet is landlord
            const landlordAddr = d[0].toLowerCase();
            setIsLandlord(walletAddress === landlordAddr);

            const reason = await c.disputeReason();
            setDisputeText(reason);
            setConnected(true);
        } catch {
            setError("Failed to load blockchain data");
        }
    };

    const resolveDispute = async (returnDeposit: boolean) => {
        if (!details?.contract) return;
        try {
            setLoading("Resolving dispute...");
            setError("");
            const tx = await details.contract.resolveDispute(returnDeposit);
            setTxHash(tx.hash);
            await tx.wait();
            setLoading("");
            await loadBlockchainDetails();

            // ✅ Only update dispute fields — NOT status
            await updateAgreementStatus(agreement._id, {
                disputeActive: false,
                disputeReason: ""
                // NO status field here — agreement stays active!
            });
            onSuccess();
        } catch (err: any) {
            setError(err.reason || err.message || "Failed");
            setLoading("");
        }
    };

    const terminateAgreement = async () => {
        if (!details?.contract) return;
        try {
            setLoading("Terminating...");
            setError("");
            const tx = await details.contract.terminateAgreement();
            setTxHash(tx.hash);
            await tx.wait();
            setLoading("");
            await updateAgreementStatus(agreement._id, {
                status: "terminated"
            });
            onSuccess();
        } catch (err: any) {
            setError(err.reason || err.message || "Failed");
            setLoading("");
        }
    };

    return (
        <div className="bg-white/10 backdrop-blur rounded-2xl p-6 border border-white/20">

            {/* HEADER */}
            <div className="flex items-start justify-between mb-4">
                <div>
                    <h4 className="text-white font-bold text-lg mb-1">
                        🏠 {agreement.property?.title}
                    </h4>
                    <p className="text-purple-300 text-sm">
                        📍 {agreement.property?.location}
                    </p>
                </div>
                <span className="bg-green-500/20 text-green-300 text-xs px-3 py-1 rounded-full font-bold">
                    🟢 {agreement.status}
                </span>
            </div>

            {/* TENANT INFO */}
            <div className="bg-white/5 rounded-xl p-3 border border-white/10 mb-4">
                <p className="text-purple-300 text-xs mb-1">Tenant</p>
                <p className="text-white font-semibold">
                    👤 {agreement.tenant?.name}
                </p>
                <p className="text-purple-300 text-sm">{agreement.tenant?.email}</p>
                <p className="text-purple-400 text-xs font-mono mt-1">
                    {agreement.tenant?.walletAddress?.slice(0, 16)}...
                </p>
            </div>

            {/* CONTRACT ADDRESS */}
            <div className="bg-purple-500/10 border border-purple-500/20 rounded-xl p-3 mb-4">
                <p className="text-purple-300 text-xs mb-1">⛓️ Contract Address</p>
                <p className="text-white font-mono text-xs break-all">
                    {agreement.contractAddress}
                </p>
                <a
                    href={`https://sepolia.etherscan.io/address/${agreement.contractAddress}`}
                    target="_blank"
                    rel="noreferrer"
                    className="text-blue-300 underline text-xs mt-1 block"
                >
                    View on Etherscan →
                </a>
            </div>

            {/* CONNECT BUTTON */}
            {
                !connected ? (
                    <Button
                        onClick={loadBlockchainDetails}
                        className="w-full bg-purple-600 hover:bg-purple-700 text-white rounded-xl mb-4"
                    >
                        🔗 Load Live Blockchain Data
                    </Button>
                ) : (
                    <div className="space-y-4">

                        {/* LIVE BLOCKCHAIN DETAILS */}
                        <div className="grid grid-cols-2 gap-3">
                            <div className="bg-white/5 rounded-xl p-3 border border-white/10">
                                <p className="text-purple-300 text-xs mb-1">Landlord</p>
                                <p className="text-white text-sm font-semibold">
                                    {short(details.landlord)}
                                </p>
                            </div>
                            <div className="bg-white/5 rounded-xl p-3 border border-white/10">
                                <p className="text-purple-300 text-xs mb-1">Tenant</p>
                                <p className="text-white text-sm font-semibold">
                                    {short(details.tenant)}
                                </p>
                            </div>
                            <div className="bg-white/5 rounded-xl p-3 border border-white/10">
                                <p className="text-purple-300 text-xs mb-1">Monthly Rent</p>
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
                                <p className="text-purple-300 text-xs mb-1">Total Rent Paid</p>
                                <p className="text-white font-semibold">
                                    {fmt(details.totalRentPaid)}
                                </p>
                            </div>
                        </div>

                        {/* STATUS BADGES */}
                        <div className="flex gap-2">
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

                        {/* WALLET WARNING */}
                        {!isLandlord && connected && (
                            <div className="bg-yellow-500/20 border border-yellow-500/30 rounded-xl p-3 mb-3">
                                <p className="text-yellow-300 text-sm">
                                    ⚠️ Switch MetaMask to Landlord wallet to perform actions
                                </p>
                                <p className="text-yellow-200 text-xs font-mono mt-1">
                                    Landlord: {details?.landlord?.slice(0, 10)}...
                                </p>
                                <p className="text-yellow-200 text-xs font-mono">
                                    Connected: {connectedWallet?.slice(0, 10)}...
                                </p>
                            </div>
                        )}

                        {/* DISPUTE RESOLUTION */}
                        {details.disputeActive && (
                            <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-4">
                                <p className="text-yellow-300 font-semibold mb-2">
                                    ⚠️ Active Dispute
                                </p>
                                {disputeText && (
                                    <div className="bg-yellow-500/10 rounded-xl px-3 py-2 mb-3">
                                        <p className="text-yellow-200 text-xs mb-1">
                                            Dispute Reason:
                                        </p>
                                        <p className="text-white text-sm">{disputeText}</p>
                                    </div>
                                )}
                                <div className="flex gap-3">
                                    <Button
                                        onClick={() => resolveDispute(true)}
                                        disabled={!!loading || !isLandlord}
                                        className="flex-1 bg-green-600 hover:bg-green-700 text-white rounded-xl disabled:opacity-50"
                                    >
                                        ✅ Return Deposit
                                    </Button>
                                    <Button
                                        onClick={() => resolveDispute(false)}
                                        disabled={!!loading || !isLandlord}
                                        className="flex-1 bg-red-600 hover:bg-red-700 text-white rounded-xl disabled:opacity-50"
                                    >
                                        ❌ Keep Deposit
                                    </Button>
                                </div>
                            </div>
                        )}

                        {/* TERMINATE */}
                        {details.isActive && (
                            <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                                <p className="text-purple-200 text-sm mb-3">
                                    Terminate agreement after period ends
                                </p>
                                <Button
                                    onClick={terminateAgreement}
                                    disabled={!!loading || !isLandlord}
                                    className="w-full bg-red-600 hover:bg-red-700 text-white rounded-xl disabled:opacity-50"
                                >
                                    🔚 Terminate Agreement
                                </Button>
                            </div>
                        )}
                    </div>
                )
            }

            {/* LOADING */}
            {
                loading && (
                    <div className="bg-purple-500/20 border border-purple-500/30 rounded-xl p-3 mt-3 text-center">
                        <p className="text-purple-200 animate-pulse text-sm">
                            ⏳ {loading}
                        </p>
                    </div>
                )
            }

            {/* ERROR */}
            {
                error && (
                    <div className="bg-red-500/20 border border-red-500/30 rounded-xl p-3 mt-3">
                        <p className="text-red-300 text-sm">❌ {error}</p>
                    </div>
                )
            }

            {/* TX HASH */}
            {
                txHash && (
                    <div className="bg-green-500/20 border border-green-500/30 rounded-xl p-3 mt-3">
                        <p className="text-green-300 text-sm mb-1">✅ Transaction Done!</p>
                        <a
                            href={"https://sepolia.etherscan.io/tx/" + txHash}
                            target="_blank"
                            rel="noreferrer"
                            className="text-blue-300 underline text-xs font-mono break-all"
                        >
                            View on Etherscan →
                        </a>
                    </div>
                )
            }
        </div >
    );
}