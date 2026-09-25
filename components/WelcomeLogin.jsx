import React, { useState } from "react";
import { ArrowRight, Eye, EyeOff, Mail, MessageSquare } from "lucide-react";
import { useApp } from "../context/AppContext";
import { useAuth } from "../context/AuthContext";

const API_BASE = (import.meta.env.VITE_API_URL || "").replace(/\/$/, "");

export function WelcomeLogin() {
  const { language, setLanguage } = useApp();
  const { loginUser, registerUser } = useAuth();
  const [isSignUp, setIsSignUp] = useState(window.location.pathname === "/signup");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const submit = async (event) => {
    event.preventDefault();
    setError("");
    if (isSignUp && !name.trim()) {
      setError("Please enter your full name.");
      return;
    }
    if (isSignUp && (name.trim().length > 100 || /[<>\u0000-\u001f]/.test(name))) {
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
    if (isSignUp && (password.length < 12 || password.length > 72)) {
      setError("Password must be between 12 and 72 characters.");
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
      setError(/already exists|already registered/i.test(message)
        ? "Email already registered. Please log in instead."
        : /incorrect email|invalid email or password/i.test(message)
          ? "Incorrect email or password."
          : message || (isSignUp ? "Unable to create your account. Please try again." : "Unable to sign in. Please try again."));
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="minimal-login-page">
      <div className="minimal-login-card">
        <div className="minimal-login-brand">
          <span className="minimal-login-mark">
            <img src="/favicon.png" alt="" />
          </span>
          <span>GRAM SARTHI AI</span>
        </div>

        <div className="minimal-login-heading">
          <h1>{isSignUp ? "Create your account" : "Welcome back"}</h1>
          <p>{isSignUp ? "Create an account to start your business advisory journey." : "Sign in to continue to your business advisory portal."}</p>
        </div>

        <form onSubmit={submit} noValidate>
          {isSignUp && (
            <>
              <label className="minimal-login-label" htmlFor="signup-name">Full name</label>
              <div className="minimal-login-input">
                <input
                  id="signup-name"
                  type="text"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  placeholder="Your full name"
                  autoComplete="name"
                />
              </div>
            </>
          )}
          <label className="minimal-login-label" htmlFor="login-email">Email</label>
          <div className="minimal-login-input">
            <Mail size={18} aria-hidden="true" />
            <input
              id="login-email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="you@example.com"
              autoComplete={isSignUp ? "email" : "username"}
            />
          </div>

          <label className="minimal-login-label" htmlFor="login-password">Password</label>
          <div className="minimal-login-input">
            <input
              id="login-password"
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Enter your password"
              autoComplete={isSignUp ? "new-password" : "current-password"}
            />
            <button
              type="button"
              className="minimal-login-icon-button"
              onClick={() => setShowPassword((visible) => !visible)}
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>

          {isSignUp && (
            <>
              <label className="minimal-login-label" htmlFor="signup-confirm-password">Confirm password</label>
              <div className="minimal-login-input">
                <input
                  id="signup-confirm-password"
                  type={showConfirmPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(event) => setConfirmPassword(event.target.value)}
                  placeholder="Re-enter your password"
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  className="minimal-login-icon-button"
                  onClick={() => setShowConfirmPassword((visible) => !visible)}
                  aria-label={showConfirmPassword ? "Hide confirm password" : "Show confirm password"}
                >
                  {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </>
          )}

          {error && <p className="minimal-login-error" role="alert">{error}</p>}

          <button type="submit" className="minimal-login-submit" disabled={loading}>
            {loading ? (isSignUp ? "Creating account..." : "Signing in...") : (isSignUp ? "Create account" : "Sign in")}
            {!loading && <ArrowRight size={18} />}
          </button>
        </form>

        <div className="minimal-login-divider"><span>or</span></div>

        {!isSignUp && (
          <button
            type="button"
            className="minimal-google-button"
            onClick={() => { window.location.assign(`${API_BASE}/api/auth/google`); }}
          >
            <span className="minimal-google-logo" aria-hidden="true">G</span>
            Continue with Google
          </button>
        )}

        <div className="minimal-login-footer">
          <a href="/feedback"><MessageSquare size={16} /> Share feedback</a>
        </div>
        <a className="minimal-login-switch" href={isSignUp ? "/login" : "/signup"}>
          {isSignUp ? "Already have an account? Login" : "Don't have an account? Sign Up"}
        </a>
        <button type="button" className="minimal-login-language" onClick={() => setLanguage(language === "hi" ? "en" : "hi")}>
          {language === "hi" ? "English" : "हिन्दी"}
        </button>
      </div>
    </main>
  );
}
