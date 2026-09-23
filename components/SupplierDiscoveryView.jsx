import React, { useEffect, useMemo, useRef, useState } from "react";
import { ApiService } from "../services/api";
import { useApp } from "../context/AppContext";
import { Boxes, CheckCircle2, ExternalLink, Loader2, MapPin, Navigation, Phone, Search, ShieldCheck, Store, Truck } from "lucide-react";

const RADII = [1, 3, 5, 10, 25];
const escapeHtml = (value) => String(value || "").replace(/[&<>'"]/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" }[char]));

export function SupplierDiscoveryView() {
  const { profile } = useApp();
  const [radius, setRadius] = useState(5); const [filter, setFilter] = useState("");
  const [result, setResult] = useState(null); const [loading, setLoading] = useState(false); const [error, setError] = useState(""); const [selected, setSelected] = useState(null);
  const mapNode = useRef(null); const mapRef = useRef(null);
  const hasLocation = Number.isFinite(Number(profile.lat)) && Number.isFinite(Number(profile.lng));
  const requirements = result?.requirements || [];
  const suppliers = useMemo(() => (result?.suppliers || []).filter((item) => !filter || item.matchedRequirement === filter), [result, filter]);

  useEffect(() => {
    if (!hasLocation) { setResult(null); return; }
    let active = true; setLoading(true); setError("");
    ApiService.getSuppliers({ lat: profile.lat, lng: profile.lng, radius, businessCategory: profile.businessCategory, supplierCategory: filter })
      .then((data) => { if (active) { setResult(data); setSelected(null); } })
      .catch((err) => active && setError(err.message)).finally(() => active && setLoading(false));
    return () => { active = false; };
  }, [profile.lat, profile.lng, profile.businessCategory, radius, filter, hasLocation]);

  useEffect(() => {
    if (!hasLocation || !mapNode.current || !window.L) return;
    const lat = Number(profile.lat), lng = Number(profile.lng);
    if (!mapRef.current) {
      mapRef.current = window.L.map(mapNode.current, { center: [lat, lng], zoom: 13, attributionControl: false });
      window.L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", { maxZoom: 18 }).addTo(mapRef.current);
    }
    const map = mapRef.current; map.setView([lat, lng], radius <= 2 ? 14 : radius <= 5 ? 13 : 12);
    map.eachLayer((layer) => { if (layer instanceof window.L.Marker || layer instanceof window.L.Circle) map.removeLayer(layer); });
    window.L.marker([lat, lng]).addTo(map).bindPopup("<strong>Your location</strong>");
    window.L.circle([lat, lng], { radius: radius * 1000, color: "#167C5A", fillOpacity: 0.06, dashArray: "4, 6" }).addTo(map);
    suppliers.forEach((supplier) => {
      const marker = window.L.marker([supplier.lat, supplier.lng]).addTo(map).bindPopup(`<strong>${escapeHtml(supplier.name)}</strong><br>${escapeHtml(supplier.category)}<br>${supplier.distanceKm} km`);
      marker.on("click", () => setSelected(supplier));
    });
  }, [hasLocation, profile.lat, profile.lng, radius, suppliers]);

  const directions = (supplier) => window.open(`https://www.openstreetmap.org/directions?from=${profile.lat},${profile.lng}&to=${supplier.lat},${supplier.lng}`, "_blank", "noopener,noreferrer");
  const mapUrl = (supplier) => supplier.sourceUrl || `https://www.openstreetmap.org/?mlat=${supplier.lat}&mlon=${supplier.lng}#map=16/${supplier.lat}/${supplier.lng}`;
  return <section className="max-w-7xl mx-auto px-4 sm:px-6 pb-5 space-y-4" aria-labelledby="suppliers-title">
    <div className="bg-white rounded-xl border border-[#DCE4E8] shadow-subtle p-5 sm:p-6">
      <div className="flex flex-col sm:flex-row gap-4 sm:items-center sm:justify-between">
        <div><div className="inline-flex gap-1.5 items-center text-[11px] font-bold text-[#167C5A] bg-[#E8F6F1] border border-[#A9DDCB] px-2.5 py-1 rounded-full"><Store className="w-3.5 h-3.5"/> LOCAL PROCUREMENT</div><h2 id="suppliers-title" className="mt-2 text-xl font-black text-[#123B5D]">LOCAL SUPPLIERS</h2><p className="text-sm text-[#667085] mt-1">Find suppliers for the materials and equipment needed to start your business.</p></div>
        <div className="flex gap-1 flex-wrap">{RADII.map((item) => <button key={item} onClick={() => setRadius(item)} className={`px-3 py-1.5 rounded-md text-xs font-bold border ${radius === item ? "bg-[#123B5D] text-white border-[#123B5D]" : "border-[#DCE4E8] text-[#667085]"}`}>{item} km</button>)}</div>
      </div>
      {!hasLocation ? <div className="mt-4 p-4 rounded-lg bg-[#FFF7E6] text-sm text-[#667085]">Supplier search needs a valid GPS or selected location. Return to your profile to set a location.</div> : null}
      {error ? <div className="mt-4 p-4 rounded-lg bg-[#FEF2F2] text-sm text-[#B42318]">Supplier search is unavailable right now. Your feasibility and financial planning remain available. {error}</div> : null}
    </div>
    {hasLocation && <><div className="bg-white rounded-xl border border-[#DCE4E8] p-5"><div className="flex items-center gap-2"><Boxes className="w-5 h-5 text-[#F59E0B]"/><h3 className="font-bold text-[#17212B]">STARTUP PROCUREMENT CHECKLIST</h3></div><div className="mt-4 grid sm:grid-cols-2 lg:grid-cols-3 gap-2">{requirements.map((item) => <button onClick={() => setFilter(filter === item.key ? "" : item.key)} key={item.key} className={`text-left p-3 rounded-lg border text-sm flex items-center justify-between gap-2 ${filter === item.key ? "border-[#167C5A] bg-[#E8F6F1]" : "border-[#DCE4E8]"}`}><span className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-[#167C5A]"/>{item.label}</span><span className="text-xs font-bold text-[#123B5D]">Find Suppliers</span></button>)}</div></div>
    <div className="grid lg:grid-cols-2 gap-4"><div className="bg-white rounded-xl border border-[#DCE4E8] overflow-hidden"><div ref={mapNode} className="h-[330px]"/><div className="p-3 text-xs text-[#667085] border-t border-[#DCE4E8]"><MapPin className="inline w-3.5 h-3.5 mr-1"/>Your location and potential supplier markers within {radius} km. Map data © OpenStreetMap contributors.</div></div><div className="space-y-3">{loading && <div className="p-6 text-center bg-white rounded-xl border border-[#DCE4E8] text-sm text-[#667085]"><Loader2 className="w-5 h-5 animate-spin inline mr-2"/>Searching source-labelled data…</div>}{!loading && result?.message && <div className="p-5 bg-white rounded-xl border border-[#DCE4E8] text-sm text-[#667085]"><strong className="text-[#17212B]">{result.message}</strong>{radius < 25 && <button onClick={() => setRadius(RADII[RADII.indexOf(radius) + 1])} className="block mt-3 text-[#123B5D] font-bold">Expand to {RADII[RADII.indexOf(radius) + 1]} km</button>}<p className="mt-2">No supplier data is currently available for this location. Results are never fabricated.</p></div>}{suppliers.map((supplier) => <article key={supplier.id} onClick={() => setSelected(supplier)} className={`p-4 bg-white rounded-xl border cursor-pointer ${selected?.id === supplier.id ? "border-[#167C5A] ring-1 ring-[#167C5A]/20" : "border-[#DCE4E8]"}`}><div className="flex justify-between gap-3"><div><h3 className="font-bold text-[#17212B]">{supplier.name}</h3><p className="text-xs text-[#667085] mt-0.5">{supplier.category} · {supplier.distanceKm} km</p></div><span className="text-[10px] font-bold bg-[#EEF4FA] text-[#123B5D] px-2 py-1 rounded h-fit">Strong Match {supplier.match?.score}/100</span></div>{supplier.products?.length > 0 && <p className="text-xs mt-2 text-[#667085]">{supplier.products.join(", ")}</p>}<p className="text-xs mt-2 text-[#667085]">{supplier.address || [supplier.village, supplier.district, supplier.state].filter(Boolean).join(", ") || "Address not listed"}</p><div className="mt-3 pt-3 border-t border-[#DCE4E8] flex flex-wrap gap-2 text-[11px]"><span className="text-[#667085]">Data source: <strong>{supplier.source}</strong></span><span className={supplier.verified ? "text-[#167C5A]" : "text-[#667085]"}>{supplier.verified ? <ShieldCheck className="inline w-3.5 h-3.5"/> : null} {supplier.verified ? "Verified" : "Not verified"}</span>{supplier.deliveryAvailable === true && <span><Truck className="inline w-3.5 h-3.5"/> Delivery available</span>}</div><div className="mt-3 flex flex-wrap gap-2">{supplier.phone && <a href={`tel:${supplier.phone}`} onClick={(e) => e.stopPropagation()} className="px-2.5 py-1.5 text-xs font-bold rounded border border-[#DCE4E8]"><Phone className="inline w-3.5 h-3.5 mr-1"/>Call Supplier</a>}<button onClick={(e) => { e.stopPropagation(); directions(supplier); }} className="px-2.5 py-1.5 text-xs font-bold rounded bg-[#123B5D] text-white"><Navigation className="inline w-3.5 h-3.5 mr-1"/>Get Directions</button>{Number.isFinite(Number(supplier.lat)) && Number.isFinite(Number(supplier.lng)) && <a href={mapUrl(supplier)} target="_blank" rel="noreferrer" onClick={(e) => e.stopPropagation()} className="px-2.5 py-1.5 text-xs font-bold rounded border border-[#DCE4E8]"><ExternalLink className="inline w-3.5 h-3.5 mr-1"/>View on Map</a>}</div></article>)}</div></div>
    <p className="text-[11px] text-[#667085] px-1">Potential suppliers are ranked by configurable category relevance (40%), product match (30%), distance (20%), and known delivery availability (10%). OpenStreetMap may not list every supplier; “verified” is shown only for records marked verified in the supplier database.</p></>}</section>;
}
