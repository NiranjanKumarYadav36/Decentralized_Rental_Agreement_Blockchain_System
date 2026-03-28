/* eslint-disable @typescript-eslint/no-explicit-any */
// components/DownloadAgreementButton.tsx
// Fetches full agreement from backend (with both landlord + tenant populated)
// then generates a PDF — works correctly from both Landlord and Tenant sides.

import { useState } from "react";
import { ethers } from "ethers";
import { Button } from "@/components/ui/button";
import { FileDown, Loader2 } from "lucide-react";
import { generateAgreementPDF, type AgreementPDFData } from "@/utils/generateAgreementPDF";
import { getAgreement } from "@/services/api";   // ← add this API call (see below)

interface Props {
  agreementId: string;            // just pass _id — we fetch the rest
  details?: any;                  // optional on-chain details (rentAmount, depositAmount, agreementEnd, etc.)
  variant?: "default" | "outline" | "ghost";
  size?: "default" | "sm" | "lg";
  className?: string;
  label?: string;
}

function fmtEth(val: any): string {
  try { return ethers.formatEther(val) + " ETH"; } catch { return val?.toString() || "—"; }
}

export default function DownloadAgreementButton({
  agreementId,
  details,
  variant = "default",
  size = "default",
  className = "",
  label = "Download Agreement",
}: Props) {
  const [loading, setLoading] = useState(false);
  const [error, setError]   = useState("");

  const handleDownload = async () => {
    setLoading(true);
    setError("");
    try {
      // ── 1. Fetch the FULL agreement from backend ─────────────────────────
      // This always returns both landlord AND tenant populated,
      // regardless of who is logged in.
      const res = await getAgreement(agreementId);
      const ag  = res.data;

      // ── 2. Resolve all fields ────────────────────────────────────────────
      const landlord = ag.landlord || ag.property?.landlord || {};
      const tenant   = ag.tenant   || {};
      const property = ag.property || {};

      // Prefer on-chain data for financial fields (more accurate)
      const rentAmt    = details?.rentAmount
        ? fmtEth(details.rentAmount)
        : `INR ${ag.rentAmount?.toLocaleString() || "—"}`;
      const depositAmt = details?.depositAmount
        ? fmtEth(details.depositAmount)
        : `INR ${ag.depositAmount?.toLocaleString() || "—"}`;

      // End date: from chain (BigInt timestamp) or from DB
      const endDate = details?.agreementEnd
        ? Number(details.agreementEnd)
        : ag.endDate;

      const startDate = ag.startDate || ag.createdAt;

      // ── 3. Build PDF data ────────────────────────────────────────────────
      const pdfData: AgreementPDFData = {
        // Meta
        agreementId:      ag._id || "—",
        contractAddress:  ag.contractAddress || "Not yet deployed",
        txHash:           ag.txHash || undefined,
        startDate,
        endDate,
        status:           ag.status || "active",
        durationDays:     ag.durationDays || 0,

        // Property
        propertyTitle:    property.title    || "—",
        propertyLocation: property.location || "—",
        roomType:         property.roomType || "—",

        // Financial
        rentAmount:    rentAmt,
        depositAmount: depositAmt,

        // Landlord — always from fetched data
        landlordName:   landlord.name          || "—",
        landlordEmail:  landlord.email         || "—",
        landlordWallet: landlord.walletAddress || "—",
        landlordPhone:  landlord.phone         || undefined,

        // Tenant — always from fetched data
        tenantName:   tenant.name          || "—",
        tenantEmail:  tenant.email         || "—",
        tenantWallet: tenant.walletAddress || "—",
        tenantPhone:  tenant.phone         || undefined,
      };

      // ── 4. Generate and download PDF ─────────────────────────────────────
      generateAgreementPDF(pdfData);

    } catch (err: any) {
      console.error("PDF generation failed:", err);
      setError("Failed to generate PDF. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <Button
        onClick={handleDownload}
        disabled={loading}
        variant={variant}
        size={size}
        className={className}
      >
        {loading
          ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Generating...</>
          : <><FileDown className="h-4 w-4 mr-2" />{label}</>
        }
      </Button>
      {error && (
        <p className="text-red-400 text-xs mt-1">{error}</p>
      )}
    </div>
  );
}