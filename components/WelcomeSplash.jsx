import React, { useEffect, useState } from "react";
import { MapPin, Sparkles } from "lucide-react";

export function WelcomeSplash() {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setVisible(false);
      return undefined;
    }

    const timer = window.setTimeout(() => setVisible(false), 1500);
    return () => window.clearTimeout(timer);
  }, []);

  if (!visible) return null;

  return (
    <div
      className="welcome-splash"
      role="status"
      aria-label="Opening PARIVARTAN"
    >
      <div className="welcome-splash-glow" aria-hidden="true" />
      <div className="welcome-splash-content">
        <div className="welcome-splash-mark" aria-hidden="true">
          <img
            src="/logo.png"
            alt="PARIVARTAN Logo"
            className="w-12 h-12 object-contain drop-shadow-md relative z-10"
          />
          <i className="welcome-splash-orbit welcome-splash-orbit-one" />
          <i className="welcome-splash-orbit welcome-splash-orbit-two" />
        </div>
        <div className="welcome-splash-title">
          <Sparkles size={16} className="text-[#F59E0B]" aria-hidden="true" />
          <span>PARIVARTAN (परिवर्तन)</span>
        </div>
        <p>AI-Driven Hyper-Local Business Advisory & Financial Structuring</p>
        <div className="welcome-splash-location">
          <MapPin size={12} aria-hidden="true" />
          <span>
            Rural Micro-Enterprise Platform • Smart India Hackathon 2026
          </span>
        </div>
      </div>
    </div>
  );
}
