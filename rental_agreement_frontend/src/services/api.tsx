/* eslint-disable @typescript-eslint/no-explicit-any */
import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:5000/api"
});

// Add token to every request automatically
API.interceptors.request.use((config) => {
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  if (user.token) {
    config.headers.Authorization = `Bearer ${user.token}`;
  }
  return config;
});

// Auth APIs
export const registerUser = (data: any) => API.post("/auth/register", data);
export const loginUser = (data: any) => API.post("/auth/login", data);
export const getProfile = () => API.get("/auth/profile");
export const updateWallet = (data: any) => API.put("/auth/wallet", data);

// Property APIs
export const getProperties = (filters: any) => API.get("/properties", { params: filters });
export const getProperty = (id: any) => API.get(`/properties/${id}`);
export const addProperty = (data: any) => API.post("/properties", data);
export const getMyProperties = () => API.get("/properties/my");
export const updateProperty = (id: any, data: any) => API.put(`/properties/${id}`, data);
export const deleteProperty = (id: any) => API.delete(`/properties/${id}`);

// Agreement APIs
export const requestAgreement = (data: any) =>
  API.post("/agreements/request", data);

export const getTenantAgreements = () =>
  API.get("/agreements/my");

export const getLandlordAgreements = () =>
  API.get("/agreements/requests");

export const approveAgreement = (id: any, data: any) =>
  API.put(`/agreements/${id}/approve`, data);

export const updateAgreementStatus = (id: any, data: any) =>
  API.put(`/agreements/${id}/status`, data);

export const getAgreement = (id: any) =>
  API.get(`/agreements/${id}`);


// Admin APIs
export const getAllUsers         = ()         => API.get("/admin/users");
export const deactivateUser      = (id: any, data: any) => API.put(`/admin/users/${id}`, data);
export const getAllProperties     = ()         => API.get("/admin/properties");
export const adminDeleteProperty = (id: any)       => API.delete(`/admin/properties/${id}`);
export const getAllAgreements     = ()         => API.get("/admin/agreements");
export const getPlatformStats    = ()         => API.get("/admin/stats");