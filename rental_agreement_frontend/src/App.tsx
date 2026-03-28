/* eslint-disable @typescript-eslint/no-explicit-any */
import { Routes, Route } from "react-router-dom";
import Login from "@/pages/Login";
import Register from "@/pages/Register";
import Properties from "@/pages/Properties";
import PropertyDetail from "@/pages/PropertyDetail";
import LandlordDashboard from "./pages/LandlordDashboard";
import TenantDashboard from "./pages/TenantDashboard";
import Landing from "./pages/Landing";
import NotFound from "./pages/NotFound";
import TransactionHistory from "./components/TransactionHistory";
import AdminLogin from "./pages/AdminLogin";
import AdminDashboard from "./pages/AdminDashboard";
import { ProtectedRoute, AdminRoute, PublicRoute } from "./components/ProtectedRoute";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="*" element={<NotFound />} />

      {/* Public Routes with redirect if already logged in */}
      <Route
        path="/login"
        element={
          <PublicRoute>
            <Login />
          </PublicRoute>
        }
      />
      <Route
        path="/register"
        element={
          <PublicRoute>
            <Register />
          </PublicRoute>
        }
      />

      {/* Search and Viewing - Public*/}
      <Route path="/properties" element={<Properties />} />
      <Route path="/property/:id" element={<PropertyDetail />} />

      {/* User Dashboards - Protected by Role */}
      <Route
        path="/dashboard/landlord"
        element={
          <ProtectedRoute allowedRoles={["landlord"]}>
            <LandlordDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/dashboard/tenant"
        element={
          <ProtectedRoute allowedRoles={["tenant"]}>
            <TenantDashboard />
          </ProtectedRoute>
        }
      />

      {/* Other Protected User Routes */}
      <Route
        path="/transactions"
        element={
          <ProtectedRoute allowedRoles={["tenant", "landlord"]}>
            <TransactionHistory />
          </ProtectedRoute>
        }
      />

      {/* Admin Routes */}
      <Route
        path="/admin/login"
        element={
          <PublicRoute type="admin">
            <AdminLogin />
          </PublicRoute>
        }
      />
      <Route
        path="/admin/dashboard"
        element={
          <AdminRoute>
            <AdminDashboard />
          </AdminRoute>
        }
      />
    </Routes>
  );
}