import React, { useState } from "react";
import { useApp } from "../context/AppContext";
import {
  t,
  CATEGORIES,
  STATES_DISTRICTS,
  BENEFICIARY_CATEGORIES,
} from "../utils/translations";
import { SpeechHelper } from "../speech";
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

const { lettersAndSpaces, locationText, digitsOnly, trimText, validateProfile } =
  validation;

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
  } = useApp();

  const [errors, setErrors] = useState({});
  const [gpsLoading, setGpsLoading] = useState(false);
  const [gpsSuccess, setGpsSuccess] = useState(false);

  const districtsForState =
    STATES_DISTRICTS[profile.state] || STATES_DISTRICTS["Madhya Pradesh"];

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    let cleanedValue = value;
    if (name === "applicantName") cleanedValue = lettersAndSpaces(value);
    if (name === "village") cleanedValue = locationText(value);
    if (name === "expectedInvestment" || name === "capitalAvailable") {
      cleanedValue = digitsOnly(value);
    }
    if (name === "businessIdea") cleanedValue = trimText(value, 200);
    updateProfile({
      [name]: type === "checkbox" ? checked : cleanedValue,
    });
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  const handleInputBlur = (name) => {
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
    const newDistricts = STATES_DISTRICTS[newState] || [];
    updateProfile({
      state: newState,
      district: newDistricts[0] || "",
    });
  };

  const detectLocation = () => {
    if (!navigator.geolocation) {
      showToast("Geolocation is not supported by your browser", "warning");
      return;
    }

    setGpsLoading(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setGpsLoading(false);
        setGpsSuccess(true);
        updateProfile({
          lat: Number(pos.coords.latitude.toFixed(4)),
          lng: Number(pos.coords.longitude.toFixed(4)),
        });
        showToast(
          language === "hi"
            ? `स्थान दर्ज: ${pos.coords.latitude.toFixed(2)}°N, ${pos.coords.longitude.toFixed(2)}°E`
            : `GPS Captured: ${pos.coords.latitude.toFixed(2)}°N, ${pos.coords.longitude.toFixed(2)}°E`,
          "success",
        );
      },
      (err) => {
        setGpsLoading(false);
        showToast("GPS unavailable. Using selected district center.", "info");
      },
      { timeout: 8000 },
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
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5 sm:p-6">
          <div className="flex items-center space-x-2.5 pb-3 mb-4 border-b border-slate-100">
            <div className="w-8 h-8 rounded-lg bg-orange-100 text-orange-600 flex items-center justify-center font-bold">
              <Building2 className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900">
                {language === "hi"
                  ? "1. व्यवसाय विचार एवं क्षेत्र"
                  : "1. Business Concept & Sector"}
              </h2>
              <p className="text-[11px] text-slate-500">
                {language === "hi"
                  ? "आप क्या उत्पाद या सेवा शुरू करना चाहते हैं?"
                  : "What enterprise product or service do you intend to launch?"}
              </p>
            </div>
          </div>

          <div className="space-y-4">
            {/* Applicant Name */}
            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1">
                {t("form.applicantName", language)}{" "}
                <span className="text-rose-500">*</span>
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
                className={`w-full px-3.5 py-2.5 text-xs rounded-lg border transition ${
                  errors.applicantName ? "border-rose-400 bg-rose-50/40" : "border-slate-300"
                } focus:outline-none focus:ring-2 focus:ring-govblue/30 focus:border-govblue`}
              />
              {errors.applicantName && (
                <p className="text-[11px] text-rose-600 mt-1">{errors.applicantName}</p>
              )}
            </div>

            {/* Business Idea with Voice Button */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-bold text-slate-800 flex items-center space-x-1">
                  <span>{t("form.businessIdea", language)}</span>
                  <span className="text-rose-500">*</span>
                </label>
                <button
                  type="button"
                  onClick={startVoiceDictation}
                  className={`inline-flex items-center space-x-1 text-[11px] font-semibold px-2 py-0.5 rounded transition ${
                    isListening
                      ? "bg-rose-600 text-white animate-pulse"
                      : "bg-orange-50 text-orange-700 hover:bg-orange-100 border border-orange-200"
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
                className={`w-full px-3.5 py-2.5 text-xs rounded-lg border transition ${
                  errors.businessIdea
                    ? "border-rose-400 bg-rose-50/40 focus:ring-rose-200"
                    : "border-slate-300 focus:ring-govblue/30 focus:border-govblue"
                }`}
              />
              {errors.businessIdea && (
                <p className="text-[11px] text-rose-600 flex items-center space-x-1 mt-1">
                  <AlertCircle className="w-3 h-3" />
                  <span>{errors.businessIdea}</span>
                </p>
              )}
            </div>

            {/* Category Cards Selector */}
            <div>
              <label className="block text-xs font-bold text-slate-800 mb-2">
                {t("form.category", language)}{" "}
                <span className="text-rose-500">*</span>
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2.5">
                {CATEGORIES.map((cat) => {
                  const isSelected = profile.businessCategory === cat.key;
                  return (
                    <button
                      type="button"
                      key={cat.key}
                      onClick={() => handleCategorySelect(cat.key)}
                      className={`p-3 rounded-lg border text-left transition flex flex-col justify-between ${
                        isSelected
                          ? "border-govblue bg-blue-50/80 ring-2 ring-govblue/20 text-govblue shadow-xs"
                          : "border-slate-200 bg-white hover:border-slate-300 text-slate-700"
                      }`}
                    >
                      <span className="block text-xs font-bold leading-snug">
                        {language === "hi" ? cat.labelHi : cat.label}
                      </span>
                      <span className="block text-[10px] text-slate-500 mt-1 line-clamp-1">
                        {cat.desc}
                      </span>
                      {isSelected && (
                        <CheckCircle className="w-3.5 h-3.5 text-govblue mt-1.5 self-end" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* SECTION 2: LOCATION & GEOLOCATION */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5 sm:p-6">
          <div className="flex items-center space-x-2.5 pb-3 mb-4 border-b border-slate-100">
            <div className="w-8 h-8 rounded-lg bg-sky-100 text-sky-600 flex items-center justify-center font-bold">
              <MapPin className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900">
                {language === "hi"
                  ? "2. स्थान एवं जीपीएस मैपिंग"
                  : "2. Location & Spatial Mapping"}
              </h2>
              <p className="text-[11px] text-slate-500">
                {language === "hi"
                  ? "हाइपर-लोकल प्रतियोगी घनत्व एवं ग्रामीण बाज़ार पहुंच का निर्धारण"
                  : "Enables 1-5km radius competitor matching and mandi distance calculation"}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
            {/* State */}
            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1">
                {t("form.state", language)}
              </label>
              <select
                name="state"
                value={profile.state}
                onChange={handleStateChange}
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-govblue/30"
              >
                {Object.keys(STATES_DISTRICTS).map((st) => (
                  <option key={st} value={st}>
                    {st}
                  </option>
                ))}
              </select>
            </div>

            {/* District */}
            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1">
                {t("form.district", language)}
              </label>
              <select
                name="district"
                value={profile.district}
                onChange={handleInputChange}
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-govblue/30"
              >
                {districtsForState.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </div>

            {/* Village / Town */}
            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1">
                {t("form.village", language)}
              </label>
              <input
                type="text"
                name="village"
                value={profile.village}
                onChange={handleInputChange}
                onBlur={() => handleInputBlur("village")}
                placeholder={t("form.villagePlaceholder", language)}
                className={`w-full px-3 py-2 text-xs rounded-lg border ${
                  errors.village ? "border-rose-400 bg-rose-50/40" : "border-slate-300"
                } focus:outline-none focus:ring-2 focus:ring-govblue/30`}
              />
              {errors.village && (
                <p className="text-[11px] text-rose-600 mt-1">{errors.village}</p>
              )}
            </div>
          </div>

          {/* GPS Detector button */}
          <div className="mt-4 pt-3 border-t border-slate-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="text-[11px] text-slate-600 flex items-center space-x-1.5">
              <Compass className="w-3.5 h-3.5 text-slate-400" />
              <span>
                Coordinates:{" "}
                <strong className="text-slate-800">
                  {profile.lat}°N, {profile.lng}°E
                </strong>
              </span>
              {gpsSuccess && (
                <span className="text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded text-[10px] border border-emerald-200">
                  {t("form.locationDetected", language)}
                </span>
              )}
            </div>

            <button
              type="button"
              onClick={detectLocation}
              disabled={gpsLoading}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-100 hover:bg-slate-200 border border-slate-300 text-slate-700 flex items-center space-x-1.5 transition disabled:opacity-50"
            >
              <Compass
                className={`w-3.5 h-3.5 text-govblue ${gpsLoading ? "animate-spin" : ""}`}
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
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5 sm:p-6">
          <div className="flex items-center space-x-2.5 pb-3 mb-4 border-b border-slate-100">
            <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
              <IndianRupee className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900">
                {language === "hi"
                  ? "3. पूंजी निवेश एवं ऋण आवश्यकता"
                  : "3. Project Cost & Loan Structuring"}
              </h2>
              <p className="text-[11px] text-slate-500">
                {language === "hi"
                  ? "स्वयं की पूंजी और बैंक ऋण की सटीक गणना"
                  : "Define own promoter margin equity and required institutional debt"}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Total Project Outlay */}
            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1">
                {t("form.expectedInvestment", language)}{" "}
                <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-xs text-slate-400 font-bold">
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
                  className={`w-full pl-7 pr-3 py-2 text-xs rounded-lg border ${
                    errors.expectedInvestment
                      ? "border-rose-400 bg-rose-50/40"
                      : "border-slate-300 focus:ring-govblue/30"
                  }`}
                />
              </div>
              <span className="text-[10px] text-slate-500 mt-1 block">
                {language === "hi"
                  ? "मशीनरी, शेड, टूल्स एवं कच्चा माल मिलाकर"
                  : "Total equipment, workspace, and initial raw material"}
              </span>
              {errors.expectedInvestment && (
                <p className="text-[11px] text-rose-600 mt-1">
                  {errors.expectedInvestment}
                </p>
              )}
            </div>

            {/* Available Capital */}
            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1">
                {t("form.capitalAvailable", language)}{" "}
                <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-xs text-slate-400 font-bold">
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
                  className={`w-full pl-7 pr-3 py-2 text-xs rounded-lg border ${
                    errors.capitalAvailable
                      ? "border-rose-400 bg-rose-50/40"
                      : "border-slate-300 focus:ring-govblue/30"
                  }`}
                />
              </div>
              <span className="text-[10px] text-slate-500 mt-1 block">
                {t("form.capitalHint", language)}
              </span>
              {errors.capitalAvailable && (
                <p className="text-[11px] text-rose-600 mt-1">
                  {errors.capitalAvailable}
                </p>
              )}
            </div>
          </div>

          {/* Realtime summary pill */}
          <div className="mt-4 p-3.5 bg-slate-50 border border-slate-200 rounded-lg flex flex-wrap items-center justify-between gap-3 text-xs">
            <div>
              <span className="text-slate-500 block text-[11px]">
                Own Margin Share:
              </span>
              <strong className="text-slate-900 font-bold text-sm">
                ₹{Number(profile.capitalAvailable || 0).toLocaleString("en-IN")}{" "}
                ({marginPercent}%)
              </strong>
            </div>
            <div>
              <span className="text-slate-500 block text-[11px]">
                Calculated Loan Required:
              </span>
              <strong className="text-govblue font-bold text-sm">
                ₹{loanRequired.toLocaleString("en-IN")} ({100 - marginPercent}%)
              </strong>
            </div>
            <div>
              <span className="text-slate-500 block text-[11px]">
                Subsidy Potential:
              </span>
              <span className="font-semibold text-emerald-700 bg-emerald-100/70 px-2 py-0.5 rounded text-[11px]">
                Up to 15% - 35% under NBCFDC / PMEGP
              </span>
            </div>
          </div>
        </div>

        {/* SECTION 4: BENEFICIARY PROFILE & DEMOGRAPHICS */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5 sm:p-6">
          <div className="flex items-center space-x-2.5 pb-3 mb-4 border-b border-slate-100">
            <div className="w-8 h-8 rounded-lg bg-purple-100 text-purple-700 flex items-center justify-center font-bold">
              <Users className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900">
                {language === "hi"
                  ? "4. सामाजिक वर्ग एवं लाभार्थी विवरण"
                  : "4. Beneficiary Category & Demographics"}
              </h2>
              <p className="text-[11px] text-slate-500">
                {language === "hi"
                  ? "MoSJE योजनाओं (NBCFDC, NSFDC, NSKFDC) में अधिकतम ब्याज छूट एवं पात्रता हेतु"
                  : "Determines concessional interest rates and statutory subsidy eligibility"}
              </p>
            </div>
          </div>

          <div className="space-y-4">
            {/* Social Category Radios */}
            <div>
              <label className="block text-xs font-bold text-slate-800 mb-2">
                {t("form.beneficiaryCategory", language)}{" "}
                <span className="text-rose-500">*</span>
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                {BENEFICIARY_CATEGORIES.map((cat) => {
                  const isChecked = profile.beneficiaryCategory === cat.key;
                  return (
                    <label
                      key={cat.key}
                      className={`p-3 rounded-lg border cursor-pointer transition flex items-start space-x-2.5 ${
                        isChecked
                          ? "border-purple-600 bg-purple-50/60 ring-1 ring-purple-500/20"
                          : "border-slate-200 hover:border-slate-300 bg-white"
                      }`}
                    >
                      <input
                        type="radio"
                        name="beneficiaryCategory"
                        value={cat.key}
                        checked={isChecked}
                        onChange={handleInputChange}
                        className="mt-0.5 text-purple-600 focus:ring-purple-500"
                      />
                      <div>
                        <strong className="block text-xs font-bold text-slate-900">
                          {language === "hi" ? cat.labelHi : cat.label}
                        </strong>
                        <span className="block text-[10px] text-purple-800 font-medium mt-0.5">
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
                <label className="block text-xs font-bold text-slate-800 mb-1">
                  {t("form.gender", language)}
                </label>
                <div className="flex items-center space-x-4 pt-1">
                  {["female", "male", "other"].map((g) => (
                    <label
                      key={g}
                      className="flex items-center space-x-1.5 text-xs text-slate-700 cursor-pointer"
                    >
                      <input
                        type="radio"
                        name="gender"
                        value={g}
                        checked={profile.gender === g}
                        onChange={handleInputChange}
                        className="text-govblue focus:ring-govblue"
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
                <label className="block text-xs font-bold text-slate-800 mb-1">
                  {t("form.experience", language)}
                </label>
                <select
                  name="experience"
                  value={profile.experience}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 bg-white focus:ring-govblue/30"
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
                  className="rounded text-govblue focus:ring-govblue w-4 h-4"
                />
                <span className="text-xs font-semibold text-slate-800">
                  {t("form.firstTime", language)}
                </span>
              </label>
              <span className="block text-[10px] text-slate-500 ml-6">
                {language === "hi"
                  ? "स्टैंड-अप इंडिया एवं पीएमईजीपी योजनाओं में प्रथम उद्यमियों को विशेष प्राथमिकता दी जाती है।"
                  : "First-time greenfield founders receive special concessions under Stand-Up India & PMEGP."}
              </span>
            </div>
          </div>
        </div>

        {/* SUBMIT BUTTON BAR */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 flex flex-col sm:flex-row items-center justify-between gap-3 sticky bottom-4 z-20">
          <div className="text-xs text-slate-600 text-center sm:text-left">
            <span className="font-semibold text-slate-800">
              Ready to compute local viability:
            </span>
            <span className="text-slate-500 block text-[11px]">
              Proceeds to Step 2: 5km Competitor Mapping & Opportunity Scoring
            </span>
          </div>

          <button
            type="submit"
            className="w-full sm:w-auto px-6 py-3 rounded-lg text-xs font-bold bg-govblue hover:bg-govblue-dark text-white shadow-md shadow-govblue/20 flex items-center justify-center space-x-2 transition"
          >
            <span>{t("form.continue", language)}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </form>
    </div>
  );
}
