"use client";

import React, { useState, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search, SlidersHorizontal, Battery, Zap, MapPin,
  Star, X, ChevronDown, Plus, Loader2, Car
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import HomeHeader from "@/app/home/HomeHeader";
import Footer from "@/app/component/Footer";

interface Vehicle {
  id: number;
  brand: string;
  model: string;
  name: string;
  category: string;
  img: string;
  pricePerDay: number;
  rating: number;
  range: string;
  charge: number;
  location: string;
  city: string;
  tags: string[];
  badge?: string;
  seats?: number;
  transmission: string;
  fuelType: string;
  isAvailable: boolean;
  photos: string[];
}

const categories = ["All", "Cars", "Bikes", "Scooters", "Cycles"];
const locations = ["All Locations", "Kathmandu", "Lalitpur", "Bhaktapur", "Pokhara"];
const sortOptions = ["Recommended", "Price: Low to High", "Price: High to Low", "Rating"];

export default function VehiclesPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  const [selectedLocation, setSelectedLocation] = useState("All Locations");
  const [sortBy, setSortBy] = useState("Recommended");
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 50000]);
  const [showFilters, setShowFilters] = useState(false);
  const [showSort, setShowSort] = useState(false);

  const getAccessToken = () => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('accessToken') || localStorage.getItem('token');
    }
    return null;
  };

  useEffect(() => {
    const token = getAccessToken();
    if (!token) {
      router.push('/signin');
      return;
    }
    fetchVehicles();
  }, []);

  const fetchVehicles = async () => {
    setLoading(true);
    try {
      const token = getAccessToken();
      if (!token) {
        router.push('/signin');
        return;
      }

      const response = await fetch('http://localhost:8080/api/vehicles/recent?page=0&size=100', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.status === 401) {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        router.push('/signin');
        return;
      }

      if (response.ok) {
        const data = await response.json();
        const vehicleList = data.content || [];

        const formattedVehicles = vehicleList.map((v: any) => ({
          id: v.id,
          brand: v.brand,
          model: v.model,
          name: `${v.brand} ${v.model}`,
          category: mapCategory(v.seats),
          img: v.photos && v.photos[0] ? v.photos[0] : '/car-placeholder.jpg',
          pricePerDay: v.pricePerDay,
          rating: v.averageRating || 4.5,
          range: getRangeByFuelType(v.fuelType),
          charge: getChargeByFuelType(v.fuelType),
          location: v.city,
          city: v.city,
          tags: extractTags(v),
          seats: v.seats,
          transmission: v.transmission,
          fuelType: v.fuelType,
          isAvailable: v.isAvailable,
          photos: v.photos || []
        }));

        setVehicles(formattedVehicles);
      } else {
        console.error('Failed to fetch vehicles:', response.status);
      }
    } catch (error) {
      console.error('Error fetching vehicles:', error);
    } finally {
      setLoading(false);
    }
  };

  const mapCategory = (seats: number): string => {
    if (seats === 2) return "Bikes";
    if (seats === 1) return "Cycles";
    return "Cars";
  };

  const getRangeByFuelType = (fuelType: string): string => {
    switch (fuelType?.toLowerCase()) {
      case 'electric': return '400 km';
      case 'hybrid': return '600 km';
      case 'petrol': return '500 km';
      case 'diesel': return '700 km';
      default: return '400 km';
    }
  };

  const getChargeByFuelType = (fuelType: string): number => {
    switch (fuelType?.toLowerCase()) {
      case 'electric': return 85;
      case 'hybrid': return 75;
      default: return 65;
    }
  };

  const extractTags = (vehicle: any): string[] => {
    const tags = [];
    if (vehicle.transmission === 'automatic') tags.push('Automatic');
    if (vehicle.seats >= 5) tags.push('Family');
    if (vehicle.fuelType === 'electric') tags.push('Eco-Friendly');
    if (vehicle.pricePerDay < 1000) tags.push('Budget');
    if (vehicle.pricePerDay > 5000) tags.push('Premium');
    return tags.slice(0, 3);
  };

  const filtered = useMemo(() => {
    let result = [...vehicles];

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(v =>
        v.name.toLowerCase().includes(q) ||
        v.brand.toLowerCase().includes(q) ||
        v.model.toLowerCase().includes(q) ||
        v.tags.some(t => t.toLowerCase().includes(q))
      );
    }

    if (activeCategory !== "All") {
      result = result.filter(v => v.category === activeCategory);
    }

    if (selectedLocation !== "All Locations") {
      result = result.filter(v => v.location === selectedLocation);
    }

    result = result.filter(v => v.pricePerDay >= priceRange[0] && v.pricePerDay <= priceRange[1]);

    switch (sortBy) {
      case "Price: Low to High":
        result = [...result].sort((a, b) => a.pricePerDay - b.pricePerDay);
        break;
      case "Price: High to Low":
        result = [...result].sort((a, b) => b.pricePerDay - a.pricePerDay);
        break;
      case "Rating":
        result = [...result].sort((a, b) => b.rating - a.rating);
        break;
      default:
        result = [...result].sort((a, b) => b.id - a.id);
    }

    return result;
  }, [searchQuery, activeCategory, selectedLocation, sortBy, priceRange, vehicles]);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-neutral-50">
        <HomeHeader />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="w-12 h-12 animate-spin text-emerald-600 mx-auto mb-4" />
            <p className="text-gray-600">Loading vehicles...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-neutral-50 font-['Inter',system-ui]">
      <HomeHeader />

      {/* Hero Section */}
      <div className="bg-gradient-to-br from-emerald-950 via-emerald-900 to-emerald-950 text-white relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 py-12 md:py-16 relative z-10">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight">
              Find Your Perfect <span className="text-emerald-400">Electric Ride</span>
            </h1>
            <p className="text-white/60 mt-2 max-w-lg">Browse our eco-friendly fleet. Filter by type, price, and location.</p>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="mt-6">
            <div className="flex items-center gap-3 bg-white/10 backdrop-blur-md border border-white/20 rounded-xl px-5 py-3">
              <Search className="w-5 h-5 text-white/50" />
              <input
                type="text"
                placeholder="Search vehicles by name or feature..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="flex-1 bg-transparent outline-none text-white placeholder-white/40"
              />
              {searchQuery && (
                <button onClick={() => setSearchQuery("")}>
                  <X className="w-4 h-4 text-white/50" />
                </button>
              )}
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }} className="flex flex-wrap justify-between items-center gap-4 mt-8">
            <div className="flex flex-wrap gap-2">
              {categories.map(cat => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${activeCategory === cat ? "bg-emerald-500 text-white shadow-lg" : "bg-white/10 text-white/80 hover:bg-white/20"}`}
                >
                  {cat}
                </button>
              ))}
            </div>
            <div className="flex flex-wrap gap-3">
              <select
                value={selectedLocation}
                onChange={e => setSelectedLocation(e.target.value)}
                className="bg-white/10 border border-white/20 rounded-lg px-3 py-1.5 text-sm text-white"
              >
                {locations.map(loc => (
                  <option key={loc} value={loc} className="text-gray-900">{loc}</option>
                ))}
              </select>
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center gap-2 px-3 py-1.5 bg-white/10 rounded-lg text-sm font-medium"
              >
                <SlidersHorizontal className="w-4 h-4" /> Filters
              </button>
              <div className="relative">
                <button
                  onClick={() => setShowSort(!showSort)}
                  className="flex items-center gap-2 px-3 py-1.5 bg-white/10 rounded-lg text-sm font-medium"
                >
                  <ChevronDown className="w-4 h-4" /> {sortBy}
                </button>
                {showSort && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-xl z-20">
                    {sortOptions.map(opt => (
                      <button
                        key={opt}
                        onClick={() => { setSortBy(opt); setShowSort(false); }}
                        className="block w-full text-left px-4 py-2 text-sm hover:bg-emerald-50"
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <Link
                href="/add-vehicle"
                className="flex items-center gap-2 px-4 py-1.5 bg-emerald-500 text-white rounded-lg text-sm font-medium"
              >
                <Plus className="w-4 h-4" /> Add Vehicle
              </Link>
            </div>
          </motion.div>

          <AnimatePresence>
            {showFilters && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-6 p-5 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20"
              >
                <div className="flex flex-wrap gap-6 items-center">
                  <div className="flex-1 min-w-[200px]">
                    <label className="text-white/80 text-sm block mb-2">
                      Price per day: ₹{priceRange[0]} — ₹{priceRange[1]}
                    </label>
                    <div className="flex gap-4">
                      <input type="range" min={0} max={50000} value={priceRange[0]}
                        onChange={e => setPriceRange([Math.min(+e.target.value, priceRange[1]), priceRange[1]])}
                        className="w-full accent-emerald-400"
                      />
                      <input type="range" min={0} max={50000} value={priceRange[1]}
                        onChange={e => setPriceRange([priceRange[0], Math.max(+e.target.value, priceRange[0])])}
                        className="w-full accent-emerald-400"
                      />
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      setPriceRange([0, 50000]);
                      setSelectedLocation("All Locations");
                      setActiveCategory("All");
                      setSortBy("Recommended");
                      setSearchQuery("");
                    }}
                    className="px-4 py-2 rounded-lg text-red-300 border border-white/20 text-sm hover:bg-white/10"
                  >
                    Reset all
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Results */}
      <main className="flex-1 max-w-7xl mx-auto px-6 py-10 w-full">
        <div className="flex justify-between items-center mb-6">
          <p className="text-gray-500 text-sm">
            Showing <strong>{filtered.length}</strong> vehicle{filtered.length !== 1 ? "s" : ""}
          </p>
        </div>

        {filtered.length === 0 ? (
          <div className="text-center py-20">
            <Car className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-700">No vehicles found</h3>
            <p className="text-gray-400 mt-2">Try adjusting your filters or check back later.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filtered.map((v) => (
              <div
                key={v.id}
                onClick={() => router.push(`/vehicles/${v.id}`)}
                className="group bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all overflow-hidden border border-gray-100 hover:border-emerald-200 cursor-pointer"
              >
                <div className="relative h-48 bg-gray-100 overflow-hidden">
                  <img
                    src={v.img}
                    alt={v.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = "https://via.placeholder.com/400x300?text=Vehicle";
                    }}
                  />
                </div>
                <div className="p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-bold text-gray-800 text-lg">{v.name}</h3>
                      <div className="flex items-center gap-2 mt-1">
                        <Star className="w-4 h-4 fill-yellow-500 text-yellow-500" />
                        <span className="text-sm font-medium">{v.rating}</span>
                        <span className="text-gray-400">•</span>
                        <span className="text-sm text-gray-500">{v.location}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-xl font-black text-emerald-600">₹{v.pricePerDay}</span>
                      <span className="text-xs text-gray-400"> /day</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 mt-3 text-xs text-gray-500">
                    <span className="flex items-center gap-1">
                      <Zap className="w-3 h-3 text-emerald-500" />
                      {v.range}
                    </span>
                    <span>{v.seats} seats</span>
                    <span className="capitalize">{v.transmission}</span>
                  </div>

                  <div className="flex flex-wrap gap-1.5 mt-3">
                    {v.tags.slice(0, 2).map(tag => (
                      <span key={tag} className="text-[10px] font-medium bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full">
                        {tag}
                      </span>
                    ))}
                  </div>

                  <button className="w-full mt-4 py-2 bg-emerald-50 text-emerald-700 rounded-lg text-sm font-semibold hover:bg-emerald-600 hover:text-white transition">
                    View Details
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}