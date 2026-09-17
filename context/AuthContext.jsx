import React, { createContext, useContext, useState, useMemo } from "react";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [isOfficer, setIsOfficer] = useState(false);
  const [officer, setOfficer] = useState(null);
  const [loginError, setLoginError] = useState("");

  const loginOfficer = () => {
    setLoginError("Officer login is disabled for this project.");
    setIsOfficer(false);
    setOfficer(null);
    return false;
  };

  const logoutOfficer = () => {
    setIsOfficer(false);
    setOfficer(null);
    setLoginError("");
  };

  const setOfficerAccess = (value) => {
    if (value === false) {
      setIsOfficer(false);
      setOfficer(null);
      setLoginError("");
      return;
    }

    setLoginError("Officer login is disabled for this project.");
    setIsOfficer(false);
    setOfficer(null);
  };

  const value = useMemo(
    () => ({
      isOfficer,
      setIsOfficer: setOfficerAccess,
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
