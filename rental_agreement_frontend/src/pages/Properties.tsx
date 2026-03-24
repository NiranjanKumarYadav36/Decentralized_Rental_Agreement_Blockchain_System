/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getProperties } from "@/services/api";
import { useAuth } from "@/context/AuthContext";
import { PropertyListSkeleton } from "@/components/Skeleton";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { ChevronLeft, ChevronRight } from "lucide-react";
import Navbar from "@/components/Navbar";

const PAGE_SIZE = 6;

export default function Properties() {
    const [properties, setProperties] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState({ roomType: "", location: "" });
    const [currentPage, setCurrentPage] = useState(1);
    const { user } = useAuth();
    const navigate = useNavigate();

    const fetchProperties = async (currentFilter = filter) => {
        try {
            setLoading(true);
            const res = await getProperties(currentFilter);
            setProperties(res.data);
            setCurrentPage(1); // reset to page 1 on new search
            setLoading(false);
        } catch {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProperties(filter);
    }, [filter]);

    const totalPages = Math.ceil(properties.length / PAGE_SIZE);
    const paginated = properties.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

    const goToPage = (page: number) => {
        setCurrentPage(page);
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    return (
        <div className="min-h-screen bg-[#0a0a0f] text-white overflow-x-hidden">

            {/* BACKGROUND */}
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

            <Navbar />

            <div className="relative z-10 max-w-6xl mx-auto px-6 py-10">

                {/* HEADER */}
                <div className="text-center mb-10">
                    <h2 className="text-4xl font-black text-white mb-2 tracking-tight">
                        Find Your Perfect Room
                    </h2>
                    <p className="text-purple-300">Blockchain secured rental agreements</p>
                </div>

                {/* FILTERS */}
                <Card className="bg-white/5 border-white/10 mb-8">
                    <CardContent className="p-4">
                        <div className="flex gap-3">
                            <Input
                                type="text"
                                placeholder="Search by location..."
                                value={filter.location}
                                onChange={(e) => setFilter({ ...filter, location: e.target.value })}
                                className="flex-1 bg-white/10 border-white/20 text-white placeholder:text-purple-300/50 focus-visible:ring-purple-500 focus-visible:border-purple-400 rounded-xl"
                            />
                            <Select
                                value={filter.roomType || "all"}
                                onValueChange={(value) =>
                                    setFilter({ ...filter, roomType: value === "all" ? "" : value })
                                }
                            >
                                <SelectTrigger className="w-44 bg-white/10 border-white/20 text-white focus:ring-purple-500 rounded-xl shrink-0">
                                    <SelectValue placeholder="All Types" />
                                </SelectTrigger>
                                <SelectContent className="bg-slate-900 border-white/20">
                                    {["all", "1BHK", "2BHK", "3BHK", "Studio", "PG", "Single Room"].map((type) => (
                                        <SelectItem
                                            key={type}
                                            value={type}
                                            className="text-white focus:bg-purple-600/30 focus:text-white cursor-pointer"
                                        >
                                            {type === "all" ? "All Types" : type}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </CardContent>
                </Card>

                {/* RESULTS COUNT */}
                {!loading && properties.length > 0 && (
                    <div className="flex items-center justify-between mb-4">
                        <p className="text-purple-300 text-sm">
                            {properties.length} propert{properties.length === 1 ? "y" : "ies"} found
                            {filter.location && ` in "${filter.location}"`}
                            {filter.roomType && ` · ${filter.roomType}`}
                        </p>
                        {totalPages > 1 && (
                            <p className="text-purple-400 text-sm">
                                Page {currentPage} of {totalPages}
                            </p>
                        )}
                    </div>
                )}

                {/* PROPERTIES GRID */}
                {loading ? (
                    <PropertyListSkeleton />
                ) : properties.length === 0 ? (
                    <Card className="bg-white/5 border-white/10 text-center">
                        <CardContent className="py-20">
                            <p className="text-5xl mb-4">🏠</p>
                            <p className="text-white font-bold text-lg mb-2">No properties found</p>
                            <p className="text-purple-300 text-sm">Try adjusting your filters</p>
                        </CardContent>
                    </Card>
                ) : (
                    <>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
                            {paginated.map((property) => (
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

                                    <CardContent className="p-5">
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

                                        <h3 className="text-white font-bold text-lg mb-1 leading-tight">
                                            {property.title}
                                        </h3>
                                        <p className="text-purple-300 text-sm mb-3">
                                            📍 {property.location}
                                        </p>

                                        <Separator className="bg-white/10 mb-3" />

                                        <div className="flex items-center justify-between mb-3">
                                            <div>
                                                <p className="text-purple-300 text-xs mb-0.5">Monthly Rent</p>
                                                <p className="text-white font-bold">₹{property.rentAmount.toLocaleString()}</p>
                                            </div>
                                            <div className="text-center">
                                                <p className="text-purple-300 text-xs mb-0.5">Deposit</p>
                                                <p className="text-white font-bold">₹{property.depositAmount.toLocaleString()}</p>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-purple-300 text-xs mb-0.5">Landlord</p>
                                                <p className="text-white text-sm">{property.landlord?.name || "N/A"}</p>
                                            </div>
                                        </div>

                                        {property.amenities?.length > 0 && (
                                            <div className="flex flex-wrap gap-1">
                                                {property.amenities.slice(0, 3).map((a: string) => (
                                                    <Badge
                                                        key={a}
                                                        variant="outline"
                                                        className="border-white/15 text-purple-200 bg-white/5 text-xs px-2 py-0.5"
                                                    >
                                                        {a}
                                                    </Badge>
                                                ))}
                                                {property.amenities.length > 3 && (
                                                    <Badge
                                                        variant="outline"
                                                        className="border-white/15 text-purple-400 bg-white/5 text-xs px-2 py-0.5"
                                                    >
                                                        +{property.amenities.length - 3}
                                                    </Badge>
                                                )}
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>
                            ))}
                        </div>

                        {/* PAGINATION */}
                        {totalPages > 1 && (
                            <div className="flex items-center justify-center gap-2">
                                {/* Prev */}
                                <Button
                                    variant="ghost"
                                    onClick={() => goToPage(currentPage - 1)}
                                    disabled={currentPage === 1}
                                    className="border border-white/15 hover:border-white/30 hover:bg-white/10 text-white rounded-xl px-4 disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-200"
                                >
                                    <ChevronLeft className="h-4 w-4" />
                                </Button>

                                {/* Page numbers */}
                                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                                    <Button
                                        key={page}
                                        onClick={() => goToPage(page)}
                                        className={`w-10 h-10 rounded-xl text-sm font-semibold transition-all duration-200 ${
                                            page === currentPage
                                                ? "bg-purple-600 hover:bg-purple-700 text-white shadow-lg shadow-purple-900/40"
                                                : "bg-white/5 border border-white/10 hover:border-white/30 hover:bg-white/10 text-purple-300 hover:text-white"
                                        }`}
                                    >
                                        {page}
                                    </Button>
                                ))}

                                {/* Next */}
                                <Button
                                    variant="ghost"
                                    onClick={() => goToPage(currentPage + 1)}
                                    disabled={currentPage === totalPages}
                                    className="border border-white/15 hover:border-white/30 hover:bg-white/10 text-white rounded-xl px-4 disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-200"
                                >
                                    <ChevronRight className="h-4 w-4" />
                                </Button>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}