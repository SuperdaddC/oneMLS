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

export default function BoldCard({
  property,
  agentName,
  agentPhone,
  brokerageName,
  variant,
  width,
  height,
}: Props) {
  const photo = property.photos?.[0];
  const pad = width * 0.05;

  const priceSize = width * 0.1;
  const addressSize = width * 0.035;
  const labelSize = width * 0.025;
  const statSize = width * 0.025;

  return (
    <div
      style={{
        width,
        height,
        background: "linear-gradient(135deg, #7c3aed 0%, #2563eb 50%, #06b6d4 100%)",
        position: "relative",
        overflow: "hidden",
        fontFamily: "system-ui, -apple-system, sans-serif",
      }}
    >
      {/* Photo with strong color overlay */}
      {photo && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage: `url(${photo})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            opacity: 0.25,
          }}
        />
      )}

      {/* Content */}
      <div
        style={{
          position: "relative",
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: pad,
          boxSizing: "border-box",
        }}
      >
        {/* Top: variant label */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
          }}
        >
          <span
            style={{
              background: "rgba(255,255,255,0.2)",
              backdropFilter: "blur(10px)",
              color: "#ffffff",
              padding: `${labelSize * 0.4}px ${labelSize * 1.2}px`,
              borderRadius: labelSize,
              fontSize: labelSize,
              fontWeight: 800,
              letterSpacing: "0.08em",
            }}
          >
            {variantLabels[variant] ?? "JUST LISTED"}
          </span>
          <span
            style={{
              color: "rgba(255,255,255,0.7)",
              fontSize: labelSize * 0.8,
              fontWeight: 700,
            }}
          >
            OneMLS
          </span>
        </div>

        {/* Center: HUGE price */}
        <div style={{ textAlign: "center" }}>
          <div
            style={{
              fontSize: priceSize,
              fontWeight: 900,
              color: "#ffffff",
              lineHeight: 1,
              textShadow: "0 4px 30px rgba(0,0,0,0.3)",
            }}
          >
            {formatPrice(property.price)}
          </div>
          <div
            style={{
              fontSize: addressSize,
              fontWeight: 700,
              color: "rgba(255,255,255,0.9)",
              marginTop: addressSize * 0.5,
            }}
          >
            {property.address}
          </div>
          <div
            style={{
              fontSize: addressSize * 0.85,
              color: "rgba(255,255,255,0.7)",
              marginTop: addressSize * 0.2,
            }}
          >
            {property.city}, {property.state} {property.zip}
          </div>
        </div>

        {/* Bottom: stats in pills + agent */}
        <div>
          {/* Stat pills */}
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              gap: statSize * 0.8,
              marginBottom: statSize * 1.5,
              flexWrap: "wrap",
            }}
          >
            {[
              `${property.bedrooms} Beds`,
              `${property.bathrooms} Baths`,
              `${property.sqft?.toLocaleString()} Sqft`,
            ].map((stat) => (
              <span
                key={stat}
                style={{
                  background: "rgba(255,255,255,0.2)",
                  backdropFilter: "blur(10px)",
                  color: "#ffffff",
                  padding: `${statSize * 0.4}px ${statSize * 1.2}px`,
                  borderRadius: statSize * 2,
                  fontSize: statSize,
                  fontWeight: 700,
                }}
              >
                {stat}
              </span>
            ))}
          </div>

          {/* Agent */}
          <div
            style={{
              textAlign: "center",
              fontSize: statSize * 0.9,
              color: "rgba(255,255,255,0.8)",
            }}
          >
            <span style={{ fontWeight: 700, color: "#ffffff" }}>
              {agentName}
            </span>
            {brokerageName && <span> &middot; {brokerageName}</span>}
            {agentPhone && <span> &middot; {agentPhone}</span>}
          </div>
        </div>
      </div>
    </div>
  );
}
