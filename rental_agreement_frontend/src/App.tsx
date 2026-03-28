/* eslint-disable @typescript-eslint/no-explicit-any */
import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import Login from "@/pages/Login";
import Register from "@/pages/Register";
import Properties from "@/pages/Properties";
import PropertyDetail from "@/pages/PropertyDetail";
import LandlordDashboard from "./pages/LandlordDashboard";
import TenantDashboard from "./pages/TenantDashboard";
import Landing from "./pages/Landing";
import NotFound from "./pages/NotFound";
import TransactionHistory from "./components/TransactionHistory";

const ProtectedRoute = ({ children }: any) => {
  const { user } = useAuth();
  return user ? children : <Navigate to="/login" />;
};

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="*" element={<NotFound />} />
      {/* <Route path="/" element={<Navigate to="/properties" />} /> */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/properties" element={<Properties />} />
      <Route path="/property/:id" element={<PropertyDetail />} />
      <Route
        path="/dashboard/landlord"
        element={
          <ProtectedRoute>
            <LandlordDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/dashboard/tenant"
        element={
          <ProtectedRoute>
            <TenantDashboard />
          </ProtectedRoute>
        }
      />
      <Route path="/transactions" element={<TransactionHistory />} />
    </Routes>
  );
}