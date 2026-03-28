/* eslint-disable @typescript-eslint/no-explicit-any */
import { createContext, useContext, useState } from "react";

const AdminAuthContext = createContext<any>(null);

export const AdminAuthProvider = ({ children }: any) => {
  const stored = localStorage.getItem("adminUser");
  const [admin, setAdmin] = useState<any>(stored ? JSON.parse(stored) : null);

  const adminLogin = (adminData: any) => {
    localStorage.setItem("adminUser", JSON.stringify(adminData));
    setAdmin(adminData);
  };

  const adminLogout = () => {
    localStorage.removeItem("adminUser");
    setAdmin(null);
  };

  return (
    <AdminAuthContext.Provider value={{ admin, adminLogin, adminLogout }}>
      {children}
    </AdminAuthContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useAdminAuth = () => useContext(AdminAuthContext);
