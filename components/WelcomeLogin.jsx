import React, { useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Award,
  Building2,
  CheckCircle2,
  Eye,
  EyeOff,
  Globe2,
  IndianRupee,
  Landmark,
  Mail,
  MapPin,
  MessageSquare,
  ShieldCheck,
  Sparkles,
  Store,
  TrendingUp,
  Truck,
} from "lucide-react";
import { useApp } from "../context/AppContext";
import { useAuth } from "../context/AuthContext";

const API_BASE = (import.meta.env.VITE_API_URL || "").replace(/\/$/, "");

export function WelcomeLogin() {
  const { language, setLanguage } = useApp();
  const { loginUser, registerUser } = useAuth();

  // If path is /login or /signup, default directly into user login card
  const isAuthDirectPath =
    window.location.pathname === "/login" ||
    window.location.pathname === "/signup";
  const [showUserForm, setShowUserForm] = useState(isAuthDirectPath);
  const [isSignUp, setIsSignUp] = useState(
    window.location.pathname === "/signup",
  );

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleUserLoginSubmit = async (event) => {
    event.preventDefault();
    setError("");

    if (isSignUp && !name.trim()) {
      setError(
        language === "hi"
          ? "कृपया अपना पूरा नाम दर्ज करें।"
          : "Please enter your full name.",
      );
      return;
    }
    if (
      isSignUp &&
      (name.trim().length > 100 || /[<>\u0000-\u001f]/.test(name))
    ) {
      setError(
        language === "hi"
          ? "कृपया एक वैध नाम दर्ज करें।"
          : "Please enter a valid name (up to 100 characters).",
      );
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.trim())) {
      setError(
        language === "hi"
          ? "कृपया एक वैध ईमेल पता दर्ज करें।"
          : "Please enter a valid email address.",
      );
      return;
    }
    if (!password) {
      setError(
        language === "hi"
          ? "कृपया अपना पासवर्ड दर्ज करें।"
          : "Please enter your password.",
      );
      return;
    }
    if (isSignUp && (password.length < 12 || password.length > 72)) {
      setError(
        language === "hi"
          ? "पासवर्ड 12 से 72 अक्षरों के बीच होना चाहिए।"
          : "Password must be between 12 and 72 characters.",
      );
      return;
    }
    if (isSignUp && password !== confirmPassword) {
      setError(
        language === "hi"
          ? "पासवर्ड मेल नहीं खा रहे हैं।"
          : "Passwords do not match.",
      );
      return;
    }

    setLoading(true);
    try {
      if (isSignUp) {
        await registerUser(name.trim(), email.trim(), password);
      } else {
        await loginUser(email.trim(), password);
      }
    } catch (loginError) {
      const message = loginError.message || "";
      setError(
        /already exists|already registered/i.test(message)
          ? language === "hi"
            ? "यह ईमेल पहले से पंजीकृत है। कृपया लॉगिन करें।"
            : "Email already registered. Please log in instead."
          : /incorrect email|invalid email or password/i.test(message)
            ? language === "hi"
              ? "गलत ईमेल अथवा पासवर्ड।"
              : "Incorrect email or password."
            : message ||
              (isSignUp
                ? language === "hi"
                  ? "खाता बनाने में असमर्थ। कृपया पुनः प्रयास करें।"
                  : "Unable to create your account. Please try again."
                : language === "hi"
                  ? "लॉगिन करने में असमर्थ। कृपया पुनः प्रयास करें।"
                  : "Unable to sign in. Please try again."),
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen w-full bg-cover bg-center bg-no-repeat relative flex flex-col justify-between"
      style={{
        backgroundImage: "url('/auth-bg.jpg')",
        backgroundColor: "#F7F9F7",
      }}
    >
      {/* Background Soft Overlay for optimum legibility across light backgrounds */}
      <div className="absolute inset-0 bg-white/40 backdrop-blur-[1px] pointer-events-none" />

      {/* TOP HEADER / BRANDING & FEATURE STRIP */}
      <header className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-5 pb-3">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          {/* Logo & Brand Identity */}
          <div className="flex items-center space-x-3.5">
            <div className="w-12 h-12 rounded-2xl bg-white p-1.5 flex items-center justify-center shadow-md border border-[#DCE4E8] shrink-0">
              <img
                src="/logo.png"
                alt="GRAM SARTHI AI Logo"
                className="w-full h-full object-contain"
              />
            </div>
            <div>
              <div className="flex items-baseline space-x-2.5">
                <span className="text-xl sm:text-2xl font-black tracking-tight text-[#123B5D]">
                  GRAM SARTHI AI
                </span>
                <span className="text-sm sm:text-base font-bold text-[#167C5A]">
                  गाँव से विकास की ओर
                </span>
              </div>
              <p className="text-xs text-[#475569] font-medium tracking-wide">
                Hyper-Local Business & Financial Advisory Assistant
              </p>
            </div>
          </div>

          {/* Feature Strip & Language Selector */}
          <div className="flex flex-wrap items-center gap-3 sm:gap-4">
            {/* 5 Feature Chips */}
            <div className="hidden md:flex items-center space-x-3 bg-white/85 backdrop-blur-md px-3.5 py-1.5 rounded-2xl border border-[#DCE4E8] shadow-sm text-[11px] text-[#17212B]">
              <div className="flex items-center space-x-1.5">
                <div className="w-6 h-6 rounded-full bg-[#E8F6F1] flex items-center justify-center text-[#167C5A]">
                  <MapPin className="w-3.5 h-3.5" />
                </div>
                <span className="font-semibold leading-tight">
                  Local
                  <br />
                  Market
                </span>
              </div>
              <span className="text-slate-300">|</span>
              <div className="flex items-center space-x-1.5">
                <div className="w-6 h-6 rounded-full bg-[#EEF4FA] flex items-center justify-center text-[#123B5D]">
                  <IndianRupee className="w-3.5 h-3.5" />
                </div>
                <span className="font-semibold leading-tight">
                  Financial
                  <br />
                  Planning
                </span>
              </div>
              <span className="text-slate-300">|</span>
              <div className="flex items-center space-x-1.5">
                <div className="w-6 h-6 rounded-full bg-[#FFF7E6] flex items-center justify-center text-[#F59E0B]">
                  <Landmark className="w-3.5 h-3.5" />
                </div>
                <span className="font-semibold leading-tight">
                  Government
                  <br />
                  Schemes
                </span>
              </div>
              <span className="text-slate-300">|</span>
              <div className="flex items-center space-x-1.5">
                <div className="w-6 h-6 rounded-full bg-[#E8F6F1] flex items-center justify-center text-[#167C5A]">
                  <TrendingUp className="w-3.5 h-3.5" />
                </div>
                <span className="font-semibold leading-tight">
                  AI
                  <br />
                  Advisory
                </span>
              </div>
              <span className="text-slate-300">|</span>
              <div className="flex items-center space-x-1.5">
                <div className="w-6 h-6 rounded-full bg-[#EEF4FA] flex items-center justify-center text-[#123B5D]">
                  <Store className="w-3.5 h-3.5" />
                </div>
                <span className="font-semibold leading-tight">
                  Supplier
                  <br />
                  Discovery
                </span>
              </div>
            </div>

            {/* Language Selector */}
            <button
              type="button"
              onClick={() => setLanguage(language === "hi" ? "en" : "hi")}
              className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-full bg-white/90 hover:bg-white text-xs font-bold text-[#123B5D] border border-[#DCE4E8] shadow-sm transition"
              title="Toggle Hindi / English"
            >
              <Globe2 className="w-3.5 h-3.5 text-[#167C5A]" />
              <span>{language === "hi" ? "English" : "हिन्दी / English"}</span>
            </button>
          </div>
        </div>
      </header>

      {/* MAIN BODY AREA */}
      <main className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 my-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          {/* HERO LEFT COLUMN */}
          <div className="lg:col-span-5 space-y-6">
            <div>
              <h1 className="text-3xl sm:text-4xl lg:text-[42px] font-black font-serif tracking-tight leading-[1.18]">
                <span className="text-[#123B5D] block">Empowering</span>
                <span className="text-[#167C5A] block mt-0.5">
                  Rural Entrepreneurs
                </span>
              </h1>
              <div className="w-20 h-1 bg-[#F59E0B] rounded-full mt-3" />
            </div>

            <p className="text-sm sm:text-base text-[#1E293B] leading-relaxed max-w-md font-medium">
              {language === "hi"
                ? "स्थानीय अवसरों से लेकर वित्तीय योजना, सरकारी योजनाओं के मार्गदर्शन और बाज़ार विश्लेषण तक — ग्राम सारथी AI आपके विचारों को सफल और टिकाऊ उद्यम में बदलने में मदद करता है।"
                : "From local opportunities to financial planning, scheme guidance and market insights — Gram Sarthi AI helps you turn ideas into sustainable businesses."}
            </p>

            {/* Hindi Quote Badge */}
            <div className="inline-block bg-white/70 backdrop-blur-sm border-l-4 border-[#F59E0B] rounded-r-xl px-4 py-3 shadow-sm">
              <p className="font-serif italic text-sm sm:text-base text-[#17212B] font-semibold leading-snug">
                “ स्थानीय जानकारी,
                <br />
                &nbsp;&nbsp;सही मार्गदर्शन,
                <br />
                &nbsp;&nbsp;बेहतर भविष्य ”
              </p>
            </div>
          </div>

          {/* RIGHT COLUMN: PORTAL SELECTION CARDS OR USER LOGIN FORM */}
          <div className="lg:col-span-7 flex flex-col items-center">
            {!showUserForm ? (
              /* DUAL PORTAL CARDS SELECTION */
              <div className="w-full max-w-2xl">
                <div className="text-center mb-6">
                  <h2 className="text-2xl sm:text-3xl font-black text-[#17212B] tracking-tight">
                    {language === "hi"
                      ? "अपना पोर्टल चुनें"
                      : "Choose Your Portal"}
                  </h2>
                  <p className="text-xs sm:text-sm text-[#475569] mt-1 font-medium">
                    {language === "hi"
                      ? "अपनी आवश्यकता के अनुसार सही उपकरण और जानकारी का उपयोग करें।"
                      : "Access the right tools and information for your needs."}
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6">
                  {/* CARD 1: USER LOGIN */}
                  <div className="bg-white/95 backdrop-blur-md rounded-2xl border border-[#A9DDCB] shadow-card hover:shadow-hover transition-all duration-200 p-5 flex flex-col justify-between group">
                    <div>
                      {/* Illustration */}
                      <div className="w-full h-32 rounded-xl bg-[#E8F6F1]/50 border border-[#D3EFE5] overflow-hidden flex items-center justify-center p-1 mb-4">
                        <img
                          src="/user-portal-ill.png"
                          alt="Rural Entrepreneur User"
                          className="w-full h-full object-contain"
                        />
                      </div>

                      <h3 className="text-lg font-bold text-[#17212B]">
                        {language === "hi" ? "उपयोगकर्ता लॉगिन" : "User Login"}
                      </h3>
                      <p className="text-xs text-[#667085] mt-0.5 leading-relaxed font-medium">
                        {language === "hi"
                          ? "उद्यमियों, किसानों और व्यापार मालिकों के लिए"
                          : "For Entrepreneurs, Farmers and Business Owners"}
                      </p>

                      <ul className="mt-4 space-y-2 text-xs text-[#1E293B]">
                        <li className="flex items-center space-x-2">
                          <CheckCircle2 className="w-4 h-4 text-[#167C5A] shrink-0" />
                          <span>Create business assessment</span>
                        </li>
                        <li className="flex items-center space-x-2">
                          <CheckCircle2 className="w-4 h-4 text-[#167C5A] shrink-0" />
                          <span>Get market & financial insights</span>
                        </li>
                        <li className="flex items-center space-x-2">
                          <CheckCircle2 className="w-4 h-4 text-[#167C5A] shrink-0" />
                          <span>Explore government schemes</span>
                        </li>
                        <li className="flex items-center space-x-2">
                          <CheckCircle2 className="w-4 h-4 text-[#167C5A] shrink-0" />
                          <span>Find local suppliers</span>
                        </li>
                        <li className="flex items-center space-x-2">
                          <CheckCircle2 className="w-4 h-4 text-[#167C5A] shrink-0" />
                          <span>Generate detailed reports</span>
                        </li>
                      </ul>
                    </div>

                    <button
                      type="button"
                      onClick={() => setShowUserForm(true)}
                      className="mt-6 w-full py-2.5 px-4 rounded-xl bg-[#167C5A] hover:bg-[#105D44] text-white font-bold text-sm shadow-sm transition flex items-center justify-center space-x-2 group-hover:scale-[1.01]"
                    >
                      <span>
                        {language === "hi"
                          ? "आगे बढ़ें (यूज़र) →"
                          : "Continue as User →"}
                      </span>
                    </button>
                  </div>

                  {/* CARD 2: ADMIN / OFFICER LOGIN */}
                  <div className="bg-white/95 backdrop-blur-md rounded-2xl border border-[#B8D5E5] shadow-card hover:shadow-hover transition-all duration-200 p-5 flex flex-col justify-between group">
                    <div>
                      {/* Illustration */}
                      <div className="w-full h-32 rounded-xl bg-[#EEF4FA]/60 border border-[#D5E3F0] overflow-hidden flex items-center justify-center p-1 mb-4">
                        <img
                          src="/admin-portal-ill.png"
                          alt="Government Administrative Officer"
                          className="w-full h-full object-contain"
                        />
                      </div>

                      <h3 className="text-lg font-bold text-[#17212B]">
                        {language === "hi"
                          ? "अधिकारी / एडमिन लॉगिन"
                          : "Admin / Officer Login"}
                      </h3>
                      <p className="text-xs text-[#667085] mt-0.5 leading-relaxed font-medium">
                        {language === "hi"
                          ? "सरकारी अधिकारियों एवं अधिकृत कार्मिकों के लिए"
                          : "For Government Officials and Authorized Officers"}
                      </p>

                      <ul className="mt-4 space-y-2 text-xs text-[#1E293B]">
                        <li className="flex items-center space-x-2">
                          <CheckCircle2 className="w-4 h-4 text-[#123B5D] shrink-0" />
                          <span>Access administrative dashboard</span>
                        </li>
                        <li className="flex items-center space-x-2">
                          <CheckCircle2 className="w-4 h-4 text-[#123B5D] shrink-0" />
                          <span>Review business assessments</span>
                        </li>
                        <li className="flex items-center space-x-2">
                          <CheckCircle2 className="w-4 h-4 text-[#123B5D] shrink-0" />
                          <span>Monitor scheme recommendations</span>
                        </li>
                        <li className="flex items-center space-x-2">
                          <CheckCircle2 className="w-4 h-4 text-[#123B5D] shrink-0" />
                          <span>View reports and analytics</span>
                        </li>
                        <li className="flex items-center space-x-2">
                          <CheckCircle2 className="w-4 h-4 text-[#123B5D] shrink-0" />
                          <span>Manage and support entrepreneurs</span>
                        </li>
                      </ul>
                    </div>

                    <button
                      type="button"
                      onClick={() => window.location.assign("/admin/login")}
                      className="mt-6 w-full py-2.5 px-4 rounded-xl bg-[#123B5D] hover:bg-[#0D2E49] text-white font-bold text-sm shadow-sm transition flex items-center justify-center space-x-2 group-hover:scale-[1.01]"
                    >
                      <span>
                        {language === "hi"
                          ? "आगे बढ़ें (एडमिन) →"
                          : "Continue as Admin →"}
                      </span>
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              /* USER LOGIN / REGISTRATION FORM CARD */
              <div className="user-auth-card w-full max-w-md bg-white/95 backdrop-blur-md rounded-2xl border border-[#DCE4E8] shadow-card p-6 sm:p-7 relative transition-all">
                <button
                  type="button"
                  onClick={() => setShowUserForm(false)}
                  className="user-auth-back inline-flex items-center space-x-1.5 text-xs font-bold text-[#167C5A] hover:text-[#105D44] mb-4 transition"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>
                    {language === "hi"
                      ? "← पोर्टल चयन पर वापस जाएं"
                      : "← Back to Portal Selection"}
                  </span>
                </button>

                <div className="user-auth-heading mb-5">
                  <h2 className="text-xl sm:text-2xl font-black text-[#17212B]">
                    {isSignUp
                      ? language === "hi"
                        ? "नया खाता बनाएं"
                        : "Create your account"
                      : language === "hi"
                        ? "स्वागत है"
                        : "Welcome back"}
                  </h2>
                  <p className="text-xs text-[#667085] mt-1 font-medium">
                    {isSignUp
                      ? language === "hi"
                        ? "अपनी उद्यम यात्रा शुरू करने के लिए पंजीकरण करें।"
                        : "Register to begin your business advisory journey."
                      : language === "hi"
                        ? "अपने उद्यम सलाहकार पोर्टल में जारी रखने के लिए लॉगिन करें।"
                        : "Sign in to continue to your business advisory portal."}
                  </p>
                </div>

                <form onSubmit={handleUserLoginSubmit} noValidate>
                  {isSignUp && (
                    <div className="mb-3.5">
                      <label
                        className="block text-xs font-bold text-[#17212B] mb-1.5"
                        htmlFor="user-signup-name"
                      >
                        {language === "hi" ? "पूरा नाम" : "Full name"}
                      </label>
                      <input
                        id="user-signup-name"
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="e.g. Ramesh Kumar"
                        autoComplete="name"
                        className="w-full h-10 px-3 rounded-lg border border-[#DCE4E8] bg-white text-sm text-[#17212B] focus:outline-none focus:border-[#167C5A] focus:ring-2 focus:ring-[#167C5A]/15"
                      />
                    </div>
                  )}

                  <div className="mb-3.5">
                    <label
                      className="block text-xs font-bold text-[#17212B] mb-1.5"
                      htmlFor="user-login-email"
                    >
                      {language === "hi" ? "ईमेल" : "Email"}
                    </label>
                    <div className="relative">
                      <input
                        id="user-login-email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="you@example.com"
                        autoComplete={isSignUp ? "email" : "username"}
                        className="user-auth-input w-full h-10 pl-9 pr-3 rounded-lg border border-[#DCE4E8] bg-white text-sm text-[#17212B] focus:outline-none focus:border-[#167C5A] focus:ring-2 focus:ring-[#167C5A]/15"
                      />
                      <Mail className="w-4 h-4 text-[#667085] absolute left-3 top-3 pointer-events-none" />
                    </div>
                  </div>

                  <div className="mb-3.5">
                    <label
                      className="block text-xs font-bold text-[#17212B] mb-1.5"
                      htmlFor="user-login-password"
                    >
                      {language === "hi" ? "पासवर्ड" : "Password"}
                    </label>
                    <div className="relative">
                      <input
                        id="user-login-password"
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••••••"
                        autoComplete={
                          isSignUp ? "new-password" : "current-password"
                        }
                        className="user-auth-input w-full h-10 pl-3 pr-10 rounded-lg border border-[#DCE4E8] bg-white text-sm text-[#17212B] focus:outline-none focus:border-[#167C5A] focus:ring-2 focus:ring-[#167C5A]/15"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword((v) => !v)}
                        className="absolute right-2.5 top-2.5 text-[#667085] hover:text-[#17212B]"
                        aria-label={
                          showPassword ? "Hide password" : "Show password"
                        }
                      >
                        {showPassword ? (
                          <EyeOff size={16} />
                        ) : (
                          <Eye size={16} />
                        )}
                      </button>
                    </div>
                  </div>

                  {isSignUp && (
                    <div className="mb-3.5">
                      <label
                        className="block text-xs font-bold text-[#17212B] mb-1.5"
                        htmlFor="user-confirm-password"
                      >
                        {language === "hi"
                          ? "पासवर्ड की पुष्टि करें"
                          : "Confirm password"}
                      </label>
                      <div className="relative">
                        <input
                          id="user-confirm-password"
                          type={showConfirmPassword ? "text" : "password"}
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          placeholder="••••••••••••"
                          autoComplete="new-password"
                          className="w-full h-10 pl-3 pr-10 rounded-lg border border-[#DCE4E8] bg-white text-sm text-[#17212B] focus:outline-none focus:border-[#167C5A] focus:ring-2 focus:ring-[#167C5A]/15"
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword((v) => !v)}
                          className="absolute right-2.5 top-2.5 text-[#667085] hover:text-[#17212B]"
                          aria-label={
                            showConfirmPassword
                              ? "Hide password"
                              : "Show password"
                          }
                        >
                          {showConfirmPassword ? (
                            <EyeOff size={16} />
                          ) : (
                            <Eye size={16} />
                          )}
                        </button>
                      </div>
                    </div>
                  )}

                  {error && (
                    <div
                      className="p-2.5 mb-3 rounded-lg bg-red-50 border border-red-200 text-xs font-semibold text-red-600"
                      role="alert"
                    >
                      {error}
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={loading}
                    className="user-auth-submit w-full h-10 mt-2 rounded-xl bg-[#167C5A] hover:bg-[#105D44] text-white font-bold text-sm shadow-sm transition flex items-center justify-center space-x-2 disabled:opacity-60"
                  >
                    <span>
                      {loading
                        ? isSignUp
                          ? language === "hi"
                            ? "खाता बनाया जा रहा है..."
                            : "Creating account..."
                          : language === "hi"
                            ? "लॉगिन किया जा रहा है..."
                            : "Signing in..."
                        : isSignUp
                          ? language === "hi"
                            ? "खाता बनाएं"
                            : "Create account"
                          : language === "hi"
                            ? "लॉगिन करें"
                            : "Sign In"}
                    </span>
                    {!loading && <ArrowRight size={16} />}
                  </button>
                </form>

                <div className="flex items-center my-4 text-xs text-[#667085]">
                  <div className="flex-1 border-t border-[#DCE4E8]" />
                  <span className="px-3">or</span>
                  <div className="flex-1 border-t border-[#DCE4E8]" />
                </div>

                {!isSignUp && (
                  <button
                    type="button"
                    onClick={() => {
                      window.location.assign(`${API_BASE}/api/auth/google`);
                    }}
                    className="user-auth-google w-full h-10 rounded-xl bg-white border border-[#DCE4E8] hover:bg-slate-50 text-xs font-bold text-[#17212B] shadow-sm transition flex items-center justify-center space-x-2"
                  >
                    <span
                      className="font-bold text-blue-600 text-sm"
                      aria-hidden="true"
                    >
                      G
                    </span>
                    <span>Continue with Google</span>
                  </button>
                )}

                <div className="user-auth-footer mt-4 pt-3 border-t border-[#DCE4E8] flex items-center justify-between text-xs font-semibold">
                  <button
                    type="button"
                    onClick={() => {
                      setIsSignUp((prev) => !prev);
                      setError("");
                    }}
                    className="text-[#167C5A] hover:underline"
                  >
                    {isSignUp
                      ? language === "hi"
                        ? "पहले से खाता है? लॉगिन करें"
                        : "Already have an account? Sign In"
                      : language === "hi"
                        ? "खाता नहीं है? नया बनाएं"
                        : "Don't have an account? Sign Up"}
                  </button>

                  <a
                    href="/feedback"
                    className="text-[#667085] hover:text-[#123B5D] flex items-center space-x-1"
                  >
                    <MessageSquare size={13} />
                    <span>Feedback</span>
                  </a>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* FOOTER DISCREET SPACING (the background art has the bottom landscape) */}
      <footer className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex flex-col sm:flex-row items-center justify-between text-[11px] text-[#475569] font-medium">
        <span>Gram Sarthi AI • Smart India Hackathon 2026 (PS ID: 26091)</span>
        <span>Ministry of Social Justice and Empowerment</span>
      </footer>
    </div>
  );
}

export default WelcomeLogin;
