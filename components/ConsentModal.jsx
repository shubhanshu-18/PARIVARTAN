import React from "react";
import { useApp } from "../context/AppContext";
import {
  ShieldCheck,
  Lock,
  MapPin,
  EyeOff,
  FileText,
  CheckCircle2,
} from "lucide-react";

export function ConsentModal() {
  const { consentGiven, setConsentGiven, language, showToast } = useApp();

  if (consentGiven) return null;

  const handleAccept = () => {
    setConsentGiven(true);
    showToast(
      language === "hi"
        ? "सहमति स्वीकृत — आपका डेटा सुरक्षित है"
        : "Consent recorded — your privacy is protected",
      "success",
    );
  };

  return (
    <div className="fixed inset-0 bg-navy-950/70 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-xl shadow-2xl max-w-xl w-full border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="bg-navy-900 text-white px-6 py-4 flex items-center space-x-3 border-b border-navy-800">
          <div className="w-9 h-9 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold tracking-tight">
              {language === "hi"
                ? "डेटा गोपनीयता एवं पारदर्शी सहमति"
                : "Data Privacy & Beneficiary Consent Notice"}
            </h2>
            <p className="text-xs text-slate-300">
              DPDP Act 2023 • Ministry of Social Justice & Empowerment
              Guidelines
            </p>
          </div>
        </div>

        {/* Body content */}
        <div className="p-6 space-y-4 text-xs text-slate-700 leading-relaxed max-h-[70vh] overflow-y-auto">
          <p className="text-slate-800 font-medium">
            {language === "hi"
              ? "परिवर्तन (PARIVARTAN) प्लेटफॉर्म आपके ग्रामीण व्यवसाय को सशक्त बनाने के लिए बनाया गया है। आपके डेटा का उपयोग केवल निम्नलिखित पारदर्शी उद्देश्यों के लिए किया जाता है:"
              : "The PARIVARTAN platform is engineered for rural micro-entrepreneurs. To generate precise localized intelligence and loan eligibility, we collect and process specific non-sensitive data points:"}
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg flex items-start space-x-2.5">
              <MapPin className="w-4 h-4 text-orange-500 flex-shrink-0 mt-0.5" />
              <div>
                <strong className="block text-slate-900 font-semibold mb-0.5">
                  {language === "hi"
                    ? "स्थान एवं जीपीएस"
                    : "Approximate Location"}
                </strong>
                <span className="text-[11px] text-slate-600">
                  {language === "hi"
                    ? "5 किमी दायरे में स्थानीय प्रतियोगी और बाज़ार मांग जांचने के लिए।"
                    : "Used strictly to calculate 1-5km competitor radius and local mandi demand."}
                </span>
              </div>
            </div>

            <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg flex items-start space-x-2.5">
              <FileText className="w-4 h-4 text-govblue flex-shrink-0 mt-0.5" />
              <div>
                <strong className="block text-slate-900 font-semibold mb-0.5">
                  {language === "hi"
                    ? "सामाजिक वर्ग (Category)"
                    : "Beneficiary Category"}
                </strong>
                <span className="text-[11px] text-slate-600">
                  {language === "hi"
                    ? "NBCFDC, NSFDC, NSKFDC सब्सिडी एवं रियायती ब्याज दरें तय करने हेतु।"
                    : "To filter MoSJE statutory capital subsidies and interest subvention limits."}
                </span>
              </div>
            </div>

            <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg flex items-start space-x-2.5">
              <Lock className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
              <div>
                <strong className="block text-slate-900 font-semibold mb-0.5">
                  {language === "hi"
                    ? "सुरक्षित एवं गैर-साझा"
                    : "No Commercial Sharing"}
                </strong>
                <span className="text-[11px] text-slate-600">
                  {language === "hi"
                    ? "आपका डेटा कभी भी किसी तीसरे पक्ष को बेचा या व्यावसायिक उपयोग नहीं किया जाएगा।"
                    : "Your information is never monetized or shared with third-party advertisers."}
                </span>
              </div>
            </div>

            <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg flex items-start space-x-2.5">
              <EyeOff className="w-4 h-4 text-purple-600 flex-shrink-0 mt-0.5" />
              <div>
                <strong className="block text-slate-900 font-semibold mb-0.5">
                  {language === "hi" ? "गोपनीय अधिकार" : "Right to Erasure"}
                </strong>
                <span className="text-[11px] text-slate-600">
                  {language === "hi"
                    ? "आप किसी भी समय अपने ब्राउज़र से डेटा रीसेट या नष्ट कर सकते हैं।"
                    : "You can reset or wipe all stored assessment drafts at any moment."}
                </span>
              </div>
            </div>
          </div>

          <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-[11px] text-amber-900">
            <strong>
              {language === "hi"
                ? "महत्वपूर्ण सूचना:"
                : "Voluntary Disclosure:"}
            </strong>{" "}
            {language === "hi"
              ? "स्थान की अनुमति पूरी तरह स्वैच्छिक है। यदि आप जीपीएस साझा नहीं करना चाहते हैं, तो आप ड्रॉपडाउन सूची से अपना ज़िला स्वयं चुन सकते हैं।"
              : "GPS capture is entirely optional. You may decline browser geolocation and manually select your district from the dropdown at any time."}
          </div>
        </div>

        {/* Footer actions */}
        <div className="bg-slate-100 px-6 py-3.5 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-slate-200">
          <span className="text-[11px] text-slate-500 text-center sm:text-left">
            {language === "hi"
              ? "आगे बढ़कर आप शर्तों को स्वीकार करते हैं।"
              : "By continuing, you agree to the evaluation terms."}
          </span>
          <button
            onClick={handleAccept}
            className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 px-5 py-2.5 rounded-lg text-xs font-bold bg-govgreen hover:bg-govgreen-dark text-white shadow-sm transition"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>
              {language === "hi"
                ? "मैं समझता/समझती हूं और सहमत हूं"
                : "I Understand & Agree to Proceed"}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}
