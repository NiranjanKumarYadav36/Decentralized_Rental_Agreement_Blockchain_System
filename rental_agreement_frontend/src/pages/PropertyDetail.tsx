/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getProperty } from "@/services/api";
import { useAuth } from "@/context/AuthContext";
import { DetailSkeleton } from "@/components/Skeleton";
import RequestAgreementButton from "@/components/RequestAgreementButton";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, LayoutDashboard, LogIn } from "lucide-react";
import Navbar from "@/components/Navbar";

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

    const bgShell = (
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
            <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl" />
            <div className="absolute top-1/3 right-1/4 w-80 h-80 bg-blue-600/15 rounded-full blur-3xl" />
            <div className="absolute bottom-1/4 left-1/3 w-72 h-72 bg-violet-600/10 rounded-full blur-3xl" />
            <div
                className="absolute inset-0 opacity-[0.03]"
                style={{
                    backgroundImage: `linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px),
                                      linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)`,
                    backgroundSize: "64px 64px",
                }}
            />
        </div>
    );

    if (loading) {
        return (
            <div className="min-h-screen bg-[#0a0a0f] text-white">
                {bgShell}
                <Navbar />
                <DetailSkeleton />
            </div>
        );
    }

    if (!property) {
        return (
            <div className="min-h-screen bg-[#0a0a0f] text-white flex flex-col">
                {bgShell}
                <Navbar />
                <div className="flex-1 flex items-center justify-center">
                    <p className="text-red-400 text-xl">Property not found!</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#0a0a0f] text-white overflow-x-hidden">
            {bgShell}

            {/* NAVBAR */}
            <nav className="sticky top-0 z-50 flex items-center justify-between px-8 py-4 border-b border-white/5 bg-[#0a0a0f]/80 backdrop-blur-md">
                <button
                    onClick={() => navigate("/")}
                    className="flex items-center gap-2 cursor-pointer group"
                >
                    <span className="text-2xl group-hover:scale-110 transition-transform duration-200">🏠</span>
                    <span className="text-xl font-bold text-white tracking-tight">RentalChain</span>
                </button>

                <div className="flex items-center gap-3">
                    <Button
                        variant="ghost"
                        onClick={() => navigate("/properties")}
                        className="border border-white/15 hover:border-white/30 hover:bg-white/10 text-white rounded-xl px-5 transition-all duration-200"
                    >
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Back to Listings
                    </Button>

                    {user ? (
                        <Button
                            onClick={() => navigate(
                                user.role === "landlord" ? "/dashboard/landlord" : "/dashboard/tenant"
                            )}
                            className="bg-purple-600 hover:bg-purple-700 text-white rounded-xl px-5 shadow-lg shadow-purple-900/40 transition-all duration-200"
                        >
                            <LayoutDashboard className="h-4 w-4 mr-2" />
                            Dashboard
                        </Button>
                    ) : (
                        <Button
                            onClick={() => navigate("/login")}
                            className="bg-purple-600 hover:bg-purple-700 text-white rounded-xl px-5 shadow-lg shadow-purple-900/40 transition-all duration-200"
                        >
                            <LogIn className="h-4 w-4 mr-2" />
                            Login to Apply
                        </Button>
                    )}
                </div>
            </nav>

            <div className="relative z-10 max-w-5xl mx-auto px-6 py-10">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">

                    {/* ── LEFT COLUMN ── */}
                    <div className="lg:col-span-2 space-y-6">

                        {/* IMAGE GALLERY */}
                        <div className="rounded-2xl overflow-hidden">
                            <div className="h-72 bg-gradient-to-br from-purple-600/60 to-blue-600/60 overflow-hidden rounded-2xl">
                                {property.images?.length > 0 ? (
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

                            {property.images?.length > 1 && (
                                <div className="flex gap-2 mt-2">
                                    {property.images.map((img: string, index: number) => (
                                        <div
                                            key={index}
                                            onClick={() => setSelectedImage(index)}
                                            className={`h-16 w-24 rounded-xl overflow-hidden cursor-pointer border-2 transition-all duration-200 ${
                                                selectedImage === index
                                                    ? "border-purple-400 opacity-100"
                                                    : "border-white/10 opacity-50 hover:opacity-100"
                                            }`}
                                        >
                                            <img src={img} alt={`view ${index + 1}`} className="w-full h-full object-cover" />
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* TITLE & DESCRIPTION */}
                        <Card className="bg-white/5 border-white/10">
                            <CardContent className="p-6">
                                <div className="flex items-center gap-2 mb-4">
                                    <Badge variant="outline" className="border-purple-500/40 text-purple-300 bg-purple-500/10">
                                        {property.roomType}
                                    </Badge>
                                    <Badge
                                        variant="outline"
                                        className={property.isAvailable
                                            ? "border-green-500/40 text-green-300 bg-green-500/10"
                                            : "border-red-500/40 text-red-300 bg-red-500/10"
                                        }
                                    >
                                        {property.isAvailable ? "✅ Available" : "❌ Not Available"}
                                    </Badge>
                                </div>

                                <h1 className="text-3xl font-bold text-white mb-2 tracking-tight">
                                    {property.title}
                                </h1>
                                <p className="text-purple-300 text-lg mb-4">📍 {property.location}</p>
                                <Separator className="bg-white/10 mb-4" />
                                <p className="text-purple-200 leading-relaxed">{property.description}</p>
                            </CardContent>
                        </Card>

                        {/* AMENITIES */}
                        <Card className="bg-white/5 border-white/10">
                            <CardHeader className="pb-2">
                                <CardTitle className="text-white text-lg">✨ Amenities</CardTitle>
                            </CardHeader>
                            <CardContent className="flex flex-wrap gap-2 pt-0">
                                {property.amenities.map((amenity: string) => (
                                    <Badge
                                        key={amenity}
                                        variant="outline"
                                        className="border-purple-500/30 text-purple-200 bg-purple-500/10 px-4 py-1.5 text-sm"
                                    >
                                        {amenity}
                                    </Badge>
                                ))}
                            </CardContent>
                        </Card>

                        {/* BLOCKCHAIN INFO */}
                        {property.contractAddress && (
                            <Card className="bg-white/5 border-white/10">
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-white text-lg">⛓️ Blockchain Details</CardTitle>
                                </CardHeader>
                                <CardContent className="pt-0">
                                    <div className="bg-white/5 border border-white/10 rounded-xl p-4 relative overflow-hidden">
                                        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-purple-500/40 to-transparent" />
                                        <p className="text-purple-300 text-xs mb-1">Smart Contract Address</p>
                                        <p className="text-white font-mono text-sm break-all mb-2">
                                            {property.contractAddress}
                                        </p>
                                        <a
                                            href={`https://sepolia.etherscan.io/address/${property.contractAddress}`}
                                            target="_blank"
                                            rel="noreferrer"
                                            className="text-blue-300 underline underline-offset-4 text-sm hover:text-blue-200 transition-colors"
                                        >
                                            View on Etherscan →
                                        </a>
                                    </div>
                                </CardContent>
                            </Card>
                        )}
                    </div>

                    {/* ── RIGHT COLUMN ── */}
                    <div className="space-y-6">

                        {/* PRICING CARD */}
                        <Card className="bg-white/5 border-white/10">
                            <CardHeader className="pb-2">
                                <CardTitle className="text-white text-lg">💰 Pricing</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3 pt-0">
                                {[
                                    {
                                        label: "Monthly Rent",
                                        value: `₹${property.rentAmount.toLocaleString()}`,
                                        sub: "per month",
                                        valueClass: "text-3xl text-white",
                                    },
                                    {
                                        label: "Security Deposit",
                                        value: `₹${property.depositAmount.toLocaleString()}`,
                                        sub: "refundable on exit",
                                        valueClass: "text-2xl text-white",
                                    },
                                    {
                                        label: "Total Move-in",
                                        value: `₹${(property.rentAmount + property.depositAmount).toLocaleString()}`,
                                        sub: "first month + deposit",
                                        valueClass: "text-2xl text-green-300",
                                    },
                                ].map(({ label, value, sub, valueClass }) => (
                                    <div key={label} className="bg-white/5 border border-white/10 rounded-xl p-4 relative overflow-hidden">
                                        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-purple-500/40 to-transparent" />
                                        <p className="text-purple-300 text-xs mb-1">{label}</p>
                                        <p className={`font-bold ${valueClass}`}>{value}</p>
                                        <p className="text-purple-400 text-xs mt-0.5">{sub}</p>
                                    </div>
                                ))}

                                <Separator className="bg-white/10" />

                                {/* CTA */}
                                {property.isAvailable ? (
                                    user ? (
                                        user.role === "tenant" ? (
                                            <RequestAgreementButton property={property} user={user} />
                                        ) : (
                                            <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-3 text-center">
                                                <p className="text-blue-300 text-sm">👔 You are the landlord</p>
                                            </div>
                                        )
                                    ) : (
                                        <Button
                                            onClick={() => navigate("/login")}
                                            className="w-full bg-purple-600 hover:bg-purple-700 text-white py-3 rounded-xl text-base font-semibold shadow-lg shadow-purple-900/30 hover:-translate-y-0.5 transition-all duration-200"
                                        >
                                            🔐 Login to Apply
                                        </Button>
                                    )
                                ) : (
                                    <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-3 text-center">
                                        <p className="text-red-300">❌ Not Available</p>
                                    </div>
                                )}

                                {/* BLOCKCHAIN BADGE */}
                                <div className="bg-purple-500/10 border border-purple-500/20 rounded-xl p-3 text-center">
                                    <p className="text-purple-300 text-xs">
                                        ⛓️ Agreement secured by Ethereum blockchain
                                    </p>
                                </div>
                            </CardContent>
                        </Card>

                        {/* LANDLORD CARD */}
                        <Card className="bg-white/5 border-white/10">
                            <CardHeader className="pb-2">
                                <CardTitle className="text-white text-lg">👔 Landlord</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3 pt-0">
                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-violet-700 rounded-full flex items-center justify-center text-white font-bold text-lg shrink-0 shadow-lg shadow-purple-900/40">
                                        {property.landlord?.name?.charAt(0).toUpperCase()}
                                    </div>
                                    <div>
                                        <p className="text-white font-semibold">{property.landlord?.name}</p>
                                        <p className="text-purple-300 text-sm">{property.landlord?.email}</p>
                                    </div>
                                </div>

                                {property.landlord?.phone && (
                                    <div className="bg-white/5 border border-white/10 rounded-xl p-3 relative overflow-hidden">
                                        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-purple-500/40 to-transparent" />
                                        <p className="text-purple-300 text-xs mb-1">Phone</p>
                                        <p className="text-white text-sm">📞 {property.landlord.phone}</p>
                                    </div>
                                )}

                                {property.landlord?.walletAddress && (
                                    <div className="bg-white/5 border border-white/10 rounded-xl p-3 relative overflow-hidden">
                                        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-purple-500/40 to-transparent" />
                                        <p className="text-purple-300 text-xs mb-1">Wallet Address</p>
                                        <p className="text-white font-mono text-xs break-all">{property.landlord.walletAddress}</p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                    </div>
                </div>
            </div>
        </div>
    );
}