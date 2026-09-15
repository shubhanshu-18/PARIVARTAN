import React from "react";
import { useApp } from "../context/AppContext";
import { WifiOff, ShieldAlert } from "lucide-react";

export function OfflineNotice() {
  const { isOffline, language } = useApp();

  if (!isOffline) return null;

  return (
    <div
      className="offline-notice bg-amber-50 text-amber-900 text-xs px-4 py-2.5 border-b border-amber-200 animate-in slide-in-from-top duration-300"
      role="status"
      aria-live="polite"
    >
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2.5">
        <div className="flex items-center space-x-2.5 min-w-0">
          <span className="offline-notice-icon w-7 h-7 rounded-lg bg-amber-100 border border-amber-200 flex items-center justify-center shrink-0">
            <WifiOff className="w-3.5 h-3.5 text-amber-700" />
          </span>
          <span className="font-bold shrink-0">
            {language === "hi"
              ? "आप ऑफ़लाइन मोड में हैं"
              : "Offline Mode Active"}
          </span>
          <span className="hidden sm:inline text-amber-800/80 truncate">
            {language === "hi"
              ? "— हाइपर-लोकल नियम, वित्तीय कैलकुलेटर एवं योजना मिलान पूरी तरह काम कर रहे हैं।"
              : "— Core financial engine, offline advisory rules, and scheme matching remain fully operational."}
          </span>
        </div>
        <div className="flex items-center space-x-1.5 text-[11px] text-amber-900 bg-white/70 px-2.5 py-1 rounded-lg border border-amber-200 font-semibold shrink-0">
          <ShieldAlert className="w-3.5 h-3.5 text-amber-700" />
          <span>
            {language === "hi" ? "स्थानीय कैश सक्रिय" : "Local Cache Active"}
          </span>
        </div>
      </div>
    </div>
  );
}
