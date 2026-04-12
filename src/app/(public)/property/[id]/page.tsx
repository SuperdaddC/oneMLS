import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Image from "next/image";
import { getPropertyById, getSimilarProperties } from "@/lib/queries";
import { createServerSupabaseClient } from "@/lib/supabase-server";
import PhotoGallery from "@/components/PhotoGallery";
import MortgageCalculator from "@/components/MortgageCalculator";
import ShareButton from "@/components/ShareButton";
import PropertyCard from "@/components/PropertyCard";
import PropertyMapWrapper from "@/components/PropertyMapWrapper";
import FavoriteButton from "@/components/FavoriteButton";
import ViewTracker from "@/components/ViewTracker";
import PriceHistoryChart from "@/components/PriceHistoryChart";
import WalkScore from "@/components/WalkScore";
import SchoolRatings from "@/components/SchoolRatings";
import NeighborhoodInfo from "@/components/NeighborhoodInfo";
import PrintButton from "@/components/PrintButton";
import { getWalkScore, getNearbySchools, getCensusData } from "@/lib/location-apis";

/* ---------- Helpers ---------- */

function formatPrice(price: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(price);
}

function formatNumber(n: number) {
  return n.toLocaleString("en-US");
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function formatTime12h(time: string) {
  const [h, m] = time.split(":");
  const hour = parseInt(h, 10);
  const ampm = hour >= 12 ? "PM" : "AM";
  const hour12 = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
  return `${hour12}:${m} ${ampm}`;
}

function formatEventDate(dateStr: string) {
  const date = new Date(dateStr + "T12:00:00");
  return date.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function formatPropertyType(type: string) {
  return type
    .split("_")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

/* ---------- Metadata ---------- */

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const property = await getPropertyById(id);

  if (!property) {
    return { title: "Property Not Found | OneMLS" };
  }

  const title = `${property.bedrooms} Bed, ${property.bathrooms} Bath in ${property.city}, ${property.state} - ${formatPrice(property.price)} | OneMLS`;
  const descriptionParts = [
    property.description
      ? property.description.slice(0, 150) + (property.description.length > 150 ? "..." : "")
      : `${formatPropertyType(property.property_type)} in ${property.city}, ${property.state}`,
    `${property.bedrooms} beds, ${property.bathrooms} baths, ${formatNumber(property.sqft)} sqft`,
  ];
  const description = descriptionParts.join(" | ");
  const ogImage = property.photos?.[0] || undefined;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: ogImage ? [{ url: ogImage, width: 1200, height: 630 }] : [],
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: ogImage ? [ogImage] : [],
    },
  };
}

/* ---------- Page ---------- */

export default async function PropertyDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const property = await getPropertyById(id);

  if (!property) {
    notFound();
  }

  const supabase = await createServerSupabaseClient();
  const { data: openHouses } = await supabase
    .from('open_houses')
    .select('*')
    .eq('property_id', id)
    .eq('status', 'scheduled')
    .gte('event_date', new Date().toISOString().split('T')[0])
    .order('event_date', { ascending: true });

  const similarProperties = await getSimilarProperties(property, 3);
  const owner = property.owner;
  const fullAddress = `${property.address}, ${property.city}, ${property.state} ${property.zip}`;

  const [walkScoreData, schoolsData, censusData] = await Promise.all([
    property.lat && property.lng
      ? getWalkScore(property.lat, property.lng, fullAddress)
      : null,
    property.lat && property.lng
      ? getNearbySchools(property.lat, property.lng)
      : null,
    getCensusData(property.zip),
  ]);
  const ownerName = owner
    ? `${owner.first_name} ${owner.last_name}`
    : "Listing Agent";
  const ownerInitials = owner
    ? `${owner.first_name?.charAt(0) || ""}${owner.last_name?.charAt(0) || ""}`
    : "LA";

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-[#f8fafc]">
      <ViewTracker propertyId={property.id} />
      {/* Navigation bar */}
      <nav data-print-hide className="sticky top-0 z-50 border-b border-[#2a2a3a] bg-[#0a0a0f]/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
          <a href="/" className="text-xl font-extrabold tracking-wider text-white">
            one<span className="text-[#c9a962]">MLS</span>
          </a>
          <div className="flex items-center gap-3">
            <ShareButton compact />
            <a
              href="/login"
              className="rounded-lg bg-[#c9a962] px-4 py-2 text-sm font-semibold text-[#0a0a0f] transition-colors hover:bg-[#d4b872]"
            >
              Sign In
            </a>
          </div>
        </div>
      </nav>

      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        {/* ===== A. Hero Section ===== */}
        <section className="animate-fade-in">
          <PhotoGallery photos={property.photos || []} />
        </section>

        {/* ===== Open House Banner ===== */}
        {openHouses && openHouses.length > 0 && (
          <section className="mt-6 animate-fade-in overflow-hidden rounded-2xl" style={{ background: "linear-gradient(135deg, #c9a962 0%, #d4b872 100%)" }}>
            <div className="px-5 py-4 sm:px-6">
              {openHouses.map((oh: { id: string; event_date: string; start_time: string; end_time: string; notes: string | null }) => (
                <div key={oh.id} className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-6 py-1">
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <rect x="2" y="3" width="16" height="15" rx="2" stroke="#0a0a0f" strokeWidth="1.5" />
                      <path d="M2 8H18" stroke="#0a0a0f" strokeWidth="1.5" />
                      <path d="M7 1V4" stroke="#0a0a0f" strokeWidth="1.5" strokeLinecap="round" />
                      <path d="M13 1V4" stroke="#0a0a0f" strokeWidth="1.5" strokeLinecap="round" />
                    </svg>
                    <span className="text-sm font-bold text-[#0a0a0f] uppercase tracking-wide" style={{ animation: "pulse 2s cubic-bezier(0.4,0,0.6,1) infinite" }}>
                      Open House
                    </span>
                  </div>
                  <div className="text-sm font-semibold text-[#0a0a0f]">
                    {formatEventDate(oh.event_date)} &middot; {formatTime12h(oh.start_time)} - {formatTime12h(oh.end_time)}
                  </div>
                  {oh.notes && (
                    <div className="text-sm text-[#0a0a0f]/75 italic">{oh.notes}</div>
                  )}
                </div>
              ))}
            </div>
            <style>{`@keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.7; } }`}</style>
          </section>
        )}

        {/* ===== B. Highlights Bar ===== */}
        <section className="mt-6 animate-fade-in rounded-2xl border border-[#2a2a3a] bg-[#161620] p-5 sm:p-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            {/* Left: price + stats */}
            <div>
              <div className="flex flex-wrap items-baseline gap-x-4 gap-y-1">
                <h1 className="text-3xl font-bold text-[#c9a962] sm:text-4xl">
                  {formatPrice(property.price)}
                </h1>
                <div className="flex flex-wrap items-center gap-x-3 text-sm text-[#94a3b8]">
                  <span className="flex items-center gap-1.5">
                    <strong className="text-lg font-semibold text-white">{property.bedrooms}</strong> Beds
                  </span>
                  <span className="text-[#2a2a3a]">|</span>
                  <span className="flex items-center gap-1.5">
                    <strong className="text-lg font-semibold text-white">{property.bathrooms}</strong> Baths
                  </span>
                  <span className="text-[#2a2a3a]">|</span>
                  <span className="flex items-center gap-1.5">
                    <strong className="text-lg font-semibold text-white">{formatNumber(property.sqft)}</strong> Sq Ft
                  </span>
                  {property.lot_size && (
                    <>
                      <span className="text-[#2a2a3a]">|</span>
                      <span className="flex items-center gap-1.5">
                        <strong className="text-lg font-semibold text-white">{formatNumber(property.lot_size)}</strong> Lot Sq Ft
                      </span>
                    </>
                  )}
                  <span className="text-[#2a2a3a]">|</span>
                  <span>{formatPropertyType(property.property_type)}</span>
                </div>
              </div>
              <p className="mt-2 text-sm text-[#94a3b8]">{fullAddress}</p>
              <div className="mt-1 flex flex-wrap gap-x-4 text-xs text-[#94a3b8]">
                <span>MLS# {property.mls_id}</span>
                <span>{property.days_on_market} days on market</span>
              </div>
            </div>

            {/* Right: CTA buttons */}
            <div className="flex flex-shrink-0 items-center gap-3">
              <FavoriteButton propertyId={property.id} size="lg" />
              <PrintButton />
              <span data-print-hide><ShareButton /></span>
              <button data-print-hide className="rounded-lg bg-[#c9a962] px-6 py-2.5 text-sm font-semibold text-[#0a0a0f] transition-colors hover:bg-[#d4b872]">
                Schedule Showing
              </button>
            </div>
          </div>
        </section>

        {/* ===== C. Two-Column Body ===== */}
        <div className="mt-8 grid gap-8 lg:grid-cols-3">
          {/* Left Column (2/3) */}
          <div className="space-y-8 lg:col-span-2">
            {/* About */}
            {property.description && (
              <section className="animate-fade-in">
                <h2 className="mb-4 text-xl font-bold text-white">About This Property</h2>
                <div className="rounded-xl border border-[#2a2a3a] bg-[#161620] p-6">
                  <p className="whitespace-pre-line text-sm leading-relaxed text-[#94a3b8]">
                    {property.description}
                  </p>
                </div>
              </section>
            )}

            {/* Price History */}
            <section className="animate-fade-in">
              <h2 className="mb-4 text-xl font-bold text-white">
                <span className="flex items-center gap-2">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#c9a962" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
                  </svg>
                  Price History
                </span>
              </h2>
              <PriceHistoryChart
                priceHistory={property.price_history || []}
                currentPrice={property.price}
              />
            </section>

            {/* Features */}
            {property.features && property.features.length > 0 && (
              <section className="animate-fade-in">
                <h2 className="mb-4 text-xl font-bold text-white">Features</h2>
                <div className="flex flex-wrap gap-2">
                  {property.features.map((feature, i) => (
                    <span
                      key={i}
                      className="inline-flex items-center rounded-full border border-[#2a2a3a] bg-[#161620] px-4 py-2 text-sm text-[#94a3b8] transition-colors hover:border-[#c9a962] hover:text-[#c9a962]"
                    >
                      {feature}
                    </span>
                  ))}
                </div>
              </section>
            )}

            {/* Virtual Tour */}
            {property.virtual_tour_url && (
              <section className="animate-fade-in no-print">
                <h2 className="mb-4 text-xl font-bold text-white">
                  <span className="flex items-center gap-2">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#c9a962" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polygon points="5 3 19 12 5 21 5 3" />
                    </svg>
                    Virtual Tour
                  </span>
                </h2>
                <div className="overflow-hidden rounded-xl border border-[#2a2a3a] bg-[#161620]">
                  <div className="relative w-full" style={{ height: "450px" }}>
                    <iframe
                      src={property.virtual_tour_url}
                      title="Virtual Tour"
                      className="absolute inset-0 h-full w-full rounded-t-xl"
                      style={{ border: "none" }}
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share; xr-spatial-tracking"
                      allowFullScreen
                    />
                  </div>
                  <div className="flex items-center justify-between border-t border-[#2a2a3a] px-5 py-3">
                    <span className="text-xs text-[#94a3b8]">
                      View this property in immersive 3D
                    </span>
                    <a
                      href={property.virtual_tour_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1.5 text-sm font-medium text-[#c9a962] transition-colors hover:text-[#d4b872]"
                    >
                      Open in New Tab
                      <svg
                        width="14"
                        height="14"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6" />
                        <polyline points="15 3 21 3 21 9" />
                        <line x1="10" y1="14" x2="21" y2="3" />
                      </svg>
                    </a>
                  </div>
                </div>
              </section>
            )}

            {/* Property Details Grid */}
            <section className="animate-fade-in">
              <h2 className="mb-4 text-xl font-bold text-white">Property Details</h2>
              <div className="grid gap-px overflow-hidden rounded-xl border border-[#2a2a3a] bg-[#2a2a3a] sm:grid-cols-2">
                {[
                  { label: "Property Type", value: formatPropertyType(property.property_type) },
                  { label: "Year Built", value: property.year_built?.toString() || "N/A" },
                  { label: "Lot Size", value: property.lot_size ? `${formatNumber(property.lot_size)} sq ft` : "N/A" },
                  { label: "MLS ID", value: property.mls_id },
                  { label: "Days on Market", value: property.days_on_market.toString() },
                  { label: "Listing Date", value: formatDate(property.listing_date) },
                  {
                    label: "Commission Rate",
                    value: property.commission_rate
                      ? `${property.commission_rate}%`
                      : "Contact Agent",
                  },
                  { label: "Status", value: property.status.charAt(0).toUpperCase() + property.status.slice(1) },
                ].map(({ label, value }) => (
                  <div key={label} className="flex items-center justify-between bg-[#161620] px-5 py-4">
                    <span className="text-sm text-[#94a3b8]">{label}</span>
                    <span className="text-sm font-medium text-white">{value}</span>
                  </div>
                ))}
              </div>
            </section>

            {/* Showing Instructions */}
            {property.showing_instructions && (
              <section className="animate-fade-in">
                <h2 className="mb-4 text-xl font-bold text-white">Showing Instructions</h2>
                <div className="rounded-xl border border-[#2a2a3a] bg-[#161620] p-6">
                  <p className="text-sm leading-relaxed text-[#94a3b8]">
                    {property.showing_instructions}
                  </p>
                </div>
              </section>
            )}
          </div>

          {/* Right Column (1/3) - Sticky Sidebar */}
          <div className="space-y-6 lg:sticky lg:top-20 lg:self-start">
            {/* Agent Contact Card */}
            <div className="overflow-hidden rounded-xl border border-[#2a2a3a] bg-[#161620]">
              <div className="h-1 bg-[#c9a962]" />
              <div className="p-6">
                <div className="flex items-center gap-4">
                  {owner?.avatar_url ? (
                    <Image
                      src={owner.avatar_url}
                      alt={ownerName}
                      width={56}
                      height={56}
                      className="rounded-full object-cover"
                    />
                  ) : (
                    <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-[#1e3a5f] to-[#2a4f7f] text-lg font-bold text-white">
                      {ownerInitials}
                    </div>
                  )}
                  <div>
                    <p className="text-base font-semibold text-white">{ownerName}</p>
                    {owner?.brokerage_name && (
                      <p className="text-sm text-[#94a3b8]">{owner.brokerage_name}</p>
                    )}
                  </div>
                </div>

                <div className="mt-5 space-y-3">
                  {owner?.phone && (
                    <a
                      href={`tel:${owner.phone}`}
                      className="flex items-center gap-3 rounded-lg border border-[#2a2a3a] px-4 py-3 text-sm text-white transition-colors hover:border-[#c9a962] hover:bg-[#1c1c2e]"
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#c9a962" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 16.92z" />
                      </svg>
                      {owner.phone}
                    </a>
                  )}
                  {owner?.email && (
                    <a
                      href={`mailto:${owner.email}`}
                      className="flex items-center gap-3 rounded-lg border border-[#2a2a3a] px-4 py-3 text-sm text-white transition-colors hover:border-[#c9a962] hover:bg-[#1c1c2e]"
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#c9a962" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                        <polyline points="22,6 12,13 2,6" />
                      </svg>
                      {owner.email}
                    </a>
                  )}
                </div>

                <div className="mt-5 space-y-3">
                  <button className="w-full rounded-lg bg-[#c9a962] py-3 text-center text-sm font-semibold text-[#0a0a0f] transition-colors hover:bg-[#d4b872]">
                    Schedule a Showing
                  </button>
                  <button className="w-full rounded-lg border border-[#2a2a3a] bg-transparent py-3 text-center text-sm font-semibold text-white transition-colors hover:border-[#94a3b8] hover:bg-[#1c1c2e]">
                    Request Info
                  </button>
                </div>
              </div>
            </div>

            {/* Mortgage Calculator */}
            <div className="no-print">
              <MortgageCalculator propertyPrice={property.price} />
            </div>

            {/* Share */}
            <div className="rounded-xl border border-[#2a2a3a] bg-[#161620] p-5">
              <p className="mb-3 text-sm font-semibold text-white">Share This Listing</p>
              <ShareButton
                title={`${property.bedrooms} Bed, ${property.bathrooms} Bath in ${property.city} - ${formatPrice(property.price)}`}
              />
            </div>
          </div>
        </div>

        {/* ===== D. Map Section ===== */}
        <section className="mt-12 animate-fade-in no-print">
          <h2 className="mb-4 text-xl font-bold text-white">Location</h2>
          <PropertyMapWrapper
            lat={property.lat}
            lng={property.lng}
            address={fullAddress}
          />
          <p className="mt-3 text-sm text-[#94a3b8]">{fullAddress}</p>
        </section>

        {/* ===== Walk Score ===== */}
        <section className="mt-12 animate-fade-in">
          <WalkScore
            lat={property.lat}
            lng={property.lng}
            city={property.city}
            state={property.state}
            apiData={walkScoreData}
          />
        </section>

        {/* ===== School Ratings ===== */}
        <section className="mt-12 animate-fade-in">
          <SchoolRatings
            city={property.city}
            state={property.state}
            zip={property.zip}
            apiData={schoolsData}
          />
        </section>

        {/* ===== Neighborhood Info ===== */}
        <section className="mt-12 animate-fade-in">
          <NeighborhoodInfo
            city={property.city}
            state={property.state}
            lat={property.lat}
            lng={property.lng}
            censusData={censusData}
          />
        </section>

        {/* ===== E. Similar Properties ===== */}
        {similarProperties.length > 0 && (
          <section className="mt-12 animate-fade-in no-print">
            <h2 className="mb-6 text-xl font-bold text-white">Similar Properties</h2>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {similarProperties.map((p) => (
                <PropertyCard key={p.id} property={p} />
              ))}
            </div>
          </section>
        )}

        {/* Bottom spacer */}
        <div className="h-16" />
      </main>

      {/* ===== F. Footer ===== */}
      <footer data-print-hide className="border-t border-[#2a2a3a] bg-[#161620]">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
            <p className="text-xl font-extrabold tracking-wider text-white">
              one<span className="text-[#c9a962]">MLS</span>
            </p>
            <p className="text-xs text-[#94a3b8]">
              &copy; {new Date().getFullYear()} OneMLS. All rights reserved. The national independent MLS.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
