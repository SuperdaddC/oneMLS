"use client";

import type { Property } from "@/lib/types";

interface Props {
  property: Property;
  agentName: string;
  agentPhone: string;
  brokerageName: string;
  variant: string;
  width: number;
  height: number;
}

const variantLabels: Record<string, string> = {
  just_listed: "JUST LISTED",
  open_house: "OPEN HOUSE",
  price_reduced: "PRICE REDUCED",
  just_sold: "JUST SOLD",
};

function formatPrice(price: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(price);
}

export default function MinimalCard({
  property,
  agentName,
  agentPhone,
  brokerageName,
  variant,
  width,
  height,
}: Props) {
  const photo = property.photos?.[0];
  const pad = width * 0.06;

  const priceSize = width * 0.055;
  const addressSize = width * 0.028;
  const labelSize = width * 0.018;
  const smallSize = width * 0.02;

  // Photo size: centered, not full bleed
  const photoSize = Math.min(width * 0.5, height * 0.35);

  return (
    <div
      style={{
        width,
        height,
        background: "#ffffff",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: pad,
        boxSizing: "border-box",
        fontFamily: "Georgia, 'Times New Roman', serif",
        position: "relative",
      }}
    >
      {/* Variant label */}
      <div
        style={{
          position: "absolute",
          top: pad,
          left: pad,
          fontSize: labelSize,
          fontWeight: 600,
          color: "#c9a962",
          letterSpacing: "0.15em",
          fontFamily: "system-ui, sans-serif",
        }}
      >
        {variantLabels[variant] ?? "JUST LISTED"}
      </div>

      {/* Photo */}
      <div
        style={{
          width: photoSize,
          height: photoSize * 0.7,
          borderRadius: 4,
          background: photo ? `url(${photo}) center/cover` : "#f1f5f9",
          marginBottom: pad * 0.6,
        }}
      />

      {/* Price */}
      <div
        style={{
          fontSize: priceSize,
          fontWeight: 300,
          color: "#0f172a",
          letterSpacing: "-0.02em",
          lineHeight: 1.1,
        }}
      >
        {formatPrice(property.price)}
      </div>

      {/* Address */}
      <div
        style={{
          fontSize: addressSize,
          color: "#64748b",
          marginTop: addressSize * 0.4,
          textAlign: "center",
          lineHeight: 1.5,
        }}
      >
        {property.address}
        <br />
        {property.city}, {property.state} {property.zip}
      </div>

      {/* Stats */}
      <div
        style={{
          display: "flex",
          gap: smallSize * 3,
          marginTop: smallSize * 2,
          fontSize: smallSize,
          color: "#94a3b8",
          letterSpacing: "0.05em",
          fontFamily: "system-ui, sans-serif",
        }}
      >
        <span>{property.bedrooms} Beds</span>
        <span>|</span>
        <span>{property.bathrooms} Baths</span>
        <span>|</span>
        <span>{property.sqft?.toLocaleString()} Sqft</span>
      </div>

      {/* Agent info at bottom */}
      <div
        style={{
          position: "absolute",
          bottom: pad,
          left: pad,
          right: pad,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-end",
          fontSize: smallSize * 0.9,
          color: "#94a3b8",
          fontFamily: "system-ui, sans-serif",
        }}
      >
        <div>
          <span style={{ color: "#64748b" }}>{agentName}</span>
          {brokerageName && <span> &middot; {brokerageName}</span>}
          {agentPhone && <span> &middot; {agentPhone}</span>}
        </div>
        <div style={{ color: "#c9a962", fontWeight: 600 }}>OneMLS</div>
      </div>
    </div>
  );
}
