import React from "react";
import { useApp } from "../context/AppContext";
import { WifiOff, ShieldAlert } from "lucide-react";

export function OfflineNotice() {
  const { isOffline, language } = useApp();

  if (!isOffline) return null;

  return (
    <div className="bg-amber-600 text-white text-xs px-4 py-2 shadow-inner border-b border-amber-700 animate-in slide-in-from-top duration-300">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center space-x-2">
          <WifiOff className="w-4 h-4 text-amber-200 animate-pulse" />
          <span className="font-semibold">
            {language === "hi"
              ? "आप ऑफ़लाइन मोड में हैं"
              : "Offline Mode Active"}
          </span>
          <span className="hidden sm:inline text-amber-100">
            {language === "hi"
              ? "— हाइपर-लोकल नियम, वित्तीय कैलकुलेटर एवं योजना मिलान पूरी तरह काम कर रहे हैं।"
              : "— Core financial engine, offline advisory rules, and scheme matching remain fully operational."}
          </span>
        </div>
        <div className="flex items-center space-x-1 text-[11px] text-amber-100 bg-amber-700/60 px-2 py-0.5 rounded">
          <ShieldAlert className="w-3 h-3" />
          <span>
            {language === "hi" ? "स्थानीय कैश सक्रिय" : "Local Cache Active"}
          </span>
        </div>
      </div>
    </div>
  );
}
