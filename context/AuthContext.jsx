import React, { createContext, useContext, useState, useMemo, useEffect } from "react";
import { ApiService } from "../services/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [admin, setAdmin] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [loginError, setLoginError] = useState("");

  useEffect(() => {
    ApiService.getAdmin()
      .then(setAdmin)
      .catch(() => setAdmin(null))
      .finally(() => setAuthLoading(false));
  }, []);

  const loginAdmin = async (email, password) => {
    setLoginError("");
    try {
      const result = await ApiService.adminLogin(email, password);
      setAdmin(result.admin);
      return true;
    } catch (error) {
      setLoginError(error.message);
      return false;
    }
  };

  const logoutAdmin = async () => {
    await ApiService.adminLogout();
    setAdmin(null);
    setLoginError("");
  };

  const value = useMemo(
    () => ({
      isOfficer: Boolean(admin),
      officer: admin,
      officerName: admin?.name || "",
      officerId: admin?.id || "",
      admin,
      authLoading,
      loginError,
      loginAdmin,
      logoutAdmin,
      logoutOfficer: logoutAdmin,
    }),
    [admin, authLoading, loginError],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
}
