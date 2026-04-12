import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase-server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);

  // RESO OData-style parameters
  const top = Math.min(parseInt(searchParams.get("$top") || "20"), 200);
  const skip = parseInt(searchParams.get("$skip") || "0");
  const filter = searchParams.get("$filter");
  const orderby = searchParams.get("$orderby");

  const supabase = await createServerSupabaseClient();

  let query = supabase
    .from("properties")
    .select("*", { count: "exact" })
    .eq("status", "active");

  // Basic OData filter support
  if (filter) {
    const cityMatch = filter.match(/City eq '([^']+)'/i);
    if (cityMatch) query = query.eq("city", cityMatch[1]);

    const stateMatch = filter.match(/StateOrProvince eq '([^']+)'/i);
    if (stateMatch) query = query.eq("state", stateMatch[1]);

    const priceGte = filter.match(/ListPrice ge (\d+)/i);
    if (priceGte) query = query.gte("price", parseInt(priceGte[1]));

    const priceLte = filter.match(/ListPrice le (\d+)/i);
    if (priceLte) query = query.lte("price", parseInt(priceLte[1]));

    const bedsGte = filter.match(/BedroomsTotal ge (\d+)/i);
    if (bedsGte) query = query.gte("bedrooms", parseInt(bedsGte[1]));

    const bathsGte = filter.match(/BathroomsTotalDecimal ge (\d+)/i);
    if (bathsGte) query = query.gte("bathrooms", parseInt(bathsGte[1]));

    const typeMatch = filter.match(/PropertyType eq '([^']+)'/i);
    if (typeMatch) query = query.eq("property_type", typeMatch[1]);
  }

  // Sort
  if (orderby) {
    const [field, dir] = orderby.split(" ");
    const fieldMap: Record<string, string> = {
      ListPrice: "price",
      ModificationTimestamp: "updated_at",
      ListingId: "mls_id",
      City: "city",
      BedroomsTotal: "bedrooms",
      LivingArea: "sqft",
    };
    const dbField = fieldMap[field] || "created_at";
    query = query.order(dbField, { ascending: dir === "asc" });
  } else {
    query = query.order("created_at", { ascending: false });
  }

  query = query.range(skip, skip + top - 1);

  const { data, error, count } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Map to RESO Data Dictionary format
  const resoProperties = (data || []).map(
    (p: Record<string, unknown>) => ({
      ListingId: p.mls_id,
      ListingKey: p.id,
      PropertyType: p.property_type,
      StandardStatus: p.status,
      ListPrice: p.price,
      StreetAddress: p.address,
      City: p.city,
      StateOrProvince: p.state,
      PostalCode: p.zip,
      County: p.county,
      Latitude: p.lat,
      Longitude: p.lng,
      BedroomsTotal: p.bedrooms,
      BathroomsTotalDecimal: p.bathrooms,
      LivingArea: p.sqft,
      LotSizeSquareFeet: p.lot_size,
      YearBuilt: p.year_built,
      PublicRemarks: p.description,
      ListingContractDate: p.listing_date,
      DaysOnMarket: p.days_on_market,
      BuyerAgentCommission: p.commission_rate,
      Photos: p.photos,
      VirtualTourURLUnbranded: p.virtual_tour_url,
      ModificationTimestamp: p.updated_at,
    })
  );

  return NextResponse.json({
    "@odata.context": "https://onemls.pro/api/reso/properties",
    "@odata.count": count,
    value: resoProperties,
  });
}
