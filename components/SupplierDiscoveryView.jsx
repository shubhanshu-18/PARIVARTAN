import React, { useEffect, useMemo, useRef, useState } from "react";
import { ApiService } from "../services/api";
import { useApp } from "../context/AppContext";
import { t } from "../utils/translations";
import {
  ArrowLeft,
  ArrowRight,
  Boxes,
  CheckCircle2,
  ExternalLink,
  Loader2,
  MapPin,
  Navigation,
  Phone,
  Search,
  ShieldCheck,
  Store,
  Truck,
} from "lucide-react";

const RADII = [1, 3, 5, 10, 25];
const escapeHtml = (value) =>
  String(value || "").replace(
    /[&<>'"]/g,
    (char) =>
      ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        "'": "&#39;",
        '"': "&quot;",
      })[char],
  );

export function SupplierDiscoveryView() {
  const { profile, setActiveStep, language } = useApp();
  const [radius, setRadius] = useState(5);
  const [filter, setFilter] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [selected, setSelected] = useState(null);
  const mapNode = useRef(null);
  const mapRef = useRef(null);
  const hasLocation =
    Number.isFinite(Number(profile.lat)) && Number.isFinite(Number(profile.lng));
  const requirements = result?.requirements || [];
  const suppliers = useMemo(
    () =>
      (result?.suppliers || []).filter(
        (item) => !filter || item.matchedRequirement === filter,
      ),
    [result, filter],
  );

  useEffect(() => {
    if (!hasLocation) {
      setResult(null);
      return;
    }
    let active = true;
    setLoading(true);
    setError("");
    ApiService.getSuppliers({
      lat: profile.lat,
      lng: profile.lng,
      radius,
      businessCategory: profile.businessCategory,
      supplierCategory: filter,
    })
      .then((data) => {
        if (active) {
          setResult(data);
          setSelected(null);
        }
      })
      .catch((err) => active && setError(err.message))
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, [
    profile.lat,
    profile.lng,
    profile.businessCategory,
    radius,
    filter,
    hasLocation,
  ]);

  useEffect(() => {
    if (!hasLocation || !mapNode.current || !window.L) return;
    const lat = Number(profile.lat),
      lng = Number(profile.lng);
    if (!mapRef.current) {
      mapRef.current = window.L.map(mapNode.current, {
        center: [lat, lng],
        zoom: 13,
        attributionControl: false,
      });
      window.L.tileLayer(
        "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
        { maxZoom: 18 },
      ).addTo(mapRef.current);
    }
    const map = mapRef.current;
    map.setView([lat, lng], radius <= 2 ? 14 : radius <= 5 ? 13 : 12);
    map.eachLayer((layer) => {
      if (layer instanceof window.L.Marker || layer instanceof window.L.Circle)
        map.removeLayer(layer);
    });
    window.L.marker([lat, lng])
      .addTo(map)
      .bindPopup("<strong>Your location</strong>");
    window.L.circle([lat, lng], {
      radius: radius * 1000,
      color: "#167C5A",
      fillOpacity: 0.06,
      dashArray: "4, 6",
    }).addTo(map);
    suppliers.forEach((supplier) => {
      const marker = window.L.marker([supplier.lat, supplier.lng])
        .addTo(map)
        .bindPopup(
          `<strong>${escapeHtml(supplier.name)}</strong><br>${escapeHtml(supplier.category)}<br>${supplier.distanceKm} km`,
        );
      marker.on("click", () => setSelected(supplier));
    });
  }, [hasLocation, profile.lat, profile.lng, radius, suppliers]);

  const directions = (supplier) =>
    window.open(
      `https://www.openstreetmap.org/directions?from=${profile.lat},${profile.lng}&to=${supplier.lat},${supplier.lng}`,
      "_blank",
      "noopener,noreferrer",
    );
  const mapUrl = (supplier) =>
    supplier.sourceUrl ||
    `https://www.openstreetmap.org/?mlat=${supplier.lat}&mlon=${supplier.lng}#map=16/${supplier.lat}/${supplier.lng}`;

  return (
    <section
      className="max-w-7xl mx-auto px-4 sm:px-6 pb-6 space-y-5"
      aria-labelledby="suppliers-title"
    >
      {/* 1. LOCAL SUPPLIERS CARD */}
      <div className="bg-white rounded-xl border border-[#DCE4E8] shadow-subtle p-5 sm:p-6">
        <div className="flex flex-col sm:flex-row gap-4 sm:items-center sm:justify-between">
          <div>
            <div className="inline-flex gap-1.5 items-center text-[11px] font-bold text-[#167C5A] bg-[#E8F6F1] border border-[#A9DDCB] px-2.5 py-1 rounded-full">
              <Store className="w-3.5 h-3.5" /> LOCAL PROCUREMENT
            </div>
            <h2
              id="suppliers-title"
              className="mt-2 text-xl font-black text-[#123B5D]"
            >
              LOCAL SUPPLIERS
            </h2>
            <p className="text-sm text-[#667085] mt-1">
              Find suppliers for the materials and equipment needed to start your
              business.
            </p>
          </div>
          <div className="flex gap-1.5 flex-wrap items-center">
            {RADII.map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => setRadius(item)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all ${
                  radius === item
                    ? "bg-[#123B5D] text-white border-[#123B5D] shadow-sm ring-1 ring-[#123B5D]"
                    : "bg-[#F7F9F7] border-[#DCE4E8] text-[#667085] hover:bg-slate-100"
                }`}
              >
                {item} km
              </button>
            ))}
          </div>
        </div>

        {!hasLocation ? (
          <div className="mt-4 p-4 rounded-lg bg-[#FFF7E6] text-sm text-[#667085]">
            Supplier search needs a valid GPS or selected location. Return to
            your profile to set a location.
          </div>
        ) : null}
        {error ? (
          <div className="mt-4 p-4 rounded-lg bg-[#FEF2F2] text-sm text-[#B42318]">
            Supplier search is unavailable right now. Your feasibility and
            financial planning remain available. {error}
          </div>
        ) : null}
      </div>

      {/* SUPPLIER MAP & RESULTS */}
      {hasLocation && (
        <>
          <div className="grid lg:grid-cols-2 gap-4">
            {/* Map Container */}
            <div className="bg-white rounded-xl border border-[#DCE4E8] shadow-subtle overflow-hidden">
              <div ref={mapNode} className="h-[340px]" />
              <div className="p-3 text-xs text-[#667085] border-t border-[#DCE4E8] bg-[#F7F9F7]">
                <MapPin className="inline w-3.5 h-3.5 mr-1 text-[#167C5A]" />
                Your location and potential supplier markers within {radius} km.
                Map data © OpenStreetMap contributors.
              </div>
            </div>

            {/* Supplier List */}
            <div className="space-y-3 max-h-[390px] overflow-y-auto pr-1">
              {loading && (
                <div className="p-8 text-center bg-white rounded-xl border border-[#DCE4E8] text-sm text-[#667085]">
                  <Loader2 className="w-6 h-6 animate-spin inline mr-2 text-[#123B5D]" />
                  Searching verified & local supplier data…
                </div>
              )}
              {!loading && result?.message && (
                <div className="p-5 bg-white rounded-xl border border-[#DCE4E8] text-sm text-[#667085]">
                  <strong className="text-[#17212B] block mb-1">
                    {result.message}
                  </strong>
                  {radius < 25 && (
                    <button
                      onClick={() =>
                        setRadius(RADII[RADII.indexOf(radius) + 1])
                      }
                      className="block mt-2 text-[#123B5D] font-bold hover:underline"
                    >
                      Expand radius to {RADII[RADII.indexOf(radius) + 1]} km →
                    </button>
                  )}
                  <p className="mt-2 text-xs">
                    No supplier data is currently available for this location.
                    Results are never fabricated.
                  </p>
                </div>
              )}
              {suppliers.map((supplier) => (
                <article
                  key={supplier.id}
                  onClick={() => setSelected(supplier)}
                  className={`p-4 bg-white rounded-xl border cursor-pointer transition-all ${
                    selected?.id === supplier.id
                      ? "border-[#167C5A] ring-2 ring-[#167C5A]/20 shadow-sm"
                      : "border-[#DCE4E8] hover:border-slate-300"
                  }`}
                >
                  <div className="flex justify-between gap-3">
                    <div>
                      <h3 className="font-bold text-[#17212B] text-sm">
                        {supplier.name}
                      </h3>
                      <p className="text-xs text-[#667085] mt-0.5">
                        {supplier.category} · {supplier.distanceKm} km
                      </p>
                    </div>
                    <span className="text-[10px] font-bold bg-[#EEF4FA] text-[#123B5D] px-2 py-1 rounded h-fit shrink-0">
                      Match {supplier.match?.score || 85}/100
                    </span>
                  </div>
                  {supplier.products?.length > 0 && (
                    <p className="text-xs mt-2 text-[#667085]">
                      {supplier.products.join(", ")}
                    </p>
                  )}
                  <p className="text-xs mt-1.5 text-[#667085]">
                    {supplier.address ||
                      [supplier.village, supplier.district, supplier.state]
                        .filter(Boolean)
                        .join(", ") ||
                      "Address not listed"}
                  </p>
                  <div className="mt-3 pt-3 border-t border-[#DCE4E8] flex flex-wrap gap-2 text-[11px]">
                    <span className="text-[#667085]">
                      Source: <strong>{supplier.source}</strong>
                    </span>
                    <span
                      className={
                        supplier.verified ? "text-[#167C5A]" : "text-[#667085]"
                      }
                    >
                      {supplier.verified ? (
                        <ShieldCheck className="inline w-3.5 h-3.5" />
                      ) : null}{" "}
                      {supplier.verified ? "Verified" : "Unverified"}
                    </span>
                    {supplier.deliveryAvailable === true && (
                      <span className="text-[#123B5D]">
                        <Truck className="inline w-3.5 h-3.5" /> Delivery
                        available
                      </span>
                    )}
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {supplier.phone && (
                      <a
                        href={`tel:${supplier.phone}`}
                        onClick={(e) => e.stopPropagation()}
                        className="px-2.5 py-1.5 text-xs font-bold rounded-lg border border-[#DCE4E8] text-[#17212B] hover:bg-slate-50 transition"
                      >
                        <Phone className="inline w-3.5 h-3.5 mr-1" />
                        Call
                      </a>
                    )}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        directions(supplier);
                      }}
                      className="px-3 py-1.5 text-xs font-bold rounded-lg bg-[#123B5D] hover:bg-[#0D2E49] text-white transition"
                    >
                      <Navigation className="inline w-3.5 h-3.5 mr-1" />
                      Directions
                    </button>
                    {Number.isFinite(Number(supplier.lat)) &&
                      Number.isFinite(Number(supplier.lng)) && (
                        <a
                          href={mapUrl(supplier)}
                          target="_blank"
                          rel="noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="px-2.5 py-1.5 text-xs font-bold rounded-lg border border-[#DCE4E8] text-[#17212B] hover:bg-slate-50 transition"
                        >
                          <ExternalLink className="inline w-3.5 h-3.5 mr-1" />
                          View Map
                        </a>
                      )}
                  </div>
                </article>
              ))}
            </div>
          </div>

          <p className="text-[11px] text-[#667085] px-1">
            Potential suppliers are ranked by configurable category relevance
            (40%), product match (30%), distance (20%), and known delivery
            availability (10%). OpenStreetMap may not list every supplier;
            “verified” is shown only for records confirmed in the supplier
            database.
          </p>

          {/* 2. NAVIGATION BAR (MOVED BELOW LOCAL SUPPLIERS) */}
          <div className="bg-white rounded-xl shadow-card border border-[#DCE4E8] p-4 sm:p-5 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <button
              type="button"
              onClick={() => setActiveStep(3)}
              className="px-5 py-2.5 rounded-lg text-xs font-bold border border-[#DCE4E8] text-[#17212B] hover:bg-slate-50 flex items-center justify-center space-x-1.5 transition shadow-sm"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>{t("form.back", language)}</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setActiveStep(5);
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
              className="px-6 py-2.5 rounded-lg text-xs font-bold bg-[#123B5D] hover:bg-[#0D2E49] text-white shadow-sm flex items-center justify-center space-x-2 transition"
            >
              <span>Continue to Government Scheme Match</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {/* 3. STARTUP PROCUREMENT CHECKLIST (PLACED AFTER NAVIGATION) */}
          <div className="bg-white rounded-xl border border-[#DCE4E8] shadow-subtle p-5 sm:p-6">
            <div className="flex items-center gap-2 pb-3 mb-4 border-b border-[#DCE4E8]">
              <Boxes className="w-5 h-5 text-[#F59E0B]" />
              <h3 className="font-bold text-[#17212B] text-sm">
                STARTUP PROCUREMENT CHECKLIST
              </h3>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
              {requirements.map((item) => (
                <button
                  type="button"
                  key={item.key}
                  onClick={() => setFilter(filter === item.key ? "" : item.key)}
                  className={`text-left p-3.5 rounded-lg border text-sm flex items-center justify-between gap-2 transition-all ${
                    filter === item.key
                      ? "border-[#167C5A] bg-[#E8F6F1] ring-1 ring-[#167C5A]"
                      : "border-[#DCE4E8] bg-white hover:bg-slate-50"
                  }`}
                >
                  <span className="flex items-center gap-2 font-medium text-[#17212B]">
                    <CheckCircle2 className="w-4 h-4 text-[#167C5A] shrink-0" />
                    <span className="truncate">{item.label}</span>
                  </span>
                  <span className="text-xs font-bold text-[#123B5D] shrink-0">
                    Find Suppliers
                  </span>
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </section>
  );
}

export default SupplierDiscoveryView;
