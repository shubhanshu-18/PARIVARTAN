import React, { useState } from "react";
import { useApp } from "./context/AppContext";
import { useAuth } from "./context/AuthContext";
import { AppProvider } from "./context/AppContext";
import { AuthProvider } from "./context/AuthContext";
import { Navbar } from "./components/Navbar";
import { ConsentModal } from "./components/ConsentModal";
import { OfflineNotice } from "./components/OfflineNotice";
import { StepWizard } from "./components/StepWizard";
import { OnboardingForm } from "./components/OnboardingForm";
import { MarketIntelView } from "./components/MarketIntelView";
import { AdvisoryView } from "./components/AdvisoryView";
import { FinancialCalculatorView } from "./components/FinancialCalculatorView";
import { SupplierDiscoveryView } from "./components/SupplierDiscoveryView";
import { FeedbackView } from "./components/FeedbackView";
import { SchemeRouterView } from "./components/SchemeRouterView";
import { FeasibilityReportView } from "./components/FeasibilityReportView";
import { AdminDashboard } from "./components/AdminDashboard";
import { AdminLogin } from "./components/AdminLogin";
import { WelcomeSplash } from "./components/WelcomeSplash";
import { WelcomeLogin } from "./components/WelcomeLogin";
import { AuthPortalLanding } from "./components/AuthPortalLanding";
import { Shield } from "lucide-react";

function AppContent() {
  const { activeStep, toast } = useApp();
  const { isOfficer, isUser, authLoading } = useAuth();
  const [authView, setAuthView] = useState("portal"); // "portal" | "user" | "admin"

  const isAdminPath = window.location.pathname.startsWith("/admin");
  const isAuthPath =
    window.location.pathname === "/login" ||
    window.location.pathname === "/signup";

  // Show neutral loading state while session is being verified
  if (authLoading) {
    return (
      <div className="min-h-screen bg-[#F7F9F7] flex items-center justify-center text-xs font-semibold text-[#667085]">
        Verifying secure session…
      </div>
    );
  }

  // 1. OFFICER / ADMIN ROUTING & GATING
  if (isOfficer) {
    if (window.location.pathname === "/admin/login") {
      window.location.replace("/admin/dashboard");
      return null;
    }
    return <AdminDashboard />;
  }

  // If unauthenticated visitor explicitly visits /admin or /admin/dashboard
  if (isAdminPath) {
    return (
      <AdminLogin
        onBack={() => {
          window.location.assign("/");
        }}
      />
    );
  }

  // 2. NORMAL USER APPLICATION
  if (isUser) {
    if (isAuthPath) {
      window.location.replace("/");
      return null;
    }
    if (window.location.pathname === "/feedback") {
      return (
        <div className="app-shell min-h-screen bg-slate-100 text-slate-900">
          <Navbar />
          <FeedbackView />
        </div>
      );
    }

    return (
      <div className="app-shell min-h-screen flex flex-col bg-slate-100 text-slate-900 selection:bg-orange-500 selection:text-white relative">
        <WelcomeSplash />
        <Navbar />
        <OfflineNotice />
        <ConsentModal />

        {/* Floating Global Toast Notification */}
        {toast && (
          <div
            className="global-toast fixed bottom-6 right-6 z-50 animate-bounce-short"
            role="status"
            aria-live="polite"
          >
            <div
              className={`toast-card px-4 py-3 rounded-2xl shadow-xl border text-xs font-semibold flex items-center space-x-2 text-white ${
                toast.type === "success"
                  ? "bg-emerald-700 border-emerald-600"
                  : toast.type === "error"
                    ? "bg-red-700 border-red-600"
                    : toast.type === "warning"
                      ? "bg-amber-700 border-amber-600"
                      : "bg-blue-700 border-blue-600"
              }`}
            >
              <span>{toast.message}</span>
            </div>
          </div>
        )}

        <main className="flex-1 pb-16">
          <StepWizard />
          <div key={activeStep} className="page-stage mt-4">
            {activeStep === 1 && <OnboardingForm />}
            {activeStep === 2 && <MarketIntelView />}
            {activeStep === 3 && <AdvisoryView />}
            {activeStep === 4 && (
              <>
                <FinancialCalculatorView />
                <SupplierDiscoveryView />
              </>
            )}
            {activeStep === 5 && <SchemeRouterView />}
            {activeStep === 6 && <FeasibilityReportView />}
          </div>
        </main>

        <footer className="bg-slate-900 border-t border-slate-800 text-slate-400 py-8 px-4 text-xs">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
            <div>
              <p className="font-bold text-slate-200">
                Gram Sarthi AI — AI-Driven Hyper-Local Business Advisory &
                Financial Structuring
              </p>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Smart India Hackathon 2026 | Problem Statement ID: 26091 |
                Ministry of Social Justice and Empowerment
              </p>
            </div>
            <span className="flex items-center space-x-1 text-emerald-400">
              <Shield className="w-3.5 h-3.5" />
              <span>NBCFDC • NSFDC • NSKFDC • PMEGP Verified</span>
            </span>
          </div>
        </footer>
      </div>
    );
  }

  // 3. UNAUTHENTICATED VISITOR PORTAL & AUTHENTICATION ENTRY FLOW
  if (isAuthPath || authView === "user") {
    return (
      <WelcomeLogin
        key={window.location.pathname}
        onBack={() => setAuthView("portal")}
      />
    );
  }

  if (authView === "admin") {
    return (
      <AdminLogin
        onBack={() => {
          setAuthView("portal");
        }}
      />
    );
  }

  // Default: Choose Your Portal Landing Experience (User Login vs Admin / Officer Login)
  return (
    <AuthPortalLanding
      onSelectUser={() => setAuthView("user")}
      onSelectAdmin={() => setAuthView("admin")}
    />
  );
}

export function App() {
  return (
    <AuthProvider>
      <AppProvider>
        <AppContent />
      </AppProvider>
    </AuthProvider>
  );
}

export default App;
