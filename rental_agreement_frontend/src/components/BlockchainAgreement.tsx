/* eslint-disable @typescript-eslint/no-explicit-any */
import { ethers } from "ethers";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { CheckCircle2, ShieldCheck, FileText, Calendar, Wallet, MapPin } from "lucide-react";

interface BlockchainAgreementProps {
  agreement: any;
  details?: any; // Live blockchain details
}

export default function BlockchainAgreement({ agreement, details }: BlockchainAgreementProps) {
  const fmt = (val: any) => val ? ethers.formatEther(val) + " ETH" : "0 ETH";
  const fmtDate = (val: any) => val ? new Date(Number(val) * 1000).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric"
  }) : "N/A";

  const short = (addr: string) => addr ? addr.slice(0, 8) + "..." + addr.slice(-6) : "Not Connected";

  // Use either live details from blockchain or the agreement metadata from DB
  const data = {
    rent: details?.rentAmount ? fmt(details.rentAmount) : `₹${agreement.rentAmount?.toLocaleString()}`,
    deposit: details?.depositAmount ? fmt(details.depositAmount) : `₹${agreement.depositAmount?.toLocaleString()}`,
    endsOn: details?.agreementEnd ? fmtDate(details.agreementEnd) : "TBD",
    status: agreement.status || (details?.isActive ? "active" : "inactive"),
    address: agreement.contractAddress || "Deployment Pending",
  };

  return (
    <div className="relative group max-w-4xl mx-auto">
      {/* GLOW EFFECT PRE-SIGNED */}
      <div className="absolute -inset-1 bg-gradient-to-r from-purple-600/20 to-blue-600/20 rounded-[2rem] blur-xl opacity-50 group-hover:opacity-100 transition duration-1000"></div>

      {/* DOCUMENT CONTAINER */}
      <div className="relative bg-[#0d0d15] border border-white/10 rounded-[2rem] overflow-hidden shadow-2xl">
        
        {/* HEADER SECTION */}
        <div className="bg-gradient-to-r from-purple-900/40 via-blue-900/20 to-transparent p-8 md:p-10 border-b border-white/5">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-purple-400 font-bold tracking-widest text-xs uppercase">
                <ShieldCheck className="w-4 h-4" />
                Decentralized Rental Document
              </div>
              <h1 className="text-3xl md:text-4xl font-black text-white tracking-tight font-['Space_Grotesk']">
                Rental <span className="bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">Agreement</span>
              </h1>
              <p className="text-purple-300/60 text-sm font-mono flex items-center gap-2">
                ID: {data.address}
              </p>
            </div>
            
            <div className="flex flex-col items-end gap-3">
              <Badge variant="outline" className={`px-4 py-1.5 rounded-full font-bold text-xs uppercase tracking-wider ${
                data.status === 'active' 
                ? 'bg-green-500/10 text-green-400 border-green-500/30' 
                : 'bg-blue-500/10 text-blue-400 border-blue-500/30'
              }`}>
                {data.status === 'active' ? '● Live on Blockchain' : `○ STATUS: ${data.status}`}
              </Badge>
              <div className="flex items-center gap-2 text-white/40 text-[10px] font-mono">
                NETWORK: ETHEREUM SEPOLIA
              </div>
            </div>
          </div>
        </div>

        {/* CONTENT AREA */}
        <div className="p-8 md:p-10 space-y-10">
          
          {/* SECTION 1: THE PARTIES */}
          <div className="grid md:grid-cols-2 gap-8 relative">
            {/* Connector Line */}
            <div className="hidden md:block absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-[#0d0d15] border border-white/10 z-10 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4 text-purple-500" />
            </div>

            {/* LANDLORD */}
            <div className="space-y-4">
              <div className="text-xs font-bold text-white/30 uppercase tracking-widest flex items-center gap-2">
                <Wallet className="w-3 h-3" /> Landlord (Party A)
              </div>
              <div className="bg-white/[0.03] border border-white/5 rounded-2xl p-5 hover:bg-white/[0.05] transition-colors group/card">
                <p className="text-white font-bold text-lg mb-1">{agreement.landlord?.name || "The Asset Owner"}</p>
                <p className="text-purple-300/60 text-sm mb-3">{agreement.landlord?.email}</p>
                <div className="font-mono text-[10px] py-1.5 px-3 bg-purple-500/10 rounded-lg text-purple-400 border border-purple-500/20 inline-block">
                  {short(agreement.landlord?.walletAddress || details?.landlord)}
                </div>
              </div>
            </div>

            {/* TENANT */}
            <div className="space-y-4">
              <div className="text-xs font-bold text-white/30 uppercase tracking-widest flex items-center gap-2 md:justify-end">
                Tenant (Party B) <Wallet className="w-3 h-3" />
              </div>
              <div className="bg-white/[0.03] border border-white/5 rounded-2xl p-5 hover:bg-white/[0.05] transition-colors md:text-right group/card">
                <p className="text-white font-bold text-lg mb-1">{agreement.tenant?.name || "The Resident"}</p>
                <p className="text-purple-300/60 text-sm mb-3">{agreement.tenant?.email}</p>
                <div className="font-mono text-[10px] py-1.5 px-3 bg-blue-500/10 rounded-lg text-blue-400 border border-blue-500/20 inline-block">
                  {short(agreement.tenant?.walletAddress || details?.tenant)}
                </div>
              </div>
            </div>
          </div>

          <Separator className="bg-white/5" />

          {/* SECTION 2: PROPERTY & TERMS */}
          <div className="grid md:grid-cols-3 gap-6">
            
            {/* Property */}
            <div className="col-span-2 space-y-4">
              <div className="text-xs font-bold text-white/30 uppercase tracking-widest flex items-center gap-2">
                <MapPin className="w-3 h-3" /> Property Details
              </div>
              <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-6 relative overflow-hidden group/prop">
                <div className="absolute top-0 right-0 p-4 opacity-5 group-hover/prop:opacity-10 transition-opacity">
                  <FileText className="w-16 h-16" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">{agreement.property?.title || "Property Asset"}</h3>
                <p className="text-purple-300/70 text-sm leading-relaxed max-w-md">
                  {agreement.property?.location || "On-chain Location Not specified"}
                </p>
                <div className="mt-4 flex gap-2">
                  <Badge variant="secondary" className="bg-white/5 text-white/50 border-white/10 text-[10px]">
                    {agreement.property?.roomType || "Residential"}
                  </Badge>
                  <Badge variant="secondary" className="bg-white/5 text-white/50 border-white/10 text-[10px]">
                    Verified Logic
                  </Badge>
                </div>
              </div>
            </div>

            {/* Duration */}
            <div className="space-y-4">
              <div className="text-xs font-bold text-white/30 uppercase tracking-widest flex items-center gap-2">
                <Calendar className="w-3 h-3" /> Period
              </div>
              <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-6 h-full flex flex-col justify-center">
                <p className="text-purple-300/50 text-xs mb-1">Contract End Date</p>
                <p className="text-white font-black text-xl font-['Space_Grotesk']">{data.endsOn}</p>
                <p className="text-white/40 text-[10px] mt-2 italic">Automatically expires in {agreement.durationDays || details?.duration} days</p>
              </div>
            </div>

          </div>

          {/* SECTION 3: FINANCIALS CARDS */}
          <div className="grid grid-cols-2 gap-6">
            
            {/* RENT */}
            <div className="relative group/val">
              <div className="absolute inset-0 bg-purple-600/5 border border-purple-500/20 rounded-2xl -z-10 blur-sm opacity-0 group-hover/val:opacity-100 transition-opacity"></div>
              <div className="bg-white/[0.03] border border-white/5 rounded-2xl p-6 text-center">
                <p className="text-purple-300/40 text-[10px] font-bold uppercase tracking-[0.2em] mb-2">Monthly Installment</p>
                <p className="text-white font-black text-3xl md:text-4xl font-['Space_Grotesk'] tracking-tight">
                  {data.rent}
                </p>
                <div className="mt-2 text-[10px] p-1 px-3 bg-purple-500/10 text-purple-400 rounded-full inline-block border border-purple-500/10">
                  Recurring Smart Payment
                </div>
              </div>
            </div>

            {/* DEPOSIT */}
            <div className="relative group/val">
              <div className="absolute inset-0 bg-blue-600/5 border border-blue-500/20 rounded-2xl -z-10 blur-sm opacity-0 group-hover/val:opacity-100 transition-opacity"></div>
              <div className="bg-white/[0.03] border border-white/5 rounded-2xl p-6 text-center">
                <p className="text-blue-300/40 text-[10px] font-bold uppercase tracking-[0.2em] mb-2">Security Deposit (Escrow)</p>
                <p className="text-white font-black text-3xl md:text-4xl font-['Space_Grotesk'] tracking-tight">
                  {data.deposit}
                </p>
                <div className="mt-2 text-[10px] p-1 px-3 bg-blue-500/10 text-blue-400 rounded-full inline-block border border-blue-500/10">
                  Refundable OnChain
                </div>
              </div>
            </div>

          </div>

        </div>

        {/* FOOTER: BLOCKCHAIN VERIFICATION */}
        <div className="bg-white/[0.02] p-8 border-t border-white/5 relative overflow-hidden">
           {/* Watermark */}
           <div className="absolute right-0 bottom-0 text-[120px] font-black text-white/[0.02] leading-none select-none pointer-events-none transform translate-y-12 translate-x-8 uppercase">
             Signed
           </div>

           <div className="flex flex-col md:flex-row items-center justify-between gap-6 relative z-10">
             <div className="flex items-center gap-4">
               <div className="w-12 h-12 rounded-xl bg-green-500/10 border border-green-500/20 flex items-center justify-center text-green-500">
                 <ShieldCheck className="w-6 h-6" />
               </div>
               <div>
                 <p className="text-white font-bold text-sm">Blockchain Verified Document</p>
                 <p className="text-white/40 text-xs">This agreement is legally binding through Ethereum Smart Contracts</p>
               </div>
             </div>
             
             <div className="flex gap-4">
                <div className="text-right">
                  <p className="text-purple-300/50 text-[10px] uppercase font-bold tracking-tighter">Agreement Timestamp</p>
                  <p className="text-white/70 text-xs font-mono">{new Date().toLocaleTimeString()}</p>
                </div>
                <Separator orientation="vertical" className="h-8 bg-white/10" />
                <div className="text-right">
                  <p className="text-purple-300/50 text-[10px] uppercase font-bold tracking-tighter">Platform Version</p>
                  <p className="text-white/70 text-xs font-mono">DRAB-V1.0</p>
                </div>
             </div>
           </div>
        </div>

      </div>
    </div>
  );
}
