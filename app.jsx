import React from "react";
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
import { SchemeRouterView } from "./components/SchemeRouterView";
import { FeasibilityReportView } from "./components/FeasibilityReportView";
import { AdminDashboard } from "./components/AdminDashboard";
import { AdminPortal } from "./components/AdminPortal";
import { Shield } from "lucide-react";

function AppContent() {
  const { activeStep, toast } = useApp();
  const { isOfficer } = useAuth();
  const isAdminRoute = window.location.pathname.startsWith("/admin");

  return (
    <div className="min-h-screen flex flex-col bg-slate-100 text-slate-900 selection:bg-orange-500 selection:text-white relative">
      {isAdminRoute ? (
        <AdminPortal />
      ) : (
        <>
          <Navbar />
          <OfflineNotice />
          <ConsentModal />
        </>
      )}

      {/* Floating Global Toast Notification */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 animate-bounce-short">
          <div
            className={`px-4 py-3 rounded-2xl shadow-xl border text-xs font-semibold flex items-center space-x-2 text-white ${
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

      {!isAdminRoute && <main className="flex-1 pb-16">
        {isOfficer ? (
          <AdminDashboard />
        ) : (
          <>
            <StepWizard />
            <div className="mt-4">
              {activeStep === 1 && <OnboardingForm />}
              {activeStep === 2 && <MarketIntelView />}
              {activeStep === 3 && <AdvisoryView />}
              {activeStep === 4 && <FinancialCalculatorView />}
              {activeStep === 5 && <SchemeRouterView />}
              {activeStep === 6 && <FeasibilityReportView />}
            </div>
          </>
        )}
      </main>}

      {!isAdminRoute && <footer className="bg-slate-900 border-t border-slate-800 text-slate-400 py-8 px-4 text-xs">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
          <div>
            <p className="font-bold text-slate-200">
              Parivartan (परिवर्तन) — AI-Driven Hyper-Local Business Advisory &
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
      </footer>}
    </div>
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
