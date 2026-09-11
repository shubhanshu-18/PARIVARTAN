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
    <nav className="max-w-7xl mx-auto px-4 sm:px-6 pt-5 pb-2">
      {/* Container card */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-2 sm:p-3">
        <div className="mobile-step-grid grid grid-cols-6 gap-1 sm:gap-2">
          {STEPS.map((step) => {
            const Icon = step.icon;
            const isCurrent = activeStep === step.id;
            const isCompleted = activeStep > step.id;

            return (
              <button
                key={step.id}
                onClick={() => setActiveStep(step.id)}
                className={`relative flex flex-col sm:flex-row items-center justify-center p-2 rounded-lg transition text-left group ${
                  isCurrent
                    ? "bg-govblue text-white shadow-sm ring-2 ring-govblue/30"
                    : isCompleted
                      ? "bg-emerald-50 text-emerald-900 hover:bg-emerald-100/70 border border-emerald-200/60"
                      : "bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200/60"
                }`}
                title={`Step ${step.id}: ${step.shortEn}`}
              >
                {/* Icon indicator */}
                <div
                  className={`w-6 h-6 sm:w-7 sm:h-7 rounded-full flex items-center justify-center flex-shrink-0 mb-1 sm:mb-0 sm:mr-2 text-xs font-bold transition ${
                    isCurrent
                      ? "bg-orange-500 text-white shadow-inner"
                      : isCompleted
                        ? "bg-emerald-600 text-white"
                        : "bg-slate-200 text-slate-700"
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
                  <span className="block text-[11px] sm:text-xs font-bold tracking-tight truncate">
                    {language === "hi" ? step.shortHi : step.shortEn}
                  </span>
                  <span
                    className={`hidden lg:block text-[10px] truncate ${
                      isCurrent
                        ? "text-blue-100"
                        : isCompleted
                          ? "text-emerald-700"
                          : "text-slate-400"
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
                  <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-1 bg-orange-500 rounded-full sm:hidden"></span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
