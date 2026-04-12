"use client";

import { useEffect, useState, useCallback } from "react";
import { createClient } from "@/lib/supabase";
import type { Property, CmaReport } from "@/lib/types";

interface Adjustment {
  label: string;
  amount: number;
}

interface ComparableWithAdjustments {
  property: Property;
  adjustments: Adjustment[];
  adjustedPrice: number;
}

export default function CMAPage() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [selectedPropertyId, setSelectedPropertyId] = useState("");
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [comparables, setComparables] = useState<ComparableWithAdjustments[]>([]);
  const [suggestedPrice, setSuggestedPrice] = useState<number | null>(null);
  const [priceLow, setPriceLow] = useState<number | null>(null);
  const [priceHigh, setPriceHigh] = useState<number | null>(null);
  const [previousReports, setPreviousReports] = useState<(CmaReport & { property?: Property })[]>([]);
  const [loading, setLoading] = useState(false);
  const [findingComps, setFindingComps] = useState(false);
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) {
        setUserId(data.user.id);
        // Load agent's properties
        supabase
          .from("properties")
          .select("*")
          .eq("owner_id", data.user.id)
          .order("created_at", { ascending: false })
          .then(({ data: props }) => {
            if (props) setProperties(props as Property[]);
          });
        // Load previous reports
        loadReports(data.user.id);
      }
    });
  }, []);

  const loadReports = async (agentId: string) => {
    const supabase = createClient();
    const { data } = await supabase
      .from("cma_reports")
      .select("*, property:properties(*)")
      .eq("agent_id", agentId)
      .order("created_at", { ascending: false });
    if (data) setPreviousReports(data as (CmaReport & { property?: Property })[]);
  };

  const handlePropertySelect = (propId: string) => {
    setSelectedPropertyId(propId);
    const prop = properties.find((p) => p.id === propId) || null;
    setSelectedProperty(prop);
    setComparables([]);
    setSuggestedPrice(null);
    setPriceLow(null);
    setPriceHigh(null);
    setSuccessMsg("");
  };

  const autoSuggestComparables = async () => {
    if (!selectedProperty) return;
    setFindingComps(true);
    const supabase = createClient();
    const priceLow = selectedProperty.price * 0.7;
    const priceHigh = selectedProperty.price * 1.3;
    const { data } = await supabase
      .from("properties")
      .select("*")
      .eq("state", selectedProperty.state)
      .eq("status", "active")
      .neq("id", selectedProperty.id)
      .gte("price", priceLow)
      .lte("price", priceHigh)
      .limit(10);

    if (data) {
      const comps: ComparableWithAdjustments[] = (data as Property[]).map((comp) => {
        const adjustments: Adjustment[] = [];
        const bedDiff = selectedProperty.bedrooms - comp.bedrooms;
        if (bedDiff !== 0) {
          adjustments.push({
            label: `${Math.abs(bedDiff)} ${bedDiff > 0 ? "fewer" : "more"} bedroom${Math.abs(bedDiff) > 1 ? "s" : ""}`,
            amount: bedDiff * -15000,
          });
        }
        const bathDiff = selectedProperty.bathrooms - comp.bathrooms;
        if (bathDiff !== 0) {
          adjustments.push({
            label: `${Math.abs(bathDiff)} ${bathDiff > 0 ? "fewer" : "more"} bathroom${Math.abs(bathDiff) > 1 ? "s" : ""}`,
            amount: bathDiff * -10000,
          });
        }
        const sqftDiff = comp.sqft - selectedProperty.sqft;
        if (Math.abs(sqftDiff) > 100) {
          const adj = Math.round(sqftDiff * (comp.price / comp.sqft) * 0.3);
          adjustments.push({
            label: `${Math.abs(sqftDiff)} sqft ${sqftDiff > 0 ? "larger" : "smaller"}`,
            amount: -adj,
          });
        }
        const adjustedPrice = comp.price + adjustments.reduce((sum, a) => sum + a.amount, 0);
        return { property: comp, adjustments, adjustedPrice };
      });
      setComparables(comps);
      calculatePrice(comps);
    }
    setFindingComps(false);
  };

  const calculatePrice = useCallback((comps: ComparableWithAdjustments[]) => {
    if (comps.length === 0) {
      setSuggestedPrice(null);
      setPriceLow(null);
      setPriceHigh(null);
      return;
    }
    const avg = Math.round(comps.reduce((sum, c) => sum + c.adjustedPrice, 0) / comps.length);
    setSuggestedPrice(avg);
    setPriceLow(Math.round(avg * 0.95));
    setPriceHigh(Math.round(avg * 1.05));
  }, []);

  const updateAdjustment = (compIdx: number, adjIdx: number, amount: number) => {
    const updated = [...comparables];
    updated[compIdx].adjustments[adjIdx].amount = amount;
    updated[compIdx].adjustedPrice =
      updated[compIdx].property.price +
      updated[compIdx].adjustments.reduce((sum, a) => sum + a.amount, 0);
    setComparables(updated);
    calculatePrice(updated);
  };

  const removeComparable = (idx: number) => {
    const updated = comparables.filter((_, i) => i !== idx);
    setComparables(updated);
    calculatePrice(updated);
  };

  const generateReport = async () => {
    if (!selectedProperty || !userId || !suggestedPrice || !priceLow || !priceHigh) return;
    setSaving(true);
    const supabase = createClient();
    const { error } = await supabase.from("cma_reports").insert({
      agent_id: userId,
      property_id: selectedProperty.id,
      comparable_properties: comparables.map((c) => ({
        property_id: c.property.id,
        adjustments: Object.fromEntries(c.adjustments.map((a) => [a.label, a.amount])),
      })),
      suggested_price: suggestedPrice,
      price_range_low: priceLow,
      price_range_high: priceHigh,
    });
    if (!error) {
      setSuccessMsg("CMA Report generated successfully!");
      loadReports(userId);
      // Reset form
      setSelectedPropertyId("");
      setSelectedProperty(null);
      setComparables([]);
      setSuggestedPrice(null);
      setPriceLow(null);
      setPriceHigh(null);
    }
    setSaving(false);
  };

  const deleteReport = async (reportId: string) => {
    if (!userId) return;
    const supabase = createClient();
    await supabase.from("cma_reports").delete().eq("id", reportId);
    loadReports(userId);
  };

  const fmt = (n: number) =>
    new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(n);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-lg bg-[#c9a962]/10">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M3 20V8L7 12L12 6L17 10L21 4" stroke="#c9a962" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M3 20H21" stroke="#c9a962" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </div>
        <div>
          <h1 className="text-2xl font-bold text-white">CMA Reports</h1>
          <p className="text-[#94a3b8] text-sm">Create and manage Comparative Market Analysis reports</p>
        </div>
      </div>

      {successMsg && (
        <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4 text-green-400 text-sm">
          {successMsg}
        </div>
      )}

      {/* Create New Report */}
      <div className="bg-[#1c1c2e] rounded-xl border border-[#2a2a3a] p-6 space-y-6">
        <h2 className="text-lg font-semibold text-white">Create New Report</h2>

        {/* Subject Property Selector */}
        <div>
          <label className="block text-sm text-[#94a3b8] mb-2">Subject Property</label>
          <select
            value={selectedPropertyId}
            onChange={(e) => handlePropertySelect(e.target.value)}
            className="w-full bg-[#161620] border border-[#2a2a3a] rounded-lg px-4 py-3 text-white text-sm focus:outline-none focus:border-[#c9a962] transition-colors"
          >
            <option value="">Select a property...</option>
            {properties.map((p) => (
              <option key={p.id} value={p.id}>
                {p.address}, {p.city}, {p.state} {p.zip}
              </option>
            ))}
          </select>
        </div>

        {/* Selected Property Details */}
        {selectedProperty && (
          <div className="bg-[#161620] rounded-lg border border-[#2a2a3a] p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white font-medium">{selectedProperty.address}</p>
                <p className="text-[#94a3b8] text-sm">
                  {selectedProperty.city}, {selectedProperty.state} {selectedProperty.zip}
                </p>
              </div>
              <p className="text-[#c9a962] text-xl font-bold">{fmt(selectedProperty.price)}</p>
            </div>
            <div className="flex gap-6 mt-3 text-sm text-[#94a3b8]">
              <span>{selectedProperty.bedrooms} beds</span>
              <span>{selectedProperty.bathrooms} baths</span>
              <span>{selectedProperty.sqft.toLocaleString()} sqft</span>
            </div>

            <button
              onClick={autoSuggestComparables}
              disabled={findingComps}
              className="mt-4 px-6 py-2.5 bg-[#c9a962] text-black font-semibold rounded-lg hover:bg-[#d4b872] transition-colors disabled:opacity-50 text-sm"
            >
              {findingComps ? "Finding Comparables..." : "Auto-Suggest Comparables"}
            </button>
          </div>
        )}

        {/* Comparable Properties */}
        {comparables.length > 0 && (
          <div className="space-y-4">
            <h3 className="text-md font-semibold text-white">
              Comparable Properties ({comparables.length})
            </h3>
            {comparables.map((comp, compIdx) => (
              <div
                key={comp.property.id}
                className="bg-[#161620] rounded-lg border border-[#2a2a3a] p-4 space-y-3"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-white font-medium">{comp.property.address}</p>
                    <p className="text-[#94a3b8] text-sm">
                      {comp.property.city}, {comp.property.state} {comp.property.zip}
                    </p>
                    <div className="flex gap-4 mt-1 text-xs text-[#94a3b8]">
                      <span>{comp.property.bedrooms} beds</span>
                      <span>{comp.property.bathrooms} baths</span>
                      <span>{comp.property.sqft.toLocaleString()} sqft</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-white font-semibold">{fmt(comp.property.price)}</p>
                    <p className="text-[#c9a962] text-sm font-medium">
                      Adjusted: {fmt(comp.adjustedPrice)}
                    </p>
                  </div>
                </div>

                {/* Adjustments */}
                {comp.adjustments.length > 0 && (
                  <div className="space-y-2 pt-2 border-t border-[#2a2a3a]">
                    {comp.adjustments.map((adj, adjIdx) => (
                      <div key={adjIdx} className="flex items-center justify-between gap-4">
                        <span className="text-sm text-[#94a3b8]">{adj.label}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-[#94a3b8]">$</span>
                          <input
                            type="number"
                            value={adj.amount}
                            onChange={(e) =>
                              updateAdjustment(compIdx, adjIdx, Number(e.target.value))
                            }
                            className="w-28 bg-[#0a0a0f] border border-[#2a2a3a] rounded px-2 py-1 text-white text-sm text-right focus:outline-none focus:border-[#c9a962]"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                <button
                  onClick={() => removeComparable(compIdx)}
                  className="text-red-400 text-xs hover:text-red-300 transition-colors"
                >
                  Remove Comparable
                </button>
              </div>
            ))}
          </div>
        )}

        {/* AI Price Suggestion */}
        {suggestedPrice !== null && priceLow !== null && priceHigh !== null && (
          <div className="bg-gradient-to-r from-[#c9a962]/10 to-[#c9a962]/5 rounded-xl border border-[#c9a962]/30 p-6">
            <div className="flex items-center gap-2 mb-4">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M10 2L12.5 7.5L18 8.5L14 12.5L15 18L10 15.5L5 18L6 12.5L2 8.5L7.5 7.5L10 2Z" fill="#c9a962" />
              </svg>
              <h3 className="text-lg font-semibold text-[#c9a962]">AI Price Suggestion</h3>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-white">{fmt(suggestedPrice)}</p>
              <p className="text-[#94a3b8] text-sm mt-1">Suggested List Price</p>
              <div className="flex items-center justify-center gap-4 mt-3">
                <div>
                  <p className="text-white font-medium">{fmt(priceLow)}</p>
                  <p className="text-xs text-[#94a3b8]">Low Range</p>
                </div>
                <div className="h-8 w-px bg-[#2a2a3a]" />
                <div>
                  <p className="text-white font-medium">{fmt(priceHigh)}</p>
                  <p className="text-xs text-[#94a3b8]">High Range</p>
                </div>
              </div>
              <p className="text-xs text-[#94a3b8] mt-3">
                Based on {comparables.length} comparable{comparables.length !== 1 ? "s" : ""} with
                adjustments
              </p>
            </div>

            <button
              onClick={generateReport}
              disabled={saving}
              className="mt-6 w-full px-6 py-3 bg-[#c9a962] text-black font-semibold rounded-lg hover:bg-[#d4b872] transition-colors disabled:opacity-50"
            >
              {saving ? "Generating Report..." : "Generate Report"}
            </button>
          </div>
        )}
      </div>

      {/* Previous Reports */}
      <div className="bg-[#1c1c2e] rounded-xl border border-[#2a2a3a] p-6 space-y-4">
        <h2 className="text-lg font-semibold text-white">Previous Reports</h2>
        {previousReports.length === 0 ? (
          <p className="text-[#94a3b8] text-sm">No reports generated yet.</p>
        ) : (
          <div className="space-y-3">
            {previousReports.map((report) => (
              <div
                key={report.id}
                className="bg-[#161620] rounded-lg border border-[#2a2a3a] p-4 flex items-center justify-between"
              >
                <div>
                  <p className="text-white font-medium">
                    {report.property?.address || "Property"}
                  </p>
                  <p className="text-[#94a3b8] text-sm">
                    {report.property
                      ? `${report.property.city}, ${report.property.state}`
                      : ""}
                  </p>
                  <p className="text-xs text-[#94a3b8] mt-1">
                    {new Date(report.created_at).toLocaleDateString()}
                  </p>
                </div>
                <div className="text-right flex items-center gap-4">
                  <div>
                    <p className="text-[#c9a962] font-bold text-lg">
                      {fmt(report.suggested_price)}
                    </p>
                    <p className="text-xs text-[#94a3b8]">
                      {fmt(report.price_range_low)} - {fmt(report.price_range_high)}
                    </p>
                  </div>
                  <button
                    onClick={() => deleteReport(report.id)}
                    className="text-red-400 hover:text-red-300 transition-colors p-2"
                    title="Delete Report"
                  >
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M2 4H14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                      <path d="M5 4V2H11V4" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
                      <path d="M3 4L4 14H12L13 4" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
