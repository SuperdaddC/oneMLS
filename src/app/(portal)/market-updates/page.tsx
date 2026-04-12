"use client";

import { useState, useEffect, useRef } from "react";
import { createClient } from "@/lib/supabase";
import { toPng } from "html-to-image";
import type { Profile } from "@/lib/types";

const US_STATES = [
  "AL","AK","AZ","AR","CA","CO","CT","DE","FL","GA","HI","ID","IL","IN","IA",
  "KS","KY","LA","ME","MD","MA","MI","MN","MS","MO","MT","NE","NV","NH","NJ",
  "NM","NY","NC","ND","OH","OK","OR","PA","RI","SC","SD","TN","TX","UT","VT",
  "VA","WA","WV","WI","WY",
];

type ThemeKey = "dark" | "light" | "gradient";

interface MarketStats {
  activeListings: number;
  avgPrice: number;
  avgDaysOnMarket: number;
  newListingsThisMonth: number;
}

interface ThemeColors {
  bg: string;
  bgSecondary: string;
  text: string;
  textMuted: string;
  accent: string;
  statValue: string;
  statLabel: string;
  border: string;
}

const THEMES: Record<ThemeKey, { label: string; colors: ThemeColors }> = {
  dark: {
    label: "Dark",
    colors: {
      bg: "#0f172a",
      bgSecondary: "#1e293b",
      text: "#ffffff",
      textMuted: "#94a3b8",
      accent: "#c9a962",
      statValue: "#c9a962",
      statLabel: "#94a3b8",
      border: "#2a2a3a",
    },
  },
  light: {
    label: "Light",
    colors: {
      bg: "#ffffff",
      bgSecondary: "#f1f5f9",
      text: "#0f172a",
      textMuted: "#64748b",
      accent: "#c9a962",
      statValue: "#0f172a",
      statLabel: "#64748b",
      border: "#e2e8f0",
    },
  },
  gradient: {
    label: "Gradient",
    colors: {
      bg: "linear-gradient(135deg, #1e3a5f 0%, #4c1d95 100%)",
      bgSecondary: "rgba(255,255,255,0.1)",
      text: "#ffffff",
      textMuted: "rgba(255,255,255,0.7)",
      accent: "#c9a962",
      statValue: "#ffffff",
      statLabel: "rgba(255,255,255,0.7)",
      border: "rgba(255,255,255,0.15)",
    },
  },
};

function formatPrice(n: number) {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `$${(n / 1_000).toFixed(0)}K`;
  return `$${n.toFixed(0)}`;
}

function getMonthYear() {
  const d = new Date();
  return d.toLocaleDateString("en-US", { month: "long", year: "numeric" });
}

export default function MarketUpdatesPage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [selectedState, setSelectedState] = useState("CA");
  const [city, setCity] = useState("");
  const [stats, setStats] = useState<MarketStats | null>(null);
  const [areaLabel, setAreaLabel] = useState("");
  const [activeTheme, setActiveTheme] = useState<ThemeKey>("dark");
  const graphicRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const load = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data: prof } = await supabase.from("profiles").select("*").eq("id", user.id).single();
      if (prof) setProfile(prof);
      setLoading(false);
    };
    load();
  }, []);

  const generateStats = async () => {
    setGenerating(true);
    try {
      const supabase = createClient();
      let query = supabase
        .from("properties")
        .select("price, days_on_market, listing_date", { count: "exact" })
        .eq("status", "active")
        .eq("state", selectedState);

      if (city.trim()) {
        query = query.ilike("city", `%${city.trim()}%`);
      }

      const { data, count } = await query;

      const activeListings = count ?? 0;
      let avgPrice = 0;
      let avgDom = 0;
      let newThisMonth = 0;

      if (data && data.length > 0) {
        const totalPrice = data.reduce((sum, p) => sum + (p.price ?? 0), 0);
        avgPrice = totalPrice / data.length;
        const totalDom = data.reduce((sum, p) => sum + (p.days_on_market ?? 0), 0);
        avgDom = Math.round(totalDom / data.length);

        const now = new Date();
        const firstOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
        newThisMonth = data.filter((p) => p.listing_date && p.listing_date >= firstOfMonth).length;
      }

      setStats({ activeListings, avgPrice, avgDaysOnMarket: avgDom, newListingsThisMonth: newThisMonth });
      setAreaLabel(city.trim() ? `${city.trim()}, ${selectedState}` : selectedState);
    } catch (err) {
      console.error("Failed to generate stats:", err);
    }
    setGenerating(false);
  };

  const handleDownload = async () => {
    if (!graphicRef.current) return;
    setDownloading(true);
    try {
      const dataUrl = await toPng(graphicRef.current, {
        width: 1080,
        height: 1080,
        pixelRatio: 1,
      });
      const link = document.createElement("a");
      link.download = `market-update-${areaLabel.replace(/[\s,]+/g, "-").toLowerCase()}.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error("Failed to generate image:", err);
    }
    setDownloading(false);
  };

  const agentName = profile ? `${profile.first_name} ${profile.last_name}`.trim() : "Agent Name";
  const brokerageName = profile?.brokerage_name ?? "Brokerage Name";
  const theme = THEMES[activeTheme].colors;
  const isGradient = activeTheme === "gradient";

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[60vh]">
        <div className="text-[#94a3b8]">Loading...</div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-[#94a3b8]">
        <span>Portal</span>
        <span>/</span>
        <span className="text-white">Market Updates</span>
      </div>

      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg bg-[#1c1c2e] border border-[#2a2a3a] flex items-center justify-center">
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect x="2" y="12" width="3" height="6" rx="0.5" stroke="#c9a962" strokeWidth="1.5" />
            <rect x="7" y="8" width="3" height="10" rx="0.5" stroke="#c9a962" strokeWidth="1.5" />
            <rect x="12" y="4" width="3" height="14" rx="0.5" stroke="#c9a962" strokeWidth="1.5" />
            <path d="M2 3L8 6L14 2L18 5" stroke="#c9a962" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
        <div>
          <h1 className="text-2xl font-bold text-white">Market Update Graphics</h1>
          <p className="text-[#94a3b8] text-sm">Create shareable market stats for social media</p>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[340px_1fr] gap-6">
        {/* Left: Controls */}
        <div className="space-y-4">
          {/* Area selector */}
          <div className="bg-[#161620] border border-[#2a2a3a] rounded-xl p-4 space-y-3">
            <h3 className="text-xs font-semibold text-[#94a3b8] uppercase tracking-wider">Market Area</h3>
            <div>
              <label className="block text-xs text-[#94a3b8] mb-1">State</label>
              <select
                value={selectedState}
                onChange={(e) => setSelectedState(e.target.value)}
                className="w-full bg-[#1c1c2e] border border-[#2a2a3a] rounded-lg px-3 py-2.5 text-sm text-gray-300 focus:outline-none focus:border-[#c9a962]"
              >
                {US_STATES.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs text-[#94a3b8] mb-1">City (optional)</label>
              <input
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="e.g. Denver"
                className="w-full bg-[#1c1c2e] border border-[#2a2a3a] rounded-lg px-3 py-2.5 text-sm text-gray-300 focus:outline-none focus:border-[#c9a962]"
              />
            </div>
            <button
              onClick={generateStats}
              disabled={generating}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg bg-[#c9a962] text-black font-semibold text-sm hover:bg-[#b8993f] transition-colors disabled:opacity-50"
            >
              {generating ? (
                <>
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Generating...
                </>
              ) : (
                "Generate Stats"
              )}
            </button>
          </div>

          {/* Theme selector */}
          {stats && (
            <div className="bg-[#161620] border border-[#2a2a3a] rounded-xl p-4 space-y-3">
              <h3 className="text-xs font-semibold text-[#94a3b8] uppercase tracking-wider">Template Design</h3>
              <div className="grid grid-cols-3 gap-2">
                {(Object.keys(THEMES) as ThemeKey[]).map((key) => (
                  <button
                    key={key}
                    onClick={() => setActiveTheme(key)}
                    className={`px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                      activeTheme === key
                        ? "bg-[#c9a962]/15 border border-[#c9a962]/40 text-white"
                        : "bg-[#1c1c2e] border border-[#2a2a3a] text-[#94a3b8] hover:border-[#c9a962]/30"
                    }`}
                  >
                    {THEMES[key].label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Download */}
          {stats && (
            <div className="bg-[#161620] border border-[#2a2a3a] rounded-xl p-4">
              <button
                onClick={handleDownload}
                disabled={downloading}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg bg-[#c9a962] text-black font-semibold text-sm hover:bg-[#b8993f] transition-colors disabled:opacity-50"
              >
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M8 2V10M8 10L5 7M8 10L11 7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M2 12V13C2 13.5523 2.44772 14 3 14H13C13.5523 14 14 13.5523 14 13V12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
                {downloading ? "Generating PNG..." : "Download PNG (1080x1080)"}
              </button>
            </div>
          )}
        </div>

        {/* Right: Preview */}
        <div className="bg-[#161620] border border-[#2a2a3a] rounded-xl overflow-hidden">
          <div className="px-4 py-3 border-b border-[#2a2a3a] flex items-center justify-between">
            <h3 className="text-sm font-semibold text-white">Preview</h3>
            <span className="text-xs text-[#94a3b8]">1080 x 1080</span>
          </div>
          <div className="p-6 flex justify-center overflow-auto" style={{ backgroundColor: "#0a0a0f" }}>
            {!stats ? (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" className="mb-4 opacity-30">
                  <rect x="6" y="30" width="8" height="12" rx="1" stroke="#94a3b8" strokeWidth="2" />
                  <rect x="20" y="20" width="8" height="22" rx="1" stroke="#94a3b8" strokeWidth="2" />
                  <rect x="34" y="10" width="8" height="32" rx="1" stroke="#94a3b8" strokeWidth="2" />
                </svg>
                <p className="text-[#94a3b8] text-sm">Select a market area and click &quot;Generate Stats&quot;</p>
                <p className="text-[#94a3b8]/60 text-xs mt-1">Stats are computed from live OneMLS data</p>
              </div>
            ) : (
              <div
                ref={graphicRef}
                style={{
                  width: "540px",
                  height: "540px",
                  background: isGradient ? theme.bg : theme.bg,
                  borderRadius: "16px",
                  overflow: "hidden",
                  display: "flex",
                  flexDirection: "column",
                  fontFamily: "Arial, Helvetica, sans-serif",
                  position: "relative",
                }}
              >
                {/* Header */}
                <div
                  style={{
                    padding: "36px 36px 0",
                    display: "flex",
                    flexDirection: "column",
                    gap: "4px",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                    }}
                  >
                    <div
                      style={{
                        width: "4px",
                        height: "28px",
                        backgroundColor: theme.accent,
                        borderRadius: "2px",
                      }}
                    />
                    <div
                      style={{
                        fontSize: "13px",
                        fontWeight: 700,
                        letterSpacing: "0.15em",
                        color: theme.accent,
                        textTransform: "uppercase",
                      }}
                    >
                      Market Update
                    </div>
                  </div>
                  <div
                    style={{
                      fontSize: "11px",
                      color: theme.textMuted,
                      paddingLeft: "12px",
                      letterSpacing: "0.05em",
                    }}
                  >
                    {getMonthYear()}
                  </div>
                </div>

                {/* Area name */}
                <div
                  style={{
                    padding: "16px 36px 0",
                  }}
                >
                  <div
                    style={{
                      fontSize: "28px",
                      fontWeight: 800,
                      color: theme.text,
                      lineHeight: 1.1,
                    }}
                  >
                    {areaLabel}
                  </div>
                </div>

                {/* Stats grid */}
                <div
                  style={{
                    padding: "24px 36px",
                    flex: 1,
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: "16px",
                    alignContent: "center",
                  }}
                >
                  {[
                    { label: "Active Listings", value: stats.activeListings.toLocaleString() },
                    { label: "Avg. Price", value: formatPrice(stats.avgPrice) },
                    { label: "Avg. Days on Market", value: String(stats.avgDaysOnMarket) },
                    { label: "New This Month", value: stats.newListingsThisMonth.toLocaleString() },
                  ].map((item) => (
                    <div
                      key={item.label}
                      style={{
                        backgroundColor: theme.bgSecondary,
                        borderRadius: "12px",
                        padding: "24px 20px",
                        border: `1px solid ${theme.border}`,
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        justifyContent: "center",
                        textAlign: "center",
                      }}
                    >
                      <div
                        style={{
                          fontSize: "32px",
                          fontWeight: 800,
                          color: theme.statValue,
                          lineHeight: 1.1,
                        }}
                      >
                        {item.value}
                      </div>
                      <div
                        style={{
                          fontSize: "11px",
                          fontWeight: 600,
                          color: theme.statLabel,
                          marginTop: "8px",
                          textTransform: "uppercase",
                          letterSpacing: "0.05em",
                        }}
                      >
                        {item.label}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Agent branding */}
                <div
                  style={{
                    padding: "0 36px 24px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                  }}
                >
                  <div>
                    <div style={{ fontSize: "13px", fontWeight: 700, color: theme.text }}>
                      {agentName}
                    </div>
                    <div style={{ fontSize: "11px", color: theme.textMuted }}>
                      {brokerageName}
                    </div>
                  </div>
                  <div
                    style={{
                      fontSize: "16px",
                      fontWeight: 800,
                      letterSpacing: "0.05em",
                      color: theme.textMuted,
                    }}
                  >
                    ONE<span style={{ color: theme.accent }}>MLS</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
