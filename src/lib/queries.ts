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
  sort?: string;
  page?: number;
  limit?: number;
}) {
  const supabase = await createServerSupabaseClient();
  let q = supabase
    .from("properties")
    .select("*, owner:profiles!owner_id(first_name, last_name, phone, email, brokerage_name, avatar_url)", { count: "exact" })
    .eq("status", "active");

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
  const supabase = await createServerSupabaseClient();
  const priceRange = Number(property.price) * 0.2;
  const { data } = await supabase
    .from("properties")
    .select("*, owner:profiles!owner_id(first_name, last_name, phone, email, brokerage_name)")
    .eq("status", "active")
    .eq("state", property.state)
    .neq("id", property.id)
    .gte("price", Number(property.price) - priceRange)
    .lte("price", Number(property.price) + priceRange)
    .limit(limit);
  return (data || []) as (Property & { owner: Profile })[];
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
