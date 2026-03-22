import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center px-4">
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-blue-600/10 rounded-full blur-3xl" />
      </div>
      <div className="text-center relative z-10">
        <p className="text-9xl font-black text-white/5 mb-0 leading-none">
          404
        </p>
        <div className="-mt-8">
          <p className="text-8xl mb-6">🏚️</p>
          <h1 className="text-4xl font-black text-white mb-4">
            Page Not Found
          </h1>
          <p className="text-gray-400 text-lg mb-8 max-w-md mx-auto">
            The page you are looking for doesn't exist or has been moved.
          </p>
          <div className="flex gap-4 justify-center">
            <Button
              onClick={() => navigate("/")}
              className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-3 rounded-xl text-lg"
            >
              Go Home
            </Button>
            <Button
              onClick={() => navigate("/properties")}
              className="bg-white/10 hover:bg-white/20 text-white px-8 py-3 rounded-xl text-lg"
            >
              Browse Properties
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}