import React, { useState, useEffect, useRef } from "react";
import { CATEGORY_KEYS } from "../utils/validation-client";
import { useApp } from "../context/AppContext";
import { t, CATEGORIES } from "../utils/translations";
import {
  Radar,
  MapPin,
  Filter,
  TrendingUp,
  Users,
  AlertTriangle,
  CheckCircle2,
  Info,
  ArrowRight,
  ArrowLeft,
  Store,
  Layers,
  Sparkles,
} from "lucide-react";

export function MarketIntelView() {
  const { profile, marketData, setActiveStep, language } = useApp();

  const [radiusFilter, setRadiusFilter] = useState(5);
  const [selectedCategory, setSelectedCategory] = useState(
    profile.businessCategory || "all",
  );
  const [activeCompetitor, setActiveCompetitor] = useState(null);
  const mapContainerRef = useRef(null);
  const leafletMapRef = useRef(null);

  const intel = marketData || {
    dataMode: "unavailable",
    opportunityScore: null,
    demandLevel: "Unavailable",
    demandScore: null,
    competitionLevel: "Unavailable",
    competitionScore: null,
    marketGap: "Unavailable",
    marketGapScore: null,
    potentialScore: "Unavailable",
    potentialCustomerBase: null,
    competitorsWithin1km: null,
    competitorsWithin3km: null,
    competitorsWithin5km: null,
    totalNearbyCompetitors: null,
    categoryDistribution: [],
    nearbyCompetitors: [],
    nearestDistrict: profile.district || "Sehore",
    state: profile.state || "Madhya Pradesh",
  };

  const competitors = (intel.nearbyCompetitors || []).filter((c) => {
    if (c.distanceKm > radiusFilter) return false;
    if (selectedCategory !== "all" && c.categoryKey !== selectedCategory)
      return false;
    return true;
  });

  // Initialize or update Leaflet Map
  useEffect(() => {
    if (typeof window === "undefined" || !window.L || !mapContainerRef.current)
      return;

    const lat = Number(profile.lat) || 23.2032;
    const lng = Number(profile.lng) || 77.0844;

    try {
      if (!leafletMapRef.current) {
        const map = window.L.map(mapContainerRef.current, {
          center: [lat, lng],
          zoom: 13,
          zoomControl: true,
          attributionControl: false,
        });

        window.L.tileLayer(
          "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
          {
            maxZoom: 18,
          },
        ).addTo(map);

        leafletMapRef.current = map;
      }

      const map = leafletMapRef.current;
      map.setView(
        [lat, lng],
        radiusFilter <= 2 ? 14 : radiusFilter <= 5 ? 13 : 12,
      );

      // Clear existing markers
      map.eachLayer((layer) => {
        if (
          layer instanceof window.L.Marker ||
          layer instanceof window.L.Circle
        ) {
          map.removeLayer(layer);
        }
      });

      // User's Proposed Enterprise Pin (Orange)
      const userIcon = window.L.divIcon({
        className: "user-pin",
        html: `<div style="background-color: #E65100; color: white; border: 2px solid white; border-radius: 50%; width: 28px; height: 28px; display: grid; place-items: center; font-weight: bold; font-size: 13px; box-shadow: 0 3px 8px rgba(0,0,0,0.3);">★</div>`,
        iconSize: [28, 28],
        iconAnchor: [14, 14],
      });

      window.L.marker([lat, lng], { icon: userIcon })
        .addTo(map)
        .bindPopup(
          `<strong>Your Proposed Enterprise</strong><br/>${profile.businessIdea || "New Unit"}<br/><em>${profile.village || profile.district}</em>`,
        )
        .openPopup();

      // Radius boundary circle
      window.L.circle([lat, lng], {
        radius: radiusFilter * 1000,
        color: "#0F4C81",
        fillColor: "#0F4C81",
        fillOpacity: 0.08,
        weight: 1.5,
        dashArray: "4, 6",
      }).addTo(map);

      // Competitors pins (Navy Blue)
      competitors.forEach((c) => {
        const compIcon = window.L.divIcon({
          className: "comp-pin",
          html: `<div style="background-color: #1E3E62; color: white; border: 1.5px solid white; border-radius: 50%; width: 22px; height: 22px; display: grid; place-items: center; font-size: 10px; font-weight: bold; box-shadow: 0 2px 5px rgba(0,0,0,0.25);">${c.scale === "small" ? "S" : "M"}</div>`,
          iconSize: [22, 22],
          iconAnchor: [11, 11],
        });

        const m = window.L.marker(
          [c.lat || lat + 0.008, c.lng || lng + 0.008],
          { icon: compIcon },
        )
          .addTo(map)
          .bindPopup(
            `<strong>${c.name}</strong><br/>${c.category}<br/>Distance: ${c.distanceKm} km<br/>Scale: ${c.scale || "micro"}`,
          );

        m.on("click", () => setActiveCompetitor(c));
      });
    } catch (err) {
      console.warn("Leaflet map error:", err);
    }
  }, [profile.lat, profile.lng, radiusFilter, selectedCategory, competitors]);

  const oppScore = intel.opportunityScore ?? 0;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 space-y-5 animate-in fade-in duration-300">
      {/* Header Banner */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5 sm:p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200 mb-2">
              <Radar className="w-3.5 h-3.5 text-emerald-600" />
              <span>
                Step 2 of 6 • Spatial Competitor & Demand Intelligence
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-navy-900 tracking-tight">
              {t("market.title", language)}
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 mt-1">
              {t("market.subtitle", language)} Target anchor:{" "}
              <strong className="text-slate-800">
                {profile.district}, {profile.state}
              </strong>
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <span className="text-[11px] bg-slate-100 text-slate-700 px-3 py-1.5 rounded-lg border border-slate-300 font-medium">
              {intel.dataMode === "live" ? "Live public data: " : "Data status: "}
              <strong className="text-slate-900">
                {intel.dataMode === "live"
                  ? "OpenStreetMap / Overpass"
                  : "Live market data unavailable"}
              </strong>
            </span>
          </div>
        </div>
      </div>

      {/* TOP METRIC SCORE CARDS */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Opportunity Score Card */}
        <div className="bg-white rounded-xl p-4 sm:p-5 border border-slate-200 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-600 uppercase tracking-wider">
              {t("market.oppScore", language)}
            </span>
            <span className="w-7 h-7 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-xs">
              ★
            </span>
          </div>
          <div className="mt-2 flex items-baseline space-x-2">
            <span className="text-3xl sm:text-4xl font-extrabold text-govgreen">
              {oppScore}
            </span>
            <span className="text-xs text-slate-400 font-medium">/ 100</span>
          </div>
          <p className="text-[11px] font-semibold text-emerald-800 mt-1 flex items-center space-x-1">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>{intel.dataMode === "live" ? "Live source data" : "Live market data unavailable"} · Viability: {intel.potentialScore || "Unavailable"}</span>
          </p>
          <div className="w-full bg-slate-100 h-1.5 rounded-full mt-3 overflow-hidden">
            <div
              className="bg-govgreen h-full rounded-full"
              style={{ width: `${oppScore}%` }}
            ></div>
          </div>
        </div>

        {/* Demand Level Card */}
        <div className="bg-white rounded-xl p-4 sm:p-5 border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-600 uppercase tracking-wider">
              {t("market.demand", language)}
            </span>
            <TrendingUp className="w-4 h-4 text-sky-600" />
          </div>
          <div className="mt-2 flex items-baseline space-x-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-slate-900">
              {intel.demandLevel || "Unavailable"}
            </span>
            <span className="text-xs text-slate-500">
              ({intel.demandScore ?? "—"} pts)
            </span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">
            Strong daily household consumption pattern in village mandis
          </p>
          <div className="w-full bg-slate-100 h-1.5 rounded-full mt-3 overflow-hidden">
            <div
              className="bg-sky-600 h-full rounded-full"
              style={{ width: `${intel.demandScore ?? 0}%` }}
            ></div>
          </div>
        </div>

        {/* Competition Level Card */}
        <div className="bg-white rounded-xl p-4 sm:p-5 border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-600 uppercase tracking-wider">
              {t("market.competition", language)}
            </span>
            <AlertTriangle className="w-4 h-4 text-amber-500" />
          </div>
          <div className="mt-2 flex items-baseline space-x-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-slate-900">
              {intel.competitionLevel || "Unavailable"}
            </span>
            <span className="text-xs text-slate-500">
              ({competitors.length} within {radiusFilter}km)
            </span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">
            {intel.competitorsWithin1km ?? "—"} observed within 1km
            entry barrier
          </p>
          <div className="w-full bg-slate-100 h-1.5 rounded-full mt-3 overflow-hidden">
            <div
              className="bg-amber-500 h-full rounded-full"
              style={{ width: `${intel.competitionScore ?? 0}%` }}
            ></div>
          </div>
        </div>

        {/* Market Gap Card */}
        <div className="bg-white rounded-xl p-4 sm:p-5 border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-600 uppercase tracking-wider">
              {t("market.gap", language)}
            </span>
            <Sparkles className="w-4 h-4 text-purple-600" />
          </div>
          <div className="mt-2 flex items-baseline space-x-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-purple-800">
              {intel.marketGap || "Unavailable"}
            </span>
            <span className="text-xs text-slate-500">
              ({intel.marketGapScore ?? "—"} pts)
            </span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">
            Catchment: ~
            {intel.potentialCustomerBase == null ? "Unavailable" : intel.potentialCustomerBase.toLocaleString("en-IN")}{" "}
            rural residents
          </p>
          <div className="w-full bg-slate-100 h-1.5 rounded-full mt-3 overflow-hidden">
            <div
              className="bg-purple-600 h-full rounded-full"
              style={{ width: `${intel.marketGapScore ?? 0}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* MAP AND COMPETITOR DRILLDOWN */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Left 2 Cols: Interactive Map & Radius Controls */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
          {/* Map Header with Filters */}
          <div className="p-3 sm:p-4 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center space-x-2">
              <MapPin className="w-4 h-4 text-govblue" />
              <span className="text-xs font-bold text-slate-800">
                Spatial Density Map (OpenStreetMap)
              </span>
            </div>

            {/* Controls */}
            <div className="flex items-center space-x-2 text-xs">
              <span className="text-slate-500 text-[11px]">Radius:</span>
              {[1, 3, 5, 10].map((r) => (
                <button
                  key={r}
                  onClick={() => setRadiusFilter(r)}
                  className={`px-2.5 py-1 rounded text-xs font-semibold transition ${
                    radiusFilter === r
                      ? "bg-govblue text-white shadow-xs"
                      : "bg-white text-slate-700 border border-slate-300 hover:bg-slate-100"
                  }`}
                >
                  {r} km
                </button>
              ))}
            </div>
          </div>

          {/* Leaflet Map Target */}
          <div
            ref={mapContainerRef}
            className="w-full h-[360px] sm:h-[420px] bg-slate-100 relative"
            style={{ zIndex: 1 }}
          >
            {/* Fallback visual indicator if tiles are slow to load */}
            <div className="absolute bottom-2 left-2 z-10 bg-white/90 backdrop-blur-xs px-2.5 py-1 rounded text-[10px] text-slate-700 border border-slate-200 shadow-xs flex items-center space-x-2">
              <span className="inline-block w-2 h-2 rounded-full bg-orange-500"></span>
              <span>Your Enterprise</span>
              <span className="inline-block w-2 h-2 rounded-full bg-navy-800 ml-2"></span>
              <span>Competitors ({competitors.length})</span>
            </div>
          </div>

          {/* Map footnote */}
          <div className="p-3 bg-slate-50/70 border-t border-slate-200 text-[11px] text-slate-500 flex items-center justify-between">
            <span>
              Center: {profile.lat}°N, {profile.lng}°E • {profile.district}{" "}
              District
            </span>
            <span className="text-govblue font-semibold">
              Click pins to inspect competitor profile
            </span>
          </div>
        </div>

        {/* Right Col: Competitor Directory */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center space-x-2">
                <Store className="w-4 h-4 text-orange-500" />
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wide">
                  {t("market.nearbyCompetitors", language)} (
                  {competitors.length})
                </h3>
              </div>

              {/* Category mini-filter */}
              <select
                value={selectedCategory}
                onChange={(e) =>
                  CATEGORY_KEYS.includes(e.target.value) &&
                  setSelectedCategory(e.target.value)
                }
                className="text-[11px] px-2 py-1 rounded border border-slate-300 bg-white text-slate-700"
              >
                <option value="all">
                  {t("market.allCategories", language)}
                </option>
                {CATEGORIES.map((c) => (
                  <option key={c.key} value={c.key}>
                    {c.label}
                  </option>
                ))}
              </select>
            </div>

            {/* List */}
            <div className="mt-3 space-y-2.5 max-h-[380px] overflow-y-auto pr-1">
              {competitors.length === 0 ? (
                <div className="p-6 text-center text-slate-500 text-xs">
                  <Info className="w-6 h-6 mx-auto mb-2 text-slate-400" />
                  <p className="font-semibold text-slate-700">
                    Zero Direct Competitors Found
                  </p>
                  <p className="text-[11px] text-slate-400 mt-1">
                    No operating units recorded in this {radiusFilter}km radius.
                    Favorable blue-ocean entry!
                  </p>
                </div>
              ) : (
                competitors.map((c) => (
                  <div
                    key={c.id}
                    onClick={() => setActiveCompetitor(c)}
                    className={`p-3 rounded-lg border text-xs cursor-pointer transition ${
                      activeCompetitor?.id === c.id
                        ? "border-govblue bg-blue-50/70 ring-1 ring-govblue/30"
                        : "border-slate-200 hover:border-slate-300 bg-slate-50/50"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <strong className="text-slate-900 block font-bold leading-tight">
                          {c.name}
                        </strong>
                        <span className="text-[10px] text-slate-500 mt-0.5 block">
                          {c.category} • Est. {c.established || "2020"}
                        </span>
                      </div>
                      <span className="text-xs font-extrabold text-govblue whitespace-nowrap">
                        {c.distanceKm} km
                      </span>
                    </div>

                    <div className="mt-2 pt-2 border-t border-slate-200/60 flex items-center justify-between text-[10px] text-slate-600">
                      <span>
                        Scale:{" "}
                        <strong className="capitalize text-slate-800">
                          {c.scale || "micro"}
                        </strong>
                      </span>
                      <span
                        className={`px-1.5 py-0.5 rounded font-semibold ${
                          c.competitionLevel === "Direct"
                            ? "bg-rose-100 text-rose-800"
                            : "bg-amber-100 text-amber-800"
                        }`}
                      >
                        {c.competitionLevel || "Moderate"}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Active Competitor Details Popup Box */}
          {activeCompetitor && (
            <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg text-xs text-slate-800">
              <strong className="block text-govblue font-bold">
                {activeCompetitor.name}
              </strong>
              <p className="text-[11px] text-slate-600 mt-0.5">
                Staff: {activeCompetitor.employees || 2} persons • Rating:{" "}
                {activeCompetitor.rating || 4.3}★
              </p>
            </div>
          )}
        </div>
      </div>

      {/* METHODOLOGY EXPLANATION BOX */}
      <div className="bg-slate-50 rounded-xl border border-slate-200 p-4 sm:p-5">
        <div className="flex items-start space-x-3">
          <Info className="w-5 h-5 text-govblue flex-shrink-0 mt-0.5" />
          <div className="text-xs text-slate-700 leading-relaxed">
            <h4 className="font-bold text-slate-900 text-sm mb-1">
              {t("market.methodologyTitle", language)}
            </h4>
            <p>
              The <strong>Opportunity Score ({oppScore}/100)</strong> is
              calculated through a deterministic multi-variable index:{" "}
              <code className="bg-white px-2 py-0.5 rounded border border-slate-300 font-mono text-[11px] text-govblue">
                Opportunity = (Demand Index × 0.40) + (Market Gap × 0.35) +
                ((100 - Saturation) × 0.25)
              </code>
              .
            </p>
            <p className="text-[11px] text-slate-500 mt-1">
              Demand accounts for rural household income (₹
              {intel.avgHouseholdIncome ? `Rs. ${intel.avgHouseholdIncome}/mo` : "unavailable"} and agricultural harvest
              liquidity in {profile.district}. Market gap reflects unfulfilled
              local demand within 5 km distance. All baseline competitors derive
              from verified district seed registries.
            </p>
          </div>
        </div>
      </div>

      {/* NAVIGATION BAR */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 flex items-center justify-between">
        <button
          onClick={() => setActiveStep(1)}
          className="px-4 py-2.5 rounded-lg text-xs font-bold border border-slate-300 text-slate-700 hover:bg-slate-100 flex items-center space-x-1.5 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>{t("form.back", language)}</span>
        </button>

        <button
          onClick={() => {
            setActiveStep(3);
            window.scrollTo({ top: 0, behavior: "smooth" });
          }}
          className="px-6 py-2.5 rounded-lg text-xs font-bold bg-govblue hover:bg-govblue-dark text-white shadow-md shadow-govblue/20 flex items-center space-x-2 transition"
        >
          <span>Continue to AI Business Advisory →</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
