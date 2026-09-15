import React from "react";
import { useApp } from "../context/AppContext";
import { t } from "../utils/translations";
import {
  Building,
  Radar,
  Lightbulb,
  Calculator,
  Landmark,
  FileCheck,
  Check,
} from "lucide-react";

const STEPS = [
  {
    id: 1,
    key: "step.1",
    shortEn: "Profile",
    shortHi: "प्रोफ़ाइल",
    icon: Building,
  },
  {
    id: 2,
    key: "step.2",
    shortEn: "Market Intel",
    shortHi: "बाज़ार",
    icon: Radar,
  },
  {
    id: 3,
    key: "step.3",
    shortEn: "AI Advisory",
    shortHi: "AI सलाह",
    icon: Lightbulb,
  },
  {
    id: 4,
    key: "step.4",
    shortEn: "Finance",
    shortHi: "वित्त",
    icon: Calculator,
  },
  {
    id: 5,
    key: "step.5",
    shortEn: "Schemes",
    shortHi: "योजनाएं",
    icon: Landmark,
  },
  {
    id: 6,
    key: "step.6",
    shortEn: "Dossier",
    shortHi: "रिपोर्ट",
    icon: FileCheck,
  },
];

export function StepWizard() {
  const { activeStep, setActiveStep, language } = useApp();

  return (
    <nav className="max-w-7xl mx-auto px-4 sm:px-6 pt-4 pb-2">
      {/* Container card */}
      <div className="bg-white rounded-xl shadow-subtle border border-[#DCE4E8] p-2 sm:p-2.5">
        <div className="mobile-step-grid grid grid-cols-6 gap-1.5 sm:gap-2">
          {STEPS.map((step) => {
            const Icon = step.icon;
            const isCurrent = activeStep === step.id;
            const isCompleted = activeStep > step.id;

            return (
              <button
                key={step.id}
                onClick={() => setActiveStep(step.id)}
                className={`relative flex flex-col sm:flex-row items-center justify-center p-2 rounded-lg transition text-left group border ${
                  isCurrent
                    ? "bg-[#123B5D] text-white border-[#123B5D] shadow-sm ring-2 ring-[#123B5D]/20"
                    : isCompleted
                      ? "bg-[#E8F6F1] text-[#105D44] hover:bg-[#D3EFE5] border-[#A9DDCB]"
                      : "bg-[#F7F9F7] text-[#667085] hover:bg-slate-100/80 border-[#DCE4E8]"
                }`}
                title={`Step ${step.id}: ${step.shortEn}`}
              >
                {/* Icon indicator */}
                <div
                  className={`w-6 h-6 sm:w-7 sm:h-7 rounded-full flex items-center justify-center flex-shrink-0 mb-1 sm:mb-0 sm:mr-2 text-xs font-bold transition ${
                    isCurrent
                      ? "bg-[#F59E0B] text-[#17212B] shadow-inner font-extrabold"
                      : isCompleted
                        ? "bg-[#167C5A] text-white"
                        : "bg-[#E2E8F0] text-[#475569]"
                  }`}
                >
                  {isCompleted ? (
                    <Check className="w-3.5 h-3.5 stroke-[3]" />
                  ) : (
                    step.id
                  )}
                </div>

                {/* Text Label */}
                <div className="text-center sm:text-left min-w-0">
                  <span
                    className={`block text-[11px] sm:text-xs font-bold tracking-tight truncate ${
                      isCurrent
                        ? "text-white"
                        : isCompleted
                          ? "text-[#105D44]"
                          : "text-[#17212B]"
                    }`}
                  >
                    {language === "hi" ? step.shortHi : step.shortEn}
                  </span>
                  <span
                    className={`hidden lg:block text-[10px] truncate ${
                      isCurrent
                        ? "text-blue-200"
                        : isCompleted
                          ? "text-[#167C5A]"
                          : "text-[#667085]"
                    }`}
                  >
                    {step.id === 1 &&
                      (language === "hi"
                        ? "बुनियादी जानकारी"
                        : "Concept & Loc")}
                    {step.id === 2 &&
                      (language === "hi"
                        ? "प्रतियोगी नक्शा"
                        : "Spatial Radius")}
                    {step.id === 3 &&
                      (language === "hi" ? "SWOT विश्लेषण" : "SWOT & Pricing")}
                    {step.id === 4 &&
                      (language === "hi" ? "ईएमआई व लाभ" : "EMI & Outlay")}
                    {step.id === 5 &&
                      (language === "hi" ? "सब्सिडी मिलान" : "MoSJE Subsidies")}
                    {step.id === 6 &&
                      (language === "hi" ? "बैंक PDF रिपोर्ट" : "Official PDF")}
                  </span>
                </div>

                {/* Micro accent pip */}
                {isCurrent && (
                  <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-1 bg-[#F59E0B] rounded-full sm:hidden"></span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
