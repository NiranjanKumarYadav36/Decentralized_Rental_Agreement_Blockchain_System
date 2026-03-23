/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { getProperty } from "@/services/api";
import { useAuth } from "@/context/AuthContext";
import { DetailSkeleton } from "@/components/Skeleton";
import RequestAgreementButton from "@/components/RequestAgreementButton";

export default function PropertyDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const [property, setProperty] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [selectedImage, setSelectedImage] = useState(0);

    useEffect(() => {
        const fetch = async () => {
            try {
                const res = await getProperty(id!);
                setProperty(res.data);
                setLoading(false);
            } catch {
                setLoading(false);
            }
        };
        fetch();
    }, [id]);

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
                <DetailSkeleton />
            </div>
        );
    }

    if (!property) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
                <p className="text-red-400 text-xl">Property not found!</p>
            </div>
        );
    }

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
                <div className="flex gap-3">
                    <Button
                        onClick={() => navigate("/properties")}
                        className="bg-white/10 hover:bg-white/20 text-white rounded-xl"
                    >
                        ← Back to Listings
                    </Button>
                    {user ? (
                        <Button
                            onClick={() => navigate(
                                user.role === "landlord"
                                    ? "/dashboard/landlord"
                                    : "/dashboard/tenant"
                            )}
                            className="bg-purple-600 hover:bg-purple-700 text-white rounded-xl"
                        >
                            Dashboard
                        </Button>
                    ) : (
                        <Button
                            onClick={() => navigate("/login")}
                            className="bg-purple-600 hover:bg-purple-700 text-white rounded-xl"
                        >
                            Login to Apply
                        </Button>
                    )}
                </div>
            </nav>

            <div className="max-w-5xl mx-auto px-4 py-10">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">

                    {/* LEFT COLUMN — Main Details */}
                    <div className="lg:col-span-2 space-y-6">

                        {/* PROPERTY IMAGE GALLERY */}
                        <div className="rounded-2xl overflow-hidden">
                            {/* Main Image */}
                            <div className="h-72 bg-gradient-to-br from-purple-600 to-blue-600 overflow-hidden">
                                {property.images && property.images.length > 0 ? (
                                    <img
                                        src={property.images[selectedImage]}
                                        alt={property.title}
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center">
                                        <span className="text-9xl">🏠</span>
                                    </div>
                                )}
                            </div>

                            {/* Thumbnail Row */}
                            {property.images && property.images.length > 1 && (
                                <div className="flex gap-2 mt-2">
                                    {property.images.map((img: string, index: number) => (
                                        <div
                                            key={index}
                                            onClick={() => setSelectedImage(index)}
                                            className={`h-16 w-24 rounded-xl overflow-hidden cursor-pointer border-2 transition-all ${selectedImage === index
                                                    ? "border-purple-400 opacity-100"
                                                    : "border-white/10 opacity-60 hover:opacity-100"
                                                }`}
                                        >
                                            <img
                                                src={img}
                                                alt={`view ${index + 1}`}
                                                className="w-full h-full object-cover"
                                            />
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* TITLE AND BADGES */}
                        <div className="bg-white/10 backdrop-blur rounded-2xl p-6 border border-white/20">
                            <div className="flex items-center gap-3 mb-3">
                                <span className="bg-purple-500/20 text-purple-300 text-sm px-3 py-1 rounded-full">
                                    {property.roomType}
                                </span>
                                <span className={`text-sm px-3 py-1 rounded-full ${property.isAvailable
                                    ? "bg-green-500/20 text-green-300"
                                    : "bg-red-500/20 text-red-300"
                                    }`}>
                                    {property.isAvailable ? "✅ Available" : "❌ Not Available"}
                                </span>
                            </div>
                            <h1 className="text-3xl font-bold text-white mb-2">
                                {property.title}
                            </h1>
                            <p className="text-purple-300 text-lg mb-4">
                                📍 {property.location}
                            </p>
                            <p className="text-purple-200 leading-relaxed">
                                {property.description}
                            </p>
                        </div>

                        {/* AMENITIES */}
                        <div className="bg-white/10 backdrop-blur rounded-2xl p-6 border border-white/20">
                            <h2 className="text-xl font-bold text-white mb-4">
                                ✨ Amenities
                            </h2>
                            <div className="flex flex-wrap gap-2">
                                {property.amenities.map((amenity: string) => (
                                    <span
                                        key={amenity}
                                        className="bg-purple-500/20 text-purple-200 px-4 py-2 rounded-full text-sm border border-purple-500/30"
                                    >
                                        {amenity}
                                    </span>
                                ))}
                            </div>
                        </div>

                        {/* BLOCKCHAIN INFO */}
                        {property.contractAddress && (
                            <div className="bg-white/10 backdrop-blur rounded-2xl p-6 border border-white/20">
                                <h2 className="text-xl font-bold text-white mb-4">
                                    ⛓️ Blockchain Details
                                </h2>
                                <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                                    <p className="text-purple-300 text-xs mb-1">
                                        Smart Contract Address
                                    </p>
                                    <p className="text-white font-mono text-sm break-all">
                                        {property.contractAddress}
                                    </p>
                                    <a
                                        href={`https://sepolia.etherscan.io/address/${property.contractAddress}`}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="text-blue-300 underline text-sm mt-2 block"
                                    >
                                        View on Etherscan →
                                    </a>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* RIGHT COLUMN — Pricing and CTA */}
                    <div className="space-y-6">

                        {/* PRICING CARD */}
                        <div className="bg-white/10 backdrop-blur rounded-2xl p-6 border border-white/20">
                            <h2 className="text-xl font-bold text-white mb-4">
                                💰 Pricing
                            </h2>
                            <div className="space-y-4">
                                <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                                    <p className="text-purple-300 text-xs mb-1">Monthly Rent</p>
                                    <p className="text-3xl font-bold text-white">
                                        ₹{property.rentAmount.toLocaleString()}
                                    </p>
                                    <p className="text-purple-400 text-xs">per month</p>
                                </div>
                                <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                                    <p className="text-purple-300 text-xs mb-1">
                                        Security Deposit
                                    </p>
                                    <p className="text-2xl font-bold text-white">
                                        ₹{property.depositAmount.toLocaleString()}
                                    </p>
                                    <p className="text-purple-400 text-xs">
                                        refundable on exit
                                    </p>
                                </div>
                                <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                                    <p className="text-purple-300 text-xs mb-1">Total Move-in</p>
                                    <p className="text-2xl font-bold text-green-300">
                                        ₹{(property.rentAmount + property.depositAmount).toLocaleString()}
                                    </p>
                                    <p className="text-purple-400 text-xs">
                                        first month + deposit
                                    </p>
                                </div>
                            </div>

                            {/* CTA BUTTON */}
                            {property.isAvailable ? (
                                user ? (
                                    user.role === "tenant" ? (
                                        <RequestAgreementButton
                                            property={property}
                                            user={user}
                                        />
                                    ) : (
                                        <div className="bg-blue-500/20 border border-blue-500/30 rounded-xl p-3 mt-4 text-center">
                                            <p className="text-blue-300 text-sm">
                                                👔 You are the landlord
                                            </p>
                                        </div>
                                    )
                                ) : (
                                    <Button
                                        onClick={() => navigate("/login")}
                                        className="w-full bg-purple-600 hover:bg-purple-700 text-white py-3 rounded-xl text-lg mt-4"
                                    >
                                        🔐 Login to Apply
                                    </Button>
                                )
                            ) : (
                                <div className="bg-red-500/20 border border-red-500/30 rounded-xl p-3 mt-4 text-center">
                                    <p className="text-red-300">❌ Not Available</p>
                                </div>
                            )}

                            {/* BLOCKCHAIN BADGE */}
                            <div className="bg-purple-500/10 border border-purple-500/20 rounded-xl p-3 mt-3 text-center">
                                <p className="text-purple-300 text-xs">
                                    ⛓️ Agreement secured by Ethereum blockchain
                                </p>
                            </div>
                        </div>

                        {/* LANDLORD CARD */}
                        <div className="bg-white/10 backdrop-blur rounded-2xl p-6 border border-white/20">
                            <h2 className="text-xl font-bold text-white mb-4">
                                👔 Landlord
                            </h2>
                            <div className="space-y-3">
                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 bg-purple-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                                        {property.landlord?.name?.charAt(0).toUpperCase()}
                                    </div>
                                    <div>
                                        <p className="text-white font-semibold">
                                            {property.landlord?.name}
                                        </p>
                                        <p className="text-purple-300 text-sm">
                                            {property.landlord?.email}
                                        </p>
                                    </div>
                                </div>
                                {property.landlord?.phone && (
                                    <div className="bg-white/5 rounded-xl p-3 border border-white/10">
                                        <p className="text-purple-300 text-xs mb-1">Phone</p>
                                        <p className="text-white">
                                            📞 {property.landlord.phone}
                                        </p>
                                    </div>
                                )}
                                {property.landlord?.walletAddress && (
                                    <div className="bg-white/5 rounded-xl p-3 border border-white/10">
                                        <p className="text-purple-300 text-xs mb-1">
                                            Wallet Address
                                        </p>
                                        <p className="text-white font-mono text-xs break-all">
                                            {property.landlord.walletAddress}
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>

                    </div>
                </div>
            </div>
        </div>
    );
}