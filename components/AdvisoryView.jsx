import React from "react";
import { useApp } from "../context/AppContext";
import { t } from "../utils/translations";
import { SpeechHelper } from "../speech";
import {
  Sparkles,
  Volume2,
  VolumeX,
  ShieldAlert,
  Tag,
  Users,
  MapPin,
  CheckCircle,
  AlertCircle,
  TrendingUp,
  ArrowRight,
  ArrowLeft,
  ListOrdered,
  Clock,
  Zap,
} from "lucide-react";

export function AdvisoryView() {
  const {
    profile,
    advisory,
    setActiveStep,
    language,
    isSpeaking,
    setIsSpeaking,
    showToast,
  } = useApp();

  const adv = advisory || {
    strengths: [
      "High daily village demand for core essentials",
      "Low fixed operational overhead in rural cluster",
      "Direct community trust and relationship with farming households",
    ],
    weaknesses: [
      "Informal cash bookkeeping and credit tracking challenges",
      "Limited working capital buffers for bulk raw purchases",
      "Reliance on single founder for all operations",
    ],
    opportunities: [
      "Concessional bank credit under MoSJE schemes (NBCFDC/PMEGP)",
      "Digital payment adoption via QR/UPI for transparent cash tracking",
      "Direct value-added processing for higher gross margins",
    ],
    threats: [
      "Price undercutting by town distributors along the highway",
      "Unpaid consumer credit defaults (informal Udhar)",
      "Seasonal fluctuations linked to agricultural harvest cycles",
    ],
    risks: [
      {
        risk: "Excessive customer credit defaults",
        severity: "High",
        mitigation:
          "Enforce strict 7-day credit cap and use a digital ledger app",
      },
      {
        risk: "Working capital starvation in early months",
        severity: "Medium",
        mitigation: "Keep 25% of loan proceeds as liquid buffer",
      },
      {
        risk: "Lack of formal registration delaying subsidies",
        severity: "Medium",
        mitigation: "File Udyam MSME application on Day 1",
      },
    ],
    pricing: {
      strategy: "Competitive quality parity with convenience margin",
      recommendedPriceRange: "Cost + 25% to 35% gross markup",
      rationale:
        "Matches town retail pricing while saving village consumers travel time and transport fares.",
    },
    targetCustomers: {
      primary: "Local farming families and village residents",
      secondary:
        "Commuters and roadside travellers along the main district route",
      ageGroup: "18-65 years",
      incomeLevel: "Rural and semi-urban households",
    },
    locationStrategy:
      "Proximity to Panchayat Bhavan or main village intersection adjacent to grocery cluster.",
    operatingModel:
      "Direct owner-operated counter with flexible morning and evening hours matching agricultural routines.",
    nextActions: [
      {
        priority: 1,
        action: "Register enterprise on Udyam Aadhaar Portal",
        timeline: "Days 1 - 7",
        impact: "High",
        detail: "Mandatory MSME registration number.",
      },
      {
        priority: 2,
        action: "Obtain machinery & tool proforma quotations",
        timeline: "Days 7 - 14",
        impact: "High",
        detail: "Required for bank loan sanction.",
      },
      {
        priority: 3,
        action: "Apply for NBCFDC / PMEGP via Lead Bank / DIC",
        timeline: "Days 15 - 25",
        impact: "High",
        detail: "Submit with 10% margin proof.",
      },
      {
        priority: 4,
        action: "Finalize site lease agreement & electricity line",
        timeline: "Days 20 - 30",
        impact: "Medium",
        detail: "Ensures physical inspection clearance.",
      },
      {
        priority: 5,
        action: "Launch 30-day pre-order village campaign",
        timeline: "Days 30 - 45",
        impact: "High",
        detail: "Tests local demand before first EMI.",
      },
    ],
  };

  const handleReadAloud = () => {
    if (isSpeaking) {
      SpeechHelper.stopSpeaking();
      setIsSpeaking(false);
      showToast("Voice stopped", "info");
      return;
    }

    setIsSpeaking(true);
    showToast(
      language === "hi"
        ? "सलाह का वाचन प्रारंभ..."
        : "Reading advisory aloud...",
      "info",
    );

    const speechText =
      language === "hi"
        ? `आपके उद्यम ${profile.businessIdea} के लिए मुख्य सलाह: ताकत है स्थानीय दैनिक मांग। मुख्य अवसर है रियायती सरकारी ऋण। पहला कदम है सात दिनों के भीतर उद्यम आधार पंजीकरण कराना।`
        : `Advisory summary for ${profile.businessIdea}: Key strength is high local daily demand. Prime opportunity is concessional credit under government schemes. Your immediate next action is Udyam registration within seven days.`;

    SpeechHelper.speak(speechText, {
      lang: language === "en" ? "en" : "hi",
      onEnd: () => setIsSpeaking(false),
    });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 space-y-5 animate-in fade-in duration-300">
      {/* Header Banner */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-purple-50 text-purple-700 border border-purple-200 mb-2">
              <Sparkles className="w-3.5 h-3.5 text-purple-600" />
              <span>Step 3 of 6 • Personalized Strategic Roadmap</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-navy-900 tracking-tight">
              {t("advisory.title", language)}
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 mt-1">
              Enterprise:{" "}
              <strong className="text-slate-800">
                {profile.businessIdea || "Rural Enterprise"}
              </strong>{" "}
              • Category:{" "}
              <span className="capitalize">{profile.businessCategory}</span>
            </p>
          </div>

          {/* Voice Readout Button */}
          <button
            onClick={handleReadAloud}
            className={`inline-flex items-center space-x-2 px-4 py-2.5 rounded-lg text-xs font-bold transition shadow-sm border ${
              isSpeaking
                ? "bg-rose-600 border-rose-500 text-white animate-pulse"
                : "bg-purple-50 border-purple-300 text-purple-800 hover:bg-purple-100"
            }`}
          >
            {isSpeaking ? (
              <VolumeX className="w-4 h-4" />
            ) : (
              <Volume2 className="w-4 h-4 text-purple-600" />
            )}
            <span>
              {isSpeaking
                ? t("advisory.stopSpeaking", language)
                : t("advisory.readAloud", language)}
            </span>
          </button>
        </div>
      </div>

      {/* 4-QUADRANT SWOT MATRIX */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 sm:p-6">
        <div className="flex items-center space-x-2 pb-3 mb-4 border-b border-slate-100">
          <Zap className="w-4 h-4 text-orange-500" />
          <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wide">
            Enterprise SWOT Matrix
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Strengths (Emerald) */}
          <div className="p-4 rounded-xl bg-emerald-50/60 border border-emerald-200">
            <div className="flex items-center space-x-2 pb-2 mb-3 border-b border-emerald-200/60 text-emerald-800">
              <CheckCircle className="w-4 h-4 text-emerald-600" />
              <h3 className="text-xs font-bold uppercase tracking-wider">
                {t("advisory.strengths", language)}
              </h3>
            </div>
            <ul className="space-y-2 text-xs text-slate-700">
              {(adv.strengths || []).map((s, idx) => (
                <li key={idx} className="flex items-start space-x-2">
                  <span className="text-emerald-600 font-bold mt-0.5">•</span>
                  <span>{s}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Weaknesses (Amber) */}
          <div className="p-4 rounded-xl bg-amber-50/60 border border-amber-200">
            <div className="flex items-center space-x-2 pb-2 mb-3 border-b border-amber-200/60 text-amber-900">
              <AlertCircle className="w-4 h-4 text-amber-600" />
              <h3 className="text-xs font-bold uppercase tracking-wider">
                {t("advisory.weaknesses", language)}
              </h3>
            </div>
            <ul className="space-y-2 text-xs text-slate-700">
              {(adv.weaknesses || []).map((w, idx) => (
                <li key={idx} className="flex items-start space-x-2">
                  <span className="text-amber-600 font-bold mt-0.5">•</span>
                  <span>{w}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Opportunities (Sky/Govblue) */}
          <div className="p-4 rounded-xl bg-blue-50/60 border border-blue-200">
            <div className="flex items-center space-x-2 pb-2 mb-3 border-b border-blue-200/60 text-govblue">
              <TrendingUp className="w-4 h-4 text-blue-600" />
              <h3 className="text-xs font-bold uppercase tracking-wider">
                {t("advisory.opportunities", language)}
              </h3>
            </div>
            <ul className="space-y-2 text-xs text-slate-700">
              {(adv.opportunities || []).map((o, idx) => (
                <li key={idx} className="flex items-start space-x-2">
                  <span className="text-blue-600 font-bold mt-0.5">•</span>
                  <span>{o}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Threats (Rose) */}
          <div className="p-4 rounded-xl bg-rose-50/60 border border-rose-200">
            <div className="flex items-center space-x-2 pb-2 mb-3 border-b border-rose-200/60 text-rose-900">
              <ShieldAlert className="w-4 h-4 text-rose-600" />
              <h3 className="text-xs font-bold uppercase tracking-wider">
                {t("advisory.threats", language)}
              </h3>
            </div>
            <ul className="space-y-2 text-xs text-slate-700">
              {(adv.threats || []).map((tItem, idx) => (
                <li key={idx} className="flex items-start space-x-2">
                  <span className="text-rose-600 font-bold mt-0.5">•</span>
                  <span>{tItem}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* RISK MITIGATION TABLE */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 sm:p-6">
        <div className="flex items-center space-x-2 pb-3 mb-4 border-b border-slate-100">
          <ShieldAlert className="w-4 h-4 text-rose-600" />
          <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wide">
            {t("advisory.risks", language)}
          </h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 text-[11px] font-bold uppercase">
                <th className="py-2.5 px-3">Identified Business Risk</th>
                <th className="py-2.5 px-3 w-28">Severity</th>
                <th className="py-2.5 px-3">Actionable Mitigation Measure</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {(adv.risks || []).map((r, idx) => (
                <tr key={idx} className="hover:bg-slate-50/50">
                  <td className="py-2.5 px-3 font-semibold text-slate-900">
                    {r.risk}
                  </td>
                  <td className="py-2.5 px-3">
                    <span
                      className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                        r.severity === "High"
                          ? "bg-rose-100 text-rose-800"
                          : "bg-amber-100 text-amber-800"
                      }`}
                    >
                      {r.severity}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-slate-600">{r.mitigation}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* PRICING & MARKET POSITIONING CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Pricing Strategy */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 sm:p-5">
          <div className="flex items-center space-x-2 pb-2 mb-3 border-b border-slate-100 text-slate-800">
            <Tag className="w-4 h-4 text-orange-500" />
            <h3 className="text-xs font-bold uppercase tracking-wide">
              {t("advisory.pricing", language)}
            </h3>
          </div>
          <div className="text-xs space-y-2">
            <div>
              <span className="text-slate-400 block text-[10px] uppercase font-bold">
                Recommended Band
              </span>
              <strong className="text-slate-900 font-extrabold text-sm text-govgreen">
                {adv.pricing?.recommendedPriceRange}
              </strong>
            </div>
            <p className="text-[11px] text-slate-600">
              {adv.pricing?.strategy}
            </p>
            <p className="text-[10px] text-slate-500 bg-slate-50 p-2 rounded border border-slate-200">
              {adv.pricing?.rationale}
            </p>
          </div>
        </div>

        {/* Target Persona */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 sm:p-5">
          <div className="flex items-center space-x-2 pb-2 mb-3 border-b border-slate-100 text-slate-800">
            <Users className="w-4 h-4 text-sky-600" />
            <h3 className="text-xs font-bold uppercase tracking-wide">
              {t("advisory.targetCustomer", language)}
            </h3>
          </div>
          <div className="text-xs space-y-2 text-slate-700">
            <div>
              <span className="text-slate-400 block text-[10px] uppercase font-bold">
                Primary Audience
              </span>
              <strong className="text-slate-900 font-semibold">
                {adv.targetCustomers?.primary}
              </strong>
            </div>
            <p className="text-[11px] text-slate-600">
              Secondary: {adv.targetCustomers?.secondary}
            </p>
            <div className="text-[10px] text-slate-500 bg-slate-50 p-2 rounded border border-slate-200">
              Income tier: {adv.targetCustomers?.incomeLevel}
            </div>
          </div>
        </div>

        {/* Location Strategy */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 sm:p-5">
          <div className="flex items-center space-x-2 pb-2 mb-3 border-b border-slate-100 text-slate-800">
            <MapPin className="w-4 h-4 text-purple-600" />
            <h3 className="text-xs font-bold uppercase tracking-wide">
              {t("advisory.locationStrategy", language)}
            </h3>
          </div>
          <p className="text-xs text-slate-700 leading-relaxed">
            {adv.locationStrategy}
          </p>
          <div className="mt-3 text-[10px] text-purple-900 bg-purple-50 p-2 rounded border border-purple-200 font-medium">
            Operating Model: {adv.operatingModel}
          </div>
        </div>
      </div>

      {/* NEXT BEST ACTIONS (PRIORITIZED 1 - 5) */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 sm:p-6">
        <div className="flex items-center space-x-2 pb-3 mb-4 border-b border-slate-100">
          <ListOrdered className="w-4 h-4 text-govblue" />
          <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wide">
            {t("advisory.nextActions", language)}
          </h2>
        </div>

        <div className="space-y-3">
          {(adv.nextActions || []).map((action) => (
            <div
              key={action.priority}
              className="p-3.5 rounded-lg border border-slate-200 bg-slate-50/60 hover:bg-white hover:border-slate-300 transition flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
            >
              <div className="flex items-start space-x-3">
                <span className="w-6 h-6 rounded-full bg-govblue text-white flex items-center justify-center font-bold text-xs flex-shrink-0 mt-0.5 shadow-xs">
                  {action.priority}
                </span>
                <div>
                  <strong className="block text-slate-900 font-bold text-xs">
                    {action.action}
                  </strong>
                  <span className="text-[11px] text-slate-500 mt-0.5 block">
                    {action.detail}
                  </span>
                </div>
              </div>

              <div className="flex items-center space-x-3 self-end sm:self-center">
                <span className="inline-flex items-center space-x-1 text-[11px] text-slate-500 bg-white px-2 py-0.5 rounded border border-slate-200">
                  <Clock className="w-3 h-3 text-slate-400" />
                  <span>{action.timeline}</span>
                </span>
                <span className="inline-block text-[10px] font-bold text-emerald-700 bg-emerald-100/80 px-2 py-0.5 rounded uppercase">
                  Impact: {action.impact}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* NAVIGATION BAR */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 flex items-center justify-between">
        <button
          onClick={() => setActiveStep(2)}
          className="px-4 py-2.5 rounded-lg text-xs font-bold border border-slate-300 text-slate-700 hover:bg-slate-100 flex items-center space-x-1.5 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>{t("form.back", language)}</span>
        </button>

        <button
          onClick={() => {
            setActiveStep(4);
            window.scrollTo({ top: 0, behavior: "smooth" });
          }}
          className="px-6 py-2.5 rounded-lg text-xs font-bold bg-govblue hover:bg-govblue-dark text-white shadow-md shadow-govblue/20 flex items-center space-x-2 transition"
        >
          <span>Continue to Financial Structuring →</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
