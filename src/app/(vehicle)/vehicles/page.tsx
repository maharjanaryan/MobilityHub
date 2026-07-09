// app/(vehicle)/vehicles/page.tsx
"use client";

import React, { useState, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search, SlidersHorizontal, Battery, Zap, MapPin,
  Star, X, ChevronDown, Plus, Loader2, Car, Heart,
  Fuel, Users, Gauge, Filter, ArrowUpDown, TrendingUp,
  Clock, Shield, Sparkles, Leaf, Wallet, Navigation,
  MessageSquare
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import HomeHeader from "@/app/home/HomeHeader";
import Footer from "@/app/component/Footer";
import KycModal from "@/app/component/KycModal";

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
}

const categories = [
  { name: "All", icon: Car, color: "emerald" },
  { name: "Cars", icon: Car, color: "blue" },
  { name: "Bikes", icon: Zap, color: "purple" },
  { name: "Scooters", icon: Battery, color: "orange" },
  { name: "Cycles", icon: Leaf, color: "green" }
];

const locations = ["All Locations", "Kathmandu", "Lalitpur", "Bhaktapur", "Pokhara"];
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
  const [favoriteIds, setFavoriteIds] = useState<number[]>([]);
  const [kycLoading, setKycLoading] = useState<number | null>(null);
  const [chatLoading, setChatLoading] = useState<number | null>(null);

  // KYC Modal state
  const [showKycModal, setShowKycModal] = useState(false);
  const [kycStatus, setKycStatus] = useState<"VERIFIED" | "APPROVED" | "PENDING" | "REJECTED" | "NOT_SUBMITTED" | null>(null);
  const [userName, setUserName] = useState("");
  const [selectedVehicleId, setSelectedVehicleId] = useState<number | null>(null);

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

  useEffect(() => {
    const token = getAccessToken();
    if (!token) {
      router.push("/signin");
      return;
    }

    // Get user data for modal
    const user = getUserData();
    if (user) {
      setUserName(user.fullName || user.username || "User");
    }

    // Check KYC status on load and update user data
    const checkInitialKyc = async () => {
      try {
        const res = await fetch("http://localhost:8080/api/kyc/status", {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json"
          }
        });
        if (res.ok) {
          const data = await res.json();
          console.log("📋 Initial KYC Check:", data);

          const user = getUserData();
          if (user) {
            // Get both owner and renter status
            const ownerStatus = data.ownerKycStatus || "NOT_SUBMITTED";
            const renterStatus = data.renterKycStatus || "NOT_SUBMITTED";

            // Check if renter is VERIFIED or APPROVED (needed for viewing vehicles)
            const isRenterVerified = renterStatus === "VERIFIED" || renterStatus === "APPROVED";
            const isOwnerVerified = ownerStatus === "VERIFIED" || ownerStatus === "APPROVED";

            console.log("📊 KYC Status Check:");
            console.log("  - Owner Status:", ownerStatus, "→ Verified:", isOwnerVerified);
            console.log("  - Renter Status:", renterStatus, "→ Verified:", isRenterVerified);
            console.log("  - Renter Verified (needed for viewing):", isRenterVerified);

            const updatedUser = {
              ...user,
              ownerKycStatus: ownerStatus,
              renterKycStatus: renterStatus,
              kycStatus: isRenterVerified ? "VERIFIED" : "NOT_SUBMITTED",
              canList: isOwnerVerified,
              canBook: isRenterVerified,
              hasOwnerPrivileges: isOwnerVerified,
              isKycVerified: isRenterVerified // This is specifically for renter KYC
            };
            localStorage.setItem("user", JSON.stringify(updatedUser));
          }
        }
      } catch (error) {
        console.error("Error checking initial KYC:", error);
      }
    };

    checkInitialKyc();
    fetchVehicles();
  }, []);

  const fetchVehicles = async () => {
    setLoading(true);
    try {
      const token = getAccessToken();
      if (!token) { router.push("/signin"); return; }

      const response = await fetch("http://localhost:8080/api/vehicles/recent?page=0&size=100", {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json"
        }
      });

      if (response.status === 401) {
        localStorage.removeItem("accessToken");
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        router.push("/signin");
        return;
      }

      if (response.ok) {
        const data = await response.json();
        const vehicleList = data.content || [];
        setVehicles(vehicleList.map((v: any) => ({
          id: v.id,
          brand: v.brand,
          model: v.model,
          name: `${v.brand} ${v.model}`,
          category: mapCategory(v.seats),
          img: v.photos?.[0] || PLACEHOLDER_IMAGE,
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
          photos: v.photos || [],
          ownerId: v.ownerId || v.owner?.id,
          ownerName: v.owner?.username || v.owner?.fullName || "Vehicle Owner"
        })));
      }
    } catch (error) {
      console.error("Error fetching vehicles:", error);
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
    if (vehicle.transmission === "automatic") tags.push("Automatic");
    if (vehicle.seats >= 5) tags.push("Family Friendly");
    if (vehicle.fuelType === "electric") tags.push("Eco-Friendly");
    if (vehicle.pricePerDay < 1000) tags.push("Budget");
    if (vehicle.pricePerDay > 5000) tags.push("Premium");
    return tags.slice(0, 3);
  };

  const toggleFavorite = (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    setFavoriteIds(prev =>
      prev.includes(id) ? prev.filter(fid => fid !== id) : [...prev, id]
    );
  };

  // Start chat with vehicle owner
  const startChatWithOwner = async (vehicleId: number, ownerId: number, ownerName: string, e: React.MouseEvent) => {
    e.stopPropagation();

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

  // Check if user has RENTER KYC verified (needed for viewing vehicles)
  const hasRenterKyc = (): boolean => {
    const user = getUserData();
    if (!user) return false;

    const renterStatus = user.renterKycStatus || user.kycStatus || "NOT_SUBMITTED";
    return renterStatus === "VERIFIED" || renterStatus === "APPROVED";
  };

  // Fixed KYC check and navigation - Users need RENTER KYC to view vehicles
  const checkKycAndNavigate = async (vehicleId: number) => {
    // Don't proceed if modal is already open
    if (showKycModal) {
      return;
    }

    const token = getAccessToken();
    if (!token) {
      router.push("/signin");
      return;
    }

    setKycLoading(vehicleId);
    setSelectedVehicleId(vehicleId);

    try {
      // Always check with the API first for the most up-to-date status
      const res = await fetch("http://localhost:8080/api/kyc/status", {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json"
        }
      });

      if (res.ok) {
        const data = await res.json();
        console.log("🔍 Full KYC API Response:", data);

        // Get both owner and renter status
        const ownerStatus = data.ownerKycStatus || "NOT_SUBMITTED";
        const renterStatus = data.renterKycStatus || "NOT_SUBMITTED";

        console.log("📊 KYC Status from API:");
        console.log("  - Owner Status:", ownerStatus);
        console.log("  - Renter Status:", renterStatus);

        // CRITICAL: To VIEW vehicles, user needs RENTER KYC (for booking/viewing)
        // Owner KYC is for LISTING vehicles, not for viewing/booking
        const isRenterVerified = renterStatus === "VERIFIED" || renterStatus === "APPROVED";
        const isOwnerVerified = ownerStatus === "VERIFIED" || ownerStatus === "APPROVED";

        console.log("✅ Verification Result:");
        console.log("  - Renter Verified (needed for viewing):", isRenterVerified);
        console.log("  - Owner Verified (for listing only):", isOwnerVerified);

        if (isRenterVerified) {
          // User has renter KYC - can view vehicles
          console.log("✅ Renter KYC verified - allowing access");

          // Update localStorage with latest KYC status
          const user = getUserData();
          if (user) {
            const updatedUser = {
              ...user,
              ownerKycStatus: ownerStatus,
              renterKycStatus: renterStatus,
              kycStatus: renterStatus,
              canList: isOwnerVerified,
              canBook: isRenterVerified,
              hasOwnerPrivileges: isOwnerVerified,
              isKycVerified: true
            };
            localStorage.setItem("user", JSON.stringify(updatedUser));
          }

          // Navigate to vehicle details
          router.push(`/vehicles/${vehicleId}`);
          return;
        } else {
          // User does NOT have renter KYC
          // Show appropriate message based on their status
          let statusToShow = "NOT_SUBMITTED";

          if (renterStatus === "PENDING") {
            statusToShow = "PENDING";
          } else if (renterStatus === "REJECTED") {
            statusToShow = "REJECTED";
          } else {
            statusToShow = "NOT_SUBMITTED";
          }

          console.log("❌ Renter KYC not verified:", statusToShow);

          // Store the status to show in modal
          setKycStatus(statusToShow as any);
          setShowKycModal(true);
          return;
        }
      } else {
        // API call failed - fallback to localStorage check
        console.warn("⚠️ API call failed, checking localStorage");
        const user = getUserData();
        if (user) {
          const isRenterVerified = user.renterKycStatus === "VERIFIED" || user.renterKycStatus === "APPROVED";
          if (isRenterVerified) {
            console.log("✅ Renter KYC verified via localStorage");
            router.push(`/vehicles/${vehicleId}`);
            return;
          }
        }

        // Not verified or no data - show KYC modal
        console.log("❌ Renter KYC not verified, showing KYC modal");
        setKycStatus("NOT_SUBMITTED");
        setShowKycModal(true);
      }
    } catch (error) {
      console.error("❌ Error checking KYC:", error);
      // On error, show KYC modal to be safe
      setKycStatus("NOT_SUBMITTED");
      setShowKycModal(true);
    } finally {
      setKycLoading(null);
    }
  };

  // Handle KYC modal close
  const handleKycModalClose = () => {
    setShowKycModal(false);
    setSelectedVehicleId(null);
  };

  // Handle vehicle click - prevents navigation if modal is open
  const handleVehicleClick = (vehicleId: number) => {
    if (showKycModal) {
      return; // Don't navigate if KYC modal is open
    }
    checkKycAndNavigate(vehicleId);
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
      <div className="min-h-screen flex flex-col bg-gradient-to-br from-gray-50 to-gray-100">
        <HomeHeader />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <motion.div animate={{ rotate: 360 }} transition={{ duration: 2, repeat: Infinity, ease: "linear" }}>
              <Loader2 className="w-16 h-16 text-emerald-600 mx-auto mb-4" />
            </motion.div>
            <p className="text-gray-600 font-medium">Loading amazing vehicles...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-gray-50 via-white to-gray-50 font-['Inter',system-ui]">
      <HomeHeader />

      {/* Hero */}
      <div className="relative overflow-hidden bg-gradient-to-br from-emerald-900 via-emerald-800 to-teal-900 text-white">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-0 left-0 w-96 h-96 bg-emerald-400 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-teal-400 rounded-full blur-3xl animate-pulse delay-1000" />
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
              {/* Categories */}
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

              {/* Controls */}
              <div className="flex flex-wrap gap-3">
                <button
                  onClick={() => setSelectedLocation(prev =>
                    prev === "All Locations" ? "Kathmandu" : "All Locations"
                  )}
                  className="flex items-center gap-2 px-4 py-2.5 bg-white/10 backdrop-blur-sm rounded-xl text-sm font-medium hover:bg-white/20 transition-all duration-300"
                >
                  <MapPin className="w-4 h-4" />
                  {selectedLocation}
                  <ChevronDown className="w-4 h-4" />
                </button>

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
                        className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-2xl z-20 overflow-hidden border border-gray-100"
                      >
                        {sortOptions.map(opt => {
                          const Icon = opt.icon;
                          return (
                            <button
                              key={opt.label}
                              onClick={() => { setSortBy(opt.label); setShowSort(false); }}
                              className="w-full text-left px-4 py-3 text-sm hover:bg-emerald-50 transition flex items-center gap-3 group"
                            >
                              <Icon className="w-4 h-4 text-gray-400 group-hover:text-emerald-600" />
                              <span className="group-hover:text-emerald-600">{opt.label}</span>
                              {sortBy === opt.label && <div className="ml-auto w-1.5 h-1.5 bg-emerald-500 rounded-full" />}
                            </button>
                          );
                        })}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                <Link
                  href="/add-vehicle"
                  className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-xl text-sm font-semibold hover:shadow-lg hover:shadow-emerald-500/30 transition-all duration-300 hover:scale-105"
                >
                  <Plus className="w-4 h-4" />
                  List Your Vehicle
                </Link>
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
      <main className="flex-1 max-w-7xl mx-auto px-6 py-12 w-full">
        <div className="flex justify-between items-center mb-8 pb-2 border-b border-gray-200">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">Available Vehicles</h2>
            <p className="text-gray-500 text-sm mt-1">
              Showing <strong className="text-emerald-600">{filtered.length}</strong> vehicle{filtered.length !== 1 ? "s" : ""} for you
            </p>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <Clock className="w-4 h-4" />
            <span>Updated just now</span>
          </div>
        </div>

        {filtered.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-20 bg-white rounded-2xl shadow-sm"
          >
            <div className="inline-flex p-4 bg-gray-100 rounded-full mb-4">
              <Car className="w-12 h-12 text-gray-400" />
            </div>
            <h3 className="text-2xl font-semibold text-gray-700 mb-2">No vehicles found</h3>
            <p className="text-gray-400 max-w-md mx-auto">
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
                className="group bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden border border-gray-100 hover:border-emerald-200"
              >
                {/* Image */}
                <div
                  className="relative h-52 bg-gradient-to-br from-gray-100 to-gray-200 overflow-hidden cursor-pointer"
                  onClick={() => handleVehicleClick(v.id)}
                >
                  <img
                    src={v.img}
                    alt={v.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    onError={e => { (e.target as HTMLImageElement).src = PLACEHOLDER_IMAGE; }}
                  />
                  <button
                    onClick={e => toggleFavorite(v.id, e)}
                    className="absolute top-3 right-3 p-2 bg-white/90 backdrop-blur-sm rounded-full hover:bg-white transition shadow-md"
                  >
                    <Heart className={`w-4 h-4 transition-colors ${favoriteIds.includes(v.id) ? "fill-red-500 text-red-500" : "text-gray-600 group-hover:text-red-500"}`} />
                  </button>
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
                        className="font-bold text-gray-800 text-lg group-hover:text-emerald-600 transition-colors cursor-pointer"
                        onClick={() => handleVehicleClick(v.id)}
                      >
                        {v.name}
                      </h3>
                      <div className="flex items-center gap-2 mt-1.5">
                        <div className="flex items-center gap-1">
                          <Star className="w-4 h-4 fill-yellow-500 text-yellow-500" />
                          <span className="text-sm font-semibold text-gray-700">{v.rating}</span>
                        </div>
                        <span className="text-gray-300">•</span>
                        <div className="flex items-center gap-1 text-gray-500 text-sm">
                          <MapPin className="w-3 h-3" />
                          <span>{v.location}</span>
                        </div>
                      </div>
                      {v.ownerName && (
                        <p className="text-xs text-gray-400 mt-1">
                          Owner: {v.ownerName}
                        </p>
                      )}
                    </div>
                    <div className="text-right">
                      <span className="text-2xl font-black text-emerald-600">Rs.{v.pricePerDay}</span>
                      <span className="text-xs text-gray-400"> /day</span>
                    </div>
                  </div>

                  {/* Specs */}
                  <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-100">
                    <div className="flex items-center gap-1.5 text-xs text-gray-600">
                      <Users className="w-3.5 h-3.5" />
                      <span>{v.seats} seats</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-gray-600">
                      <Gauge className="w-3.5 h-3.5" />
                      <span>{v.range}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-gray-600">
                      <Fuel className="w-3.5 h-3.5" />
                      <span className="capitalize">{v.transmission}</span>
                    </div>
                  </div>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-1.5 mt-3">
                    {v.tags.map(tag => (
                      <span key={tag} className="text-[10px] font-medium bg-emerald-50 text-emerald-700 px-2 py-1 rounded-full">
                        {tag}
                      </span>
                    ))}
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2 mt-4">
                    {/* View Details Button */}
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handleVehicleClick(v.id)}
                      disabled={kycLoading === v.id || showKycModal}
                      className="flex-1 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-xl text-sm font-semibold hover:shadow-lg hover:shadow-emerald-500/30 transition-all duration-300 disabled:opacity-70 flex items-center justify-center gap-2"
                    >
                      {kycLoading === v.id
                        ? <><Loader2 className="w-4 h-4 animate-spin" /> Checking...</>
                        : "View Details"}
                    </motion.button>

                    {/* Chat with Owner Button */}
                    {v.ownerId && v.ownerId !== getUserData()?.id && (
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

      {/* KYC Modal */}
      <KycModal
        isOpen={showKycModal}
        onClose={handleKycModalClose}
        kycStatus={kycStatus}
        userName={userName}
      />
    </div>
  );
}