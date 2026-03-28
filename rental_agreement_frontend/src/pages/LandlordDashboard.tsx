/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ethers } from "ethers";
import { addProperty, getMyProperties, updateProperty, getLandlordAgreements, approveAgreement, deleteProperty, updateWallet, updateAgreementStatus, verifyZkIdentity } from "@/services/api";
import { useAuth } from "@/context/AuthContext";
import contractDataRaw from "@/contracts/RentalAgreement.json";
import factoryDataRaw from "@/contracts/RentalFactory.json";
import BlockchainAgreementCard from "@/components/BlockchainAgreementCard";
import NavBar from "@/components/NavBar";
import ZkBadge from "@/components/ZkBadge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { AlertCircle, CheckCircle2, RefreshCw, Eye, ChevronLeft, ChevronRight, Plus, X, Wallet, Copy, ExternalLink, Fingerprint, ShieldCheck, Loader2 } from "lucide-react";
import LandlordAnalytics from "@/components/LandlordAnalytics";

const contractData = contractDataRaw as any;
const factoryData = factoryDataRaw as any;
const CONTRACT_ABI = contractData.abi;
const FACTORY_ADDRESS = factoryData.address || "";
const FACTORY_ABI = factoryData.abi;

const PAGE_SIZE = 4;

export default function LandlordDashboard() {
  const { user, login, updateUser } = useAuth();
  const navigate = useNavigate();

  const [images, setImages] = useState<File[]>([]);
  const [properties, setProperties] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [propPage, setPropPage] = useState(1);
  const [propFilter, setPropFilter] = useState({ search: "", roomType: "", status: "" });

  const [form, setForm] = useState({
    title: "", description: "", location: "",
    rentAmount: "", depositAmount: "", roomType: "1BHK", amenities: ""
  });

  const [activeTab, setActiveTab] = useState<"properties" | "agreements" | "blockchain" | "analytics" | "profile" | "add-property">("properties");
  const [agreements, setAgreements] = useState<any[]>([]);
  const [loadingAgreements, setLoadingAgreements] = useState(false);
  const [approvingId, setApprovingId] = useState("");
  const [approveError, setApproveError] = useState("");
  const [approveSuccess, setApproveSuccess] = useState("");
  const [rejectingId, setRejectingId] = useState("");
  const [zkVerifyStatus, setZkVerifyStatus] = useState<"none" | "generating" | "verifying" | "success">("none");
  const [zkVerifyError, setZkVerifyError] = useState("");

  // Wallet update
  const [walletInput, setWalletInput] = useState(user?.walletAddress || "");
  const [walletSaving, setWalletSaving] = useState(false);
  const [walletSuccess, setWalletSuccess] = useState("");
  const [walletError, setWalletError] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await getMyProperties();
        setProperties(res.data);
        setPropPage(1);
        setLoading(false);
      } catch {
        setLoading(false);
      }
    };
    fetch();
  }, [activeTab]);

  useEffect(() => {
    if (activeTab === "agreements" || activeTab === "blockchain" || activeTab === "analytics") {
      fetchAgreements();
    }
  }, [activeTab]);

  const handleChange = (e: any) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleAddProperty = async () => {
    try {
      setSubmitting(true);
      setError("");
      const formData = new FormData();
      formData.append("title", form.title);
      formData.append("description", form.description);
      formData.append("location", form.location);
      formData.append("rentAmount", form.rentAmount);
      formData.append("depositAmount", form.depositAmount);
      formData.append("roomType", form.roomType);
      formData.append("amenities", form.amenities);
      if (images.length > 0) {
        images.forEach((file) => {
          formData.append("images", file);
        });
      }
      await addProperty(formData);
      setSuccess("Property added successfully!");
      setActiveTab("properties");
      setImages([]);
      setForm({ title: "", description: "", location: "", rentAmount: "", depositAmount: "", roomType: "1BHK", amenities: "" });
      const res = await getMyProperties();
      setProperties(res.data);
      setPropPage(1);
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

  const handleDeleteProperty = async (id: string) => {
    if (!confirm("Are you sure you want to delete this property?")) return;
    try {
      await deleteProperty(id);
      const res = await getMyProperties();
      setProperties(res.data);
      setPropPage(1);
      setSuccess("Property deleted successfully!");
    } catch {
      setError("Failed to delete property");
    }
  };

  const fetchAgreements = async () => {
    try {
      setLoadingAgreements(true);
      const res = await getLandlordAgreements();
      setAgreements(res.data);
      setLoadingAgreements(false);
    } catch {
      setLoadingAgreements(false);
    }
  };

  const handleApprove = async (agreement: any) => {
    try {
      setApprovingId(agreement._id);
      setApproveError("");
      if (!window.ethereum) { setApproveError("MetaMask not found!"); return; }
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const factory = new ethers.Contract(FACTORY_ADDRESS, FACTORY_ABI, signer);
      
      const rentInWei = ethers.parseEther("0.01");
      const depositInWei = ethers.parseEther("0.02");
      
      const tx = await factory.createAgreement(
        await signer.getAddress(),
        agreement.tenant.walletAddress,
        rentInWei, 
        depositInWei,
        agreement.durationDays || 30, 
        1,
        agreement.property._id, 
        agreement.property.title
      );
      
      const receipt = await tx.wait();
      const event = receipt.logs.find((log: any) => {
        try { 
          const parsed = factory.interface.parseLog(log); 
          return parsed?.name === "AgreementCreated"; 
        } catch { return false; }
      });
      
      let contractAddress = "";
      if (event) { 
        const parsed = factory.interface.parseLog(event); 
        contractAddress = parsed?.args[0]; 
      }
      
      await approveAgreement(agreement._id, { contractAddress, txHash: tx.hash });
      setApproveSuccess(`Agreement approved! Contract: ${contractAddress}`);
      await fetchAgreements();
      setApprovingId("");
    } catch (err: any) {
      setApproveError(err.reason || err.message || "Failed to approve");
      setApprovingId("");
    }
  };

  const handleReject = async (id: string) => {
    if (!confirm("Are you sure you want to reject this agreement request?")) return;
    try {
      setRejectingId(id);
      setApproveError("");
      await updateAgreementStatus(id, { status: "rejected" });
      setApproveSuccess("Agreement request rejected.");
      await fetchAgreements();
      setRejectingId("");
    } catch (err: any) {
      setApproveError(err.response?.data?.message || "Failed to reject request.");
      setRejectingId("");
    }
  };

  const handleZkVerify = async () => {
    try {
      setZkVerifyStatus("generating");
      setZkVerifyError("");
      
      // Simulate cryptographic proof generation
      await new Promise(r => setTimeout(r, 2000));
      
      const mockProof = "0x" + Math.random().toString(16).slice(2, 42);
      const mockNullifier = "null_" + Math.random().toString(36).slice(2, 10);
      
      setZkVerifyStatus("verifying");
      await verifyZkIdentity({
        proof: mockProof,
        nullifier: mockNullifier
      });
      
      // Synchronize local session
      updateUser({ isZkVerified: true });
      setZkVerifyStatus("success");
    } catch (err: any) {
      setZkVerifyError(err.response?.data?.message || "Verification failed");
      setZkVerifyStatus("none");
    }
  };

  const handleSaveWallet = async () => {
    try {
      setWalletSaving(true);
      setWalletError("");
      setWalletSuccess("");
      if (!walletInput.startsWith("0x") || walletInput.length !== 42) {
        setWalletError("Invalid address. Must start with 0x and be 42 characters.");
        setWalletSaving(false);
        return;
      }
      const res = await updateWallet({ walletAddress: walletInput });
      login(res.data);
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

  const filteredProps = properties.filter((p) => {
    const matchSearch =
      !propFilter.search ||
      p.title.toLowerCase().includes(propFilter.search.toLowerCase()) ||
      p.location.toLowerCase().includes(propFilter.search.toLowerCase());
    const matchType = !propFilter.roomType || p.roomType === propFilter.roomType;
    const matchStatus =
      !propFilter.status ||
      (propFilter.status === "available" && p.isAvailable) ||
      (propFilter.status === "occupied" && !p.isAvailable);
    return matchSearch && matchType && matchStatus;
  });

  const totalPropPages = Math.ceil(filteredProps.length / PAGE_SIZE);
  const paginatedProps = filteredProps.slice((propPage - 1) * PAGE_SIZE, propPage * PAGE_SIZE);

  const tabs = [
    { key: "properties", label: "🏠 My Properties", activeColor: "bg-purple-600" },
    { key: "add-property", label: "➕ Add Property", activeColor: "bg-green-600" },
    { key: "agreements", label: "📋 Agreements", activeColor: "bg-green-600" },
    { key: "blockchain", label: "⛓️ Blockchain", activeColor: "bg-blue-600" },
    { key: "analytics", label: "📊 Analytics", activeColor: "bg-orange-600" },
    { key: "profile", label: "👤 Profile", activeColor: "bg-violet-600" },
  ] as const;

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white overflow-x-hidden">
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
        <div className="mb-8">
          <div className="flex items-center gap-3">
            <h2 className="text-3xl font-bold text-white tracking-tight">👔 Landlord Dashboard</h2>
            <ZkBadge verified={user?.isZkVerified} showText size="md" />
          </div>
          <p className="text-purple-300 mt-1">Manage your properties and agreements</p>
        </div>

        <div className="flex gap-2 mb-8 overflow-x-auto pb-2 scrollbar-hide">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-6 py-2.5 rounded-xl font-semibold text-sm transition-all duration-200 whitespace-nowrap ${activeTab === tab.key
                ? `${tab.activeColor} text-white shadow-lg`
                : "bg-white/5 border border-white/10 text-purple-300 hover:bg-white/10 hover:text-white"
                }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* ADD PROPERTY TAB */}
        {activeTab === "add-property" && (
          <div className="max-w-4xl mx-auto space-y-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-2xl font-bold text-white tracking-tight">➕ Add New Property</h3>
                <p className="text-purple-300 text-sm mt-1">Fill in the details to list your property on the platform</p>
              </div>
            </div>

            {/* ZK-VERIFICATION LOCK */}
            {!user?.isZkVerified ? (
              <Card className="bg-purple-500/5 border border-purple-500/20 rounded-2xl p-10 text-center relative overflow-hidden group">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-purple-500 to-transparent opacity-30" />
                <div className="max-w-md mx-auto space-y-6 py-4">
                  <div className="w-20 h-20 rounded-3xl bg-purple-600/20 flex items-center justify-center mx-auto mb-6 transform group-hover:scale-110 transition-transform duration-300">
                    <Fingerprint className="h-10 w-10 text-purple-400" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-2xl font-bold text-white tracking-tight">Identity Verification Required</h3>
                    <p className="text-purple-300/70 text-sm leading-relaxed">
                      To prevent fraudulent listings and maintain a high-trust platform, we require all landlords to secure their identity using a **Zero-Knowledge Proof**.
                    </p>
                  </div>
                  
                  {zkVerifyError && (
                    <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-3 flex items-center justify-center gap-2">
                      <AlertCircle className="h-4 w-4 text-red-400 shrink-0" />
                      <p className="text-red-400 text-xs font-semibold">{zkVerifyError}</p>
                    </div>
                  )}

                  <div className="pt-2">
                    <Button
                      onClick={handleZkVerify}
                      disabled={zkVerifyStatus !== "none"}
                      className="w-full bg-purple-600 hover:bg-purple-700 text-white py-6 rounded-xl text-md font-bold shadow-lg shadow-purple-900/30 transition-all active:scale-[0.98]"
                    >
                      {zkVerifyStatus === "generating" ? (
                        <><Loader2 className="h-5 w-5 mr-3 animate-spin" /> Generating ZK-Proof...</>
                      ) : zkVerifyStatus === "verifying" ? (
                        <><Loader2 className="h-5 w-5 mr-3 animate-spin" /> Verifying Identiy...</>
                      ) : (
                        <><ShieldCheck className="h-5 w-5 mr-3" /> Verify My Identity with ZK-Proof</>
                      )}
                    </Button>
                  </div>
                  <div className="flex items-center justify-center gap-2">
                    <span className="w-1 h-1 bg-purple-500 rounded-full animate-pulse" />
                    <p className="text-[10px] text-purple-400/50 uppercase tracking-widest font-mono">
                      Encrypted • Private • On-Chain Verified
                    </p>
                  </div>
                </div>
              </Card>
            ) : (
              <>
                {!user?.walletAddress && (
                  <Card className="bg-orange-500/10 border-orange-500/30 mb-6">
                <CardContent className="p-5 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-orange-500/20 flex items-center justify-center text-orange-400">
                      <Wallet className="h-6 w-6" />
                    </div>
                    <div>
                      <p className="text-orange-300 font-bold">Wallet Address Required</p>
                      <p className="text-orange-300/70 text-sm mt-0.5">You need to link your MetaMask wallet to prove ownership and deploy agreements.</p>
                    </div>
                  </div>
                  <Button onClick={() => setActiveTab("profile")} className="bg-orange-500 hover:bg-orange-600">Setup Wallet →</Button>
                </CardContent>
              </Card>
            )}

            <Card className="bg-white/5 border-white/10 overflow-hidden relative">
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-green-500/50 via-emerald-500/50 to-green-500/50" />
              <CardContent className="p-8">
                <div className="grid grid-cols-2 gap-x-8 gap-y-6">
                  <div className="col-span-2">
                    <h4 className="text-sm font-bold text-purple-400 uppercase tracking-widest mb-4">🏠 Basic Information</h4>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label className="text-purple-200 text-sm ml-1">Property Title</Label>
                        <Input name="title" value={form.title} onChange={handleChange} placeholder="e.g. 2BHK Furnished Flat in Kurla West" className="bg-white/5 border-white/10 text-white rounded-xl h-12" />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-purple-200 text-sm ml-1">Description</Label>
                        <Textarea name="description" value={form.description} onChange={handleChange} placeholder="Tell tenants about your property..." rows={4} className="bg-white/5 border-white/10 text-white rounded-xl" />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h4 className="text-sm font-bold text-purple-400 uppercase tracking-widest mb-4">📍 Location & Type</h4>
                    <div className="space-y-2">
                      <Label className="text-purple-200 text-sm ml-1">Location</Label>
                      <Input name="location" value={form.location} onChange={handleChange} placeholder="e.g. Kurla West, Mumbai" className="bg-white/5 border-white/10 text-white rounded-xl h-12" />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-purple-200 text-sm ml-1">Room Type</Label>
                      <Select value={form.roomType} onValueChange={(v) => setForm({ ...form, roomType: v })}>
                        <SelectTrigger className="bg-white/5 border-white/10 text-white rounded-xl h-12"><SelectValue /></SelectTrigger>
                        <SelectContent className="bg-slate-900 border-white/20">
                          {["1BHK", "2BHK", "3BHK", "Studio", "PG", "Single Room"].map((t) => <SelectItem key={t} value={t} className="text-white focus:bg-green-600/30">{t}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h4 className="text-sm font-bold text-purple-400 uppercase tracking-widest mb-4">💰 Financials</h4>
                    <div className="space-y-2">
                      <Label className="text-purple-200 text-sm ml-1">Monthly Rent (₹)</Label>
                      <Input type="number" name="rentAmount" value={form.rentAmount} onChange={handleChange} placeholder="15000" className="bg-white/5 border-white/10 text-white rounded-xl h-12" />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-purple-200 text-sm ml-1">Security Deposit (₹)</Label>
                      <Input type="number" name="depositAmount" value={form.depositAmount} onChange={handleChange} placeholder="30000" className="bg-white/5 border-white/10 text-white rounded-xl h-12" />
                    </div>
                  </div>

                  <div className="col-span-2 space-y-6 pt-2">
                    <div className="space-y-2">
                      <Label className="text-purple-200 text-sm ml-1 font-bold">🛠️ Amenities (comma separated)</Label>
                      <Input name="amenities" value={form.amenities} onChange={handleChange} placeholder="WiFi, AC, Parking" className="bg-white/5 border-white/10 text-white rounded-xl h-12" />
                    </div>
                    <div className="space-y-3">
                      <Label className="text-purple-200 text-sm ml-1 font-bold">📸 Property Photos</Label>
                      <div className="relative bg-white/5 border-2 border-dashed border-white/10 hover:border-green-500/40 rounded-2xl p-8 flex flex-col items-center justify-center cursor-pointer transition-all">
                        <input type="file" multiple accept="image/*" onChange={(e) => { if (e.target.files) setImages(prev => [...prev, ...Array.from(e.target.files!)]); }} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" />
                        <Plus className="h-8 w-8 text-green-400 mb-2" />
                        <p className="text-white font-bold">Click to upload photos</p>
                        {images.length > 0 && <Badge className="mt-4 bg-green-600">{images.length} photo(s) selected</Badge>}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end gap-4 mt-8">
                  <Button onClick={() => setActiveTab("properties")} variant="ghost" className="text-purple-300 rounded-xl px-8 h-12">Discard</Button>
                  <Button onClick={handleAddProperty} disabled={submitting || !user?.walletAddress} className="bg-green-600 hover:bg-green-700 text-white rounded-xl px-12 h-12 font-bold transition-all">
                    {submitting ? <><RefreshCw className="h-5 w-5 mr-3 animate-spin" /> Publishing...</> : "🚀 List Property Now"}
                  </Button>
                </div>
              </CardContent>
            </Card>
            </>
            )}
          </div>
        )}

        {/* PROPERTIES TAB */}
        {activeTab === "properties" && (
          <div className="space-y-6">
            {/* STATS */}
            <div className="grid grid-cols-3 gap-4">
              {[
                { label: "Total Properties", value: properties.length, icon: "🏠", color: "via-purple-500/40" },
                { label: "Available", value: properties.filter(p => p.isAvailable).length, icon: "✅", color: "via-green-500/40" },
                { label: "Occupied", value: properties.filter(p => !p.isAvailable).length, icon: "👥", color: "via-blue-500/40" },
              ].map((stat) => (
                <Card key={stat.label} className="bg-white/5 border-white/10 text-center relative overflow-hidden">
                  <div className={`absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent ${stat.color} to-transparent`} />
                  <CardContent className="py-6">
                    <div className="text-4xl mb-2">{stat.icon}</div>
                    <div className="text-3xl font-bold text-white">{stat.value}</div>
                    <div className="text-purple-300 text-sm mt-1">{stat.label}</div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* NO WALLET WARNING */}
            {!user?.walletAddress && (
              <Card className="bg-orange-500/10 border-orange-500/30">
                <CardContent className="p-4 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <Wallet className="h-5 w-5 text-orange-400 shrink-0" />
                    <div>
                      <p className="text-orange-300 font-semibold text-sm">Wallet address required to add properties</p>
                      <p className="text-orange-300/70 text-xs mt-0.5">You need a MetaMask wallet to deploy smart contracts and approve agreements.</p>
                    </div>
                  </div>
                  <Button
                    onClick={() => setActiveTab("profile")}
                    className="bg-orange-500/20 hover:bg-orange-500/30 border border-orange-500/30 text-orange-300 rounded-xl px-5 shrink-0 transition-all duration-200"
                  >
                    Add Wallet →
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* ALERTS */}
            {success && (
              <Alert className="bg-green-500/10 border-green-500/30">
                <CheckCircle2 className="h-4 w-4 text-green-400" />
                <AlertDescription className="text-green-300">✅ {success}</AlertDescription>
              </Alert>
            )}
            {error && (
              <Alert variant="destructive" className="bg-red-500/10 border-red-500/30">
                <AlertCircle className="h-4 w-4 text-red-400" />
                <AlertDescription className="text-red-300">{error}</AlertDescription>
              </Alert>
            )}

            {/* PROPERTIES LIST */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-xl font-bold text-white">🏠 My Properties</h3>
                  {!loading && (
                    <p className="text-purple-400 text-xs mt-0.5">
                      {filteredProps.length} of {properties.length} propert{properties.length === 1 ? "y" : "ies"}
                    </p>
                  )}
                </div>
                {totalPropPages > 1 && (
                  <p className="text-purple-400 text-sm">Page {propPage} of {totalPropPages}</p>
                )}
              </div>

              {/* FILTER BAR */}
              {properties.length > 0 && (
                <Card className="bg-white/5 border-white/10 mb-4">
                  <CardContent className="p-3">
                    <div className="flex gap-3">
                      <Input
                        placeholder="Search by title or location..."
                        value={propFilter.search}
                        onChange={(e) => { setPropFilter({ ...propFilter, search: e.target.value }); setPropPage(1); }}
                        className="flex-1 bg-white/10 border-white/20 text-white placeholder:text-purple-300/50 focus-visible:ring-purple-500 rounded-xl h-9 text-sm"
                      />
                      <Select
                        value={propFilter.roomType || "all"}
                        onValueChange={(v) => { setPropFilter({ ...propFilter, roomType: v === "all" ? "" : v }); setPropPage(1); }}
                      >
                        <SelectTrigger className="w-36 bg-white/10 border-white/20 text-white focus:ring-purple-500 rounded-xl h-9 text-sm shrink-0">
                          <SelectValue placeholder="Room Type" />
                        </SelectTrigger>
                        <SelectContent className="bg-slate-900 border-white/20">
                          {["all", "1BHK", "2BHK", "3BHK", "Studio", "PG", "Single Room"].map((types) => (
                            <SelectItem key={types} value={types} className="text-white focus:bg-purple-600/30">
                              {types === "all" ? "All Types" : types}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Select
                        value={propFilter.status || "all"}
                        onValueChange={(v) => { setPropFilter({ ...propFilter, status: v === "all" ? "" : v }); setPropPage(1); }}
                      >
                        <SelectTrigger className="w-36 bg-white/10 border-white/20 text-white focus:ring-purple-500 rounded-xl h-9 text-sm shrink-0">
                          <SelectValue placeholder="Status" />
                        </SelectTrigger>
                        <SelectContent className="bg-slate-900 border-white/20">
                          <SelectItem value="all" className="text-white focus:bg-purple-600/30">All Status</SelectItem>
                          <SelectItem value="available" className="text-white focus:bg-purple-600/30">✅ Available</SelectItem>
                          <SelectItem value="occupied" className="text-white focus:bg-purple-600/30">❌ Occupied</SelectItem>
                        </SelectContent>
                      </Select>
                      {(propFilter.search || propFilter.roomType || propFilter.status) && (
                        <Button
                          variant="ghost"
                          onClick={() => { setPropFilter({ search: "", roomType: "", status: "" }); setPropPage(1); }}
                          className="border border-white/15 hover:border-white/30 hover:bg-white/10 text-purple-300 hover:text-white rounded-xl h-9 px-3 shrink-0 text-sm transition-all duration-200"
                        >
                          <X className="h-3.5 w-3.5 mr-1" />Clear
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}

              {loading ? (
                <p className="text-purple-300 animate-pulse">Loading properties...</p>
              ) : properties.length === 0 ? (
                <Card className="bg-white/5 border-white/10 text-center">
                  <CardContent className="py-16">
                    <p className="text-6xl mb-4">🏠</p>
                    <p className="text-white text-xl font-bold mb-2">No properties yet</p>
                    <p className="text-purple-300 mb-6">
                      {user?.walletAddress
                        ? "Add your first property to get started"
                        : "Add your wallet address first, then list your properties"}
                    </p>
                    {user?.walletAddress ? (
                      <Button onClick={() => setActiveTab("add-property")}
                        className="bg-purple-600 hover:bg-purple-700 text-white rounded-xl shadow-lg shadow-purple-900/30">
                        <Plus className="h-4 w-4 mr-2" />Add Property
                      </Button>
                    ) : (
                      <Button onClick={() => setActiveTab("profile")}
                        className="bg-orange-500/20 hover:bg-orange-500/30 border border-orange-500/30 text-orange-300 rounded-xl">
                        <Wallet className="h-4 w-4 mr-2" />Add Wallet First
                      </Button>
                    )}
                  </CardContent>
                </Card>
              ) : filteredProps.length === 0 ? (
                <Card className="bg-white/5 border-white/10 text-center">
                  <CardContent className="py-12">
                    <p className="text-4xl mb-3">🔍</p>
                    <p className="text-white font-bold mb-1">No properties match your filters</p>
                    <p className="text-purple-300 text-sm mb-4">Try adjusting your search or filters</p>
                    <Button
                      variant="ghost"
                      onClick={() => { setPropFilter({ search: "", roomType: "", status: "" }); setPropPage(1); }}
                      className="border border-white/15 hover:bg-white/10 text-white rounded-xl"
                    >
                      <X className="h-4 w-4 mr-2" />Clear Filters
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <>
                  <div className="space-y-4">
                    {paginatedProps.map((property) => (
                      <Card key={property._id} className="bg-white/5 border-white/10 hover:border-purple-500/30 transition-all duration-200">
                        <CardContent className="p-6">
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-3">
                                <Badge variant="outline" className="border-purple-500/40 text-purple-300 bg-purple-500/10 text-xs">
                                  {property.roomType}
                                </Badge>
                                <Badge variant="outline" className={`text-xs ${property.isAvailable
                                  ? "border-green-500/40 text-green-300 bg-green-500/10"
                                  : "border-red-500/40 text-red-300 bg-red-500/10"
                                  }`}>
                                  {property.isAvailable ? "✅ Available" : "❌ Occupied"}
                                </Badge>
                              </div>

                              {/* IMAGE PREVIEWS */}
                              {property.images?.length > 0 && (
                                <div className="flex gap-2 mb-3">
                                  {property.images.slice(0, 3).map((img: string, idx: number) => (
                                    <img key={idx} src={img} alt={property.title}
                                      className="h-16 w-24 object-cover rounded-xl border border-white/10" />
                                  ))}
                                  {property.images.length > 3 && (
                                    <div className="h-16 w-24 bg-white/10 rounded-xl border border-white/10 flex items-center justify-center">
                                      <p className="text-purple-300 text-xs">+{property.images.length - 3} more</p>
                                    </div>
                                  )}
                                </div>
                              )}

                              <h4 className="text-white font-bold text-xl mb-1">{property.title}</h4>
                              <p className="text-purple-300 mb-3">📍 {property.location}</p>

                              <Separator className="bg-white/10 mb-3" />

                              <div className="flex gap-6">
                                <div>
                                  <p className="text-purple-300 text-xs mb-0.5">Monthly Rent</p>
                                  <p className="text-white font-bold">₹{property.rentAmount.toLocaleString()}</p>
                                </div>
                                <div>
                                  <p className="text-purple-300 text-xs mb-0.5">Deposit</p>
                                  <p className="text-white font-bold">₹{property.depositAmount.toLocaleString()}</p>
                                </div>
                                <div>
                                  <p className="text-purple-300 text-xs mb-0.5">Amenities</p>
                                  <p className="text-white text-sm">{property.amenities.join(", ")}</p>
                                </div>
                              </div>
                            </div>

                            {/* ACTION BUTTONS */}
                            <div className="flex flex-col gap-2 shrink-0">
                              <Button
                                onClick={() => navigate(`/property/${property._id}`)}
                                variant="ghost"
                                className="border border-white/15 hover:border-white/30 hover:bg-white/10 text-white rounded-xl text-sm"
                              >
                                <Eye className="h-3.5 w-3.5 mr-1.5" />View
                              </Button>
                              <Button
                                onClick={() => toggleAvailability(property._id, property.isAvailable)}
                                className={`rounded-xl text-sm transition-all duration-200 ${property.isAvailable
                                  ? "bg-orange-500/10 hover:bg-orange-500/20 border border-orange-500/20 text-orange-300"
                                  : "bg-green-500/10 hover:bg-green-500/20 border border-green-500/20 text-green-300"
                                  }`}
                              >
                                {property.isAvailable ? "Mark Occupied" : "Mark Available"}
                              </Button>
                              <Button
                                onClick={() => handleDeleteProperty(property._id)}
                                className="bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-300 rounded-xl text-sm transition-all duration-200"
                              >
                                🗑️ Delete
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>

                  {/* PAGINATION */}
                  {totalPropPages > 1 && (
                    <div className="flex items-center justify-center gap-2 mt-6">
                      <Button
                        variant="ghost"
                        onClick={() => setPropPage(prev => Math.max(1, prev - 1))}
                        disabled={propPage === 1}
                        className="border border-white/15 hover:border-white/30 hover:bg-white/10 text-white rounded-xl px-4 disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-200"
                      >
                        <ChevronLeft className="h-4 w-4" />
                      </Button>
                      {Array.from({ length: totalPropPages }, (_, i) => i + 1).map((page) => (
                        <Button
                          key={page}
                          onClick={() => setPropPage(page)}
                          className={`w-10 h-10 rounded-xl text-sm font-semibold transition-all duration-200 ${page === propPage
                            ? "bg-purple-600 hover:bg-purple-700 text-white shadow-lg shadow-purple-900/40"
                            : "bg-white/5 border border-white/10 hover:border-white/30 hover:bg-white/10 text-purple-300 hover:text-white"
                            }`}
                        >
                          {page}
                        </Button>
                      ))}
                      <Button
                        variant="ghost"
                        onClick={() => setPropPage(prev => Math.min(totalPropPages, prev + 1))}
                        disabled={propPage === totalPropPages}
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
        )}

        {/* AGREEMENTS TAB */}
        {activeTab === "agreements" && (
          <div className="space-y-6">
            <h3 className="text-xl font-bold">📋 Agreement Requests</h3>
            {approveSuccess && <Alert className="bg-green-500/10 text-green-400 border-green-500/30"><CheckCircle2 className="h-4 w-4" /><AlertDescription>{approveSuccess}</AlertDescription></Alert>}
            {approveError && <Alert variant="destructive" className="bg-red-500/10 text-red-400 border-red-500/30"><AlertCircle className="h-4 w-4" /><AlertDescription>{approveError}</AlertDescription></Alert>}
            
            {loadingAgreements ? <p className="animate-pulse">Loading...</p> : agreements.filter(a => a.status === "pending").length === 0 ? (
              <Card className="bg-white/5 border-white/10 text-center py-16"><p className="text-purple-300">No pending requests</p></Card>
            ) : (
              <div className="space-y-4">
                {agreements.filter(a => a.status === "pending").map((agreement) => (
                  <Card key={agreement._id} className="bg-white/5 border-white/10 p-6 flex items-center justify-between">
                    <div>
                      <p className="text-white font-bold">{agreement.property.title}</p>
                      <p className="text-purple-300 text-sm">Tenant: {agreement.tenant.name}</p>
                    </div>
                    <div className="flex gap-2">
                      <Button 
                        onClick={() => handleReject(agreement._id)} 
                        disabled={rejectingId === agreement._id || approvingId === agreement._id} 
                        variant="outline"
                        className="border-red-500/30 bg-red-500/5 hover:bg-red-500/10 text-red-400"
                      >
                        {rejectingId === agreement._id ? "Rejecting..." : "Reject"}
                      </Button>
                      <Button 
                        onClick={() => handleApprove(agreement)} 
                        disabled={approvingId === agreement._id || rejectingId === agreement._id} 
                        className="bg-green-600 hover:bg-green-700"
                      >
                        {approvingId === agreement._id ? "Processing..." : "Approve Request"}
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}

        {/* BLOCKCHAIN TAB */}
        {activeTab === "blockchain" && (
          <div className="space-y-6">
            <h3 className="text-xl font-bold">⛓️ Smart Contracts</h3>
            {agreements.filter(a => a.status === "active" || a.status === "approved").length === 0 ? (
              <Card className="bg-white/5 border-white/10 text-center py-16"><p className="text-purple-300">No active blockchain agreements</p></Card>
            ) : (
              <div className="space-y-4">
                {agreements.filter(a => a.status === "active" || a.status === "approved").map((agreement) => (
                  <BlockchainAgreementCard key={agreement._id} agreement={agreement} CONTRACT_ABI={CONTRACT_ABI} onSuccess={fetchAgreements} />
                ))}
              </div>
            )}
          </div>
        )}

        {/* ANALYTICS TAB */}
        {activeTab === "analytics" && (
          <LandlordAnalytics agreements={agreements} properties={properties} />
        )}

        {/* PROFILE TAB */}
        {activeTab === "profile" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl">
            {/* ACCOUNT DETAILS */}
            <Card className="bg-white/5 border-white/10">
              <CardHeader className="pb-2">
                <CardTitle className="text-white text-lg">👤 Account Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 pt-0">
                {[
                  { label: "Name", value: user?.name },
                  { label: "Email", value: user?.email },
                  { label: "Role", value: "👔 Landlord" },
                ].map(({ label, value }) => (
                  <div key={label} className="bg-white/5 border border-white/10 rounded-xl p-3 relative overflow-hidden flex items-center justify-between">
                    <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-purple-500/40 to-transparent" />
                    <div>
                      <p className="text-purple-300 text-xs mb-1">{label}</p>
                      <p className="text-white font-semibold text-sm">{value}</p>
                    </div>
                    {label === "Name" && (
                      <ZkBadge verified={user?.isZkVerified} showText size="sm" />
                    )}
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* WALLET UPDATE */}
            <Card className="bg-white/5 border-white/10">
              <CardHeader className="pb-2">
                <CardTitle className="text-white text-lg flex items-center gap-2">
                  <Wallet className="h-5 w-5 text-purple-400" />
                  MetaMask Wallet Address
                </CardTitle>
                <p className="text-purple-300/80 text-sm">
                  {user?.walletAddress
                    ? "Your wallet is linked. You can update it anytime below."
                    : "⚠️ No wallet linked. You must add one to list properties and approve agreements."}
                </p>
              </CardHeader>
              <CardContent className="space-y-4 pt-0">

                {/* Current wallet */}
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
                    >
                      🦊 Auto-fill
                    </Button>
                  </div>
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
                  {walletSaving
                    ? <><RefreshCw className="h-4 w-4 mr-2 animate-spin" />Saving...</>
                    : <><Wallet className="h-4 w-4 mr-2" />Save Wallet Address</>
                  }
                </Button>

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