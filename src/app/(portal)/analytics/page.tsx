"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase";

interface PropertySummary {
  id: string;
  address: string;
  city: string;
  state: string;
  price: number;
  status: string;
  photos: string[];
  listing_date: string;
  days_on_market: number;
}

interface ViewRow {
  property_id: string;
  created_at: string;
  source: string;
}

interface EventRow {
  property_id: string;
  event_type: string;
  created_at: string;
}

interface DailyCount {
  date: string;
  count: number;
}

interface PropertyStats {
  property: PropertySummary;
  views: number;
  saves: number;
  shares: number;
  contacts: number;
  showingRequests: number;
}

function formatPrice(price: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(price);
}

function formatShortDate(dateStr: string) {
  const d = new Date(dateStr);
  return `${d.getMonth() + 1}/${d.getDate()}`;
}

function getLastNDays(n: number): string[] {
  const days: string[] = [];
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    days.push(d.toISOString().split("T")[0]);
  }
  return days;
}

function percentChange(current: number, previous: number): { value: number; direction: "up" | "down" | "flat" } {
  if (previous === 0 && current === 0) return { value: 0, direction: "flat" };
  if (previous === 0) return { value: 100, direction: "up" };
  const pct = Math.round(((current - previous) / previous) * 100);
  return { value: Math.abs(pct), direction: pct > 0 ? "up" : pct < 0 ? "down" : "flat" };
}

export default function AnalyticsPage() {
  const [loading, setLoading] = useState(true);
  const [properties, setProperties] = useState<PropertySummary[]>([]);
  const [views, setViews] = useState<ViewRow[]>([]);
  const [events, setEvents] = useState<EventRow[]>([]);
  const [expandedRow, setExpandedRow] = useState<string | null>(null);
  const [hoveredBar, setHoveredBar] = useState<{ date: string; count: number } | null>(null);

  useEffect(() => {
    const load = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Fetch agent's properties
      const { data: props } = await supabase
        .from("properties")
        .select("id, address, city, state, price, status, photos, listing_date, days_on_market")
        .eq("owner_id", user.id);

      if (!props || props.length === 0) {
        setLoading(false);
        return;
      }

      setProperties(props);
      const propertyIds = props.map((p) => p.id);

      // Fetch views and events in parallel
      const [viewsRes, eventsRes] = await Promise.all([
        supabase
          .from("property_views")
          .select("property_id, created_at, source")
          .in("property_id", propertyIds),
        supabase
          .from("property_events")
          .select("property_id, event_type, created_at")
          .in("property_id", propertyIds),
      ]);

      setViews(viewsRes.data || []);
      setEvents(eventsRes.data || []);
      setLoading(false);
    };
    load();
  }, []);

  // Computed stats
  const totalViews = views.length;

  const now = new Date();
  const startOfWeek = new Date(now);
  startOfWeek.setDate(now.getDate() - now.getDay());
  startOfWeek.setHours(0, 0, 0, 0);
  const startOfLastWeek = new Date(startOfWeek);
  startOfLastWeek.setDate(startOfLastWeek.getDate() - 7);

  const viewsThisWeek = views.filter((v) => new Date(v.created_at) >= startOfWeek).length;
  const viewsLastWeek = views.filter((v) => {
    const d = new Date(v.created_at);
    return d >= startOfLastWeek && d < startOfWeek;
  }).length;
  const weekTrend = percentChange(viewsThisWeek, viewsLastWeek);

  const totalSaves = events.filter((e) => e.event_type === "save").length;
  const totalInteractions = events.filter((e) =>
    ["showing_request", "contact", "share"].includes(e.event_type)
  ).length;

  // Per-property stats
  const propertyStats: PropertyStats[] = properties
    .map((p) => {
      const pViews = views.filter((v) => v.property_id === p.id);
      const pEvents = events.filter((e) => e.property_id === p.id);
      return {
        property: p,
        views: pViews.length,
        saves: pEvents.filter((e) => e.event_type === "save").length,
        shares: pEvents.filter((e) => e.event_type === "share").length,
        contacts: pEvents.filter((e) => e.event_type === "contact").length,
        showingRequests: pEvents.filter((e) => e.event_type === "showing_request").length,
      };
    })
    .sort((a, b) => b.views - a.views);

  const maxViews = Math.max(...propertyStats.map((s) => s.views), 1);

  // Daily views for chart (last 30 days)
  const last30Days = getLastNDays(30);
  const dailyCounts: DailyCount[] = last30Days.map((date) => ({
    date,
    count: views.filter((v) => v.created_at.startsWith(date)).length,
  }));
  const maxDaily = Math.max(...dailyCounts.map((d) => d.count), 1);

  // Per-property daily breakdown for expanded rows
  const getPropertyDailyViews = (propertyId: string): DailyCount[] => {
    const last14 = getLastNDays(14);
    return last14.map((date) => ({
      date,
      count: views.filter((v) => v.property_id === propertyId && v.created_at.startsWith(date)).length,
    }));
  };

  if (loading) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "60vh" }}>
        <div style={{ color: "#94a3b8", fontSize: "16px" }}>Loading analytics...</div>
      </div>
    );
  }

  if (properties.length === 0) {
    return (
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "60vh", gap: "16px" }}>
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="3" width="7" height="18" rx="1" />
          <rect x="14" y="9" width="7" height="12" rx="1" />
        </svg>
        <div style={{ color: "#94a3b8", fontSize: "16px" }}>No listings yet. Create a listing to start tracking analytics.</div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: "1200px" }}>
      {/* Header */}
      <div style={{ marginBottom: "32px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "4px" }}>
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#c9a962" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="12" width="4" height="9" rx="0.5" />
            <rect x="10" y="7" width="4" height="14" rx="0.5" />
            <rect x="17" y="2" width="4" height="19" rx="0.5" />
          </svg>
          <h1 style={{ fontSize: "28px", fontWeight: 700, color: "#fff", margin: 0 }}>Listing Analytics</h1>
        </div>
        <p style={{ color: "#94a3b8", fontSize: "14px", margin: 0 }}>Track how your listings perform</p>
      </div>

      {/* Summary Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "16px", marginBottom: "32px" }}>
        {/* Total Views */}
        <div style={{ background: "#161620", border: "1px solid #2a2a3a", borderRadius: "12px", padding: "20px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "12px" }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
              <circle cx="12" cy="12" r="3" />
            </svg>
            <span style={{ color: "#94a3b8", fontSize: "13px", fontWeight: 500 }}>Total Views</span>
          </div>
          <div style={{ fontSize: "32px", fontWeight: 700, color: "#fff" }}>{totalViews.toLocaleString()}</div>
        </div>

        {/* Views This Week */}
        <div style={{ background: "#161620", border: "1px solid #2a2a3a", borderRadius: "12px", padding: "20px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "12px" }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
              <polyline points="17 6 23 6 23 12" />
            </svg>
            <span style={{ color: "#94a3b8", fontSize: "13px", fontWeight: 500 }}>Views This Week</span>
          </div>
          <div style={{ display: "flex", alignItems: "baseline", gap: "10px" }}>
            <span style={{ fontSize: "32px", fontWeight: 700, color: "#fff" }}>{viewsThisWeek}</span>
            {weekTrend.direction !== "flat" && (
              <span style={{
                fontSize: "13px",
                fontWeight: 600,
                color: weekTrend.direction === "up" ? "#22c55e" : "#ef4444",
                display: "flex",
                alignItems: "center",
                gap: "2px",
              }}>
                {weekTrend.direction === "up" ? "\u2191" : "\u2193"} {weekTrend.value}%
              </span>
            )}
          </div>
          <div style={{ color: "#94a3b8", fontSize: "12px", marginTop: "4px" }}>vs {viewsLastWeek} last week</div>
        </div>

        {/* Total Saves */}
        <div style={{ background: "#161620", border: "1px solid #2a2a3a", borderRadius: "12px", padding: "20px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "12px" }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
            </svg>
            <span style={{ color: "#94a3b8", fontSize: "13px", fontWeight: 500 }}>Total Saves</span>
          </div>
          <div style={{ fontSize: "32px", fontWeight: 700, color: "#fff" }}>{totalSaves}</div>
        </div>

        {/* Total Interactions */}
        <div style={{ background: "#161620", border: "1px solid #2a2a3a", borderRadius: "12px", padding: "20px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "12px" }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
              <path d="M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
            <span style={{ color: "#94a3b8", fontSize: "13px", fontWeight: 500 }}>Interactions</span>
          </div>
          <div style={{ fontSize: "32px", fontWeight: 700, color: "#fff" }}>{totalInteractions}</div>
          <div style={{ color: "#94a3b8", fontSize: "12px", marginTop: "4px" }}>showings + contacts + shares</div>
        </div>
      </div>

      {/* Views Over Time Chart */}
      <div style={{ background: "#161620", border: "1px solid #2a2a3a", borderRadius: "12px", padding: "24px", marginBottom: "32px" }}>
        <h2 style={{ fontSize: "18px", fontWeight: 600, color: "#fff", marginBottom: "20px", marginTop: 0 }}>Views Over Time (Last 30 Days)</h2>
        <div style={{ position: "relative" }}>
          <div style={{ display: "flex", alignItems: "flex-end", gap: "3px", height: "180px" }}>
            {dailyCounts.map((d) => {
              const height = maxDaily > 0 ? (d.count / maxDaily) * 160 : 0;
              const isHovered = hoveredBar?.date === d.date;
              return (
                <div
                  key={d.date}
                  style={{
                    flex: 1,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "flex-end",
                    height: "100%",
                    position: "relative",
                    cursor: "pointer",
                  }}
                  onMouseEnter={() => setHoveredBar(d)}
                  onMouseLeave={() => setHoveredBar(null)}
                >
                  {isHovered && (
                    <div style={{
                      position: "absolute",
                      top: "-8px",
                      background: "#0a0a0f",
                      border: "1px solid #c9a962",
                      borderRadius: "6px",
                      padding: "4px 8px",
                      fontSize: "11px",
                      color: "#fff",
                      whiteSpace: "nowrap",
                      zIndex: 10,
                      transform: "translateY(-100%)",
                    }}>
                      {formatShortDate(d.date)}: {d.count} views
                    </div>
                  )}
                  <div
                    style={{
                      width: "100%",
                      height: `${Math.max(height, d.count > 0 ? 4 : 0)}px`,
                      background: isHovered
                        ? "linear-gradient(to top, #c9a962, #d4b872)"
                        : "linear-gradient(to top, #c9a962, rgba(201,169,98,0.6))",
                      borderRadius: "3px 3px 0 0",
                      transition: "all 0.15s ease",
                      opacity: isHovered ? 1 : 0.85,
                    }}
                  />
                </div>
              );
            })}
          </div>
          {/* X-axis labels (every 5 days) */}
          <div style={{ display: "flex", justifyContent: "space-between", marginTop: "8px" }}>
            {dailyCounts.filter((_, i) => i % 5 === 0).map((d) => (
              <span key={d.date} style={{ fontSize: "10px", color: "#94a3b8" }}>{formatShortDate(d.date)}</span>
            ))}
          </div>
        </div>
      </div>

      {/* Property-by-Property Table */}
      <div style={{ background: "#161620", border: "1px solid #2a2a3a", borderRadius: "12px", overflow: "hidden" }}>
        <div style={{ padding: "20px 24px 16px" }}>
          <h2 style={{ fontSize: "18px", fontWeight: 600, color: "#fff", margin: 0 }}>Property Breakdown</h2>
        </div>

        {/* Table Header */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "48px 1fr 80px 60px 60px 70px 80px 80px",
          gap: "0",
          padding: "10px 24px",
          borderTop: "1px solid #2a2a3a",
          borderBottom: "1px solid #2a2a3a",
          background: "#0a0a0f",
        }}>
          <span style={{ fontSize: "11px", fontWeight: 600, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.05em" }}></span>
          <span style={{ fontSize: "11px", fontWeight: 600, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.05em" }}>Property</span>
          <span style={{ fontSize: "11px", fontWeight: 600, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.05em", textAlign: "right" }}>Views</span>
          <span style={{ fontSize: "11px", fontWeight: 600, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.05em", textAlign: "right" }}>Saves</span>
          <span style={{ fontSize: "11px", fontWeight: 600, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.05em", textAlign: "right" }}>Shares</span>
          <span style={{ fontSize: "11px", fontWeight: 600, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.05em", textAlign: "right" }}>Contacts</span>
          <span style={{ fontSize: "11px", fontWeight: 600, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.05em", textAlign: "right" }}>DOM</span>
          <span style={{ fontSize: "11px", fontWeight: 600, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.05em", textAlign: "right" }}>Status</span>
        </div>

        {/* Table Rows */}
        {propertyStats.map((stat) => {
          const isExpanded = expandedRow === stat.property.id;
          const barWidth = (stat.views / maxViews) * 100;
          return (
            <div key={stat.property.id}>
              <div
                onClick={() => setExpandedRow(isExpanded ? null : stat.property.id)}
                style={{
                  display: "grid",
                  gridTemplateColumns: "48px 1fr 80px 60px 60px 70px 80px 80px",
                  gap: "0",
                  padding: "14px 24px",
                  borderBottom: "1px solid #2a2a3a",
                  cursor: "pointer",
                  transition: "background 0.15s ease",
                  background: isExpanded ? "#1c1c2e" : "transparent",
                }}
                onMouseEnter={(e) => { if (!isExpanded) e.currentTarget.style.background = "#1c1c2e"; }}
                onMouseLeave={(e) => { if (!isExpanded) e.currentTarget.style.background = "transparent"; }}
              >
                {/* Photo */}
                <div style={{ width: "36px", height: "36px", borderRadius: "6px", overflow: "hidden", background: "#2a2a3a", flexShrink: 0 }}>
                  {stat.property.photos?.[0] && (
                    <img
                      src={stat.property.photos[0]}
                      alt=""
                      style={{ width: "100%", height: "100%", objectFit: "cover" }}
                    />
                  )}
                </div>

                {/* Property info + bar */}
                <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", gap: "4px", minWidth: 0 }}>
                  <div style={{ fontSize: "13px", fontWeight: 500, color: "#fff", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                    {stat.property.address}
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <span style={{ fontSize: "11px", color: "#94a3b8" }}>{stat.property.city}, {stat.property.state}</span>
                    <span style={{ fontSize: "11px", color: "#c9a962", fontWeight: 600 }}>{formatPrice(stat.property.price)}</span>
                  </div>
                  {/* Inline bar */}
                  <div style={{ height: "3px", background: "#2a2a3a", borderRadius: "2px", width: "100%", maxWidth: "200px" }}>
                    <div style={{ height: "100%", width: `${barWidth}%`, background: "#c9a962", borderRadius: "2px", transition: "width 0.3s ease" }} />
                  </div>
                </div>

                {/* Stats */}
                <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", fontSize: "14px", fontWeight: 600, color: "#fff" }}>
                  {stat.views}
                </div>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", fontSize: "14px", color: "#94a3b8" }}>
                  {stat.saves}
                </div>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", fontSize: "14px", color: "#94a3b8" }}>
                  {stat.shares}
                </div>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", fontSize: "14px", color: "#94a3b8" }}>
                  {stat.contacts}
                </div>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", fontSize: "14px", color: "#94a3b8" }}>
                  {stat.property.days_on_market}d
                </div>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end" }}>
                  <span style={{
                    fontSize: "11px",
                    fontWeight: 600,
                    padding: "3px 8px",
                    borderRadius: "9999px",
                    textTransform: "capitalize",
                    background: stat.property.status === "active" ? "rgba(59,130,246,0.15)" : stat.property.status === "pending" ? "rgba(34,197,94,0.15)" : "rgba(148,163,184,0.15)",
                    color: stat.property.status === "active" ? "#3b82f6" : stat.property.status === "pending" ? "#22c55e" : "#94a3b8",
                  }}>
                    {stat.property.status}
                  </span>
                </div>
              </div>

              {/* Expanded daily breakdown */}
              {isExpanded && (
                <div style={{ padding: "16px 24px 20px", background: "#1c1c2e", borderBottom: "1px solid #2a2a3a" }}>
                  <div style={{ fontSize: "12px", fontWeight: 600, color: "#94a3b8", marginBottom: "12px" }}>Daily Views (Last 14 Days)</div>
                  <div style={{ display: "flex", alignItems: "flex-end", gap: "4px", height: "80px" }}>
                    {getPropertyDailyViews(stat.property.id).map((d) => {
                      const propMax = Math.max(...getPropertyDailyViews(stat.property.id).map((x) => x.count), 1);
                      const h = (d.count / propMax) * 60;
                      return (
                        <div key={d.date} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "flex-end", height: "100%" }}>
                          <div style={{ fontSize: "9px", color: "#94a3b8", marginBottom: "2px" }}>{d.count > 0 ? d.count : ""}</div>
                          <div style={{
                            width: "100%",
                            height: `${Math.max(h, d.count > 0 ? 4 : 0)}px`,
                            background: "#c9a962",
                            borderRadius: "2px 2px 0 0",
                          }} />
                          <div style={{ fontSize: "9px", color: "#94a3b8", marginTop: "4px" }}>{formatShortDate(d.date)}</div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
