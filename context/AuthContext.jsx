import React, { createContext, useContext, useState, useMemo, useEffect } from "react";
import { ApiService } from "../services/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [admin, setAdmin] = useState(null);
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [loginError, setLoginError] = useState("");

  useEffect(() => {
    Promise.all([ApiService.getAdmin(), ApiService.getUser()])
      .then(([adminAccount, userAccount]) => { setAdmin(adminAccount); setUser(userAccount); })
      .catch(() => { setAdmin(null); setUser(null); })
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
    try {
      await ApiService.adminLogout();
    } finally {
      setAdmin(null);
      setLoginError("");
      window.location.assign("/");
    }
  };
  const loginUser = async (email, password) => { const result = await ApiService.userLogin(email, password); setUser(result.user); return result.user; };
  const registerUser = async (name, email, password) => { const result = await ApiService.userRegister(name, email, password); setUser(result.user); return result.user; };
  const logoutUser = async () => { try { await ApiService.userLogout(); } finally { setUser(null); window.location.assign("/"); } };

  const value = useMemo(
    () => ({
      isOfficer: Boolean(admin),
      officer: admin,
      officerName: admin?.name || "",
      officerId: admin?.id || "",
      admin,
      user,
      isUser: Boolean(user),
      authLoading,
      loginError,
      loginAdmin,
      logoutAdmin,
      logoutOfficer: logoutAdmin,
      loginUser,
      registerUser,
      logoutUser,
    }),
    [admin, user, authLoading, loginError],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
}
