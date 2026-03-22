/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ethers } from "ethers";
import { Button } from "@/components/ui/button";
import { addProperty, getMyProperties, updateProperty } from "@/services/api";
import { useAuth } from "@/context/AuthContext";
import contractData from "@/contracts/RentalAgreement.json";

const CONTRACT_ADDRESS = contractData.address;
const CONTRACT_ABI = contractData.abi;

export default function LandlordDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [images, setImages] = useState<FileList | null>(null);
  const [properties, setProperties] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [form, setForm] = useState({
    title: "",
    description: "",
    location: "",
    rentAmount: "",
    depositAmount: "",
    roomType: "1BHK",
    amenities: ""
  });
  const [activeTab, setActiveTab] = useState<"properties" | "blockchain">("properties");

  // Blockchain states
  const [account, setAccount] = useState("");
  const [contract, setContract] = useState<any>(null);
  const [details, setDetails] = useState<any>(null);
  const [role, setRole] = useState("");
  const [blockchainLoading, setBlockchainLoading] = useState("");
  const [txHash, setTxHash] = useState("");
  const [blockchainError, setBlockchainError] = useState("");
  const [disputeText, setDisputeText] = useState("");

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await getMyProperties();
        setProperties(res.data);
        setLoading(false);
      } catch {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  const handleChange = (e: any) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleAddProperty = async () => {
    try {
      setSubmitting(true);
      setError("");

      // Use FormData to send files
      const formData = new FormData();
      formData.append("title", form.title);
      formData.append("description", form.description);
      formData.append("location", form.location);
      formData.append("rentAmount", form.rentAmount);
      formData.append("depositAmount", form.depositAmount);
      formData.append("roomType", form.roomType);
      formData.append("amenities", form.amenities);

      // Append images
      if (images) {
        Array.from(images).forEach((file) => {
          formData.append("images", file);
        });
      }


      await addProperty(form);
      setSuccess("✅ Property added successfully!");
      setShowAddForm(false);
      setForm({
        title: "", description: "", location: "",
        rentAmount: "", depositAmount: "",
        roomType: "1BHK", amenities: ""
      });
      const res = await getMyProperties();
      setProperties(res.data);
      setSubmitting(false);
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to add property");
      setSubmitting(false);
    }
  };

  const toggleAvailability = async (id: string, current: boolean) => {
    try {
      await updateProperty(id, { isAvailable: !current });
      const res = await getMyProperties();
      setProperties(res.data);
    } catch {
      setError("Failed to update property");
    }
  };

  const connectWallet = async () => {
    try {
      setBlockchainError("");
      if (!window.ethereum) {
        setBlockchainError("MetaMask not found!");
        return;
      }
      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      });
      const userAccount = accounts[0].toLowerCase();
      setAccount(userAccount);
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const c = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
      setContract(c);
      await loadDetails(c, userAccount);
    } catch {
      setBlockchainError("Failed to connect wallet.");
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
      setBlockchainError("Failed to load details.");
    }
  };

  const resolveDispute = async (returnDeposit: boolean) => {
    if (!contract) return;
    try {
      setBlockchainLoading("Resolving dispute...");
      setBlockchainError("");
      const tx = await contract.resolveDispute(returnDeposit);
      setTxHash(tx.hash);
      await tx.wait();
      setBlockchainLoading("");
      await loadDetails(contract);
    } catch (err: any) {
      setBlockchainError(err.reason || err.message || "Transaction failed.");
      setBlockchainLoading("");
    }
  };

  const terminateAgreement = async () => {
    if (!contract) return;
    try {
      setBlockchainLoading("Terminating agreement...");
      setBlockchainError("");
      const tx = await contract.terminateAgreement();
      setTxHash(tx.hash);
      await tx.wait();
      setBlockchainLoading("");
      await loadDetails(contract);
    } catch (err: any) {
      setBlockchainError(err.reason || err.message || "Transaction failed.");
      setBlockchainLoading("");
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
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-3xl font-bold text-white">
              👔 Landlord Dashboard
            </h2>
            <p className="text-purple-300 mt-1">
              Manage your properties and agreements
            </p>
          </div>
          {activeTab === "properties" && (
            <Button
              onClick={() => setShowAddForm(!showAddForm)}
              className="bg-purple-600 hover:bg-purple-700 text-white rounded-xl px-6"
            >
              {showAddForm ? "✕ Cancel" : "+ Add Property"}
            </Button>
          )}
        </div>

        {/* TABS */}
        <div className="flex gap-2 mb-8">
          <button
            onClick={() => setActiveTab("properties")}
            className={`px-6 py-3 rounded-xl font-semibold transition-all ${activeTab === "properties"
              ? "bg-purple-600 text-white"
              : "bg-white/10 text-purple-300 hover:bg-white/20"
              }`}
          >
            🏠 My Properties
          </button>
          <button
            onClick={() => setActiveTab("blockchain")}
            className={`px-6 py-3 rounded-xl font-semibold transition-all ${activeTab === "blockchain"
              ? "bg-blue-600 text-white"
              : "bg-white/10 text-purple-300 hover:bg-white/20"
              }`}
          >
            ⛓️ Blockchain
          </button>
        </div>

        {/* =================== PROPERTIES TAB =================== */}
        {activeTab === "properties" && (
          <div>

            {/* STATS */}
            <div className="grid grid-cols-3 gap-4 mb-8">
              {[
                { label: "Total Properties", value: properties.length, icon: "🏠" },
                { label: "Available", value: properties.filter(p => p.isAvailable).length, icon: "✅" },
                { label: "Occupied", value: properties.filter(p => !p.isAvailable).length, icon: "👥" },
              ].map((stat) => (
                <div
                  key={stat.label}
                  className="bg-white/10 backdrop-blur rounded-2xl p-6 border border-white/20 text-center"
                >
                  <div className="text-4xl mb-2">{stat.icon}</div>
                  <div className="text-3xl font-bold text-white">{stat.value}</div>
                  <div className="text-purple-300 text-sm">{stat.label}</div>
                </div>
              ))}
            </div>

            {/* SUCCESS / ERROR */}
            {success && (
              <div className="bg-green-500/20 border border-green-500/30 rounded-2xl p-4 mb-6">
                <p className="text-green-300">{success}</p>
              </div>
            )}
            {error && (
              <div className="bg-red-500/20 border border-red-500/30 rounded-2xl p-4 mb-6">
                <p className="text-red-300">❌ {error}</p>
              </div>
            )}

            {/* ADD PROPERTY FORM */}
            {showAddForm && (
              <div className="bg-white/10 backdrop-blur rounded-2xl p-8 border border-white/20 mb-8">
                <h3 className="text-2xl font-bold text-white mb-6">
                  ➕ Add New Property
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <label className="text-purple-200 text-sm mb-1 block">Property Title</label>
                    <input
                      type="text"
                      name="title"
                      value={form.title}
                      onChange={handleChange}
                      placeholder="e.g. 2BHK Furnished Flat in Kurla West"
                      className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-purple-300 outline-none focus:border-purple-400"
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="text-purple-200 text-sm mb-1 block">Description</label>
                    <textarea
                      name="description"
                      value={form.description}
                      onChange={handleChange}
                      placeholder="Describe your property..."
                      rows={3}
                      className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-purple-300 outline-none focus:border-purple-400"
                    />
                  </div>
                  <div>
                    <label className="text-purple-200 text-sm mb-1 block">Location</label>
                    <input
                      type="text"
                      name="location"
                      value={form.location}
                      onChange={handleChange}
                      placeholder="e.g. Kurla West, Mumbai"
                      className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-purple-300 outline-none focus:border-purple-400"
                    />
                  </div>
                  <div>
                    <label className="text-purple-200 text-sm mb-1 block">Room Type</label>
                    <select
                      name="roomType"
                      value={form.roomType}
                      onChange={handleChange}
                      className="w-full bg-slate-800 border border-white/20 rounded-xl px-4 py-3 text-white outline-none"
                    >
                      <option>1BHK</option>
                      <option>2BHK</option>
                      <option>3BHK</option>
                      <option>Studio</option>
                      <option>PG</option>
                      <option>Single Room</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-purple-200 text-sm mb-1 block">Monthly Rent (₹)</label>
                    <input
                      type="number"
                      name="rentAmount"
                      value={form.rentAmount}
                      onChange={handleChange}
                      placeholder="15000"
                      className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-purple-300 outline-none focus:border-purple-400"
                    />
                  </div>
                  <div>
                    <label className="text-purple-200 text-sm mb-1 block">Security Deposit (₹)</label>
                    <input
                      type="number"
                      name="depositAmount"
                      value={form.depositAmount}
                      onChange={handleChange}
                      placeholder="30000"
                      className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-purple-300 outline-none focus:border-purple-400"
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="text-purple-200 text-sm mb-1 block">Amenities (comma separated)</label>
                    <input
                      type="text"
                      name="amenities"
                      value={form.amenities}
                      onChange={handleChange}
                      placeholder="WiFi, AC, Parking, Water, Gas"
                      className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-purple-300 outline-none focus:border-purple-400"
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="text-purple-200 text-sm mb-1 block">
                      Property Images (max 5)
                    </label>
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={(e) => setImages(e.target.files)}
                      className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white outline-none file:mr-4 file:py-1 file:px-4 file:rounded-full file:border-0 file:bg-purple-600 file:text-white"
                    />
                    {images && (
                      <p className="text-purple-300 text-xs mt-1">
                        {images.length} image(s) selected
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex gap-4 mt-6">
                  <Button
                    onClick={handleAddProperty}
                    disabled={submitting}
                    className="bg-green-600 hover:bg-green-700 text-white rounded-xl px-8"
                  >
                    {submitting ? "Adding..." : "✅ Add Property"}
                  </Button>
                  <Button
                    onClick={() => setShowAddForm(false)}
                    className="bg-white/10 hover:bg-white/20 text-white rounded-xl px-8"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            )}

            {/* PROPERTIES LIST */}
            <div>
              <h3 className="text-xl font-bold text-white mb-4">🏠 My Properties</h3>
              {loading ? (
                <p className="text-purple-300 animate-pulse">Loading properties...</p>
              ) : properties.length === 0 ? (
                <div className="bg-white/10 backdrop-blur rounded-2xl p-10 border border-white/20 text-center">
                  <p className="text-6xl mb-4">🏠</p>
                  <p className="text-white text-xl font-bold mb-2">No properties yet</p>
                  <p className="text-purple-300 mb-6">Add your first property to get started</p>
                  <Button
                    onClick={() => setShowAddForm(true)}
                    className="bg-purple-600 hover:bg-purple-700 text-white rounded-xl"
                  >
                    + Add Property
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {properties.map((property) => (
                    <div
                      key={property._id}
                      className="bg-white/10 backdrop-blur rounded-2xl p-6 border border-white/20"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <span className="bg-purple-500/20 text-purple-300 text-xs px-2 py-1 rounded-full">
                              {property.roomType}
                            </span>
                            <span className={`text-xs px-2 py-1 rounded-full ${property.isAvailable
                              ? "bg-green-500/20 text-green-300"
                              : "bg-red-500/20 text-red-300"
                              }`}>
                              {property.isAvailable ? "✅ Available" : "❌ Occupied"}
                            </span>
                          </div>
                          <h4 className="text-white font-bold text-xl mb-1">{property.title}</h4>
                          <p className="text-purple-300 mb-3">📍 {property.location}</p>
                          <div className="flex gap-6">
                            <div>
                              <p className="text-purple-300 text-xs">Monthly Rent</p>
                              <p className="text-white font-bold">₹{property.rentAmount.toLocaleString()}</p>
                            </div>
                            <div>
                              <p className="text-purple-300 text-xs">Deposit</p>
                              <p className="text-white font-bold">₹{property.depositAmount.toLocaleString()}</p>
                            </div>
                            <div>
                              <p className="text-purple-300 text-xs">Amenities</p>
                              <p className="text-white text-sm">{property.amenities.join(", ")}</p>
                            </div>
                          </div>
                        </div>
                        <div className="flex flex-col gap-2 ml-4">
                          <Button
                            onClick={() => navigate(`/property/${property._id}`)}
                            className="bg-white/10 hover:bg-white/20 text-white rounded-xl text-sm"
                          >
                            👁️ View
                          </Button>
                          <Button
                            onClick={() => toggleAvailability(property._id, property.isAvailable)}
                            className={`rounded-xl text-sm ${property.isAvailable
                              ? "bg-red-600/20 hover:bg-red-600/40 text-red-300"
                              : "bg-green-600/20 hover:bg-green-600/40 text-green-300"
                              }`}
                          >
                            {property.isAvailable ? "Mark Occupied" : "Mark Available"}
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* =================== BLOCKCHAIN TAB =================== */}
        {activeTab === "blockchain" && (
          <div className="space-y-6">
            {!account ? (
              <div className="bg-white/10 backdrop-blur rounded-2xl p-10 text-center border border-white/20">
                <div className="text-6xl mb-4">🦊</div>
                <h3 className="text-2xl font-bold text-white mb-2">Connect MetaMask</h3>
                <p className="text-purple-200 mb-6">
                  Connect your wallet to manage rental agreements on blockchain
                </p>
                <Button
                  onClick={connectWallet}
                  className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-3 rounded-xl text-lg"
                >
                  Connect MetaMask
                </Button>
                {blockchainError && (
                  <p className="text-red-400 mt-4">{blockchainError}</p>
                )}
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
                    : "bg-red-500/20 text-red-300 border-red-500/30"
                    }`}>
                    {role === "landlord" ? "👔 Landlord" : "⚠️ Unknown Role"}
                  </div>
                </div>

                {/* AGREEMENT DETAILS */}
                {details && (
                  <div className="bg-white/10 backdrop-blur rounded-2xl p-6 border border-white/20">
                    <h3 className="text-xl font-bold text-white mb-4">📋 Agreement Details</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-white/5 rounded-xl p-3 border border-white/10">
                        <p className="text-purple-300 text-xs mb-1">Landlord</p>
                        <p className="text-white font-semibold">{short(details.landlord)}</p>
                      </div>
                      <div className="bg-white/5 rounded-xl p-3 border border-white/10">
                        <p className="text-purple-300 text-xs mb-1">Tenant</p>
                        <p className="text-white font-semibold">{short(details.tenant)}</p>
                      </div>
                      <div className="bg-white/5 rounded-xl p-3 border border-white/10">
                        <p className="text-purple-300 text-xs mb-1">Monthly Rent</p>
                        <p className="text-white font-semibold">{fmt(details.rentAmount)}</p>
                      </div>
                      <div className="bg-white/5 rounded-xl p-3 border border-white/10">
                        <p className="text-purple-300 text-xs mb-1">Deposit</p>
                        <p className="text-white font-semibold">{fmt(details.depositAmount)}</p>
                      </div>
                      <div className="bg-white/5 rounded-xl p-3 border border-white/10">
                        <p className="text-purple-300 text-xs mb-1">Ends On</p>
                        <p className="text-white font-semibold">{fmtDate(details.agreementEnd)}</p>
                      </div>
                      <div className="bg-white/5 rounded-xl p-3 border border-white/10">
                        <p className="text-purple-300 text-xs mb-1">Total Rent Paid</p>
                        <p className="text-white font-semibold">{fmt(details.totalRentPaid)}</p>
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

                {/* LANDLORD ACTIONS */}
                {role === "landlord" && details && (
                  <div className="bg-white/10 backdrop-blur rounded-2xl p-6 border border-white/20">
                    <h3 className="text-xl font-bold text-white mb-4">👔 Landlord Actions</h3>
                    <div className="space-y-3">
                      {details.disputeActive && (
                        <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                          <p className="text-yellow-300 font-semibold mb-2">⚠️ Active Dispute</p>
                          {disputeText && (
                            <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl px-4 py-3 mb-3">
                              <p className="text-yellow-200 text-xs mb-1">Dispute Reason:</p>
                              <p className="text-white text-sm">{disputeText}</p>
                            </div>
                          )}
                          <div className="flex gap-3">
                            <Button
                              onClick={() => resolveDispute(true)}
                              disabled={!!blockchainLoading}
                              className="flex-1 bg-green-600 hover:bg-green-700 text-white rounded-xl"
                            >
                              ✅ Return Deposit
                            </Button>
                            <Button
                              onClick={() => resolveDispute(false)}
                              disabled={!!blockchainLoading}
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
                            Terminate agreement after period ends — deposit returned automatically
                          </p>
                          <Button
                            onClick={terminateAgreement}
                            disabled={!!blockchainLoading}
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
                {blockchainLoading && (
                  <div className="bg-purple-500/20 border border-purple-500/30 rounded-2xl p-4 text-center">
                    <p className="text-purple-200 animate-pulse">⏳ {blockchainLoading}</p>
                  </div>
                )}

                {/* ERROR */}
                {blockchainError && (
                  <div className="bg-red-500/20 border border-red-500/30 rounded-2xl p-4">
                    <p className="text-red-300">❌ {blockchainError}</p>
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

                {/* ETHERSCAN */}
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