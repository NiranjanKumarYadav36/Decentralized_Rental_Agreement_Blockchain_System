/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { getProperties } from "@/services/api";
import { useAuth } from "@/context/AuthContext";
import { PropertyListSkeleton } from "@/components/Skeleton";

export default function Properties() {
    const [properties, setProperties] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState({ roomType: "", location: "" });
    const { user } = useAuth();
    const navigate = useNavigate();

    const fetchProperties = async () => {
        try {
            setLoading(true);
            const res = await getProperties(filter);
            setProperties(res.data);
            setLoading(false);
        } catch {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProperties();  // ✅ now called after declaration
    }, []);

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
            {/* NAVBAR */}
            <nav className="border-b border-white/10 px-6 py-4 flex items-center justify-between">
                <h1 className="text-white font-bold text-xl">🏠 RentalChain</h1>
                <div className="flex gap-3">
                    {user ? (
                        <Button
                            onClick={() => navigate(user.role === "landlord" ? "/dashboard/landlord" : "/dashboard/tenant")}
                            className="bg-purple-600 hover:bg-purple-700 text-white rounded-xl"
                        >
                            Dashboard
                        </Button>
                    ) : (
                        <>
                            <Button
                                onClick={() => navigate("/login")}
                                className="bg-white/10 hover:bg-white/20 text-white rounded-xl"
                            >
                                Login
                            </Button>
                            <Button
                                onClick={() => navigate("/register")}
                                className="bg-purple-600 hover:bg-purple-700 text-white rounded-xl"
                            >
                                Register
                            </Button>
                        </>
                    )}
                </div>
            </nav>

            <div className="max-w-6xl mx-auto px-4 py-10">
                {/* HEADER */}
                <div className="text-center mb-10">
                    <h2 className="text-4xl font-bold text-white mb-2">
                        Find Your Perfect Room
                    </h2>
                    <p className="text-purple-300">
                        Blockchain secured rental agreements
                    </p>
                </div>

                {/* FILTERS */}
                <div className="bg-white/10 backdrop-blur rounded-2xl p-4 border border-white/20 mb-8 flex gap-4">
                    <input
                        type="text"
                        placeholder="Search by location..."
                        value={filter.location}
                        onChange={(e) => setFilter({ ...filter, location: e.target.value })}
                        className="flex-1 bg-white/10 border border-white/20 rounded-xl px-4 py-2 text-white placeholder-purple-300 outline-none"
                    />
                    <select
                        value={filter.roomType}
                        onChange={(e) => setFilter({ ...filter, roomType: e.target.value })}
                        className="bg-slate-800 border border-white/20 rounded-xl px-4 py-2 text-white outline-none"
                    >
                        <option value="">All Types</option>
                        <option value="1BHK">1BHK</option>
                        <option value="2BHK">2BHK</option>
                        <option value="3BHK">3BHK</option>
                        <option value="Studio">Studio</option>
                        <option value="PG">PG</option>
                        <option value="Single Room">Single Room</option>
                    </select>
                    <Button
                        onClick={fetchProperties}
                        className="bg-purple-600 hover:bg-purple-700 text-white rounded-xl"
                    >
                        Search
                    </Button>
                </div>

                {/* PROPERTIES GRID */}
                {loading ? (
                    <PropertyListSkeleton />
                ) : properties.length === 0 ? (
                    <p className="text-center text-purple-300">
                        No properties found
                    </p>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {properties.map((property) => (
                            <div
                                key={property._id}
                                className="bg-white/10 backdrop-blur rounded-2xl border border-white/20 overflow-hidden hover:border-purple-400 transition-all cursor-pointer"
                                onClick={() => navigate(`/property/${property._id}`)}
                            >
                                {/* IMAGE */}
                                <div className="h-48 bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center">
                                    {property.images && property.images.length > 0 ? (
                                        <img
                                            src={property.images[0]}
                                            alt={property.title}
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <span className="text-6xl">🏠</span>
                                    )}
                                </div>

                                {/* DETAILS */}
                                <div className="p-5">
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
                                    <h3 className="text-white font-bold text-lg mb-1">
                                        {property.title}
                                    </h3>
                                    <p className="text-purple-300 text-sm mb-3">
                                        📍 {property.location}
                                    </p>
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-purple-300 text-xs">Monthly Rent</p>
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
                                        <div>
                                            <p className="text-purple-300 text-xs">Landlord</p>
                                            <p className="text-white text-sm">
                                                {property.landlord?.name || "N/A"}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex flex-wrap gap-1 mt-3">
                                        {property.amenities.slice(0, 3).map((a: string) => (
                                            <span
                                                key={a}
                                                className="bg-white/10 text-purple-200 text-xs px-2 py-1 rounded-full"
                                            >
                                                {a}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}