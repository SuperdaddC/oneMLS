import { createServerSupabaseClient } from "./supabase-server";
import type { Property, Profile } from "./types";

export async function getPropertyById(id: string) {
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase
    .from("properties")
    .select("*, owner:profiles!owner_id(*)")
    .eq("id", id)
    .single();
  if (error) return null;
  return data as Property & { owner: Profile };
}

export async function searchProperties(filters: {
  query?: string;
  minPrice?: number;
  maxPrice?: number;
  beds?: number;
  baths?: number;
  minSqft?: number;
  maxSqft?: number;
  propertyType?: string;
  state?: string;
  city?: string;
  minYear?: number;
  maxYear?: number;
  minLot?: number;
  openHouseOnly?: boolean;
  sort?: string;
  page?: number;
  limit?: number;
}) {
  const supabase = await createServerSupabaseClient();

  // If open house filter is active, fetch qualifying property IDs first
  let openHousePropertyIds: string[] | null = null;
  if (filters.openHouseOnly) {
    const { data: ohIds } = await supabase
      .from("open_houses")
      .select("property_id")
      .eq("status", "scheduled")
      .gte("event_date", new Date().toISOString().split("T")[0]);
    if (!ohIds || ohIds.length === 0) {
      return { properties: [], total: 0, error: null };
    }
    openHousePropertyIds = ohIds.map((o: { property_id: string }) => o.property_id);
  }

  let q = supabase
    .from("properties")
    .select("*, owner:profiles!owner_id(first_name, last_name, phone, email, brokerage_name, avatar_url)", { count: "exact" })
    .eq("status", "active");

  if (openHousePropertyIds) {
    q = q.in("id", openHousePropertyIds);
  }

  if (filters.query) {
    q = q.or(`address.ilike.%${filters.query}%,city.ilike.%${filters.query}%,zip.ilike.%${filters.query}%,mls_id.ilike.%${filters.query}%`);
  }
  if (filters.minPrice) q = q.gte("price", filters.minPrice);
  if (filters.maxPrice) q = q.lte("price", filters.maxPrice);
  if (filters.beds) q = q.gte("bedrooms", filters.beds);
  if (filters.baths) q = q.gte("bathrooms", filters.baths);
  if (filters.minSqft) q = q.gte("sqft", filters.minSqft);
  if (filters.maxSqft) q = q.lte("sqft", filters.maxSqft);
  if (filters.propertyType) q = q.eq("property_type", filters.propertyType);
  if (filters.state) q = q.eq("state", filters.state);
  if (filters.city) q = q.ilike("city", `%${filters.city}%`);
  if (filters.minYear) q = q.gte("year_built", filters.minYear);
  if (filters.maxYear) q = q.lte("year_built", filters.maxYear);
  if (filters.minLot) q = q.gte("lot_size", filters.minLot);

  // Sort
  const sortField = filters.sort === "price_asc" ? "price" : filters.sort === "price_desc" ? "price" : filters.sort === "newest" ? "listing_date" : "listing_date";
  const ascending = filters.sort === "price_asc" || filters.sort === "oldest";
  q = q.order(sortField, { ascending });

  // Pagination
  const page = filters.page || 1;
  const limit = filters.limit || 24;
  const from = (page - 1) * limit;
  q = q.range(from, from + limit - 1);

  const { data, error, count } = await q;
  return { properties: (data || []) as (Property & { owner: Profile })[], total: count || 0, error };
}

export async function getSimilarProperties(property: Property, limit = 3) {
  try {
    const supabase = await createServerSupabaseClient();
    const price = Number(property.price);
    const priceRange = price * 0.2;
    const selectFields = "*, owner:profiles!owner_id(first_name, last_name, phone, email, brokerage_name)";

    // Strategy 1: Same state + similar price (±20%)
    const { data: exact } = await supabase
      .from("properties")
      .select(selectFields)
      .eq("status", "active")
      .eq("state", property.state)
      .neq("id", property.id)
      .gte("price", price - priceRange)
      .lte("price", price + priceRange)
      .limit(limit);

    if (exact && exact.length >= limit) {
      return exact as (Property & { owner: Profile })[];
    }

    // Strategy 2: Same state, any price
    const { data: sameState } = await supabase
      .from("properties")
      .select(selectFields)
      .eq("status", "active")
      .eq("state", property.state)
      .neq("id", property.id)
      .limit(limit);

    if (sameState && sameState.length >= limit) {
      return sameState as (Property & { owner: Profile })[];
    }

    // Strategy 3: Similar price nationally (±30%)
    const widerRange = price * 0.3;
    const { data: national } = await supabase
      .from("properties")
      .select(selectFields)
      .eq("status", "active")
      .neq("id", property.id)
      .gte("price", price - widerRange)
      .lte("price", price + widerRange)
      .limit(limit);

    if (national && national.length > 0) {
      return national as (Property & { owner: Profile })[];
    }

    // Strategy 4: Any active properties as last resort
    const { data: fallback } = await supabase
      .from("properties")
      .select(selectFields)
      .eq("status", "active")
      .neq("id", property.id)
      .limit(limit);

    return (fallback || []) as (Property & { owner: Profile })[];
  } catch (error) {
    console.error("getSimilarProperties error:", error);
    return [];
  }
}

export async function getPublicStats() {
  const supabase = await createServerSupabaseClient();
  const [listings, profiles] = await Promise.all([
    supabase.from("properties").select("state", { count: "exact" }).eq("status", "active"),
    supabase.from("profiles").select("id", { count: "exact" }),
  ]);
  const states = new Set((listings.data || []).map((p: { state: string }) => p.state));
  return {
    totalListings: listings.count || 0,
    totalStates: states.size,
    totalAgents: profiles.count || 0,
  };
}
