// components/LocationPicker.tsx
"use client";

import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import type { LatLngExpression } from "leaflet";

// Import CSS directly (works in client components)
import "leaflet/dist/leaflet.css";

// Dynamically import React Leaflet components with SSR disabled
const MapContainer = dynamic(
  () => import("react-leaflet").then((mod) => mod.MapContainer),
  {
    ssr: false,
    loading: () => <div className="h-full w-full bg-gray-100 flex items-center justify-center">Loading map...</div>
  }
);

const TileLayer = dynamic(
  () => import("react-leaflet").then((mod) => mod.TileLayer),
  { ssr: false }
);

const Marker = dynamic(
  () => import("react-leaflet").then((mod) => mod.Marker),
  { ssr: false }
);

const Popup = dynamic(
  () => import("react-leaflet").then((mod) => mod.Popup),
  { ssr: false }
);

// We'll import useMapEvents using a different approach
// Instead, we'll use the useMap hook and handle events manually

interface LocationPickerProps {
  onLocationSelect: (lat: number, lng: number, address: string) => void;
  initialLat?: number | string;
  initialLng?: number | string;
  initialAddress?: string;
  readOnly?: boolean;
  height?: string | number;
}

// Component to handle map clicks and marker dragging using useMap hook
function LocationMarker({
  onLocationSelect,
  position,
  setPosition,
  readOnly
}: any) {
  // Use the useMap hook directly
  const { useMap } = require("react-leaflet");
  const map = useMap();

  // Handle map click
  useEffect(() => {
    if (!map || readOnly) return;

    const handleClick = (e: any) => {
      const { lat, lng } = e.latlng;
      setPosition({ lat, lng });

      fetchAddress(lat, lng).then(address => {
        onLocationSelect(lat, lng, address);
      });
    };

    map.on('click', handleClick);

    return () => {
      map.off('click', handleClick);
    };
  }, [map, readOnly, setPosition, onLocationSelect]);

  // Fly to position when it changes
  useEffect(() => {
    if (position && map) {
      try {
        if (typeof map.flyTo === 'function') {
          map.flyTo([position.lat, position.lng], 16, {
            duration: 0.8
          });
        } else if (typeof map.setView === 'function') {
          map.setView([position.lat, position.lng], 16);
        }
      } catch (error) {
        console.warn('Map navigation error:', error);
      }
    }
  }, [position, map]);

  return position ? (
    <Marker
      position={[position.lat, position.lng]}
      draggable={!readOnly}
      eventHandlers={{
        dragend(e: any) {
          const marker = e.target;
          const pos = marker.getLatLng();
          const lat = pos.lat;
          const lng = pos.lng;
          setPosition({ lat, lng });
          fetchAddress(lat, lng).then(address => {
            onLocationSelect(lat, lng, address);
          });
        }
      }}
    >
      <Popup>
        <div className="text-center p-2">
          <p className="font-semibold text-sm">📍 Vehicle Location</p>
          <p className="text-xs text-gray-500">
            {position.lat.toFixed(6)}, {position.lng.toFixed(6)}
          </p>
        </div>
      </Popup>
    </Marker>
  ) : null;
}

// Fetch address from coordinates
async function fetchAddress(lat: number, lng: number): Promise<string> {
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`
    );
    const data = await response.json();

    if (data && data.display_name) {
      return data.display_name;
    }
    return `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
  } catch (error) {
    console.error("Error fetching address:", error);
    return `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
  }
}

export default function LocationPicker({
  onLocationSelect,
  initialLat = 27.7172,
  initialLng = 85.324,
  initialAddress = "",
  readOnly = false,
  height = 400
}: LocationPickerProps) {
  const [position, setPosition] = useState<{ lat: number; lng: number } | null>(null);
  const [address, setAddress] = useState(initialAddress);
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isMounted, setIsMounted] = useState(false);
  const [leafletLoaded, setLeafletLoaded] = useState(false);

  // Initialize position and handle client-side mounting
  useEffect(() => {
    setIsMounted(true);

    // Fix Leaflet icon issue on client side
    if (typeof window !== 'undefined' && !leafletLoaded) {
      import('leaflet').then((L) => {
        // @ts-ignore
        delete L.Icon.Default.prototype._getIconUrl;
        L.Icon.Default.mergeOptions({
          iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
          iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
          shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
        });
        setLeafletLoaded(true);
      });
    }
  }, [leafletLoaded]);

  // Set initial position
  useEffect(() => {
    if (!position && initialLat && initialLng) {
      const lat = typeof initialLat === 'string' ? parseFloat(initialLat) : initialLat;
      const lng = typeof initialLng === 'string' ? parseFloat(initialLng) : initialLng;
      setPosition({ lat, lng });
    }
  }, [initialLat, initialLng, position]);

  const getCurrentLocation = () => {
    setIsLoadingLocation(true);
    if (typeof navigator !== 'undefined' && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (pos) => {
          const { latitude, longitude } = pos.coords;
          const newPosition = { lat: latitude, lng: longitude };
          setPosition(newPosition);
          const addr = await fetchAddress(latitude, longitude);
          setAddress(addr);
          onLocationSelect(latitude, longitude, addr);
          setIsLoadingLocation(false);
        },
        (error) => {
          console.error("Error getting location:", error);
          setIsLoadingLocation(false);
          alert("Could not get your location. Please click on the map to select a location.");
        },
        { enableHighAccuracy: true }
      );
    } else {
      alert("Geolocation is not supported by your browser");
      setIsLoadingLocation(false);
    }
  };

  const searchLocation = async (query: string) => {
    if (!query.trim()) return;

    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=1`
      );
      const data = await response.json();

      if (data && data.length > 0) {
        const { lat, lon, display_name } = data[0];
        const latNum = parseFloat(lat);
        const lonNum = parseFloat(lon);
        setPosition({ lat: latNum, lng: lonNum });
        setAddress(display_name);
        onLocationSelect(latNum, lonNum, display_name);
      } else {
        alert("Location not found. Please try a different search term.");
      }
    } catch (error) {
      console.error('Error searching location:', error);
      alert("Error searching location. Please try again.");
    }
  };

  const handleLocationSelect = (lat: number, lng: number, addr: string) => {
    setPosition({ lat, lng });
    setAddress(addr);
    onLocationSelect(lat, lng, addr);
  };

  // Don't render on server side
  if (!isMounted) {
    return (
      <div
        className="bg-gray-100 rounded-lg flex items-center justify-center"
        style={{ height: typeof height === 'number' ? `${height}px` : height }}
      >
        <div className="text-gray-500">Loading map...</div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-3 items-center">
        <div className="flex-1 min-w-[200px]">
          <input
            type="text"
            placeholder="Search for a location..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && searchLocation(searchQuery)}
            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>
        <button
          type="button"
          onClick={() => searchLocation(searchQuery)}
          className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors flex items-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          Search
        </button>
        <button
          type="button"
          onClick={getCurrentLocation}
          disabled={isLoadingLocation || readOnly}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
        >
          {isLoadingLocation ? (
            <>
              <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Getting location...
            </>
          ) : (
            <>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              Use My Location
            </>
          )}
        </button>
        {!readOnly && (
          <span className="text-sm text-gray-500 ml-2">
            Or click on the map
          </span>
        )}
      </div>

      <div
        className="border rounded-lg overflow-hidden relative"
        style={{ height: typeof height === 'number' ? `${height}px` : height }}
      >
        <MapContainer
          center={[27.7172, 85.324] as LatLngExpression}
          zoom={14}
          className="w-full h-full"
          style={{ background: "#f8fafc" }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
          />

          <LocationMarker
            onLocationSelect={handleLocationSelect}
            position={position}
            setPosition={setPosition}
            readOnly={readOnly}
          />
        </MapContainer>

        {position && (
          <div className="absolute bottom-4 left-4 right-4 bg-white/95 backdrop-blur-sm rounded-lg shadow-lg p-3">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-sm">
              <div>
                <span className="text-gray-500">Latitude:</span>
                <span className="ml-2 font-medium">{position.lat.toFixed(6)}</span>
              </div>
              <div>
                <span className="text-gray-500">Longitude:</span>
                <span className="ml-2 font-medium">{position.lng.toFixed(6)}</span>
              </div>
              {address && (
                <div className="col-span-1 md:col-span-3">
                  <span className="text-gray-500">Address:</span>
                  <span className="ml-2 font-medium text-sm">{address}</span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {!readOnly && (
        <div className="flex items-start gap-2 text-xs text-gray-500">
          <span>💡</span>
          <div>
            <p>Click on the map to set the vehicle's location.</p>
            <p>Drag the marker to fine-tune the position.</p>
          </div>
        </div>
      )}
    </div>
  );
}