/* eslint-disable @typescript-eslint/no-unused-expressions */
// utils/generateAgreementPDF.ts
import { jsPDF } from "jspdf";

export interface AgreementPDFData {
  agreementId: string;
  contractAddress: string;
  txHash?: string;
  startDate?: string | number;
  endDate?: string | number;
  status: string;
  durationDays: number;

  propertyTitle: string;
  propertyLocation: string;
  roomType: string;

  rentAmount: string;
  depositAmount: string;

  landlordName: string;
  landlordEmail: string;
  landlordWallet: string;
  landlordPhone?: string;

  tenantName: string;
  tenantEmail: string;
  tenantWallet: string;
  tenantPhone?: string;
}

// ── NEW Palette ────────────────────────────────────────────────
const P = {
    TextMain:    [30,  41,  59] as [number, number, number],   // Slate 800
    TextMuted:   [100, 116, 139] as [number, number, number], // Slate 500
    Accent:      [37,  99,  235] as [number, number, number], // Blue 600
    AccentSoft:  [219, 234, 254] as [number, number, number], // Blue 100
    Surface:     [248, 250, 252] as [number, number, number], // Slate 50
    Border:      [226, 232, 240] as [number, number, number], // Slate 200
    White:       [255, 255, 255] as [number, number, number],
    Success:     [21,  128, 61]  as [number, number, number], // Green 700
};

// ── LOGO REMOVED IN FAVOR OF VECTOR DRAWING ────────────────────

const W = 210;
const M = 20; // Increased margin for more professional look
const CW = W - M * 2;

// ── Drawing helpers ────────────────────────────────────────────
function rect(doc: jsPDF, x: number, y: number, w: number, h: number, fill: [number,number,number], r = 0) {
  doc.setFillColor(...fill);
  r ? doc.roundedRect(x, y, w, h, r, r, "F") : doc.rect(x, y, w, h, "F");
}

function line(doc: jsPDF, x1: number, y1: number, x2: number, y2: number, col: [number,number,number], lw = 0.25) {
  doc.setDrawColor(...col);
  doc.setLineWidth(lw);
  doc.line(x1, y1, x2, y2);
}

function txt(doc: jsPDF, t: string, x: number, y: number, size: number, col: [number,number,number], style: "normal"|"bold"|"italic" = "normal", maxW?: number, align: "left"|"center"|"right" = "left") {
  doc.setFontSize(size);
  doc.setTextColor(...col);
  doc.setFont("helvetica", style);
  
  if (maxW) {
    const lines = doc.splitTextToSize(t || "—", maxW);
    // Align applies to block if needed, but jspdf text() handles alignment better per call
    doc.text(lines, x, y, { align: align });
    return lines.length * (size * 0.35277 * 1.5);
  }
  
  doc.text(t || "—", x, y, { align: align });
  return size * 0.35277 * 1.5;
}

function monoTxt(doc: jsPDF, t: string, x: number, y: number, size: number, col: [number,number,number], maxW?: number) {
  doc.setFontSize(size);
  doc.setTextColor(...col);
  doc.setFont("courier", "normal");
  if (maxW) {
    const lines = doc.splitTextToSize(t || "—", maxW);
    doc.text(lines, x, y);
    return lines.length * (size * 0.35277 * 1.5);
  }
  doc.text(t || "—", x, y);
  return size * 0.35277 * 1.5;
}

function fmtDate(v?: string | number) {
  if (!v) return "—";
  const d = new Date(typeof v === "number" ? v * 1000 : v);
  return isNaN(d.getTime()) ? String(v) : d.toLocaleDateString("en-IN", { day: "2-digit", month: "long", year: "numeric" });
}

// ── Main export ────────────────────────────────────────────────
export function generateAgreementPDF(data: AgreementPDFData) {
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  let y = 20;

  // ════════════════════════════════════════════════════════════
  // HEADER
  // ════════════════════════════════════════════════════════════
  
  // Vector Logo (Modern Minimalist Blockchain Node)
  rect(doc, M, y - 8, 16, 16, P.Accent, 3); // Blue outer
  rect(doc, M + 3, y - 5, 10, 10, P.White, 1); // White inner
  rect(doc, M + 5, y - 3, 6, 6, P.Accent, 0.5); // Blue core point
  
  txt(doc, "RENTALCHAIN", M + 20, y - 1, 14, P.TextMain, "bold");
  txt(doc, "DECIDEDLY DIGITAL", M + 20, y + 4, 7, P.TextMuted, "bold");

  const headerRight = W - M;
  txt(doc, "RENTAL AGREEMENT", headerRight, y + 2, 22, P.TextMain, "bold", undefined, "right");
  txt(doc, "Digital Smart Contract Certificate", headerRight, y + 9, 8, P.TextMuted, "normal", undefined, "right");
  
  y += 20;
  line(doc, M, y, W - M, y, P.Border, 0.5);
  y += 10;

  // ════════════════════════════════════════════════════════════
  // SUMMARY BOX
  // ════════════════════════════════════════════════════════════
  rect(doc, M, y, CW, 25, P.Surface, 4);
  
  const col1 = M + 8;
  const col2 = M + (CW / 2);
  
  txt(doc, "AGREEMENT ID", col1, y + 8, 7, P.TextMuted, "bold");
  txt(doc, `#${data.agreementId?.toUpperCase() || "—"}`, col1, y + 15, 12, P.Accent, "bold");

  txt(doc, "STATUS", col2, y + 8, 7, P.TextMuted, "bold");
  txt(doc, (data.status || "ACTIVE").toUpperCase(), col2, y + 15, 12, P.Success, "bold");

  y += 35;

  // ════════════════════════════════════════════════════════════
  // THE PARTIES
  // ════════════════════════════════════════════════════════════
  txt(doc, "1. THE PARTIES", M, y, 12, P.Accent, "bold");
  y += 8;
  txt(doc, "This Lease Agreement is entered into by and between the following parties:", M, y, 9, P.TextMain);
  y += 10;

  // Landlord & Tenant side-by-side
  const pW = (CW - 10) / 2;
  
  // Landlord
  txt(doc, "THE LANDLORD (PARTY A)", M, y, 7, P.TextMuted, "bold");
  y += 5;
  txt(doc, data.landlordName, M, y, 11, P.TextMain, "bold");
  y += 6;
  txt(doc, data.landlordEmail, M, y, 9, P.TextMain);
  y += 5;
  monoTxt(doc, data.landlordWallet, M, y, 7, P.Accent, pW);
  y -= 16; // Move back up for tenant

  // Tenant
  txt(doc, "THE TENANT (PARTY B)", col2, y, 7, P.TextMuted, "bold");
  y += 5;
  txt(doc, data.tenantName, col2, y, 11, P.TextMain, "bold");
  y += 6;
  txt(doc, data.tenantEmail, col2, y, 9, P.TextMain);
  y += 5;
  monoTxt(doc, data.tenantWallet, col2, y, 7, P.Accent, pW);
  
  y += 20;

  // ════════════════════════════════════════════════════════════
  // PROPERTY & FINANCIALS
  // ════════════════════════════════════════════════════════════
  txt(doc, "2. PROPERTY & FINANCIAL TERMS", M, y, 12, P.Accent, "bold");
  y += 8;
  
  const finH = 40;
  rect(doc, M, y, CW, finH, P.White, 4);
  doc.setDrawColor(...P.Border);
  doc.setLineWidth(0.3);
  doc.roundedRect(M, y, CW, finH, 4, 4, "D");

  const finCol1 = M + (CW / 6);
  const finCol2 = M + (CW / 2);
  const finCol3 = M + (5 * CW / 6);

  // Labels
  txt(doc, "PROPERTY TITLE", finCol1, y + 10, 7, P.TextMuted, "bold", undefined, "center");
  txt(doc, data.propertyTitle, finCol1, y + 18, 10, P.TextMain, "bold", CW / 3 - 10, "center");

  txt(doc, "MONTHLY RENT", finCol2, y + 10, 7, P.TextMuted, "bold", undefined, "center");
  txt(doc, data.rentAmount, finCol2, y + 18, 12, P.TextMain, "bold", undefined, "center");

  txt(doc, "SECURITY DEPOSIT", finCol3, y + 10, 7, P.TextMuted, "bold", undefined, "center");
  txt(doc, data.depositAmount, finCol3, y + 18, 12, P.TextMain, "bold", undefined, "center");

  y += 28;
  line(doc, M + 5, y, W - M - 5, y, P.Border, 0.2);
  y += 8;

  txt(doc, "LEASE COMMENCEMENT:", M + 8, y, 8, P.TextMuted, "bold");
  txt(doc, fmtDate(data.startDate), M + 43, y, 8, P.TextMain, "bold");

  txt(doc, "EXPIRATION DATE:", finCol2 + 5, y, 8, P.TextMuted, "bold");
  txt(doc, fmtDate(data.endDate), finCol2 + 35, y, 8, P.TextMain, "bold");

  y += 25;

  // ════════════════════════════════════════════════════════════
  // BLOCKCHAIN PROOF
  // ════════════════════════════════════════════════════════════
  txt(doc, "3. BLOCKCHAIN VERIFICATION", M, y, 12, P.Accent, "bold");
  y += 8;

  rect(doc, M, y, CW, 20, P.AccentSoft, 2);
  txt(doc, "SMART CONTRACT ADDRESS (SEPOLIA NETWORK)", M + 5, y + 7, 7, P.TextMuted, "bold");
  monoTxt(doc, data.contractAddress, M + 5, y + 14, 8, P.Accent, CW - 10);

  y += 30;

  // ════════════════════════════════════════════════════════════
  // DIGITAL SIGNATURES & LEGAL DISCLAIMER
  // ════════════════════════════════════════════════════════════
  line(doc, M, y, W - M, y, P.TextMain, 1);
  y += 10;
  
  txt(doc, "LEGAL DISCLAIMER AND BINDING TERMS", M, y, 9, P.TextMain, "bold");
  y += 6;
  
  const disclaimerText = `This document (the "Agreement") is a digital representation of a legally binding contract executed via the RentalChain Decentralized Smart Contract system on the Ethereum Blockchain. 

1. BLOCKCHAIN ENFORCEABILITY: The parties acknowledge that the terms herein, including but not limited to payment obligations and security deposit handling, are governed by the underlying Smart Contract logic deployed at the address specified in this document.
2. DIGITAL SIGNATURES: Use of a private cryptographic key to sign the Smart Contract constitutes a valid, binding, and enforceable digital signature under applicable electronic transaction laws (e.g., E-SIGN Act and UETA).
3. AUTHORITATIVE RECORD: In the event of any discrepancy between this PDF representation and the on-chain Smart Contract state, the Ethereum blockchain record shall serve as the sole authoritative and final legal truth.
4. JURISDICTION: This platform provides technological infrastructure only. RentalChain is not a party to this agreement and is not responsible for legal compliance in specific local jurisdictions.`;

  txt(doc, disclaimerText, M, y, 7.5, P.TextMain, "normal", CW);
  
  y += 55;

  // Signatures
  txt(doc, "EXECUTED BY:", M, y, 10, P.TextMain, "bold");
  y += 15;

  line(doc, M, y, M + 60, y, P.TextMain, 0.5);
  txt(doc, "DIGITALLY SIGNED (LANDLORD)", M, y + 5, 7, P.TextMuted, "bold");
  txt(doc, data.landlordName, M, y + 10, 8, P.TextMain, "bold");

  line(doc, col2, y, col2 + 60, y, P.TextMain, 0.5);
  txt(doc, "DIGITALLY SIGNED (TENANT)", col2, y + 5, 7, P.TextMuted, "bold");
  txt(doc, data.tenantName, col2, y + 10, 8, P.TextMain, "bold");

  // Save
  const filename = `RentalAgreement_${data.propertyTitle.replace(/\s+/g, "_").slice(0, 20)}.pdf`;
  doc.save(filename);
}