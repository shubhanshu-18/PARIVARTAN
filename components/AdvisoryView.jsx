import React, { useState, useEffect } from "react";
import { useApp } from "../context/AppContext";
import { t } from "../utils/translations";
import { SpeechHelper } from "../speech";
import { ApiService } from "../services/api";
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
  PlayCircle,
  Video,
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

  const [videos, setVideos] = useState([]);
  const [loadingVideos, setLoadingVideos] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [videoError, setVideoError] = useState(null);

  useEffect(() => {
    let isMounted = true;
    async function loadVideos() {
      if (!profile?.businessIdea) return;
      setLoadingVideos(true);
      setVideoError(null);
      try {
        const response = await ApiService.getAdvisoryVideos(profile);
        if (isMounted) {
          if (response?.videos?.length > 0) {
            setVideos(response.videos);
            setSelectedVideo(response.videos[0]);
          } else {
            setVideos([]);
          }
        }
      } catch (err) {
        if (isMounted) setVideoError(err.message);
      } finally {
        if (isMounted) setLoadingVideos(false);
      }
    }
    loadVideos();
    return () => {
      isMounted = false;
    };
  }, [profile?.businessIdea]);

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
      <div className="bg-white rounded-xl shadow-subtle border border-[#DCE4E8] p-5 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#EEF4FA] text-[#123B5D] border border-[#123B5D]/20 mb-2">
              <Sparkles className="w-3.5 h-3.5 text-[#123B5D]" />
              <span className="tracking-wide">
                AI INSIGHT • Step 3 of 6 • Strategic Roadmap
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-[#123B5D] tracking-tight">
              {t("advisory.title", language)}
            </h1>
            <p className="text-xs sm:text-sm text-[#667085] mt-1">
              Enterprise:{" "}
              <strong className="text-[#17212B]">
                {profile.businessIdea || "Rural Enterprise"}
              </strong>{" "}
              • Category:{" "}
              <span className="capitalize font-semibold text-[#123B5D]">
                {profile.businessCategory}
              </span>
            </p>
          </div>

          {/* Voice Readout Button */}
          <button
            onClick={handleReadAloud}
            className={`inline-flex items-center space-x-2 px-4 py-2.5 rounded-lg text-xs font-bold transition shadow-sm border ${
              isSpeaking
                ? "bg-[#DC2626] border-[#DC2626] text-white animate-pulse"
                : "bg-[#F7F9F7] border-[#DCE4E8] text-[#123B5D] hover:bg-[#EEF4FA] hover:border-[#123B5D]"
            }`}
          >
            {isSpeaking ? (
              <VolumeX className="w-4 h-4" />
            ) : (
              <Volume2 className="w-4 h-4 text-[#123B5D]" />
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
      <div className="bg-white rounded-xl border border-[#DCE4E8] shadow-subtle p-5 sm:p-6">
        <div className="flex items-center space-x-2.5 pb-3 mb-5 border-b border-[#DCE4E8]/70">
          <div className="w-6 h-6 rounded-md bg-[#FFF7E6] text-[#F59E0B] flex items-center justify-center">
            <Zap className="w-3.5 h-3.5" />
          </div>
          <h2 className="text-sm font-bold text-[#17212B] uppercase tracking-wide">
            Enterprise SWOT Matrix
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Strengths (Emerald) */}
          <div className="p-4 rounded-xl bg-[#E8F6F1]/50 border border-[#A9DDCB]">
            <div className="flex items-center space-x-2 pb-2 mb-3 border-b border-[#A9DDCB]/60 text-[#105D44]">
              <CheckCircle className="w-4 h-4 text-[#167C5A]" />
              <h3 className="text-xs font-bold uppercase tracking-wider">
                {t("advisory.strengths", language)}
              </h3>
            </div>
            <ul className="space-y-2 text-xs text-[#17212B]">
              {(adv.strengths || []).map((s, idx) => (
                <li key={idx} className="flex items-start space-x-2">
                  <span className="text-[#167C5A] font-bold mt-0.5">•</span>
                  <span>{s}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Weaknesses (Amber) */}
          <div className="p-4 rounded-xl bg-[#FFF7E6]/50 border border-[#F4D28A]">
            <div className="flex items-center space-x-2 pb-2 mb-3 border-b border-[#F4D28A]/60 text-[#9A6500]">
              <AlertCircle className="w-4 h-4 text-[#F59E0B]" />
              <h3 className="text-xs font-bold uppercase tracking-wider">
                {t("advisory.weaknesses", language)}
              </h3>
            </div>
            <ul className="space-y-2 text-xs text-[#17212B]">
              {(adv.weaknesses || []).map((w, idx) => (
                <li key={idx} className="flex items-start space-x-2">
                  <span className="text-[#F59E0B] font-bold mt-0.5">•</span>
                  <span>{w}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Opportunities (Govblue) */}
          <div className="p-4 rounded-xl bg-[#EEF4FA]/50 border border-[#C4D5E6]">
            <div className="flex items-center space-x-2 pb-2 mb-3 border-b border-[#C4D5E6]/60 text-[#123B5D]">
              <TrendingUp className="w-4 h-4 text-[#123B5D]" />
              <h3 className="text-xs font-bold uppercase tracking-wider">
                {t("advisory.opportunities", language)}
              </h3>
            </div>
            <ul className="space-y-2 text-xs text-[#17212B]">
              {(adv.opportunities || []).map((o, idx) => (
                <li key={idx} className="flex items-start space-x-2">
                  <span className="text-[#123B5D] font-bold mt-0.5">•</span>
                  <span>{o}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Threats (Rose) */}
          <div className="p-4 rounded-xl bg-[#FEF2F2]/50 border border-[#EDAAAA]">
            <div className="flex items-center space-x-2 pb-2 mb-3 border-b border-[#EDAAAA]/60 text-[#DC2626]">
              <ShieldAlert className="w-4 h-4 text-[#DC2626]" />
              <h3 className="text-xs font-bold uppercase tracking-wider">
                {t("advisory.threats", language)}
              </h3>
            </div>
            <ul className="space-y-2 text-xs text-[#17212B]">
              {(adv.threats || []).map((tItem, idx) => (
                <li key={idx} className="flex items-start space-x-2">
                  <span className="text-[#DC2626] font-bold mt-0.5">•</span>
                  <span>{tItem}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* RISK MITIGATION TABLE */}
      <div className="bg-white rounded-xl border border-[#DCE4E8] shadow-subtle p-5 sm:p-6">
        <div className="flex items-center space-x-2.5 pb-3 mb-4 border-b border-[#DCE4E8]/70">
          <ShieldAlert className="w-4 h-4 text-[#DC2626]" />
          <h2 className="text-sm font-bold text-[#17212B] uppercase tracking-wide">
            {t("advisory.risks", language)}
          </h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-[#F7F9F7] border-b border-[#DCE4E8] text-[#667085] text-[11px] font-bold uppercase">
                <th className="py-2.5 px-3">Identified Business Risk</th>
                <th className="py-2.5 px-3 w-28">Severity</th>
                <th className="py-2.5 px-3">Actionable Mitigation Measure</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#DCE4E8]/60">
              {(adv.risks || []).map((r, idx) => (
                <tr key={idx} className="hover:bg-[#F7F9F7]/60">
                  <td className="py-2.5 px-3 font-semibold text-[#17212B]">
                    {r.risk}
                  </td>
                  <td className="py-2.5 px-3">
                    <span
                      className={`inline-block px-2.5 py-0.5 rounded text-[10px] font-bold uppercase border ${
                        r.severity === "High"
                          ? "bg-[#FEF2F2] text-[#DC2626] border-[#DC2626]/20"
                          : "bg-[#FFF7E6] text-[#9A6500] border-[#F59E0B]/30"
                      }`}
                    >
                      {r.severity}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-[#667085]">{r.mitigation}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* PRICING & MARKET POSITIONING CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Pricing Strategy */}
        <div className="bg-white rounded-xl border border-[#DCE4E8] shadow-subtle p-4 sm:p-5">
          <div className="flex items-center space-x-2 pb-2 mb-3 border-b border-[#DCE4E8]/70 text-[#17212B]">
            <Tag className="w-4 h-4 text-[#F59E0B]" />
            <h3 className="text-xs font-bold uppercase tracking-wide">
              {t("advisory.pricing", language)}
            </h3>
          </div>
          <div className="text-xs space-y-2">
            <div>
              <span className="text-[#667085] block text-[10px] uppercase font-bold">
                Recommended Band
              </span>
              <strong className="text-[#167C5A] font-black text-sm">
                {adv.pricing?.recommendedPriceRange}
              </strong>
            </div>
            <p className="text-[11px] text-[#667085]">
              {adv.pricing?.strategy}
            </p>
            <p className="text-[10.5px] text-[#667085] bg-[#F7F9F7] p-2.5 rounded-lg border border-[#DCE4E8]">
              {adv.pricing?.rationale}
            </p>
          </div>
        </div>

        {/* Target Persona */}
        <div className="bg-white rounded-xl border border-[#DCE4E8] shadow-subtle p-4 sm:p-5">
          <div className="flex items-center space-x-2 pb-2 mb-3 border-b border-[#DCE4E8]/70 text-[#17212B]">
            <Users className="w-4 h-4 text-[#123B5D]" />
            <h3 className="text-xs font-bold uppercase tracking-wide">
              {t("advisory.targetCustomer", language)}
            </h3>
          </div>
          <div className="text-xs space-y-2 text-[#17212B]">
            <div>
              <span className="text-[#667085] block text-[10px] uppercase font-bold">
                Primary Audience
              </span>
              <strong className="text-[#17212B] font-bold">
                {adv.targetCustomers?.primary}
              </strong>
            </div>
            <p className="text-[11px] text-[#667085]">
              Secondary: {adv.targetCustomers?.secondary}
            </p>
            <div className="text-[10.5px] text-[#667085] bg-[#F7F9F7] p-2.5 rounded-lg border border-[#DCE4E8]">
              Income tier: {adv.targetCustomers?.incomeLevel}
            </div>
          </div>
        </div>

        {/* Location Strategy */}
        <div className="bg-white rounded-xl border border-[#DCE4E8] shadow-subtle p-4 sm:p-5">
          <div className="flex items-center space-x-2 pb-2 mb-3 border-b border-[#DCE4E8]/70 text-[#17212B]">
            <MapPin className="w-4 h-4 text-[#123B5D]" />
            <h3 className="text-xs font-bold uppercase tracking-wide">
              {t("advisory.locationStrategy", language)}
            </h3>
          </div>
          <p className="text-xs text-[#667085] leading-relaxed">
            {adv.locationStrategy}
          </p>
          <div className="mt-3 text-[10.5px] text-[#123B5D] bg-[#EEF4FA] p-2.5 rounded-lg border border-[#123B5D]/20 font-semibold">
            Operating Model: {adv.operatingModel}
          </div>
        </div>
      </div>

      {/* NEXT BEST ACTIONS (PRIORITIZED 1 - 5) */}
      <div className="bg-white rounded-xl border border-[#DCE4E8] shadow-subtle p-5 sm:p-6">
        <div className="flex items-center space-x-2.5 pb-3 mb-4 border-b border-[#DCE4E8]/70">
          <ListOrdered className="w-4 h-4 text-[#123B5D]" />
          <h2 className="text-sm font-bold text-[#17212B] uppercase tracking-wide">
            {t("advisory.nextActions", language)}
          </h2>
        </div>

        <div className="space-y-3">
          {(adv.nextActions || []).map((action) => (
            <div
              key={action.priority}
              className="p-3.5 rounded-xl border border-[#DCE4E8] bg-[#F7F9F7] hover:bg-white hover:border-[#123B5D]/40 transition flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
            >
              <div className="flex items-start space-x-3">
                <span className="w-6 h-6 rounded-full bg-[#123B5D] text-white flex items-center justify-center font-bold text-xs flex-shrink-0 mt-0.5 shadow-xs">
                  {action.priority}
                </span>
                <div>
                  <strong className="block text-[#17212B] font-bold text-xs">
                    {action.action}
                  </strong>
                  <span className="text-[11px] text-[#667085] mt-0.5 block">
                    {action.detail}
                  </span>
                </div>
              </div>

              <div className="flex items-center space-x-3 self-end sm:self-center">
                <span className="inline-flex items-center space-x-1 text-[11px] text-[#667085] bg-white px-2.5 py-1 rounded-md border border-[#DCE4E8]">
                  <Clock className="w-3.5 h-3.5 text-[#667085]" />
                  <span>{action.timeline}</span>
                </span>
                <span className="inline-block text-[10.5px] font-bold text-[#167C5A] bg-[#E8F6F1] px-2.5 py-1 rounded-md uppercase border border-[#167C5A]/30">
                  Impact: {action.impact}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* BUSINESS STRATEGY VIDEO GUIDANCE */}
      <div className="bg-white rounded-xl border border-[#DCE4E8] shadow-subtle p-5 sm:p-6 mb-6">
        <div className="flex items-center space-x-2.5 pb-3 mb-4 border-b border-[#DCE4E8]/70">
          <Video className="w-5 h-5 text-[#123B5D]" />
          <div>
            <h2 className="text-sm font-bold text-[#17212B] uppercase tracking-wide">
              Business Strategy Video Guidance
            </h2>
            <p className="text-[11px] text-[#667085] mt-0.5">
              Learn how to start, manage, market and grow your selected business
              with curated video guidance.
            </p>
          </div>
        </div>

        <div className="mb-4">
          <span className="text-[11px] text-[#667085] block font-semibold mb-1">
            SELECTED BUSINESS
          </span>
          <div className="inline-block bg-[#E8F6F1] text-[#167C5A] border border-[#167C5A]/20 rounded-md px-3 py-1.5 text-xs font-bold">
            {profile?.businessIdea || "Rural Enterprise"}
          </div>
        </div>

        {loadingVideos ? (
          <div className="flex items-center justify-center p-8 bg-[#F7F9F7] rounded-xl border border-[#DCE4E8] border-dashed">
            <div className="text-center space-y-3">
              <div className="w-8 h-8 rounded-full border-2 border-[#123B5D] border-t-transparent animate-spin mx-auto"></div>
              <p className="text-xs text-[#667085] font-semibold">
                Finding relevant business strategy videos...
              </p>
            </div>
          </div>
        ) : videoError || videos.length === 0 ? (
          <div className="flex items-center justify-center p-8 bg-[#F7F9F7] rounded-xl border border-[#DCE4E8] border-dashed">
            <div className="text-center space-y-2">
              <AlertCircle className="w-8 h-8 text-[#9A6500] mx-auto opacity-70" />
              <p className="text-xs text-[#667085] font-semibold">
                {videoError
                  ? "Video guidance is temporarily unavailable."
                  : "No highly relevant videos were found for this business idea yet."}
              </p>
              <p className="text-[11px] text-[#667085]">
                Your AI business strategy is still available above.
              </p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-3">
              <h3 className="text-xs font-bold text-[#17212B] uppercase">
                Featured Guidance
              </h3>
              {selectedVideo && (
                <div className="rounded-xl overflow-hidden border border-[#DCE4E8] shadow-sm bg-black aspect-video relative">
                  <iframe
                    className="w-full h-full absolute top-0 left-0"
                    src={`https://www.youtube-nocookie.com/embed/${selectedVideo.videoId}`}
                    title={selectedVideo.title}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    loading="lazy"
                  ></iframe>
                </div>
              )}
              {selectedVideo && (
                <div className="pt-2">
                  <h4 className="text-sm font-bold text-[#17212B] line-clamp-2">
                    {selectedVideo.title}
                  </h4>
                  <p className="text-[11px] text-[#667085] mt-1">
                    {selectedVideo.channelTitle}
                  </p>
                </div>
              )}
            </div>

            <div className="space-y-3">
              <h3 className="text-xs font-bold text-[#17212B] uppercase">
                Recommended Guidance
              </h3>
              <div className="space-y-3 max-h-[350px] overflow-y-auto pr-2 custom-scrollbar">
                {videos.map((video) => (
                  <button
                    key={video.videoId}
                    onClick={() => setSelectedVideo(video)}
                    className={`w-full text-left flex flex-col p-2.5 rounded-lg border transition group ${selectedVideo?.videoId === video.videoId ? "bg-[#F7F9F7] border-[#123B5D]/40" : "bg-white border-[#DCE4E8] hover:border-[#123B5D]/40"}`}
                  >
                    <div className="flex gap-3 w-full">
                      <div className="relative w-24 h-16 rounded overflow-hidden flex-shrink-0 bg-slate-100">
                        <img
                          src={video.thumbnail}
                          alt={video.title}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 flex items-center justify-center transition">
                          <PlayCircle className="w-6 h-6 text-white opacity-80" />
                        </div>
                      </div>
                      <div className="flex-1 min-w-0 flex flex-col justify-between py-0.5">
                        <h5 className="text-[11px] font-bold text-[#17212B] line-clamp-2 leading-snug">
                          {video.title}
                        </h5>
                        <div>
                          <span className="text-[9px] font-bold text-[#167C5A] uppercase bg-[#E8F6F1] px-1.5 py-0.5 rounded block w-max mt-1">
                            {video.query}
                          </span>
                        </div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
      {/* NAVIGATION BAR */}
      <div className="bg-white rounded-xl shadow-card border border-[#DCE4E8] p-4 flex items-center justify-between">
        <button
          onClick={() => setActiveStep(2)}
          className="px-4 py-2.5 rounded-lg text-xs font-bold border border-[#DCE4E8] text-[#17212B] hover:bg-slate-50 flex items-center space-x-1.5 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>{t("form.back", language)}</span>
        </button>

        <button
          onClick={() => {
            setActiveStep(4);
            window.scrollTo({ top: 0, behavior: "smooth" });
          }}
          className="px-6 py-2.5 rounded-lg text-xs font-bold bg-[#123B5D] hover:bg-[#0D2E49] text-white shadow-sm flex items-center space-x-2 transition"
        >
          <span>Continue to Financial Structuring</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
