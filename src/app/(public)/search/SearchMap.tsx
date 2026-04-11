"use client";

import { useEffect, useMemo, useRef } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { useRouter } from "next/navigation";

interface MapMarker {
  id: string;
  lat: number;
  lng: number;
  price: number;
  address: string;
}

interface SearchMapProps {
  markers: MapMarker[];
}

/* format price for marker labels */
function shortPrice(price: number): string {
  if (price >= 1_000_000) return `$${(price / 1_000_000).toFixed(1)}M`;
  if (price >= 1_000) return `$${Math.round(price / 1_000)}K`;
  return `$${price}`;
}

/* create a div-icon with price label */
function priceIcon(price: number) {
  return L.divIcon({
    className: "search-map-marker",
    html: `<div style="
      background: #c9a962;
      color: #0a0a0f;
      font-size: 11px;
      font-weight: 700;
      padding: 2px 6px;
      border-radius: 4px;
      white-space: nowrap;
      box-shadow: 0 2px 6px rgba(0,0,0,0.5);
      border: 1px solid rgba(255,255,255,0.15);
    ">${shortPrice(price)}</div>`,
    iconSize: [0, 0],
    iconAnchor: [0, 0],
  });
}

/* auto-fit map bounds to markers */
function FitBounds({ markers }: { markers: MapMarker[] }) {
  const map = useMap();
  const prevCount = useRef(markers.length);

  useEffect(() => {
    if (markers.length === 0) {
      // center on US
      map.setView([39.5, -98.35], 4);
      return;
    }
    const bounds = L.latLngBounds(markers.map((m) => [m.lat, m.lng]));
    map.fitBounds(bounds, { padding: [40, 40], maxZoom: 14 });
    prevCount.current = markers.length;
  }, [markers, map]);

  return null;
}

export default function SearchMap({ markers }: SearchMapProps) {
  const router = useRouter();

  const center = useMemo<[number, number]>(() => {
    if (markers.length === 0) return [39.5, -98.35];
    const lat = markers.reduce((s, m) => s + m.lat, 0) / markers.length;
    const lng = markers.reduce((s, m) => s + m.lng, 0) / markers.length;
    return [lat, lng];
  }, [markers]);

  return (
    <MapContainer
      center={center}
      zoom={markers.length === 0 ? 4 : 10}
      scrollWheelZoom
      className="h-full w-full"
      style={{ background: "#0a0a0f" }}
    >
      <TileLayer
        attribution='&copy; <a href="https://carto.com/">CARTO</a>'
        url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
      />
      <FitBounds markers={markers} />
      {markers.map((m) => (
        <Marker
          key={m.id}
          position={[m.lat, m.lng]}
          icon={priceIcon(m.price)}
          eventHandlers={{
            click: () => router.push(`/property/${m.id}`),
          }}
        >
          <Popup>
            <div style={{ color: "#0a0a0f", fontSize: 13 }}>
              <strong>{shortPrice(m.price)}</strong>
              <br />
              {m.address}
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
