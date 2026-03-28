/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getProperty, getPropertyReviews, addReview, getTenantAgreements } from "@/services/api";
import { useAuth } from "@/context/AuthContext";
import { DetailSkeleton } from "@/components/Skeleton";
import { Star, MessageSquare } from "lucide-react";
import RequestAgreementButton from "@/components/RequestAgreementButton";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import NavBar from "@/components/NavBar";


export default function PropertyDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const [property, setProperty] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [selectedImage, setSelectedImage] = useState(0);
    const [reviews, setReviews] = useState<any[]>([]);
    const [loadingReviews, setLoadingReviews] = useState(false);
    const [isEligible, setIsEligible] = useState(false);
    const [rating, setRating] = useState(5);
    const [comment, setComment] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [reviewError, setReviewError] = useState("");
    const [reviewSuccess, setReviewSuccess] = useState("");

    useEffect(() => {
        const fetch = async () => {
            try {
                const res = await getProperty(id!);
                setProperty(res.data);
                setLoading(false);
                fetchReviews();
                if (user && user.role === "tenant") {
                    checkEligibility();
                }
            } catch {
                setLoading(false);
            }
        };
        fetch();
    }, [id, user]);

    const fetchReviews = async () => {
        try {
            setLoadingReviews(true);
            const res = await getPropertyReviews(id);
            setReviews(res.data);
            setLoadingReviews(false);
        } catch {
            setLoadingReviews(false);
        }
    };

    const checkEligibility = async () => {
        try {
            const res = await getTenantAgreements();
            // Check if any agreement for THIS property has status active, expired, or terminated
            const hasHistory = res.data.some((a: any) => 
                a.property._id === id && 
                ["active", "expired", "terminated"].includes(a.status)
            );
            setIsEligible(hasHistory);
        } catch (err) {
            console.error("Error checking eligibility:", err);
        }
    };

    const handleSubmitReview = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!comment.trim()) return;
        try {
            setSubmitting(true);
            setReviewError("");
            setReviewSuccess("");
            await addReview({ property: id, rating, comment });
            setReviewSuccess("Review posted successfully!");
            setComment("");
            setRating(5);
            fetchReviews();
            setSubmitting(false);
        } catch (err: any) {
            setReviewError(err.response?.data?.message || "Failed to post review");
            setSubmitting(false);
        }
    };

    const averageRating = reviews.length > 0 
        ? (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1)
        : null;

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
                <NavBar />
                <DetailSkeleton />
            </div>
        );
    }

    if (!property) {
        return (
            <div className="min-h-screen bg-[#0a0a0f] text-white flex flex-col">
                {bgShell}
                <NavBar />
                <div className="flex-1 flex items-center justify-center">
                    <p className="text-red-400 text-xl">Property not found!</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#0a0a0f] text-white overflow-x-hidden">
            {bgShell}

            <NavBar />

            <div className="relative z-10 max-w-5xl mx-auto px-6 py-10 mt-11">
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

                                <div className="flex items-center justify-between gap-4 mb-2">
                                    <h1 className="text-3xl font-bold text-white tracking-tight">
                                        {property.title}
                                    </h1>
                                    {averageRating && (
                                        <div className="flex items-center gap-1.5 bg-yellow-500/10 border border-yellow-500/20 px-3 py-1 rounded-full shrink-0">
                                            <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                                            <span className="text-yellow-500 font-bold">{averageRating}</span>
                                            <span className="text-yellow-500/60 text-xs">({reviews.length})</span>
                                        </div>
                                    )}
                                </div>
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

                        {/* REVIEWS SECTION */}
                        <div className="space-y-6 pt-4">
                            <div className="flex items-center gap-2 mb-2">
                                <MessageSquare className="h-5 w-5 text-purple-400" />
                                <h3 className="text-xl font-bold text-white">Reviews & Ratings</h3>
                            </div>

                            {/* Review Form - only for eligible tenants */}
                            {isEligible && (
                                <Card className="bg-purple-500/5 border-purple-500/20">
                                    <CardHeader className="pb-2">
                                        <CardTitle className="text-white text-base">Write a Review</CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-4 pt-0">
                                        <div className="flex items-center gap-2">
                                            <p className="text-purple-300 text-sm mr-2">Rating:</p>
                                            <div className="flex gap-1">
                                                {[1, 2, 3, 4, 5].map((s) => (
                                                    <Star
                                                        key={s}
                                                        onClick={() => setRating(s)}
                                                        className={`h-6 w-6 cursor-pointer transition-all ${
                                                            s <= rating ? "text-yellow-500 fill-yellow-500" : "text-white/20 hover:text-white/40"
                                                        }`}
                                                    />
                                                ))}
                                            </div>
                                        </div>
                                        <textarea
                                            value={comment}
                                            onChange={(e) => setComment(e.target.value)}
                                            placeholder="Share your experience living here..."
                                            className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white placeholder:text-purple-300/30 focus:outline-none focus:border-purple-500/50 min-h-[100px] text-sm"
                                        />
                                        {reviewError && <p className="text-red-400 text-xs">{reviewError}</p>}
                                        {reviewSuccess && <p className="text-green-400 text-xs">{reviewSuccess}</p>}
                                        <Button
                                            onClick={handleSubmitReview}
                                            disabled={submitting || !comment.trim()}
                                            className="bg-purple-600 hover:bg-purple-700 text-white rounded-xl px-6 h-10 text-sm font-semibold"
                                        >
                                            {submitting ? "Posting..." : "Post Review"}
                                        </Button>
                                    </CardContent>
                                </Card>
                            )}

                            {/* Reviews List */}
                            <div className="space-y-4">
                                {loadingReviews ? (
                                    <div className="animate-pulse space-y-3">
                                        {[1, 2].map(i => <div key={i} className="h-24 bg-white/5 rounded-xl" />)}
                                    </div>
                                ) : reviews.length === 0 ? (
                                    <div className="text-center py-10 bg-white/5 border border-white/10 rounded-2xl">
                                        <p className="text-purple-300/50">No reviews yet for this property.</p>
                                    </div>
                                ) : (
                                    reviews.map((r) => (
                                        <Card key={r._id} className="bg-white/5 border-white/10 relative overflow-hidden">
                                            <div className="absolute top-0 left-0 bottom-0 w-1 bg-purple-500/20" />
                                            <CardContent className="p-4">
                                                <div className="flex items-center justify-between mb-2">
                                                    <div className="flex items-center gap-2">
                                                        <div className="w-8 h-8 rounded-full bg-purple-600/30 flex items-center justify-center text-purple-300 text-xs font-bold capitalize">
                                                            {r.user?.name?.charAt(0)}
                                                        </div>
                                                        <span className="text-white font-semibold text-sm">{r.user?.name}</span>
                                                    </div>
                                                    <div className="flex items-center gap-0.5">
                                                        {[1, 2, 3, 4, 5].map(s => (
                                                            <Star 
                                                                key={s} 
                                                                className={`h-3.5 w-3.5 ${s <= r.rating ? "text-yellow-500 fill-yellow-500" : "text-white/10"}`} 
                                                            />
                                                        ))}
                                                    </div>
                                                </div>
                                                <p className="text-purple-200 text-sm leading-relaxed">{r.comment}</p>
                                                <p className="text-purple-400/50 text-[10px] mt-2">
                                                    {new Date(r.createdAt).toLocaleDateString(undefined, {
                                                        year: 'numeric', month: 'long', day: 'numeric'
                                                    })}
                                                </p>
                                            </CardContent>
                                        </Card>
                                    ))
                                )}
                            </div>
                        </div>
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