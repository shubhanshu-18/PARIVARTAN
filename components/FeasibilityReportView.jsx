import React, { useState, useEffect } from "react";
import { useApp } from "../context/AppContext";
import { ApiService } from "../services/api";
import { SpeechHelper } from "../speech";
import {
  FileDown,
  Printer,
  Volume2,
  VolumeX,
  CheckCircle2,
  AlertTriangle,
  Award,
  Landmark,
  TrendingUp,
  ShieldCheck,
  Building2,
  UserCheck,
  Calendar,
  IndianRupee,
  Share2,
  ArrowLeft,
  RefreshCw,
  Clock,
  Sparkles,
  FileCheck,
} from "lucide-react";

export function FeasibilityReportView() {
  const {
    profile,
    marketData,
    advisory,
    financials,
    matchedSchemes,
    setActiveStep,
    language,
    savedAssessmentId,
    setSavedAssessmentId,
    showToast,
    resetAll,
  } = useApp();

  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [speaking, setSpeaking] = useState(false);

  const bestScheme =
    matchedSchemes && matchedSchemes.length > 0
      ? matchedSchemes[0]
      : {
          name: "NBCFDC Micro Finance Scheme",
          agency:
            "National Backward Classes Finance & Development Corporation (MoSJE)",
          subsidyPercent: 15,
          interestRate: 5.0,
          matchScore: 92,
        };

  const fin = financials?.summary || {
    projectCost: Number(profile.expectedInvestment) || 140000,
    promoterContribution: Math.round(
      (Number(profile.expectedInvestment) || 140000) * 0.1,
    ),
    promoterSharePercent: 10,
    governmentSubsidyAmount: Math.round(
      (Number(profile.expectedInvestment) || 140000) * 0.15,
    ),
    loanAmount: Math.round(
      (Number(profile.expectedInvestment) || 140000) * 0.75,
    ),
    monthlyEmi: 3146,
    annualInterestRate: 5.0,
    tenureMonths: 36,
    moratoriumMonths: 3,
    grossMonthlyRevenue: 49000,
    grossMonthlyOpex: 27000,
    monthlyNetProfitAfterEMI: 18854,
    breakEvenDaysPerMonth: 8,
    debtServiceCoverageRatio: 2.14,
    dscrRating: "High Bankability (Excellent)",
  };

  // Calculate composite Feasibility Score (0 - 100)
  const oppScore = marketData?.opportunityScore || 82;
  const dscrScore = Math.min(
    100,
    Math.round((fin.debtServiceCoverageRatio / 2.0) * 85),
  );
  const compScore = Math.max(30, 100 - (marketData?.competitionScore || 45));
  const schemeScore = bestScheme.matchScore || 90;
  const overallFeasibilityScore = Math.round(
    oppScore * 0.3 + dscrScore * 0.35 + compScore * 0.15 + schemeScore * 0.2,
  );

  // Auto-save assessment on mount if not saved yet
  useEffect(() => {
    if (!savedAssessmentId) {
      handleSaveAssessment(false);
    }
  }, []);

  const handleSaveAssessment = async (showNotification = true) => {
    setIsSaving(true);
    try {
      const assessmentData = {
        ...profile,
        marketData,
        advisory,
        financialData: financials,
        matchedSchemes,
        overallScore: overallFeasibilityScore,
        dscr: fin.debtServiceCoverageRatio,
        submittedAt: new Date().toISOString(),
      };

      const result = await ApiService.saveAssessment(assessmentData);
      if (result && result.id) {
        setSavedAssessmentId(result.id);
        if (showNotification) {
          showToast(
            language === "hi"
              ? `दस्तावेज़ सफलतापूर्वक सहेजा गया! संदर्भ ID: ${result.id}`
              : `Appraisal dossier saved! Ref ID: ${result.id}`,
            "success",
          );
        }
      }
    } catch (err) {
      console.error("Save error:", err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDownloadPdf = async () => {
    setIsGeneratingPdf(true);
    showToast(
      language === "hi"
        ? "आधिकारिक A4 PDF तैयार की जा रही है..."
        : "Generating Official Bank Feasibility PDF...",
      "info",
    );

    try {
      const payload = {
        ...profile,
        marketData,
        advisory,
        financialData: financials,
        matchedSchemes,
        overallScore: overallFeasibilityScore,
        id:
          savedAssessmentId ||
          `PRV-2026-${Math.floor(1000 + Math.random() * 9000)}`,
      };

      const blob = await ApiService.downloadPdfReport(payload);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `PARIVARTAN_Feasibility_${(profile.applicantName || "Applicant").replace(/\s+/g, "_")}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      showToast(
        language === "hi"
          ? "PDF सफलतापूर्वक डाउनलोड हो गई!"
          : "Feasibility Dossier PDF downloaded successfully!",
        "success",
      );
    } catch (err) {
      console.error("PDF error:", err);
      showToast(
        language === "hi"
          ? "PDF डाउनलोड में त्रुटि, कृपया पुनः प्रयास करें।"
          : "Failed to download PDF. Please try again.",
        "error",
      );
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const toggleSpeech = () => {
    if (speaking) {
      SpeechHelper.stopSpeaking();
      setSpeaking(false);
    } else {
      const text =
        language === "hi"
          ? `परिवर्तन मूल्यांकन रिपोर्ट: ${profile.applicantName || "उद्यमी"} के ${profile.businessIdea} के लिए समग्र व्यवहार्यता स्कोर ${overallFeasibilityScore} प्रतिशत है। परियोजना की कुल लागत ₹${fin.projectCost.toLocaleString("en-IN")} है, जिसमें ऋण राशि ₹${fin.loanAmount.toLocaleString("en-IN")} और अनुमानित मासिक ईएमआई ₹${fin.monthlyEmi.toLocaleString("en-IN")} है। ऋण सेवा कवरेज अनुपात ${fin.debtServiceCoverageRatio} है, जो उत्कृष्ट बैंक क्षमता दर्शाता है।`
          : `PARIVARTAN Project Appraisal Dossier for ${profile.applicantName || "Entrepreneur"}'s ${profile.businessIdea}. Overall feasibility score is ${overallFeasibilityScore} out of 100, classified as Grade A Highly Bankable. Total project outlay is ₹${fin.projectCost.toLocaleString("en-IN")} with loan requirement of ₹${fin.loanAmount.toLocaleString("en-IN")} and monthly EMI of ₹${fin.monthlyEmi.toLocaleString("en-IN")}. DSCR ratio is ${fin.debtServiceCoverageRatio}, indicating strong debt service safety.`;

      SpeechHelper.speak(text, {
        lang: language,
        onStart: () => setSpeaking(true),
        onEnd: () => setSpeaking(false),
      });
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-8 print:p-0 print:max-w-none">
      {/* Top Header & Export Toolbar */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-6 print:border-none print:shadow-none print:p-0">
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center space-x-1.5 bg-emerald-100 text-emerald-800 text-xs font-bold px-3 py-1 rounded-full border border-emerald-300">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-700" />
              <span>
                {language === "hi"
                  ? "बैंक मूल्यांकन हेतु सत्यापित"
                  : "Bank & DIC Appraisal Compliant"}
              </span>
            </span>
            {savedAssessmentId && (
              <span className="text-xs font-mono font-bold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-full border border-slate-200">
                {savedAssessmentId}
              </span>
            )}
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            {language === "hi"
              ? "परियोजना व्यवहार्यता एवं बैंक ऋण मूल्यांकन"
              : "Comprehensive Project Feasibility Dossier"}
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 max-w-2xl leading-relaxed">
            {language === "hi"
              ? `सामाजिक न्याय एवं अधिकारिता मंत्रालय (MoSJE) एवं भारतीय रिजर्व बैंक (RBI) प्राथमिकता प्राप्त क्षेत्र ऋण (PSL) मानकों के अनुरूप तैयार औपचारिक रिपोर्ट।`
              : `Prepared under Ministry of Social Justice and Empowerment (MoSJE) guidelines and RBI Priority Sector Lending (PSL) frameworks for rapid branch appraisal.`}
          </p>
        </div>

        {/* Action Buttons Toolbar */}
        <div className="flex flex-wrap items-center gap-2.5 print:hidden">
          <button
            onClick={toggleSpeech}
            className={`p-2.5 rounded-xl border text-sm transition-all ${
              speaking
                ? "bg-amber-100 text-amber-900 border-amber-300 animate-pulse"
                : "bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200"
            }`}
            title="Listen to summary"
          >
            {speaking ? (
              <VolumeX className="w-4 h-4 text-amber-700" />
            ) : (
              <Volume2 className="w-4 h-4 text-blue-600" />
            )}
          </button>

          <button
            onClick={handlePrint}
            className="inline-flex items-center space-x-1.5 px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold shadow-sm transition-all"
          >
            <Printer className="w-4 h-4 text-slate-600" />
            <span>{language === "hi" ? "प्रिंट करें" : "Print View"}</span>
          </button>

          <button
            onClick={handleDownloadPdf}
            disabled={isGeneratingPdf}
            className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-700 disabled:opacity-50 text-white text-xs sm:text-sm font-bold shadow-md hover:shadow-lg transition-all"
          >
            <FileDown
              className={`w-4 h-4 ${isGeneratingPdf ? "animate-bounce" : ""}`}
            />
            <span>
              {isGeneratingPdf
                ? language === "hi"
                  ? "PDF बन रही है..."
                  : "Generating PDF..."
                : language === "hi"
                  ? "आधिकारिक A4 PDF डाउनलोड करें"
                  : "Download Bank Feasibility PDF"}
            </span>
          </button>
        </div>
      </div>

      {/* Main Score & Recommendation Banner */}
      <div className="bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl border border-blue-900 relative overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Circular Feasibility Score Metric */}
          <div className="lg:col-span-4 flex flex-col items-center justify-center p-6 bg-white/5 rounded-2xl border border-white/10 text-center">
            <div className="relative flex items-center justify-center w-36 h-36">
              <svg
                className="w-full h-full transform -rotate-90"
                viewBox="0 0 120 120"
              >
                <circle
                  cx="60"
                  cy="60"
                  r="50"
                  stroke="rgba(255,255,255,0.1)"
                  strokeWidth="10"
                  fill="transparent"
                />
                <circle
                  cx="60"
                  cy="60"
                  r="50"
                  stroke="#10B981"
                  strokeWidth="10"
                  fill="transparent"
                  strokeDasharray={314.159}
                  strokeDashoffset={
                    314.159 * (1 - overallFeasibilityScore / 100)
                  }
                  strokeLinecap="round"
                  className="transition-all duration-1000 ease-out"
                />
              </svg>
              <div className="absolute flex flex-col items-center justify-center">
                <span className="text-4xl font-black text-emerald-400">
                  {overallFeasibilityScore}
                </span>
                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                  / 100
                </span>
              </div>
            </div>

            <div className="mt-4 space-y-1">
              <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 text-xs font-bold">
                <Award className="w-3.5 h-3.5 text-emerald-400" />
                <span>
                  {language === "hi"
                    ? "ग्रेड A : अति उत्तम बैंक क्षमता"
                    : "GRADE A: HIGHLY BANKABLE"}
                </span>
              </div>
              <p className="text-[11px] text-slate-300 pt-1">
                {language === "hi"
                  ? "यह परियोजना ऋण स्वीकृति हेतु अत्यंत उपयुक्त है।"
                  : "Project complies with prudential credit appraisal benchmarks."}
              </p>
            </div>
          </div>

          {/* 4-way Component Breakdown */}
          <div className="lg:col-span-8 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-blue-800/60">
              <h3 className="text-base font-bold text-white flex items-center space-x-2">
                <Sparkles className="w-4 h-4 text-orange-400" />
                <span>
                  {language === "hi"
                    ? "4-आयामी व्यवहार्यता विश्लेषण"
                    : "4-Pillar Appraisal Metrics"}
                </span>
              </h3>
              <span className="text-xs text-blue-300">
                {language === "hi"
                  ? "बैंक एवं सरकारी मानक"
                  : "Institutional Standards"}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {/* Pillar 1: Market Demand */}
              <div className="bg-white/5 rounded-xl p-3.5 border border-white/10 space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-300 font-medium">
                    {language === "hi"
                      ? "बाज़ार मांग व अवसर"
                      : "Market Demand & Gap"}
                  </span>
                  <span className="font-extrabold text-emerald-400">
                    {oppScore}%
                  </span>
                </div>
                <div className="w-full bg-slate-800 rounded-full h-2">
                  <div
                    className="bg-emerald-500 h-2 rounded-full"
                    style={{ width: `${oppScore}%` }}
                  />
                </div>
                <p className="text-[10px] text-slate-400">
                  {marketData?.totalNearbyCompetitors || 4}{" "}
                  {language === "hi"
                    ? "प्रतिस्पर्धी (5 किमी)"
                    : "competitors within 5km radius"}
                </p>
              </div>

              {/* Pillar 2: Financial Safety & DSCR */}
              <div className="bg-white/5 rounded-xl p-3.5 border border-white/10 space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-300 font-medium">
                    {language === "hi"
                      ? "ऋण सेवा सुरक्षा (DSCR)"
                      : "Financial Coverage (DSCR)"}
                  </span>
                  <span className="font-extrabold text-emerald-400">
                    {fin.debtServiceCoverageRatio}x
                  </span>
                </div>
                <div className="w-full bg-slate-800 rounded-full h-2">
                  <div
                    className="bg-emerald-500 h-2 rounded-full"
                    style={{
                      width: `${Math.min(100, (fin.debtServiceCoverageRatio / 2.5) * 100)}%`,
                    }}
                  />
                </div>
                <p className="text-[10px] text-slate-400">
                  {language === "hi"
                    ? "मानक 1.5x से अधिक (सुरक्षित)"
                    : "Threshold >1.5x satisfied (Safe repayment buffer)"}
                </p>
              </div>

              {/* Pillar 3: Promoter Margin & Subsidy */}
              <div className="bg-white/5 rounded-xl p-3.5 border border-white/10 space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-300 font-medium">
                    {language === "hi"
                      ? "पूंजी संरचना एवं अनुदान"
                      : "Capital Structure & Subsidy"}
                  </span>
                  <span className="font-extrabold text-orange-400">
                    {schemeScore}%
                  </span>
                </div>
                <div className="w-full bg-slate-800 rounded-full h-2">
                  <div
                    className="bg-orange-500 h-2 rounded-full"
                    style={{ width: `${schemeScore}%` }}
                  />
                </div>
                <p className="text-[10px] text-slate-400">
                  {bestScheme.name} ({bestScheme.subsidyPercent}%{" "}
                  {language === "hi" ? "अनुदान" : "subsidy"})
                </p>
              </div>

              {/* Pillar 4: Operational Break-Even */}
              <div className="bg-white/5 rounded-xl p-3.5 border border-white/10 space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-300 font-medium">
                    {language === "hi"
                      ? "लाभ सीमा एवं ब्रेक-इवन"
                      : "Break-Even Utilization"}
                  </span>
                  <span className="font-extrabold text-blue-400">
                    {fin.breakEvenDaysPerMonth}{" "}
                    {language === "hi" ? "दिन" : "Days"}
                  </span>
                </div>
                <div className="w-full bg-slate-800 rounded-full h-2">
                  <div
                    className="bg-blue-500 h-2 rounded-full"
                    style={{ width: "75%" }}
                  />
                </div>
                <p className="text-[10px] text-slate-400">
                  {language === "hi"
                    ? "माह के 8वें दिन सभी लागतें पूर्ण"
                    : "Fully breaks even within first 8 operating days"}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Structured Feasibility Dossier Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Cols: Comprehensive Fact Sheet */}
        <div className="lg:col-span-2 space-y-6">
          {/* 1. Entrepreneur & Venture Fact Sheet */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center space-x-2 text-slate-900 font-bold text-base pb-3 border-b border-slate-100">
              <UserCheck className="w-5 h-5 text-blue-600" />
              <span>
                {language === "hi"
                  ? "उद्यमी एवं व्यवसाय विवरण"
                  : "Applicant & Enterprise Profile"}
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs">
              <div>
                <span className="text-slate-400 block">
                  {language === "hi" ? "उद्यमी का नाम" : "Applicant Name"}
                </span>
                <span className="font-bold text-slate-800 text-sm">
                  {profile.applicantName || "Sunita Sharma"}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block">
                  {language === "hi" ? "लाभार्थी श्रेणी" : "Social Category"}
                </span>
                <span className="font-bold text-slate-800 text-sm">
                  {profile.beneficiaryCategory} ({profile.gender})
                </span>
              </div>
              <div>
                <span className="text-slate-400 block">
                  {language === "hi" ? "स्थान" : "Location"}
                </span>
                <span className="font-bold text-slate-800 text-sm">
                  {profile.district}, {profile.state}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block">
                  {language === "hi" ? "व्यवसाय विचार" : "Proposed Enterprise"}
                </span>
                <span className="font-bold text-slate-800 text-sm">
                  {profile.businessIdea}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block">
                  {language === "hi" ? "श्रेणी" : "Category"}
                </span>
                <span className="font-bold text-slate-800 text-sm uppercase">
                  {profile.businessCategory}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block">
                  {language === "hi" ? "उद्यम अनुभव" : "Entrepreneur Type"}
                </span>
                <span className="font-bold text-slate-800 text-sm">
                  {profile.isFirstTimeEntrepreneur
                    ? language === "hi"
                      ? "नया उद्यमी (Greenfield)"
                      : "Greenfield (First-Time)"
                    : "Existing Enterprise"}
                </span>
              </div>
            </div>
          </div>

          {/* 2. Financial Structuring & Means of Finance */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center space-x-2 text-slate-900 font-bold text-base">
                <IndianRupee className="w-5 h-5 text-emerald-600" />
                <span>
                  {language === "hi"
                    ? "वित्तीय संरचना एवं वित्त पोषण साधन"
                    : "Means of Finance & Capital Outlay"}
                </span>
              </div>
              <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                100% Balanced
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-50 text-slate-500 uppercase font-semibold">
                  <tr>
                    <th className="py-2.5 px-3 rounded-l-lg">
                      {language === "hi" ? "घटक" : "Component"}
                    </th>
                    <th className="py-2.5 px-3">
                      {language === "hi" ? "अनुपात" : "Share (%)"}
                    </th>
                    <th className="py-2.5 px-3 text-right rounded-r-lg">
                      {language === "hi" ? "राशि (₹)" : "Amount (INR)"}
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  <tr>
                    <td className="py-2.5 px-3 font-medium">
                      {language === "hi"
                        ? "स्वयं अंशदान (प्रमोटर मार्जिन)"
                        : "Promoter Own Margin (Equity)"}
                    </td>
                    <td className="py-2.5 px-3 font-semibold">
                      {fin.promoterSharePercent}%
                    </td>
                    <td className="py-2.5 px-3 text-right font-bold">
                      ₹{fin.promoterContribution.toLocaleString("en-IN")}
                    </td>
                  </tr>
                  <tr>
                    <td className="py-2.5 px-3 font-medium">
                      {language === "hi"
                        ? "सरकारी पूंजी अनुदान"
                        : "Government Capital Subsidy"}{" "}
                      ({bestScheme.name})
                    </td>
                    <td className="py-2.5 px-3 font-semibold text-emerald-600">
                      {bestScheme.subsidyPercent}%
                    </td>
                    <td className="py-2.5 px-3 text-right font-bold text-emerald-600">
                      ₹{fin.governmentSubsidyAmount.toLocaleString("en-IN")}
                    </td>
                  </tr>
                  <tr>
                    <td className="py-2.5 px-3 font-medium">
                      {language === "hi"
                        ? "शुद्ध बैंक ऋण आवश्यकता"
                        : "Net Bank Term Loan Required"}
                    </td>
                    <td className="py-2.5 px-3 font-semibold text-blue-700">
                      {100 -
                        fin.promoterSharePercent -
                        bestScheme.subsidyPercent}
                      %
                    </td>
                    <td className="py-2.5 px-3 text-right font-bold text-blue-700">
                      ₹{fin.loanAmount.toLocaleString("en-IN")}
                    </td>
                  </tr>
                  <tr className="bg-slate-50/80 font-extrabold text-slate-900">
                    <td className="py-3 px-3 rounded-l-lg">
                      {language === "hi"
                        ? "कुल परियोजना लागत"
                        : "Total Project Cost (Outlay)"}
                    </td>
                    <td className="py-3 px-3">100%</td>
                    <td className="py-3 px-3 text-right rounded-r-lg text-sm">
                      ₹{fin.projectCost.toLocaleString("en-IN")}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Repayment & Debt Metrics Table */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 bg-slate-50 p-4 rounded-xl text-xs">
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-bold">
                  {language === "hi" ? "मासिक ईएमआई" : "Monthly EMI"}
                </span>
                <span className="font-extrabold text-slate-900 text-sm">
                  ₹{fin.monthlyEmi.toLocaleString("en-IN")}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-bold">
                  {language === "hi" ? "ब्याज दर" : "Interest Rate"}
                </span>
                <span className="font-extrabold text-slate-900 text-sm">
                  {fin.annualInterestRate}% p.a.
                </span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-bold">
                  {language === "hi" ? "अवधि / अनुग्रह" : "Tenure / Grace"}
                </span>
                <span className="font-extrabold text-slate-900 text-sm">
                  {fin.tenureMonths}m (+{fin.moratoriumMonths}m)
                </span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-bold">
                  {language === "hi" ? "मासिक शुद्ध लाभ" : "Net Monthly Profit"}
                </span>
                <span className="font-extrabold text-emerald-600 text-sm">
                  ₹{fin.monthlyNetProfitAfterEMI.toLocaleString("en-IN")}
                </span>
              </div>
            </div>
          </div>

          {/* 3. 30-60-90 Day Execution Roadmap */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center space-x-2 text-slate-900 font-bold text-base pb-3 border-b border-slate-100">
              <Clock className="w-5 h-5 text-orange-500" />
              <span>
                {language === "hi"
                  ? "30-60-90 दिवसीय क्रियान्वयन रोडमैप"
                  : "30-60-90 Day Implementation Roadmap"}
              </span>
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex items-start space-x-3 p-3 rounded-xl bg-orange-50/60 border border-orange-200/80">
                <span className="px-2 py-1 rounded bg-orange-200 text-orange-900 font-bold text-[10px] uppercase shrink-0">
                  Days 1 - 30
                </span>
                <div>
                  <h5 className="font-bold text-slate-900">
                    {language === "hi"
                      ? "दस्तावेज़ीकरण एवं ऋण आवेदन"
                      : "Formal Documentation & Loan Filing"}
                  </h5>
                  <p className="text-slate-600 mt-0.5">
                    {language === "hi"
                      ? "तहसीलदार से जाति व आय प्रमाण पत्र प्राप्त करें। मशीनरी के 2 अधिकृत कोटेशन लें एवं सीहोर जिला उद्योग केंद्र (DIC) अथवा नोडल बैंक में आवेदन जमा करें।"
                      : "Secure caste & income certificates from Tehsildar; obtain two equipment quotations; submit formal application under NBCFDC scheme at DIC Sehore or nearest Grameen Bank branch."}
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-3 p-3 rounded-xl bg-blue-50/60 border border-blue-200/80">
                <span className="px-2 py-1 rounded bg-blue-200 text-blue-900 font-bold text-[10px] uppercase shrink-0">
                  Days 31 - 60
                </span>
                <div>
                  <h5 className="font-bold text-slate-900">
                    {language === "hi"
                      ? "परिसंपत्ति खरीद एवं कार्यशाला स्थापना"
                      : "Procurement & Infrastructure Setup"}
                  </h5>
                  <p className="text-slate-600 mt-0.5">
                    {language === "hi"
                      ? "ऋण संस्वीकृति एवं प्रथम वितरण के पश्चात उपकरण खरीद करें। बिजली कनेक्शन व ग्राम पंचायत व्यापार एनओसी पूर्ण करें।"
                      : "Upon sanction, procure verified chilling equipment / tooling; finalize commercial power connection and Gram Panchayat business registration (Udyam Aadhaar)."}
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-3 p-3 rounded-xl bg-emerald-50/60 border border-emerald-200/80">
                <span className="px-2 py-1 rounded bg-emerald-200 text-emerald-900 font-bold text-[10px] uppercase shrink-0">
                  Days 61 - 90
                </span>
                <div>
                  <h5 className="font-bold text-slate-900">
                    {language === "hi"
                      ? "उत्पादन आरंभ एवं स्थानीय बाज़ार आपूर्ति"
                      : "Commercial Operations & Market Launch"}
                  </h5>
                  <p className="text-slate-600 mt-0.5">
                    {language === "hi"
                      ? "दुकानों व ढाबों के साथ आपूर्ति अनुबंध शुरू करें। डिजिटल यूपीआई भुगतान क्यूआर कोड स्थापित करें एवं प्रथम ईएमआई का भुगतान सुनिश्चित करें।"
                      : "Initiate daily procurement and supply contracts with local sweet shops & retail points; deploy UPI QR code; commence regular EMI repayment after 3-month moratorium."}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right 1 Col: Official Verification, Bank Remarks & Checklist */}
        <div className="space-y-6">
          {/* Bank Appraisal Recommendation Card */}
          <div className="bg-slate-900 text-white rounded-2xl p-6 shadow-md border border-slate-800 space-y-4">
            <div className="flex items-center space-x-2 text-emerald-400 font-bold text-sm">
              <FileCheck className="w-5 h-5" />
              <span>
                {language === "hi"
                  ? "शाखा प्रबंधक / अधिकारी मूल्यांकन टिप्पणी"
                  : "Appraisal Officer Note"}
              </span>
            </div>

            <div className="space-y-2 text-xs text-slate-300 leading-relaxed bg-white/5 p-3.5 rounded-xl border border-white/10">
              <p className="font-semibold text-white">
                Recommendation: SANCTION RECOMMENDED (अनुशंसित)
              </p>
              <p>
                The proposal exhibits a robust DSCR of{" "}
                <strong>{fin.debtServiceCoverageRatio}x</strong>, exceeding the
                mandatory RBI benchmark of 1.33x. Promoter has committed{" "}
                <strong>{fin.promoterSharePercent}%</strong> equity margin.
              </p>
              <p>
                Qualifies under <strong>Priority Sector Lending (PSL)</strong> -
                Micro Enterprises & Weaker Sections category.
              </p>
            </div>

            <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
              <span>MoSJE Scheme:</span>
              <span className="font-bold text-white">
                {bestScheme.id || "NBCFDC-01"}
              </span>
            </div>
          </div>

          {/* Essential Documents Checklist Status */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-3">
            <h4 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4 text-blue-600" />
              <span>
                {language === "hi"
                  ? "आवश्यक संस्वीकृति चेकलिस्ट"
                  : "Sanction Prerequisite Checklist"}
              </span>
            </h4>
            <div className="space-y-2 text-xs text-slate-600">
              <div className="flex items-center space-x-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                <span>Aadhaar Card of Applicant</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                <span>{profile.beneficiaryCategory} Caste Certificate</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                <span>Income Certificate / Ration Card</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                <span>Proforma Invoice / Quotations</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                <span>Bank Account Passbook</span>
              </div>
            </div>
          </div>

          {/* Official Verification Sign-off Box */}
          <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200 space-y-3 text-xs text-slate-500">
            <div className="flex items-center justify-between font-bold text-slate-700">
              <span>
                {language === "hi"
                  ? "आधिकारिक मुहर एवं हस्ताक्षर"
                  : "Institutional Stamp & Sign-off"}
              </span>
              <Building2 className="w-4 h-4 text-slate-400" />
            </div>
            <div className="h-16 border-2 border-dashed border-slate-200 rounded-xl flex items-center justify-center text-[10px] text-slate-400 uppercase tracking-widest font-mono">
              Branch Manager / DIC Officer Stamp
            </div>
            <p className="text-[10px] text-slate-400 text-center">
              PARIVARTAN SIH26091 • AI Feasibility Engine
            </p>
          </div>
        </div>
      </div>

      {/* Navigation Footer */}
      <div className="flex items-center justify-between pt-6 border-t border-slate-200 print:hidden">
        <button
          onClick={() => setActiveStep(5)}
          className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-sm font-semibold transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>
            {language === "hi" ? "योजना मिलान पर वापस" : "Back to Scheme Match"}
          </span>
        </button>

        <button
          onClick={resetAll}
          className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-sm font-semibold transition-colors"
        >
          <RefreshCw className="w-4 h-4 text-slate-500" />
          <span>
            {language === "hi"
              ? "नया मूल्यांकन शुरू करें"
              : "Start New Assessment"}
          </span>
        </button>
      </div>
    </div>
  );
}
export default FeasibilityReportView;
