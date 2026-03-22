/* eslint-disable @typescript-eslint/no-explicit-any */
import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import Login from "@/pages/Login";
import Register from "@/pages/Register";
import Properties from "@/pages/Properties";

const ProtectedRoute = ({ children }: any) => {
  const { user } = useAuth();
  return user ? children : <Navigate to="/login" />;
};

export default function RentalDApp() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/properties" />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/properties" element={<Properties />} />
      
      <Route
        path="/dashboard/landlord"
        element={
          <ProtectedRoute>
            <RentalDApp />
          </ProtectedRoute>
        }
      />
      <Route
        path="/dashboard/tenant"
        element={
          <ProtectedRoute>
            <RentalDApp />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}