"use client";

import Link from "next/link";
import Image from "next/image";
import type { Property, Profile } from "@/lib/types";
import FavoriteButton from "@/components/FavoriteButton";

interface PropertyCardProps {
  property: Property & { owner?: Profile };
}

const statusStyles: Record<string, string> = {
  active: "badge-active",
  pending: "badge-pending",
  sold: "badge-sold",
  withdrawn: "badge-sold",
  cancelled: "badge-sold",
  draft: "badge-pending",
};

function formatPrice(price: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(price);
}

export default function PropertyCard({ property }: PropertyCardProps) {
  const firstPhoto = property.photos?.[0];

  return (
    <Link href={`/property/${property.id}`} className="block">
      <div className="property-card">
        {/* Image */}
        <div className="property-card-image">
          {firstPhoto ? (
            <Image
              src={firstPhoto}
              alt={property.address}
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              className="object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-[#1e3a5f] text-slate-500">
              <svg width="48" height="48" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                <path d="M2.25 21h19.5m-18-18v18m10.5-18v18m6-13.5V21M6.75 6.75h.75m-.75 3h.75m-.75 3h.75m3-6h.75m-.75 3h.75m-.75 3h.75M6.75 21v-3.375c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21M3 3h12m-.75 4.5H21m-3.75 6.75h.008v.008h-.008v-.008zm0 3h.008v.008h-.008v-.008zm0 3h.008v.008h-.008v-.008z" />
              </svg>
            </div>
          )}
          {/* Status badge */}
          <div className="absolute top-2 left-2">
            <span className={`badge ${statusStyles[property.status] || "badge-sold"}`}>
              <span className="badge-dot" />
              {property.status.charAt(0).toUpperCase() + property.status.slice(1)}
            </span>
          </div>
          {/* Favorite button */}
          <div className="absolute top-2 right-2 flex h-8 w-8 items-center justify-center rounded-full bg-black/40 backdrop-blur-sm">
            <FavoriteButton propertyId={property.id} size="sm" />
          </div>
        </div>

        {/* Body */}
        <div className="property-card-body">
          <div className="property-card-price">{formatPrice(property.price)}</div>
          <div className="property-card-address">{property.address}</div>
          <div className="property-card-address">
            {property.city}, {property.state} {property.zip}
          </div>
          <div className="property-card-details">
            <span>{property.bedrooms} bd</span>
            <span>{property.bathrooms} ba</span>
            <span>{property.sqft.toLocaleString()} sqft</span>
          </div>
        </div>
      </div>
    </Link>
  );
}
