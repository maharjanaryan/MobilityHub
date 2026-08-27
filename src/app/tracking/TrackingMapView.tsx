"use client";

import React, { useEffect, useRef } from "react";
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
});

export interface TrackPoint {
  lat: number;
  lng: number;
  speed?: number | null;
  heading?: number | null;
  recordedAt: string;
}

interface TrackingMapViewProps {
  current: TrackPoint | null;
  trail: TrackPoint[];
  vehicleName: string;
  isLive: boolean;
  placeName?: string;
}

function createLiveIcon(isLive: boolean, heading?: number | null): L.DivIcon {
  const rotation = typeof heading === "number" ? heading : 0;
  return L.divIcon({
    html: `
      <div style="position: relative; width: 46px; height: 46px; display: flex; align-items: center; justify-content: center;">
        <div style="
          position: absolute;
          width: 46px; height: 46px;
          border-radius: 50%;
          background: ${isLive ? "rgba(22,163,74,0.25)" : "rgba(156,163,175,0.25)"};
          ${isLive ? "animation: trackingPulse 1.8s ease-out infinite;" : ""}
        "></div>
        <div style="
          width: 26px; height: 26px;
          background: ${isLive ? "#16a34a" : "#9ca3af"};
          border: 3px solid #ffffff;
          border-radius: 50%;
          box-shadow: 0 2px 8px rgba(0,0,0,0.3);
          display: flex; align-items: center; justify-content: center;
          transform: rotate(${rotation}deg);
          font-size: 12px;
        ">🚗</div>
      </div>
      <style>
        @keyframes trackingPulse {
          0% { transform: scale(0.6); opacity: 0.8; }
          100% { transform: scale(1.4); opacity: 0; }
        }
      </style>
    `,
    className: "",
    iconSize: [46, 46],
    iconAnchor: [23, 23],
    popupAnchor: [0, -23],
  });
}

function FlyToCurrent({ current }: { current: TrackPoint | null }) {
  const map = useMap();
  const hasFlown = useRef(false);

  useEffect(() => {
    if (!map || !current) return;
    try {
      if (!hasFlown.current) {
        map.flyTo([current.lat, current.lng], 16, { duration: 0.8 });
        hasFlown.current = true;
      } else {
        map.panTo([current.lat, current.lng], { animate: true, duration: 0.6 });
      }
    } catch (e) {
      console.warn("Error panning map:", e);
    }
  }, [current, map]);

  return null;
}

const formatRelative = (iso: string) => {
  const diffSec = Math.max(0, Math.floor((Date.now() - new Date(iso).getTime()) / 1000));
  if (diffSec < 60) return `${diffSec}s ago`;
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHr = Math.floor(diffMin / 60);
  return `${diffHr}h ago`;
};

export default function TrackingMapView({ current, trail, vehicleName, isLive, placeName }: TrackingMapViewProps) {
  const defaultCenter: [number, number] = [27.7172, 85.324];
  const center: [number, number] = current ? [current.lat, current.lng] : defaultCenter;

  const trailCoords: [number, number][] = trail.map((p) => [p.lat, p.lng]);

  // Tile providers with fallbacks
  const tileProviders = [
    {
      url: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    },
    {
      url: "https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png",
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    },
    {
      url: "https://tile.openstreetmap.bzh/br/{z}/{x}/{y}.png",
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    },
  ];

  // Use the first provider (OSM Standard)
  const tileProvider = tileProviders[0];

  return (
    <MapContainer
      center={center}
      zoom={15}
      className="w-full h-full"
      zoomControl={false}
      style={{ background: "#f8fafc" }}
    >
      <TileLayer
        attribution={tileProvider.attribution}
        url={tileProvider.url}
        crossOrigin={true}
        keepBuffer={2}
        updateWhenIdle={true}
        updateWhenZooming={false}
      />

      <FlyToCurrent current={current} />

      {trailCoords.length > 1 && (
        <>
          <Polyline positions={trailCoords} pathOptions={{ color: "#000000", weight: 6, opacity: 0.12 }} />
          <Polyline
            positions={trailCoords}
            pathOptions={{ color: "#16a34a", weight: 4, opacity: 0.8, lineCap: "round", lineJoin: "round" }}
          />
        </>
      )}

      {current && (
        <Marker position={[current.lat, current.lng]} icon={createLiveIcon(isLive, current.heading)}>
          <Popup className="custom-popup" maxWidth={240}>
            <div style={{ fontFamily: "system-ui, sans-serif", padding: "2px 4px" }}>
              <strong style={{ fontSize: "14px" }}>{vehicleName}</strong>
              {placeName && (
                <div style={{ fontSize: "12px", color: "#374151", marginTop: "2px" }}>📍 {placeName}</div>
              )}
              <div style={{ fontSize: "12px", color: "#6b7280", marginTop: "4px" }}>
                {typeof current.speed === "number" && <div>🚀 {current.speed.toFixed(0)} km/h</div>}
                <div>🕒 Updated {formatRelative(current.recordedAt)}</div>
              </div>
            </div>
          </Popup>
        </Marker>
      )}
    </MapContainer>
  );
}