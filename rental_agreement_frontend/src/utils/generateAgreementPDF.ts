/* eslint-disable @typescript-eslint/no-unused-expressions */
// utils/generateAgreementPDF.ts
// npm install jspdf

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

// ── Palette ────────────────────────────────────────────────────
const P = {
  navy:       [15,  23,  42]  as [number, number, number],
  blue:       [37,  99,  235] as [number, number, number],
  blueLight:  [219, 234, 254] as [number, number, number],
  bluePale:   [239, 246, 255] as [number, number, number],
  white:      [255, 255, 255] as [number, number, number],
  black:      [15,  23,  42]  as [number, number, number],
  gray:       [100, 116, 139] as [number, number, number],
  grayLight:  [241, 245, 249] as [number, number, number],
  border:     [203, 213, 225] as [number, number, number],
  green:      [5,   150, 105] as [number, number, number],
  greenLight: [209, 250, 229] as [number, number, number],
  orange:     [234, 88,  12]  as [number, number, number],
  orangeLight:[255, 237, 213] as [number, number, number],
  purple:     [109, 40,  217] as [number, number, number],
  purpleLight:[237, 233, 254] as [number, number, number],
};

const W  = 210;
const M  = 14;
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

function txt(doc: jsPDF, t: string, x: number, y: number, size: number, col: [number,number,number], style: "normal"|"bold"|"italic" = "normal", maxW?: number) {
  doc.setFontSize(size);
  doc.setTextColor(...col);
  doc.setFont("helvetica", style);
  if (maxW) {
    const lines = doc.splitTextToSize(t || "—", maxW);
    doc.text(lines, x, y);
    return (lines.length - 1) * (size * 0.35277 * 1.4);
  }
  doc.text(t || "—", x, y);
  return 0;
}

function monoTxt(doc: jsPDF, t: string, x: number, y: number, size: number, col: [number,number,number], maxW?: number) {
  doc.setFontSize(size);
  doc.setTextColor(...col);
  doc.setFont("courier", "normal");
  if (maxW) {
    const lines = doc.splitTextToSize(t || "—", maxW);
    doc.text(lines, x, y);
    return (lines.length - 1) * (size * 0.35277 * 1.4);
  }
  doc.text(t || "—", x, y);
  return 0;
}

function fmtDate(v?: string | number) {
  if (!v) return "—";
  const d = new Date(typeof v === "number" ? v * 1000 : v);
  return isNaN(d.getTime()) ? String(v) : d.toLocaleDateString("en-IN", { day: "2-digit", month: "long", year: "numeric" });
}

function statusColor(status: string): [number,number,number] {
  switch (status?.toLowerCase()) {
    case "active":     return P.green;
    case "approved":   return P.blue;
    case "pending":    return P.orange;
    case "terminated": return P.gray;
    default:           return P.blue;
  }
}

function statusBg(status: string): [number,number,number] {
  switch (status?.toLowerCase()) {
    case "active":     return P.greenLight;
    case "approved":   return P.blueLight;
    case "pending":    return P.orangeLight;
    case "terminated": return P.grayLight;
    default:           return P.blueLight;
  }
}

// ── Section header ─────────────────────────────────────────────
function sectionHead(doc: jsPDF, label: string, y: number): number {
  rect(doc, M, y, CW, 7.5, P.navy, 0);
  txt(doc, label, M + 4, y + 5.2, 8.5, P.white, "bold");
  return y + 7.5 + 3;
}

// ── Info cell ──────────────────────────────────────────────────
function cell(doc: jsPDF, label: string, value: string, x: number, y: number, w: number, h: number, mono = false) {
  rect(doc, x, y, w, h, P.grayLight, 2);
  // left accent
  rect(doc, x, y, 1.5, h, P.blue, 0);
  txt(doc, label, x + 4, y + 4.5, 6.5, P.gray, "normal");
  if (mono) {
    monoTxt(doc, value, x + 4, y + 10, 7.5, P.black, w - 8);
  } else {
    txt(doc, value, x + 4, y + 10, 9, P.black, "bold", w - 8);
  }
}

// ── Main export ────────────────────────────────────────────────
export function generateAgreementPDF(data: AgreementPDFData) {
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  let y = 0;

  // ════════════════════════════════════════════════════════════
  // HEADER
  // ════════════════════════════════════════════════════════════
  rect(doc, 0, 0, W, 50, P.navy);

  // Blue accent strip at very top
  rect(doc, 0, 0, W, 1.5, P.blue);

  // Brand
  txt(doc, "RentalChain", M, 14, 22, P.white, "bold");
  txt(doc, "Decentralized Rental Agreement Platform", M, 20, 8.5, P.blueLight, "normal");

  // Status badge (top right)
  const sc = statusColor(data.status);
  const sb = statusBg(data.status);
  rect(doc, W - M - 36, 8, 36, 10, sc, 2);
  txt(doc, `✓  ${(data.status || "active").toUpperCase()}`, W - M - 33, 14.5, 8, P.white, "bold");

  // Divider line
  line(doc, M, 26, W - M, 26, P.blueLight, 0.4);

  // Document title & meta
  txt(doc, "RENTAL AGREEMENT", M, 34, 15, P.white, "bold");
  txt(doc, `Generated: ${new Date().toLocaleDateString("en-IN", { day: "2-digit", month: "long", year: "numeric" })}`, M, 40, 8, P.blueLight);
  txt(doc, `Agreement ID: #${data.agreementId?.slice(-8).toUpperCase() || "—"}`, W - M - 60, 34, 7.5, P.blueLight);
  txt(doc, `Duration: ${data.durationDays} Days`, W - M - 60, 40, 7.5, P.blueLight);

  y = 56;

  // ════════════════════════════════════════════════════════════
  // AGREEMENT META — row of 4 cells
  // ════════════════════════════════════════════════════════════
  const cw4 = (CW - 6) / 4;
  const cellH = 16;

  cell(doc, "Start Date",    fmtDate(data.startDate),        M,                y, cw4, cellH);
  cell(doc, "End Date",      fmtDate(data.endDate),           M + cw4 + 2,     y, cw4, cellH);
  cell(doc, "Monthly Rent",  data.rentAmount,                 M + (cw4+2)*2,   y, cw4, cellH);
  cell(doc, "Security Deposit", data.depositAmount,           M + (cw4+2)*3,   y, cw4, cellH);

  y += cellH + 4;

  // ════════════════════════════════════════════════════════════
  // PROPERTY DETAILS
  // ════════════════════════════════════════════════════════════
  y = sectionHead(doc, "📍  PROPERTY DETAILS", y);

  const cw2 = (CW - 3) / 2;
  cell(doc, "Property Title",   data.propertyTitle,    M,          y, cw2,  cellH);
  cell(doc, "Room Type",        data.roomType,          M+cw2+3,   y, cw2 - 0, cellH);
  y += cellH + 3;
  cell(doc, "Location / Address", data.propertyLocation, M,        y, CW,   cellH);
  y += cellH + 5;

  // ════════════════════════════════════════════════════════════
  // PARTIES — two columns, equal width
  // ════════════════════════════════════════════════════════════
  y = sectionHead(doc, "🤝  PARTIES TO THIS AGREEMENT", y);

  const pColW = (CW - 4) / 2;
  const pBoxH = 50;

  // ── Landlord box ──
  rect(doc, M, y, pColW, pBoxH, P.bluePale, 3);
  rect(doc, M, y, pColW, 1.5, P.blue, 0);

  // Header row inside box
  txt(doc, "👔  LANDLORD", M + 4, y + 6.5, 9, P.blue, "bold");

  // Divider inside
  line(doc, M + 3, y + 9, M + pColW - 3, y + 9, P.border, 0.3);

  // Fields
  txt(doc,  "Name",    M + 4,  y + 14,  6.5, P.gray);
  txt(doc,  data.landlordName,  M + 4,  y + 19.5, 9.5, P.black, "bold", pColW - 8);

  txt(doc,  "Email",   M + 4,  y + 25.5, 6.5, P.gray);
  txt(doc,  data.landlordEmail, M + 4,  y + 30.5, 8.5, P.black, "normal", pColW - 8);

  if (data.landlordPhone) {
    txt(doc, "Phone",  M + 4,  y + 36,  6.5, P.gray);
    txt(doc, data.landlordPhone, M + 4, y + 41,  8.5, P.black, "normal");
  }

  txt(doc,  "Wallet",  M + 4,  y + (data.landlordPhone ? 44.5 : 36), 6.5, P.gray);
  monoTxt(doc, data.landlordWallet, M + 4, y + (data.landlordPhone ? 49 : 41), 6.5, P.blue, pColW - 8);

  // ── Tenant box ──
  const tx = M + pColW + 4;
  rect(doc, tx, y, pColW, pBoxH, P.greenLight, 3);
  rect(doc, tx, y, pColW, 1.5, P.green, 0);

  txt(doc, "🏡  TENANT", tx + 4, y + 6.5, 9, P.green, "bold");

  line(doc, tx + 3, y + 9, tx + pColW - 3, y + 9, P.border, 0.3);

  txt(doc,  "Name",    tx + 4, y + 14,   6.5, P.gray);
  txt(doc,  data.tenantName,   tx + 4, y + 19.5, 9.5, P.black, "bold", pColW - 8);

  txt(doc,  "Email",   tx + 4, y + 25.5, 6.5, P.gray);
  txt(doc,  data.tenantEmail,  tx + 4, y + 30.5, 8.5, P.black, "normal", pColW - 8);

  if (data.tenantPhone) {
    txt(doc, "Phone",  tx + 4, y + 36,   6.5, P.gray);
    txt(doc, data.tenantPhone,  tx + 4, y + 41,   8.5, P.black, "normal");
  }

  txt(doc,  "Wallet",  tx + 4, y + (data.tenantPhone ? 44.5 : 36), 6.5, P.gray);
  monoTxt(doc, data.tenantWallet, tx + 4, y + (data.tenantPhone ? 49 : 41), 6.5, P.green, pColW - 8);

  y += pBoxH + 5;

  // ════════════════════════════════════════════════════════════
  // BLOCKCHAIN PROOF
  // ════════════════════════════════════════════════════════════
  y = sectionHead(doc, "⛓️  BLOCKCHAIN PROOF OF AGREEMENT", y);

  // Contract address
  rect(doc, M, y, CW, 16, P.purpleLight, 2);
  rect(doc, M, y, 1.5, 16, P.purple, 0);
  txt(doc,  "Smart Contract Address", M + 4, y + 4.5, 6.5, P.gray);
  monoTxt(doc, data.contractAddress, M + 4, y + 10.5, 7.5, P.purple, CW - 8);

  y += 20;

  if (data.txHash) {
    rect(doc, M, y, CW, 16, P.grayLight, 2);
    rect(doc, M, y, 1.5, 16, P.gray, 0);
    txt(doc,  "Transaction Hash (Signing)", M + 4, y + 4.5, 6.5, P.gray);
    monoTxt(doc, data.txHash, M + 4, y + 10.5, 7.5, P.black, CW - 8);
    y += 20;
  }

  // Etherscan clickable
  rect(doc, M, y, CW, 10, P.blueLight, 2);
  txt(doc, "🔍  Verify on Etherscan:", M + 4, y + 6.5, 7.5, P.gray);
  const link = `https://sepolia.etherscan.io/address/${data.contractAddress}`;
  doc.setFontSize(7.5);
  doc.setTextColor(...P.blue);
  doc.setFont("courier", "normal");
  doc.textWithLink(link, M + 46, y + 6.5, { url: link });
  y += 14;

  // ════════════════════════════════════════════════════════════
  // TERMS & CONDITIONS
  // ════════════════════════════════════════════════════════════
  y = sectionHead(doc, "📋  TERMS & CONDITIONS", y);

  const terms = [
    { n: "1.", t: "This agreement is legally binding and enforced automatically by an Ethereum smart contract deployed on the blockchain." },
    { n: "2.", t: "The tenant agrees to pay the agreed monthly rent on or before the due date specified in the smart contract." },
    { n: "3.", t: "The security deposit is locked in the smart contract and will be automatically returned upon lawful termination of this agreement." },
    { n: "4.", t: "Any disputes between parties must be raised through the RentalChain platform and will be resolved as per the smart contract dispute resolution logic." },
    { n: "5.", t: "Either party may terminate this agreement under the conditions defined within the deployed smart contract code." },
    { n: "6.", t: "This printed/downloaded document is for reference only. The Ethereum blockchain record is the sole authoritative legal document." },
    { n: "7.", t: "Wallet addresses serve as digital identities and signatures. By signing the smart contract, both parties agree to all terms herein." },
  ];

  terms.forEach((term) => {
    rect(doc, M, y, CW, 0, P.grayLight);
    txt(doc, term.n, M + 2, y + 3.8, 8, P.blue, "bold");
    const extra = txt(doc, term.t, M + 9, y + 3.8, 8, P.black, "normal", CW - 10);
    y += 7 + extra;
  });

  y += 4;

  // ════════════════════════════════════════════════════════════
  // SIGNATURES
  // ════════════════════════════════════════════════════════════
  if (y > 238) { doc.addPage(); y = M + 5; }

  y = sectionHead(doc, "✍️  DIGITAL SIGNATURES", y);

  const sigW = (CW - 4) / 2;
  const sigH = 32;

  // Landlord sig box
  rect(doc, M, y, sigW, sigH, P.bluePale, 2);
  rect(doc, M, y, sigW, 1.5, P.blue, 0);
  txt(doc, "LANDLORD SIGNATURE", M + 4, y + 6.5, 7, P.blue, "bold");
  line(doc, M + 4, y + 20, M + sigW - 4, y + 20, P.border, 0.5);
  monoTxt(doc, data.landlordWallet, M + 4, y + 17, 6, P.blue, sigW - 8);
  txt(doc, data.landlordName, M + 4, y + 25, 8, P.black, "bold");
  txt(doc, "Landlord", M + 4, y + 30, 7, P.gray);

  // Tenant sig box
  const tsx = M + sigW + 4;
  rect(doc, tsx, y, sigW, sigH, P.greenLight, 2);
  rect(doc, tsx, y, sigW, 1.5, P.green, 0);
  txt(doc, "TENANT SIGNATURE", tsx + 4, y + 6.5, 7, P.green, "bold");
  line(doc, tsx + 4, y + 20, tsx + sigW - 4, y + 20, P.border, 0.5);
  monoTxt(doc, data.tenantWallet, tsx + 4, y + 17, 6, P.green, sigW - 8);
  txt(doc, data.tenantName, tsx + 4, y + 25, 8, P.black, "bold");
  txt(doc, "Tenant", tsx + 4, y + 30, 7, P.gray);

  y += sigH + 8;

  // ════════════════════════════════════════════════════════════
  // FOOTER
  // ════════════════════════════════════════════════════════════
  const footerY = 282;
  rect(doc, 0, footerY, W, 15, P.navy, 0);
  rect(doc, 0, footerY, W, 1, P.blue, 0);

  txt(doc, "RentalChain  •  Decentralized Rental Platform  •  Don Bosco Institute of Technology, Mumbai", M, footerY + 5.5, 7, P.blueLight);
  txt(doc, "This document is auto-generated. The Ethereum blockchain record is the sole authoritative source.", M, footerY + 10, 6.5, P.gray);
  txt(doc, "Powered by Ethereum Blockchain", W - M - 45, footerY + 5.5, 7, P.blueLight, "italic");
  txt(doc, `Generated ${new Date().toLocaleDateString("en-IN")}`, W - M - 35, footerY + 10, 6.5, P.gray);

  // ── Save ──
  const filename = `RentalAgreement_${data.propertyTitle.replace(/\s+/g, "_").slice(0, 20)}_${data.tenantName.replace(/\s+/g, "_")}_${new Date().toISOString().slice(0, 10)}.pdf`;
  doc.save(filename);
}