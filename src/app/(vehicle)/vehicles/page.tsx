// app/(vehicle)/vehicles/page.tsx
"use client";

import React, { useState, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search, Battery, Zap, MapPin,
  Star, X, ChevronDown, Plus, Loader2, Car,
  Fuel, Users, Gauge, Filter, ArrowUpDown, TrendingUp,
  Clock, Sparkles, Leaf, Wallet,
  MessageSquare, Shield, AlertCircle
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import HomeHeader from "@/app/home/HomeHeader";
import Header from "@/app/component/Header";
import Footer from "@/app/component/Footer";

// SVG Placeholder as Data URI
const PLACEHOLDER_IMAGE = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 400 300'%3E%3Crect width='400' height='300' fill='%23e5e7eb'/%3E%3Crect x='50' y='80' width='300' height='140' rx='10' fill='%239ca3af'/%3E%3Crect x='70' y='100' width='260' height='80' rx='5' fill='%23d1d5db'/%3E%3Ccircle cx='110' cy='200' r='30' fill='%234b5563'/%3E%3Ccircle cx='290' cy='200' r='30' fill='%234b5563'/%3E%3Crect x='100' y='100' width='50' height='30' rx='3' fill='%239ca3af'/%3E%3Crect x='250' y='100' width='50' height='30' rx='3' fill='%239ca3af'/%3E%3Ctext x='200' y='270' font-family='Arial' font-size='16' fill='%236b7280' text-anchor='middle'%3E🚗 Vehicle%3C/text%3E%3C/svg%3E";

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
  ownerId?: number;
  ownerName?: string;
  lat?: number;
  lng?: number;
}

const categories = [
  { name: "All", icon: Car, color: "emerald" },
  { name: "Cars", icon: Car, color: "blue" },
  { name: "Bikes", icon: Zap, color: "purple" },
  { name: "Scooters", icon: Battery, color: "orange" },
  { name: "Cycles", icon: Leaf, color: "green" }
];

const sortOptions = [
  { label: "Recommended", icon: TrendingUp },
  { label: "Price: Low to High", icon: ArrowUpDown },
  { label: "Price: High to Low", icon: ArrowUpDown },
  { label: "Rating", icon: Star }
];

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
  const [kycLoading, setKycLoading] = useState<number | null>(null);
  const [chatLoading, setChatLoading] = useState<number | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // KYC Modal state
  const [showKycModal, setShowKycModal] = useState(false);
  const [selectedVehicleForKyc, setSelectedVehicleForKyc] = useState<number | null>(null);

  // Theme state
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Check for dark mode
  useEffect(() => {
    const checkDarkMode = () => {
      const isDark = document.documentElement.classList.contains('dark');
      setIsDarkMode(isDark);
    };

    checkDarkMode();

    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.attributeName === 'class') {
          checkDarkMode();
        }
      });
    });

    observer.observe(document.documentElement, { attributes: true });

    return () => observer.disconnect();
  }, []);

  const getAccessToken = () => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("accessToken") || localStorage.getItem("token");
    }
    return null;
  };

  const getUserData = () => {
    if (typeof window !== "undefined") {
      const userStr = localStorage.getItem("user");
      if (userStr) {
        try {
          return JSON.parse(userStr);
        } catch {
          return null;
        }
      }
    }
    return null;
  };

  const navigateToMapWithVehicle = (vehicle: Vehicle, e: React.MouseEvent) => {
    e.stopPropagation();

    if (!isAuthenticated) {
      router.push("/signin");
      return;
    }

    const vehicleData = {
      id: vehicle.id,
      name: vehicle.name,
      lat: vehicle.lat || 27.7172,
      lng: vehicle.lng || 85.324,
      pricePerHour: vehicle.pricePerDay,
      image: vehicle.img,
      type: vehicle.category?.toLowerCase().slice(0, -1) || 'car'
    };
    sessionStorage.setItem('selectedVehicle', JSON.stringify(vehicleData));

    router.push(`/maps?vehicleId=${vehicle.id}&lat=${vehicle.lat || 27.7172}&lng=${vehicle.lng || 85.324}&highlight=true`);
  };

  useEffect(() => {
    const token = getAccessToken();
    setIsAuthenticated(!!token);

    if (!token) {
      fetchVehicles();
      return;
    }

    fetchVehicles();
  }, []);

  const fetchVehicles = async () => {
    setLoading(true);
    try {
      const token = getAccessToken();
      const headers: HeadersInit = {
        "Content-Type": "application/json"
      };

      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }

      const response = await fetch("http://localhost:8080/api/vehicles/recent?page=0&size=100", {
        headers
      });

      if (response.status === 401) {
        localStorage.removeItem("accessToken");
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        setIsAuthenticated(false);
        const publicResponse = await fetch("http://localhost:8080/api/vehicles/recent?page=0&size=100");
        if (publicResponse.ok) {
          const data = await publicResponse.json();
          const vehicleList = data.content || [];
          setVehicles(vehicleList.map((v: any) => transformVehicle(v)));
        }
        setLoading(false);
        return;
      }

      if (response.ok) {
        const data = await response.json();
        const vehicleList = data.content || [];
        setVehicles(vehicleList.map((v: any) => transformVehicle(v)));
      }
    } catch (error) {
      console.error("Error fetching vehicles:", error);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Get display location from vehicle data
   */
  const getDisplayLocation = (v: any): string => {
    if (v.city && v.city.trim() !== "" && v.city !== "null" && v.city !== "undefined") {
      return v.city.trim();
    }
    if (v.address && v.address.trim() !== "" && v.address !== "null" && v.address !== "undefined") {
      const addressParts = v.address.split(',').map((part: string) => part.trim());
      const lastPart = addressParts[addressParts.length - 1];
      if (lastPart && lastPart !== "" && lastPart !== "null") {
        return lastPart;
      }
      return v.address.trim();
    }
    if (v.state && v.state.trim() !== "" && v.state !== "null" && v.state !== "undefined") {
      return v.state.trim();
    }
    return "Location N/A";
  };

  /**
   * Get owner name from vehicle data with proper fallbacks
   */
  const getOwnerName = (v: any): string => {
    // Check if ownerName is directly available (from backend)
    if (v.ownerName && v.ownerName.trim() !== "" && v.ownerName !== "null" && v.ownerName !== "undefined") {
      return v.ownerName.trim();
    }

    // Check if owner object exists with username or fullName
    if (v.owner) {
      if (v.owner.fullName && v.owner.fullName.trim() !== "") {
        return v.owner.fullName.trim();
      }
      if (v.owner.username && v.owner.username.trim() !== "") {
        return v.owner.username.trim();
      }
    }

    // Check if ownerId exists but no name - use a generic name
    if (v.ownerId) {
      return "Vehicle Owner";
    }

    // Ultimate fallback
    return "Vehicle Owner";
  };

  const transformVehicle = (v: any): Vehicle => {
    const displayLocation = getDisplayLocation(v);
    const ownerName = getOwnerName(v);

    return {
      id: v.id,
      brand: v.brand || "Unknown",
      model: v.model || "Unknown",
      name: `${v.brand || "Unknown"} ${v.model || "Unknown"}`,
      category: mapCategory(v.seats),
      img: v.photos?.[0] || PLACEHOLDER_IMAGE,
      pricePerDay: v.pricePerDay || 0,
      rating: v.averageRating || 4.5,
      range: getRangeByFuelType(v.fuelType),
      charge: getChargeByFuelType(v.fuelType),
      location: displayLocation,
      city: v.city || "N/A",
      tags: extractTags(v),
      seats: v.seats || 4,
      transmission: v.transmission || "Manual",
      fuelType: v.fuelType || "Petrol",
      isAvailable: v.isAvailable !== undefined ? v.isAvailable : true,
      photos: v.photos || [],
      ownerId: v.ownerId || v.owner?.id,
      ownerName: ownerName,
      lat: v.latitude || v.lat || 27.7172,
      lng: v.longitude || v.lng || 85.324
    };
  };

  const mapCategory = (seats: number): string => {
    if (seats === 2) return "Bikes";
    if (seats === 1) return "Cycles";
    return "Cars";
  };

  const getRangeByFuelType = (fuelType: string): string => {
    switch (fuelType?.toLowerCase()) {
      case "electric": return "400 km";
      case "hybrid": return "600 km";
      case "petrol": return "500 km";
      case "diesel": return "700 km";
      default: return "400 km";
    }
  };

  const getChargeByFuelType = (fuelType: string): number => {
    switch (fuelType?.toLowerCase()) {
      case "electric": return 85;
      case "hybrid": return 75;
      default: return 65;
    }
  };

  const extractTags = (vehicle: any): string[] => {
    const tags = [];
    if (vehicle.transmission === "automatic" || vehicle.transmission === "Automatic") tags.push("Automatic");
    if (vehicle.seats >= 5) tags.push("Family Friendly");
    if (vehicle.fuelType === "electric" || vehicle.fuelType === "Electric") tags.push("Eco-Friendly");
    if (vehicle.pricePerDay < 1000) tags.push("Budget");
    if (vehicle.pricePerDay > 5000) tags.push("Premium");
    return tags.slice(0, 3);
  };

  const startChatWithOwner = async (vehicleId: number, ownerId: number, ownerName: string, e: React.MouseEvent) => {
    e.stopPropagation();

    if (!isAuthenticated) {
      router.push("/signin");
      return;
    }

    const token = getAccessToken();
    if (!token) {
      router.push("/signin");
      return;
    }

    const user = getUserData();
    if (!user) {
      router.push("/signin");
      return;
    }

    if (user.id === ownerId) {
      alert("You cannot chat with yourself. This is your own vehicle.");
      return;
    }

    setChatLoading(vehicleId);

    try {
      const checkResponse = await fetch(`http://localhost:8080/api/chat/conversations`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (checkResponse.ok) {
        const conversations = await checkResponse.json();
        const existingConversation = conversations.find(
          (conv: any) => conv.otherUserId === ownerId
        );

        if (existingConversation) {
          router.push(`/chat?conversationId=${existingConversation.id}`);
          return;
        }
      }

      const messageData = {
        receiverId: ownerId,
        message: `Hi! I'm interested in your vehicle "${vehicles.find(v => v.id === vehicleId)?.name || 'vehicle'}". Is it still available?`
      };

      const sendResponse = await fetch('http://localhost:8080/api/chat/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(messageData)
      });

      if (sendResponse.ok) {
        router.push('/chat');
      } else {
        alert('Failed to start conversation. Please try again.');
      }
    } catch (error) {
      console.error('Error starting chat:', error);
      alert('Network error. Please try again.');
    } finally {
      setChatLoading(null);
    }
  };

  const checkKycAndNavigate = async (vehicleId: number) => {
    if (!isAuthenticated) {
      router.push("/signin");
      return;
    }

    const token = getAccessToken();
    if (!token) {
      router.push("/signin");
      return;
    }

    setKycLoading(vehicleId);

    try {
      const res = await fetch("http://localhost:8080/api/kyc/status", {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json"
        }
      });

      if (res.ok) {
        const data = await res.json();
        const renterStatus = data.renterKycStatus || "NOT_SUBMITTED";
        const isRenterVerified = renterStatus === "VERIFIED" || renterStatus === "APPROVED";

        if (isRenterVerified) {
          // KYC is verified, proceed to vehicle details
          router.push(`/vehicles/${vehicleId}`);
          return;
        } else {
          // KYC is not verified - show modal
          setSelectedVehicleForKyc(vehicleId);
          setShowKycModal(true);
          return;
        }
      } else {
        // API error - check local storage as fallback
        const user = getUserData();
        if (user) {
          const isRenterVerified = user.renterKycStatus === "VERIFIED" || user.renterKycStatus === "APPROVED";
          if (isRenterVerified) {
            router.push(`/vehicles/${vehicleId}`);
            return;
          }
        }
        // Not verified - show modal
        setSelectedVehicleForKyc(vehicleId);
        setShowKycModal(true);
      }
    } catch (error) {
      console.error("Error checking KYC:", error);
      // On network error, show modal
      setSelectedVehicleForKyc(vehicleId);
      setShowKycModal(true);
    } finally {
      setKycLoading(null);
    }
  };

  const handleVehicleClick = (vehicleId: number) => {
    if (!isAuthenticated) {
      router.push("/signin");
      return;
    }
    checkKycAndNavigate(vehicleId);
  };

  // Handle redirect to KYC page
  const handleRedirectToKyc = () => {
    setShowKycModal(false);
    const returnUrl = selectedVehicleForKyc ? `/vehicles/${selectedVehicleForKyc}` : '/vehicles';
    router.push(`/kyc/user?returnUrl=${encodeURIComponent(returnUrl)}`);
  };

  // Handle close modal (go back)
  const handleCloseKycModal = () => {
    setShowKycModal(false);
    setSelectedVehicleForKyc(null);
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
      case "Price: Low to High": result = [...result].sort((a, b) => a.pricePerDay - b.pricePerDay); break;
      case "Price: High to Low": result = [...result].sort((a, b) => b.pricePerDay - a.pricePerDay); break;
      case "Rating": result = [...result].sort((a, b) => b.rating - a.rating); break;
      default: result = [...result].sort((a, b) => b.id - a.id);
    }

    return result;
  }, [searchQuery, activeCategory, selectedLocation, sortBy, priceRange, vehicles]);

  if (loading) {
    return (
      <div className={`min-h-screen flex flex-col ${isDarkMode ? 'bg-gray-900' : 'bg-gradient-to-br from-gray-50 to-gray-100'}`}>
        {isAuthenticated ? <HomeHeader /> : <Header />}
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <motion.div animate={{ rotate: 360 }} transition={{ duration: 2, repeat: Infinity, ease: "linear" }}>
              <Loader2 className={`w-16 h-16 ${isDarkMode ? 'text-emerald-400' : 'text-emerald-600'} mx-auto mb-4`} />
            </motion.div>
            <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'} font-medium`}>
              Loading amazing vehicles...
            </p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className={`min-h-screen flex flex-col ${isDarkMode ? 'bg-gray-900' : 'bg-gradient-to-br from-gray-50 via-white to-gray-50'} font-['Inter',system-ui]`}>
      {isAuthenticated ? <HomeHeader /> : <Header />}

      {/* Hero */}
      <div className={`relative overflow-hidden ${isDarkMode
        ? 'bg-gradient-to-br from-gray-800 via-gray-900 to-gray-950'
        : 'bg-gradient-to-br from-emerald-900 via-emerald-800 to-teal-900'
        } text-white`}>
        <div className="absolute inset-0 opacity-20">
          <div className={`absolute top-0 left-0 w-96 h-96 ${isDarkMode ? 'bg-emerald-600' : 'bg-emerald-400'} rounded-full blur-3xl animate-pulse`} />
          <div className={`absolute bottom-0 right-0 w-96 h-96 ${isDarkMode ? 'bg-teal-600' : 'bg-teal-400'} rounded-full blur-3xl animate-pulse delay-1000`} />
        </div>

        <div className="max-w-7xl mx-auto px-6 py-16 md:py-20 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center max-w-3xl mx-auto"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring" }}
              className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md rounded-full px-4 py-2 mb-6"
            >
              <Sparkles className="w-4 h-4 text-emerald-400" />
              <span className="text-sm font-medium">Explore Our Fleet</span>
            </motion.div>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-4">
              Find Your Perfect{" "}
              <span className="bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">
                Electric Ride
              </span>
            </h1>
            <p className="text-white/70 text-lg max-w-2xl mx-auto">
              Browse our eco-friendly fleet of premium vehicles. Filter by type, price, and location to find your perfect match.
            </p>
          </motion.div>

          {/* Search */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mt-10 max-w-3xl mx-auto"
          >
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-2xl blur-lg opacity-0 group-hover:opacity-30 transition-opacity duration-300" />
              <div className="relative flex items-center gap-3 bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl px-6 py-4 shadow-xl">
                <Search className="w-6 h-6 text-white/60" />
                <input
                  type="text"
                  placeholder="Search by brand, model, or feature..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="flex-1 bg-transparent outline-none text-white placeholder-white/40 text-lg font-medium"
                />
                {searchQuery && (
                  <button onClick={() => setSearchQuery("")} className="p-1 hover:bg-white/10 rounded-lg transition">
                    <X className="w-5 h-5 text-white/60" />
                  </button>
                )}
              </div>
            </div>
          </motion.div>

          {/* Filters Row */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }} className="mt-10">
            <div className="flex flex-wrap justify-between items-center gap-4">
              <div className="flex flex-wrap gap-2">
                {categories.map(cat => {
                  const Icon = cat.icon;
                  return (
                    <button
                      key={cat.name}
                      onClick={() => setActiveCategory(cat.name)}
                      className={`px-5 py-2.5 rounded-full text-sm font-semibold transition-all duration-300 flex items-center gap-2 ${activeCategory === cat.name
                        ? "bg-emerald-500 text-white shadow-lg scale-105"
                        : "bg-white/10 text-white/80 hover:bg-white/20 hover:scale-105"
                        }`}
                    >
                      <Icon className="w-4 h-4" />
                      {cat.name}
                    </button>
                  );
                })}
              </div>

              <div className="flex flex-wrap gap-3">
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-300 ${showFilters ? "bg-emerald-500 text-white" : "bg-white/10 hover:bg-white/20"
                    }`}
                >
                  <Filter className="w-4 h-4" />
                  Filters
                </button>

                <div className="relative">
                  <button
                    onClick={() => setShowSort(!showSort)}
                    className="flex items-center gap-2 px-4 py-2.5 bg-white/10 backdrop-blur-sm rounded-xl text-sm font-medium hover:bg-white/20 transition-all duration-300"
                  >
                    <ArrowUpDown className="w-4 h-4" />
                    {sortBy}
                    <ChevronDown className="w-4 h-4" />
                  </button>
                  <AnimatePresence>
                    {showSort && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className={`absolute right-0 mt-2 w-56 ${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-2xl z-20 overflow-hidden border ${isDarkMode ? 'border-gray-700' : 'border-gray-100'}`}
                      >
                        {sortOptions.map(opt => {
                          const Icon = opt.icon;
                          return (
                            <button
                              key={opt.label}
                              onClick={() => { setSortBy(opt.label); setShowSort(false); }}
                              className={`w-full text-left px-4 py-3 text-sm ${isDarkMode ? 'text-gray-300 hover:bg-gray-700' : 'hover:bg-emerald-50'} transition flex items-center gap-3 group`}
                            >
                              <Icon className={`w-4 h-4 ${isDarkMode ? 'text-gray-500 group-hover:text-emerald-400' : 'text-gray-400 group-hover:text-emerald-600'}`} />
                              <span className={isDarkMode ? 'group-hover:text-emerald-400' : 'group-hover:text-emerald-600'}>{opt.label}</span>
                              {sortBy === opt.label && <div className="ml-auto w-1.5 h-1.5 bg-emerald-500 rounded-full" />}
                            </button>
                          );
                        })}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {isAuthenticated && (
                  <Link
                    href="/add-vehicle"
                    className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-xl text-sm font-semibold hover:shadow-lg hover:shadow-emerald-500/30 transition-all duration-300 hover:scale-105"
                  >
                    <Plus className="w-4 h-4" />
                    List Your Vehicle
                  </Link>
                )}
              </div>
            </div>

            {/* Advanced Filters Panel */}
            <AnimatePresence>
              {showFilters && (
                <motion.div
                  initial={{ opacity: 0, height: 0, marginTop: 0 }}
                  animate={{ opacity: 1, height: "auto", marginTop: "1rem" }}
                  exit={{ opacity: 0, height: 0, marginTop: 0 }}
                  className="overflow-hidden"
                >
                  <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="text-white/80 text-sm font-medium mb-3 flex items-center gap-2">
                          <Wallet className="w-4 h-4" />
                          Price Range: Rs.{priceRange[0].toLocaleString()} — Rs.{priceRange[1].toLocaleString()}
                        </label>
                        <div className="space-y-3">
                          <input
                            type="range" min={0} max={50000} step={500}
                            value={priceRange[0]}
                            onChange={e => setPriceRange([Math.min(+e.target.value, priceRange[1]), priceRange[1]])}
                            className="w-full h-2 bg-white/20 rounded-lg appearance-none cursor-pointer accent-emerald-400"
                          />
                          <input
                            type="range" min={0} max={50000} step={500}
                            value={priceRange[1]}
                            onChange={e => setPriceRange([priceRange[0], Math.max(+e.target.value, priceRange[0])])}
                            className="w-full h-2 bg-white/20 rounded-lg appearance-none cursor-pointer accent-emerald-400"
                          />
                          <div className="flex justify-between text-sm text-white/60">
                            <span>Rs.0</span><span>Rs.50,000+</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="space-y-2">
                          <div className="flex items-center gap-3 text-white/80 text-sm">
                            <span>🚗 {filtered.length} vehicles available</span>
                            <span>⭐ Avg: {(filtered.reduce((acc, v) => acc + v.rating, 0) / (filtered.length || 1)).toFixed(1)}</span>
                          </div>
                          <div className="flex gap-2">
                            <span className="px-2 py-1 bg-white/10 rounded-lg text-xs">
                              Electric: {filtered.filter(v => v.fuelType === "electric").length}
                            </span>
                            <span className="px-2 py-1 bg-white/10 rounded-lg text-xs">
                              Auto: {filtered.filter(v => v.transmission === "automatic").length}
                            </span>
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
                          className="px-5 py-2.5 rounded-xl text-red-300 border border-white/20 text-sm font-medium hover:bg-white/10 transition"
                        >
                          Reset All
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      </div>

      {/* Results */}
      <main className={`flex-1 max-w-7xl mx-auto px-6 py-12 w-full`}>
        <div className={`flex justify-between items-center mb-8 pb-2 border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
          <div>
            <h2 className={`text-2xl font-bold ${isDarkMode ? 'text-gray-100' : 'text-gray-800'}`}>
              Available Vehicles
            </h2>
            <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-500'} text-sm mt-1`}>
              Showing <strong className="text-emerald-600">{filtered.length}</strong> vehicle{filtered.length !== 1 ? "s" : ""} for you
            </p>
          </div>
          <div className={`flex items-center gap-2 text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
            <Clock className="w-4 h-4" />
            <span>Updated just now</span>
          </div>
        </div>

        {filtered.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className={`text-center py-20 ${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-2xl shadow-sm`}
          >
            <div className={`inline-flex p-4 ${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'} rounded-full mb-4`}>
              <Car className={`w-12 h-12 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`} />
            </div>
            <h3 className={`text-2xl font-semibold ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
              No vehicles found
            </h3>
            <p className={`${isDarkMode ? 'text-gray-500' : 'text-gray-400'} max-w-md mx-auto`}>
              We couldn't find any vehicles matching your criteria. Try adjusting your filters.
            </p>
            <button
              onClick={() => {
                setPriceRange([0, 50000]);
                setSelectedLocation("All Locations");
                setActiveCategory("All");
                setSortBy("Recommended");
                setSearchQuery("");
              }}
              className="mt-6 px-6 py-2.5 bg-emerald-600 text-white rounded-xl font-medium hover:bg-emerald-700 transition"
            >
              Clear All Filters
            </button>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
          >
            {filtered.map((v, index) => (
              <motion.div
                key={v.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                whileHover={{ y: -8 }}
                className={`group ${isDarkMode ? 'bg-gray-800 border-gray-700 hover:border-emerald-600' : 'bg-white border-gray-100 hover:border-emerald-200'} rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden border`}
              >
                {/* Image */}
                <div
                  className={`relative h-52 ${isDarkMode ? 'bg-gray-700' : 'bg-gradient-to-br from-gray-100 to-gray-200'} overflow-hidden cursor-pointer`}
                  onClick={() => handleVehicleClick(v.id)}
                >
                  <img
                    src={v.img}
                    alt={v.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    onError={e => { (e.target as HTMLImageElement).src = PLACEHOLDER_IMAGE; }}
                  />

                  <button
                    onClick={(e) => navigateToMapWithVehicle(v, e)}
                    className="absolute top-3 right-3 p-2 bg-white/90 backdrop-blur-sm rounded-full hover:bg-white transition shadow-md group/location"
                    title="View on Map"
                  >
                    <MapPin className="w-4 h-4 text-emerald-600 group-hover/location:text-emerald-700 transition-colors" />
                  </button>

                  <span className="absolute top-14 right-3 text-[10px] bg-black/70 text-white px-2 py-1 rounded-lg opacity-0 group-hover/location:opacity-100 transition-opacity duration-200 pointer-events-none">
                    View on Map
                  </span>

                  {v.fuelType === "electric" && (
                    <div className="absolute bottom-3 left-3 flex items-center gap-1.5 px-2 py-1 bg-emerald-600/90 backdrop-blur-sm rounded-lg text-white text-xs font-semibold">
                      <Leaf className="w-3 h-3" /> Eco-Friendly
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="p-5">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3
                        className={`font-bold ${isDarkMode ? 'text-gray-100 group-hover:text-emerald-400' : 'text-gray-800 group-hover:text-emerald-600'} text-lg transition-colors cursor-pointer`}
                        onClick={() => handleVehicleClick(v.id)}
                      >
                        {v.name}
                      </h3>
                      <div className="flex items-center gap-2 mt-1.5">
                        <div className="flex items-center gap-1">
                          <Star className="w-4 h-4 fill-yellow-500 text-yellow-500" />
                          <span className={`text-sm font-semibold ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                            {v.rating}
                          </span>
                        </div>
                        <span className={isDarkMode ? 'text-gray-600' : 'text-gray-300'}>•</span>
                        <div className={`flex items-center gap-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'} text-sm`}>
                          <MapPin className="w-3 h-3" />
                          <span>{v.location}</span>
                        </div>
                      </div>
                      {v.ownerName && (
                        <p className={`text-xs ${isDarkMode ? 'text-gray-500' : 'text-gray-400'} mt-1`}>
                          Owner: {v.ownerName}
                        </p>
                      )}
                    </div>
                    <div className="text-right">
                      <span className="text-2xl font-black text-emerald-600">Rs.{v.pricePerDay}</span>
                      <span className={`text-xs ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}> /day</span>
                    </div>
                  </div>

                  {/* Specs */}
                  <div className={`flex items-center justify-between mt-4 pt-3 border-t ${isDarkMode ? 'border-gray-700' : 'border-gray-100'}`}>
                    <div className={`flex items-center gap-1.5 text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      <Users className="w-3.5 h-3.5" />
                      <span>{v.seats} seats</span>
                    </div>
                    <div className={`flex items-center gap-1.5 text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      <Gauge className="w-3.5 h-3.5" />
                      <span>{v.range}</span>
                    </div>
                    <div className={`flex items-center gap-1.5 text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      <Fuel className="w-3.5 h-3.5" />
                      <span className="capitalize">{v.transmission}</span>
                    </div>
                  </div>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-1.5 mt-3">
                    {v.tags.map(tag => (
                      <span key={tag} className={`text-[10px] font-medium ${isDarkMode ? 'bg-emerald-900/50 text-emerald-300' : 'bg-emerald-50 text-emerald-700'} px-2 py-1 rounded-full`}>
                        {tag}
                      </span>
                    ))}
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2 mt-4">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handleVehicleClick(v.id)}
                      disabled={kycLoading === v.id}
                      className="flex-1 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-xl text-sm font-semibold hover:shadow-lg hover:shadow-emerald-500/30 transition-all duration-300 disabled:opacity-70 flex items-center justify-center gap-2"
                    >
                      {kycLoading === v.id
                        ? <><Loader2 className="w-4 h-4 animate-spin" /> Checking...</>
                        : isAuthenticated ? "View Details" : "Sign in to View"}
                    </motion.button>

                    {isAuthenticated && v.ownerId && v.ownerId !== getUserData()?.id && (
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={(e) => startChatWithOwner(v.id, v.ownerId!, v.ownerName!, e)}
                        disabled={chatLoading === v.id}
                        className="px-4 py-2.5 bg-blue-500 text-white rounded-xl text-sm font-semibold hover:shadow-lg hover:shadow-blue-500/30 transition-all duration-300 disabled:opacity-70 flex items-center justify-center gap-2"
                        title={`Chat with ${v.ownerName}`}
                      >
                        {chatLoading === v.id ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <MessageSquare className="w-4 h-4" />
                        )}
                        <span className="hidden sm:inline">Chat</span>
                      </motion.button>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </main>

      <Footer />

      {/* KYC Verification Modal - Green Theme */}
      <AnimatePresence>
        {showKycModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center px-4"
            style={{
              background: 'rgba(0,0,0,0.6)',
              backdropFilter: 'blur(8px)'
            }}
            onClick={handleCloseKycModal}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className={`relative max-w-md w-full ${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-2xl shadow-2xl overflow-hidden`}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header with icon - Green Theme */}
              <div className={`p-6 ${isDarkMode ? 'bg-gray-700/50' : 'bg-emerald-50'} border-b ${isDarkMode ? 'border-gray-700' : 'border-emerald-100'}`}>
                <div className="flex items-center gap-3">
                  <div className={`p-2.5 rounded-full ${isDarkMode ? 'bg-emerald-900/30' : 'bg-emerald-100'}`}>
                    <Shield className={`w-6 h-6 ${isDarkMode ? 'text-emerald-400' : 'text-emerald-600'}`} />
                  </div>
                  <div>
                    <h3 className={`text-lg font-bold ${isDarkMode ? 'text-gray-100' : 'text-gray-800'}`}>
                      KYC Verification Required
                    </h3>
                    <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                      To rent vehicles, you need to complete your KYC
                    </p>
                  </div>
                </div>
              </div>

              {/* Body - Green Theme */}
              <div className="p-6">
                <div className={`flex items-start gap-3 p-4 rounded-xl mb-4 ${isDarkMode ? 'bg-emerald-900/20 border border-emerald-800/30' : 'bg-emerald-50 border border-emerald-200'}`}>
                  <AlertCircle className={`w-5 h-5 flex-shrink-0 mt-0.5 ${isDarkMode ? 'text-emerald-400' : 'text-emerald-600'}`} />
                  <div>
                    <p className={`text-sm font-medium ${isDarkMode ? 'text-emerald-300' : 'text-emerald-800'}`}>
                      Complete your KYC to access vehicle details
                    </p>
                    <p className={`text-xs mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      KYC is required for all renters to ensure a safe and secure rental experience.
                    </p>
                  </div>
                </div>

                <div className={`space-y-2 text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                  <p>📋 Please complete your KYC to:</p>
                  <ul className="list-disc list-inside space-y-1 ml-2">
                    <li>View detailed vehicle information</li>
                    <li>Book vehicles for rent</li>
                    <li>Access full vehicle history</li>
                    <li>Contact vehicle owners</li>
                  </ul>
                </div>

                <div className={`mt-4 p-3 rounded-lg ${isDarkMode ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
                  <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    <span className="font-medium">⏱️ Quick process:</span> It only takes 2-3 minutes to complete your KYC verification.
                  </p>
                </div>
              </div>

              {/* Actions - Green Theme */}
              <div className={`p-6 pt-0 flex flex-col sm:flex-row gap-3 ${isDarkMode ? 'border-t border-gray-700' : ''}`}>
                <button
                  onClick={handleCloseKycModal}
                  className="flex-1 px-4 py-2.5 rounded-xl border text-sm font-medium transition-all duration-200 flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-[0.98]"
                  style={{
                    borderColor: isDarkMode ? '#374151' : '#e5e7eb',
                    color: isDarkMode ? '#9ca3af' : '#6b7280',
                    backgroundColor: isDarkMode ? 'transparent' : 'transparent'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = isDarkMode ? '#374151' : '#f3f4f6';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'transparent';
                  }}
                >
                  <X className="w-4 h-4" />
                  Go Back
                </button>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleRedirectToKyc}
                  className="flex-1 px-4 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-xl text-sm font-semibold hover:shadow-lg hover:shadow-emerald-500/30 transition-all duration-200 flex items-center justify-center gap-2"
                >
                  <Shield className="w-4 h-4" />
                  Complete KYC
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}