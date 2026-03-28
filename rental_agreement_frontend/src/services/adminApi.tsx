/* eslint-disable @typescript-eslint/no-explicit-any */
import axios from "axios";

const ADMIN_API = axios.create({
  baseURL: "http://localhost:5000/api/admin",
});

// Inject admin token on every request
ADMIN_API.interceptors.request.use((config) => {
  const adminUser = JSON.parse(localStorage.getItem("adminUser") || "{}");
  if (adminUser.token) {
    config.headers.Authorization = `Bearer ${adminUser.token}`;
  }
  return config;
});

// Auth
export const adminLoginApi   = (data: any) => ADMIN_API.post("/login", data);
export const getAdminProfile = ()           => ADMIN_API.get("/me");

// Stats
export const getPlatformStats = () => ADMIN_API.get("/stats");

// Users
export const getAllUsers      = (params?: any) => ADMIN_API.get("/users", { params });
export const toggleUserStatus = (id: string, data: any) => ADMIN_API.put(`/users/${id}/status`, data);

// Properties
export const getAllPropertiesAdmin = (params?: any) => ADMIN_API.get("/properties", { params });
export const deletePropertyAdmin   = (id: string)   => ADMIN_API.delete(`/properties/${id}`);

// Agreements
export const getAllAgreementsAdmin = (params?: any) => ADMIN_API.get("/agreements", { params });

// Disputes
export const getActiveDisputes     = ()              => ADMIN_API.get("/disputes");
export const resolveDisputeAdmin   = (id: string)   => ADMIN_API.put(`/agreements/${id}/resolve-dispute`, {});
