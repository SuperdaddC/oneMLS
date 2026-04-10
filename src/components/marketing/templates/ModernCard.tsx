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

export default function ModernCard({
  property,
  agentName,
  agentPhone,
  brokerageName,
  variant,
  width,
  height,
}: Props) {
  const photo = property.photos?.[0];
  const isLandscape = width > height;
  const pad = width * 0.04;
  const accentColor = "#3b82f6";

  const titleSize = isLandscape ? height * 0.07 : width * 0.06;
  const bodySize = isLandscape ? height * 0.035 : width * 0.03;
  const labelSize = isLandscape ? height * 0.028 : width * 0.022;
  const statSize = isLandscape ? height * 0.04 : width * 0.032;

  // For landscape, photo on left; for square/portrait, photo on top
  const photoFraction = isLandscape ? 0.5 : 0.5;

  return (
    <div
      style={{
        width,
        height,
        background: "#f8fafc",
        display: "flex",
        flexDirection: isLandscape ? "row" : "column",
        overflow: "hidden",
        fontFamily: "system-ui, -apple-system, sans-serif",
      }}
    >
      {/* Variant bar at very top */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: labelSize * 2.5,
          background: accentColor,
          display: "flex",
          alignItems: "center",
          paddingLeft: pad,
          zIndex: 2,
          fontSize: labelSize,
          fontWeight: 700,
          color: "#ffffff",
          letterSpacing: "0.08em",
        }}
      >
        {variantLabels[variant] ?? "JUST LISTED"}
      </div>

      {/* Photo half */}
      <div
        style={{
          width: isLandscape ? width * photoFraction : width,
          height: isLandscape ? height : height * photoFraction,
          background: photo ? `url(${photo}) center/cover` : "#e2e8f0",
          flexShrink: 0,
          position: "relative",
        }}
      />

      {/* Content half */}
      <div
        style={{
          flex: 1,
          padding: pad,
          paddingTop: isLandscape ? pad + labelSize * 2.5 : pad,
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          boxSizing: "border-box",
          position: "relative",
        }}
      >
        <div>
          {/* Price */}
          <div
            style={{
              fontSize: titleSize,
              fontWeight: 800,
              color: "#0f172a",
              lineHeight: 1.1,
            }}
          >
            {formatPrice(property.price)}
          </div>

          {/* Address */}
          <div
            style={{
              fontSize: bodySize,
              color: "#475569",
              marginTop: bodySize * 0.5,
            }}
          >
            {property.address}
            <br />
            {property.city}, {property.state} {property.zip}
          </div>

          {/* Stats grid */}
          <div
            style={{
              display: "flex",
              gap: statSize * 1.5,
              marginTop: statSize,
            }}
          >
            {[
              { label: "Beds", value: property.bedrooms },
              { label: "Baths", value: property.bathrooms },
              { label: "Sqft", value: property.sqft?.toLocaleString() },
            ].map((stat) => (
              <div key={stat.label}>
                <div
                  style={{
                    fontSize: statSize,
                    fontWeight: 700,
                    color: "#0f172a",
                  }}
                >
                  {stat.value}
                </div>
                <div
                  style={{
                    fontSize: labelSize,
                    color: "#94a3b8",
                    textTransform: "uppercase",
                    letterSpacing: "0.05em",
                  }}
                >
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Agent info */}
        <div>
          <div
            style={{
              height: 1,
              background: "#e2e8f0",
              marginBottom: bodySize,
            }}
          />
          <div style={{ fontSize: bodySize, color: "#334155" }}>
            <div style={{ fontWeight: 600 }}>{agentName}</div>
            <div style={{ color: "#64748b" }}>{brokerageName}</div>
            {agentPhone && (
              <div style={{ color: "#64748b" }}>{agentPhone}</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
