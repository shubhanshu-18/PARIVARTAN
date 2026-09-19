import React, { useState } from "react";
import { useApp } from "../context/AppContext";
import { useAuth } from "../context/AuthContext";
import { t } from "../utils/translations";
import { SpeechHelper } from "../speech";
import {
  Building2,
  Globe2,
  Mic,
  MicOff,
  ShieldCheck,
  Sparkles,
  Volume2,
  VolumeX,
  Award,
  Menu,
  X,
} from "lucide-react";

export function Navbar() {
  const {
    language,
    setLanguage,
    isListening,
    setIsListening,
    isSpeaking,
    setIsSpeaking,
    showToast,
    updateProfile,
    consentGiven,
    setConsentGiven,
  } = useApp();

  const { isOfficer, officer, logoutOfficer } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleLanguage = () => {
    const next = language === "hi" ? "en" : "hi";
    setLanguage(next);
    showToast(
      next === "hi" ? "भाषा: हिंदी चुनी गई" : "Language set to English",
      "info",
    );
  };

  const toggleVoiceInput = () => {
    if (isListening) {
      SpeechHelper.stopListening();
      setIsListening(false);
      showToast("Voice input stopped", "info");
      return;
    }

    if (!SpeechHelper.isSpeechRecognitionSupported()) {
      showToast(
        "Speech recognition not supported in this browser. Use Chrome or Edge.",
        "warning",
      );
      return;
    }

    setIsListening(true);
    showToast(
      language === "hi"
        ? "बोलिए... हम सुन रहे हैं"
        : "Listening... Speak your business idea",
      "info",
    );

    SpeechHelper.startListening({
      lang: language === "en" ? "en-IN" : "hi-IN",
      onResult: (transcript) => {
        setIsListening(false);
        updateProfile({ businessIdea: transcript });
        showToast(`Captured: "${transcript}"`, "success");
      },
      onError: (err) => {
        setIsListening(false);
        showToast("Voice capture error: " + err, "error");
      },
      onEnd: () => {
        setIsListening(false);
      },
    });
  };

  const handleStopSpeaking = () => {
    SpeechHelper.stopSpeaking();
    setIsSpeaking(false);
  };

  return (
    <header className="bg-navy-900 border-b border-navy-700/80 sticky top-0 z-40 shadow-md">
      {/* Top micro-bar: MoSJE & SIH 2026 identification */}
      <div className="bg-navy-950 text-slate-400 text-[11px] px-4 py-1 border-b border-navy-800">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center space-x-2">
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="font-medium text-slate-300">
              Government of India • Ministry of Social Justice & Empowerment
            </span>
          </div>
          <div className="flex items-center space-x-3 text-[11px]">
            <span className="flex items-center text-amber-400 font-semibold">
              <Award className="w-3.5 h-3.5 mr-1" />
              Smart India Hackathon 2026 | PS ID: 26091
            </span>
            <span className="hidden sm:inline text-slate-500">|</span>
            <button
              onClick={() => setConsentGiven(false)}
              className="text-slate-400 hover:text-white flex items-center transition"
            >
              <ShieldCheck className="w-3 h-3 mr-1 text-emerald-400" />
              <span>DPDP 2023 Consent</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main navigation container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-2.5 flex items-center justify-between gap-4">
        {/* Logo & Brand Identity */}
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center text-white font-black shadow-md border border-amber-300/40">
            <span className="text-xl tracking-tighter">P</span>
          </div>
          <div>
            <div className="flex items-baseline space-x-2">
              <span className="text-lg sm:text-xl font-black tracking-tight text-white font-sans">
                Gram Sarthi AI
              </span>
              <span className="text-xs sm:text-sm font-bold text-amber-400 font-devanagari">
                Rural-Tech Advisory
              </span>
            </div>
            <p className="text-[10.5px] sm:text-[11px] text-slate-300 line-clamp-1 font-medium">
              AI Hyper-Local Business Advisory & Financial Structuring
            </p>
          </div>
        </div>

        {/* Action controls */}
        <div className="hidden sm:flex items-center space-x-2.5">
          {/* TTS Stop button if speaking */}
          {isSpeaking && (
            <button
              onClick={handleStopSpeaking}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-rose-600 hover:bg-rose-700 text-white shadow-sm transition"
              title="Stop audio narration"
            >
              <VolumeX className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Stop Voice</span>
            </button>
          )}

          {/* Voice Input Trigger */}
          <button
            onClick={toggleVoiceInput}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition border ${
              isListening
                ? "bg-rose-600 border-rose-500 text-white shadow-md shadow-rose-900/40 animate-pulse"
                : "bg-white/10 border-white/15 text-white hover:bg-white/15 hover:border-white/25 backdrop-blur-sm"
            }`}
            title="Speak your business idea (Hindi/English)"
          >
            {isListening ? (
              <Mic className="w-3.5 h-3.5 text-white" />
            ) : (
              <Mic className="w-3.5 h-3.5 text-amber-400" />
            )}
            <span className="hidden sm:inline">
              {isListening
                ? t("nav.voiceListening", language)
                : t("nav.voiceAssistant", language)}
            </span>
          </button>

          {/* Language Toggle */}
          <button
            onClick={toggleLanguage}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-white/10 border border-white/15 text-white hover:bg-white/15 hover:border-white/25 transition backdrop-blur-sm"
            title="Toggle between English and Hindi"
          >
            <Globe2 className="w-3.5 h-3.5 text-sky-300" />
            <span>{language === "hi" ? "English" : "हिंदी"}</span>
          </button>

          <a
            href={isOfficer ? "/admin/dashboard" : "/admin/login"}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-amber-500/15 border border-amber-400/40 text-amber-200 hover:bg-amber-500/25 transition"
            aria-label={isOfficer ? "Open admin dashboard" : "Open admin login"}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>{isOfficer ? "Admin Dashboard" : "Admin Login"}</span>
          </a>

          {isOfficer && (
            <div className="flex items-center space-x-2">
              <span className="hidden md:inline-block px-2.5 py-1 rounded-md bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[11px] font-semibold">
                Officer: {officer?.name || "Priya Sharma"}
              </span>
              <button
                onClick={logoutOfficer}
                className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 border border-slate-600 text-slate-200 transition"
              >
                <span>Exit Officer View</span>
              </button>
            </div>
          )}
        </div>

        <button
          type="button"
          onClick={() => setIsMobileMenuOpen((open) => !open)}
          className="sm:hidden inline-flex items-center justify-center w-10 h-10 rounded-lg bg-navy-800/90 border border-navy-700 text-slate-200"
          aria-expanded={isMobileMenuOpen}
          aria-label={
            isMobileMenuOpen ? "Close navigation menu" : "Open navigation menu"
          }
        >
          {isMobileMenuOpen ? (
            <X className="w-5 h-5" />
          ) : (
            <Menu className="w-5 h-5" />
          )}
        </button>
      </div>

      {isMobileMenuOpen && (
        <div className="sm:hidden border-t border-navy-700/80 bg-navy-900 px-4 py-3 space-y-2">
          {isSpeaking && (
            <button
              onClick={handleStopSpeaking}
              className="w-full flex items-center justify-center space-x-2 px-3 py-2.5 rounded-lg text-xs font-semibold bg-rose-600 text-white"
            >
              <VolumeX className="w-4 h-4" />
              <span>Stop Voice</span>
            </button>
          )}
          <button
            onClick={toggleVoiceInput}
            className={`w-full flex items-center justify-center space-x-2 px-3 py-2.5 rounded-lg text-xs font-semibold border ${
              isListening
                ? "bg-rose-600 border-rose-500 text-white"
                : "bg-navy-800/90 border-navy-700 text-slate-200"
            }`}
          >
            {isListening ? (
              <Mic className="w-4 h-4" />
            ) : (
              <Mic className="w-4 h-4 text-orange-400" />
            )}
            <span>
              {isListening
                ? t("nav.voiceListening", language)
                : t("nav.voiceAssistant", language)}
            </span>
          </button>
          <button
            onClick={toggleLanguage}
            className="w-full flex items-center justify-center space-x-2 px-3 py-2.5 rounded-lg text-xs font-semibold bg-navy-800/90 border border-navy-700 text-slate-200"
          >
            <Globe2 className="w-4 h-4 text-sky-400" />
            <span>{language === "hi" ? "English" : "हिंदी"}</span>
          </button>
          <a
            href={isOfficer ? "/admin/dashboard" : "/admin/login"}
            className="w-full flex items-center justify-center space-x-2 px-3 py-2.5 rounded-lg text-xs font-semibold bg-amber-500/15 border border-amber-400/40 text-amber-200"
            aria-label={isOfficer ? "Open admin dashboard" : "Open admin login"}
          >
            <ShieldCheck className="w-4 h-4" />
            <span>{isOfficer ? "Admin Dashboard" : "Admin Login"}</span>
          </a>
          {isOfficer && (
            <button
              onClick={logoutOfficer}
              className="w-full flex items-center justify-center px-3 py-2.5 rounded-lg text-xs font-semibold bg-slate-800 border border-slate-600 text-slate-200"
            >
              Exit Officer View
            </button>
          )}
        </div>
      )}
    </header>
  );
}
