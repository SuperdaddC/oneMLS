"use client";

import { useEffect, useState, useCallback } from "react";
import { createClient } from "@/lib/supabase";
import PropertyCard from "@/components/PropertyCard";
import type { Property, Profile } from "@/lib/types";

type SortOption = "date_desc" | "price_asc" | "price_desc";

interface SavedListing {
  id: string;
  created_at: string;
  property: Property & { owner?: Profile };
}

export default function SavedListingsPage() {
  const [listings, setListings] = useState<SavedListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [sort, setSort] = useState<SortOption>("date_desc");
  const [removingId, setRemovingId] = useState<string | null>(null);

  const fetchSaved = useCallback(async () => {
    const supabase = createClient();
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) {
      setLoading(false);
      return;
    }

    const { data } = await supabase
      .from("saved_listings")
      .select(
        "*, property:properties(*, owner:profiles!owner_id(first_name, last_name, phone, email, brokerage_name, avatar_url))"
      )
      .eq("user_id", userData.user.id)
      .order("created_at", { ascending: false });

    if (data) {
      setListings(data as unknown as SavedListing[]);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchSaved();
  }, [fetchSaved]);

  // Listen for unsave events to remove from grid
  useEffect(() => {
    const supabase = createClient();
    const channel = supabase
      .channel("saved_listings_changes")
      .on(
        "postgres_changes",
        { event: "DELETE", schema: "public", table: "saved_listings" },
        (payload) => {
          const deletedId = payload.old?.id;
          if (deletedId) {
            setRemovingId(deletedId);
            setTimeout(() => {
              setListings((prev) => prev.filter((l) => l.id !== deletedId));
              setRemovingId(null);
            }, 300);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const sorted = [...listings].sort((a, b) => {
    switch (sort) {
      case "price_asc":
        return a.property.price - b.property.price;
      case "price_desc":
        return b.property.price - a.property.price;
      case "date_desc":
      default:
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    }
  });

  return (
    <div>
      {/* Header */}
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <svg
            width="28"
            height="28"
            viewBox="0 0 24 24"
            fill="#ef4444"
            stroke="#ef4444"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
          </svg>
          <h1 className="text-2xl font-bold text-white">
            Saved Listings
            {!loading && listings.length > 0 && (
              <span className="ml-2 text-base font-normal text-[#94a3b8]">
                ({listings.length})
              </span>
            )}
          </h1>
        </div>

        {listings.length > 1 && (
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as SortOption)}
            className="rounded-lg border border-[#2a2a3a] bg-[#161620] px-4 py-2 text-sm text-white outline-none focus:border-[#c9a962]"
          >
            <option value="date_desc">Date Saved (Newest)</option>
            <option value="price_asc">Price (Low-High)</option>
            <option value="price_desc">Price (High-Low)</option>
          </select>
        )}
      </div>

      {/* Loading */}
      {loading && (
        <div className="flex items-center justify-center py-20">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#2a2a3a] border-t-[#c9a962]" />
        </div>
      )}

      {/* Empty state */}
      {!loading && listings.length === 0 && (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-[#2a2a3a] bg-[#161620] py-20">
          <svg
            width="48"
            height="48"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#94a3b8"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="mb-4 opacity-50"
          >
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
          </svg>
          <h2 className="mb-2 text-lg font-semibold text-white">No saved listings yet</h2>
          <p className="mb-6 text-sm text-[#94a3b8]">
            Browse properties to find your favorites
          </p>
          <a
            href="/search"
            className="rounded-lg bg-[#c9a962] px-6 py-2.5 text-sm font-semibold text-[#0a0a0f] transition-colors hover:bg-[#d4b872]"
          >
            Search Properties
          </a>
        </div>
      )}

      {/* Grid */}
      {!loading && listings.length > 0 && (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {sorted.map((item) => (
            <div
              key={item.id}
              style={{
                transition: "opacity 0.3s ease, transform 0.3s ease",
                opacity: removingId === item.id ? 0 : 1,
                transform: removingId === item.id ? "scale(0.95)" : "scale(1)",
              }}
            >
              <PropertyCard property={item.property} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
