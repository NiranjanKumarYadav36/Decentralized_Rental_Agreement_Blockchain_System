import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";

export default function Navbar() {
  const navigate = useNavigate();
  const { user } = useAuth();

  return (
    <nav className="sticky top-0 z-50 flex items-center justify-between px-8 py-4 border-b border-white/5 bg-[#0a0a0f]/80 backdrop-blur-md">
      <button
        onClick={() => navigate("/")}
        className="flex items-center gap-2 cursor-pointer group"
      >
        <span className="text-2xl group-hover:scale-110 transition-transform duration-200">🏠</span>
        <span className="text-xl font-bold text-white tracking-tight">RentalChain</span>
      </button>

      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate("/properties")}
          className="text-purple-300 hover:text-white transition-colors duration-200 text-sm font-medium"
        >
          Browse Properties
        </button>

        {user ? (
          <Button
            onClick={() => navigate(
              user.role === "landlord" ? "/dashboard/landlord" : "/dashboard/tenant"
            )}
            className="bg-purple-600 hover:bg-purple-700 text-white rounded-xl px-6 transition-all duration-200"
          >
            Dashboard
          </Button>
        ) : (
          <div className="flex gap-3">
            <Button
              variant="ghost"
              onClick={() => navigate("/login")}
              className="border border-white/15 hover:border-white/30 hover:bg-white/10 text-white rounded-xl px-6 transition-all duration-200"
            >
              Login
            </Button>
            <Button
              onClick={() => navigate("/register")}
              className="bg-purple-600 hover:bg-purple-700 text-white rounded-xl px-6 shadow-lg shadow-purple-900/40 transition-all duration-200"
            >
              Get Started
            </Button>
          </div>
        )}
      </div>
    </nav>
  );
}