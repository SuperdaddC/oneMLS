"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { createClient } from "@/lib/supabase";
import type { Property as DbProperty, Showing } from "@/lib/types";

// --- Types ---
interface StatCard {
  front: { label: string; value: string | number; subtitle: string; color: string };
  back: { label: string; value: string | number; subtitle: string; color: string };
}

const filterOptions = ["All", "Active", "Pending", "Sold", "Withdrawn", "Cancelled", "Draft"];

// --- Icons ---
const HouseIcon = () => (
  <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="48" height="48" rx="8" fill="#1e293b" />
    <path d="M14 26L24 16L34 26V36H28V30H20V36H14V26Z" stroke="#64748b" strokeWidth="2" strokeLinejoin="round" />
  </svg>
);

const PhoneIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M3 2H6L7.5 5.5L5.5 7C6.571 9.136 8.364 10.929 10.5 12L12 10L15.5 11.5V14.5C15.5 15.052 15.052 15.5 14.5 15.5C7.044 15.044 1 8.956 1 1.5C1 0.948 1.448 0.5 2 0.5H3V2Z"
      stroke="currentColor"
      strokeWidth="1.2"
      strokeLinejoin="round"
    />
  </svg>
);

const LinkIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M6.5 9.5L9.5 6.5M7 4L8.5 2.5C9.881 1.119 12.119 1.119 13.5 2.5C14.881 3.881 14.881 6.119 13.5 7.5L12 9M4 7L2.5 8.5C1.119 9.881 1.119 12.119 2.5 13.5C3.881 14.881 6.119 14.881 7.5 13.5L9 12"
      stroke="currentColor"
      strokeWidth="1.2"
      strokeLinecap="round"
    />
  </svg>
);

// --- Components ---

function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center py-20">
      <div className="w-10 h-10 border-4 border-gray-600 border-t-blue-500 rounded-full animate-spin" />
    </div>
  );
}

function FlipCard({ card }: { card: StatCard }) {
  const [flipped, setFlipped] = useState(false);
  const data = flipped ? card.back : card.front;

  return (
    <button
      onClick={() => setFlipped(!flipped)}
      className="bg-[#1e293b] rounded-xl p-5 text-left hover:bg-[#253348] transition-all duration-300 cursor-pointer w-full border border-gray-700/50"
    >
      <div className="flex items-start justify-between mb-3">
        <div className={`w-10 h-10 rounded-lg ${data.color} flex items-center justify-center text-white font-bold text-sm`}>
          {flipped ? "B" : "F"}
        </div>
        <span className="text-gray-500 text-xs">{"\u21BB"} Click to flip</span>
      </div>
      <div className="text-3xl font-bold text-white mb-1">{data.value}</div>
      <div className="text-sm font-medium text-gray-300 mb-1">{data.label}</div>
      <div className="text-xs text-gray-500">{data.subtitle}</div>
    </button>
  );
}

function StatusBadge({ status }: { status: DbProperty["status"] }) {
  const colors: Record<string, string> = {
    active: "bg-green-500/20 text-green-400 border-green-500/30",
    pending: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
    sold: "bg-blue-500/20 text-blue-400 border-blue-500/30",
    withdrawn: "bg-gray-500/20 text-gray-400 border-gray-500/30",
    cancelled: "bg-red-500/20 text-red-400 border-red-500/30",
    draft: "bg-gray-500/20 text-gray-400 border-gray-500/30",
  };

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border uppercase ${colors[status] ?? colors.draft}`}>
      {status}
    </span>
  );
}

function formatPrice(price: number): string {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(price);
}

function formatSqft(sqft: number): string {
  return new Intl.NumberFormat("en-US").format(sqft);
}

function PropertyCard({ property }: { property: DbProperty }) {
  return (
    <div className="bg-[#1e293b] rounded-xl overflow-hidden border border-gray-700/50 hover:border-gray-600 transition-colors">
      {/* Image */}
      <div className="relative h-44 bg-[#0f172a] flex items-center justify-center">
        {property.photos?.[0] ? (
          <Image
            src={property.photos[0]}
            alt={property.address}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover"
          />
        ) : (
          <HouseIcon />
        )}
        {/* Status badge */}
        <div className="absolute top-3 left-3">
          <StatusBadge status={property.status} />
        </div>
        {/* Icons top right */}
        <div className="absolute top-3 right-3 flex gap-2">
          <button className="p-1.5 rounded-lg bg-black/40 hover:bg-black/60 text-gray-300 hover:text-white transition-colors">
            <PhoneIcon />
          </button>
          <button className="p-1.5 rounded-lg bg-black/40 hover:bg-black/60 text-gray-300 hover:text-white transition-colors">
            <LinkIcon />
          </button>
        </div>
      </div>

      {/* Card content */}
      <div className="p-4">
        <h3 className="text-white font-semibold text-base mb-1">{property.address}</h3>
        <p className="text-gray-400 text-sm mb-2">
          {property.city}, {property.state}
        </p>
        <p className="text-white font-bold text-xl mb-3">{formatPrice(property.price)}</p>

        {/* Stats row */}
        <div className="flex items-center gap-4 text-sm text-gray-400 mb-4">
          <span>{property.bedrooms} beds</span>
          <span className="text-gray-600">|</span>
          <span>{property.bathrooms} baths</span>
          <span className="text-gray-600">|</span>
          <span>{formatSqft(property.sqft)} sq ft</span>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-3">
          <Link href={`/my-listings/${property.id}`} className="text-blue-400 hover:text-blue-300 text-sm font-medium transition-colors">
            View Details
          </Link>
          <button className="ml-auto px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium rounded-lg transition-colors">
            Schedule Showing
          </button>
        </div>
      </div>
    </div>
  );
}

function SettingsPanel({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const [activeTheme, setActiveTheme] = useState(1);
  const [mode, setMode] = useState<"light" | "dark">("dark");

  if (!isOpen) return null;

  return (
    <div className="absolute top-16 right-6 z-50 w-72 bg-[#1e293b] rounded-xl border border-gray-700/50 shadow-2xl p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-white font-semibold text-sm">Settings</h3>
        <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M4 4L12 12M12 4L4 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        </button>
      </div>

      {/* Color Theme */}
      <div className="mb-5">
        <p className="text-gray-400 text-xs font-medium uppercase tracking-wider mb-3">Color Theme</p>
        <div className="flex gap-2">
          {[1, 2, 3].map((theme) => (
            <button
              key={theme}
              onClick={() => setActiveTheme(theme)}
              className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-colors ${
                activeTheme === theme
                  ? "bg-blue-600 text-white"
                  : "bg-[#0f172a] text-gray-400 hover:text-white hover:bg-[#162032]"
              }`}
            >
              Theme {theme}
            </button>
          ))}
        </div>
      </div>

      {/* Mode */}
      <div>
        <p className="text-gray-400 text-xs font-medium uppercase tracking-wider mb-3">Mode</p>
        <div className="flex gap-2">
          {(["light", "dark"] as const).map((m) => (
            <button
              key={m}
              onClick={() => setMode(m)}
              className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium capitalize transition-colors ${
                mode === m
                  ? "bg-blue-600 text-white"
                  : "bg-[#0f172a] text-gray-400 hover:text-white hover:bg-[#162032]"
              }`}
            >
              {m}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// --- Page ---

export default function DashboardPage() {
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [filter, setFilter] = useState("All");
  const [loading, setLoading] = useState(true);
  const [properties, setProperties] = useState<DbProperty[]>([]);
  const [showings, setShowings] = useState<Showing[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    async function fetchData() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setLoading(false);
        return;
      }

      const [propertiesRes, showingsRes, messagesRes] = await Promise.all([
        supabase.from("properties").select("*").eq("owner_id", user.id),
        supabase
          .from("showings")
          .select("*")
          .or(`requesting_agent_id.eq.${user.id},listing_agent_id.eq.${user.id}`),
        supabase
          .from("messages")
          .select("id", { count: "exact" })
          .eq("recipient_id", user.id)
          .eq("read", false),
      ]);

      setProperties(propertiesRes.data ?? []);
      setShowings(showingsRes.data ?? []);
      setUnreadCount(messagesRes.count ?? 0);
      setLoading(false);
    }

    fetchData();
  }, []);

  // Compute stat card values from real data
  const statCards: StatCard[] = useMemo(() => {
    const today = new Date().toISOString().split("T")[0];

    const activeCount = properties.filter((p) => p.status === "active").length;
    const pendingCount = properties.filter((p) => p.status === "pending").length;
    const soldCount = properties.filter((p) => p.status === "sold").length;
    const cancelledCount = properties.filter((p) => p.status === "cancelled").length;

    const upcomingShowings = showings.filter(
      (s) => (s.status === "pending" || s.status === "approved") && s.requested_date >= today
    );
    const pastShowings = showings.filter(
      (s) => s.status === "completed" || s.requested_date < today
    );

    const activeProperties = properties.filter((p) => p.status === "active");
    const avgDom =
      activeProperties.length > 0
        ? Math.round(activeProperties.reduce((sum, p) => sum + (p.days_on_market ?? 0), 0) / activeProperties.length)
        : 0;

    return [
      {
        front: { label: "Active Listings", value: activeCount, subtitle: "Currently for sale", color: "bg-blue-500" },
        back: { label: "Closed Listings", value: soldCount, subtitle: "Total sold", color: "bg-green-500" },
      },
      {
        front: { label: "Pending Listings", value: pendingCount, subtitle: "Under contract", color: "bg-yellow-500" },
        back: { label: "Cancelled", value: cancelledCount, subtitle: "Withdrawn/expired", color: "bg-red-500" },
      },
      {
        front: {
          label: "Upcoming Showings",
          value: upcomingShowings.length,
          subtitle: upcomingShowings.length > 0 ? `Next: ${upcomingShowings[0].requested_date}` : "None scheduled",
          color: "bg-purple-500",
        },
        back: { label: "Past Showings", value: pastShowings.length, subtitle: "Completed", color: "bg-indigo-500" },
      },
      {
        front: { label: "Avg. Days on Market", value: avgDom, subtitle: activeProperties.length > 0 ? "Across active listings" : "No active listings", color: "bg-teal-500" },
        back: { label: "Price Reductions", value: 0, subtitle: "Coming soon", color: "bg-orange-500" },
      },
    ];
  }, [properties, showings]);

  const filteredProperties = useMemo(() => {
    if (filter === "All") return properties;
    return properties.filter((p) => p.status.toLowerCase() === filter.toLowerCase());
  }, [properties, filter]);

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="relative">
      {/* Settings panel (anchored to top-right) */}
      <SettingsPanel isOpen={settingsOpen} onClose={() => setSettingsOpen(false)} />

      {/* Stats cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {statCards.map((card, i) => (
          <FlipCard key={i} card={card} />
        ))}
      </div>

      {/* My Properties section */}
      <div>
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <h2 className="text-xl font-bold text-white">My Properties</h2>
          <div className="flex items-center gap-3">
            {/* Filter dropdown */}
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="bg-[#1e293b] border border-gray-700/50 text-gray-300 text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-blue-500 transition-colors"
            >
              {filterOptions.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>

            {/* Add Property button */}
            <Link
              href="/my-listings/create"
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium rounded-lg transition-colors"
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M8 3V13M3 8H13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
              Add Property
            </Link>
          </div>
        </div>

        {/* Property cards grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProperties.map((property) => (
            <PropertyCard key={property.id} property={property} />
          ))}

          {filteredProperties.length === 0 && (
            <div className="col-span-full flex flex-col items-center justify-center py-12 text-gray-500">
              <HouseIcon />
              <p className="mt-4 text-sm">No properties found. Add your first listing to get started.</p>
            </div>
          )}

          {/* Add New Property card */}
          <Link
            href="/my-listings/create"
            className="flex flex-col items-center justify-center min-h-[320px] rounded-xl border-2 border-dashed border-gray-700 hover:border-gray-500 bg-transparent hover:bg-[#1e293b]/30 transition-all cursor-pointer"
          >
            <div className="w-14 h-14 rounded-full bg-[#1e293b] flex items-center justify-center mb-3">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path d="M12 5V19M5 12H19" stroke="#64748b" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </div>
            <span className="text-gray-500 font-medium text-sm">Add New Property</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
