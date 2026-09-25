import React from "react";
import { useApp } from "../context/AppContext";
import {
  MapPin,
  IndianRupee,
  Building2,
  TrendingUp,
  Store,
  Globe,
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
  UserCheck,
  Briefcase,
  Layers,
  Sprout,
} from "lucide-react";

export function AuthPortalLanding({ onSelectUser, onSelectAdmin }) {
  const { language, setLanguage } = useApp();

  const toggleLanguage = () => {
    setLanguage(language === "hi" ? "en" : "hi");
  };

  return (
    <div className="min-h-screen bg-[#F7F8F5] text-[#17212B] font-sans flex flex-col justify-between relative overflow-x-hidden selection:bg-[#167C5A] selection:text-white">
      {/* Subtle Background Layer */}
      <div
        className="absolute inset-0 pointer-events-none opacity-40 bg-cover bg-left-bottom z-0"
        style={{
          backgroundImage: "url('/landing-bg.jpg')",
          backgroundBlendMode: "overlay",
          filter: "saturate(0.9) brightness(1.02)",
        }}
        aria-hidden="true"
      />

      {/* Top Navigation Bar */}
      <header className="relative z-10 max-w-7xl w-full mx-auto px-4 sm:px-6 pt-5 pb-3 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        {/* Brand & Subtitles */}
        <div className="flex items-center space-x-3.5">
          <div className="w-12 h-12 rounded-2xl bg-white p-1.5 flex items-center justify-center shadow-md border border-[#DCE4E8] shrink-0">
            <img
              src="/logo.png"
              alt="Gram Sarthi AI"
              className="w-full h-full object-contain"
            />
          </div>
          <div>
            <div className="flex items-baseline space-x-2">
              <h1 className="text-xl sm:text-2xl font-black tracking-tight text-[#123B5D]">
                GRAM SARTHI AI
              </h1>
            </div>
            <p className="text-xs sm:text-sm font-bold text-[#167C5A] font-devanagari">
              गाँव से विकास की ओर
            </p>
            <p className="text-[11px] text-[#667085] font-medium hidden sm:block">
              Hyper-Local Business & Financial Advisory Assistant
            </p>
          </div>
        </div>

        {/* Feature Strip & Language Toggle */}
        <div className="flex items-center space-x-4 sm:space-x-6 self-end md:self-auto flex-wrap gap-y-2">
          {/* 5 Feature Indicator Badges */}
          <div className="hidden lg:flex items-center space-x-4 py-1.5 px-3 bg-white/80 backdrop-blur-md rounded-2xl border border-[#DCE4E8] shadow-xs">
            <div className="flex items-center space-x-2 text-[11px] font-semibold text-[#17212B]">
              <span className="w-7 h-7 rounded-full bg-[#E8F6F1] text-[#167C5A] flex items-center justify-center shrink-0">
                <MapPin className="w-3.5 h-3.5" />
              </span>
              <div className="leading-tight">
                <span className="block text-[10px] text-[#667085]">Local</span>
                <span>Market Insights</span>
              </div>
            </div>

            <div className="h-6 w-px bg-slate-200" />

            <div className="flex items-center space-x-2 text-[11px] font-semibold text-[#17212B]">
              <span className="w-7 h-7 rounded-full bg-[#E8F6F1] text-[#167C5A] flex items-center justify-center shrink-0">
                <IndianRupee className="w-3.5 h-3.5" />
              </span>
              <div className="leading-tight">
                <span className="block text-[10px] text-[#667085]">Financial</span>
                <span>Planning</span>
              </div>
            </div>

            <div className="h-6 w-px bg-slate-200" />

            <div className="flex items-center space-x-2 text-[11px] font-semibold text-[#17212B]">
              <span className="w-7 h-7 rounded-full bg-[#EEF4FA] text-[#123B5D] flex items-center justify-center shrink-0">
                <Building2 className="w-3.5 h-3.5" />
              </span>
              <div className="leading-tight">
                <span className="block text-[10px] text-[#667085]">Government</span>
                <span>Scheme Guidance</span>
              </div>
            </div>

            <div className="h-6 w-px bg-slate-200" />

            <div className="flex items-center space-x-2 text-[11px] font-semibold text-[#17212B]">
              <span className="w-7 h-7 rounded-full bg-[#E8F6F1] text-[#167C5A] flex items-center justify-center shrink-0">
                <TrendingUp className="w-3.5 h-3.5" />
              </span>
              <div className="leading-tight">
                <span className="block text-[10px] text-[#667085]">AI</span>
                <span>Advisory</span>
              </div>
            </div>

            <div className="h-6 w-px bg-slate-200" />

            <div className="flex items-center space-x-2 text-[11px] font-semibold text-[#17212B]">
              <span className="w-7 h-7 rounded-full bg-[#FFF7E6] text-[#F59E0B] flex items-center justify-center shrink-0">
                <Store className="w-3.5 h-3.5" />
              </span>
              <div className="leading-tight">
                <span className="block text-[10px] text-[#667085]">Supplier</span>
                <span>Discovery</span>
              </div>
            </div>
          </div>

          {/* Language Selector */}
          <button
            type="button"
            onClick={toggleLanguage}
            className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-white hover:bg-slate-50 border border-[#DCE4E8] text-[#17212B] shadow-sm transition-all"
            title="Toggle language"
          >
            <Globe className="w-4 h-4 text-[#123B5D]" />
            <span>{language === "hi" ? "English" : "हिन्दी / English"}</span>
          </button>
        </div>
      </header>

      {/* Main Content Area: 16:9 Hero + Portal Cards */}
      <main className="relative z-10 max-w-7xl w-full mx-auto px-4 sm:px-6 py-4 lg:py-8 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center flex-1">
        {/* Left Hero Narrative */}
        <section className="lg:col-span-5 space-y-6">
          <div className="space-y-3">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight leading-[1.15]">
              <span className="text-[#123B5D] block">Empowering</span>
              <span className="text-[#167C5A] block">Rural Entrepreneurs</span>
            </h2>

            <p className="text-sm sm:text-base text-[#475569] leading-relaxed max-w-lg font-normal pt-1">
              From local opportunities to financial planning, scheme guidance and
              market insights — Gram Sarthi AI helps you turn ideas into
              sustainable businesses.
            </p>

            {/* Subtle saffron accent underline */}
            <div className="w-28 h-1 bg-[#F59E0B] rounded-full mt-2" />
          </div>

          {/* Hindi Quote Overlay */}
          <div className="p-4 sm:p-5 rounded-2xl bg-white/90 backdrop-blur-sm border border-[#DCE4E8] shadow-subtle max-w-md">
            <p className="font-devanagari text-base sm:text-lg font-semibold text-[#105D44] italic leading-relaxed">
              “ स्थानीय जानकारी, सही मार्गदर्शन, बेहतर भविष्य ”
            </p>
            <span className="text-[11px] text-[#667085] block mt-1 font-sans">
              Smart India Hackathon 2026 • MoSJE
            </span>
          </div>
        </section>

        {/* Right Portal Selection Cards */}
        <section className="lg:col-span-7 space-y-4">
          <div className="text-center sm:text-left">
            <h3 className="text-2xl sm:text-3xl font-black text-[#17212B] tracking-tight">
              Choose Your Portal
            </h3>
            <p className="text-xs sm:text-sm text-[#667085] mt-1 font-medium">
              Access the right tools and information for your needs.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 pt-2">
            {/* Card 1: User Login */}
            <div className="bg-white rounded-2xl border border-[#A9DDCB] shadow-card hover:shadow-hover hover:border-[#167C5A]/50 transition-all p-6 flex flex-col justify-between group">
              <div className="space-y-4">
                {/* Illustration Badge / Top Visual */}
                <div className="h-28 rounded-xl bg-gradient-to-br from-[#E8F6F1] to-[#D3EFE5] border border-[#A9DDCB]/60 flex flex-col items-center justify-center p-3 text-center relative overflow-hidden">
                  <div className="w-12 h-12 rounded-full bg-white shadow-sm flex items-center justify-center text-[#167C5A] mb-1.5 border border-[#A9DDCB]/40">
                    <Sprout className="w-6 h-6" />
                  </div>
                  <span className="text-xs font-extrabold text-[#105D44] tracking-wide">
                    RURAL ENTREPRENEUR
                  </span>
                </div>

                {/* Card Title & Subtitle */}
                <div>
                  <h4 className="text-xl font-black text-[#17212B] group-hover:text-[#167C5A] transition-colors">
                    User Login
                  </h4>
                  <p className="text-xs text-[#667085] mt-0.5 leading-snug font-medium">
                    For Entrepreneurs, Farmers and Business Owners
                  </p>
                </div>

                {/* Checklist */}
                <ul className="space-y-2 text-xs text-[#334155] pt-1">
                  <li className="flex items-start space-x-2">
                    <CheckCircle2 className="w-4 h-4 text-[#167C5A] shrink-0 mt-0.5" />
                    <span>Create business assessment</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <CheckCircle2 className="w-4 h-4 text-[#167C5A] shrink-0 mt-0.5" />
                    <span>Get market & financial insights</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <CheckCircle2 className="w-4 h-4 text-[#167C5A] shrink-0 mt-0.5" />
                    <span>Explore government schemes</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <CheckCircle2 className="w-4 h-4 text-[#167C5A] shrink-0 mt-0.5" />
                    <span>Find local suppliers</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <CheckCircle2 className="w-4 h-4 text-[#167C5A] shrink-0 mt-0.5" />
                    <span>Generate detailed reports</span>
                  </li>
                </ul>
              </div>

              {/* Action Button */}
              <button
                type="button"
                onClick={onSelectUser}
                className="mt-6 w-full py-3 px-4 rounded-xl bg-[#167C5A] hover:bg-[#105D44] active:scale-[0.99] text-white font-bold text-sm shadow-md transition-all flex items-center justify-center space-x-2"
              >
                <span>Continue as User</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            {/* Card 2: Admin / Officer Login */}
            <div className="bg-white rounded-2xl border border-[#BDD6EB] shadow-card hover:shadow-hover hover:border-[#123B5D]/50 transition-all p-6 flex flex-col justify-between group">
              <div className="space-y-4">
                {/* Illustration Badge / Top Visual */}
                <div className="h-28 rounded-xl bg-gradient-to-br from-[#EEF4FA] to-[#DCE8F4] border border-[#BDD6EB]/60 flex flex-col items-center justify-center p-3 text-center relative overflow-hidden">
                  <div className="w-12 h-12 rounded-full bg-white shadow-sm flex items-center justify-center text-[#123B5D] mb-1.5 border border-[#BDD6EB]/40">
                    <ShieldCheck className="w-6 h-6" />
                  </div>
                  <span className="text-xs font-extrabold text-[#123B5D] tracking-wide">
                    ADMINISTRATIVE OFFICER
                  </span>
                </div>

                {/* Card Title & Subtitle */}
                <div>
                  <h4 className="text-xl font-black text-[#17212B] group-hover:text-[#123B5D] transition-colors">
                    Admin / Officer Login
                  </h4>
                  <p className="text-xs text-[#667085] mt-0.5 leading-snug font-medium">
                    For Government Officials and Authorized Officers
                  </p>
                </div>

                {/* Checklist */}
                <ul className="space-y-2 text-xs text-[#334155] pt-1">
                  <li className="flex items-start space-x-2">
                    <CheckCircle2 className="w-4 h-4 text-[#123B5D] shrink-0 mt-0.5" />
                    <span>Access administrative dashboard</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <CheckCircle2 className="w-4 h-4 text-[#123B5D] shrink-0 mt-0.5" />
                    <span>Review business assessments</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <CheckCircle2 className="w-4 h-4 text-[#123B5D] shrink-0 mt-0.5" />
                    <span>Monitor scheme recommendations</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <CheckCircle2 className="w-4 h-4 text-[#123B5D] shrink-0 mt-0.5" />
                    <span>View reports and analytics</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <CheckCircle2 className="w-4 h-4 text-[#123B5D] shrink-0 mt-0.5" />
                    <span>Manage and support entrepreneurs</span>
                  </li>
                </ul>
              </div>

              {/* Action Button */}
              <button
                type="button"
                onClick={onSelectAdmin}
                className="mt-6 w-full py-3 px-4 rounded-xl bg-[#123B5D] hover:bg-[#0D2E49] active:scale-[0.99] text-white font-bold text-sm shadow-md transition-all flex items-center justify-center space-x-2"
              >
                <span>Continue as Admin</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </section>
      </main>

      {/* Bottom Footer Landscape Strip */}
      <footer className="relative z-10 w-full bg-white/70 backdrop-blur-sm border-t border-[#DCE4E8] py-4 px-4 text-center text-xs text-[#667085]">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>
            Gram Sarthi AI • Ministry of Social Justice & Empowerment • Smart India Hackathon 2026
          </span>
          <span className="font-semibold text-[#167C5A]">
            NBCFDC • NSFDC • NSKFDC • PMEGP Verified Platform
          </span>
        </div>
      </footer>
    </div>
  );
}

export default AuthPortalLanding;
