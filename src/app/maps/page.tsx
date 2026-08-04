// app/maps/page.tsx
"use client";

import React, { useState, useEffect, useRef, useMemo, useCallback } from "react";
import dynamic from "next/dynamic";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { X, LogIn, ArrowLeft, Car } from "lucide-react";
import Header from "../component/Header";
import HomeHeader from "../home/HomeHeader";
import { vehicleService } from "../services/vehicleService";
import { Vehicle, VehicleType } from "../types/vehicle";

type FilterType = "all" | VehicleType;

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
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-[1000]"
            onClick={onClose}
          />

          {/* Modal */}
          <div className="fixed inset-0 z-[1000] flex items-center justify-center px-4 pointer-events-none">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ duration: 0.2 }}
              className="relative w-full max-w-sm pointer-events-auto"
            >
              <div className="bg-white rounded-xl shadow-2xl overflow-hidden">
                {/* Header */}
                <div className="px-6 pt-5 pb-3 flex items-center justify-between border-b border-gray-100">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 bg-red-50 rounded-full flex items-center justify-center">
                      <LogIn className="w-4 h-4 text-red-500" />
                    </div>
                    <h3 className="text-base font-semibold text-gray-900">Login Required</h3>
                  </div>
                  <button
                    onClick={onClose}
                    className="w-7 h-7 rounded-full hover:bg-gray-100 transition-colors flex items-center justify-center"
                  >
                    <X className="w-4 h-4 text-gray-500" />
                  </button>
                </div>

                {/* Body */}
                <div className="px-6 py-5">
                  <div className="flex items-start gap-3 mb-5">
                    <div className="w-10 h-10 bg-amber-50 rounded-full flex items-center justify-center flex-shrink-0">
                      <svg className="w-5 h-5 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-800">
                        Please sign in to rent
                      </p>
                      <p className="text-sm text-gray-500">
                        <span className="font-medium text-gray-700">{vehicleName}</span>
                      </p>
                    </div>
                  </div>

                  {/* Buttons */}
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
                      className="w-full py-2.5 border border-gray-200 hover:bg-gray-50 text-gray-700 rounded-lg font-medium text-sm transition-colors flex items-center justify-center gap-2"
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
    <div className="flex-1 flex items-center justify-center bg-gray-50">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 border-4 border-green-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-gray-500 text-sm font-medium">Loading map...</p>
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

export default function MapsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [activeFilter, setActiveFilter] = useState<FilterType>("all");
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
        setVehicles(data);
      } catch (error) {
        console.error('Error fetching vehicles:', error);
        setVehicles([]);
      } finally {
        setLoading(false);
      }
    };

    fetchVehicles();
  }, []);

  const filteredVehicles = useMemo<Vehicle[]>(() => {
    if (activeFilter === "all") return vehicles;
    return vehicles.filter((v) => v.type === activeFilter);
  }, [vehicles, activeFilter]);

  const handleSelectVehicle = useCallback((vehicle: Vehicle) => {
    setSelectedVehicle(vehicle);
    cardRefs.current[vehicle.id]?.scrollIntoView({
      behavior: "smooth",
      block: "nearest"
    });
  }, []);

  const filters: FilterType[] = ["all", "car", "bike", "scooter", "cycle"];

  const vehicleCounts = useMemo<Record<string, number>>(() => {
    const counts: Record<string, number> = { all: vehicles.length };
    vehicles.forEach((v) => {
      counts[v.type] = (counts[v.type] || 0) + 1;
    });
    return counts;
  }, [vehicles]);

  if (loading) {
    return (
      <div className="flex flex-col h-screen">
        {isAuthenticated ? <HomeHeader /> : <Header />}
        <div className="flex-1 flex items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <div className="w-12 h-12 border-4 border-green-500 border-t-transparent rounded-full animate-spin" />
            <p className="text-gray-500 text-sm font-medium">Loading vehicles...</p>
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
          className="absolute top-4 left-4 z-[1000] md:hidden bg-white border border-gray-200 text-gray-700 p-2.5 rounded-xl shadow-lg"
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
        <div className={`${sidebarOpen ? "translate-x-0" : "-translate-x-full"} transition-transform duration-300 absolute md:relative z-[999] w-80 md:w-[420px] h-full bg-white border-r border-gray-200 flex flex-col shadow-xl md:shadow-none`}>
          <div className="flex-shrink-0 px-6 pt-6 pb-4 border-b border-gray-100">
            <div className="flex items-center justify-between mb-1">
              <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2.5">
                <span className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                  <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </span>
                Nearby Vehicles
              </h2>
              <span className="text-xs font-semibold text-green-700 bg-green-50 px-2.5 py-1 rounded-full border border-green-200">
                {filteredVehicles.length} found
              </span>
            </div>
            <p className="text-gray-400 text-xs ml-[42px]">
              {userLocation ? 'Near your location' : 'Kathmandu & Lalitpur area'}
            </p>
            <div className="flex gap-2 mt-5 flex-wrap">
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
                      : "bg-gray-50 text-gray-600 border-gray-200 hover:border-green-300 hover:bg-green-50 hover:text-green-700"
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
          </div>

          {/* Vehicle List */}
          <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3 min-h-0">
            {filteredVehicles.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-64 text-center p-4">
                <div className="text-5xl mb-4">🛵</div>
                <h3 className="text-lg font-semibold text-gray-700">No vehicles found</h3>
                <p className="text-gray-400 text-sm mt-1">Try adjusting your filters</p>
              </div>
            ) : (
              filteredVehicles.map((vehicle) => {
                const isSelected = selectedVehicle?.id === vehicle.id;
                return (
                  <div
                    key={vehicle.id}
                    ref={(el) => { cardRefs.current[vehicle.id] = el; }}
                    onClick={() => handleSelectVehicle(vehicle)}
                    className={`rounded-2xl p-3.5 cursor-pointer transition-all duration-200 border group 
                      ${isSelected
                        ? "bg-green-50 border-green-300 shadow-lg ring-1 ring-green-200"
                        : "bg-white border-gray-100 hover:border-gray-200 hover:shadow-md"
                      }`}
                  >
                    <div className="flex gap-3.5">
                      <div className={`w-24 h-[72px] rounded-xl overflow-hidden shrink-0 border ${isSelected ? "border-green-200" : "border-gray-100"}`}>
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
                          <h3 className="text-gray-900 font-semibold text-sm truncate leading-tight">
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
                          {vehicle.distanceFromUser && (
                            <>
                              <span className="text-xs text-gray-300">•</span>
                              <span className="text-[10px] text-blue-500 flex items-center gap-0.5">
                                📍 {vehicle.distanceFromUser.toFixed(1)}km
                              </span>
                            </>
                          )}
                        </div>

                        <div className="mt-2 flex items-center justify-between">
                          <span className="text-green-700 font-bold text-sm">
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
          <div className="flex-shrink-0 px-6 py-4 border-t border-gray-100 bg-gray-50/50">
            <div className="flex items-center justify-between text-xs text-gray-400">
              <span>Powered by OpenStreetMap</span>
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
          />
        </div>
      </div>
    </div>
  );
}