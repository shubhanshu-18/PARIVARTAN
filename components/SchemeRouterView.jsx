import React, { useState } from "react";
import { useApp } from "../context/AppContext";
import { SpeechHelper } from "../speech";
import { t } from "../utils/translations";
import {
  Award,
  CheckCircle2,
  AlertCircle,
  Landmark,
  FileText,
  ArrowRight,
  ArrowLeft,
  Volume2,
  VolumeX,
  ExternalLink,
  ShieldCheck,
  ChevronDown,
  ChevronUp,
  CheckSquare,
  Square,
  Percent,
  Calendar,
  Clock,
  HelpCircle,
  Building2,
  PhoneCall,
} from "lucide-react";

export function SchemeRouterView() {
  const {
    profile,
    updateProfile,
    matchedSchemes,
    financials,
    setActiveStep,
    language,
    runAssessmentPipeline,
    showToast,
  } = useApp();

  const [speaking, setSpeaking] = useState(false);
  const [selectedSchemeId, setSelectedSchemeId] = useState(
    matchedSchemes?.[0]?.id || null,
  );
  const [expandedSchemeId, setExpandedSchemeId] = useState(null);
  const [checkedDocs, setCheckedDocs] = useState({});

  const schemes =
    matchedSchemes && matchedSchemes.length > 0 ? matchedSchemes : [];
  const topScheme = schemes[0] || null;

  // Toggle document checkbox
  const toggleDoc = (docName) => {
    setCheckedDocs((prev) => ({
      ...prev,
      [docName]: !prev[docName],
    }));
  };

  // Read recommendation aloud
  const toggleSpeech = () => {
    if (speaking) {
      SpeechHelper.stopSpeaking();
      setSpeaking(false);
    } else if (topScheme) {
      const text =
        language === "hi"
          ? `आपके लिए सर्वश्रेष्ठ अनुशंसित सरकारी योजना है: ${topScheme.nameHindi || topScheme.name}। इसमें ${topScheme.subsidyPercent}% सरकारी अनुदान और ${topScheme.interestRate}% की रियायती ब्याज दर उपलब्ध है। आपकी पात्रता स्कोर ${topScheme.matchScore}% है।`
          : `Top recommended government scheme for your enterprise is: ${topScheme.name}, by ${topScheme.agency}. It offers ${topScheme.subsidyPercent}% capital subsidy and a concessional interest rate of ${topScheme.interestRate}%. Your compatibility score is ${topScheme.matchScore} percent.`;

      SpeechHelper.speak(text, {
        lang: language,
        onStart: () => setSpeaking(true),
        onEnd: () => setSpeaking(false),
      });
    }
  };

  // Apply scheme parameters to financial model
  const applySchemeToFinancials = (scheme) => {
    updateProfile({
      subsidyPercent: scheme.subsidyPercent || 0,
      annualInterestRate: scheme.interestRate || 6.5,
      tenureMonths: scheme.maxTenureMonths || 36,
      moratoriumMonths: scheme.moratoriumMonths || 3,
    });
    runAssessmentPipeline({
      ...profile,
      subsidyPercent: scheme.subsidyPercent || 0,
      annualInterestRate: scheme.interestRate || 6.5,
      tenureMonths: scheme.maxTenureMonths || 36,
      moratoriumMonths: scheme.moratoriumMonths || 3,
    });
    setSelectedSchemeId(scheme.id);
    showToast(
      language === "hi"
        ? `${scheme.name} की शर्तें वित्तीय मॉडल में लागू कर दी गई हैं`
        : `Applied ${scheme.name} parameters to financial calculations`,
      "success",
    );
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-8">
      {/* Header Banner */}
      <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center space-x-2 bg-emerald-50 text-emerald-800 text-xs font-semibold px-3 py-1 rounded-full border border-emerald-200">
            <Landmark className="w-3.5 h-3.5 text-emerald-600" />
            <span>
              {language === "hi"
                ? "मंत्रालय एवं निगम योजना मिलान"
                : "MoSJE & Central Scheme Router"}
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            {language === "hi"
              ? "सरकारी योजना मिलान एवं अनुदान रूटिंग"
              : "Government Scheme Matching & Subsidy Router"}
          </h1>
          <p className="text-sm text-slate-600 max-w-2xl leading-relaxed">
            {language === "hi"
              ? `${profile.applicantName || "उद्यमी"} (${profile.beneficiaryCategory}, ${profile.state}) के लिए ₹${Number(profile.expectedInvestment || 140000).toLocaleString("en-IN")} की परियोजना लागत हेतु भारत सरकार की कल्याणकारी योजनाओं का मिलान किया गया है।`
              : `Matched specialized welfare and MSME financing schemes for ${profile.applicantName || "Entrepreneur"} (${profile.beneficiaryCategory}, ${profile.district}, ${profile.state}) based on ₹${Number(profile.expectedInvestment || 140000).toLocaleString("en-IN")} project outlay.`}
          </p>
        </div>

        <div className="flex items-center gap-3 self-start md:self-center">
          <button
            onClick={toggleSpeech}
            className={`inline-flex items-center space-x-2 px-4 py-2.5 rounded-xl font-medium text-sm transition-all border shadow-sm ${
              speaking
                ? "bg-amber-100 text-amber-900 border-amber-300 animate-pulse"
                : "bg-slate-50 text-slate-700 hover:bg-slate-100 border-slate-200"
            }`}
          >
            {speaking ? (
              <VolumeX className="w-4 h-4 text-amber-700" />
            ) : (
              <Volume2 className="w-4 h-4 text-blue-600" />
            )}
            <span>
              {speaking
                ? language === "hi"
                  ? "आवाज़ रोकें"
                  : "Stop Audio"
                : language === "hi"
                  ? "योजना सुनें"
                  : "Listen Scheme"}
            </span>
          </button>
        </div>
      </div>

      {/* Hero: Top Recommended Scheme */}
      {topScheme && (
        <div className="bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 rounded-3xl text-white p-6 sm:p-8 shadow-xl border border-blue-900 relative overflow-hidden">
          {/* Subtle background ornamentation */}
          <div className="absolute -right-16 -top-16 w-64 h-64 bg-orange-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -left-16 -bottom-16 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 space-y-6">
            {/* Top Bar: Best Match Badge & Compatibility Score */}
            <div className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-blue-800/60">
              <div className="inline-flex items-center space-x-2 bg-orange-500/20 text-orange-300 border border-orange-500/40 px-3.5 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider">
                <Award className="w-4 h-4 text-orange-400" />
                <span>
                  {language === "hi"
                    ? "सर्वोत्तम अनुशंसित योजना"
                    : "Top Recommended Match"}
                </span>
              </div>

              <div className="flex items-center space-x-3 bg-white/10 px-4 py-2 rounded-2xl backdrop-blur-sm border border-white/15">
                <span className="text-xs text-blue-200">
                  {language === "hi" ? "अनुकूलता स्कोर" : "Fit Score"}:
                </span>
                <div className="flex items-center space-x-1.5">
                  <span className="text-2xl font-black text-emerald-400">
                    {topScheme.matchScore}%
                  </span>
                  <span className="text-xs font-semibold text-emerald-300">
                    {topScheme.matchScore >= 85
                      ? language === "hi"
                        ? "अति उत्तम"
                        : "Excellent"
                      : language === "hi"
                        ? "अनुकूल"
                        : "Viable"}
                  </span>
                </div>
              </div>
            </div>

            {/* Scheme Title & Implementing Agency */}
            <div className="space-y-2">
              <div className="flex items-center space-x-2 text-xs font-semibold text-blue-300 uppercase tracking-wider">
                <Building2 className="w-4 h-4 text-blue-400" />
                <span>{topScheme.agency || topScheme.implementing_agency}</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
                {language === "hi" && topScheme.nameHindi
                  ? topScheme.nameHindi
                  : topScheme.name}
              </h2>
              {language === "hi" && topScheme.nameHindi && (
                <p className="text-sm text-slate-300 font-medium">
                  {topScheme.name}
                </p>
              )}
              <p className="text-sm text-slate-300 max-w-3xl leading-relaxed pt-1">
                {topScheme.description || topScheme.purpose}
              </p>
            </div>

            {/* 4 Key Parameter Pill Boxes */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 pt-2">
              <div className="bg-white/5 border border-white/10 rounded-2xl p-4 backdrop-blur-sm">
                <div className="flex items-center space-x-2 text-orange-300 text-xs font-semibold">
                  <Percent className="w-3.5 h-3.5" />
                  <span>
                    {language === "hi" ? "सरकारी अनुदान" : "Capital Subsidy"}
                  </span>
                </div>
                <div className="mt-1 text-2xl font-bold text-white">
                  {topScheme.subsidyPercent}%
                </div>
                <div className="text-[11px] text-slate-400 mt-0.5">
                  ≈ ₹
                  {Math.round(
                    Number(profile.expectedInvestment || 140000) *
                      (topScheme.subsidyPercent / 100),
                  ).toLocaleString("en-IN")}{" "}
                  {language === "hi" ? "छूट" : "waiver"}
                </div>
              </div>

              <div className="bg-white/5 border border-white/10 rounded-2xl p-4 backdrop-blur-sm">
                <div className="flex items-center space-x-2 text-emerald-300 text-xs font-semibold">
                  <Percent className="w-3.5 h-3.5" />
                  <span>
                    {language === "hi" ? "ब्याज दर" : "Interest Rate"}
                  </span>
                </div>
                <div className="mt-1 text-2xl font-bold text-emerald-400">
                  {topScheme.interestRate || topScheme.interest_rate_percent}%
                  <span className="text-xs font-normal text-slate-400 ml-1">
                    p.a.
                  </span>
                </div>
                <div className="text-[11px] text-slate-400 mt-0.5">
                  {language === "hi" ? "रियायती दर" : "Concessional rate"}
                </div>
              </div>

              <div className="bg-white/5 border border-white/10 rounded-2xl p-4 backdrop-blur-sm">
                <div className="flex items-center space-x-2 text-blue-300 text-xs font-semibold">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>
                    {language === "hi"
                      ? "न्यूनतम स्वयं अंशदान"
                      : "Min Promoter Margin"}
                  </span>
                </div>
                <div className="mt-1 text-2xl font-bold text-white">
                  {topScheme.minMarginPercent ??
                    topScheme.min_promoter_margin_percent ??
                    5}
                  %
                </div>
                <div className="text-[11px] text-slate-400 mt-0.5">
                  ≈ ₹
                  {Math.round(
                    Number(profile.expectedInvestment || 140000) *
                      ((topScheme.minMarginPercent ?? 5) / 100),
                  ).toLocaleString("en-IN")}{" "}
                  {language === "hi" ? "न्यूनतम" : "min capital"}
                </div>
              </div>

              <div className="bg-white/5 border border-white/10 rounded-2xl p-4 backdrop-blur-sm">
                <div className="flex items-center space-x-2 text-purple-300 text-xs font-semibold">
                  <Clock className="w-3.5 h-3.5" />
                  <span>
                    {language === "hi" ? "पुनर्भुगतान अवधि" : "Tenure / Grace"}
                  </span>
                </div>
                <div className="mt-1 text-2xl font-bold text-white">
                  {topScheme.maxTenureMonths ||
                    topScheme.max_tenure_months ||
                    36}
                  m
                </div>
                <div className="text-[11px] text-slate-400 mt-0.5">
                  +
                  {topScheme.moratoriumMonths ||
                    topScheme.moratorium_months ||
                    3}
                  m {language === "hi" ? "ऋण स्थगन" : "moratorium"}
                </div>
              </div>
            </div>

            {/* Why It Matches & Caveats */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
              <div className="bg-white/5 rounded-2xl p-5 border border-white/10 space-y-3">
                <h4 className="text-sm font-bold text-emerald-300 flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>
                    {language === "hi"
                      ? "यह योजना क्यों मेल खाती है?"
                      : "Why It Matches Your Profile"}
                  </span>
                </h4>
                <ul className="space-y-2 text-xs text-slate-200">
                  {topScheme.matchReasons?.map((reason, idx) => (
                    <li key={idx} className="flex items-start space-x-2">
                      <span className="text-emerald-400 font-bold mt-0.5">
                        ✔
                      </span>
                      <span>{reason.replace(/^✓\s*/, "")}</span>
                    </li>
                  ))}
                  {(!topScheme.matchReasons ||
                    topScheme.matchReasons.length === 0) && (
                    <>
                      <li className="flex items-start space-x-2">
                        <span className="text-emerald-400 font-bold">✔</span>
                        <span>
                          Matched for {profile.beneficiaryCategory} category in{" "}
                          {profile.district}, {profile.state}
                        </span>
                      </li>
                      <li className="flex items-start space-x-2">
                        <span className="text-emerald-400 font-bold">✔</span>
                        <span>
                          Investment outlay fits under the ₹
                          {topScheme.maxCost?.toLocaleString("en-IN") ||
                            "1,50,000"}{" "}
                          scheme ceiling
                        </span>
                      </li>
                      <li className="flex items-start space-x-2">
                        <span className="text-emerald-400 font-bold">✔</span>
                        <span>Promoter margin requirement satisfied</span>
                      </li>
                    </>
                  )}
                </ul>
              </div>

              <div className="bg-white/5 rounded-2xl p-5 border border-white/10 space-y-3">
                <h4 className="text-sm font-bold text-amber-300 flex items-center space-x-2">
                  <AlertCircle className="w-4 h-4 text-amber-400" />
                  <span>
                    {language === "hi"
                      ? "महत्वपूर्ण दिशानिर्देश एवं शर्तें"
                      : "Key Eligibility Criteria"}
                  </span>
                </h4>
                <ul className="space-y-2 text-xs text-slate-200">
                  {(
                    topScheme.eligibilityCriteria || [
                      "Beneficiary annual household income within prescribed rural limits",
                      "Promoter equity margin must be deposited in dedicated bank account",
                      "Age between 18 and 55 years at the time of application",
                      "No existing default on any prior bank loan",
                    ]
                  ).map((crit, idx) => (
                    <li key={idx} className="flex items-start space-x-2">
                      <span className="text-amber-400 font-bold mt-0.5">•</span>
                      <span>{crit}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Interactive Document Readiness Checklist */}
            <div className="bg-white/5 rounded-2xl p-5 border border-white/10 space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-bold text-white flex items-center space-x-2">
                  <FileText className="w-4 h-4 text-blue-400" />
                  <span>
                    {language === "hi"
                      ? "आवश्यक दस्तावेज चेकलिस्ट (जांचें आपके पास क्या है)"
                      : "Required Documents Checklist (Check What You Have)"}
                  </span>
                </h4>
                <span className="text-xs text-blue-300 bg-blue-900/50 px-2.5 py-1 rounded-full border border-blue-700/50">
                  {Object.values(checkedDocs).filter(Boolean).length} /{" "}
                  {(topScheme.documentsRequired || []).length}{" "}
                  {language === "hi" ? "तैयार" : "ready"}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                {(
                  topScheme.documentsRequired || [
                    "Aadhaar Card and Voter ID",
                    "Category / Caste Certificate from Tahsildar / SDM",
                    "Ration Card / Income Certificate",
                    "Quotation / Price Estimate for Machinery / Assets",
                    "Bank Account Passbook (first page)",
                  ]
                ).map((doc, idx) => {
                  const isChecked = !!checkedDocs[doc];
                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => toggleDoc(doc)}
                      className={`flex items-start space-x-2.5 text-left p-2.5 rounded-xl text-xs transition-all border ${
                        isChecked
                          ? "bg-emerald-950/40 border-emerald-500/40 text-emerald-200"
                          : "bg-white/5 border-white/10 text-slate-300 hover:bg-white/10"
                      }`}
                    >
                      {isChecked ? (
                        <CheckSquare className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                      ) : (
                        <Square className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                      )}
                      <span
                        className={isChecked ? "line-through opacity-80" : ""}
                      >
                        {doc}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Disclaimer & Action Buttons */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 pt-4 border-t border-blue-800/60">
              <p className="text-[11px] text-slate-400 max-w-lg leading-snug">
                {topScheme.disclaimer ||
                  "Official rates and quotas are disbursed via State Channelising Agencies (SCAs) and approved nodal banks."}
              </p>

              <div className="flex items-center gap-3 shrink-0">
                {topScheme.officialUrl && (
                  <a
                    href={topScheme.officialUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center space-x-1.5 px-4 py-2.5 rounded-xl text-xs font-semibold bg-white/10 hover:bg-white/20 text-white border border-white/20 transition-colors"
                  >
                    <span>
                      {language === "hi"
                        ? "आधिकारिक पोर्टल"
                        : "Official Portal"}
                    </span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                )}

                <button
                  onClick={() => applySchemeToFinancials(topScheme)}
                  className={`inline-flex items-center space-x-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all shadow-md ${
                    selectedSchemeId === topScheme.id
                      ? "bg-emerald-600 text-white hover:bg-emerald-700"
                      : "bg-orange-500 text-white hover:bg-orange-600"
                  }`}
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>
                    {selectedSchemeId === topScheme.id
                      ? language === "hi"
                        ? "वित्तीय मॉडल में लागू है ✔"
                        : "Applied to Financial Model ✔"
                      : language === "hi"
                        ? "यह योजना लागू करें"
                        : "Apply This Scheme"}
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Alternative Schemes Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xl font-bold text-slate-900">
              {language === "hi"
                ? "अन्य वैकल्पिक सरकारी योजनाएं"
                : "Other Eligible Government Schemes"}
            </h3>
            <p className="text-xs text-slate-500">
              {language === "hi"
                ? "आपकी योग्यता अनुसार रैंक की गई अन्य केंद्रीय एवं राज्य योजनाएं"
                : "Ranked by suitability score and financing limits for your enterprise"}
            </p>
          </div>
          <span className="text-xs font-semibold text-slate-600 bg-slate-100 px-3 py-1 rounded-full border border-slate-200">
            {schemes.length}{" "}
            {language === "hi" ? "योजनाएं उपलब्ध" : "Schemes Evaluated"}
          </span>
        </div>

        <div className="grid grid-cols-1 gap-4">
          {schemes.slice(1).map((scheme, idx) => {
            const isExpanded = expandedSchemeId === scheme.id;
            const isSelected = selectedSchemeId === scheme.id;

            return (
              <div
                key={scheme.id || idx}
                className={`bg-white rounded-2xl border transition-all duration-200 overflow-hidden shadow-sm ${
                  isSelected
                    ? "border-emerald-500 ring-2 ring-emerald-500/20"
                    : "border-slate-200 hover:border-slate-300"
                }`}
              >
                <div className="p-5 sm:p-6 space-y-4">
                  {/* Top line with title and score */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <div className="flex items-center space-x-2 text-[11px] font-semibold text-slate-500">
                        <span>
                          {scheme.agency || scheme.implementing_agency}
                        </span>
                        <span>•</span>
                        <span>{scheme.id}</span>
                      </div>
                      <h4 className="text-lg font-bold text-slate-900 mt-0.5">
                        {language === "hi" && scheme.nameHindi
                          ? scheme.nameHindi
                          : scheme.name}
                      </h4>
                      {language === "hi" && scheme.nameHindi && (
                        <p className="text-xs text-slate-500">{scheme.name}</p>
                      )}
                    </div>

                    <div className="flex items-center space-x-3 self-start sm:self-center">
                      <div className="text-right">
                        <span className="text-xs text-slate-400 block">
                          {language === "hi" ? "मिलान" : "Match"}
                        </span>
                        <span className="text-lg font-extrabold text-blue-700">
                          {scheme.matchScore || 70}%
                        </span>
                      </div>
                      <button
                        onClick={() => applySchemeToFinancials(scheme)}
                        className={`text-xs font-semibold px-3.5 py-1.5 rounded-xl border transition-all ${
                          isSelected
                            ? "bg-emerald-50 border-emerald-300 text-emerald-800"
                            : "bg-slate-50 hover:bg-blue-50 border-slate-200 hover:border-blue-300 text-slate-700 hover:text-blue-800"
                        }`}
                      >
                        {isSelected
                          ? language === "hi"
                            ? "लागू है ✔"
                            : "Selected ✔"
                          : language === "hi"
                            ? "चुनें"
                            : "Select Scheme"}
                      </button>
                    </div>
                  </div>

                  {/* Highlights Grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 p-3 rounded-xl text-xs">
                    <div>
                      <span className="text-slate-400 block text-[10px] uppercase font-bold">
                        {language === "hi" ? "अनुदान" : "Subsidy"}
                      </span>
                      <span className="font-bold text-slate-800 text-sm">
                        {scheme.subsidyPercent}%
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px] uppercase font-bold">
                        {language === "hi" ? "ब्याज दर" : "Interest"}
                      </span>
                      <span className="font-bold text-slate-800 text-sm">
                        {scheme.interestRate || scheme.interest_rate_percent}%
                        p.a.
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px] uppercase font-bold">
                        {language === "hi" ? "अधिकतम सीमा" : "Max Outlay"}
                      </span>
                      <span className="font-bold text-slate-800 text-sm">
                        ₹
                        {(
                          scheme.maxCost ||
                          scheme.max_project_cost ||
                          500000
                        ).toLocaleString("en-IN")}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px] uppercase font-bold">
                        {language === "hi" ? "अवधि" : "Max Tenure"}
                      </span>
                      <span className="font-bold text-slate-800 text-sm">
                        {scheme.maxTenureMonths ||
                          scheme.max_tenure_months ||
                          60}
                        m
                      </span>
                    </div>
                  </div>

                  {/* Summary match reasons */}
                  {scheme.matchReasons && scheme.matchReasons.length > 0 && (
                    <div className="space-y-1">
                      {scheme.matchReasons.slice(0, 2).map((r, i) => (
                        <p
                          key={i}
                          className="text-xs text-emerald-700 flex items-center space-x-1.5"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                          <span>{r.replace(/^✓\s*/, "")}</span>
                        </p>
                      ))}
                    </div>
                  )}

                  {/* Expandable details button */}
                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                    <button
                      onClick={() =>
                        setExpandedSchemeId(isExpanded ? null : scheme.id)
                      }
                      className="text-xs font-semibold text-blue-700 hover:text-blue-800 inline-flex items-center space-x-1"
                    >
                      <span>
                        {isExpanded
                          ? language === "hi"
                            ? "कम विवरण"
                            : "Show Less"
                          : language === "hi"
                            ? "दस्तावेज व नियम देखें"
                            : "View Criteria & Documents"}
                      </span>
                      {isExpanded ? (
                        <ChevronUp className="w-3.5 h-3.5" />
                      ) : (
                        <ChevronDown className="w-3.5 h-3.5" />
                      )}
                    </button>

                    {scheme.officialUrl && (
                      <a
                        href={scheme.officialUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-slate-500 hover:text-blue-700 inline-flex items-center space-x-1"
                      >
                        <span>
                          {language === "hi"
                            ? "आधिकारिक लिंक"
                            : "Official Portal"}
                        </span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </div>

                  {/* Expanded Section */}
                  {isExpanded && (
                    <div className="pt-4 border-t border-slate-200 space-y-4 text-xs">
                      <p className="text-slate-600 leading-relaxed">
                        {scheme.description || scheme.purpose}
                      </p>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="bg-slate-50 p-3.5 rounded-xl space-y-2 border border-slate-200">
                          <h5 className="font-bold text-slate-800 flex items-center space-x-1.5">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                            <span>
                              {language === "hi"
                                ? "पात्रता आवश्यकताएं"
                                : "Eligibility"}
                            </span>
                          </h5>
                          <ul className="space-y-1 text-slate-600">
                            {(
                              scheme.eligibilityCriteria || [
                                "Standard eligibility applies as per agency guidelines",
                              ]
                            ).map((item, i) => (
                              <li
                                key={i}
                                className="flex items-start space-x-1.5"
                              >
                                <span className="text-slate-400">•</span>
                                <span>{item}</span>
                              </li>
                            ))}
                          </ul>
                        </div>

                        <div className="bg-slate-50 p-3.5 rounded-xl space-y-2 border border-slate-200">
                          <h5 className="font-bold text-slate-800 flex items-center space-x-1.5">
                            <FileText className="w-3.5 h-3.5 text-blue-600" />
                            <span>
                              {language === "hi"
                                ? "दस्तावेज सूची"
                                : "Documents Required"}
                            </span>
                          </h5>
                          <ul className="space-y-1 text-slate-600">
                            {(
                              scheme.documentsRequired || [
                                "Identity proof",
                                "Address proof",
                                "Quotation",
                              ]
                            ).map((item, i) => (
                              <li
                                key={i}
                                className="flex items-start space-x-1.5"
                              >
                                <span className="text-slate-400">•</span>
                                <span>{item}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>

                      {scheme.disclaimer && (
                        <p className="text-[11px] text-slate-400 italic">
                          *{scheme.disclaimer}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* District & Ministry Direct Contact Support Callout */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-200 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="space-y-1.5 text-center md:text-left">
          <div className="inline-flex items-center space-x-1.5 text-xs font-bold text-blue-800 uppercase tracking-wide">
            <PhoneCall className="w-3.5 h-3.5 text-blue-600" />
            <span>
              {language === "hi"
                ? "सहायता केंद्र एवं जिला उद्योग केंद्र (DIC)"
                : "Institutional Assistance & DIC Desk"}
            </span>
          </div>
          <h4 className="text-base font-bold text-slate-900">
            {language === "hi"
              ? "बिचौलियों से सावधान रहें — सरकारी योजनाओं के लिए कोई शुल्क नहीं लगता"
              : "Zero Brokerage / Direct Government Facilitation"}
          </h4>
          <p className="text-xs text-slate-600 max-w-2xl">
            {language === "hi"
              ? `सीहोर जिला उद्योग केंद्र (DIC) अथवा निकटतम ग्रामीण बैंक शाखा में अपनी व्यवहार्यता रिपोर्ट लेकर जाएं। सामाजिक न्याय एवं अधिकारिता मंत्रालय हेल्पलाइन: 1800-11-2001 (टोल-फ्री).`
              : `Visit the District Industries Centre (DIC), ${profile.district || "Sehore"} or your local Gramin Bank branch with your PARIVARTAN appraisal dossier. National MoSJE toll-free: 1800-11-2001.`}
          </p>
        </div>

        <div className="shrink-0 flex items-center space-x-3">
          <div className="text-center px-4 py-2 bg-white rounded-xl border border-blue-200 shadow-sm">
            <span className="text-[10px] text-slate-500 font-bold block">
              {language === "hi" ? "टोल फ्री नंबर" : "National Helpline"}
            </span>
            <span className="text-sm font-extrabold text-blue-800">
              1800-11-2001
            </span>
          </div>
        </div>
      </div>

      {/* Bottom Step Navigation Bar */}
      <div className="flex items-center justify-between pt-4 border-t border-slate-200">
        <button
          onClick={() => setActiveStep(4)}
          className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-sm font-semibold transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>
            {language === "hi"
              ? "वित्तीय योजना पर वापस"
              : "Back to Financial Plan"}
          </span>
        </button>

        <button
          onClick={() => setActiveStep(6)}
          className="inline-flex items-center space-x-2 px-6 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-700 text-white text-sm font-bold shadow-md hover:shadow-lg transition-all"
        >
          <span>
            {language === "hi"
              ? "अंतिम व्यवहार्यता रिपोर्ट देखें"
              : "Generate Feasibility Dossier"}
          </span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
export default SchemeRouterView;
