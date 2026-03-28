import { ShieldCheck, ShieldAlert } from "lucide-react";

interface ZkBadgeProps {
  verified: boolean;
  size?: "sm" | "md" | "lg";
  showText?: boolean;
}

export default function ZkBadge({ verified, size = "md", showText = false }: ZkBadgeProps) {
  const iconSize = size === "sm" ? "h-3 w-3" : size === "lg" ? "h-6 w-6" : "h-4 w-4";
  
  return (
    <div 
      title={verified ? "Identity verified via ZK-Proof" : "Identity not verified"}
      className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full transition-all duration-300 ${
        verified 
          ? "bg-purple-500/10 border border-purple-500/30 text-purple-400 shadow-[0_0_10px_rgba(168,85,247,0.2)]" 
          : "bg-slate-500/10 border border-slate-500/20 text-slate-400"
      }`}
    >
      {verified ? (
        <ShieldCheck className={iconSize} />
      ) : (
        <ShieldAlert className={iconSize} />
      )}
      {showText && (
        <span className="text-[10px] font-bold uppercase tracking-wider">
          {verified ? "ZK-Verified" : "Unverified"}
        </span>
      )}
    </div>
  );
}
