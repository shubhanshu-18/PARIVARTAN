import React, { useRef, useState } from "react";
import { useApp } from "../context/AppContext";
import {
  t,
  CATEGORIES,
  STATES_DISTRICTS,
  BENEFICIARY_CATEGORIES,
} from "../utils/translations";
import { SpeechHelper } from "../speech";
import { ApiService } from "../services/api";
import * as validation from "../utils/validation-client";
import {
  Building2,
  MapPin,
  IndianRupee,
  Users,
  Compass,
  Mic,
  MicOff,
  CheckCircle,
  AlertCircle,
  ArrowRight,
  Sparkles,
  HelpCircle,
  Briefcase,
} from "lucide-react";

const {
  lettersAndSpaces,
  locationText,
  digitsOnly,
  trimText,
  validateProfile,
} = validation;

export function OnboardingForm() {
  const {
    profile,
    updateProfile,
    setActiveStep,
    language,
    showToast,
    runAssessmentPipeline,
    isListening,
    setIsListening,
    location,
    setLocation,
  } = useApp();

  const [errors, setErrors] = useState({});
  const [gpsLoading, setGpsLoading] = useState(false);
  const [gpsSuccess, setGpsSuccess] = useState(false);
  const [locationMessage, setLocationMessage] = useState("");
  const locationRequestRef = useRef(0);

  const districtsForState = STATES_DISTRICTS[profile.state] || [];

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    let cleanedValue = value;
    // Allow typing letters and spaces without immediately stripping spaces mid-sentence
    if (name === "applicantName") cleanedValue = lettersAndSpaces(value);
    if (name === "village") cleanedValue = locationText(value);
    if (name === "expectedInvestment" || name === "capitalAvailable") {
      cleanedValue = digitsOnly(value);
    }
    if (name === "businessIdea") cleanedValue = trimText(value, 200);
    updateProfile({
      [name]: type === "checkbox" ? checked : cleanedValue,
    });
    if (name === "district") {
      setLocation(null);
      setGpsSuccess(false);
      setLocationMessage("");
    }
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  const handleInputBlur = (name) => {
    // Trim extra surrounding spaces on blur for clean submission
    if (name === "applicantName" && profile.applicantName) {
      const trimmed = profile.applicantName.replace(/\s+/g, " ").trim();
      updateProfile({ applicantName: trimmed });
    }
    const result = validateProfile(profile, { partial: true });
    if (result.errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: result.errors[name] }));
    }
  };

  const handleCategorySelect = (key) => {
    updateProfile({ businessCategory: key });
  };

  const handleStateChange = (e) => {
    const newState = e.target.value;
    updateProfile({
      state: newState,
      district: "",
      lat: null,
      lng: null,
    });
    setLocation(null);
    setGpsSuccess(false);
    setLocationMessage("");
  };

  const detectLocation = () => {
    if (!navigator.geolocation) {
      setLocationMessage(
        "This browser does not support location. Please select your location manually.",
      );
      showToast(
        "This browser does not support location. Please select your location manually.",
        "warning",
      );
      return;
    }

    const requestId = ++locationRequestRef.current;
    setGpsLoading(true);
    setGpsSuccess(false);
    setLocationMessage("Detecting your location...");
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        if (requestId !== locationRequestRef.current) return;
        const latitude = Number(pos.coords.latitude);
        const longitude = Number(pos.coords.longitude);
        if (
          !Number.isFinite(latitude) ||
          latitude < -90 ||
          latitude > 90 ||
          !Number.isFinite(longitude) ||
          longitude < -180 ||
          longitude > 180
        ) {
          setGpsLoading(false);
          setLocationMessage(
            "Unable to determine your location. Please select it manually.",
          );
          showToast(
            "Unable to determine your location. Please select your location manually.",
            "warning",
          );
          return;
        }
        const gpsLocation = {
          latitude,
          longitude,
          accuracy: Number.isFinite(pos.coords.accuracy)
            ? pos.coords.accuracy
            : null,
          source: "gps",
        };
        setLocation(gpsLocation);
        // Clear manual values before awaiting geocoding so they cannot be
        // displayed as if they were derived from the GPS reading.
        updateProfile({
          lat: latitude,
          lng: longitude,
          state: "",
          district: "",
          village: "",
        });
        setGpsLoading(false);
        setGpsSuccess(true);
        setLocationMessage("Location detected via GPS");
        showToast("Location detected via GPS", "success");
        try {
          const geocoded = await ApiService.reverseGeocode(latitude, longitude);
          if (requestId !== locationRequestRef.current) return;
          const normalize = (value) =>
            String(value || "")
              .toLowerCase()
              .replace(/district$/i, "")
              .replace(/[^a-z0-9]+/g, "");
          const stateMatch = Object.keys(STATES_DISTRICTS).find(
            (state) => normalize(state) === normalize(geocoded.state),
          );
          const districtMatch = stateMatch
            ? STATES_DISTRICTS[stateMatch].find(
                (district) =>
                  normalize(district) === normalize(geocoded.district),
              )
            : null;
          const locality =
            geocoded.locality ||
            geocoded.village ||
            geocoded.town ||
            geocoded.city ||
            geocoded.municipality ||
            geocoded.suburb ||
            geocoded.neighbourhood ||
            geocoded.district ||
            "";
          updateProfile({
            state: stateMatch || "",
            district: districtMatch || "",
            village: locality,
          });
          if (!stateMatch || !districtMatch || !locality) {
            setGpsSuccess(false);
            setLocationMessage(
              "Location captured accurately, but readable address could not be found.",
            );
          }
        } catch {
          if (requestId !== locationRequestRef.current) return;
          updateProfile({ state: "", district: "", village: "" });
          setGpsSuccess(false);
          setLocationMessage(
            "Location captured accurately, but readable address could not be found.",
          );
        }
      },
      (err) => {
        if (requestId !== locationRequestRef.current) return;
        setGpsLoading(false);
        const message =
          err.code === 1
            ? "Location permission denied. Please enable location access or select manually."
            : err.code === 3
              ? "Location request timed out. Please try again."
              : "Unable to determine your location. Please select your location manually.";
        setLocationMessage(message);
        showToast(message, "warning");
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 },
    );
  };

  const startVoiceDictation = () => {
    if (!SpeechHelper.isSpeechRecognitionSupported()) {
      showToast("Voice input requires Chrome, Edge or Safari", "warning");
      return;
    }

    setIsListening(true);
    showToast(
      language === "hi"
        ? "बोलिए... अपने व्यवसाय का विचार बताएं"
        : "Speak your business idea...",
      "info",
    );

    SpeechHelper.startListening({
      lang: language === "en" ? "en-IN" : "hi-IN",
      onResult: (text) => {
        setIsListening(false);
        updateProfile({ businessIdea: text });
        showToast(`Captured: "${text}"`, "success");
      },
      onError: (error) => {
        setIsListening(false);
        showToast(error, "error");
      },
      onEnd: () => setIsListening(false),
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationResult = validateProfile(profile);
    const newErrors = validationResult.errors;

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      showToast(
        language === "hi"
          ? "कृपया लाल रंग में चिन्हित त्रुटियां सुधारें"
          : "Please resolve form validation errors",
        "warning",
      );
      return;
    }

    updateProfile(validationResult.value);
    // Run assessment engine
    await runAssessmentPipeline(validationResult.value);
    setActiveStep(2);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const loanRequired = Math.max(
    0,
    (Number(profile.expectedInvestment) || 140000) -
      (Number(profile.capitalAvailable) || 14000),
  );
  const marginPercent =
    profile.expectedInvestment > 0
      ? Math.round(
          ((Number(profile.capitalAvailable) || 0) /
            Number(profile.expectedInvestment)) *
            100,
        )
      : 10;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-4 animate-in fade-in duration-300">
      {/* Header Banner */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5 sm:p-6 mb-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-govblue border border-blue-200 mb-2">
              <Sparkles className="w-3.5 h-3.5 text-blue-600" />
              <span>Step 1 of 6 • Micro-Enterprise Diagnostic</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-navy-900 tracking-tight">
              {t("form.title", language)}
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 mt-1">
              {t("form.subtitle", language)}
            </p>
          </div>

          <div className="hidden sm:block text-right">
            <span className="text-[11px] text-slate-500 font-medium block">
              MoSJE Mandate
            </span>
            <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded border border-emerald-200 inline-block mt-0.5">
              Targeted for NBCFDC / NSFDC / PMEGP
            </span>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* SECTION 1: BUSINESS IDEA & SECTOR */}
        <div className="bg-white rounded-xl shadow-subtle border border-[#DCE4E8] p-5 sm:p-6">
          <div className="flex items-center space-x-3 pb-3 mb-5 border-b border-[#DCE4E8]/70">
            <div className="w-8 h-8 rounded-lg bg-[#FFF7E6] text-[#F59E0B] border border-[#F59E0B]/20 flex items-center justify-center font-bold">
              <Building2 className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-[#17212B]">
                {language === "hi"
                  ? "1. व्यवसाय विचार एवं क्षेत्र"
                  : "1. Business Concept & Sector"}
              </h2>
              <p className="text-[11px] text-[#667085]">
                {language === "hi"
                  ? "आप क्या उत्पाद या सेवा शुरू करना चाहते हैं?"
                  : "What enterprise product or service do you intend to launch?"}
              </p>
            </div>
          </div>

          <div className="space-y-4">
            {/* Applicant Name */}
            <div>
              <label className="block text-xs font-bold text-[#17212B] mb-1.5">
                {t("form.applicantName", language)}{" "}
                <span className="text-[#DC2626]">*</span>
              </label>
              <input
                type="text"
                name="applicantName"
                value={profile.applicantName}
                onChange={handleInputChange}
                onBlur={() => handleInputBlur("applicantName")}
                placeholder={
                  language === "hi"
                    ? "उदा. सुनीता शर्मा / रमेश वर्मा"
                    : "e.g. Sunita Sharma"
                }
                className={`w-full px-3.5 py-2.5 text-xs rounded-lg border transition bg-white ${
                  errors.applicantName
                    ? "border-[#DC2626] bg-[#FEF2F2]/50 ring-1 ring-[#DC2626]/20"
                    : "border-[#DCE4E8] hover:border-slate-400 focus:border-[#123B5D]"
                } focus:outline-none focus:ring-2 focus:ring-[#123B5D]/15`}
              />
              {errors.applicantName && (
                <p className="text-[11px] text-[#DC2626] font-medium flex items-center space-x-1 mt-1.5">
                  <AlertCircle className="w-3.5 h-3.5" />
                  <span>{errors.applicantName}</span>
                </p>
              )}
            </div>

            {/* Business Idea with Voice Button */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-bold text-[#17212B] flex items-center space-x-1">
                  <span>{t("form.businessIdea", language)}</span>
                  <span className="text-[#DC2626]">*</span>
                </label>
                <button
                  type="button"
                  onClick={startVoiceDictation}
                  className={`inline-flex items-center space-x-1.5 text-[11px] font-semibold px-2.5 py-1 rounded-md transition border ${
                    isListening
                      ? "bg-[#DC2626] border-[#DC2626] text-white animate-pulse"
                      : "bg-[#FFF7E6] text-[#9A6500] hover:bg-[#FDE8C3] border-[#F59E0B]/30"
                  }`}
                >
                  <Mic className="w-3 h-3" />
                  <span>
                    {isListening
                      ? "Listening..."
                      : language === "hi"
                        ? "बोलकर दर्ज करें (Voice)"
                        : "Speak Input"}
                  </span>
                </button>
              </div>
              <input
                type="text"
                name="businessIdea"
                value={profile.businessIdea}
                onChange={handleInputChange}
                onBlur={() => handleInputBlur("businessIdea")}
                placeholder={t("form.businessIdeaPlaceholder", language)}
                className={`w-full px-3.5 py-2.5 text-xs rounded-lg border transition bg-white ${
                  errors.businessIdea
                    ? "border-[#DC2626] bg-[#FEF2F2]/50 ring-1 ring-[#DC2626]/20"
                    : "border-[#DCE4E8] hover:border-slate-400 focus:border-[#123B5D]"
                } focus:outline-none focus:ring-2 focus:ring-[#123B5D]/15`}
              />
              {errors.businessIdea && (
                <p className="text-[11px] text-[#DC2626] font-medium flex items-center space-x-1 mt-1.5">
                  <AlertCircle className="w-3.5 h-3.5" />
                  <span>{errors.businessIdea}</span>
                </p>
              )}
            </div>

            {/* Category Cards Selector */}
            <div>
              <label className="block text-xs font-bold text-[#17212B] mb-2">
                {t("form.category", language)}{" "}
                <span className="text-[#DC2626]">*</span>
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2.5">
                {CATEGORIES.map((cat) => {
                  const isSelected = profile.businessCategory === cat.key;
                  return (
                    <button
                      type="button"
                      key={cat.key}
                      onClick={() => handleCategorySelect(cat.key)}
                      className={`p-3 rounded-xl border text-left transition flex flex-col justify-between ${
                        isSelected
                          ? "border-[#123B5D] bg-[#EEF4FA] ring-2 ring-[#123B5D]/20 text-[#123B5D] shadow-sm font-semibold"
                          : "border-[#DCE4E8] bg-white hover:border-[#123B5D]/40 text-[#17212B]"
                      }`}
                    >
                      <span className="block text-xs font-bold leading-snug">
                        {language === "hi" ? cat.labelHi : cat.label}
                      </span>
                      <span className="block text-[10px] text-[#667085] mt-1.5 line-clamp-1">
                        {cat.desc}
                      </span>
                      {isSelected && (
                        <CheckCircle className="w-3.5 h-3.5 text-[#123B5D] mt-2 self-end stroke-[2.5]" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* SECTION 2: LOCATION & GEOLOCATION */}
        <div className="bg-white rounded-xl shadow-subtle border border-[#DCE4E8] p-5 sm:p-6">
          <div className="flex items-center space-x-3 pb-3 mb-5 border-b border-[#DCE4E8]/70">
            <div className="w-8 h-8 rounded-lg bg-[#EEF4FA] text-[#123B5D] border border-[#123B5D]/20 flex items-center justify-center font-bold">
              <MapPin className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-[#17212B]">
                {language === "hi"
                  ? "2. स्थान एवं जीपीएस मैपिंग"
                  : "2. Location & Spatial Mapping"}
              </h2>
              <p className="text-[11px] text-[#667085]">
                {language === "hi"
                  ? "हाइपर-लोकल प्रतियोगी घनत्व एवं ग्रामीण बाज़ार पहुंच का निर्धारण"
                  : "Enables 1-5km radius competitor matching and mandi distance calculation"}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
            {/* State */}
            <div>
              <label className="block text-xs font-bold text-[#17212B] mb-1.5">
                {t("form.state", language)}
              </label>
              <select
                name="state"
                value={profile.state}
                onChange={handleStateChange}
                className="w-full px-3 py-2 text-xs rounded-lg border border-[#DCE4E8] bg-white text-[#17212B] focus:outline-none focus:ring-2 focus:ring-[#123B5D]/15 focus:border-[#123B5D]"
              >
                <option value="">Select state</option>
                {Object.keys(STATES_DISTRICTS).map((st) => (
                  <option key={st} value={st}>
                    {st}
                  </option>
                ))}
              </select>
            </div>

            {/* District */}
            <div>
              <label className="block text-xs font-bold text-[#17212B] mb-1.5">
                {t("form.district", language)}
              </label>
              <select
                name="district"
                value={profile.district}
                onChange={handleInputChange}
                className="w-full px-3 py-2 text-xs rounded-lg border border-[#DCE4E8] bg-white text-[#17212B] focus:outline-none focus:ring-2 focus:ring-[#123B5D]/15 focus:border-[#123B5D]"
              >
                <option value="">Select district</option>
                {districtsForState.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </div>

            {/* Village / Town */}
            <div>
              <label className="block text-xs font-bold text-[#17212B] mb-1.5">
                {t("form.village", language)}
              </label>
              <input
                type="text"
                name="village"
                value={profile.village}
                onChange={handleInputChange}
                onBlur={() => handleInputBlur("village")}
                placeholder={t("form.villagePlaceholder", language)}
                className={`w-full px-3 py-2 text-xs rounded-lg border transition bg-white ${
                  errors.village
                    ? "border-[#DC2626] bg-[#FEF2F2]/50 ring-1 ring-[#DC2626]/20"
                    : "border-[#DCE4E8] hover:border-slate-400"
                } focus:outline-none focus:ring-2 focus:ring-[#123B5D]/15 focus:border-[#123B5D]`}
              />
              {errors.village && (
                <p className="text-[11px] text-[#DC2626] font-medium flex items-center space-x-1 mt-1.5">
                  <AlertCircle className="w-3.5 h-3.5" />
                  <span>{errors.village}</span>
                </p>
              )}
            </div>
          </div>

          {/* GPS Detector button */}
          <div className="mt-4 pt-3 border-t border-[#DCE4E8]/60 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="text-[11px] text-[#667085] flex items-center space-x-1.5">
              <Compass className="w-3.5 h-3.5 text-[#667085]" />
              <span>
                Coordinates:{" "}
                <strong className="text-[#17212B]">
                  {location
                    ? `${location.latitude.toFixed(4)}°N, ${location.longitude.toFixed(4)}°E`
                    : "Not detected"}
                </strong>
              </span>
              {locationMessage && (
                <span
                  className={
                    gpsSuccess
                      ? "text-[#167C5A] font-semibold"
                      : "text-[#F59E0B] font-semibold"
                  }
                >
                  {locationMessage}
                </span>
              )}
              {gpsSuccess && (
                <span className="text-[#167C5A] font-semibold bg-[#E8F6F1] px-2 py-0.5 rounded text-[10px] border border-[#167C5A]/30">
                  {t("form.locationDetected", language)}
                </span>
              )}
            </div>

            <button
              type="button"
              onClick={detectLocation}
              disabled={gpsLoading}
              className="px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-white hover:bg-slate-50 border border-[#DCE4E8] hover:border-[#123B5D] text-[#123B5D] flex items-center space-x-1.5 transition shadow-xs disabled:opacity-50"
            >
              <Compass
                className={`w-3.5 h-3.5 text-[#123B5D] ${gpsLoading ? "animate-spin" : ""}`}
              />
              <span>
                {gpsLoading
                  ? "Capturing GPS..."
                  : t("form.detectLocation", language)}
              </span>
            </button>
          </div>
        </div>

        {/* SECTION 3: CAPITAL & LOAN REQUIREMENT */}
        <div className="bg-white rounded-xl shadow-subtle border border-[#DCE4E8] p-5 sm:p-6">
          <div className="flex items-center space-x-3 pb-3 mb-5 border-b border-[#DCE4E8]/70">
            <div className="w-8 h-8 rounded-lg bg-[#E8F6F1] text-[#167C5A] border border-[#167C5A]/20 flex items-center justify-center font-bold">
              <IndianRupee className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-[#17212B]">
                {language === "hi"
                  ? "3. पूंजी निवेश एवं ऋण आवश्यकता"
                  : "3. Project Cost & Loan Structuring"}
              </h2>
              <p className="text-[11px] text-[#667085]">
                {language === "hi"
                  ? "स्वयं की पूंजी और बैंक ऋण की सटीक गणना"
                  : "Define own promoter margin equity and required institutional debt"}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Total Project Outlay */}
            <div>
              <label className="block text-xs font-bold text-[#17212B] mb-1.5">
                {t("form.expectedInvestment", language)}{" "}
                <span className="text-[#DC2626]">*</span>
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-xs text-[#667085] font-bold">
                  ₹
                </span>
                <input
                  type="number"
                  name="expectedInvestment"
                  value={profile.expectedInvestment}
                  onChange={handleInputChange}
                  onBlur={() => handleInputBlur("expectedInvestment")}
                  step="5000"
                  min="5000"
                  max="10000000"
                  className={`w-full pl-7 pr-3 py-2 text-xs rounded-lg border transition bg-white ${
                    errors.expectedInvestment
                      ? "border-[#DC2626] bg-[#FEF2F2]/50 ring-1 ring-[#DC2626]/20"
                      : "border-[#DCE4E8] hover:border-slate-400"
                  } focus:outline-none focus:ring-2 focus:ring-[#123B5D]/15 focus:border-[#123B5D]`}
                />
              </div>
              <span className="text-[10px] text-[#667085] mt-1 block">
                {language === "hi"
                  ? "मशीनरी, शेड, टूल्स एवं कच्चा माल मिलाकर"
                  : "Total equipment, workspace, and initial raw material"}
              </span>
              {errors.expectedInvestment && (
                <p className="text-[11px] text-[#DC2626] font-medium flex items-center space-x-1 mt-1.5">
                  <AlertCircle className="w-3.5 h-3.5" />
                  <span>{errors.expectedInvestment}</span>
                </p>
              )}
            </div>

            {/* Available Capital */}
            <div>
              <label className="block text-xs font-bold text-[#17212B] mb-1.5">
                {t("form.capitalAvailable", language)}{" "}
                <span className="text-[#DC2626]">*</span>
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-xs text-[#667085] font-bold">
                  ₹
                </span>
                <input
                  type="number"
                  name="capitalAvailable"
                  value={profile.capitalAvailable}
                  onChange={handleInputChange}
                  onBlur={() => handleInputBlur("capitalAvailable")}
                  step="1000"
                  min="0"
                  className={`w-full pl-7 pr-3 py-2 text-xs rounded-lg border transition bg-white ${
                    errors.capitalAvailable
                      ? "border-[#DC2626] bg-[#FEF2F2]/50 ring-1 ring-[#DC2626]/20"
                      : "border-[#DCE4E8] hover:border-slate-400"
                  } focus:outline-none focus:ring-2 focus:ring-[#123B5D]/15 focus:border-[#123B5D]`}
                />
              </div>
              <span className="text-[10px] text-[#667085] mt-1 block">
                {t("form.capitalHint", language)}
              </span>
              {errors.capitalAvailable && (
                <p className="text-[11px] text-[#DC2626] font-medium flex items-center space-x-1 mt-1.5">
                  <AlertCircle className="w-3.5 h-3.5" />
                  <span>{errors.capitalAvailable}</span>
                </p>
              )}
            </div>
          </div>

          {/* Realtime summary pill */}
          <div className="mt-4 p-3.5 bg-[#F7F9F7] border border-[#DCE4E8] rounded-xl flex flex-wrap items-center justify-between gap-3 text-xs">
            <div>
              <span className="text-[#667085] block text-[11px]">
                Own Margin Share:
              </span>
              <strong className="text-[#17212B] font-bold text-sm">
                ₹{Number(profile.capitalAvailable || 0).toLocaleString("en-IN")}{" "}
                ({marginPercent}%)
              </strong>
            </div>
            <div>
              <span className="text-[#667085] block text-[11px]">
                Calculated Loan Required:
              </span>
              <strong className="text-[#123B5D] font-bold text-sm">
                ₹{loanRequired.toLocaleString("en-IN")} ({100 - marginPercent}%)
              </strong>
            </div>
            <div>
              <span className="text-[#667085] block text-[11px]">
                Subsidy Potential:
              </span>
              <span className="font-semibold text-[#167C5A] bg-[#E8F6F1] px-2.5 py-0.5 rounded-md text-[11px] border border-[#167C5A]/30">
                Up to 15% - 35% under NBCFDC / PMEGP
              </span>
            </div>
          </div>
        </div>

        {/* SECTION 4: BENEFICIARY PROFILE & DEMOGRAPHICS */}
        <div className="bg-white rounded-xl shadow-subtle border border-[#DCE4E8] p-5 sm:p-6">
          <div className="flex items-center space-x-3 pb-3 mb-5 border-b border-[#DCE4E8]/70">
            <div className="w-8 h-8 rounded-lg bg-[#EEF4FA] text-[#123B5D] border border-[#123B5D]/20 flex items-center justify-center font-bold">
              <Users className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-[#17212B]">
                {language === "hi"
                  ? "4. सामाजिक वर्ग एवं लाभार्थी विवरण"
                  : "4. Beneficiary Category & Demographics"}
              </h2>
              <p className="text-[11px] text-[#667085]">
                {language === "hi"
                  ? "MoSJE योजनाओं (NBCFDC, NSFDC, NSKFDC) में अधिकतम ब्याज छूट एवं पात्रता हेतु"
                  : "Determines concessional interest rates and statutory subsidy eligibility"}
              </p>
            </div>
          </div>

          <div className="space-y-4">
            {/* Social Category Radios */}
            <div>
              <label className="block text-xs font-bold text-[#17212B] mb-2">
                {t("form.beneficiaryCategory", language)}{" "}
                <span className="text-[#DC2626]">*</span>
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                {BENEFICIARY_CATEGORIES.map((cat) => {
                  const isChecked = profile.beneficiaryCategory === cat.key;
                  return (
                    <label
                      key={cat.key}
                      className={`p-3 rounded-xl border cursor-pointer transition flex items-start space-x-2.5 ${
                        isChecked
                          ? "border-[#123B5D] bg-[#EEF4FA] ring-1 ring-[#123B5D]/30"
                          : "border-[#DCE4E8] hover:border-slate-300 bg-white"
                      }`}
                    >
                      <input
                        type="radio"
                        name="beneficiaryCategory"
                        value={cat.key}
                        checked={isChecked}
                        onChange={handleInputChange}
                        className="mt-0.5 text-[#123B5D] focus:ring-[#123B5D]"
                      />
                      <div>
                        <strong className="block text-xs font-bold text-[#17212B]">
                          {language === "hi" ? cat.labelHi : cat.label}
                        </strong>
                        <span className="block text-[10px] text-[#123B5D] font-medium mt-0.5">
                          {cat.schemeFocus}
                        </span>
                      </div>
                    </label>
                  );
                })}
              </div>
            </div>

            {/* Gender and Experience */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              {/* Gender */}
              <div>
                <label className="block text-xs font-bold text-[#17212B] mb-1.5">
                  {t("form.gender", language)}
                </label>
                <div className="flex items-center space-x-4 pt-1">
                  {["female", "male", "other"].map((g) => (
                    <label
                      key={g}
                      className="flex items-center space-x-1.5 text-xs text-[#17212B] cursor-pointer"
                    >
                      <input
                        type="radio"
                        name="gender"
                        value={g}
                        checked={profile.gender === g}
                        onChange={handleInputChange}
                        className="text-[#123B5D] focus:ring-[#123B5D]"
                      />
                      <span className="capitalize">
                        {g === "female"
                          ? t("form.female", language)
                          : g === "male"
                            ? t("form.male", language)
                            : t("form.otherGender", language)}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Experience */}
              <div>
                <label className="block text-xs font-bold text-[#17212B] mb-1.5">
                  {t("form.experience", language)}
                </label>
                <select
                  name="experience"
                  value={profile.experience}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-[#DCE4E8] bg-white text-[#17212B] focus:outline-none focus:ring-2 focus:ring-[#123B5D]/15 focus:border-[#123B5D]"
                >
                  <option value="beginner">
                    {t("form.expNone", language)}
                  </option>
                  <option value="intermediate">
                    {t("form.expSome", language)}
                  </option>
                  <option value="expert">{t("form.expHigh", language)}</option>
                </select>
              </div>
            </div>

            {/* Greenfield Entrepreneur Toggle */}
            <div className="pt-2">
              <label className="inline-flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  name="isFirstTimeEntrepreneur"
                  checked={profile.isFirstTimeEntrepreneur}
                  onChange={handleInputChange}
                  className="rounded text-[#123B5D] focus:ring-[#123B5D] w-4 h-4"
                />
                <span className="text-xs font-semibold text-[#17212B]">
                  {t("form.firstTime", language)}
                </span>
              </label>
              <span className="block text-[10px] text-[#667085] ml-6">
                {language === "hi"
                  ? "स्टैंड-अप इंडिया एवं पीएमईजीपी योजनाओं में प्रथम उद्यमियों को विशेष प्राथमिकता दी जाती है।"
                  : "First-time greenfield founders receive special concessions under Stand-Up India & PMEGP."}
              </span>
            </div>
          </div>
        </div>

        {/* SUBMIT BUTTON BAR */}
        <div className="bg-white rounded-xl shadow-card border border-[#DCE4E8] p-4 sm:p-5 flex flex-col sm:flex-row items-center justify-between gap-3 sticky bottom-4 z-20">
          <div className="text-xs text-[#667085] text-center sm:text-left">
            <span className="font-semibold text-[#17212B]">
              Ready to compute local viability:
            </span>
            <span className="text-[#667085] block text-[11px]">
              Proceeds to Step 2: 5km Competitor Mapping & Opportunity Scoring
            </span>
          </div>

          <button
            type="submit"
            className="w-full sm:w-auto px-6 py-3 rounded-lg text-xs font-bold bg-[#123B5D] hover:bg-[#0D2E49] text-white shadow-sm flex items-center justify-center space-x-2 transition"
          >
            <span>{t("form.continue", language)}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </form>
    </div>
  );
}
