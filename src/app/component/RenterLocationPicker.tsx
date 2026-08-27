// app/component/RenterLocationPicker.tsx
'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, MapPin, Loader2, Home, Navigation, CheckCircle2, Search } from 'lucide-react';

// Dynamically import Leaflet with no SSR
const MapContainer = dynamic(
  () => import('react-leaflet').then((mod) => mod.MapContainer),
  { ssr: false, loading: () => <div className="h-full w-full bg-gray-100 flex items-center justify-center">Loading map...</div> }
);

const TileLayer = dynamic(
  () => import('react-leaflet').then((mod) => mod.TileLayer),
  { ssr: false }
);

const Marker = dynamic(
  () => import('react-leaflet').then((mod) => mod.Marker),
  { ssr: false }
);

const Popup = dynamic(
  () => import('react-leaflet').then((mod) => mod.Popup),
  { ssr: false }
);

import dynamic from 'next/dynamic';
import 'leaflet/dist/leaflet.css';

interface RenterLocationPickerProps {
  isOpen: boolean;
  onClose: () => void;
  onLocationSelect: (lat: number, lng: number, address: string) => void;
  initialLat?: number;
  initialLng?: number;
  initialAddress?: string;
  vehicleAddress?: string;
}

// ─────────────────────────────────────────────────────────────
// FETCH ADDRESS - Simple fallback
// ─────────────────────────────────────────────────────────────
async function fetchAddress(lat: number, lng: number): Promise<string> {
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`,
      {
        headers: { 'User-Agent': 'MobilityHub/1.0' }
      }
    );
    if (!response.ok) throw new Error('Failed to fetch');
    const data = await response.json();
    if (data && data.display_name) {
      return data.display_name;
    }
    return `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
  } catch (error) {
    console.warn('⚠️ Address fetch failed, using coordinates');
    return `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
  }
}

// ─────────────────────────────────────────────────────────────
// LOCATION MARKER
// ─────────────────────────────────────────────────────────────
function LocationMarker({ position, setPosition, onLocationSelect, setAddress }: any) {
  const { useMap } = require('react-leaflet');
  const map = useMap();

  useEffect(() => {
    if (!map) return;

    const handleClick = async (e: any) => {
      const { lat, lng } = e.latlng;
      console.log('📍 Map clicked:', { lat, lng });
      setPosition({ lat, lng });
      const address = await fetchAddress(lat, lng);
      setAddress(address);
      onLocationSelect(lat, lng, address);
    };

    map.on('click', handleClick);
    return () => { map.off('click', handleClick); };
  }, [map, setPosition, onLocationSelect, setAddress]);

  useEffect(() => {
    if (position && map) {
      map.flyTo([position.lat, position.lng], 16, { duration: 0.8 });
    }
  }, [position, map]);

  return position ? (
    <Marker
      position={[position.lat, position.lng]}
      draggable={true}
      eventHandlers={{
        dragend: async (e: any) => {
          const pos = e.target.getLatLng();
          const lat = pos.lat;
          const lng = pos.lng;
          setPosition({ lat, lng });
          const address = await fetchAddress(lat, lng);
          setAddress(address);
          onLocationSelect(lat, lng, address);
        }
      }}
    >
      <Popup>📍 Selected Location</Popup>
    </Marker>
  ) : null;
}

// ─────────────────────────────────────────────────────────────
// MAIN COMPONENT
// ─────────────────────────────────────────────────────────────
export default function RenterLocationPicker({
  isOpen,
  onClose,
  onLocationSelect,
  initialLat = 27.7172,
  initialLng = 85.324,
  initialAddress = '',
  vehicleAddress = '',
}: RenterLocationPickerProps) {
  const [position, setPosition] = useState<{ lat: number; lng: number } | null>(null);
  const [address, setAddress] = useState(initialAddress);
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);
  const [isConfirming, setIsConfirming] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isMounted, setIsMounted] = useState(false);
  const [leafletLoaded, setLeafletLoaded] = useState(false);

  // Mount and Leaflet setup
  useEffect(() => {
    setIsMounted(true);
    if (typeof window !== 'undefined' && !leafletLoaded) {
      import('leaflet').then((L) => {
        delete (L.Icon.Default.prototype as any)._getIconUrl;
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
      setPosition({ lat: initialLat, lng: initialLng });
    }
  }, [initialLat, initialLng, position]);

  // Reset when modal opens
  useEffect(() => {
    if (isOpen) {
      setAddress(initialAddress);
      if (initialLat && initialLng) {
        setPosition({ lat: initialLat, lng: initialLng });
      }
    }
  }, [isOpen, initialLat, initialLng, initialAddress]);

  // ─────────────────────────────────────────────────────────────
  // USE MY LOCATION
  // ─────────────────────────────────────────────────────────────
  const getCurrentLocation = () => {
    setIsLoadingLocation(true);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (pos) => {
          const { latitude, longitude } = pos.coords;
          setPosition({ lat: latitude, lng: longitude });
          const addr = await fetchAddress(latitude, longitude);
          setAddress(addr);
          onLocationSelect(latitude, longitude, addr);
          setIsLoadingLocation(false);
        },
        (error) => {
          console.error('Error getting location:', error);
          setIsLoadingLocation(false);
          alert('Could not get your location. Please click on the map.');
        },
        { enableHighAccuracy: true }
      );
    } else {
      alert('Geolocation is not supported');
      setIsLoadingLocation(false);
    }
  };

  // ─────────────────────────────────────────────────────────────
  // SEARCH LOCATION
  // ─────────────────────────────────────────────────────────────
  const searchLocation = async (query: string) => {
    if (!query.trim()) return;
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=1`,
        { headers: { 'User-Agent': 'MobilityHub/1.0' } }
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
        alert('Location not found. Please try again.');
      }
    } catch (error) {
      console.error('Error searching:', error);
      alert('Error searching location. Please try again.');
    }
  };

  // ─────────────────────────────────────────────────────────────
  // HANDLE CONFIRM
  // ─────────────────────────────────────────────────────────────
  const handleConfirm = () => {
    if (!address) {
      alert('Please select a location on the map first');
      return;
    }
    if (!position) {
      alert('Please select a location on the map first');
      return;
    }
    setIsConfirming(true);
    onLocationSelect(position.lat, position.lng, address);
    setTimeout(() => {
      setIsConfirming(false);
      onClose();
    }, 500);
  };

  if (!isOpen) return null;
  if (!isMounted) {
    return (
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center">
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-8">
          <Loader2 className="w-8 h-8 animate-spin text-emerald-500 mx-auto" />
          <p className="mt-2 text-gray-500">Loading map...</p>
        </div>
      </div>
    );
  }

  // Tile providers - using OpenStreetMap (no API key required)
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
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: 20 }}
            className="bg-white dark:bg-gray-800 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden shadow-2xl flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* ─── HEADER ─── */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 flex items-center gap-2">
                <Home className="w-5 h-5 text-emerald-500" />
                Your Delivery Location
              </h3>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition"
              >
                <X className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              </button>
            </div>

            {/* ─── VEHICLE INFO ─── */}
            {vehicleAddress && (
              <div className="px-4 pt-4 flex-shrink-0">
                <div className="p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                  <p className="text-sm text-blue-700 dark:text-blue-400 flex items-center gap-2">
                    <MapPin className="w-4 h-4" />
                    <span>Vehicle is located at: <strong>{vehicleAddress}</strong></span>
                  </p>
                </div>
              </div>
            )}

            {/* ─── SEARCH & CONTROLS ─── */}
            <div className="px-4 pt-4 flex-shrink-0">
              <div className="flex flex-wrap gap-2">
                <div className="flex-1 min-w-[150px]">
                  <input
                    type="text"
                    placeholder="Search location..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && searchLocation(searchQuery)}
                    className="w-full px-3 py-2 text-sm border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:bg-gray-800 dark:text-gray-200"
                  />
                </div>
                <button
                  onClick={() => searchLocation(searchQuery)}
                  className="px-3 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition flex items-center gap-1 text-sm"
                >
                  <Search className="w-4 h-4" /> Search
                </button>
                <button
                  onClick={getCurrentLocation}
                  disabled={isLoadingLocation}
                  className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50 flex items-center gap-1 text-sm"
                >
                  {isLoadingLocation ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Navigation className="w-4 h-4" />
                  )}
                  My Location
                </button>
              </div>
            </div>

            {/* ─── MAP ─── */}
            <div className="p-4 flex-1 min-h-[300px]">
              <div className="border rounded-lg overflow-hidden h-[350px] relative">
                <MapContainer
                  center={[27.7172, 85.324] as any}
                  zoom={14}
                  className="w-full h-full"
                  style={{ background: '#f8fafc' }}
                >
                  <TileLayer
                    attribution={tileProvider.attribution}
                    url={tileProvider.url}
                    crossOrigin={true}
                    keepBuffer={2}
                    updateWhenIdle={true}
                    updateWhenZooming={false}
                  />
                  <LocationMarker
                    position={position}
                    setPosition={setPosition}
                    onLocationSelect={(lat: number, lng: number, addr: string) => {
                      setAddress(addr);
                      onLocationSelect(lat, lng, addr);
                    }}
                    setAddress={setAddress}
                  />
                </MapContainer>

                {/* Selected location info overlay */}
                <div className="absolute bottom-3 left-3 right-3 bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm rounded-lg shadow-lg p-3">
                  <p className="text-xs text-gray-500 dark:text-gray-400">Selected Location</p>
                  <p className="text-sm font-medium text-gray-800 dark:text-gray-200 truncate">
                    {address || 'Click on the map to select'}
                  </p>
                  {position && (
                    <p className="text-xs text-gray-400 dark:text-gray-500">
                      📍 {position.lat.toFixed(6)}, {position.lng.toFixed(6)}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* ─── CONFIRM BUTTON ─── */}
            <div className="px-4 pb-4 flex-shrink-0">
              <div className="flex gap-3">
                <button
                  onClick={onClose}
                  className="flex-1 px-4 py-2.5 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 rounded-xl font-medium transition"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirm}
                  disabled={isConfirming || !address || !position}
                  className="flex-1 px-4 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-medium transition flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {isConfirming ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <CheckCircle2 className="w-4 h-4" />
                  )}
                  Confirm Location
                </button>
              </div>
            </div>

          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}