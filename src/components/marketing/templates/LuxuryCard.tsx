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

export default function LuxuryCard({
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
  const priceFontSize = isLandscape ? height * 0.1 : width * 0.08;
  const addressFontSize = isLandscape ? height * 0.045 : width * 0.035;
  const labelFontSize = isLandscape ? height * 0.03 : width * 0.025;
  const statFontSize = isLandscape ? height * 0.035 : width * 0.028;

  return (
    <div
      style={{
        width,
        height,
        background: "linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)",
        position: "relative",
        overflow: "hidden",
        fontFamily: "system-ui, -apple-system, sans-serif",
      }}
    >
      {/* Background photo */}
      {photo && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage: `url(${photo})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            opacity: 0.4,
          }}
        />
      )}

      {/* Dark gradient overlay */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "linear-gradient(180deg, rgba(15,23,42,0.3) 0%, rgba(15,23,42,0.7) 50%, rgba(15,23,42,0.95) 100%)",
        }}
      />

      {/* Content */}
      <div
        style={{
          position: "relative",
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: width * 0.05,
          boxSizing: "border-box",
        }}
      >
        {/* Top: variant label */}
        <div>
          <span
            style={{
              background: "#c9a962",
              color: "#0f172a",
              padding: `${labelFontSize * 0.4}px ${labelFontSize * 1.2}px`,
              borderRadius: labelFontSize,
              fontSize: labelFontSize,
              fontWeight: 700,
              letterSpacing: "0.05em",
            }}
          >
            {variantLabels[variant] ?? "JUST LISTED"}
          </span>
        </div>

        {/* Center: price & address */}
        <div style={{ textAlign: "center" }}>
          <div
            style={{
              fontSize: priceFontSize,
              fontWeight: 800,
              color: "#ffffff",
              lineHeight: 1.1,
              textShadow: "0 2px 20px rgba(0,0,0,0.5)",
            }}
          >
            {formatPrice(property.price)}
          </div>
          <div
            style={{
              fontSize: addressFontSize,
              color: "rgba(255,255,255,0.85)",
              marginTop: addressFontSize * 0.5,
            }}
          >
            {property.address}, {property.city}, {property.state} {property.zip}
          </div>
        </div>

        {/* Bottom section */}
        <div>
          {/* Gold accent line */}
          <div
            style={{
              height: 2,
              background: "linear-gradient(90deg, transparent, #c9a962, transparent)",
              marginBottom: statFontSize,
            }}
          />

          {/* Stats */}
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              gap: statFontSize * 2,
              fontSize: statFontSize,
              color: "rgba(255,255,255,0.9)",
              marginBottom: statFontSize,
            }}
          >
            <span>{property.bedrooms} Beds</span>
            <span>{property.bathrooms} Baths</span>
            <span>{property.sqft?.toLocaleString()} Sqft</span>
          </div>

          {/* Agent info */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-end",
              fontSize: statFontSize * 0.85,
              color: "rgba(255,255,255,0.7)",
            }}
          >
            <div>
              <div style={{ fontWeight: 600, color: "rgba(255,255,255,0.9)" }}>
                {agentName}
              </div>
              <div>{brokerageName}</div>
              {agentPhone && <div>{agentPhone}</div>}
            </div>
            <div
              style={{
                fontSize: statFontSize * 0.7,
                color: "#c9a962",
                fontWeight: 600,
              }}
            >
              OneMLS
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
