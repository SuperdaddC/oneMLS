"use client";

import { useEffect, useState, useMemo } from "react";
import { createClient } from "@/lib/supabase";

interface ViewRow {
  id: string;
  property_id: string;
  viewer_id: string | null;
  source: string;
  created_at: string;
}

interface EventRow {
  id: string;
  property_id: string;
  event_type: string;
  user_id: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
}

interface PropertyInfo {
  id: string;
  city: string;
  state: string;
  price: number;
}

export default function MarketInsightsPage() {
  const [views, setViews] = useState<ViewRow[]>([]);
  const [events, setEvents] = useState<EventRow[]>([]);
  const [propertyMap, setPropertyMap] = useState<Record<string, PropertyInfo>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const supabase = createClient();
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) return;

      // Get agent's properties
      const { data: props } = await supabase
        .from("properties")
        .select("id, city, state, price")
        .eq("owner_id", userData.user.id);

      if (!props || props.length === 0) {
        setLoading(false);
        return;
      }

      const pMap: Record<string, PropertyInfo> = {};
      const ids = props.map((p: PropertyInfo) => {
        pMap[p.id] = p;
        return p.id;
      });
      setPropertyMap(pMap);

      // Fetch views and events for agent's properties
      const [viewsRes, eventsRes] = await Promise.all([
        supabase.from("property_views").select("*").in("property_id", ids),
        supabase.from("property_events").select("*").in("property_id", ids),
      ]);

      if (viewsRes.data) setViews(viewsRes.data as ViewRow[]);
      if (eventsRes.data) setEvents(eventsRes.data as EventRow[]);
      setLoading(false);
    };
    load();
  }, []);

  // Market Overview Metrics
  const totalViews = views.length;
  const uniqueViewers = useMemo(() => new Set(views.map((v) => v.viewer_id).filter(Boolean)).size, [views]);

  const avgDaysToShowing = useMemo(() => {
    const showingRequests = events.filter((e) => e.event_type === "showing_request");
    if (showingRequests.length === 0) return null;
    // Approximate: days from property listing to first showing request per property
    const propFirst: Record<string, number> = {};
    for (const e of showingRequests) {
      const ts = new Date(e.created_at).getTime();
      if (!propFirst[e.property_id] || ts < propFirst[e.property_id]) {
        propFirst[e.property_id] = ts;
      }
    }
    const days = Object.values(propFirst).map((ts) => {
      const diff = (ts - Date.now()) / (1000 * 60 * 60 * 24);
      return Math.abs(diff);
    });
    return days.length > 0 ? Math.round(days.reduce((a, b) => a + b, 0) / days.length) : null;
  }, [events]);

  const hottestMarket = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const v of views) {
      const p = propertyMap[v.property_id];
      if (p) {
        const key = `${p.city}, ${p.state}`;
        counts[key] = (counts[key] || 0) + 1;
      }
    }
    let best = "";
    let bestCount = 0;
    for (const [k, c] of Object.entries(counts)) {
      if (c > bestCount) {
        best = k;
        bestCount = c;
      }
    }
    return best || "N/A";
  }, [views, propertyMap]);

  // Demand by Location
  const locationData = useMemo(() => {
    const locs: Record<string, { city: string; state: string; views: number; saves: number; contacts: number }> = {};
    for (const v of views) {
      const p = propertyMap[v.property_id];
      if (!p) continue;
      const key = `${p.city}|${p.state}`;
      if (!locs[key]) locs[key] = { city: p.city, state: p.state, views: 0, saves: 0, contacts: 0 };
      locs[key].views++;
    }
    for (const e of events) {
      const p = propertyMap[e.property_id];
      if (!p) continue;
      const key = `${p.city}|${p.state}`;
      if (!locs[key]) locs[key] = { city: p.city, state: p.state, views: 0, saves: 0, contacts: 0 };
      if (e.event_type === "save") locs[key].saves++;
      if (e.event_type === "contact") locs[key].contacts++;
    }
    return Object.values(locs)
      .map((l) => ({ ...l, demandScore: l.views * 1 + l.saves * 3 + l.contacts * 5 }))
      .sort((a, b) => b.demandScore - a.demandScore);
  }, [views, events, propertyMap]);

  const maxDemandScore = useMemo(() => Math.max(...locationData.map((l) => l.demandScore), 1), [locationData]);

  // Price Point Demand
  const pricePointData = useMemo(() => {
    const buckets = [
      { label: "Under $300K", min: 0, max: 300000, count: 0 },
      { label: "$300-500K", min: 300000, max: 500000, count: 0 },
      { label: "$500K-750K", min: 500000, max: 750000, count: 0 },
      { label: "$750K-$1M", min: 750000, max: 1000000, count: 0 },
      { label: "$1M-$2M", min: 1000000, max: 2000000, count: 0 },
      { label: "$2M+", min: 2000000, max: Infinity, count: 0 },
    ];
    for (const v of views) {
      const p = propertyMap[v.property_id];
      if (!p) continue;
      for (const b of buckets) {
        if (p.price >= b.min && p.price < b.max) {
          b.count++;
          break;
        }
      }
    }
    return buckets;
  }, [views, propertyMap]);

  const maxPriceBucket = useMemo(() => Math.max(...pricePointData.map((b) => b.count), 1), [pricePointData]);

  // Time of Day Heatmap
  const heatmapData = useMemo(() => {
    const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
    const periods = ["Morning (6-12)", "Afternoon (12-5)", "Evening (5-9)", "Night (9-6)"];
    const grid: number[][] = days.map(() => [0, 0, 0, 0]);
    for (const v of views) {
      const d = new Date(v.created_at);
      const dayIdx = (d.getDay() + 6) % 7; // Mon=0
      const hour = d.getHours();
      let periodIdx = 3; // Night
      if (hour >= 6 && hour < 12) periodIdx = 0;
      else if (hour >= 12 && hour < 17) periodIdx = 1;
      else if (hour >= 17 && hour < 21) periodIdx = 2;
      grid[dayIdx][periodIdx]++;
    }
    const maxVal = Math.max(...grid.flat(), 1);
    return { days, periods, grid, maxVal };
  }, [views]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#c9a962]" />
      </div>
    );
  }

  const demandColor = (score: number, max: number) => {
    const ratio = score / max;
    if (ratio > 0.6) return "#22c55e";
    if (ratio > 0.3) return "#eab308";
    return "#64748b";
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-lg bg-[#c9a962]/10">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M3 17L9 11L13 15L21 7" stroke="#c9a962" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M17 7H21V11" stroke="#c9a962" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
        <div>
          <h1 className="text-2xl font-bold text-white">Market Insights</h1>
          <p className="text-[#94a3b8] text-sm">Understand buyer demand in your markets</p>
        </div>
      </div>

      {/* Market Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <OverviewCard label="Total Market Views" value={totalViews.toLocaleString()} icon="eye" />
        <OverviewCard label="Active Buyers" value={uniqueViewers.toLocaleString()} icon="users" />
        <OverviewCard label="Avg. Days to First Showing" value={avgDaysToShowing !== null ? `${avgDaysToShowing}` : "--"} icon="clock" />
        <OverviewCard label="Hottest Market" value={hottestMarket} icon="fire" />
      </div>

      {/* Demand by Location */}
      <div className="bg-[#1c1c2e] rounded-xl border border-[#2a2a3a] p-6">
        <h2 className="text-lg font-semibold text-white mb-4">Demand by Location</h2>
        {locationData.length === 0 ? (
          <p className="text-[#94a3b8] text-sm">No location data yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left text-xs text-[#94a3b8] uppercase tracking-wider border-b border-[#2a2a3a]">
                  <th className="pb-3 pr-4">City</th>
                  <th className="pb-3 pr-4">State</th>
                  <th className="pb-3 pr-4 text-right">Views</th>
                  <th className="pb-3 pr-4 text-right">Saves</th>
                  <th className="pb-3 pr-4 text-right">Contacts</th>
                  <th className="pb-3 text-right">Demand Score</th>
                  <th className="pb-3 w-48"></th>
                </tr>
              </thead>
              <tbody>
                {locationData.map((loc, i) => (
                  <tr key={i} className="border-b border-[#2a2a3a]/50 last:border-0">
                    <td className="py-3 pr-4 text-white text-sm">{loc.city}</td>
                    <td className="py-3 pr-4 text-[#94a3b8] text-sm">{loc.state}</td>
                    <td className="py-3 pr-4 text-white text-sm text-right">{loc.views}</td>
                    <td className="py-3 pr-4 text-white text-sm text-right">{loc.saves}</td>
                    <td className="py-3 pr-4 text-white text-sm text-right">{loc.contacts}</td>
                    <td className="py-3 pr-4 text-white text-sm text-right font-semibold">{loc.demandScore}</td>
                    <td className="py-3">
                      <div className="w-full bg-[#161620] rounded-full h-2 overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all"
                          style={{
                            width: `${(loc.demandScore / maxDemandScore) * 100}%`,
                            backgroundColor: demandColor(loc.demandScore, maxDemandScore),
                          }}
                        />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Price Point Demand */}
      <div className="bg-[#1c1c2e] rounded-xl border border-[#2a2a3a] p-6">
        <h2 className="text-lg font-semibold text-white mb-4">Price Point Demand</h2>
        <div className="space-y-3">
          {pricePointData.map((bucket, i) => (
            <div key={i} className="flex items-center gap-4">
              <span className="text-sm text-[#94a3b8] w-28 flex-shrink-0">{bucket.label}</span>
              <div className="flex-1 bg-[#161620] rounded-full h-6 overflow-hidden">
                <div
                  className="h-full rounded-full transition-all flex items-center pl-2"
                  style={{
                    width: `${Math.max((bucket.count / maxPriceBucket) * 100, 2)}%`,
                    backgroundColor: "#c9a962",
                  }}
                >
                  {bucket.count > 0 && (
                    <span className="text-xs font-semibold text-black">{bucket.count}</span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Time of Day Heatmap */}
      <div className="bg-[#1c1c2e] rounded-xl border border-[#2a2a3a] p-6">
        <h2 className="text-lg font-semibold text-white mb-1">Time of Day Heatmap</h2>
        <p className="text-[#94a3b8] text-sm mb-4">When your properties get the most views</p>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr>
                <th className="text-left text-xs text-[#94a3b8] pb-2 pr-3"></th>
                {heatmapData.periods.map((period) => (
                  <th key={period} className="text-center text-xs text-[#94a3b8] pb-2 px-2 font-normal">
                    {period}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {heatmapData.days.map((day, dayIdx) => (
                <tr key={day}>
                  <td className="text-sm text-[#94a3b8] py-1 pr-3 font-medium">{day}</td>
                  {heatmapData.grid[dayIdx].map((count, periodIdx) => {
                    const intensity = count / heatmapData.maxVal;
                    return (
                      <td key={periodIdx} className="py-1 px-2">
                        <div
                          className="rounded-md h-10 flex items-center justify-center text-xs font-medium transition-all"
                          style={{
                            backgroundColor:
                              intensity > 0
                                ? `rgba(201, 169, 98, ${0.1 + intensity * 0.8})`
                                : "rgba(42, 42, 58, 0.5)",
                            color: intensity > 0.4 ? "#000" : "#94a3b8",
                          }}
                        >
                          {count > 0 ? count : ""}
                        </div>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function OverviewCard({ label, value, icon }: { label: string; value: string; icon: string }) {
  const iconSvg = {
    eye: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M1 12S5 4 12 4 23 12 23 12 19 20 12 20 1 12 1 12Z" stroke="#c9a962" strokeWidth="2" />
        <circle cx="12" cy="12" r="3" stroke="#c9a962" strokeWidth="2" />
      </svg>
    ),
    users: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="9" cy="8" r="3.5" stroke="#c9a962" strokeWidth="2" />
        <path d="M2 20C2 16 5 13.5 9 13.5S16 16 16 20" stroke="#c9a962" strokeWidth="2" strokeLinecap="round" />
        <circle cx="17" cy="8" r="2.5" stroke="#c9a962" strokeWidth="1.5" />
        <path d="M18 13.5C20 14 22 15.5 22 19" stroke="#c9a962" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    ),
    clock: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="12" cy="12" r="9" stroke="#c9a962" strokeWidth="2" />
        <path d="M12 7V12L15 15" stroke="#c9a962" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
    fire: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 2C12 2 5 9 5 14C5 17.87 8.13 21 12 21C15.87 21 19 17.87 19 14C19 9 12 2 12 2Z" stroke="#c9a962" strokeWidth="2" strokeLinejoin="round" />
        <path d="M12 12C12 12 9 14 9 16C9 17.66 10.34 19 12 19C13.66 19 15 17.66 15 16C15 14 12 12 12 12Z" stroke="#c9a962" strokeWidth="2" strokeLinejoin="round" />
      </svg>
    ),
  }[icon];

  return (
    <div className="bg-[#1c1c2e] rounded-xl border border-[#2a2a3a] p-5">
      <div className="flex items-center justify-between mb-3">
        <span className="text-[#94a3b8] text-sm">{label}</span>
        <div className="p-1.5 rounded-lg bg-[#c9a962]/10">{iconSvg}</div>
      </div>
      <p className="text-2xl font-bold text-white">{value}</p>
    </div>
  );
}
