import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Home, Search, MapPin, AlertCircle, Building2 } from "lucide-react";

export default function NotFound() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#06060a] flex items-center justify-center px-6 overflow-hidden relative">
      
      {/* ── BACKGROUND ANIMATIONS ─────────────────────────────────────────── */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-purple-600/20 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-blue-600/20 rounded-full blur-[120px] animate-pulse delay-700" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[30%] h-[30%] bg-violet-600/10 rounded-full blur-[100px]" />
        
        {/* GRID OVERLAY */}
        <div 
          className="absolute inset-0 opacity-[0.05]"
          style={{
            backgroundImage: `linear-gradient(rgba(255,255,255,0.3) 1px, transparent 1px), 
                              linear-gradient(90deg, rgba(255,255,255,0.3) 1px, transparent 1px)`,
            backgroundSize: "40px 40px",
            maskImage: "radial-gradient(ellipse at center, black, transparent 80%)"
          }}
        />
      </div>

      <div className="relative z-10 max-w-2xl w-full text-center">
        
        {/* ── 404 VISUAL ─────────────────────────────────────────────────── */}
        <div className="relative mb-8 group">
          <div className="absolute inset-0 bg-purple-500/20 blur-3xl rounded-full scale-75 group-hover:scale-100 transition-transform duration-700" />
          <h1 className="text-[12rem] md:text-[16rem] font-black leading-none tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-white/20 via-white/5 to-transparent select-none">
            404
          </h1>
          
          {/* FLOATING ICON */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center">
            <div className="relative">
              <div className="absolute inset-0 bg-purple-500 blur-xl opacity-50 animate-pulse" />
              <div className="relative bg-white/5 border border-white/20 p-6 rounded-3xl backdrop-blur-xl shadow-2xl animate-bounce duration-[3000ms]">
                <Building2 className="w-16 h-16 text-purple-400" strokeWidth={1.5} />
              </div>
            </div>
          </div>
        </div>

        {/* ── CONTENT ────────────────────────────────────────────────────── */}
        <div className="space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-bold uppercase tracking-wider mb-2">
            <AlertCircle className="w-3 h-3" />
            Address Not Found
          </div>

          <h2 className="text-4xl md:text-5xl font-bold text-white tracking-tight">
            Lost in the <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-400">Blockchain?</span>
          </h2>

          <p className="text-purple-200/60 text-lg md:text-xl max-w-lg mx-auto leading-relaxed">
            The property or page you're searching for seems to have disconnected from our network. Let's get you back on track.
          </p>

          {/* ── ACTIONS ────────────────────────────────────────────────────── */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Button
              onClick={() => navigate("/")}
              className="group relative h-14 px-8 rounded-2xl bg-gradient-to-r from-purple-600 to-violet-700 hover:from-purple-500 hover:to-violet-600 text-white font-bold text-lg shadow-[0_0_20px_rgba(147,51,234,0.3)] hover:shadow-[0_0_30px_rgba(147,51,234,0.5)] transition-all duration-300 w-full sm:w-auto overflow-hidden"
            >
              <div className="absolute inset-0 bg-white/10 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-500 skew-x-12" />
              <Home className="w-5 h-5 mr-3 group-hover:scale-110 transition-transform" />
              Return Home
            </Button>

            <Button
              onClick={() => navigate("/properties")}
              variant="outline"
              className="h-14 px-8 rounded-2xl border-white/10 bg-white/5 hover:bg-white/10 text-white font-bold text-lg backdrop-blur-md transition-all duration-300 w-full sm:w-auto hover:border-white/30"
            >
              <Search className="w-5 h-5 mr-3 text-purple-400" />
              Find Properties
            </Button>
          </div>
        </div>

        {/* ── DECORATIVE ELEMENTS ────────────────────────────────────────── */}
        <div className="mt-16 flex items-center justify-center gap-12 text-white/20">
          <div className="flex flex-col items-center gap-2">
            <MapPin className="w-5 h-5" />
            <span className="text-[10px] uppercase tracking-[0.2em]">Geo-Locked</span>
          </div>
          <div className="w-px h-8 bg-white/10" />
          <div className="flex flex-col items-center gap-2">
            <Search className="w-5 h-5" />
            <span className="text-[10px] uppercase tracking-[0.2em]">Verified Assets</span>
          </div>
        </div>

      </div>

      {/* FLOATING PARTICLES (DECORATIVE) */}
      <div className="absolute top-1/4 right-1/4 w-2 h-2 bg-blue-400/30 rounded-full animate-ping" />
      <div className="absolute bottom-1/3 left-1/5 w-1 h-1 bg-purple-400/30 rounded-full animate-ping delay-500" />
      <div className="absolute top-2/3 right-1/10 w-3 h-3 bg-violet-400/20 rounded-full animate-ping delay-1000" />
    </div>
  );
}