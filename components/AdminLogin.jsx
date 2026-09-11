import React, { useState } from "react";
import { LockKeyhole, ShieldCheck } from "lucide-react";
import { useAuth } from "../context/AuthContext";

export function AdminLogin() {
  const { loginAdmin, adminError } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsSubmitting(true);
    const success = await loginAdmin(email, password);
    setIsSubmitting(false);
    if (success) window.location.href = "/admin";
  };

  return (
    <main className="min-h-screen bg-slate-100 flex items-center justify-center px-4 py-8">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md bg-white rounded-2xl border border-slate-200 shadow-xl p-6 sm:p-8 space-y-5"
      >
        <div className="text-center space-y-2">
          <div className="mx-auto w-12 h-12 rounded-xl bg-navy-900 text-orange-400 flex items-center justify-center">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900">Admin Login</h1>
          <p className="text-xs text-slate-500">
            Authorized administrators only.
          </p>
        </div>
        <label className="block text-sm font-semibold text-slate-700">
          Email
          <input
            required
            type="email"
            autoComplete="username"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-3 text-sm"
          />
        </label>
        <label className="block text-sm font-semibold text-slate-700">
          Password
          <div className="relative mt-2">
            <LockKeyhole className="absolute left-3 top-3.5 w-4 h-4 text-slate-400" />
            <input
              required
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="w-full rounded-lg border border-slate-300 pl-10 pr-3 py-3 text-sm"
            />
          </div>
        </label>
        {adminError && (
          <p role="alert" className="rounded-lg bg-rose-50 p-3 text-xs text-rose-700">
            {adminError}
          </p>
        )}
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full rounded-lg bg-navy-900 py-3 text-sm font-bold text-white disabled:opacity-60"
        >
          {isSubmitting ? "Signing in..." : "Sign in securely"}
        </button>
        <a href="/" className="block text-center text-xs font-semibold text-govblue">
          Return to PARIVARTAN
        </a>
      </form>
    </main>
  );
}
