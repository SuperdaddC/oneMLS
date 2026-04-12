import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase-server";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createServerSupabaseClient();

  const { data, error } = await supabase
    .from("properties")
    .select("*")
    .eq("id", id)
    .eq("status", "active")
    .single();

  if (error || !data) {
    return NextResponse.json(
      { error: "Property not found" },
      { status: 404 }
    );
  }

  const p = data as Record<string, unknown>;

  const resoProperty = {
    "@odata.context": `https://onemls.pro/api/reso/properties('${id}')`,
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
  };

  return NextResponse.json(resoProperty);
}
