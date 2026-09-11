import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useMemo,
  useCallback,
} from "react";
import { ApiService } from "../services/api";

const AppContext = createContext(null);

const DEFAULT_PROFILE = {
  applicantName: "",
  businessIdea: "",
  businessCategory: "dairy",
  state: "Madhya Pradesh",
  district: "Sehore",
  village: "Ashta Mandi Road",
  lat: null,
  lng: null,
  capitalAvailable: "",
  expectedInvestment: "",
  preferredLanguage: "hi",
  beneficiaryCategory: "OBC",
  gender: "female",
  experience: "beginner",
  isFirstTimeEntrepreneur: true,
  estimatedMonthlyRevenue: "",
  estimatedMonthlyOpex: "",
  promoterSharePercent: 10,
  annualInterestRate: 5.0,
  tenureMonths: 36,
  moratoriumMonths: 3,
  subsidyPercent: 15,
};

export function AppProvider({ children }) {
  const [activeStep, setActiveStep] = useState(1);
  const [language, setLanguage] = useState("hi");
  const [consentGiven, setConsentGiven] = useState(
    () => localStorage.getItem("parivartan-consent") === "true",
  );
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [toast, setToast] = useState(null);

  const [profile, setProfile] = useState(DEFAULT_PROFILE);
  const [marketData, setMarketData] = useState(null);
  const [advisory, setAdvisory] = useState(null);
  const [financials, setFinancials] = useState(null);
  const [matchedSchemes, setMatchedSchemes] = useState([]);
  const [savedAssessmentId, setSavedAssessmentId] = useState(null);

  // Network monitor
  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  const showToast = useCallback((message, type = "info") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  }, []);

  // Compute all engines in parallel for high speed
  const runAssessmentPipeline = useCallback(
    async (customProfile = null) => {
      setIsLoading(true);
      const currentProfile = customProfile || profile;

      try {
        // 1. Market intelligence
        let intel;
        try {
          intel = await ApiService.getMarketIntelligence(
            currentProfile.lat,
            currentProfile.lng,
            currentProfile.businessCategory,
            5,
          );
        } catch (marketError) {
          console.warn("Market data unavailable:", marketError.message);
          intel = {
            dataMode: "unavailable",
            nearbyCompetitors: [],
            dataSources: [],
            error: marketError.message,
          };
          showToast("Live market data is unavailable; no competitor data was substituted.", "warning");
        }
        setMarketData(intel);

        // 2. AI Advisory
        const adv = await ApiService.getAdvisory(currentProfile, intel);
        setAdvisory(adv);

        // 3. Scheme matching
        const schemes = await ApiService.matchSchemes(currentProfile);
        setMatchedSchemes(schemes);

        // 4. Financial engine
        const bestScheme = schemes[0] || {};
        const fin = await ApiService.calculateFinancials({
          projectCost: currentProfile.expectedInvestment,
          promoterSharePercent: currentProfile.promoterSharePercent || 10,
          annualInterestRate:
            currentProfile.annualInterestRate || bestScheme.interestRate || 5.0,
          tenureMonths:
            currentProfile.tenureMonths || bestScheme.maxTenureMonths || 36,
          moratoriumMonths:
            currentProfile.moratoriumMonths || bestScheme.moratoriumMonths || 3,
          subsidyPercent:
            currentProfile.subsidyPercent || bestScheme.subsidyPercent || 15,
          estimatedMonthlyRevenue: currentProfile.estimatedMonthlyRevenue,
          estimatedMonthlyOpex: currentProfile.estimatedMonthlyOpex,
        });
        setFinancials(fin);

        return { intel, adv, schemes, fin };
      } catch (err) {
        console.error("Pipeline error:", err);
        showToast(err.message || "Assessment could not be completed.", "error");
      } finally {
        setIsLoading(false);
      }
    },
    [profile, showToast],
  );

  const updateProfile = useCallback((fields) => {
    setProfile((prev) => ({ ...prev, ...fields }));
  }, []);

  const resetAll = useCallback(() => {
    setProfile(DEFAULT_PROFILE);
    setActiveStep(1);
    runAssessmentPipeline(DEFAULT_PROFILE);
    showToast("Assessment form reset", "info");
  }, [runAssessmentPipeline, showToast]);

  const value = useMemo(
    () => ({
      activeStep,
      setActiveStep,
      language,
      setLanguage,
      consentGiven,
      setConsentGiven,
      isOffline,
      isListening,
      setIsListening,
      isSpeaking,
      setIsSpeaking,
      isLoading,
      toast,
      showToast,
      profile,
      updateProfile,
      marketData,
      setMarketData,
      advisory,
      setAdvisory,
      financials,
      setFinancials,
      matchedSchemes,
      setMatchedSchemes,
      savedAssessmentId,
      setSavedAssessmentId,
      runAssessmentPipeline,
      resetAll,
    }),
    [
      activeStep,
      language,
      consentGiven,
      isOffline,
      isListening,
      isSpeaking,
      isLoading,
      toast,
      showToast,
      profile,
      updateProfile,
      marketData,
      advisory,
      financials,
      matchedSchemes,
      savedAssessmentId,
      runAssessmentPipeline,
      resetAll,
    ],
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) throw new Error("useApp must be used within an AppProvider");
  return context;
}
