"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState, useCallback, useMemo, Suspense } from "react";
import dynamic from "next/dynamic";
import PropertyCard from "@/components/PropertyCard";
import type { Property, Profile } from "@/lib/types";

/* ---------- types ---------- */
type PropertyWithOwner = Property & { owner?: Profile };

interface Filters {
  query?: string;
  minPrice?: number;
  maxPrice?: number;
  beds?: number;
  baths?: number;
  propertyType?: string;
  sort?: string;
  page?: number;
  limit?: number;
}

interface SearchClientProps {
  initialProperties: PropertyWithOwner[];
  initialTotal: number;
  initialFilters: Filters;
}

/* ---------- state name → code mapping ---------- */
const STATE_NAME_TO_CODE: Record<string, string> = {
  alabama: "AL", alaska: "AK", arizona: "AZ", arkansas: "AR", california: "CA",
  colorado: "CO", connecticut: "CT", delaware: "DE", florida: "FL", georgia: "GA",
  hawaii: "HI", idaho: "ID", illinois: "IL", indiana: "IN", iowa: "IA",
  kansas: "KS", kentucky: "KY", louisiana: "LA", maine: "ME", maryland: "MD",
  massachusetts: "MA", michigan: "MI", minnesota: "MN", mississippi: "MS", missouri: "MO",
  montana: "MT", nebraska: "NE", nevada: "NV", "new hampshire": "NH", "new jersey": "NJ",
  "new mexico": "NM", "new york": "NY", "north carolina": "NC", "north dakota": "ND", ohio: "OH",
  oklahoma: "OK", oregon: "OR", pennsylvania: "PA", "rhode island": "RI", "south carolina": "SC",
  "south dakota": "SD", tennessee: "TN", texas: "TX", utah: "UT", vermont: "VT",
  virginia: "VA", washington: "WA", "west virginia": "WV", wisconsin: "WI", wyoming: "WY",
  "district of columbia": "DC",
};
const VALID_STATE_CODES = new Set(Object.values(STATE_NAME_TO_CODE));

/** Return 2-letter state code if input matches a state name or code, else undefined */
function resolveStateCode(input: string): string | undefined {
  const trimmed = input.trim();
  const upper = trimmed.toUpperCase();
  if (VALID_STATE_CODES.has(upper)) return upper;
  return STATE_NAME_TO_CODE[trimmed.toLowerCase()];
}

/* ---------- constants ---------- */
const PRICE_PRESETS = [
  { label: "Any", value: "" },
  { label: "$100K", value: "100000" },
  { label: "$200K", value: "200000" },
  { label: "$300K", value: "300000" },
  { label: "$500K", value: "500000" },
  { label: "$750K", value: "750000" },
  { label: "$1M", value: "1000000" },
  { label: "$2M", value: "2000000" },
  { label: "$3M", value: "3000000" },
  { label: "$5M+", value: "5000000" },
];

const BED_OPTIONS = ["Any", "1+", "2+", "3+", "4+", "5+"];
const BATH_OPTIONS = ["Any", "1+", "2+", "3+"];

const PROPERTY_TYPES = [
  { label: "Any", value: "" },
  { label: "Single Family", value: "single_family" },
  { label: "Condo", value: "condo" },
  { label: "Townhouse", value: "townhouse" },
  { label: "Multi-Family", value: "multi_family" },
  { label: "Land", value: "land" },
  { label: "Commercial", value: "commercial" },
];

const SORT_OPTIONS = [
  { label: "Newest", value: "newest" },
  { label: "Price Low-High", value: "price_asc" },
  { label: "Price High-Low", value: "price_desc" },
  { label: "Oldest", value: "oldest" },
];

/* ---------- dynamic map (ssr:false) ---------- */
const SearchMap = dynamic(() => import("./SearchMap"), { ssr: false });

/* ---------- inner component (uses useSearchParams) ---------- */
function SearchClientInner({
  initialProperties,
  initialTotal,
  initialFilters,
}: SearchClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [mobileView, setMobileView] = useState<"list" | "map">("list");
  const [searchInput, setSearchInput] = useState("");

  /* derive current filter state from URL (or initial) */
  const query = searchParams.get("q") ?? initialFilters.query ?? "";
  const stateParam = searchParams.get("state") ?? "";
  const minPrice = searchParams.get("minPrice") ?? "";
  const maxPrice = searchParams.get("maxPrice") ?? "";
  const beds = searchParams.get("beds") ?? "";
  const baths = searchParams.get("baths") ?? "";
  const propertyType = searchParams.get("type") ?? "";
  const sort = searchParams.get("sort") ?? initialFilters.sort ?? "newest";
  const page = Number(searchParams.get("page") ?? initialFilters.page ?? 1);

  const totalPages = Math.ceil(initialTotal / 24);

  /* push new params to URL (triggers server re-fetch) */
  const pushFilters = useCallback(
    (overrides: Record<string, string>) => {
      const current = new URLSearchParams(searchParams.toString());
      for (const [k, v] of Object.entries(overrides)) {
        if (v) {
          current.set(k, v);
        } else {
          current.delete(k);
        }
      }
      // reset page when filters change (unless page itself is being set)
      if (!("page" in overrides)) {
        current.delete("page");
      }
      router.push(`/search?${current.toString()}`);
    },
    [router, searchParams],
  );

  /* helpers */
  const bedValue = (opt: string) => (opt === "Any" ? "" : opt.replace("+", ""));
  const bathValue = (opt: string) => (opt === "Any" ? "" : opt.replace("+", ""));

  const properties = initialProperties;
  const total = initialTotal;

  /* format price for markers */
  const markers = useMemo(
    () =>
      properties
        .filter((p) => p.lat && p.lng)
        .map((p) => ({
          id: p.id,
          lat: p.lat!,
          lng: p.lng!,
          price: p.price,
          address: p.address,
        })),
    [properties],
  );

  return (
    <div className="min-h-screen bg-[#0a0a0f]">
      {/* -------- FILTER BAR -------- */}
      <div className="bg-[#1c1c2e] border-b border-[#2a2a3a] px-4 py-3">
        <div className="max-w-[1800px] mx-auto space-y-3">
          {/* Row 1: Search input with button */}
          <div className="w-full">
            <div className="flex gap-2">
              <div className="relative flex-1">
                <svg
                  className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#94a3b8]"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                >
                  <circle cx="11" cy="11" r="8" />
                  <path d="m21 21-4.35-4.35" />
                </svg>
                <input
                  type="text"
                  placeholder="City, state, address, or MLS ID..."
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      const val = searchInput.trim();
                      if (!val) {
                        pushFilters({ q: "", state: "" });
                      } else {
                        const stateCode = resolveStateCode(val);
                        if (stateCode) {
                          pushFilters({ q: "", state: stateCode });
                        } else {
                          pushFilters({ q: val, state: "" });
                        }
                      }
                    }
                  }}
                  className="w-full pl-10 pr-3 py-2.5 bg-[#161620] border border-[#2a2a3a] rounded-lg text-white placeholder-[#94a3b8] text-sm focus:outline-none focus:border-[#c9a962]"
                />
              </div>
              <button
                onClick={() => {
                  const val = searchInput.trim();
                  if (!val) {
                    pushFilters({ q: "", state: "" });
                  } else {
                    const stateCode = resolveStateCode(val);
                    if (stateCode) {
                      pushFilters({ q: "", state: stateCode });
                    } else {
                      pushFilters({ q: val, state: "" });
                    }
                  }
                }}
                className="px-6 py-2.5 bg-[#c9a962] hover:bg-[#d4b872] text-[#0a0a0f] font-semibold rounded-lg text-sm transition-colors whitespace-nowrap"
              >
                Search
              </button>
              {(query || stateParam) && (
                <button
                  onClick={() => {
                    setSearchInput("");
                    pushFilters({ q: "", state: "" });
                  }}
                  className="px-4 py-2.5 bg-[#161620] border border-[#2a2a3a] hover:border-[#94a3b8] text-[#94a3b8] rounded-lg text-sm transition-colors whitespace-nowrap"
                >
                  Clear
                </button>
              )}
            </div>
            {stateParam && (
              <div className="mt-2 text-sm text-[#94a3b8]">
                Showing results for: <span className="text-[#c9a962] font-medium">{stateParam}</span>
              </div>
            )}
          </div>

          {/* Row 2: Filters */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-3 items-end">
            {/* Min Price */}
            <div>
              <label className="block text-xs text-[#94a3b8] mb-1">
                Min Price
              </label>
              <select
                value={minPrice}
                onChange={(e) => pushFilters({ minPrice: e.target.value })}
                className="w-full px-3 py-2 bg-[#161620] border border-[#2a2a3a] rounded-lg text-white text-sm focus:outline-none focus:border-[#c9a962] appearance-none cursor-pointer"
              >
                {PRICE_PRESETS.map((p) => (
                  <option key={`min-${p.value}`} value={p.value}>
                    {p.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Max Price */}
            <div>
              <label className="block text-xs text-[#94a3b8] mb-1">
                Max Price
              </label>
              <select
                value={maxPrice}
                onChange={(e) => pushFilters({ maxPrice: e.target.value })}
                className="w-full px-3 py-2 bg-[#161620] border border-[#2a2a3a] rounded-lg text-white text-sm focus:outline-none focus:border-[#c9a962] appearance-none cursor-pointer"
              >
                {PRICE_PRESETS.map((p) => (
                  <option key={`max-${p.value}`} value={p.value}>
                    {p.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Beds */}
            <div>
              <label className="block text-xs text-[#94a3b8] mb-1">Beds</label>
              <div className="flex gap-1">
                {BED_OPTIONS.map((opt) => (
                  <button
                    key={opt}
                    onClick={() => pushFilters({ beds: bedValue(opt) })}
                    className={`px-2.5 py-2 rounded-lg text-sm font-medium transition-colors ${
                      beds === bedValue(opt)
                        ? "bg-[#c9a962] text-[#0a0a0f]"
                        : "bg-[#161620] border border-[#2a2a3a] text-[#94a3b8] hover:border-[#c9a962]"
                    }`}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            </div>

            {/* Baths */}
            <div>
              <label className="block text-xs text-[#94a3b8] mb-1">Baths</label>
              <div className="flex gap-1">
                {BATH_OPTIONS.map((opt) => (
                  <button
                    key={opt}
                    onClick={() => pushFilters({ baths: bathValue(opt) })}
                    className={`px-2.5 py-2 rounded-lg text-sm font-medium transition-colors ${
                      baths === bathValue(opt)
                        ? "bg-[#c9a962] text-[#0a0a0f]"
                        : "bg-[#161620] border border-[#2a2a3a] text-[#94a3b8] hover:border-[#c9a962]"
                    }`}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            </div>

            {/* Property Type */}
            <div>
              <label className="block text-xs text-[#94a3b8] mb-1">Type</label>
              <select
                value={propertyType}
                onChange={(e) => pushFilters({ type: e.target.value })}
                className="w-full px-3 py-2 bg-[#161620] border border-[#2a2a3a] rounded-lg text-white text-sm focus:outline-none focus:border-[#c9a962] appearance-none cursor-pointer"
              >
                {PROPERTY_TYPES.map((t) => (
                  <option key={t.value} value={t.value}>
                    {t.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Sort */}
            <div>
              <label className="block text-xs text-[#94a3b8] mb-1">Sort</label>
              <select
                value={sort}
                onChange={(e) => pushFilters({ sort: e.target.value })}
                className="w-full px-3 py-2 bg-[#161620] border border-[#2a2a3a] rounded-lg text-white text-sm focus:outline-none focus:border-[#c9a962] appearance-none cursor-pointer"
              >
                {SORT_OPTIONS.map((s) => (
                  <option key={s.value} value={s.value}>
                    {s.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* -------- MAIN CONTENT -------- */}
      <div className="max-w-[1800px] mx-auto">
        <div className="flex flex-col lg:flex-row">
          {/* Results list (left) */}
          <div
            className={`w-full lg:w-[55%] p-4 ${
              mobileView === "map" ? "hidden lg:block" : ""
            }`}
          >
            {/* Results count */}
            <div className="mb-4">
              <h2 className="text-white text-lg font-semibold">
                {total.toLocaleString()} propert{total === 1 ? "y" : "ies"}{" "}
                found
              </h2>
            </div>

            {properties.length === 0 ? (
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
                <p className="text-[#94a3b8] text-lg mb-2">
                  No properties match your search
                </p>
                <p className="text-[#94a3b8]/60 text-sm">
                  Try adjusting your filters or searching a different area
                </p>
              </div>
            ) : (
              <>
                {/* Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {properties.map((property) => (
                    <PropertyCard key={property.id} property={property} />
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-center gap-4 mt-8 pb-4">
                    <button
                      disabled={page <= 1}
                      onClick={() =>
                        pushFilters({ page: String(page - 1) })
                      }
                      className="px-4 py-2 rounded-lg text-sm font-medium bg-[#161620] border border-[#2a2a3a] text-[#94a3b8] hover:border-[#c9a962] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                    >
                      Previous
                    </button>
                    <span className="text-[#94a3b8] text-sm">
                      Page {page} of {totalPages}
                    </span>
                    <button
                      disabled={page >= totalPages}
                      onClick={() =>
                        pushFilters({ page: String(page + 1) })
                      }
                      className="px-4 py-2 rounded-lg text-sm font-medium bg-[#161620] border border-[#2a2a3a] text-[#94a3b8] hover:border-[#c9a962] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                    >
                      Next
                    </button>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Map (right) */}
          <div
            className={`w-full lg:w-[45%] lg:sticky lg:top-0 lg:h-screen ${
              mobileView === "list" ? "hidden lg:block" : ""
            }`}
          >
            <div className="h-[calc(100vh-64px)] lg:h-full p-4 lg:pl-0">
              <div className="h-full rounded-xl border border-[#2a2a3a] overflow-hidden">
                <SearchMap markers={markers} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* -------- MOBILE TOGGLE -------- */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 lg:hidden z-50">
        <button
          onClick={() =>
            setMobileView((v) => (v === "list" ? "map" : "list"))
          }
          className="flex items-center gap-2 px-6 py-3 bg-[#c9a962] text-[#0a0a0f] font-semibold rounded-full shadow-lg shadow-black/40 hover:bg-[#d4b56e] transition-colors"
        >
          {mobileView === "list" ? (
            <>
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
              >
                <path d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l5.447 2.724A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
              </svg>
              Show Map
            </>
          ) : (
            <>
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
              >
                <path d="M4 6h16M4 12h16M4 18h16" />
              </svg>
              Show List
            </>
          )}
        </button>
      </div>
    </div>
  );
}

/* ---------- export with Suspense wrapper ---------- */
export default function SearchClient(props: SearchClientProps) {
  return (
    <Suspense
      fallback={
        <div className="p-12 text-center text-[#94a3b8]">Loading...</div>
      }
    >
      <SearchClientInner {...props} />
    </Suspense>
  );
}
