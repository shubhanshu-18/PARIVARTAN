import React, { useState } from "react";
import {
  Eye,
  EyeOff,
  MapPin,
  ShieldCheck,
  Sprout,
  TrendingUp,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";

export function AdminLogin() {
  const { loginAdmin, loginError } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [validationError, setValidationError] = useState("");

  async function handleSubmit(event) {
    event.preventDefault();
    setValidationError("");
    if (!email.trim()) return setValidationError("Please enter your email.");
    if (!password) return setValidationError("Please enter your password.");
    setIsSubmitting(true);
    await loginAdmin(email, password);
    setIsSubmitting(false);
  }

  return (
    <main className="admin-login-page">
      <section className="admin-login-brand" aria-label="PARIVARTAN brand">
        <div className="admin-brand-mark bg-white p-1 rounded-2xl border border-white/40 shadow-md">
          <img
            src="/logo.png"
            alt="PARIVARTAN Logo"
            className="w-10 h-10 object-contain"
          />
        </div>
        <p className="admin-eyebrow">PARIVARTAN (परिवर्तन)</p>
        <h1>Intelligent Digital Support for Rural Entrepreneurship</h1>
        <p className="admin-brand-copy">
          Administrative intelligence for local opportunity, community growth,
          and informed decisions.
        </p>
        <div className="admin-brand-signals">
          <span>
            <Sprout size={17} /> Community
          </span>
          <span>
            <TrendingUp size={17} /> Growth
          </span>
          <span>
            <ShieldCheck size={17} /> Trusted access
          </span>
        </div>
      </section>

      <section className="admin-login-panel">
        <form className="admin-login-card" onSubmit={handleSubmit} noValidate>
          <p className="admin-eyebrow">ADMINISTRATIVE INTELLIGENCE PORTAL</p>
          <h2>Welcome Back</h2>
          <p className="admin-login-subtitle">
            Sign in to access the Gram Sarthi AI administration portal.
          </p>
          <label htmlFor="admin-email">Email</label>
          <input
            id="admin-email"
            type="email"
            autoComplete="username"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
          />
          <label htmlFor="admin-password">Password</label>
          <div className="admin-password-field">
            <input
              id="admin-password"
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
            />
            <button
              type="button"
              className="admin-password-toggle"
              onClick={() => setShowPassword((visible) => !visible)}
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
          {(validationError || loginError) && (
            <p className="admin-login-error" role="alert">
              {validationError || loginError}
            </p>
          )}
          <button
            className="admin-submit"
            type="submit"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Signing in..." : "Sign In"}
          </button>
        </form>
      </section>
    </main>
  );
}
