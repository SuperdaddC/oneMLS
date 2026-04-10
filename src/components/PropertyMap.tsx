"use client";

import { useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

interface PropertyMapProps {
  lat?: number | null;
  lng?: number | null;
  address: string;
  price?: string;
}

function createPriceIcon(price?: string) {
  const label = price || "Property";
  return L.divIcon({
    className: "custom-price-marker",
    html: `<div style="
      background: #c9a962;
      color: #0a0a0f;
      font-weight: 700;
      font-size: 12px;
      padding: 4px 10px;
      border-radius: 6px;
      white-space: nowrap;
      box-shadow: 0 4px 12px rgba(0,0,0,0.4);
      border: 2px solid #0a0a0f;
      text-align: center;
      line-height: 1.3;
    ">${label}</div>`,
    iconSize: [80, 30],
    iconAnchor: [40, 30],
  });
}

export default function PropertyMap({ lat, lng, address, price }: PropertyMapProps) {
  const hasCoords = lat != null && lng != null;
  const center: [number, number] = hasCoords ? [lat!, lng!] : [39.8283, -98.5795];
  const zoom = hasCoords ? 14 : 4;

  useEffect(() => {
    // Fix leaflet default icon issue with bundlers
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    delete (L.Icon.Default.prototype as any)._getIconUrl;
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
      iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
      shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
    });
  }, []);

  return (
    <div className="overflow-hidden rounded-xl border border-[#2a2a3a]">
      <MapContainer
        center={center}
        zoom={zoom}
        scrollWheelZoom={false}
        style={{ height: "300px", width: "100%", background: "#0a0a0f" }}
      >
        <TileLayer
          attribution='&copy; <a href="https://carto.com/">CARTO</a>'
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        />
        {hasCoords && (
          <Marker position={[lat!, lng!]} icon={createPriceIcon(price)}>
            <Popup>
              <div style={{ color: "#0a0a0f", fontWeight: 500, fontSize: "13px" }}>
                {address}
              </div>
            </Popup>
          </Marker>
        )}
      </MapContainer>
    </div>
  );
}
