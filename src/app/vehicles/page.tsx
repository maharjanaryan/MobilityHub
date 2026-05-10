// components/VehiclesPage.tsx  (or app/vehicles/page.tsx)
// Only the Book button change is highlighted — rest is your original code.
// Replace the existing <button> "Book" with the Link below.

"use client";

import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search, SlidersHorizontal, Battery, Zap, MapPin,
  Star, X, ChevronDown,
} from "lucide-react";
import Link from "next/link";           // ← add this import
import HomeHeader from "../home/HomeHeader";
import Footer from "../component/Footer";

interface Vehicle {
  id: number;
  name: string;
  category: string;
  img: string;
  price: number;
  rating: number;
  range: string;
  charge: number;
  location: string;
  tags: string[];
  badge?: string;
  seats?: number;
  speed: string;
}

const allVehicles: Vehicle[] = [
  { id: 1, name: "Lucid Air Touring", category: "Cars", img: "/Car.jpg", price: 120, rating: 4.9, range: "516 km", charge: 95, location: "Kathmandu", tags: ["Autopilot", "Luxury"], badge: "PREMIUM", seats: 5, speed: "250 km/h" },
  { id: 2, name: "Hyundai IONIQ 5", category: "Cars", img: "/ioniq.png", price: 80, rating: 4.7, range: "480 km", charge: 85, location: "Lalitpur", tags: ["Fast Charge", "Spacious"], badge: "POPULAR", seats: 5, speed: "185 km/h" },
  { id: 3, name: "BMW i4 eDrive40", category: "Cars", img: "/BMW.png", price: 100, rating: 4.8, range: "590 km", charge: 78, location: "Bhaktapur", tags: ["Premium Audio", "Sport"], badge: "TOP RATED", seats: 4, speed: "200 km/h" },
  { id: 4, name: "Tesla Model 3", category: "Cars", img: "/ev_car_white.png", price: 90, rating: 4.6, range: "510 km", charge: 92, location: "Kathmandu", tags: ["Autopilot", "Efficient"], seats: 5, speed: "225 km/h" },
  { id: 5, name: "Ather 450X", category: "Scooters", img: "/ev_scooter.png", price: 25, rating: 4.5, range: "105 km", charge: 88, location: "Pokhara", tags: ["Smart", "Connected"], badge: "ECO", seats: 2, speed: "80 km/h" },
  { id: 6, name: "Ola S1 Pro", category: "Scooters", img: "/scooters.jpg", price: 20, rating: 4.3, range: "135 km", charge: 70, location: "Kathmandu", tags: ["Budget", "City"], seats: 2, speed: "90 km/h" },
  { id: 7, name: "Revolt RV400", category: "Bikes", img: "/ev_motorcycle.png", price: 45, rating: 4.4, range: "150 km", charge: 60, location: "Lalitpur", tags: ["Sporty", "AI Sound"], badge: "NEW", seats: 2, speed: "85 km/h" },
  { id: 8, name: "Ultraviolette F77", category: "Bikes", img: "/bikes.jpg", price: 55, rating: 4.6, range: "200 km", charge: 75, location: "Bhaktapur", tags: ["Performance", "Track"], seats: 2, speed: "155 km/h" },
  { id: 9, name: "Trek Domane+ SLR", category: "Cycles", img: "/ev_bicycle.png", price: 15, rating: 4.2, range: "90 km", charge: 100, location: "Pokhara", tags: ["Fitness", "Trail"], seats: 1, speed: "45 km/h" },
  { id: 10, name: "Giant Trance X E+", category: "Cycles", img: "/cycle.jpg", price: 12, rating: 4.1, range: "75 km", charge: 95, location: "Kathmandu", tags: ["Mountain", "Assist"], seats: 1, speed: "40 km/h" },
  { id: 11, name: "Nissan Leaf", category: "Cars", img: "/leaf.png", price: 70, rating: 4.5, range: "364 km", charge: 82, location: "Pokhara", tags: ["Compact", "Family"], seats: 5, speed: "157 km/h" },
  { id: 12, name: "TVS iQube", category: "Scooters", img: "/ev_scooter.png", price: 18, rating: 4.0, range: "100 km", charge: 65, location: "Lalitpur", tags: ["Affordable", "Commute"], seats: 2, speed: "78 km/h" },
];

const categories = ["All", "Cars", "Bikes", "Scooters", "Cycles"];
const locations = ["All Locations", "Kathmandu", "Lalitpur", "Bhaktapur", "Pokhara"];
const sortOptions = ["Recommended", "Price: Low to High", "Price: High to Low", "Rating", "Range"];

export default function VehiclesPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  const [selectedLocation, setSelectedLocation] = useState("All Locations");
  const [sortBy, setSortBy] = useState("Recommended");
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 150]);
  const [showFilters, setShowFilters] = useState(false);
  const [showSort, setShowSort] = useState(false);

  const filtered = useMemo(() => {
    let result = allVehicles;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(v =>
        v.name.toLowerCase().includes(q) ||
        v.tags.some(t => t.toLowerCase().includes(q))
      );
    }
    if (activeCategory !== "All") result = result.filter(v => v.category === activeCategory);
    if (selectedLocation !== "All Locations") result = result.filter(v => v.location === selectedLocation);
    result = result.filter(v => v.price >= priceRange[0] && v.price <= priceRange[1]);
    switch (sortBy) {
      case "Price: Low to High": result = [...result].sort((a, b) => a.price - b.price); break;
      case "Price: High to Low": result = [...result].sort((a, b) => b.price - a.price); break;
      case "Rating": result = [...result].sort((a, b) => b.rating - a.rating); break;
      case "Range": result = [...result].sort((a, b) => parseInt(b.range) - parseInt(a.range)); break;
    }
    return result;
  }, [searchQuery, activeCategory, selectedLocation, sortBy, priceRange]);

  return (
    <div className="min-h-screen flex flex-col bg-neutral-50 font-['Inter',system-ui]">
      <HomeHeader />

      {/* Hero Section */}
      <div className="bg-gradient-to-br from-emerald-950 via-emerald-900 to-emerald-950 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1621609764180-2ca554a9c6f6?auto=format&fit=crop&q=80')] opacity-10 bg-cover bg-center mix-blend-overlay" />
        <div className="max-w-7xl mx-auto px-6 py-12 md:py-16 relative z-10">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight">
              Find Your Perfect <span className="text-emerald-400">Electric Ride</span>
            </h1>
            <p className="text-white/60 mt-2 max-w-lg">Browse our eco-friendly fleet. Filter by type, price, and location.</p>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="mt-6">
            <div className="flex items-center gap-3 bg-white/10 backdrop-blur-md border border-white/20 rounded-xl px-5 py-3 focus-within:ring-2 focus-within:ring-emerald-400 transition-all">
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
                  className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${activeCategory === cat
                      ? "bg-emerald-500 text-white shadow-lg"
                      : "bg-white/10 text-white/80 hover:bg-white/20"
                    }`}
                >
                  {cat}
                </button>
              ))}
            </div>
            <div className="flex gap-3">
              <select
                value={selectedLocation}
                onChange={e => setSelectedLocation(e.target.value)}
                className="bg-white/10 border border-white/20 rounded-lg px-3 py-1.5 text-sm text-white outline-none cursor-pointer"
              >
                {locations.map(loc => (
                  <option key={loc} value={loc} className="text-gray-900">{loc}</option>
                ))}
              </select>
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center gap-2 px-3 py-1.5 bg-white/10 border border-white/20 rounded-lg text-sm font-medium hover:bg-white/20 transition"
              >
                <SlidersHorizontal className="w-4 h-4" /> Filters
              </button>
              <div className="relative">
                <button
                  onClick={() => setShowSort(!showSort)}
                  className="flex items-center gap-2 px-3 py-1.5 bg-white/10 border border-white/20 rounded-lg text-sm font-medium hover:bg-white/20 transition"
                >
                  <ChevronDown className="w-4 h-4" /> {sortBy}
                </button>
                {showSort && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-xl border z-20 overflow-hidden">
                    <div className="py-1">
                      {sortOptions.map(opt => (
                        <button
                          key={opt}
                          onClick={() => { setSortBy(opt); setShowSort(false); }}
                          className={`block w-full text-left px-4 py-2 text-sm hover:bg-emerald-50 transition ${sortBy === opt ? "text-emerald-600 font-semibold bg-emerald-50" : "text-gray-700"
                            }`}
                        >
                          {opt}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
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
                      Price per hour:{" "}
                      <span className="text-emerald-300 font-bold">₹{priceRange[0]}</span> —{" "}
                      <span className="text-emerald-300 font-bold">₹{priceRange[1]}</span>
                    </label>
                    <div className="flex gap-4">
                      <input type="range" min={0} max={150} value={priceRange[0]}
                        onChange={e => setPriceRange([Math.min(+e.target.value, priceRange[1]), priceRange[1]])}
                        className="w-full accent-emerald-400"
                      />
                      <input type="range" min={0} max={150} value={priceRange[1]}
                        onChange={e => setPriceRange([priceRange[0], Math.max(+e.target.value, priceRange[0])])}
                        className="w-full accent-emerald-400"
                      />
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      setPriceRange([0, 150]);
                      setSelectedLocation("All Locations");
                      setActiveCategory("All");
                      setSortBy("Recommended");
                      setSearchQuery("");
                    }}
                    className="px-4 py-2 rounded-lg text-red-300 border border-white/20 text-sm hover:bg-white/10 transition"
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
        <div className="flex justify-between items-center mb-6 flex-wrap gap-2">
          <p className="text-gray-500 text-sm">
            Showing <strong className="text-gray-900">{filtered.length}</strong> vehicle{filtered.length !== 1 ? "s" : ""}
          </p>
          {selectedLocation !== "All Locations" && (
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-500">Filtering by:</span>
              <span className="px-2 py-1 bg-emerald-50 text-emerald-700 text-xs rounded-full flex items-center gap-1">
                <MapPin className="w-3 h-3" /> {selectedLocation}
                <button onClick={() => setSelectedLocation("All Locations")} className="ml-1 hover:text-red-500">
                  <X className="w-3 h-3" />
                </button>
              </span>
            </div>
          )}
        </div>

        {filtered.length === 0 ? (
          <div className="text-center py-20">
            <Search className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-700">No vehicles found</h3>
            <p className="text-gray-400">Try adjusting your filters or search query.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            <AnimatePresence mode="popLayout">
              {filtered.map((v, i) => (
                <motion.div
                  key={v.id}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ delay: i * 0.03 }}
                  className="group bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100 hover:border-emerald-200 relative"
                >
                  {v.badge && (
                    <div className="absolute z-10 m-3 px-2 py-0.5 bg-emerald-500 text-white text-[10px] font-bold rounded-full uppercase tracking-wider shadow-md">
                      {v.badge}
                    </div>
                  )}
                  {/* Clicking the card image/title also navigates to detail */}
                  <Link href={`/vehicles/${v.id}`} className="block">
                    <div className="relative h-44 bg-gray-100 overflow-hidden">
                      <img
                        src={v.img}
                        alt={v.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                        onError={e => {
                          (e.target as HTMLImageElement).src =
                            "https://via.placeholder.com/300x200?text=Vehicle+Image";
                        }}
                      />
                    </div>
                  </Link>
                  <div className="p-4">
                    <div className="flex justify-between items-start">
                      <Link href={`/vehicles/${v.id}`}>
                        <h3 className="font-bold text-gray-800 text-lg hover:text-emerald-600 transition">{v.name}</h3>
                      </Link>
                      <div className="flex items-center gap-0.5 bg-yellow-50 px-1.5 py-0.5 rounded-md">
                        <Star className="w-3 h-3 fill-yellow-500 text-yellow-500" />
                        <span className="text-xs font-bold text-yellow-700">{v.rating}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-gray-500 mt-1.5 flex-wrap">
                      <span className="flex items-center gap-1">
                        <Zap className="w-3 h-3 text-emerald-500" />
                        {v.range}
                      </span>
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-indigo-400" />
                        {v.location}
                      </span>
                      <span className="font-mono bg-gray-100 px-1.5 rounded">{v.speed}</span>
                    </div>
                    <div className="flex items-center gap-2 mt-3">
                      <Battery className={`w-3.5 h-3.5 ${v.charge > 80 ? "text-emerald-500" : v.charge > 50 ? "text-amber-500" : "text-red-500"}`} />
                      <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${v.charge > 80 ? "bg-emerald-500" : v.charge > 50 ? "bg-amber-500" : "bg-red-500"}`}
                          style={{ width: `${v.charge}%` }}
                        />
                      </div>
                      <span className="text-[11px] font-medium text-gray-600">{v.charge}%</span>
                    </div>
                    <div className="flex flex-wrap gap-1.5 mt-3">
                      <span className="text-[10px] font-medium bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
                        {v.category}
                      </span>
                      {v.tags.slice(0, 2).map(tag => (
                        <span key={tag} className="text-[10px] font-medium bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full">
                          {tag}
                        </span>
                      ))}
                    </div>
                    <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-100">
                      <div>
                        <span className="text-xl font-black text-emerald-600">₹{v.price}</span>
                        <span className="text-xs text-gray-400"> /hr</span>
                      </div>
                      {/* ✅ CHANGED: was <button>, now <Link> → navigates to detail page */}
                      <Link
                        href={`/vehicles/${v.id}`}
                        className="px-4 py-1.5 bg-emerald-50 text-emerald-700 rounded-full text-sm font-semibold hover:bg-emerald-600 hover:text-white transition shadow-sm"
                      >
                        Book
                      </Link>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}