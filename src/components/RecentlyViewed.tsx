"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase";

interface RecentEntry {
  id: string;
  timestamp: number;
}

interface PropertyInfo {
  id: string;
  price: number;
  address: string;
  city: string;
  state: string;
  photos: string[];
}

export default function RecentlyViewed() {
  const [properties, setProperties] = useState<PropertyInfo[]>([]);

  useEffect(() => {
    const stored: RecentEntry[] = JSON.parse(
      localStorage.getItem("onemls_recently_viewed") || "[]"
    );
    if (stored.length === 0) return;

    const ids = stored.map((e) => e.id);
    const supabase = createClient();
    supabase
      .from("properties")
      .select("id, price, address, city, state, photos")
      .in("id", ids)
      .then(({ data }) => {
        if (!data) return;
        // Preserve the order from localStorage (most recent first)
        const map = new Map(data.map((p) => [p.id, p as PropertyInfo]));
        const ordered = ids
          .map((id) => map.get(id))
          .filter(Boolean) as PropertyInfo[];
        setProperties(ordered);
      });
  }, []);

  if (properties.length === 0) return null;

  const formatPrice = (price: number) =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0,
    }).format(price);

  return (
    <div>
      <h3 className="text-white text-sm font-semibold mb-3 flex items-center gap-2">
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="#c9a962"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="12" cy="12" r="10" />
          <polyline points="12 6 12 12 16 14" />
        </svg>
        Recently Viewed
      </h3>
      <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-thin">
        {properties.map((p) => (
          <Link
            key={p.id}
            href={`/property/${p.id}`}
            className="flex-shrink-0 w-44 rounded-lg border border-[#2a2a3a] bg-[#161620] overflow-hidden hover:border-[#c9a962]/50 transition-colors group"
          >
            <div className="relative h-24 bg-[#1c1c2e]">
              {p.photos?.[0] ? (
                <img
                  src={p.photos[0]}
                  alt={p.address}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-[#2a2a3a]">
                  <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                  >
                    <rect x="3" y="3" width="18" height="18" rx="2" />
                    <circle cx="8.5" cy="8.5" r="1.5" />
                    <path d="M21 15l-5-5L5 21" />
                  </svg>
                </div>
              )}
            </div>
            <div className="p-2">
              <p className="text-[#c9a962] text-sm font-semibold">
                {formatPrice(p.price)}
              </p>
              <p className="text-[#94a3b8] text-xs truncate">
                {p.address}, {p.city}, {p.state}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
