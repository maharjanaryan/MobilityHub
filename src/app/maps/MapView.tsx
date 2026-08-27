// src/app/maps/MapView.tsx
"use client";

import React, { useEffect, useState, useCallback, useRef } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Polyline,
  useMap,
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import type { Vehicle } from "../types/vehicle";

// Fix default marker icons
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
});

type VehicleType = "car" | "bike" | "scooter" | "cycle";

interface UserLocation {
  lat: number;
  lng: number;
}

function createVehicleIcon(type: VehicleType, isSelected: boolean): L.DivIcon {
  const emojis: Record<VehicleType, string> = {
    car: "🚗",
    bike: "🏍️",
    scooter: "🛵",
    cycle: "🚲",
  };

  const bgColor = isSelected ? "#16a34a" : "#ffffff";
  const borderColor = isSelected ? "#15803d" : "#d1d5db";
  const size = isSelected ? 44 : 36;

  return L.divIcon({
    html: `<div style="
      width: ${size}px;
      height: ${size}px;
      background: ${bgColor};
      border: 2px solid ${borderColor};
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: ${isSelected ? "20px" : "16px"};
      box-shadow: 0 2px 8px rgba(0,0,0,0.2);
      transition: all 0.2s ease;
      ${isSelected ? "transform: scale(1.15);" : ""}
    ">${emojis[type] || "📍"}</div>`,
    className: "",
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
    popupAnchor: [0, -size / 2],
  });
}

function createUserIcon(): L.DivIcon {
  return L.divIcon({
    html: `<div style="
      width: 20px;
      height: 20px;
      background: #3b82f6;
      border: 3px solid #ffffff;
      border-radius: 50%;
      box-shadow: 0 0 0 6px rgba(59, 130, 246, 0.3), 0 4px 8px rgba(0,0,0,0.3);
    "></div>`,
    className: "",
    iconSize: [20, 20],
    iconAnchor: [10, 10],
  });
}

type RouteCoords = [number, number][] | null;

interface FlyToProps {
  selectedVehicle: Vehicle | null;
  userLocation: UserLocation | null;
  onRouteFound: (
    coords: RouteCoords,
    distance: string | null,
    duration: number | null
  ) => void;
}

function FlyToVehicleAndRoute({
  selectedVehicle,
  userLocation,
  onRouteFound,
}: FlyToProps) {
  const map = useMap();

  useEffect(() => {
    if (!map) return;

    if (selectedVehicle && userLocation) {
      try {
        const bounds = L.latLngBounds(
          [userLocation.lat, userLocation.lng],
          [selectedVehicle.lat, selectedVehicle.lng]
        );
        map.flyToBounds(bounds.pad(0.3), { duration: 0.8 });
      } catch (error) {
        console.warn('Error flying to bounds:', error);
      }

      const fetchRoute = async () => {
        try {
          const url = `https://router.project-osrm.org/route/v1/driving/${userLocation.lng},${userLocation.lat};${selectedVehicle.lng},${selectedVehicle.lat}?overview=full&geometries=geojson`;
          const res = await fetch(url);
          const data = await res.json();

          if (data.routes && data.routes.length > 0) {
            const coords: [number, number][] = data.routes[0].geometry.coordinates.map(
              ([lng, lat]: [number, number]) => [lat, lng]
            );
            const distance: string = (data.routes[0].distance / 1000).toFixed(1);
            const duration: number = Math.ceil(data.routes[0].duration / 60);
            onRouteFound(coords, distance, duration);
          }
        } catch (err) {
          console.error("Failed to fetch route:", err);
          onRouteFound(
            [
              [userLocation.lat, userLocation.lng],
              [selectedVehicle.lat, selectedVehicle.lng],
            ],
            null,
            null
          );
        }
      };

      fetchRoute();
    } else if (selectedVehicle) {
      try {
        map.flyTo([selectedVehicle.lat, selectedVehicle.lng], 16, {
          duration: 0.8,
        });
      } catch (error) {
        console.warn('Error flying to vehicle:', error);
      }
      onRouteFound(null, null, null);
    } else {
      onRouteFound(null, null, null);
    }
  }, [selectedVehicle, userLocation, map, onRouteFound]);

  return null;
}

interface MapViewProps {
  vehicles: Vehicle[];
  selectedVehicle: Vehicle | null;
  onSelectVehicle: (vehicle: Vehicle) => void;
  userLocation: UserLocation | null;
  maxDistance?: number;
  onDistanceChange?: (distance: number) => void;
}

// Route Info Badge
function RouteInfoBadge({ distance, duration }: { distance: string; duration: number | null }) {
  const map = useMap();
  const controlRef = useRef<L.Control | null>(null);

  useEffect(() => {
    if (!map) {
      console.warn('Map not available for RouteInfoBadge');
      return;
    }

    const cleanup = () => {
      if (controlRef.current) {
        try {
          controlRef.current.remove();
        } catch (e) {
          // Ignore removal errors
        }
        controlRef.current = null;
      }
    };

    cleanup();

    if (!distance || !duration) {
      return;
    }

    const timeoutId = setTimeout(() => {
      try {
        if (!map || !map.getContainer()) {
          console.warn('Map container not ready');
          return;
        }

        const CustomControl = L.Control.extend({
          onAdd: function () {
            try {
              const container = L.DomUtil.create('div', 'route-info-container');
              container.style.cssText = `
                background: #ffffff;
                border-radius: 12px;
                padding: 12px 18px;
                box-shadow: 0 4px 16px rgba(0,0,0,0.12);
                font-family: system-ui, sans-serif;
                border: 1px solid #e5e7eb;
                min-width: 140px;
                pointer-events: none;
                user-select: none;
              `;

              container.innerHTML = `
                <div style="font-size: 11px; color: #6b7280; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 6px;">
                  Route Info
                </div>
                <div style="display: flex; gap: 16px; align-items: center;">
                  <div>
                    <div style="font-size: 18px; font-weight: 700; color: #111827;">${distance} km</div>
                    <div style="font-size: 11px; color: #9ca3af;">Distance</div>
                  </div>
                  <div style="width: 1px; height: 30px; background: #e5e7eb;"></div>
                  <div>
                    <div style="font-size: 18px; font-weight: 700; color: #111827;">${duration} min</div>
                    <div style="font-size: 11px; color: #9ca3af;">Est. Time</div>
                  </div>
                </div>
              `;

              return container;
            } catch (error) {
              console.error('Error creating route info badge:', error);
              return L.DomUtil.create('div', 'route-info-error');
            }
          }
        });

        const control = new CustomControl({ position: 'topright' });
        control.addTo(map);
        controlRef.current = control;
      } catch (error) {
        console.error('Error adding route info badge:', error);
      }
    }, 150);

    return () => {
      clearTimeout(timeoutId);
      cleanup();
    };
  }, [map, distance, duration]);

  return null;
}

export default function MapView({
  vehicles,
  selectedVehicle,
  onSelectVehicle,
  userLocation,
  maxDistance = 16,
  onDistanceChange,
}: MapViewProps) {
  const defaultCenter: [number, number] = [27.7172, 85.324];
  const center: [number, number] = userLocation
    ? [userLocation.lat, userLocation.lng]
    : defaultCenter;

  const [routeCoords, setRouteCoords] = useState<RouteCoords>(null);
  const [routeInfo, setRouteInfo] = useState<{
    distance: string | null;
    duration: number | null;
  }>({ distance: null, duration: null });

  const [tileProviderIndex, setTileProviderIndex] = useState(0);

  // Tile providers - clean and reliable
  const tileProviders = [
    {
      url: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      name: "OSM Standard"
    },
    {
      url: "https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png",
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      name: "OSM HOT"
    },
    {
      url: "https://tile.openstreetmap.bzh/br/{z}/{x}/{y}.png",
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      name: "OSM BZH"
    },
  ];

  const currentProvider = tileProviders[tileProviderIndex % tileProviders.length];

  const handleTileError = useCallback(() => {
    setTileProviderIndex(prev => (prev + 1) % tileProviders.length);
  }, []);

  const handleRouteFound = useCallback(
    (coords: RouteCoords, distance: string | null, duration: number | null) => {
      setRouteCoords(coords);
      setRouteInfo({ distance, duration });
    },
    []
  );

  return (
    <MapContainer
      center={center}
      zoom={14}
      className="w-full h-full"
      zoomControl={false}
      style={{
        background: "#f0f2f5",
        width: "100%",
        height: "100%",
      }}
    >
      <TileLayer
        key={currentProvider.url}
        attribution={currentProvider.attribution}
        url={currentProvider.url}
        eventHandlers={{
          tileerror: handleTileError,
        }}
        crossOrigin={true}
        keepBuffer={2}
        updateWhenIdle={true}
        updateWhenZooming={false}
      />

      <FlyToVehicleAndRoute
        selectedVehicle={selectedVehicle}
        userLocation={userLocation}
        onRouteFound={handleRouteFound}
      />

      {routeCoords && (
        <>
          <Polyline
            positions={routeCoords}
            pathOptions={{ color: "#000000", weight: 6, opacity: 0.1 }}
          />
          <Polyline
            positions={routeCoords}
            pathOptions={{
              color: "#22c55e",
              weight: 4,
              opacity: 0.8,
              lineCap: "round",
              lineJoin: "round",
            }}
          />
        </>
      )}

      {routeCoords && routeInfo.distance && (
        <RouteInfoBadge
          distance={routeInfo.distance}
          duration={routeInfo.duration}
        />
      )}

      {userLocation && (
        <Marker
          position={[userLocation.lat, userLocation.lng]}
          icon={createUserIcon()}
        >
          <Popup className="custom-popup">
            <div style={{ textAlign: "center", padding: "4px 8px" }}>
              <strong>📍 You are here</strong>
            </div>
          </Popup>
        </Marker>
      )}

      {vehicles.map((vehicle) => {
        const isSelected = selectedVehicle?.id === vehicle.id;
        return (
          <Marker
            key={vehicle.id}
            position={[vehicle.lat, vehicle.lng]}
            icon={createVehicleIcon(vehicle.type, isSelected)}
            eventHandlers={{ click: () => onSelectVehicle(vehicle) }}
          >
            <Popup className="custom-popup" maxWidth={280}>
              <div
                style={{
                  background: "#ffffff",
                  color: "#1f2937",
                  borderRadius: "12px",
                  overflow: "hidden",
                  minWidth: "240px",
                  fontFamily: "system-ui, sans-serif",
                  boxShadow: "0 4px 20px rgba(0,0,0,0.12)",
                }}
              >
                <div style={{ width: "100%", height: "120px", overflow: "hidden" }}>
                  <img
                    src={vehicle.image}
                    alt={vehicle.name}
                    style={{ width: "100%", height: "100%", objectFit: "cover" }}
                  />
                </div>
                <div style={{ padding: "12px 16px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                    <h3 style={{ margin: 0, fontSize: "16px", fontWeight: 700, color: "#111827" }}>
                      {vehicle.name}
                    </h3>
                    <span
                      style={{
                        fontSize: "11px",
                        padding: "2px 8px",
                        borderRadius: "999px",
                        background: "rgba(22, 163, 74, 0.1)",
                        color: "#16a34a",
                        border: "1px solid rgba(22, 163, 74, 0.25)",
                        textTransform: "capitalize",
                      }}
                    >
                      {vehicle.type}
                    </span>
                  </div>
                  <div style={{ display: "flex", gap: "16px", fontSize: "12px", color: "#6b7280", marginBottom: "12px" }}>
                    <span>🔋 {vehicle.battery}%</span>
                    <span>📏 {vehicle.range} km</span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ color: "#16a34a", fontWeight: 700, fontSize: "15px" }}>
                      Rs. {vehicle.pricePerHour}
                      <span style={{ color: "#9ca3af", fontWeight: 400, fontSize: "12px" }}> /hr</span>
                    </span>
                    <button
                      style={{
                        background: "#16a34a",
                        color: "#fff",
                        border: "none",
                        padding: "6px 14px",
                        borderRadius: "8px",
                        fontSize: "12px",
                        fontWeight: 600,
                        cursor: "pointer",
                      }}
                      onClick={(e) => {
                        e.stopPropagation();
                        // Handle rent now
                      }}
                    >
                      Rent Now →
                    </button>
                  </div>
                </div>
              </div>
            </Popup>
          </Marker>
        );
      })}
    </MapContainer>
  );
}