"use client";

import React, { useEffect, useRef } from "react";
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Fix default marker icon issue in Leaflet + webpack
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
});

// Custom icon creator using emoji
function createVehicleIcon(type, isSelected) {
  const emojis = {
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

// User location icon
function createUserIcon() {
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

// Component to fly to selected vehicle and fetch route
function FlyToVehicleAndRoute({ selectedVehicle, userLocation, onRouteFound }) {
  const map = useMap();

  useEffect(() => {
    if (selectedVehicle && userLocation) {
      // Fit map to show both user and vehicle
      const bounds = L.latLngBounds(
        [userLocation.lat, userLocation.lng],
        [selectedVehicle.lat, selectedVehicle.lng]
      );
      map.flyToBounds(bounds.pad(0.3), { duration: 0.8 });

      // Fetch route from OSRM
      const fetchRoute = async () => {
        try {
          const url = `https://router.project-osrm.org/route/v1/driving/${userLocation.lng},${userLocation.lat};${selectedVehicle.lng},${selectedVehicle.lat}?overview=full&geometries=geojson`;
          const res = await fetch(url);
          const data = await res.json();

          if (data.routes && data.routes.length > 0) {
            const coords = data.routes[0].geometry.coordinates.map(
              ([lng, lat]) => [lat, lng]
            );
            const distance = (data.routes[0].distance / 1000).toFixed(1); // km
            const duration = Math.ceil(data.routes[0].duration / 60); // minutes
            onRouteFound(coords, distance, duration);
          }
        } catch (err) {
          console.error("Failed to fetch route:", err);
          // Fallback: draw a straight line
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
      map.flyTo([selectedVehicle.lat, selectedVehicle.lng], 16, {
        duration: 0.8,
      });
      onRouteFound(null, null, null);
    } else {
      onRouteFound(null, null, null);
    }
  }, [selectedVehicle, userLocation, map, onRouteFound]);

  return null;
}

export default function MapView({
  vehicles,
  selectedVehicle,
  onSelectVehicle,
  userLocation,
}) {
  const defaultCenter = [27.7172, 85.324];
  const center = userLocation
    ? [userLocation.lat, userLocation.lng]
    : defaultCenter;

  const [routeCoords, setRouteCoords] = React.useState(null);
  const [routeInfo, setRouteInfo] = React.useState({ distance: null, duration: null });

  const handleRouteFound = React.useCallback((coords, distance, duration) => {
    setRouteCoords(coords);
    setRouteInfo({ distance, duration });
  }, []);

  return (
    <MapContainer
      center={center}
      zoom={14}
      className="w-full h-full"
      zoomControl={false}
      style={{ background: "#f8fafc" }}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/">CARTO</a>'
        url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
      />

      <FlyToVehicleAndRoute
        selectedVehicle={selectedVehicle}
        userLocation={userLocation}
        onRouteFound={handleRouteFound}
      />

      {/* Route polyline */}
      {routeCoords && (
        <>
          {/* Shadow line */}
          <Polyline
            positions={routeCoords}
            pathOptions={{
              color: "#000000",
              weight: 7,
              opacity: 0.15,
            }}
          />
          {/* Main route line */}
          <Polyline
            positions={routeCoords}
            pathOptions={{
              color: "#16a34a",
              weight: 5,
              opacity: 0.85,
              lineCap: "round",
              lineJoin: "round",
              dashArray: "12, 8",
            }}
          />
        </>
      )}

      {/* Route info badge */}
      {routeCoords && routeInfo.distance && (
        <RouteInfoBadge distance={routeInfo.distance} duration={routeInfo.duration} />
      )}

      {/* User location marker */}
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

      {/* Vehicle markers */}
      {vehicles.map((vehicle) => {
        const isSelected = selectedVehicle?.id === vehicle.id;
        return (
          <Marker
            key={vehicle.id}
            position={[vehicle.lat, vehicle.lng]}
            icon={createVehicleIcon(vehicle.type, isSelected)}
            eventHandlers={{
              click: () => onSelectVehicle(vehicle),
            }}
          >
            <Popup className="custom-popup" maxWidth={280}>
              <div style={{
                background: "#ffffff",
                color: "#1f2937",
                borderRadius: "12px",
                overflow: "hidden",
                minWidth: "240px",
                fontFamily: "system-ui, sans-serif",
                boxShadow: "0 4px 20px rgba(0,0,0,0.12)",
              }}>
                {/* Image */}
                <div style={{ width: "100%", height: "120px", overflow: "hidden" }}>
                  <img
                    src={vehicle.image}
                    alt={vehicle.name}
                    style={{ width: "100%", height: "100%", objectFit: "cover" }}
                  />
                </div>

                {/* Info */}
                <div style={{ padding: "12px 16px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                    <h3 style={{ margin: 0, fontSize: "16px", fontWeight: 700, color: "#111827" }}>
                      {vehicle.name}
                    </h3>
                    <span style={{
                      fontSize: "11px",
                      padding: "2px 8px",
                      borderRadius: "999px",
                      background: "rgba(22, 163, 74, 0.1)",
                      color: "#16a34a",
                      border: "1px solid rgba(22, 163, 74, 0.25)",
                      textTransform: "capitalize",
                    }}>
                      {vehicle.type}
                    </span>
                  </div>

                  <div style={{ display: "flex", gap: "16px", fontSize: "12px", color: "#6b7280", marginBottom: "12px" }}>
                    <span>🔋 {vehicle.battery}%</span>
                    <span>📏 {vehicle.range} km</span>
                  </div>

                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ color: "#16a34a", fontWeight: 700, fontSize: "15px" }}>
                      Rs. {vehicle.pricePerHour}<span style={{ color: "#9ca3af", fontWeight: 400, fontSize: "12px" }}> /hr</span>
                    </span>
                    <button style={{
                      background: "#16a34a",
                      color: "#fff",
                      border: "none",
                      padding: "6px 14px",
                      borderRadius: "8px",
                      fontSize: "12px",
                      fontWeight: 600,
                      cursor: "pointer",
                    }}>
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

// Route info badge displayed on the map
function RouteInfoBadge({ distance, duration }) {
  const map = useMap();

  useEffect(() => {
    const control = L.control({ position: "topright" });

    control.onAdd = function () {
      const div = L.DomUtil.create("div");
      div.innerHTML = `
        <div style="
          background: #ffffff;
          border-radius: 12px;
          padding: 12px 18px;
          box-shadow: 0 4px 16px rgba(0,0,0,0.12);
          font-family: system-ui, sans-serif;
          border: 1px solid #e5e7eb;
          min-width: 140px;
        ">
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
              <div style="font-size: 11px; color: #9ca3af;">Walking</div>
            </div>
          </div>
        </div>
      `;
      return div;
    };

    control.addTo(map);

    return () => {
      control.remove();
    };
  }, [map, distance, duration]);

  return null;
}
