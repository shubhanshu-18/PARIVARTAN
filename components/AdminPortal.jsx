import React from "react";
import { AdminDashboard } from "./AdminDashboard";
import { AdminLogin } from "./AdminLogin";
import { useAuth } from "../context/AuthContext";

export function AdminPortal() {
  const { adminUser, adminLoading } = useAuth();
  if (adminLoading) {
    return (
      <main className="min-h-screen bg-slate-100 flex items-center justify-center text-sm text-slate-600">
        Checking administrator session...
      </main>
    );
  }
  return adminUser?.role === "admin" ? <AdminDashboard /> : <AdminLogin />;
}
