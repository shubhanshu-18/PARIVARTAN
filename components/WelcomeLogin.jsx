import React, { useState } from "react";
import {
  ArrowRight,
  Award,
  Boxes,
  Building,
  Building2,
  CheckCircle2,
  ChevronRight,
  Eye,
  EyeOff,
  Globe2,
  IndianRupee,
  Landmark,
  Lock,
  Mail,
  MapPin,
  MessageSquare,
  Shield,
  ShieldCheck,
  Sparkles,
  Sprout,
  Store,
  TrendingUp,
  User,
  Users,
  X,
} from "lucide-react";
import { useApp } from "../context/AppContext";
import { useAuth } from "../context/AuthContext";

const API_BASE = (import.meta.env.VITE_API_URL || "").replace(/\/$/, "");

export function WelcomeLogin() {
  const { language, setLanguage } = useApp();
  const { loginUser, registerUser } = useAuth();

  const [showUserAuthModal, setShowUserAuthModal] = useState(
    window.location.pathname === "/login" ||
      window.location.pathname === "/signup",
  );
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

  const toggleLanguage = () => {
    setLanguage(language === "hi" ? "en" : "hi");
  };

  const handleUserSubmit = async (event) => {
    event.preventDefault();
    setError("");
    if (isSignUp && !name.trim()) {
      setError("Please enter your full name.");
      return;
    }
    if (
      isSignUp &&
      (name.trim().length > 100 || /[<>\u0000-\u001f]/.test(name))
    ) {
      setError("Please enter a valid name (up to 100 characters).");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.trim())) {
      setError("Please enter a valid email address.");
      return;
    }
    if (!password) {
      setError("Please enter your password.");
      return;
    }
    if (isSignUp && (password.length < 8 || password.length > 72)) {
      setError("Password must be between 8 and 72 characters.");
      return;
    }
    if (isSignUp && password !== confirmPassword) {
      setError("Passwords do not match.");
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
          ? "Email already registered. Please log in instead."
          : /incorrect email|invalid email or password/i.test(message)
            ? "Incorrect email or password."
            : message ||
              (isSignUp
                ? "Unable to create your account. Please try again."
                : "Unable to sign in. Please try again."),
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAFBF8] text-[#17212B] font-sans relative overflow-x-hidden flex flex-col justify-between selection:bg-[#167C5A] selection:text-white">
      {/* TOP HEADER */}
      <header className="max-w-7xl mx-auto w-full px-4 sm:px-6 pt-5 pb-3 flex flex-wrap items-center justify-between gap-4 z-20">
        {/* Brand & Tagline */}
        <div className="flex items-center space-x-3.5">
          <div className="w-12 h-12 rounded-2xl bg-white p-1.5 flex items-center justify-center shadow-md border border-[#DCE4E8] shrink-0">
            <img
              src="/logo.png"
              alt="GRAM SARTHI AI Logo"
              className="w-full h-full object-contain"
            />
          </div>
          <div>
            <div className="flex items-baseline space-x-2">
              <span className="text-xl sm:text-2xl font-black tracking-tight text-[#123B5D]">
                GRAM SARTHI AI
              </span>
            </div>
            <div className="flex items-center space-x-1.5 text-xs font-bold text-[#167C5A]">
              <span>गाँव से विकास की ओर</span>
            </div>
            <p className="text-[11px] text-[#667085] font-medium hidden sm:block">
              Hyper-Local Business & Financial Advisory Assistant
            </p>
          </div>
        </div>

        {/* Feature Strip + Language Selector */}
        <div className="flex items-center space-x-2 sm:space-x-3 flex-wrap">
          {/* Feature Indicators */}
          <div className="hidden xl:flex items-center space-x-2.5 mr-2">
            <div className="flex items-center space-x-2 px-3 py-1.5 rounded-xl bg-white border border-[#DCE4E8] shadow-subtle text-xs">
              <div className="w-6 h-6 rounded-lg bg-[#E8F6F1] flex items-center justify-center text-[#167C5A]">
                <MapPin className="w-3.5 h-3.5" />
              </div>
              <div className="leading-tight">
                <span className="block font-bold text-[#123B5D]">Local</span>
                <span className="text-[10px] text-[#667085]">Market Insights</span>
              </div>
            </div>

            <div className="flex items-center space-x-2 px-3 py-1.5 rounded-xl bg-white border border-[#DCE4E8] shadow-subtle text-xs">
              <div className="w-6 h-6 rounded-lg bg-[#E8F6F1] flex items-center justify-center text-[#167C5A]">
                <IndianRupee className="w-3.5 h-3.5" />
              </div>
              <div className="leading-tight">
                <span className="block font-bold text-[#123B5D]">Financial</span>
                <span className="text-[10px] text-[#667085]">Planning</span>
              </div>
            </div>

            <div className="flex items-center space-x-2 px-3 py-1.5 rounded-xl bg-white border border-[#DCE4E8] shadow-subtle text-xs">
              <div className="w-6 h-6 rounded-lg bg-[#EEF4FA] flex items-center justify-center text-[#123B5D]">
                <Landmark className="w-3.5 h-3.5" />
              </div>
              <div className="leading-tight">
                <span className="block font-bold text-[#123B5D]">Government</span>
                <span className="text-[10px] text-[#667085]">Scheme Guidance</span>
              </div>
            </div>

            <div className="flex items-center space-x-2 px-3 py-1.5 rounded-xl bg-white border border-[#DCE4E8] shadow-subtle text-xs">
              <div className="w-6 h-6 rounded-lg bg-[#FFF7E6] flex items-center justify-center text-[#F59E0B]">
                <TrendingUp className="w-3.5 h-3.5" />
              </div>
              <div className="leading-tight">
                <span className="block font-bold text-[#123B5D]">AI</span>
                <span className="text-[10px] text-[#667085]">Advisory</span>
              </div>
            </div>

            <div className="flex items-center space-x-2 px-3 py-1.5 rounded-xl bg-white border border-[#DCE4E8] shadow-subtle text-xs">
              <div className="w-6 h-6 rounded-lg bg-[#E8F6F1] flex items-center justify-center text-[#167C5A]">
                <Store className="w-3.5 h-3.5" />
              </div>
              <div className="leading-tight">
                <span className="block font-bold text-[#123B5D]">Supplier</span>
                <span className="text-[10px] text-[#667085]">Discovery</span>
              </div>
            </div>
          </div>

          {/* Language Toggle */}
          <button
            type="button"
            onClick={toggleLanguage}
            className="flex items-center space-x-2 px-3.5 py-1.5 rounded-xl bg-white border border-[#DCE4E8] shadow-subtle text-xs font-bold text-[#123B5D] hover:bg-slate-50 transition"
          >
            <Globe2 className="w-4 h-4 text-[#167C5A]" />
            <span>{language === "hi" ? "🌐 English" : "🌐 हिन्दी / English"}</span>
          </button>
        </div>
      </header>

      {/* MAIN CONTENT AREA */}
      <main className="max-w-7xl mx-auto w-full px-4 sm:px-6 py-6 sm:py-8 grid lg:grid-cols-12 gap-8 lg:gap-10 items-center z-10">
        {/* LEFT COLUMN: HERO & RURAL CONTEXT */}
        <div className="lg:col-span-6 space-y-6">
          {/* Editorial Headline */}
          <div className="space-y-2">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight leading-[1.15]">
              <span className="text-[#123B5D] block">Empowering</span>
              <span className="text-[#167C5A] block">Rural Entrepreneurs</span>
            </h1>

            {/* Hand-drawn accent underline */}
            <svg
              className="w-44 sm:w-56 h-3 text-[#F59E0B]"
              viewBox="0 0 200 9"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M3 6.5C45.5 2.5 125 1.5 197 6.5"
                stroke="currentColor"
                strokeWidth="3.5"
                strokeLinecap="round"
              />
            </svg>
          </div>

          {/* Hero Subtitle */}
          <p className="text-sm sm:text-base text-[#475569] leading-relaxed max-w-xl font-normal">
            From local opportunities to financial planning, scheme guidance and
            market insights — Gram Sarthi AI helps you turn ideas into
            sustainable businesses.
          </p>

          {/* Visual Vignette: Rural Indian Entrepreneur with Tablet */}
          <div className="relative rounded-2xl overflow-hidden border border-[#DCE4E8] shadow-md bg-white max-w-lg group">
            <div className="relative h-60 sm:h-64 w-full bg-gradient-to-tr from-emerald-900/40 to-transparent">
              <img
                src="/landing-reference.jpg"
                alt="Rural Entrepreneur using Gram Sarthi AI"
                className="w-full h-full object-cover object-left transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

              {/* Hindi Quote Overlay */}
              <div className="absolute bottom-3 left-4 right-4 text-white">
                <p className="text-xs sm:text-sm font-semibold italic text-amber-100 font-devanagari drop-shadow">
                  “ स्थानीय जानकारी, सही मार्गदर्शन, बेहतर भविष्य ”
                </p>
                <span className="text-[10px] text-slate-300 block mt-0.5">
                  AI-Assisted Rural Enterprise Advisory
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: PORTAL SELECTION CARDS */}
        <div className="lg:col-span-6 space-y-4">
          <div className="text-center lg:text-left mb-2">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#123B5D] tracking-tight">
              Choose Your Portal
            </h2>
            <p className="text-xs sm:text-sm text-[#667085] mt-1 font-medium">
              Access the right tools and information for your needs.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 gap-4 sm:gap-5">
            {/* CARD 1: USER LOGIN */}
            <div className="bg-white rounded-2xl p-5 sm:p-6 border-2 border-[#A9DDCB] shadow-sm hover:shadow-hover transition-all flex flex-col justify-between group relative overflow-hidden">
              <div className="space-y-4">
                {/* Illustration Badge */}
                <div className="w-full h-32 rounded-xl bg-gradient-to-b from-[#E8F6F1] to-white border border-[#A9DDCB]/60 p-3 flex flex-col items-center justify-center text-center relative overflow-hidden">
                  <div className="w-12 h-12 rounded-2xl bg-[#167C5A] text-white flex items-center justify-center shadow-md mb-2">
                    <Sprout className="w-6 h-6" />
                  </div>
                  <span className="text-xs font-bold text-[#105D44]">
                    Entrepreneur & Farmer Space
                  </span>
                </div>

                <div>
                  <h3 className="text-lg font-black text-[#123B5D]">
                    User Login
                  </h3>
                  <p className="text-xs text-[#667085] mt-0.5 font-medium">
                    For Entrepreneurs, Farmers and Business Owners
                  </p>
                </div>

                {/* Feature checklist */}
                <ul className="space-y-2 text-xs text-[#334155]">
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

              <div className="pt-6">
                <button
                  type="button"
                  onClick={() => {
                    setIsSignUp(false);
                    setShowUserAuthModal(true);
                  }}
                  className="w-full py-3 px-4 rounded-xl bg-[#167C5A] hover:bg-[#105D44] text-white font-bold text-sm shadow-md transition-all flex items-center justify-center space-x-2 group-hover:translate-y-[-1px]"
                >
                  <span>Continue as User</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* CARD 2: ADMIN / OFFICER LOGIN */}
            <div className="bg-white rounded-2xl p-5 sm:p-6 border-2 border-blue-200 shadow-sm hover:shadow-hover transition-all flex flex-col justify-between group relative overflow-hidden">
              <div className="space-y-4">
                {/* Illustration Badge */}
                <div className="w-full h-32 rounded-xl bg-gradient-to-b from-[#EEF4FA] to-white border border-blue-200/60 p-3 flex flex-col items-center justify-center text-center relative overflow-hidden">
                  <div className="w-12 h-12 rounded-2xl bg-[#123B5D] text-white flex items-center justify-center shadow-md mb-2">
                    <Building2 className="w-6 h-6" />
                  </div>
                  <span className="text-xs font-bold text-[#123B5D]">
                    Administrative Intelligence
                  </span>
                </div>

                <div>
                  <h3 className="text-lg font-black text-[#123B5D]">
                    Admin / Officer Login
                  </h3>
                  <p className="text-xs text-[#667085] mt-0.5 font-medium">
                    For Government Officials and Authorized Officers
                  </p>
                </div>

                {/* Feature checklist */}
                <ul className="space-y-2 text-xs text-[#334155]">
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

              <div className="pt-6">
                <a
                  href="/admin/login"
                  className="w-full py-3 px-4 rounded-xl bg-[#123B5D] hover:bg-[#0D2E49] text-white font-bold text-sm shadow-md transition-all flex items-center justify-center space-x-2 group-hover:translate-y-[-1px]"
                >
                  <span>Continue as Admin</span>
                  <ArrowRight className="w-4 h-4" />
                </a>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* BOTTOM DECORATIVE LANDSCAPE */}
      <div className="w-full relative pt-6 pb-4 overflow-hidden border-t border-[#DCE4E8]/60 bg-gradient-to-t from-[#E8F6F1]/50 to-transparent">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-[#667085]">
          <div className="flex items-center space-x-2">
            <ShieldCheck className="w-4 h-4 text-[#167C5A]" />
            <span>
              Smart India Hackathon 2026 • Ministry of Social Justice and
              Empowerment
            </span>
          </div>
          <div className="flex items-center space-x-4">
            <a href="/feedback" className="hover:text-[#123B5D] transition">
              Share Feedback
            </a>
            <span>•</span>
            <span>NBCFDC • NSFDC • NSKFDC • PMEGP</span>
          </div>
        </div>
      </div>

      {/* USER LOGIN / REGISTRATION MODAL */}
      {showUserAuthModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 sm:p-8 border border-[#DCE4E8] shadow-2xl relative animate-in fade-in zoom-in-95 duration-200">
            {/* Close Button */}
            <button
              type="button"
              onClick={() => setShowUserAuthModal(false)}
              className="absolute top-4 right-4 w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-[#667085] transition"
              aria-label="Close modal"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Modal Header */}
            <div className="flex items-center space-x-2.5 mb-5">
              <div className="w-9 h-9 rounded-xl bg-[#E8F6F1] flex items-center justify-center text-[#167C5A]">
                <Sprout className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-black text-[#123B5D]">
                  {isSignUp ? "Create User Account" : "User Portal Sign In"}
                </h3>
                <p className="text-xs text-[#667085]">
                  {isSignUp
                    ? "Join Gram Sarthi AI to start your business advisory journey."
                    : "Sign in to access your business advisory workspace."}
                </p>
              </div>
            </div>

            {/* Auth Form */}
            <form onSubmit={handleUserSubmit} noValidate className="space-y-3.5">
              {isSignUp && (
                <div>
                  <label
                    htmlFor="modal-signup-name"
                    className="block text-xs font-bold text-[#17212B] mb-1"
                  >
                    Full Name
                  </label>
                  <div className="relative">
                    <input
                      id="modal-signup-name"
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. Ramesh Kumar"
                      className="w-full h-11 px-3.5 rounded-lg border border-[#DCE4E8] text-sm text-[#17212B] focus:border-[#167C5A] focus:ring-2 focus:ring-[#167C5A]/15 outline-none transition"
                      required
                    />
                  </div>
                </div>
              )}

              <div>
                <label
                  htmlFor="modal-login-email"
                  className="block text-xs font-bold text-[#17212B] mb-1"
                >
                  Email Address
                </label>
                <div className="relative">
                  <input
                    id="modal-login-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="w-full h-11 px-3.5 rounded-lg border border-[#DCE4E8] text-sm text-[#17212B] focus:border-[#167C5A] focus:ring-2 focus:ring-[#167C5A]/15 outline-none transition"
                    required
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="modal-login-password"
                  className="block text-xs font-bold text-[#17212B] mb-1"
                >
                  Password
                </label>
                <div className="relative">
                  <input
                    id="modal-login-password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter password"
                    className="w-full h-11 pl-3.5 pr-10 rounded-lg border border-[#DCE4E8] text-sm text-[#17212B] focus:border-[#167C5A] focus:ring-2 focus:ring-[#167C5A]/15 outline-none transition"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#667085] hover:text-[#17212B]"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              {isSignUp && (
                <div>
                  <label
                    htmlFor="modal-confirm-password"
                    className="block text-xs font-bold text-[#17212B] mb-1"
                  >
                    Confirm Password
                  </label>
                  <div className="relative">
                    <input
                      id="modal-confirm-password"
                      type={showConfirmPassword ? "text" : "password"}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Re-enter password"
                      className="w-full h-11 pl-3.5 pr-10 rounded-lg border border-[#DCE4E8] text-sm text-[#17212B] focus:border-[#167C5A] focus:ring-2 focus:ring-[#167C5A]/15 outline-none transition"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword((v) => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[#667085] hover:text-[#17212B]"
                      aria-label={
                        showConfirmPassword
                          ? "Hide confirm password"
                          : "Show confirm password"
                      }
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>
              )}

              {error && (
                <div
                  className="p-3 rounded-lg bg-red-50 border border-red-200 text-xs font-semibold text-red-700"
                  role="alert"
                >
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full h-11 rounded-xl bg-[#167C5A] hover:bg-[#105D44] text-white font-bold text-sm shadow-md transition flex items-center justify-center space-x-2 mt-2 disabled:opacity-70"
              >
                <span>
                  {loading
                    ? isSignUp
                      ? "Creating account..."
                      : "Signing in..."
                    : isSignUp
                      ? "Create Account"
                      : "Sign In"}
                </span>
                {!loading && <ArrowRight className="w-4 h-4" />}
              </button>
            </form>

            <div className="my-4 flex items-center space-x-2 text-xs text-[#667085]">
              <div className="flex-1 h-[1px] bg-[#DCE4E8]" />
              <span>or</span>
              <div className="flex-1 h-[1px] bg-[#DCE4E8]" />
            </div>

            {!isSignUp && (
              <button
                type="button"
                onClick={() => {
                  window.location.assign(`${API_BASE}/api/auth/google`);
                }}
                className="w-full h-11 rounded-xl bg-white border border-[#DCE4E8] hover:bg-slate-50 text-xs font-bold text-[#17212B] transition flex items-center justify-center space-x-2 shadow-sm"
              >
                <span className="w-4 h-4 rounded-full bg-red-500 text-white font-black text-[10px] flex items-center justify-center">
                  G
                </span>
                <span>Continue with Google</span>
              </button>
            )}

            {/* Switch between Sign In / Sign Up */}
            <div className="mt-4 text-center">
              <button
                type="button"
                onClick={() => {
                  setIsSignUp(!isSignUp);
                  setError("");
                }}
                className="text-xs font-bold text-[#167C5A] hover:underline"
              >
                {isSignUp
                  ? "Already have an account? Sign In"
                  : "Don't have an account? Create one"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default WelcomeLogin;