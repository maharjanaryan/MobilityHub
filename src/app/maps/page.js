"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import dynamic from "next/dynamic";
import Header from "../component/Header";
import vehicles from "./vehicleData";

// Dynamically import the map component to avoid SSR issues with Leaflet
const MapView = dynamic(() => import("./MapView"), {
  ssr: false,
  loading: () => (
    <div className="flex-1 flex items-center justify-center bg-gray-50">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 border-4 border-green-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-gray-500 text-sm font-medium">Loading map...</p>
      </div>
    </div>
  ),
});

const typeIcons = {
  car: "🚗",
  bike: "🏍️",
  scooter: "🛵",
  cycle: "🚲",
};

const typeLabels = {
  car: "Cars",
  bike: "Bikes",
  scooter: "Scooters",
  cycle: "Cycles",
};

const typeBadgeColors = {
  car: "bg-blue-50 text-blue-600 border-blue-200",
  bike: "bg-orange-50 text-orange-600 border-orange-200",
  scooter: "bg-purple-50 text-purple-600 border-purple-200",
  cycle: "bg-emerald-50 text-emerald-600 border-emerald-200",
};

export default function MapsPage() {
  const [activeFilter, setActiveFilter] = useState("all");
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [userLocation, setUserLocation] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const cardRefs = useRef({});

  // Get user location
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setUserLocation({
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
          });
        },
        () => {
          setUserLocation({ lat: 27.7172, lng: 85.324 });
        }
      );
    }
  }, []);

  const filteredVehicles = useMemo(() => {
    if (activeFilter === "all") return vehicles;
    return vehicles.filter((v) => v.type === activeFilter);
  }, [activeFilter]);

  const handleSelectVehicle = (vehicle) => {
    setSelectedVehicle(vehicle);
    if (cardRefs.current[vehicle.id]) {
      cardRefs.current[vehicle.id].scrollIntoView({
        behavior: "smooth",
        block: "nearest",
      });
    }
  };

  const filters = ["all", "car", "bike", "scooter", "cycle"];

  // Count vehicles per type
  const vehicleCounts = useMemo(() => {
    const counts = { all: vehicles.length };
    vehicles.forEach((v) => {
      counts[v.type] = (counts[v.type] || 0) + 1;
    });
    return counts;
  }, []);

  return (
    <div className="flex flex-col h-screen bg-white">
      <Header />

      <div className="flex flex-1 overflow-hidden relative">
        {/* Sidebar Toggle (mobile) */}
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="absolute top-4 left-4 z-[1000] md:hidden bg-white border border-gray-200 text-gray-700 p-2.5 rounded-xl shadow-lg hover:shadow-xl transition-shadow"
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

        {/* Sidebar — Light Theme */}
        <div
          className={`${
            sidebarOpen ? "translate-x-0" : "-translate-x-full"
          } transition-transform duration-300 absolute md:relative z-[999] w-80 md:w-[420px] h-full bg-white border-r border-gray-200 flex flex-col shadow-xl md:shadow-none`}
        >
          {/* Sidebar Header */}
          <div className="px-6 pt-6 pb-4 border-b border-gray-100">
            <div className="flex items-center justify-between mb-1">
              <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2.5">
                <span className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                  <svg className="w-4.5 h-4.5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
              Kathmandu & Lalitpur area
            </p>

            {/* Filters */}
            <div className="flex gap-2 mt-5 flex-wrap">
              {filters.map((f) => (
                <button
                  key={f}
                  onClick={() => {
                    setActiveFilter(f);
                    setSelectedVehicle(null);
                  }}
                  className={`px-3.5 py-2 rounded-xl text-xs font-semibold border transition-all duration-200 flex items-center gap-1.5 ${
                    activeFilter === f
                      ? "bg-green-600 text-white border-green-600 shadow-md shadow-green-200"
                      : "bg-gray-50 text-gray-600 border-gray-200 hover:border-green-300 hover:bg-green-50 hover:text-green-700"
                  }`}
                >
                  {f === "all" ? "🔋" : typeIcons[f]}
                  {f === "all" ? "All" : typeLabels[f]}
                  <span className={`text-[10px] ml-0.5 ${
                    activeFilter === f ? "text-green-100" : "text-gray-400"
                  }`}>
                    {vehicleCounts[f] || 0}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Vehicle List */}
          <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
            {filteredVehicles.map((vehicle) => {
              const isSelected = selectedVehicle?.id === vehicle.id;
              return (
                <div
                  key={vehicle.id}
                  ref={(el) => (cardRefs.current[vehicle.id] = el)}
                  onClick={() => handleSelectVehicle(vehicle)}
                  className={`rounded-2xl p-3.5 cursor-pointer transition-all duration-200 border group ${
                    isSelected
                      ? "bg-green-50 border-green-300 shadow-lg shadow-green-100/50 ring-1 ring-green-200"
                      : "bg-white border-gray-100 hover:border-gray-200 hover:shadow-md"
                  }`}
                >
                  <div className="flex gap-3.5">
                    {/* Vehicle Image */}
                    <div className={`w-24 h-[72px] rounded-xl overflow-hidden shrink-0 border ${
                      isSelected ? "border-green-200" : "border-gray-100"
                    }`}>
                      <img
                        src={vehicle.image}
                        alt={vehicle.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>

                    {/* Vehicle Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="text-gray-900 font-semibold text-sm truncate leading-tight">
                          {vehicle.name}
                        </h3>
                        <span
                          className={`text-[10px] px-2 py-0.5 rounded-full border shrink-0 font-medium ${typeBadgeColors[vehicle.type]}`}
                        >
                          {typeIcons[vehicle.type]} {vehicle.type}
                        </span>
                      </div>

                      {/* Stats */}
                      <div className="flex items-center gap-3 mt-2">
                        {/* Battery bar */}
                        <div className="flex items-center gap-1.5 flex-1">
                          <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full transition-all ${
                                vehicle.battery > 70 ? "bg-green-500" : vehicle.battery > 40 ? "bg-yellow-500" : "bg-red-500"
                              }`}
                              style={{ width: `${vehicle.battery}%` }}
                            ></div>
                          </div>
                          <span className="text-[10px] text-gray-500 font-medium shrink-0">
                            {vehicle.battery}%
                          </span>
                        </div>
                        {/* Range */}
                        <span className="text-[10px] text-gray-400 flex items-center gap-0.5 shrink-0">
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                          </svg>
                          {vehicle.range}km
                        </span>
                      </div>

                      {/* Price + CTA */}
                      <div className="mt-2 flex items-center justify-between">
                        <span className="text-green-700 font-bold text-sm">
                          Rs.{vehicle.pricePerHour}
                          <span className="text-gray-400 font-normal text-[10px]"> /hr</span>
                        </span>
                        {isSelected && (
                          <button className="bg-green-600 hover:bg-green-500 text-white text-[11px] px-3 py-1.5 rounded-lg font-semibold transition-colors shadow-sm">
                            Rent Now →
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Sidebar Footer */}
          <div className="px-6 py-4 border-t border-gray-100 bg-gray-50/50">
            <div className="flex items-center justify-between text-xs text-gray-400">
              <span>Powered by OpenStreetMap</span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                Live
              </span>
            </div>
          </div>
        </div>

        {/* Map Area */}
        <div className="flex-1 relative">
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
