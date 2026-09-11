import React, { createContext, useContext, useState, useMemo } from "react";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [isOfficer, setIsOfficer] = useState(false);
  const [officer, setOfficer] = useState(null);
  const [loginError, setLoginError] = useState("");

  const loginOfficer = (username, password) => {
    setLoginError("");
    // Demo officer credentials
    if (
      (username === "officer" || username === "admin") &&
      (password === "demo123" || password === "sih2026" || password === "admin")
    ) {
      const officerData = {
        id: "OFFICER-MP-2026-08",
        name: "Priya Sharma",
        designation: "General Manager, District Industries Centre (DIC)",
        department: "Ministry of Social Justice & Empowerment / MP MSME",
        jurisdiction: "Sehore & Bhopal Districts",
      };
      setIsOfficer(true);
      setOfficer(officerData);
      return true;
    } else {
      setLoginError(
        "Invalid demo credentials. Use username: officer, password: demo123",
      );
      return false;
    }
  };

  const logoutOfficer = () => {
    setIsOfficer(false);
    setOfficer(null);
    setLoginError("");
  };

  const value = useMemo(
    () => ({
      isOfficer,
      setIsOfficer,
      officer,
      loginError,
      loginOfficer,
      logoutOfficer,
    }),
    [isOfficer, officer, loginError],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
}
