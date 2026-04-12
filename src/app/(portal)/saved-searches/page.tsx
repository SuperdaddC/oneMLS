"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase";
import type { SavedSearch } from "@/lib/types";

const FREQUENCY_LABELS: Record<string, string> = {
  instant: "Instant",
  daily: "Daily",
  weekly: "Weekly",
  never: "Never",
};

const FREQUENCY_COLORS: Record<string, string> = {
  instant: "bg-green-900/40 text-green-300 border-green-700",
  daily: "bg-blue-900/40 text-blue-300 border-blue-700",
  weekly: "bg-purple-900/40 text-purple-300 border-purple-700",
  never: "bg-[#2a2a3a] text-[#94a3b8] border-[#2a2a3a]",
};

function formatCriteria(criteria: Record<string, unknown>): string {
  const parts: string[] = [];
  if (criteria.q) parts.push(String(criteria.q));
  if (criteria.state) parts.push(String(criteria.state));
  const formatP = (v: string) => {
    const n = Number(v);
    return n >= 1000000 ? `$${n / 1000000}M` : `$${n / 1000}K`;
  };
  if (criteria.minPrice || criteria.maxPrice) {
    parts.push(
      `${criteria.minPrice ? formatP(String(criteria.minPrice)) : "$0"}-${criteria.maxPrice ? formatP(String(criteria.maxPrice)) : "Any"}`
    );
  }
  if (criteria.beds) parts.push(`${criteria.beds}+ beds`);
  if (criteria.baths) parts.push(`${criteria.baths}+ baths`);
  if (criteria.type) {
    parts.push(
      String(criteria.type)
        .split("_")
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
        .join(" ")
    );
  }
  return parts.length > 0 ? parts.join(" | ") : "All properties";
}

function criteriaToParams(criteria: Record<string, unknown>): string {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(criteria)) {
    if (value) params.set(key, String(value));
  }
  return params.toString();
}

export default function SavedSearchesPage() {
  const router = useRouter();
  const [searches, setSearches] = useState<SavedSearch[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fetchSearches = async () => {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { data } = await supabase
      .from("saved_searches")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });
    setSearches((data as SavedSearch[]) || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchSearches();
  }, []);

  const updateFrequency = async (id: string, frequency: string) => {
    const supabase = createClient();
    await supabase
      .from("saved_searches")
      .update({ notification_frequency: frequency })
      .eq("id", id);
    setSearches((prev) =>
      prev.map((s) =>
        s.id === id ? { ...s, notification_frequency: frequency as SavedSearch["notification_frequency"] } : s
      )
    );
    setEditingId(null);
  };

  const deleteSearch = async (id: string) => {
    const supabase = createClient();
    await supabase.from("saved_searches").delete().eq("id", id);
    setSearches((prev) => prev.filter((s) => s.id !== id));
    setDeletingId(null);
  };

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#c9a962"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.35-4.35" />
            <path d="M11 8l1.5 3 3.5.5-2.5 2.5.5 3.5L11 16l-3 1.5.5-3.5L6 11.5l3.5-.5z" />
          </svg>
          <h1 className="text-2xl font-bold text-white">Saved Searches</h1>
        </div>
        <p className="text-sm text-[#94a3b8]">
          Manage your saved property searches and alert preferences.
        </p>
      </div>

      {loading ? (
        <div className="text-center py-20 text-[#94a3b8]">Loading...</div>
      ) : searches.length === 0 ? (
        <div className="text-center py-20">
          <svg
            className="mx-auto w-16 h-16 text-[#2a2a3a] mb-4"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            viewBox="0 0 24 24"
          >
            <path d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
          </svg>
          <p className="text-[#94a3b8] text-lg mb-2">No saved searches</p>
          <p className="text-[#94a3b8]/60 text-sm mb-6">
            Save a search from the property search page to get alerts on new listings.
          </p>
          <button
            onClick={() => router.push("/search")}
            className="px-6 py-2.5 bg-[#c9a962] hover:bg-[#d4b872] text-[#0a0a0f] font-semibold rounded-lg text-sm transition-colors"
          >
            Go to Search
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {searches.map((search) => (
            <div
              key={search.id}
              className="rounded-xl border border-[#2a2a3a] bg-[#161620] p-5 hover:border-[#c9a962]/30 transition-colors"
            >
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-1">
                    <h3 className="text-white font-semibold truncate">{search.name}</h3>
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${FREQUENCY_COLORS[search.notification_frequency]}`}
                    >
                      {FREQUENCY_LABELS[search.notification_frequency]}
                    </span>
                  </div>
                  <p className="text-sm text-[#94a3b8] truncate">
                    {formatCriteria(search.criteria)}
                  </p>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <button
                    onClick={() =>
                      router.push(`/search?${criteriaToParams(search.criteria)}`)
                    }
                    className="px-4 py-2 bg-[#c9a962] hover:bg-[#d4b872] text-[#0a0a0f] font-semibold rounded-lg text-sm transition-colors"
                  >
                    Run Search
                  </button>
                  <div className="relative">
                    <button
                      onClick={() =>
                        setEditingId(editingId === search.id ? null : search.id)
                      }
                      className="px-3 py-2 bg-[#161620] border border-[#2a2a3a] text-[#94a3b8] rounded-lg text-sm hover:border-[#94a3b8] transition-colors"
                    >
                      Edit Alerts
                    </button>
                    {editingId === search.id && (
                      <div className="absolute right-0 top-full mt-2 z-50 w-48 rounded-xl bg-[#1c1c2e] border border-[#2a2a3a] p-3 shadow-xl">
                        {(["instant", "daily", "weekly", "never"] as const).map((freq) => (
                          <button
                            key={freq}
                            onClick={() => updateFrequency(search.id, freq)}
                            className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                              search.notification_frequency === freq
                                ? "bg-[#c9a962]/20 text-[#c9a962]"
                                : "text-white hover:bg-[#161620]"
                            }`}
                          >
                            {FREQUENCY_LABELS[freq]}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="relative">
                    <button
                      onClick={() =>
                        setDeletingId(deletingId === search.id ? null : search.id)
                      }
                      className="px-3 py-2 bg-[#161620] border border-[#2a2a3a] text-red-400 rounded-lg text-sm hover:border-red-400 transition-colors"
                    >
                      Delete
                    </button>
                    {deletingId === search.id && (
                      <div className="absolute right-0 top-full mt-2 z-50 w-56 rounded-xl bg-[#1c1c2e] border border-[#2a2a3a] p-4 shadow-xl">
                        <p className="text-sm text-white mb-3">Delete this saved search?</p>
                        <div className="flex gap-2">
                          <button
                            onClick={() => deleteSearch(search.id)}
                            className="flex-1 px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm transition-colors"
                          >
                            Delete
                          </button>
                          <button
                            onClick={() => setDeletingId(null)}
                            className="flex-1 px-3 py-1.5 bg-[#161620] border border-[#2a2a3a] text-[#94a3b8] rounded-lg text-sm transition-colors"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
