/* eslint-disable @typescript-eslint/no-explicit-any */
import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { useAdminAuth } from "@/context/AdminAuthContext";

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: string[];
}

/**
 * ProtectedRoute for Landlords and Tenants
 */
export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, allowedRoles }) => {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // Redirect to their own dashboard if they try to access another role's dashboard
    const dashboardPath = user.role === "landlord" ? "/dashboard/landlord" : "/dashboard/tenant";
    return <Navigate to={dashboardPath} replace />;
  }

  return <>{children}</>;
};

/**
 * AdminRoute for Administrators
 */
export const AdminRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { admin } = useAdminAuth();

  if (!admin) {
    return <Navigate to="/admin/login" replace />;
  }

  return <>{children}</>;
};

/**
 * PublicRoute to redirect authenticated users away from login/register pages
 */
export const PublicRoute: React.FC<{ children: React.ReactNode; type?: "user" | "admin" }> = ({ 
  children, 
  type = "user" 
}) => {
  const { user } = useAuth();
  const { admin } = useAdminAuth();

  if (type === "admin") {
    if (admin) {
      return <Navigate to="/admin/dashboard" replace />;
    }
  } else {
    if (user) {
      const dashboardPath = user.role === "landlord" ? "/dashboard/landlord" : "/dashboard/tenant";
      return <Navigate to={dashboardPath} replace />;
    }
  }

  return <>{children}</>;
};
