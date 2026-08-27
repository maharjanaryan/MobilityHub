// app/maps/page.tsx
"use client";

import React, { useState, useEffect, useRef, useMemo, useCallback } from "react";
import dynamic from "next/dynamic";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { X, LogIn, ArrowLeft, Car, MapPin, Filter } from "lucide-react";
import Header from "../component/Header";
import HomeHeader from "../home/HomeHeader";
import { vehicleService } from "../services/vehicleService";
import { Vehicle, VehicleType } from "../types/vehicle";

type FilterType = "all" | VehicleType;
type DistanceFilter = "all" | 1 | 2 | 4 | 8 | 16;

interface UserLocation {
  lat: number;
  lng: number;
}

// Simple Login Required Modal Component
function LoginRequiredModal({
  isOpen,
  onClose,
  onLogin,
  onBack,
  vehicleName
}: {
  isOpen: boolean;
  onClose: () => void;
  onLogin: () => void;
  onBack: () => void;
  vehicleName: string;
}) {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-[1000]"
            onClick={onClose}
          />

          <div className="fixed inset-0 z-[1000] flex items-center justify-center px-4 pointer-events-none">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ duration: 0.2 }}
              className="relative w-full max-w-sm pointer-events-auto"
            >
              <div className="bg-white dark:bg-gray-900 rounded-xl shadow-2xl overflow-hidden">
                <div className="px-6 pt-5 pb-3 flex items-center justify-between border-b border-gray-100 dark:border-gray-800">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 bg-red-50 dark:bg-red-900/20 rounded-full flex items-center justify-center">
                      <LogIn className="w-4 h-4 text-red-500" />
                    </div>
                    <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100">Login Required</h3>
                  </div>
                  <button
                    onClick={onClose}
                    className="w-7 h-7 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors flex items-center justify-center"
                  >
                    <X className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                  </button>
                </div>

                <div className="px-6 py-5">
                  <div className="flex items-start gap-3 mb-5">
                    <div className="w-10 h-10 bg-amber-50 dark:bg-amber-900/20 rounded-full flex items-center justify-center flex-shrink-0">
                      <svg className="w-5 h-5 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-800 dark:text-gray-100">
                        Please sign in to rent
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        <span className="font-medium text-gray-700 dark:text-gray-300">{vehicleName}</span>
                      </p>
                    </div>
                  </div>

                  <div className="space-y-2.5">
                    <button
                      onClick={onLogin}
                      className="w-full py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium text-sm transition-colors flex items-center justify-center gap-2"
                    >
                      <LogIn className="w-4 h-4" />
                      Sign In
                    </button>

                    <button
                      onClick={onBack}
                      className="w-full py-2.5 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg font-medium text-sm transition-colors flex items-center justify-center gap-2"
                    >
                      <ArrowLeft className="w-4 h-4" />
                      Go Back
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}

const MapView = dynamic(() => import("./MapView"), {
  ssr: false,
  loading: () => (
    <div className="flex-1 flex items-center justify-center bg-gray-50 dark:bg-gray-950">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 border-4 border-green-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-gray-500 dark:text-gray-400 text-sm font-medium">Loading map...</p>
      </div>
    </div>
  ),
});

const typeIcons: Record<VehicleType, string> = {
  car: "🚗",
  bike: "🏍️",
  scooter: "🛵",
  cycle: "🚲"
};

const typeLabels: Record<VehicleType, string> = {
  car: "Cars",
  bike: "Bikes",
  scooter: "Scooters",
  cycle: "Cycles"
};

const typeBadgeColors: Record<VehicleType, string> = {
  car: "bg-blue-50 text-blue-600 border-blue-200",
  bike: "bg-orange-50 text-orange-600 border-orange-200",
  scooter: "bg-purple-50 text-purple-600 border-purple-200",
  cycle: "bg-emerald-50 text-emerald-600 border-emerald-200",
};

const distanceLabels: Record<DistanceFilter, string> = {
  all: "All Distances",
  1: "Within 1 km",
  2: "Within 2 km",
  4: "Within 4 km",
  8: "Within 8 km",
  16: "Within 16 km",
};

export default function MapsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [activeFilter, setActiveFilter] = useState<FilterType>("all");
  const [activeDistance, setActiveDistance] = useState<DistanceFilter>("all");
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  const [userLocation, setUserLocation] = useState<UserLocation | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(true);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [pendingVehicleId, setPendingVehicleId] = useState<number | null>(null);
  const cardRefs = useRef<Record<number, HTMLDivElement | null>>({});

  // Get highlighted vehicle from URL params
  const highlightVehicleId = searchParams.get('vehicleId');
  const highlightLat = searchParams.get('lat');
  const highlightLng = searchParams.get('lng');
  const shouldHighlight = searchParams.get('highlight') === 'true';

  // Check authentication status
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('accessToken');
      setIsAuthenticated(!!token);
    }
  }, []);

  // Handle highlighted vehicle from URL
  useEffect(() => {
    if (shouldHighlight && highlightVehicleId && highlightLat && highlightLng) {
      const existingVehicle = vehicles.find(v => v.id === parseInt(highlightVehicleId));

      if (existingVehicle) {
        setSelectedVehicle(existingVehicle);
        setTimeout(() => {
          cardRefs.current[existingVehicle.id]?.scrollIntoView({
            behavior: "smooth",
            block: "center"
          });
        }, 500);
      } else {
        const tempVehicle: Vehicle = {
          id: parseInt(highlightVehicleId),
          name: 'Selected Vehicle',
          type: 'car',
          lat: parseFloat(highlightLat),
          lng: parseFloat(highlightLng),
          battery: 80,
          range: 300,
          pricePerHour: 0,
          image: '/images/default-vehicle.jpg',
          brand: 'Selected',
          model: 'Vehicle',
          isAvailable: true
        };

        const storedData = sessionStorage.getItem('selectedVehicle');
        if (storedData) {
          try {
            const data = JSON.parse(storedData);
            tempVehicle.name = data.name || tempVehicle.name;
            tempVehicle.type = data.type || 'car';
            tempVehicle.pricePerHour = data.pricePerHour || tempVehicle.pricePerHour;
            tempVehicle.image = data.image || tempVehicle.image;
            tempVehicle.brand = data.brand || tempVehicle.brand;
            tempVehicle.model = data.model || tempVehicle.model;
          } catch (e) {
            console.error('Error parsing stored vehicle data:', e);
          }
        }

        setVehicles(prev => [...prev, tempVehicle]);
        setSelectedVehicle(tempVehicle);
      }

      sessionStorage.removeItem('selectedVehicle');
    }
  }, [shouldHighlight, highlightVehicleId, highlightLat, highlightLng, vehicles]);

  // Calculate distance between two coordinates (Haversine formula)
  const calculateDistance = useCallback((lat1: number, lng1: number, lat2: number, lng2: number): number => {
    const R = 6371; // Earth's radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLng / 2) * Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }, []);

  // Handle rent now click
  const handleRentNow = useCallback((e: React.MouseEvent, vehicleId: number) => {
    e.stopPropagation();
    e.preventDefault();

    const token = localStorage.getItem('accessToken');
    if (token) {
      router.push(`/vehicles/${vehicleId}`);
    } else {
      setPendingVehicleId(vehicleId);
      setShowLoginModal(true);
    }
  }, [router]);

  // Handle login from modal
  const handleLogin = useCallback(() => {
    if (pendingVehicleId) {
      localStorage.setItem('redirectAfterLogin', `/vehicles/${pendingVehicleId}`);
    }
    setShowLoginModal(false);
    setPendingVehicleId(null);
    router.push('/signin');
  }, [pendingVehicleId, router]);

  // Handle back from modal
  const handleBack = useCallback(() => {
    setShowLoginModal(false);
    setPendingVehicleId(null);
    setSelectedVehicle(null);
  }, []);

  // Get the vehicle name for the modal
  const getVehicleName = useCallback(() => {
    if (pendingVehicleId) {
      const vehicle = vehicles.find(v => v.id === pendingVehicleId);
      return vehicle ? `${vehicle.brand || ''} ${vehicle.model || ''}`.trim() || vehicle.name : 'this vehicle';
    }
    return 'this vehicle';
  }, [pendingVehicleId, vehicles]);

  // Get user location
  useEffect(() => {
    if (typeof navigator !== 'undefined' && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setUserLocation({
            lat: pos.coords.latitude,
            lng: pos.coords.longitude
          });
        },
        () => {
          setUserLocation({ lat: 27.7172, lng: 85.324 });
        }
      );
    } else {
      setUserLocation({ lat: 27.7172, lng: 85.324 });
    }
  }, []);

  // Fetch vehicles
  useEffect(() => {
    const fetchVehicles = async () => {
      try {
        setLoading(true);
        const data = await vehicleService.getFeaturedVehicles(0, 50);

        // Calculate distance from user for each vehicle
        const vehiclesWithDistance = data.map((vehicle: Vehicle) => {
          if (userLocation) {
            const distance = calculateDistance(
              userLocation.lat,
              userLocation.lng,
              vehicle.lat,
              vehicle.lng
            );
            return { ...vehicle, distanceFromUser: distance };
          }
          return vehicle;
        });

        setVehicles(vehiclesWithDistance);
      } catch (error) {
        console.error('Error fetching vehicles:', error);
        setVehicles([]);
      } finally {
        setLoading(false);
      }
    };

    fetchVehicles();
  }, [userLocation, calculateDistance]);

  // Filter vehicles by type and distance
  const filteredVehicles = useMemo<Vehicle[]>(() => {
    let result = vehicles;

    // Filter by type
    if (activeFilter !== "all") {
      result = result.filter((v) => v.type === activeFilter);
    }

    // Filter by distance
    if (activeDistance !== "all" && userLocation) {
      const maxDist = activeDistance;
      result = result.filter((v) => {
        const distance = v.distanceFromUser || calculateDistance(
          userLocation.lat,
          userLocation.lng,
          v.lat,
          v.lng
        );
        return distance <= maxDist;
      });
    }

    // Sort by distance (closest first)
    if (userLocation) {
      result = [...result].sort((a, b) => {
        const distA = a.distanceFromUser || calculateDistance(
          userLocation.lat,
          userLocation.lng,
          a.lat,
          a.lng
        );
        const distB = b.distanceFromUser || calculateDistance(
          userLocation.lat,
          userLocation.lng,
          b.lat,
          b.lng
        );
        return distA - distB;
      });
    }

    return result;
  }, [vehicles, activeFilter, activeDistance, userLocation, calculateDistance]);

  const handleSelectVehicle = useCallback((vehicle: Vehicle) => {
    setSelectedVehicle(vehicle);
    cardRefs.current[vehicle.id]?.scrollIntoView({
      behavior: "smooth",
      block: "nearest"
    });
  }, []);

  const handleDistanceChange = useCallback((distance: number) => {
    setActiveDistance(distance as DistanceFilter);
  }, []);

  const filters: FilterType[] = ["all", "car", "bike", "scooter", "cycle"];
  const distanceOptions: DistanceFilter[] = ["all", 1, 2, 4, 8, 16];

  const vehicleCounts = useMemo<Record<string, number>>(() => {
    const counts: Record<string, number> = { all: filteredVehicles.length };
    filteredVehicles.forEach((v) => {
      counts[v.type] = (counts[v.type] || 0) + 1;
    });
    return counts;
  }, [filteredVehicles]);

  if (loading) {
    return (
      <div className="flex flex-col h-screen">
        {isAuthenticated ? <HomeHeader /> : <Header />}
        <div className="flex-1 flex items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <div className="w-12 h-12 border-4 border-green-500 border-t-transparent rounded-full animate-spin" />
            <p className="text-gray-500 dark:text-gray-400 text-sm font-medium">Loading vehicles...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen overflow-hidden">
      {/* Login Required Modal */}
      <LoginRequiredModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        onLogin={handleLogin}
        onBack={handleBack}
        vehicleName={getVehicleName()}
      />

      <div className="flex-shrink-0">
        {isAuthenticated ? <HomeHeader /> : <Header />}
      </div>

      <div className="flex-1 flex overflow-hidden relative min-h-0">
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="absolute top-4 left-4 z-[1000] md:hidden bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 p-2.5 rounded-xl shadow-lg"
        >
          {sidebarOpen ? (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          ) : (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          )}
        </button>

        {/* Sidebar */}
        <div className={`${sidebarOpen ? "translate-x-0" : "-translate-x-full"} transition-transform duration-300 absolute md:relative z-[999] w-80 md:w-[420px] h-full bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700 flex flex-col shadow-xl md:shadow-none`}>
          <div className="flex-shrink-0 px-6 pt-6 pb-4 border-b border-gray-100 dark:border-gray-800">
            <div className="flex items-center justify-between mb-1">
              <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2.5">
                <span className="w-8 h-8 bg-green-100 dark:bg-green-900/20 rounded-lg flex items-center justify-center">
                  <svg className="w-4 h-4 text-green-600 dark:text-green-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </span>
                Nearby Vehicles
              </h2>
              <span className="text-xs font-semibold text-green-700 dark:text-green-300 bg-green-50 dark:bg-green-900/20 px-2.5 py-1 rounded-full border border-green-200">
                {filteredVehicles.length} found
              </span>
            </div>
            <p className="text-gray-400 dark:text-gray-400 text-xs ml-[42px]">
              {userLocation ? 'Near your location' : 'Kathmandu & Lalitpur area'}
            </p>

            {/* Type Filters */}
            <div className="flex gap-2 mt-3 flex-wrap">
              {filters.map((f) => (
                <button
                  key={f}
                  onClick={() => {
                    setActiveFilter(f);
                    setSelectedVehicle(null);
                  }}
                  className={`px-3.5 py-2 rounded-xl text-xs font-semibold border transition-all duration-200 flex items-center gap-1.5 
                    ${activeFilter === f
                      ? "bg-green-600 text-white border-green-600 shadow-md shadow-green-200"
                      : "bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-300 border-gray-200 dark:border-gray-700 hover:border-green-300 hover:bg-green-50 dark:hover:bg-green-900/20 hover:text-green-700 dark:hover:text-green-300"
                    }`}
                >
                  {f === "all" ? "🔋" : typeIcons[f as VehicleType]}
                  {f === "all" ? "All" : typeLabels[f as VehicleType]}
                  <span className={`text-[10px] ml-0.5 ${activeFilter === f ? "text-green-100" : "text-gray-400"}`}>
                    {vehicleCounts[f] || 0}
                  </span>
                </button>
              ))}
            </div>

            {/* Distance Filters */}
            <div className="flex items-center gap-2 mt-3">
              <MapPin className="w-3.5 h-3.5 text-gray-400" />
              <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">Distance:</span>
              <div className="flex gap-1 flex-wrap">
                {distanceOptions.map((d) => (
                  <button
                    key={d}
                    onClick={() => {
                      setActiveDistance(d);
                      setSelectedVehicle(null);
                    }}
                    className={`px-2.5 py-1 rounded-lg text-[10px] font-medium border transition-all duration-200
                      ${activeDistance === d
                        ? "bg-green-600 text-white border-green-600"
                        : "bg-gray-50 dark:bg-gray-800 text-gray-500 dark:text-gray-400 border-gray-200 dark:border-gray-700 hover:border-green-300 hover:bg-green-50 dark:hover:bg-green-900/20"
                      }`}
                  >
                    {d === "all" ? "All" : `${d}km`}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Vehicle List */}
          <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3 min-h-0">
            {filteredVehicles.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-64 text-center p-4">
                <div className="text-5xl mb-4">🛵</div>
                <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300">No vehicles found</h3>
                <p className="text-gray-400 text-sm mt-1">Try adjusting your filters</p>
                {activeDistance !== "all" && (
                  <button
                    onClick={() => setActiveDistance("all")}
                    className="mt-3 text-sm text-green-600 dark:text-green-400 hover:underline"
                  >
                    Show all distances
                  </button>
                )}
              </div>
            ) : (
              filteredVehicles.map((vehicle) => {
                const isSelected = selectedVehicle?.id === vehicle.id;
                const distance = vehicle.distanceFromUser || (userLocation ? calculateDistance(
                  userLocation.lat,
                  userLocation.lng,
                  vehicle.lat,
                  vehicle.lng
                ) : null);

                // Get distance category for badge
                let distanceBadge = '';
                if (distance !== null) {
                  if (distance <= 1) distanceBadge = '🟢 < 1km';
                  else if (distance <= 2) distanceBadge = '🟢 2km';
                  else if (distance <= 4) distanceBadge = '🟡 4km';
                  else if (distance <= 8) distanceBadge = '🟠 8km';
                  else distanceBadge = '🔴 > 8km';
                }

                return (
                  <div
                    key={vehicle.id}
                    ref={(el) => { cardRefs.current[vehicle.id] = el; }}
                    onClick={() => handleSelectVehicle(vehicle)}
                    className={`rounded-2xl p-3.5 cursor-pointer transition-all duration-200 border group 
                      ${isSelected
                        ? "bg-green-50 dark:bg-green-900/20 border-green-300 shadow-lg ring-1 ring-green-200"
                        : "bg-white dark:bg-gray-900 border-gray-100 dark:border-gray-800 hover:border-gray-200 hover:shadow-md"
                      }`}
                  >
                    <div className="flex gap-3.5">
                      <div className={`w-24 h-[72px] rounded-xl overflow-hidden shrink-0 border ${isSelected ? "border-green-200" : "border-gray-100 dark:border-gray-800"}`}>
                        <img
                          src={vehicle.image}
                          alt={vehicle.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = '/images/default-vehicle.jpg';
                          }}
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <h3 className="text-gray-900 dark:text-gray-100 font-semibold text-sm truncate leading-tight">
                            {vehicle.name}
                          </h3>
                          <span className={`text-[10px] px-2 py-0.5 rounded-full border shrink-0 font-medium ${typeBadgeColors[vehicle.type]}`}>
                            {typeIcons[vehicle.type]} {vehicle.type}
                          </span>
                        </div>

                        <div className="flex items-center gap-3 mt-2">
                          <span className="text-xs text-gray-400 flex items-center gap-1">
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                            </svg>
                            {vehicle.range}km
                          </span>
                          {distance !== null && (
                            <>
                              <span className="text-xs text-gray-300">•</span>
                              <span className={`text-[10px] flex items-center gap-0.5 font-medium ${distance <= 2 ? 'text-green-600' :
                                distance <= 4 ? 'text-yellow-600' :
                                  distance <= 8 ? 'text-orange-600' :
                                    'text-red-500'
                                }`}>
                                📍 {distance.toFixed(1)}km
                              </span>
                              <span className="text-[9px] text-gray-400 bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded-full">
                                {distanceBadge}
                              </span>
                            </>
                          )}
                        </div>

                        <div className="mt-2 flex items-center justify-between">
                          <span className="text-green-700 dark:text-green-300 font-bold text-sm">
                            Rs.{vehicle.pricePerHour}
                            <span className="text-gray-400 font-normal text-[10px]"> /hr</span>
                          </span>
                          {isSelected && (
                            <button
                              className="bg-green-600 hover:bg-green-500 text-white text-[11px] px-3 py-1.5 rounded-lg font-semibold transition-colors shadow-sm"
                              onClick={(e) => handleRentNow(e, vehicle.id)}
                            >
                              Rent Now →
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Footer */}
          <div className="flex-shrink-0 px-6 py-4 border-t border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800">
            <div className="flex items-center justify-between text-xs text-gray-400">
              <span className="flex items-center gap-2">
                <MapPin className="w-3 h-3" />
                {activeDistance !== "all" ? `Showing within ${activeDistance}km` : 'Showing all distances'}
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                Live
              </span>
            </div>
          </div>
        </div>

        {/* Map Container */}
        <div className="flex-1 relative min-h-0">
          <MapView
            vehicles={filteredVehicles}
            selectedVehicle={selectedVehicle}
            onSelectVehicle={handleSelectVehicle}
            userLocation={userLocation}
            maxDistance={activeDistance === "all" ? 16 : activeDistance}
            onDistanceChange={handleDistanceChange}
          />
        </div>
      </div>
    </div>
  );
}