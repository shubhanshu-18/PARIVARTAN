import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useMemo,
} from "react";
import { ApiService } from "../services/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [isOfficer, setIsOfficer] = useState(false);
  const [officer, setOfficer] = useState(null);
  const [loginError, setLoginError] = useState("");
  const [adminUser, setAdminUser] = useState(null);
  const [adminLoading, setAdminLoading] = useState(true);
  const [adminError, setAdminError] = useState("");

  useEffect(() => {
    ApiService.getAdminMe()
      .then((session) => {
        if (session.authenticated && session.user?.role === "admin") {
          setAdminUser(session.user);
        }
      })
      .catch(() => {
        setAdminUser(null);
      })
      .finally(() => setAdminLoading(false));
  }, []);

  const loginAdmin = async (email, password) => {
    setAdminError("");
    try {
      const result = await ApiService.loginAdmin(email, password);
      setAdminUser(result.user);
      return true;
    } catch {
      setAdminError("Invalid email or password.");
      return false;
    }
  };

  const logoutAdmin = async () => {
    await ApiService.logoutAdmin();
    setAdminUser(null);
  };

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
      adminUser,
      adminLoading,
      adminError,
      loginAdmin,
      logoutAdmin,
    }),
    [isOfficer, officer, loginError, adminUser, adminLoading, adminError],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
}
